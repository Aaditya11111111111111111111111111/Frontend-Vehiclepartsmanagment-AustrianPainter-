namespace VehiclePartsAPI.Models;

public class PartRequest
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string PartName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Fulfilled, Rejected
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Customer Customer { get; set; } = null!;
}
