namespace VehiclePartsAPI.Models;

public class Staff
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Position { get; set; } = string.Empty;
    public DateTime HireDate { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    public User User { get; set; } = null!;
    public ICollection<SaleInvoice> SaleInvoices { get; set; } = new List<SaleInvoice>();
}
