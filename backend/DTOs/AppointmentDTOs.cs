namespace VehiclePartsAPI.DTOs;

public record CreateAppointmentRequest(
    int? VehicleId,
    DateTime AppointmentDate,
    string ServiceType,
    string Description);

public record AppointmentDto(
    int Id, int CustomerId, string CustomerName,
    int? VehicleId, DateTime AppointmentDate,
    string ServiceType, string Description, string Status, DateTime CreatedAt);
