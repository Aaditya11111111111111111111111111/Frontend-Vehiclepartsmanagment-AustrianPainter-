namespace VehiclePartsAPI.Models;

public class Vehicle
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string VehicleNumber { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; }
    public string FuelType { get; set; } = string.Empty;
    public int Mileage { get; set; }
    public string Condition { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Customer Customer { get; set; } = null!;
}
