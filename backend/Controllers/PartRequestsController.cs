using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Models;
using System.Security.Claims;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PartRequestsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PartRequestsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        IQueryable<PartRequest> query = _db.PartRequests
            .Include(r => r.Customer).ThenInclude(c => c.User);

        if (role == "Customer")
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
            if (customer == null) return Ok(Array.Empty<PartRequest>());
            query = query.Where(r => r.CustomerId == customer.Id);
        }

        var requests = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return Ok(requests);
    }

    /// <summary>Customer: Request an unavailable part (Feature 13)</summary>
    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] PartRequestInput req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        var partReq = new PartRequest
        {
            CustomerId = customer.Id,
            PartName = req.PartName,
            Description = req.Description,
            Status = "Pending"
        };
        _db.PartRequests.Add(partReq);
        await _db.SaveChangesAsync();
        return Ok(partReq);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var req = await _db.PartRequests.FindAsync(id);
        if (req == null) return NotFound();
        req.Status = status;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public record PartRequestInput(string PartName, string Description);
