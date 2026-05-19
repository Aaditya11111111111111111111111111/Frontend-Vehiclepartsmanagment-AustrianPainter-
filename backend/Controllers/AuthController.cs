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
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtHelper _jwt;

    public AuthController(AppDbContext db, JwtHelper jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    /// <summary>Customer self-registration</summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest req)
    {
        if (await _db.Users.AnyAsync(u => u.Email == req.Email))
            return Conflict(new { message = "Email already registered." });

        var user = new User
        {
            FullName = req.FullName,
            Email = req.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
            Phone = req.Phone,
            Role = "Customer"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var customer = new Customer
        {
            UserId = user.Id,
            Address = req.Address ?? string.Empty
        };
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role, token));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials." });

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role, token));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult> GetMe()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();
        return Ok(new { user.Id, user.FullName, user.Email, user.Role, user.Phone });
    }
}
