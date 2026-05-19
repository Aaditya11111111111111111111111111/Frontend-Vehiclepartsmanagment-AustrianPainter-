using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotificationsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult> GetAll()
    {
        var notifs = await _db.Notifications
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
        return Ok(notifs);
    }

    [HttpPut("{id}/read")]
    public async Task<ActionResult> MarkRead(int id)
    {
        var n = await _db.Notifications.FindAsync(id);
        if (n == null) return NotFound();
        n.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
