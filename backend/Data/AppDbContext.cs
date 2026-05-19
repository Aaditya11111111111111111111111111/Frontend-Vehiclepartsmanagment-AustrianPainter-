using Microsoft.EntityFrameworkCore;
using VehiclePartsAPI.Models;

namespace VehiclePartsAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Staff> Staff => Set<Staff>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Part> Parts => Set<Part>();
    public DbSet<SaleInvoice> SaleInvoices => Set<SaleInvoice>();
    public DbSet<SaleInvoiceItem> SaleInvoiceItems => Set<SaleInvoiceItem>();
    public DbSet<PurchaseInvoice> PurchaseInvoices => Set<PurchaseInvoice>();
    public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems => Set<PurchaseInvoiceItem>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<PartRequest> PartRequests => Set<PartRequest>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Unique constraints
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Part>().HasIndex(p => p.SKU).IsUnique();
        modelBuilder.Entity<Vehicle>().HasIndex(v => v.VehicleNumber).IsUnique();

        // Decimal precision
        modelBuilder.Entity<Part>().Property(p => p.PurchasePrice).HasPrecision(18, 2);
        modelBuilder.Entity<Part>().Property(p => p.SellingPrice).HasPrecision(18, 2);
        modelBuilder.Entity<SaleInvoice>().Property(s => s.SubTotal).HasPrecision(18, 2);
        modelBuilder.Entity<SaleInvoice>().Property(s => s.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SaleInvoice>().Property(s => s.DiscountAmount).HasPrecision(18, 2);
        modelBuilder.Entity<SaleInvoiceItem>().Property(s => s.UnitPrice).HasPrecision(18, 2);
        modelBuilder.Entity<SaleInvoiceItem>().Property(s => s.TotalPrice).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseInvoice>().Property(p => p.TotalAmount).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseInvoiceItem>().Property(p => p.UnitCost).HasPrecision(18, 2);
        modelBuilder.Entity<PurchaseInvoiceItem>().Property(p => p.TotalCost).HasPrecision(18, 2);
        modelBuilder.Entity<Customer>().Property(c => c.TotalSpent).HasPrecision(18, 2);
        modelBuilder.Entity<Customer>().Property(c => c.PendingCredit).HasPrecision(18, 2);

        // Relationships
        modelBuilder.Entity<SaleInvoice>()
            .HasOne(s => s.Customer)
            .WithMany(c => c.SaleInvoices)
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Staff>()
            .HasOne(s => s.User)
            .WithOne(u => u.Staff)
            .HasForeignKey<Staff>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .HasOne(c => c.User)
            .WithOne(u => u.Customer)
            .HasForeignKey<Customer>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed admin user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            FullName = "Aaditya Nepal",
            Email = "aaditya@gmail.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("aaditya nepal"),
            Phone = "9800000000",
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        // Seed parts
        var parts = new[]
        {
            // Normal stock items (10+ units)
            new Part { Id = 1, Name = "Engine Oil Filter", SKU = "EOF-001", StockQuantity = 25, ReorderLevel = 10, PurchasePrice = 350.00m, SellingPrice = 450.00m, Category = "Filters", Description = "High quality engine oil filter for all vehicles", CreatedAt = DateTime.UtcNow },
            new Part { Id = 2, Name = "Brake Pads (Front)", SKU = "BPF-002", StockQuantity = 30, ReorderLevel = 10, PurchasePrice = 1200.00m, SellingPrice = 1500.00m, Category = "Brakes", Description = "Front brake pads for sedan and hatchback", CreatedAt = DateTime.UtcNow },
            new Part { Id = 3, Name = "Spark Plug (Set of 4)", SKU = "SPK-003", StockQuantity = 15, ReorderLevel = 10, PurchasePrice = 800.00m, SellingPrice = 1000.00m, Category = "Ignition", Description = "NGK spark plugs set of 4", CreatedAt = DateTime.UtcNow },
            new Part { Id = 4, Name = "Air Filter", SKU = "AF-004", StockQuantity = 20, ReorderLevel = 10, PurchasePrice = 250.00m, SellingPrice = 350.00m, Category = "Filters", Description = "Engine air filter for better performance", CreatedAt = DateTime.UtcNow },
            new Part { Id = 5, Name = "Clutch Plate", SKU = "CLP-005", StockQuantity = 12, ReorderLevel = 10, PurchasePrice = 2500.00m, SellingPrice = 3000.00m, Category = "Clutch", Description = "Heavy duty clutch plate", CreatedAt = DateTime.UtcNow },
            new Part { Id = 6, Name = "Headlight Bulb (H4)", SKU = "HLB-006", StockQuantity = 35, ReorderLevel = 10, PurchasePrice = 150.00m, SellingPrice = 200.00m, Category = "Lighting", Description = "H4 halogen headlight bulb", CreatedAt = DateTime.UtcNow },
            new Part { Id = 7, Name = "Radiator Coolant", SKU = "RDC-007", StockQuantity = 18, ReorderLevel = 10, PurchasePrice = 450.00m, SellingPrice = 550.00m, Category = "Cooling", Description = "Engine coolant 1L bottle", CreatedAt = DateTime.UtcNow },
            new Part { Id = 8, Name = "Wheel Bearing", SKU = "WHB-008", StockQuantity = 22, ReorderLevel = 10, PurchasePrice = 800.00m, SellingPrice = 1000.00m, Category = "Wheel", Description = "Front wheel bearing", CreatedAt = DateTime.UtcNow },
            new Part { Id = 9, Name = "Fuel Filter", SKU = "FF-009", StockQuantity = 16, ReorderLevel = 10, PurchasePrice = 300.00m, SellingPrice = 400.00m, Category = "Filters", Description = "Fuel filter for diesel and petrol engines", CreatedAt = DateTime.UtcNow },
            new Part { Id = 10, Name = "Shock Absorber (Front)", SKU = "SHA-010", StockQuantity = 14, ReorderLevel = 10, PurchasePrice = 1800.00m, SellingPrice = 2200.00m, Category = "Suspension", Description = "Front shock absorber", CreatedAt = DateTime.UtcNow },
            
            // Low stock items (below 10 units - will trigger low stock warning)
            new Part { Id = 11, Name = "Alternator", SKU = "ALT-011", StockQuantity = 3, ReorderLevel = 10, PurchasePrice = 4500.00m, SellingPrice = 5500.00m, Category = "Electrical", Description = "12V alternator for most cars", CreatedAt = DateTime.UtcNow },
            new Part { Id = 12, Name = "Starter Motor", SKU = "STM-012", StockQuantity = 2, ReorderLevel = 10, PurchasePrice = 3500.00m, SellingPrice = 4200.00m, Category = "Electrical", Description = "12V starter motor", CreatedAt = DateTime.UtcNow },
            new Part { Id = 13, Name = "Timing Belt", SKU = "TMB-013", StockQuantity = 5, ReorderLevel = 10, PurchasePrice = 1200.00m, SellingPrice = 1500.00m, Category = "Engine", Description = "Timing belt for 4 cylinder engines", CreatedAt = DateTime.UtcNow },
            new Part { Id = 14, Name = "Brake Disc (Front)", SKU = "BRD-014", StockQuantity = 4, ReorderLevel = 10, PurchasePrice = 2200.00m, SellingPrice = 2800.00m, Category = "Brakes", Description = "Front brake disc rotor", CreatedAt = DateTime.UtcNow },
            new Part { Id = 15, Name = "Water Pump", SKU = "WTP-015", StockQuantity = 6, ReorderLevel = 10, PurchasePrice = 1800.00m, SellingPrice = 2300.00m, Category = "Cooling", Description = "Engine water pump", CreatedAt = DateTime.UtcNow }
        };

        modelBuilder.Entity<Part>().HasData(parts);

        // Seed staff user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 10,
            FullName = "John Staff",
            Email = "staff@vehicleparts.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
            Phone = "9800000001",
            Role = "Staff",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        modelBuilder.Entity<Staff>().HasData(new Staff
        {
            Id = 10,
            UserId = 10,
            Position = "Sales Executive",
            HireDate = DateTime.UtcNow.AddMonths(-6),
            IsActive = true
        });

        // Seed customer user
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 11,
            FullName = "Ramesh Customer",
            Email = "customer@vehicleparts.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Customer@123"),
            Phone = "9800000002",
            Role = "Customer",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        
        // Seed customer with updated total spent
        modelBuilder.Entity<Customer>().HasData(new Customer
        {
            Id = 11,
            UserId = 11,
            Address = "Kathmandu, Nepal",
            TotalSpent = 1400.00m,
            PendingCredit = 0.00m,
            CreatedAt = DateTime.UtcNow
        });

        // Seed customer vehicle
        modelBuilder.Entity<Vehicle>().HasData(new Vehicle
        {
            Id = 11,
            CustomerId = 11,
            VehicleNumber = "BA-1-CHA-1234",
            Make = "Toyota",
            Model = "Corolla",
            Year = 2020,
            FuelType = "Petrol",
            Mileage = 25000,
            Condition = "Good",
            CreatedAt = DateTime.UtcNow
        });

        // Seed sample sale invoice to prevent financial report errors
        modelBuilder.Entity<SaleInvoice>().HasData(new SaleInvoice
        {
            Id = 11,
            CustomerId = 11,
            StaffId = 10,
            InvoiceNumber = "INV-001",
            SubTotal = 1450.00m,
            DiscountPercent = 0,
            DiscountAmount = 50.00m,
            TotalAmount = 1400.00m,
            PaymentType = "Cash",
            IsPaid = true,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        });

        // Seed sale invoice items
        modelBuilder.Entity<SaleInvoiceItem>().HasData(new SaleInvoiceItem
        {
            Id = 11,
            SaleInvoiceId = 11,
            PartId = 1,
            Quantity = 2,
            UnitPrice = 450.00m,
            TotalPrice = 900.00m
        });

        modelBuilder.Entity<SaleInvoiceItem>().HasData(new SaleInvoiceItem
        {
            Id = 12,
            SaleInvoiceId = 11,
            PartId = 4,
            Quantity = 1,
            UnitPrice = 350.00m,
            TotalPrice = 350.00m
        });

        // Seed sample purchase invoice
        modelBuilder.Entity<Vendor>().HasData(new Vendor
        {
            Id = 10,
            Name = "Auto Parts Supplier",
            ContactPerson = "Mr. Sharma",
            Email = "supplier@autoparts.com",
            Phone = "9800000003",
            Address = "Pokhara, Nepal",
            CreatedAt = DateTime.UtcNow
        });

        modelBuilder.Entity<PurchaseInvoice>().HasData(new PurchaseInvoice
        {
            Id = 10,
            VendorId = 10,
            InvoiceNumber = "PUR-001",
            TotalAmount = 5000.00m,
            IsPaid = false,
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        });
    }
}
