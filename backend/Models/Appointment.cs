namespace VehiclePartsAPI.Models;

public class Appointment
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public int? VehicleId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Customer Customer { get; set; } = null!;
}
