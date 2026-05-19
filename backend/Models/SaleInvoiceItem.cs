namespace VehiclePartsAPI.Models;

public class SaleInvoiceItem
{
    public int Id { get; set; }
    public int SaleInvoiceId { get; set; }
    public int PartId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    public SaleInvoice SaleInvoice { get; set; } = null!;
    public Part Part { get; set; } = null!;
}
