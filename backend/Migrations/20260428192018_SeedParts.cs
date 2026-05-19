using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VehiclePartsAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedParts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Parts",
                columns: new[] { "Id", "Category", "CreatedAt", "Description", "IsActive", "Name", "PurchasePrice", "ReorderLevel", "SKU", "SellingPrice", "StockQuantity", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, "Filters", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9494), "High quality engine oil filter for all vehicles", true, "Engine Oil Filter", 350.00m, 10, "EOF-001", 450.00m, 25, null },
                    { 2, "Brakes", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9497), "Front brake pads for sedan and hatchback", true, "Brake Pads (Front)", 1200.00m, 10, "BPF-002", 1500.00m, 30, null },
                    { 3, "Ignition", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9499), "NGK spark plugs set of 4", true, "Spark Plug (Set of 4)", 800.00m, 10, "SPK-003", 1000.00m, 15, null },
                    { 4, "Filters", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9501), "Engine air filter for better performance", true, "Air Filter", 250.00m, 10, "AF-004", 350.00m, 20, null },
                    { 5, "Clutch", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9503), "Heavy duty clutch plate", true, "Clutch Plate", 2500.00m, 10, "CLP-005", 3000.00m, 12, null },
                    { 6, "Lighting", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9505), "H4 halogen headlight bulb", true, "Headlight Bulb (H4)", 150.00m, 10, "HLB-006", 200.00m, 35, null },
                    { 7, "Cooling", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9507), "Engine coolant 1L bottle", true, "Radiator Coolant", 450.00m, 10, "RDC-007", 550.00m, 18, null },
                    { 8, "Wheel", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9593), "Front wheel bearing", true, "Wheel Bearing", 800.00m, 10, "WHB-008", 1000.00m, 22, null },
                    { 9, "Filters", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9596), "Fuel filter for diesel and petrol engines", true, "Fuel Filter", 300.00m, 10, "FF-009", 400.00m, 16, null },
                    { 10, "Suspension", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9599), "Front shock absorber", true, "Shock Absorber (Front)", 1800.00m, 10, "SHA-010", 2200.00m, 14, null },
                    { 11, "Electrical", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9601), "12V alternator for most cars", true, "Alternator", 4500.00m, 10, "ALT-011", 5500.00m, 3, null },
                    { 12, "Electrical", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9603), "12V starter motor", true, "Starter Motor", 3500.00m, 10, "STM-012", 4200.00m, 2, null },
                    { 13, "Engine", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9605), "Timing belt for 4 cylinder engines", true, "Timing Belt", 1200.00m, 10, "TMB-013", 1500.00m, 5, null },
                    { 14, "Brakes", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9608), "Front brake disc rotor", true, "Brake Disc (Front)", 2200.00m, 10, "BRD-014", 2800.00m, 4, null },
                    { 15, "Cooling", new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9706), "Engine water pump", true, "Water Pump", 1800.00m, 10, "WTP-015", 2300.00m, 6, null }
                });

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9066), "$2a$11$4D.tfl0rg7eAxwNBGaOVUu0mrDl7iEdXrDFgz7ap4OgrIxFUbMNh6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 4, 28, 16, 56, 45, 148, DateTimeKind.Utc).AddTicks(5884), "$2a$11$juk1Ac.tZO2FDi6p5UxamePoZbd.ZDDV5TFhpD2jSeQFfnRSyYmzS" });
        }
    }
}
