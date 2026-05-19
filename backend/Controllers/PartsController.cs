using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.DTOs;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PartsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PartsController(AppDbContext db) => _db = db;

    /// <summary>Get all parts - accessible by all authenticated users</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartDto>>> GetAll([FromQuery] string? search, [FromQuery] string? category)
    {
        var query = _db.Parts.AsQueryable();
        if (!string.IsNullOrEmpty(search))
            query = query.Where(p => p.Name.Contains(search) || p.SKU.Contains(search));
        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category == category);

        var parts = await query
            .Select(p => new PartDto(p.Id, p.Name, p.SKU, p.Category, p.Description,
                p.PurchasePrice, p.SellingPrice, p.StockQuantity, p.IsActive))
            .ToListAsync();
        return Ok(parts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PartDto>> GetById(int id)
    {
        var p = await _db.Parts.FindAsync(id);
        if (p == null) return NotFound();
        return Ok(new PartDto(p.Id, p.Name, p.SKU, p.Category, p.Description,
            p.PurchasePrice, p.SellingPrice, p.StockQuantity, p.IsActive));
    }

    /// <summary>Admin: Create new part</summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreatePartRequest req)
    {
        if (await _db.Parts.AnyAsync(p => p.SKU == req.SKU))
            return Conflict(new { message = "SKU already exists." });

        var part = new Part
        {
            Name = req.Name, SKU = req.SKU, Category = req.Category,
            Description = req.Description, PurchasePrice = req.PurchasePrice,
            SellingPrice = req.SellingPrice, StockQuantity = req.StockQuantity,
            ReorderLevel = req.ReorderLevel
        };
        _db.Parts.Add(part);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = part.Id }, part);
    }

    /// <summary>Admin/Staff: Update part details</summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdatePartRequest req)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return NotFound();

        if (req.Name != null) part.Name = req.Name;
        if (req.Category != null) part.Category = req.Category;
        if (req.Description != null) part.Description = req.Description;
        if (req.PurchasePrice.HasValue) part.PurchasePrice = req.PurchasePrice.Value;
        if (req.SellingPrice.HasValue) part.SellingPrice = req.SellingPrice.Value;
        if (req.StockQuantity.HasValue) part.StockQuantity = req.StockQuantity.Value;
        if (req.ReorderLevel.HasValue) part.ReorderLevel = req.ReorderLevel.Value;
        part.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Admin: Soft-delete part</summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var part = await _db.Parts.FindAsync(id);
        if (part == null) return NotFound();
        part.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Get parts with low stock (below reorder level)</summary>
    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<LowStockPartDto>>> LowStock()
    {
        var parts = await _db.Parts
            .Where(p => p.IsActive && p.StockQuantity < p.ReorderLevel)
            .Select(p => new LowStockPartDto(p.Id, p.Name, p.SKU, p.StockQuantity, p.ReorderLevel))
            .ToListAsync();
        return Ok(parts);
    }
}
