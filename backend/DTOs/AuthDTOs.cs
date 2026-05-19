namespace VehiclePartsAPI.DTOs;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string Phone,
    string? Address);

public record AuthResponse(
    int Id,
    string FullName,
    string Email,
    string Role,
    string Token);

public record CreateStaffRequest(
    string FullName,
    string Email,
    string Password,
    string Phone,
    string Position);

public record UpdateUserRequest(
    string FullName,
    string Phone,
    string? Address);
