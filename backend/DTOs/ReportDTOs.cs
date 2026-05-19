namespace VehiclePartsAPI.DTOs;

public record FinancialReportDto(
    decimal TotalRevenue, decimal TotalPurchases, decimal GrossProfit,
    int TotalSales, int TotalPurchaseOrders, DateTime From, DateTime To);

public record TopCustomerDto(int CustomerId, string Name, string Email, decimal TotalSpent, int PurchaseCount);

public record LowStockPartDto(int PartId, string Name, string SKU, int StockQuantity, int ReorderLevel);
