namespace VehiclePartsAPI.Models;

public class Part
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PurchasePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int StockQuantity { get; set; }
    public int ReorderLevel { get; set; } = 10;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<SaleInvoiceItem> SaleInvoiceItems { get; set; } = new List<SaleInvoiceItem>();
    public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();
}
