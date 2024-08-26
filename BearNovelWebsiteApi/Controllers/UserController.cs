using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Security.Claims;
using BearNovelWebsiteApi.Models;
using BearNovelWebsiteApi.Services;
using static BearNovelWebsiteApi.Constants;

namespace BearNovelWebsiteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;

        public UsersController(UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _jwtService = jwtService;
        }

        // 使用 POST 方法來註冊新用戶
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            // 根據註冊模型創建新的 ApplicationUser 實例
            var user = new User
            {
                UserName = model.Email, // 設置用戶名為註冊的電子郵件地址
                Email = model.Email, // 設置電子郵件地址
                Role = Role.User // 設置用戶類型為 User
            };

            // 使用 UserManager 來創建新用戶，並設置密碼
            var result = await _userManager.CreateAsync(user, model.Password);

            // 如果用戶創建成功, 返回 200 OK 並附帶成功消息
            if (result.Succeeded)
            {
                return Ok(new { message = "User created successfully" });
            }

            // 如果創建失敗, 返回 400 BadRequest 和錯誤信息
            return BadRequest(result.Errors);
        }

        // 使用 POST 方法來處理用戶登錄
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            // 使用 SignInManager 來驗證用戶的電子郵件和密碼
            var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, false, false);

            // 如果登錄成功
            if (result.Succeeded)
            {
                // 根據電子郵件查找用戶
                var user = await _userManager.FindByEmailAsync(model.Email);
                // 生成 JWT token
                var token = _jwtService.GenerateJWTToken(user);
                // 返回 200 OK 和生成的 token
                return Ok(new { token });
            }

            // 如果登錄失敗, 返回 401 Unauthorized
            return Unauthorized();
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            if (int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out int userId))
            {
                await _jwtService.RevokeJWTToken(userId);
            }
            await _signInManager.SignOutAsync();
            return Ok();
        }
    }
}
