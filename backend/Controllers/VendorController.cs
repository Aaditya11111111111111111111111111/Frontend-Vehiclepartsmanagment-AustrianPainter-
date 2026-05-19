using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.DTOs;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/vendors")]
[Authorize(Roles = "Admin")]
public class VendorController : ControllerBase
{
    private readonly AppDbContext _db;

    public VendorController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VendorDto>>> GetAll()
    {
        var vendors = await _db.Vendors
            .Select(v => new VendorDto(v.Id, v.Name, v.ContactPerson, v.Email, v.Phone, v.Address, v.IsActive))
            .ToListAsync();
        return Ok(vendors);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VendorDto>> GetById(int id)
    {
        var v = await _db.Vendors.FindAsync(id);
        if (v == null) return NotFound();
        return Ok(new VendorDto(v.Id, v.Name, v.ContactPerson, v.Email, v.Phone, v.Address, v.IsActive));
    }

    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateVendorRequest req)
    {
        var vendor = new Vendor
        {
            Name = req.Name, ContactPerson = req.ContactPerson,
            Email = req.Email, Phone = req.Phone, Address = req.Address
        };
        _db.Vendors.Add(vendor);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = vendor.Id }, vendor);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] CreateVendorRequest req)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();
        vendor.Name = req.Name;
        vendor.ContactPerson = req.ContactPerson;
        vendor.Email = req.Email;
        vendor.Phone = req.Phone;
        vendor.Address = req.Address;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var vendor = await _db.Vendors.FindAsync(id);
        if (vendor == null) return NotFound();
        vendor.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
