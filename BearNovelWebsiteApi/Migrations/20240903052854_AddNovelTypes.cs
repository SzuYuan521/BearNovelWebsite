using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BearNovelWebsiteApi.Migrations
{
    public partial class AddNovelTypes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NovelTypes",
                table: "Novels",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NovelTypes",
                table: "Novels");
        }
    }
}
