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
        private readonly IDistributedCache _cache;
        private readonly ILogger<JwtService> _logger; // 注入 ILogger用以紀錄log

        // 建構函數, 注入 IConfiguration 和 IDistributedCache 以讀取配置和操作 Redis 緩存
        public JwtService(IConfiguration configuration, IDistributedCache cache, ILogger<JwtService> logger)
        {
            _configuration = configuration;
            _cache = cache;
            _logger = logger; // 初始化 ILogger
        }

        // 生成 JWT Token 的方法
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

            // 確保 ExpireDays 是有效的正數
            var expireDays = Convert.ToDouble(_configuration["Jwt:ExpireDays"]);
            if (expireDays <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(expireDays), "The expire days must be a positive number.");
            }

            // 設置 Token 的過期時間
            var expires = DateTime.UtcNow.AddDays(expireDays);

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

            // 將生成的 Token 存儲到 Redis
            await _cache.SetStringAsync(
                $"user_token:{user.Id}", // 存儲 Token 的鍵，根據用戶 ID 生成唯一鍵
                tokenString, // 存儲的 Token 字符串
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"])) // Token 過期時間
                }
            );

            _logger.LogInformation($"JWT Token for user {user.Id} is {tokenString}");
            System.Diagnostics.Debug.WriteLine($"JWT Token for user {user.Id} is {tokenString}");

            ValidateToken(tokenString);

            return tokenString;
        }

        // 驗證 Token 的方法
        public async Task<bool> ValidateToken(string token)
        {
            // 創建 JwtSecurityTokenHandler 實例以讀取 Token
            var handler = new JwtSecurityTokenHandler();
            // 解析 Token
            var jwtToken = handler.ReadJwtToken(token);

            // 從 Token 中提取用戶 ID
            var userId = jwtToken.Claims.First(claim => claim.Type == ClaimTypes.NameIdentifier).Value;

            System.Diagnostics.Debug.WriteLine($"[ValidateToken] JWT Token {jwtToken}");

            if (userId != null)
            {
                var key = $"user_token:{userId}";
                var storedToken = await _cache.GetStringAsync(key); // 從 Redis 中檢索存儲的 Token
                System.Diagnostics.Debug.WriteLine($"[ValidateToken] storedToken {storedToken}");

                // 比對存儲的 Token 和提供的 Token 是否一致
                return token == storedToken;
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("userId == null");
                return false;
            }
        }

        // 撤銷 Token 的方法
        public async Task<bool> RevokeJWTToken(int userId)
        {
            var cacheKey = $"user_token:{userId}"; // 根據用戶 ID 生成唯一鍵
            var tokenExists = await _cache.GetStringAsync(cacheKey); // 檢查Token是否存在

            if (string.IsNullOrEmpty(tokenExists))
            {
                _logger.LogWarning($"No token found for user {userId}");
                return false; // 如果沒有找到 Token，返回 false
            }

            await _cache.RemoveAsync(cacheKey); // 從 Redis 中移除 Token
            _logger.LogInformation($"Token revoked for user {userId}");
            return true;
        }
    }
}
