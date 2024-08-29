using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Security.Claims;
using BearNovelWebsiteApi.Models;
using BearNovelWebsiteApi.Services;
using static BearNovelWebsiteApi.Constants;
using Newtonsoft.Json.Linq;
using System.Diagnostics;

namespace BearNovelWebsiteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService, ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
            _logger = logger;
        }

        // 使用 POST 方法來註冊新用戶
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            // 根據註冊模型創建新的 User 實例
            var user = new User
            {
                UserName = model.UserName, // 設置用戶名為註冊的電子郵件地址
                Email = model.Email, // 設置電子郵件地址
                Role = Role.User // 設置用戶類型為 User
            };

            // 使用 UserManager 來創建新用戶，並設置密碼
            var result = await _userManager.CreateAsync(user, model.Password);

            // 如果用戶創建成功, 返回 200 OK 並附帶成功消息
            if (result.Succeeded)
            {
                _logger.LogInformation("User created successfully");
                return Ok(new { message = "User created successfully" });
            }

            // 如果創建失敗, 返回 400 BadRequest 和錯誤信息
            return BadRequest(result.Errors);
        }

        // 使用 POST 方法來處理用戶登錄
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            User user;

            // 判斷輸入的格式是不是Email
            if (model.UserNameOrEmail.Contains("@"))
            {
                // 根據Email查找用戶
                user = await _userManager.FindByEmailAsync(model.UserNameOrEmail);
            }
            else
            {
                // 根據UserName查找用戶
                user = await _userManager.FindByNameAsync(model.UserNameOrEmail);
            }

            if (user == null)
            {
                // 如果找不到User, 返回 401 Unauthorized
                return Unauthorized();
            }

            // 使用 SignInManager 來驗證用戶的UserName和密碼
            var result = await _signInManager.PasswordSignInAsync(user.UserName, model.Password, false, false);

            // 如果登錄成功
            if (result.Succeeded)
            {
                // 生成 JWT token
                var token = await _jwtService.GenerateJWTToken(user);
                _logger.LogInformation($"token : {token}");
                Debug.WriteLine($"token : {token}");
                Debug.WriteLine("User.Identity.IsAuthenticated " + User.Identity.IsAuthenticated);

                // 設置 JWT 到 HttpOnly Cookie
                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true, // 確保 Cookie 只能透過 Http 協議訪問
                 //   SameSite = SameSiteMode.None, // 防止跨站點請求偽造 (CSRF)
                    Expires = DateTime.UtcNow.AddDays(30) // 設置 Cookie 過期時間, 跟JWT一樣
                });

                // 返回 200 OK 和生成的 token
                return Ok(new { token });
            }
            else
            {
                Debug.WriteLine($"登入失敗：{result.ToString()}", result.ToString());
                // 判斷具體失敗原因
                if (result.IsLockedOut) Debug.WriteLine("帳號被鎖定。");
                if (result.IsNotAllowed) Debug.WriteLine("帳號不允許登入。");
                if (result.RequiresTwoFactor) Debug.WriteLine("需要雙重驗證。");
            }

            // 如果登錄失敗, 返回 401 Unauthorized
            return Unauthorized();
        }

        // 用戶登出
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // 清除 JWT Cookie
            Response.Cookies.Delete("jwt");

            // 獲取當前已登入的用戶
            //    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // 撤銷JWT Token
            //   var revoked = await _jwtService.RevokeJWTToken(userId);

            await _signInManager.SignOutAsync();
            _logger.LogInformation($"User logged out.");
            return Ok(new { message = "User logged out successfully" });
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUserInfo()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { user.Email, user.UserName });
        }

        /*
        // 手動撤銷JWT Token
        [HttpPost("revoke-token")]
        public async Task<IActionResult> RevokeJWTToken([FromBody] int userId)
        {
            var revoked = await _jwtService.RevokeJWTToken(userId);

            if (revoked)
            {
                return Ok(new { message = "Token revoked successfully" });
            }

            return BadRequest(new { message = "Failed to revoke token" });
        }*/
    }
}
