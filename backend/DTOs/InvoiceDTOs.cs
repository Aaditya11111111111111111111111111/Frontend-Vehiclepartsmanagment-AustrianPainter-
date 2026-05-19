namespace VehiclePartsAPI.DTOs;

public record SaleInvoiceItemRequest(int PartId, int Quantity);

public record CreateSaleInvoiceRequest(
    int CustomerId,
    List<SaleInvoiceItemRequest> Items,
    string PaymentType = "Cash",
    string Notes = "");

public record CreatePurchaseInvoiceRequest(
    int VendorId,
    List<PurchaseInvoiceItemRequest> Items,
    bool IsPaid = false,
    string Notes = "");

public record PurchaseInvoiceItemRequest(int PartId, int Quantity, decimal UnitCost);

public record SaleInvoiceSummaryDto(
    int Id, string InvoiceNumber, string CustomerName,
    decimal TotalAmount, string PaymentType, bool IsPaid, DateTime CreatedAt);
