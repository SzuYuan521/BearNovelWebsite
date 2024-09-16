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
using System.ComponentModel;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// 配置ApplicationDbContext 
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 配置身份驗證
builder.Services.AddIdentity<User, IdentityRole<int>>(options =>
{
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.";  // 允許的用戶名字符

    // 密碼設置
    options.Password.RequireDigit = true; // 密碼必須包含數字
    options.Password.RequireLowercase = true; // 密碼必須包含小寫字母
    options.Password.RequireUppercase = false; // 密碼必須包含大寫字母
    options.Password.RequireNonAlphanumeric = false; // 密碼必須包含非字母數字字符
    options.Password.RequiredLength = 6; // 密碼最小長度
    options.Password.RequiredUniqueChars = 1; // 密碼必須包含唯一字符數量

    // 帳號鎖定設置
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5); // 帳號鎖定時間
    options.Lockout.MaxFailedAccessAttempts = 5; // 最大失敗登錄嘗試次數
    options.Lockout.AllowedForNewUsers = true; // 新用戶是否適用鎖定策略

    // 驗證設置
    options.User.RequireUniqueEmail = true; // 用戶必須擁有唯一的電子郵件

    // 兩因素驗證設置
    options.Tokens.AuthenticatorTokenProvider = TokenOptions.DefaultAuthenticatorProvider; // 兩因素驗證的令牌提供者
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// 讀取配置
// 從配置文件中讀取與 JWT 相關的設置, 這些設置包括密鑰 (Key), 發行者 (Issuer), 和受眾 (Audience)
// jwtSection 存儲了這些配置的引用, 稍後將在配置 JWT 認證時使用
var jwtSection = builder.Configuration.GetSection("Jwt");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]));

// 確保 JwtService 被正確註冊
builder.Services.AddScoped<JwtService>();

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
        ValidateIssuer = false, // 不驗證發行者是否有效
        ValidateAudience = false, // 不驗證受眾(使用者)
        ValidateLifetime = true, // 驗證 Token 是否在有效期內
        ValidateIssuerSigningKey = true, // 驗證 Token 的簽名密鑰是否有效
      //  ValidIssuer = jwtSection["Issuer"], // 設置 JWT Token 的合法發行者
      //  ValidAudience = jwtSection["Audience"], // 設置 JWT Token 的合法受眾
        IssuerSigningKey = key, // 使用從配置文件中讀取的密鑰進行 Token 簽名驗證
        ClockSkew = TimeSpan.Zero // 設置 Token 的過期時間允許的時間偏移量為零(默認為5分鐘)
    };
    
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["jwt"];
            return Task.CompletedTask;
        },  
        // 認證失敗時
        OnAuthenticationFailed = context =>
        {
            if (context.Exception is SecurityTokenExpiredException)
            {
                // 捕獲 token 過期異常, 添加 Token-Expired 標頭方便前端處理
                context.Response.Headers.Add("Token-Expired", "true");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            }
            return Task.CompletedTask;
        }
    };
});

// Configure Google Authentication
/*
builder.Services.AddAuthentication()
    .AddGoogle(options =>
    {
        options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
        options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    });*/


// 從配置中讀取Redis連接字串
var redisConnectionString = builder.Configuration.GetConnectionString("Redis");
// 添加 Redis緩存服務
builder.Services.AddStackExchangeRedisCache(options =>
{
    if (string.IsNullOrEmpty(redisConnectionString))
    {
        throw new InvalidOperationException("Redis connection string is not configured.");
    }
    options.Configuration = redisConnectionString;
    options.InstanceName = "BearNovelWebsite";
});

// 啟用 CORS (因為前後端端口可能不一致)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // 允許的來源
              .AllowAnyHeader() // 允許的標頭
              .AllowAnyMethod() // 允許的 HTTP 方法
              .AllowCredentials(); // 允許憑證
    });
});


// 配置 JSON 序列化選項以忽略循環引用
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;
    });

builder.Services.AddAuthorization();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 清除所有現有的日誌提供程序
builder.Logging.ClearProviders();
// 添加日誌記錄
builder.Logging.AddConsole();

// 註冊業務服務
builder.Services.AddScoped<NovelService>();

// 註冊背景服務
builder.Services.AddSingleton<RankingBackgroundService>();
builder.Services.AddSingleton<NovelCleanupService>();

var app = builder.Build();

app.UseCors();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// 添加路由中介軟體MiddleWare
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
