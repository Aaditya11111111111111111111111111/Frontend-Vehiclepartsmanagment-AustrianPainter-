# Migrations

Run these commands from inside the VehiclePartsAPI folder:

```bash
# Add initial migration
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update

# If you need to reset
dotnet ef database drop
dotnet ef database update
```

The `AppDbContext.OnModelCreating` seeds the default Admin user automatically.
