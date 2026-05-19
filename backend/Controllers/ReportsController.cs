using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Data;
using VehiclePartsAPI.DTOs;

namespace VehiclePartsAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Staff")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db) => _db = db;

    /// <summary>Admin: Financial report — daily (today UTC), monthly (rolling last 30 days UTC), yearly, or calendarMonth (1st–today UTC).</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("financial")]
    public async Task<ActionResult<FinancialReportDto>> GetFinancial(
        [FromQuery] string period = "monthly",
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        try
        {
            // Test database connection first
            Console.WriteLine("Testing database connection...");
            var canConnect = await _db.Database.CanConnectAsync();
            Console.WriteLine($"Database can connect: {canConnect}");
            
            if (!canConnect)
            {
                return StatusCode(500, "Cannot connect to database");
            }

            var now = DateTime.UtcNow;
            // "monthly" = rolling last 30 days (inclusive of activity users still see in lists),
            // not calendar month only — calendar-only made May dashboards show NPR 0 when all sales were in April.
            DateTime start = period switch
            {
                "daily" => DateTime.SpecifyKind(now.Date, DateTimeKind.Utc),
                "yearly" => DateTime.SpecifyKind(new DateTime(now.Year, 1, 1), DateTimeKind.Utc),
                "calendarMonth" => DateTime.SpecifyKind(new DateTime(now.Year, now.Month, 1), DateTimeKind.Utc),
                _ => DateTime.SpecifyKind(now.Date.AddDays(-30), DateTimeKind.Utc) // monthly: rolling 30 days (UTC)
            };
            DateTime end = from.HasValue && to.HasValue ? DateTime.SpecifyKind(to.Value, DateTimeKind.Utc) : now;
            if (from.HasValue) start = DateTime.SpecifyKind(from.Value, DateTimeKind.Utc);

            Console.WriteLine($"Financial Report: Period={period}, Start={start}, End={end}");

            // Try a simpler query first
            Console.WriteLine("Testing simple query...");
            var allSalesCount = await _db.SaleInvoices.CountAsync();
            Console.WriteLine($"Total sales in database: {allSalesCount}");

            var sales = await _db.SaleInvoices
                .Where(s => s.CreatedAt >= start && s.CreatedAt <= end)
                .ToListAsync();

            var purchases = await _db.PurchaseInvoices
                .Where(p => p.CreatedAt >= start && p.CreatedAt <= end)
                .ToListAsync();

            Console.WriteLine($"Found {sales.Count} sales and {purchases.Count} purchases");

            decimal totalRevenue = sales.Sum(s => s.TotalAmount);
            decimal totalPurchases = purchases.Sum(p => p.TotalAmount);

            Console.WriteLine($"Total Revenue: {totalRevenue}, Total Purchases: {totalPurchases}");

            var result = new FinancialReportDto(
                totalRevenue, totalPurchases,
                totalRevenue - totalPurchases,
                sales.Count, purchases.Count,
                start, end);

            Console.WriteLine($"Returning financial report: Revenue={result.TotalRevenue}, Purchases={result.TotalPurchases}");

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in financial report: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>Staff: Top spenders report (Feature 9)</summary>
    [HttpGet("top-customers")]
    public async Task<ActionResult<IEnumerable<TopCustomerDto>>> TopCustomers([FromQuery] int top = 10)
    {
        var customers = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.SaleInvoices)
            .OrderByDescending(c => c.TotalSpent)
            .Take(top)
            .Select(c => new TopCustomerDto(
                c.Id, c.User.FullName, c.User.Email,
                c.TotalSpent, c.SaleInvoices.Count))
            .ToListAsync();
        return Ok(customers);
    }

    /// <summary>Staff: Customer purchase breakdown — each customer with their invoices and products</summary>
    [HttpGet("customer-purchases")]
    public async Task<ActionResult> CustomerPurchases()
    {
        var customers = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.SaleInvoices)
                .ThenInclude(s => s.Items)
                    .ThenInclude(i => i.Part)
            .Where(c => c.SaleInvoices.Any())
            .OrderByDescending(c => c.TotalSpent)
            .Select(c => new
            {
                c.Id,
                Name = c.User.FullName,
                Email = c.User.Email,
                Phone = c.User.Phone,
                c.TotalSpent,
                InvoiceCount = c.SaleInvoices.Count,
                Invoices = c.SaleInvoices
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new
                    {
                        s.Id,
                        s.InvoiceNumber,
                        s.TotalAmount,
                        s.PaymentType,
                        s.IsPaid,
                        s.CreatedAt,
                        Items = s.Items.Select(i => new
                        {
                            i.Part.Name,
                            i.Part.SKU,
                            i.Part.Category,
                            i.Quantity,
                            i.UnitPrice,
                            i.TotalPrice
                        })
                    })
            })
            .ToListAsync();

        return Ok(customers);
    }
    /// <summary>Staff: Regular customers (3+ purchases)</summary>
    [HttpGet("regular-customers")]
    public async Task<ActionResult> RegularCustomers()
    {
        var customers = await _db.Customers
            .Include(c => c.User)
            .Include(c => c.SaleInvoices)
            .Where(c => c.SaleInvoices.Count >= 3)
            .Select(c => new
            {
                c.Id, Name = c.User.FullName, Email = c.User.Email,
                PurchaseCount = c.SaleInvoices.Count, c.TotalSpent
            })
            .ToListAsync();
        return Ok(customers);
    }

    /// <summary>Staff: Customers with overdue credit (>1 month unpaid)</summary>
    [HttpGet("overdue-credits")]
    public async Task<ActionResult> OverdueCredits()
    {
        var cutoff = DateTime.UtcNow.AddMonths(-1);
        var customers = await _db.Customers
            .Include(c => c.User)
            .Where(c => c.PendingCredit > 0 && c.LastCreditDate < cutoff)
            .Select(c => new
            {
                c.Id, Name = c.User.FullName, Email = c.User.Email,
                Phone = c.User.Phone, c.PendingCredit, c.LastCreditDate
            })
            .ToListAsync();
        return Ok(customers);
    }

    /// <summary>Admin: Inventory report with stock status</summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("inventory")]
    public async Task<ActionResult> InventoryReport()
    {
        var parts = await _db.Parts
            .Where(p => p.IsActive)
            .Select(p => new
            {
                p.Id, p.Name, p.SKU, p.Category,
                p.StockQuantity, p.ReorderLevel,
                p.SellingPrice, p.PurchasePrice,
                StockValue = p.StockQuantity * p.PurchasePrice,
                IsLowStock = p.StockQuantity < p.ReorderLevel
            })
            .ToListAsync();

        return Ok(new
        {
            Parts = parts,
            TotalStockValue = parts.Sum(p => p.StockValue),
            LowStockCount = parts.Count(p => p.IsLowStock),
            TotalParts = parts.Count
        });
    }
}
