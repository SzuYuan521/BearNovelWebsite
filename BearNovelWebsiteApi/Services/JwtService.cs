using BearNovelWebsiteApi.Controllers;
using BearNovelWebsiteApi.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BearNovelWebsiteApi.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<JwtService> _logger; // 注入 ILogger用以紀錄log

        // 建構函數, 注入 IConfiguration 和 IDistributedCache 以讀取配置和操作 Redis 緩存
        public JwtService(IConfiguration configuration, IDistributedCache cache, ILogger<JwtService> logger)
        {
            _configuration = configuration;
            _logger = logger; // 初始化 ILogger
        }

        /// <summary>
        /// 生成 JWT Token 的方法
        /// </summary>
        /// <param name="user"></param>
        /// <returns>token(string)</returns>
        /// <exception cref="ArgumentOutOfRangeException"></exception>
        public async Task<string> GenerateJWTToken(User user)
        {
            // 設置 Claims，這些是 Token 中包含的用戶信息
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // 用戶唯一標識符
                new Claim(ClaimTypes.Name, user.UserName), // 用戶名
                new Claim(ClaimTypes.Email, user.Email), // 用戶電子郵件
                new Claim(ClaimTypes.Role, user.Role.ToString()) // 用戶角色
            };

            System.Diagnostics.Debug.WriteLine($"Jwt:Key [{_configuration["Jwt:Key"]}]");

            // 從配置中讀取密鑰並創建 SymmetricSecurityKey
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            // 創建簽名憑證
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 確保 expireMinutes 是有效的正數
            var expireMinutes = Convert.ToDouble(_configuration["Jwt:AccessTokenExpireMinutes"]);
            if (expireMinutes <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(expireMinutes), "expireMinutes 必須是正數");
            }

            // 設置 Token 的過期時間
            var expires = DateTime.UtcNow.AddDays(expireMinutes);

            // 創建 JwtSecurityToken 實例，設定發行者、受眾、Claims、過期時間和簽名憑證
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"], // Token 的發行者
                audience: _configuration["Jwt:Audience"], // Token 的受眾
                claims: claims, // Token 中包含的 Claims
                expires: expires, // Token 過期時間
                signingCredentials: creds // Token 簽名憑證
            );

            // 將 JwtSecurityToken 實例轉換為字符串
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation($"JWT Token for user {user.Id} is {tokenString}");
            System.Diagnostics.Debug.WriteLine($"JWT Token for user {user.Id} is {tokenString}");

            return tokenString;
        }

        /// <summary>
        /// 生成 Refresh Token
        /// </summary>
        /// <param name="userId">userId</param>
        /// <returns>guid--userId</returns>
        public string GenerateRefreshToken(int userId)
        {
            // RefreshToken 生成使用Guid
            var guid = Guid.NewGuid().ToString();
            return $"{guid}--{userId}";
        }

        /// <summary>
        /// 生成 Refresh Token (生成時使用Guid--UserId的格式)
        /// </summary>
        /// <param name="userId">userId</param>
        /// <returns>guid--userId</returns>
        public string GenerateRefreshToken(string userId)
        {
            // RefreshToken 生成使用Guid
            var guid = Guid.NewGuid().ToString();
            return $"{guid}--{userId}";
        }

        /// <summary>
        /// 解析 RefreshToken中的UserId
        /// </summary>
        /// <param name="token">refreshtoken</param>
        /// <returns>userId</returns>
        /// <exception cref="InvalidOperationException"></exception>
        public string ParseRefreshTokenUserId(string token)
        {
            var parts = token.Split("--");

            if (parts.Length != 2)
            {
                throw new InvalidOperationException("Invalid refresh token format");
            }

            var userId = parts[1];

            return userId;
        }
    }
}
