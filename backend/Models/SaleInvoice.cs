namespace VehiclePartsAPI.Models;

public class SaleInvoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int? CustomerId { get; set; }
    public int StaffId { get; set; }
    public decimal SubTotal { get; set; }
    public decimal DiscountPercent { get; set; } = 0;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public string PaymentType { get; set; } = "Cash"; // Cash, Credit, Card
    public bool IsPaid { get; set; } = true;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;

    public Customer? Customer { get; set; }
    public Staff Staff { get; set; } = null!;
    public ICollection<SaleInvoiceItem> Items { get; set; } = new List<SaleInvoiceItem>();
}
