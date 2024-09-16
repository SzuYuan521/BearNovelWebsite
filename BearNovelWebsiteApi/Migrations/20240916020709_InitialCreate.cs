using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BearNovelWebsiteApi.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TotalWordCount",
                table: "Novels",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalWordCount",
                table: "Novels");
        }
    }
}
