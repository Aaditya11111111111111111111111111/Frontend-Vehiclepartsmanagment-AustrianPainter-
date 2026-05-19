using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.DTOs;
using VehiclePartsAPI.Helpers;
using VehiclePartsAPI.Models;
using System.Security.Claims;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class SaleInvoicesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EmailHelper _email;

    public SaleInvoicesController(AppDbContext db, EmailHelper email)
    {
        _db = db;
        _email = email;
    }

    [HttpGet]
    public async Task<ActionResult> GetAll([FromQuery] int? customerId)
    {
        var query = _db.SaleInvoices
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .AsQueryable();
        if (customerId.HasValue)
            query = query.Where(s => s.CustomerId == customerId.Value);

        var invoices = await query
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new SaleInvoiceSummaryDto(
                s.Id, s.InvoiceNumber, s.Customer != null ? s.Customer.User.FullName : "Deleted Customer",
                s.TotalAmount, s.PaymentType, s.IsPaid, s.CreatedAt))
            .ToListAsync();
        return Ok(invoices);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetById(int id)
    {
        var invoice = await _db.SaleInvoices
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Staff).ThenInclude(st => st.User)
            .Include(s => s.Items).ThenInclude(i => i.Part)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (invoice == null) return NotFound();
        return Ok(invoice);
    }

    /// <summary>Staff: Create sales invoice. Applies 10% discount if subtotal > 5000 (Feature 16)</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateSaleInvoiceRequest req)
    {
        var staffUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var staff = await _db.Staff.FirstOrDefaultAsync(s => s.UserId == staffUserId)
            ?? await _db.Staff.FirstOrDefaultAsync(s => s.IsActive); // fallback for admin

        var customer = await _db.Customers.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == req.CustomerId);
        if (customer == null) return NotFound(new { message = "Customer not found." });

        decimal subTotal = 0;
        var invoiceItems = new List<SaleInvoiceItem>();

        foreach (var item in req.Items)
        {
            var part = await _db.Parts.FindAsync(item.PartId);
            if (part == null) return BadRequest(new { message = $"Part {item.PartId} not found." });
            if (part.StockQuantity < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {part.Name}." });

            var lineTotal = part.SellingPrice * item.Quantity;
            subTotal += lineTotal;

            invoiceItems.Add(new SaleInvoiceItem
            {
                PartId = item.PartId,
                Quantity = item.Quantity,
                UnitPrice = part.SellingPrice,
                TotalPrice = lineTotal
            });

            // Deduct stock
            part.StockQuantity -= item.Quantity;
            part.UpdatedAt = DateTime.UtcNow;

            // Check low stock — create notification if below reorder level
            if (part.StockQuantity < part.ReorderLevel)
            {
                _db.Notifications.Add(new Notification
                {
                    Type = "LowStock",
                    Message = $"Low stock alert: {part.Name} (SKU: {part.SKU}) has only {part.StockQuantity} units remaining.",
                    IsRead = false
                });
            }
        }

        // Feature 16: Loyalty discount - 10% if single purchase > 5000
        decimal discountPercent = subTotal > 5000 ? 10 : 0;
        decimal discountAmount = subTotal * (discountPercent / 100);
        decimal total = subTotal - discountAmount;

        var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var invoice = new SaleInvoice
        {
            InvoiceNumber = invoiceNumber,
            CustomerId = req.CustomerId,
            StaffId = staff?.Id ?? 1,
            SubTotal = subTotal,
            DiscountPercent = discountPercent,
            DiscountAmount = discountAmount,
            TotalAmount = total,
            PaymentType = req.PaymentType,
            IsPaid = req.PaymentType != "Credit",
            Notes = req.Notes,
            Items = invoiceItems
        };

        if (req.PaymentType == "Credit")
        {
            invoice.DueDate = DateTime.UtcNow.AddDays(30);
            customer.PendingCredit += total;
            customer.LastCreditDate = DateTime.UtcNow;
        }

        customer.TotalSpent += total;

        _db.SaleInvoices.Add(invoice);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, new
        {
            invoice.Id,
            invoice.InvoiceNumber,
            invoice.TotalAmount,
            invoice.DiscountPercent,
            invoice.DiscountAmount,
            invoice.PaymentType
        });
    }

    /// <summary>Staff/Admin: Mark a credit invoice as paid and clear customer pending credit</summary>
    [HttpPut("{id}/mark-paid")]
    public async Task<ActionResult> MarkPaid(int id)
    {
        var invoice = await _db.SaleInvoices
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (invoice == null) return NotFound();
        if (invoice.IsPaid) return BadRequest(new { message = "Invoice is already paid." });

        invoice.IsPaid = true;
        invoice.DueDate = null;

        // Reduce customer's pending credit by this invoice amount
        if (invoice.PaymentType == "Credit" && invoice.Customer != null)
        {
            invoice.Customer.PendingCredit = Math.Max(0, invoice.Customer.PendingCredit - invoice.TotalAmount);
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Invoice marked as paid." });
    }

    /// <summary>Staff: Email invoice to customer (Feature 11)</summary>
    [HttpPost("{id}/send-email")]
    public async Task<ActionResult> SendEmail(int id)
    {
        var invoice = await _db.SaleInvoices
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (invoice == null) return NotFound();
        if (invoice.Customer == null)
            return BadRequest(new { message = "Cannot send email: customer account has been deleted." });

        var html = _email.BuildInvoiceEmailHtml(
            invoice.Customer.User.FullName,
            invoice.InvoiceNumber,
            invoice.TotalAmount);

        await _email.SendEmailAsync(
            invoice.Customer.User.Email,
            invoice.Customer.User.FullName,
            $"Invoice #{invoice.InvoiceNumber} - Vehicle Parts Center",
            html);

        return Ok(new { message = "Invoice emailed successfully." });
    }
}
