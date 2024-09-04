using BearNovelWebsiteApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Newtonsoft.Json;
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
        public DbSet<NovelView> NovelViews { get; set; }

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

            // 設置 UserName
            builder.Entity<User>()
                .Property(u => u.UserName)
                .HasMaxLength(20)
                .IsRequired();

            // 設置 Role 的預設值為 User 和 型別轉換
            builder.Entity<User>()
                .Property(u => u.Role)
                .HasDefaultValue(Role.User)
                .HasConversion(
                    v => v.ToString(), // 將 Role 轉換為字符串存儲在資料庫中
                    v => (Role)Enum.Parse(typeof(Role), v)); // 將字符串解析為 Role 列舉值

            // 同個user對同個novel只能點讚一次
            builder.Entity<Like>()
                .HasIndex(l => new { l.NovelId, l.UserId }) // 複合索引
                .IsUnique();

            // 配置 Novel 表
            builder.Entity<Novel>()
                .Property(n => n.ViewCount)
                .HasDefaultValue(0); // 默認觀看次數為0

            builder.Entity<Novel>()
                .Property(n => n.LikeCount)
                .HasDefaultValue(0); // 默認點讚次數為0

            builder.Entity<Novel>()
                .Property(n => n.IsDeleted)
                .HasDefaultValue(false); // 默認未刪除

            builder.Entity<Novel>()
                .Property(n => n.IsEnding)
                .HasDefaultValue(false); // 默認未完結

            // 配置 NovelType 列
            builder.Entity<Novel>()
                .Property(n => n.NovelTypes)
                .HasConversion(
                     v => JsonConvert.SerializeObject(v, new JsonSerializerSettings
                     {
                         Formatting = Formatting.None // 禁用JSON格式化以節省空間
                     }),
                    v => JsonConvert.DeserializeObject<List<NovelType>>(v, new JsonSerializerSettings
                    {
                        NullValueHandling = NullValueHandling.Ignore // 忽略JSON中的null值
                    }) ?? new List<NovelType>(), // 如果反序列化結果為 null，則返回一個空的 List
                    new ValueComparer<List<NovelType>>(
                        (c1, c2) => c1.SequenceEqual(c2), // 比較兩個 List 是否相等
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())), // 計算 HashCode
                        c => c.ToList() // 複製 List 以確保一致性
                    )
                );

            // 配置 NovelView 表
            builder.Entity<NovelView>()
                .HasKey(nv => nv.NovelViewId);

            builder.Entity<NovelView>()
                .HasOne(nv => nv.Novel)
                .WithMany(n => n.NovelViews)
                .HasForeignKey(nv => nv.NovelId);

            builder.Entity<NovelView>()
                .HasOne(nv => nv.User)
                .WithMany()
                .HasForeignKey(nv => nv.UserId);

            // 禁用串聯刪除
            foreach (var relationship in builder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }
    }
}
