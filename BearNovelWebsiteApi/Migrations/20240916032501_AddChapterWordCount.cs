using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BearNovelWebsiteApi.Migrations
{
    public partial class AddChapterWordCount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WordCount",
                table: "Chapters",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WordCount",
                table: "Chapters");
        }
    }
}
