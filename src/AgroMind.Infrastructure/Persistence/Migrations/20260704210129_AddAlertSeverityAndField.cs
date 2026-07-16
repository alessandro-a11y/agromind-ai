using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroMind.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAlertSeverityAndField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "FieldId",
                table: "Alerts",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Severity",
                table: "Alerts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_FieldId",
                table: "Alerts",
                column: "FieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_Fields_FieldId",
                table: "Alerts",
                column: "FieldId",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_Fields_FieldId",
                table: "Alerts");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_FieldId",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "FieldId",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "Severity",
                table: "Alerts");
        }
    }
}
