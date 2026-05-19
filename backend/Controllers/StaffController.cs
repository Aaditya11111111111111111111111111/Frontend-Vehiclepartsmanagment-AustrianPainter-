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
public class StaffController : ControllerBase
{
    private readonly AppDbContext _db;

    public StaffController(AppDbContext db) => _db = db;

    /// <summary>Admin: Get all staff members</summary>
    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var staff = await _db.Staff
            .Include(s => s.User)
            .Where(s => s.IsActive)
            .Select(s => new
            {
                s.Id, s.UserId, s.Position, s.HireDate, s.IsActive,
                FullName = s.User.FullName,
                Email = s.User.Email,
                Phone = s.User.Phone
            })
            .ToListAsync();
        return Ok(staff);
    }

    /// <summary>Admin: Register a new staff member</summary>
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] CreateStaffRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already exists." });

        var user = new User
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone = req.Phone,
            Role = "Staff"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var staff = new Staff { UserId = user.Id, Position = req.Position };
        _db.Staff.Add(staff);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = staff.Id }, staff);
    }

    /// <summary>Admin: Deactivate staff member</summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> Deactivate(int id)
    {
        var staff = await _db.Staff.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id);
        if (staff == null) return NotFound();
        staff.IsActive = false;
        staff.User.IsActive = false;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
