using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.DTOs;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class PurchaseInvoicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public PurchaseInvoicesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var invoices = await _db.PurchaseInvoices
            .Include(p => p.Vendor)
            .Include(p => p.Items).ThenInclude(i => i.Part)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(invoices);
    }

    /// <summary>Admin: Create purchase invoice and update stock</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreatePurchaseInvoiceRequest req)
    {
        var vendor = await _db.Vendors.FindAsync(req.VendorId);
        if (vendor == null) return NotFound(new { message = "Vendor not found." });

        decimal total = 0;
        var items = new List<PurchaseInvoiceItem>();

        foreach (var item in req.Items)
        {
            var part = await _db.Parts.FindAsync(item.PartId);
            if (part == null) return BadRequest(new { message = $"Part {item.PartId} not found." });

            var lineTotal = item.UnitCost * item.Quantity;
            total += lineTotal;

            items.Add(new PurchaseInvoiceItem
            {
                PartId = item.PartId,
                Quantity = item.Quantity,
                UnitCost = item.UnitCost,
                TotalCost = lineTotal
            });

            // Update stock
            part.StockQuantity += item.Quantity;
            part.PurchasePrice = item.UnitCost;
            part.UpdatedAt = DateTime.UtcNow;
        }

        var invNo = $"PO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
        var invoice = new PurchaseInvoice
        {
            InvoiceNumber = invNo,
            VendorId = req.VendorId,
            TotalAmount = total,
            IsPaid = req.IsPaid,
            Notes = req.Notes,
            Items = items
        };

        _db.PurchaseInvoices.Add(invoice);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = invoice.Id }, invoice);
    }
}
