namespace VehiclePartsAPI.Models;

public class PurchaseInvoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int VendorId { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Notes { get; set; } = string.Empty;

    public Vendor Vendor { get; set; } = null!;
    public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
}
