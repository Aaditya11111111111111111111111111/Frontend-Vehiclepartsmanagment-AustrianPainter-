using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.DTOs;
using VehiclePartsAPI.Models;
using System.Security.Claims;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomersController(AppDbContext db) => _db = db;

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    /// <summary>Staff/Admin: Search customers by name, phone, ID, or vehicle number</summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] string? search)
    {
        var query = _db.Customers.Include(c => c.User).Include(c => c.Vehicles).AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c =>
                c.User.FullName.Contains(search) ||
                c.User.Phone.Contains(search) ||
                c.Id.ToString() == search ||
                c.Vehicles.Any(v => v.VehicleNumber.Contains(search)));
        }

        var customers = await query
            .Select(c => new CustomerDto(
                c.Id, c.UserId, c.User.FullName, c.User.Email,
                c.User.Phone, c.Address, c.TotalSpent, c.PendingCredit, c.CreatedAt))
            .ToListAsync();
        return Ok(customers);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var c = await _db.Customers
            .Include(x => x.User)
            .Include(x => x.Vehicles)
            .Include(x => x.SaleInvoices).ThenInclude(s => s.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (c == null) return NotFound();

        return Ok(new
        {
            Customer = new CustomerDto(c.Id, c.UserId, c.User.FullName, c.User.Email,
                c.User.Phone, c.Address, c.TotalSpent, c.PendingCredit, c.CreatedAt),
            Vehicles = c.Vehicles.Select(v => new VehicleDto(
                v.Id, v.CustomerId, v.VehicleNumber, v.Make,
                v.Model, v.Year, v.FuelType, v.Mileage, v.Condition)),
            PurchaseHistory = c.SaleInvoices.OrderByDescending(s => s.CreatedAt)
        });
    }

    /// <summary>Customer: Get own profile</summary>
    [HttpGet("me")]
    public async Task<ActionResult> GetMyProfile()
    {
        var userId = GetUserId();
        var customer = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        return Ok(new CustomerDto(
            customer.Id, customer.UserId, customer.User.FullName, customer.User.Email,
            customer.User.Phone, customer.Address, customer.TotalSpent,
            customer.PendingCredit, customer.CreatedAt));
    }

    /// <summary>Staff: Register customer with vehicle details</summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpPost]
    public async Task<ActionResult> RegisterCustomer([FromBody] RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already exists." });

        var user = new User
        {
            FullName = req.FullName, Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone = req.Phone, Role = "Customer"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var customer = new Customer { UserId = user.Id, Address = req.Address ?? string.Empty };
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer);
    }

    /// <summary>Add vehicle to customer</summary>
    [HttpPost("{customerId}/vehicles")]
    public async Task<ActionResult> AddVehicle(int customerId, [FromBody] AddVehicleRequest req)
    {
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer == null) return NotFound();

        if (await _db.Vehicles.AnyAsync(v => v.VehicleNumber == req.VehicleNumber))
            return Conflict(new { message = "Vehicle number already registered." });

        var vehicle = new Vehicle
        {
            CustomerId = customerId, VehicleNumber = req.VehicleNumber,
            Make = req.Make, Model = req.Model, Year = req.Year,
            FuelType = req.FuelType, Mileage = req.Mileage, Condition = req.Condition
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();
        return Ok(vehicle);
    }

    /// <summary>Customer: Update own profile (name, phone, address) and optionally password</summary>
    [HttpPut("me")]
    public async Task<ActionResult> UpdateMyProfile([FromBody] UpdateMyProfileRequest req)
    {
        var userId = GetUserId();
        var customer = await _db.Customers
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        customer.User.FullName = req.FullName;
        customer.User.Phone = req.Phone;
        customer.Address = req.Address ?? string.Empty;
        customer.User.UpdatedAt = DateTime.UtcNow;

        // Change password only if provided
        if (!string.IsNullOrWhiteSpace(req.NewPassword))
        {
            if (string.IsNullOrWhiteSpace(req.CurrentPassword) ||
                !BCrypt.Net.BCrypt.Verify(req.CurrentPassword, customer.User.PasswordHash))
                return BadRequest(new { message = "Current password is incorrect." });

            customer.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        }

        await _db.SaveChangesAsync();
        return Ok(new CustomerDto(
            customer.Id, customer.UserId, customer.User.FullName, customer.User.Email,
            customer.User.Phone, customer.Address, customer.TotalSpent,
            customer.PendingCredit, customer.CreatedAt));
    }

    /// <summary>Customer: Update own vehicle mileage and condition</summary>
    [HttpPut("me/vehicles/{vehicleId}")]
    public async Task<ActionResult> UpdateMyVehicle(int vehicleId, [FromBody] UpdateVehicleRequest req)
    {
        var userId = GetUserId();
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customer.Id);
        if (vehicle == null) return NotFound(new { message = "Vehicle not found." });

        vehicle.Mileage = req.Mileage;
        vehicle.Condition = req.Condition;
        await _db.SaveChangesAsync();
        return Ok(new VehicleDto(
            vehicle.Id, vehicle.CustomerId, vehicle.VehicleNumber, vehicle.Make,
            vehicle.Model, vehicle.Year, vehicle.FuelType, vehicle.Mileage, vehicle.Condition));
    }

    /// <summary>Customer: Get own vehicles</summary>
    [HttpGet("me/vehicles")]
    public async Task<ActionResult> GetMyVehicles()
    {
        var userId = GetUserId();
        var customer = await _db.Customers
            .Include(c => c.Vehicles)
            .FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        var vehicles = customer.Vehicles.Select(v => new VehicleDto(
            v.Id, v.CustomerId, v.VehicleNumber, v.Make,
            v.Model, v.Year, v.FuelType, v.Mileage, v.Condition));
        return Ok(vehicles);
    }

    /// <summary>Admin: Permanently delete a customer. Their invoices are preserved with CustomerId set to null.</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCustomer(int id)
    {
        var customer = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.Vehicles)
            .Include(c => c.Appointments)
            .Include(c => c.Reviews)
            .Include(c => c.PartRequests)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null) return NotFound(new { message = "Customer not found." });

        // Nullify CustomerId on all their invoices so financial records are preserved
        await _db.SaleInvoices
            .Where(s => s.CustomerId == id)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.CustomerId, (int?)null));

        // Remove related records that belong solely to this customer
        _db.Vehicles.RemoveRange(customer.Vehicles);
        _db.Appointments.RemoveRange(customer.Appointments);
        _db.Reviews.RemoveRange(customer.Reviews);
        _db.PartRequests.RemoveRange(customer.PartRequests);

        // Remove any notifications tied to this customer's credit (optional cleanup)
        var userId = customer.UserId;

        // Remove customer and their user account
        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();

        // Now remove the user account
        var user = await _db.Users.FindAsync(userId);
        if (user != null) _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Customer removed successfully. Their invoice records have been preserved." });
    }

    /// <summary>Customer: View own purchase/service history</summary>
    [HttpGet("me/history")]
    public async Task<ActionResult> GetMyHistory()
    {
        var userId = GetUserId();
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        var invoices = await _db.SaleInvoices
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .Where(s => s.CustomerId == customer.Id)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new {
                s.Id, s.InvoiceNumber, s.SubTotal, s.DiscountPercent,
                s.DiscountAmount, s.TotalAmount, s.PaymentType,
                s.IsPaid, s.Notes, s.CreatedAt,
                Items = s.Items.Select(i => new {
                    i.Part.Name,
                    i.Part.SKU,
                    i.Part.Category,
                    i.Quantity,
                    i.UnitPrice,
                    i.TotalPrice
                })
            })
            .ToListAsync();

        var appointments = await _db.Appointments
            .Where(a => a.CustomerId == customer.Id)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new {
                a.Id, a.CustomerId, a.VehicleId,
                a.AppointmentDate, a.ServiceType,
                a.Description, a.Status, a.CreatedAt
            })
            .ToListAsync();

        return Ok(new { Invoices = invoices, Appointments = appointments });
    }
}
