using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VehiclePartsAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdditionalData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5123));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5128));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5131));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5133));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5135));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5137));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5140));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5142));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5144));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5148));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5150));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5152));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5154));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5156));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(5158));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 4, 29, 3, 24, 41, 363, DateTimeKind.Utc).AddTicks(4918), "$2a$11$nVfoqW0w4kdGbNn1y5g3fO1vCpJ/c98jCqh2kf0U.ZKa1KrdTeZ4O" });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "IsActive", "PasswordHash", "Phone", "Role", "UpdatedAt" },
                values: new object[,]
                {
                    { 10, new DateTime(2026, 4, 29, 3, 24, 41, 481, DateTimeKind.Utc).AddTicks(2097), "staff@vehicleparts.com", "John Staff", true, "$2a$11$8VB7VnOS7OKtlIdFcRhSTuJnvSboAW.LgeW8iCeZzeuDJvBWM7ZLW", "9800000001", "Staff", null },
                    { 11, new DateTime(2026, 4, 29, 3, 24, 41, 598, DateTimeKind.Utc).AddTicks(9710), "customer@vehicleparts.com", "Ramesh Customer", true, "$2a$11$bVIyxGmoWrkj12Ajcma19uKtov1BQv18ZbD88/1Pk9vVy1EnnV312", "9800000002", "Customer", null }
                });

            migrationBuilder.InsertData(
                table: "Vendors",
                columns: new[] { "Id", "Address", "ContactPerson", "CreatedAt", "Email", "IsActive", "Name", "Phone" },
                values: new object[] { 10, "Pokhara, Nepal", "Mr. Sharma", new DateTime(2026, 4, 29, 3, 24, 41, 599, DateTimeKind.Utc).AddTicks(392), "supplier@autoparts.com", true, "Auto Parts Supplier", "9800000003" });

            migrationBuilder.InsertData(
                table: "Customers",
                columns: new[] { "Id", "Address", "CreatedAt", "LastCreditDate", "PendingCredit", "TotalSpent", "UserId" },
                values: new object[] { 11, "Kathmandu, Nepal", new DateTime(2026, 4, 29, 3, 24, 41, 599, DateTimeKind.Utc).AddTicks(53), null, 0.00m, 1400.00m, 11 });

            migrationBuilder.InsertData(
                table: "PurchaseInvoices",
                columns: new[] { "Id", "CreatedAt", "InvoiceNumber", "IsPaid", "Notes", "TotalAmount", "VendorId" },
                values: new object[] { 10, new DateTime(2026, 4, 19, 3, 24, 41, 599, DateTimeKind.Utc).AddTicks(453), "PUR-001", false, "", 5000.00m, 10 });

            migrationBuilder.InsertData(
                table: "Staff",
                columns: new[] { "Id", "HireDate", "IsActive", "Position", "UserId" },
                values: new object[] { 10, new DateTime(2025, 10, 29, 3, 24, 41, 481, DateTimeKind.Utc).AddTicks(2516), true, "Sales Executive", 10 });

            migrationBuilder.InsertData(
                table: "SaleInvoices",
                columns: new[] { "Id", "CreatedAt", "CustomerId", "DiscountAmount", "DiscountPercent", "DueDate", "InvoiceNumber", "IsPaid", "Notes", "PaymentType", "StaffId", "SubTotal", "TotalAmount" },
                values: new object[] { 11, new DateTime(2026, 4, 24, 3, 24, 41, 599, DateTimeKind.Utc).AddTicks(188), 11, 50.00m, 0m, null, "INV-001", true, "", "Cash", 10, 1450.00m, 1400.00m });

            migrationBuilder.InsertData(
                table: "Vehicles",
                columns: new[] { "Id", "Condition", "CreatedAt", "CustomerId", "FuelType", "Make", "Mileage", "Model", "VehicleNumber", "Year" },
                values: new object[] { 11, "Good", new DateTime(2026, 4, 29, 3, 24, 41, 599, DateTimeKind.Utc).AddTicks(132), 11, "Petrol", "Toyota", 25000, "Corolla", "BA-1-CHA-1234", 2020 });

            migrationBuilder.InsertData(
                table: "SaleInvoiceItems",
                columns: new[] { "Id", "PartId", "Quantity", "SaleInvoiceId", "TotalPrice", "UnitPrice" },
                values: new object[,]
                {
                    { 11, 1, 2, 11, 900.00m, 450.00m },
                    { 12, 4, 1, 11, 350.00m, 350.00m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "PurchaseInvoices",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "SaleInvoiceItems",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "SaleInvoiceItems",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Vehicles",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "SaleInvoices",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Vendors",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Customers",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Staff",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9494));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9497));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9499));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9501));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 5,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9503));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 6,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9505));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 7,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9507));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 8,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9593));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 9,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9596));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 10,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9599));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 11,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9601));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 12,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9603));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 13,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9605));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 14,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9608));

            migrationBuilder.UpdateData(
                table: "Parts",
                keyColumn: "Id",
                keyValue: 15,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9706));

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2026, 4, 28, 19, 20, 18, 242, DateTimeKind.Utc).AddTicks(9066), "$2a$11$4D.tfl0rg7eAxwNBGaOVUu0mrDl7iEdXrDFgz7ap4OgrIxFUbMNh6" });
        }
    }
}
