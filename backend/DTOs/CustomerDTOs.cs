namespace VehiclePartsAPI.DTOs;

public record CustomerDto(
    int Id, int UserId, string FullName, string Email,
    string Phone, string Address, decimal TotalSpent,
    decimal PendingCredit, DateTime CreatedAt);

public record VehicleDto(
    int Id, int CustomerId, string VehicleNumber, string Make,
    string Model, int Year, string FuelType, int Mileage, string Condition);

public record AddVehicleRequest(
    string VehicleNumber, string Make, string Model,
    int Year, string FuelType, int Mileage, string Condition);

public record UpdateMyProfileRequest(
    string FullName,
    string Phone,
    string? Address,
    string? CurrentPassword,
    string? NewPassword);

public record UpdateVehicleRequest(
    int Mileage,
    string Condition);
