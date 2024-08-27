using BearNovelWebsiteApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using static BearNovelWebsiteApi.Constants;

namespace BearNovelWebsiteApi.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public DbSet<Novel> Novels { get; set; }
        public DbSet<Chapter> Chapters { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // 設定 IdentityUserToken 的主鍵
            builder.Entity<IdentityUserToken<int>>()
                .HasKey(t => new { t.UserId, t.LoginProvider, t.Name });

            // 設定 IdentityUserClaim 的主鍵
            builder.Entity<IdentityUserClaim<int>>()
                .HasKey(c => c.Id);

            // 設定 IdentityUserLogin 的主鍵
            builder.Entity<IdentityUserLogin<int>>()
                .HasKey(l => new { l.LoginProvider, l.ProviderKey });

            // 設定 IdentityUserRole 的主鍵
            builder.Entity<IdentityUserRole<int>>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            // 設定 IdentityRoleClaim 的主鍵
            builder.Entity<IdentityRoleClaim<int>>()
                .HasKey(rc => rc.Id);

            builder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion(
                    v => v.ToString(), // 轉成string以存在資料庫中
                    v => (Role)Enum.Parse(typeof(Role), v)); // 資料庫中的role會被解析成Constants.Role

            // 同個user對同個novel只能點讚一次
            builder.Entity<Like>()
                .HasIndex(l => new { l.NovelId, l.UserId }) // 複合索引
                .IsUnique();

            // 禁用串聯刪除
            foreach (var relationship in builder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
