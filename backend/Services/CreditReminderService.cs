using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.Helpers;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Services;

/// <summary>
/// Background service that:
/// 1. Sends email reminders to customers with overdue credit (>1 month) - Feature 15
/// 2. Creates low-stock notifications for Admin - Feature 15
/// Runs daily at midnight.
/// </summary>
public class CreditReminderService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly ILogger<CreditReminderService> _logger;

    public CreditReminderService(IServiceProvider services, ILogger<CreditReminderService> logger)
    {
        _services = services;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Wait until next midnight
            var now = DateTime.UtcNow;
            var nextRun = now.Date.AddDays(1);
            var delay = nextRun - now;
            await Task.Delay(delay, stoppingToken);

            await RunDailyTasks();
        }
    }

    private async Task RunDailyTasks()
    {
        using var scope = _services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var emailHelper = scope.ServiceProvider.GetRequiredService<EmailHelper>();

        await SendCreditReminders(db, emailHelper);
        await CheckLowStock(db);
    }

    private async Task SendCreditReminders(AppDbContext db, EmailHelper emailHelper)
    {
        var cutoff = DateTime.UtcNow.AddMonths(-1);
        var overdueCustomers = await db.Customers
            .Include(c => c.User)
            .Where(c => c.PendingCredit > 0 && c.LastCreditDate < cutoff)
            .ToListAsync();

        foreach (var customer in overdueCustomers)
        {
            var html = $"""
                <html><body style="font-family:Arial;padding:20px;">
                <h2 style="color:#e53e3e;">Payment Reminder</h2>
                <p>Dear {customer.User.FullName},</p>
                <p>You have an outstanding credit balance of <strong>NPR {customer.PendingCredit:N2}</strong>
                   that has been overdue for more than one month.</p>
                <p>Please visit our center or contact us to settle your balance.</p>
                <p>Thank you for your continued support.</p>
                <br/><p>Vehicle Parts & Service Center</p>
                </body></html>
                """;

            await emailHelper.SendEmailAsync(
                customer.User.Email,
                customer.User.FullName,
                "Overdue Credit Balance Reminder - Vehicle Parts Center",
                html);

            _logger.LogInformation("Credit reminder sent to {Email}", customer.User.Email);
        }
    }

    private async Task CheckLowStock(AppDbContext db)
    {
        var lowStockParts = await db.Parts
            .Where(p => p.IsActive && p.StockQuantity < p.ReorderLevel)
            .ToListAsync();

        foreach (var part in lowStockParts)
        {
            var exists = await db.Notifications.AnyAsync(n =>
                n.Type == "LowStock" &&
                n.Message.Contains(part.SKU) &&
                n.CreatedAt >= DateTime.UtcNow.AddDays(-1) &&
                !n.IsRead);

            if (!exists)
            {
                db.Notifications.Add(new Notification
                {
                    Type = "LowStock",
                    Message = $"Low stock: {part.Name} (SKU: {part.SKU}) — {part.StockQuantity} units remaining (threshold: {part.ReorderLevel}).",
                    IsRead = false
                });
            }
        }

        await db.SaveChangesAsync();
    }
}
