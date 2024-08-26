using BearNovelWebsiteApi.Models;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BearNovelWebsiteApi.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;
        private readonly IDistributedCache _cache;

        // 建構函數, 注入 IConfiguration 和 IDistributedCache 以讀取配置和操作 Redis 緩存
        public JwtService(IConfiguration configuration, IDistributedCache cache)
        {
            _configuration = configuration;
            _cache = cache;
        }

        // 生成 JWT Token 的方法
        public async Task<string> GenerateJWTToken(User user)
        {
            // 設置 Claims，這些是 Token 中包含的用戶信息
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // 用戶唯一標識符
                new Claim(ClaimTypes.Name, user.UserName), // 用戶名
                new Claim(ClaimTypes.Email, user.Email), // 用戶電子郵件
                new Claim(ClaimTypes.Role, user.Role.ToString()) // 用戶角色
            };

            // 從配置中讀取密鑰並創建 SymmetricSecurityKey
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            // 創建簽名憑證
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            // 設置 Token 的過期時間
            var expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:ExpireDays"]));

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

            // 從 Redis 中檢索存儲的 Token
            var storedToken = await _cache.GetStringAsync($"user_token:{userId}");

            // 比對存儲的 Token 和提供的 Token 是否一致
            return storedToken == token;
        }

        // 撤銷 Token 的方法
        public async Task RevokeJWTToken(int userId)
        {
            // 從 Redis 中刪除指定用戶 ID 的 Token
            await _cache.RemoveAsync($"user_token:{userId}");
        }
    }
}
