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
public class AppointmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AppointmentsController(AppDbContext db) => _db = db;

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        IQueryable<Appointment> query = _db.Appointments.Include(a => a.Customer).ThenInclude(c => c.User);

        if (role == "Customer")
        {
            var userId = GetUserId();
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer != null) query = query.Where(a => a.CustomerId == customer.Id);
        }

        var appointments = await query
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentDto(
                a.Id, a.CustomerId, a.Customer.User.FullName,
                a.VehicleId, a.AppointmentDate,
                a.ServiceType, a.Description, a.Status, a.CreatedAt))
            .ToListAsync();
        return Ok(appointments);
    }

    /// <summary>Customer: Book a service appointment (Feature 13)</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateAppointmentRequest req)
    {
        var userId = GetUserId();
        var role = User.FindFirstValue(ClaimTypes.Role);

        Customer? customer;
        if (role == "Customer")
            customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        else
            return Forbid();

        if (customer == null) return NotFound(new { message = "Customer profile not found." });

        var appointment = new Appointment
        {
            CustomerId = customer.Id,
            VehicleId = req.VehicleId,
            AppointmentDate = req.AppointmentDate,
            ServiceType = req.ServiceType,
            Description = req.Description,
            Status = "Pending"
        };
        _db.Appointments.Add(appointment);
        await _db.SaveChangesAsync();
        return Ok(appointment);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var appt = await _db.Appointments.FindAsync(id);
        if (appt == null) return NotFound();
        appt.Status = status;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
