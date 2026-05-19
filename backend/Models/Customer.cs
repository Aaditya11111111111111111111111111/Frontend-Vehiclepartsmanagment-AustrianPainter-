namespace VehiclePartsAPI.Models;

public class Customer
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Address { get; set; } = string.Empty;
    public decimal TotalSpent { get; set; } = 0;
    public decimal PendingCredit { get; set; } = 0;
    public DateTime? LastCreditDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<SaleInvoice> SaleInvoices { get; set; } = new List<SaleInvoice>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
}
