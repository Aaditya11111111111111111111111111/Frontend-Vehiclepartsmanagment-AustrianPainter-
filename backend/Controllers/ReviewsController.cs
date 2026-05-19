using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Models;
using System.Security.Claims;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ReviewsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var reviews = await _db.Reviews
            .Include(r => r.Customer).ThenInclude(c => c.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id, r.Rating, r.Comment, r.CreatedAt,
                CustomerName = r.Customer.User.FullName
            })
            .ToListAsync();
        return Ok(reviews);
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<ActionResult> Submit([FromBody] ReviewRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        var review = new Review
        {
            CustomerId = customer.Id,
            Rating = Math.Clamp(req.Rating, 1, 5),
            Comment = req.Comment
        };
        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();
        return Ok(review);
    }
}

public record ReviewRequest(int Rating, string Comment);
