namespace VehiclePartsAPI.Models;

public class Notification
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // LowStock, CreditReminder
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public int? UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
