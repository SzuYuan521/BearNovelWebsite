using BearNovelWebsiteApi.Data;
using BearNovelWebsiteApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using StackExchange.Redis;
using BearNovelWebsiteApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 配置ApplicationDbContext 
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 配置身份驗證
builder.Services.AddIdentity<User, IdentityRole<int>>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

// 添加 Redis緩存服務
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "BearNovelWebsite";
});


// 讀取配置
// 從配置文件中讀取與 JWT 相關的設置, 這些設置包括密鑰 (Key), 發行者 (Issuer), 和受眾 (Audience)
// jwtSection 存儲了這些配置的引用, 稍後將在配置 JWT 認證時使用
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSection["Key"]);

// 配置JWT認證
builder.Services.AddAuthentication(options =>
{
    // 設置默認的認證模式為 JWT 認證, 這意味著所有未來的認證請求都將使用 JWT
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // 配置 JWT Bearer 認證選項
    options.RequireHttpsMetadata = false; // 在開發環境中, 允許不使用 HTTPS 進行認證(生產環境中應設置為 true)
    options.SaveToken = true; // 啟用後, 生成的 Token 將保存到 HttpContext 中, 可在後續請求中重用

    // 配置 JWT Token 的驗證參數
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, // 驗證發行者是否有效
        ValidateAudience = true, // 驗證受眾是否有效
        ValidateLifetime = true, // 驗證 Token 是否在有效期內
        ValidateIssuerSigningKey = true, // 驗證 Token 的簽名密鑰是否有效
        ValidIssuer = jwtSection["Issuer"], // 設置 JWT Token 的合法發行者
        ValidAudience = jwtSection["Audience"], // 設置 JWT Token 的合法受眾
        IssuerSigningKey = new SymmetricSecurityKey(key), // 使用從配置文件中讀取的密鑰進行 Token 簽名驗證
        ClockSkew = TimeSpan.Zero // 設置 Token 的過期時間允許的時間偏移量為零(默認為5分鐘)
    };
    options.Events = new JwtBearerEvents
    {
        // 當 Token 被成功驗證後觸發此事件
        OnTokenValidated = async context =>
        {
            // 從 HTTP 請求的服務提供者中獲取 JwtService 實例
            var jwtService = context.HttpContext.RequestServices.GetRequiredService<JwtService>();

            // 將當前的 SecurityToken 轉換為 JwtSecurityToken
            var token = context.SecurityToken as JwtSecurityToken;

            // 如果 Token 不為 null, 且自訂的 ValidateToken 方法驗證失敗
            if (token != null && !await jwtService.ValidateToken(token.RawData))
            {
                // 驗證失敗的 Token 被拒絕
                context.Fail("Invalid token");
                return;
            }

            // 從 HTTP 請求的服務提供者中獲取分佈式快取服務（例如 Redis）
            var cache = context.HttpContext.RequestServices.GetRequiredService<IDistributedCache>();

            // 從 Token 的 Claims 中提取用戶 ID
            var userId = context.Principal.FindFirstValue(ClaimTypes.NameIdentifier);

            // 從快取中獲取與用戶 ID 相關聯的 Token 字符串
            var cachedToken = await cache.GetStringAsync($"tokens:{userId}");

            // 如果快取中沒有找到 Token 或 Token 字符串為空
            if (string.IsNullOrEmpty(cachedToken))
            {
                // 表示 Token 已被撤銷
                context.Fail("Token has been revoked");
            }
        }
    };

});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 添加日誌記錄
builder.Logging.AddConsole(); // 添加控制台日誌記錄

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 添加路由中介軟體MiddleWare
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
