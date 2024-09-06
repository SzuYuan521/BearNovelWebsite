using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using BearNovelWebsiteApi.Models;
using BearNovelWebsiteApi.Services;
using static BearNovelWebsiteApi.Constants;
using System.Diagnostics;

namespace BearNovelWebsiteApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JwtService _jwtService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IConfiguration configuration, UserManager<User> userManager, SignInManager<User> signInManager, JwtService jwtService, ILogger<UsersController> logger)
        {
            _configuration = configuration;
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
                NickName = string.IsNullOrEmpty(model.NickName) ? model.UserName : model.NickName, // 設置用戶暱稱, 沒填的話就設成UserName
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

        /// <summary>
        /// 使用 POST 方法來處理用戶登錄
        /// </summary>
        /// <param name="model"></param>
        /// <returns>OK: accessToken, refreshToken, Failed: error</returns>
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
                var accessToken = await _jwtService.GenerateJWTToken(user);
                var refreshToken = _jwtService.GenerateRefreshToken(user.Id);

                _logger.LogInformation($"accessToken : {accessToken}, refreshToken : {refreshToken}");
                Debug.WriteLine($"accessToken : {accessToken}, refreshToken : {refreshToken}");
                Debug.WriteLine("User.Identity.IsAuthenticated " + User.Identity.IsAuthenticated);

                var expireDays = Convert.ToDouble(_configuration["Jwt:RefreshTokenExpireDays"]);
                var expireMinutes = Convert.ToDouble(_configuration["Jwt:AccessTokenExpireMinutes"]);

                // 設置RefreshToken 到 HttpOnly Cookie
                Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
                {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddDays(expireDays)
                });

                // 設置 JWT 到 HttpOnly Cookie
                Response.Cookies.Append("jwt", accessToken, new CookieOptions
                {
                    HttpOnly = true, // 確保 Cookie 只能透過 Http 協議訪問
                 //   SameSite = SameSiteMode.None, // 防止跨站點請求偽造 (CSRF)
                    Expires = DateTime.UtcNow.AddMinutes(expireMinutes) // 設置 Cookie 過期時間, 跟JWT一樣
                });

                // 返回 200 OK 和生成的 token
                return Ok(new { accessToken, refreshToken });
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
            Response.Cookies.Delete("refreshToken");

            await _signInManager.SignOutAsync();
            _logger.LogInformation($"User logged out.");
            return Ok(new { message = "User logged out successfully" });
        }

        /// <summary>
        /// 取得 User 資料(未來要完善)
        /// </summary>
        /// <returns>email, userName</returns>
        [HttpGet("user")]
        public async Task<IActionResult> GetUserInfo()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                var jwt = Request.Cookies["jwt"];
                var refreshToken = Request.Cookies["refreshToken"];
                // 如果 jwt 過期被自動刪除但 refreshToken 還在, 則返回 401 Unauthorized "jwt not found", 須重新產生jwt
                if (string.IsNullOrEmpty(jwt) && !string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(new { message = "jwt not found" });
                }
                // 如果 jwt 跟 refreshToken 都不存在(過期), 則返回 401 Unauthorized "token not found", 前端須重新處理登入
                else if (string.IsNullOrEmpty(jwt) && string.IsNullOrEmpty(refreshToken))
                {
                    return Unauthorized(new { message = "token not found" });
                }
            }

            // 如果用戶存在但沒有大頭照, 只返回其他用戶資料, 轉換圖片為 Base64 字符串避免轉成二進制數據
            var profilePictureBase64 = user.ProfilePicture != null
                ? Convert.ToBase64String(user.ProfilePicture)
                : null;

            // 確保根據儲存的 ContentType 動態設置圖片的 MIME 類型
            var profilePictureMimeType = user.ProfilePictureContentType ?? "image/jpeg"; // 預設為 JPEG
            var profilePicture = profilePictureBase64 != null
                ? $"data:{profilePictureMimeType};base64,{profilePictureBase64}"
                : null;

            return Ok(new { user.Email, user.UserName, user.NickName, ProfilePicture = profilePicture });
        }

        /// <summary>
        /// Refresh Token
        /// </summary>
        /// <returns>access Token</returns>
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            Debug.WriteLine("refresh-token");

            var refreshToken = Request.Cookies["refreshToken"];

            // 如果refreshToken過期則返回 401 Unauthorized "token not found", 前端須重新處理登入
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized("token not found");
            }

            // 生成新的 accessToken
            var userId = _jwtService.ParseRefreshTokenUserId(refreshToken);
            var user = await _userManager.FindByIdAsync(userId);
            var newAccessToken = await _jwtService.GenerateJWTToken(user);

            var expireMinutes = Convert.ToDouble(_configuration["Jwt:AccessTokenExpireMinutes"]);

            Response.Cookies.Append("jwt", newAccessToken, new CookieOptions
            {
                HttpOnly = true, // 確保 Cookie 只能透過 Http 協議訪問
                //   SameSite = SameSiteMode.None, // 防止跨站點請求偽造 (CSRF)
                Expires = DateTime.UtcNow.AddMinutes(expireMinutes) // 設置 Cookie 過期時間, 跟JWT一樣
            });

            Debug.WriteLine($"newAccessToken : {newAccessToken}");

            return Ok(new { accessToken = newAccessToken });
        }

        /// <summary>
        /// 上傳大頭照
        /// </summary>
        /// <param name="profilePicture"></param>
        /// <returns></returns>
        [HttpPost("upload-profile-picture")]
        [RequestSizeLimit(2 * 1024 * 1024)] // 限制最大上傳大小為 2MB
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile profilePicture)
        {
            // 取得當前已登入的用戶
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var allowedTypes = new[] { "image/jpeg", "image/png"};
            // 檢查文件是否存在且格式正確
            if (profilePicture == null || profilePicture.Length == 0 || !allowedTypes.Contains(profilePicture.ContentType))
            {
                return BadRequest(new { message = "Invalid file" });
            }

            try
            {
                // 將圖片轉為二進制數據
                using (var memoryStream = new MemoryStream())
                {
                    await profilePicture.CopyToAsync(memoryStream);
                    user.ProfilePicture = memoryStream.ToArray();
                    user.ProfilePictureContentType = profilePicture.ContentType; // 保存圖片的 MIME 類型
                }

                // 更新用戶資料
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    return Ok(new { message = "照片上傳成功" });
                }

                return BadRequest(result.Errors);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "上傳大頭照時出現錯誤 ", error = ex.Message });
            }         
        }
    }
}
