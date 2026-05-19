using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using System.Security.Claims;

namespace VehiclePartsAPI.Controllers;

/// <summary>AI-powered vehicle part failure prediction (Feature 14 - AI integration)</summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Customer")]
public class AiController : ControllerBase
{
    private readonly AppDbContext _db;

    public AiController(AppDbContext db) => _db = db;

    /// <summary>Analyze vehicle condition and predict potential part failures</summary>
    [HttpGet("predict/{vehicleId}")]
    public async Task<ActionResult> PredictFailures(int vehicleId)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customer = await _db.Customers.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null) return NotFound();

        var vehicle = await _db.Vehicles
            .FirstOrDefaultAsync(v => v.Id == vehicleId && v.CustomerId == customer.Id);
        if (vehicle == null) return NotFound(new { message = "Vehicle not found." });

        // AI prediction logic based on mileage, year, and condition
        var predictions = GeneratePredictions(vehicle.Mileage, vehicle.Year, vehicle.Condition, vehicle.FuelType);

        return Ok(new
        {
            VehicleNumber = vehicle.VehicleNumber,
            Make = vehicle.Make,
            Model = vehicle.Model,
            Mileage = vehicle.Mileage,
            Predictions = predictions
        });
    }

    private static List<object> GeneratePredictions(int mileage, int year, string condition, string fuelType)
    {
        var predictions = new List<object>();
        var age = DateTime.UtcNow.Year - year;

        // Rule-based AI predictions based on industry knowledge
        if (mileage > 50000)
            predictions.Add(new { Part = "Brake Pads", Risk = "High", Reason = $"Mileage of {mileage:N0} km indicates brake pad wear.", Urgency = "Inspect within 1 month" });

        if (mileage > 40000 || age > 3)
            predictions.Add(new { Part = "Air Filter", Risk = "Medium", Reason = "Recommended replacement every 40,000 km or 3 years.", Urgency = "Replace at next service" });

        if (mileage > 60000)
            predictions.Add(new { Part = "Spark Plugs", Risk = "Medium", Reason = "High mileage vehicles need spark plug inspection.", Urgency = "Service recommended" });

        if (age > 5 || mileage > 80000)
            predictions.Add(new { Part = "Timing Belt", Risk = "High", Reason = "Critical component that should be replaced every 5 years or 80,000 km.", Urgency = "Immediate inspection advised" });

        if (condition == "Poor" || condition == "Fair")
            predictions.Add(new { Part = "Suspension", Risk = "High", Reason = $"Vehicle reported in {condition} condition — suspension wear likely.", Urgency = "Professional inspection recommended" });

        if (fuelType == "Diesel" && mileage > 30000)
            predictions.Add(new { Part = "Fuel Filter", Risk = "Medium", Reason = "Diesel engines require fuel filter replacement every 30,000 km.", Urgency = "Replace soon" });

        if (!predictions.Any())
            predictions.Add(new { Part = "General", Risk = "Low", Reason = "Vehicle appears to be in good health based on mileage and age.", Urgency = "Continue regular servicing" });

        return predictions;
    }
}
