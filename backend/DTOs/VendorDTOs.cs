namespace VehiclePartsAPI.DTOs;

public record VendorDto(
    int Id, string Name, string ContactPerson,
    string Email, string Phone, string Address, bool IsActive);

public record CreateVendorRequest(
    string Name, string ContactPerson,
    string Email, string Phone, string Address);
