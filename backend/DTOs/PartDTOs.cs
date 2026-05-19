namespace VehiclePartsAPI.DTOs;

public record PartDto(
    int Id, string Name, string SKU, string Category,
    string Description, decimal PurchasePrice, decimal SellingPrice,
    int StockQuantity, bool IsActive);

public record CreatePartRequest(
    string Name, string SKU, string Category,
    string Description, decimal PurchasePrice,
    decimal SellingPrice, int StockQuantity,
    int ReorderLevel = 10);

public record UpdatePartRequest(
    string? Name, string? Category, string? Description,
    decimal? PurchasePrice, decimal? SellingPrice,
    int? StockQuantity, int? ReorderLevel);
