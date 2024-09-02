﻿using BearNovelWebsiteApi.Data;
using BearNovelWebsiteApi.Models;
using BearNovelWebsiteApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BearNovelWebsiteApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NovelsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly NovelService _novelService;

        public NovelsController(ApplicationDbContext context, NovelService novelService)
        {
            _context = context;
            _novelService = novelService;
        }

        /// <summary>
        /// 取得所有小說, 包括每個小說的作者
        /// </summary>
        /// <returns>所有小說data</returns>
        [HttpGet]
        public async Task<IActionResult> GetNovels()
        {
            // 從資料庫中獲取所有小說, 過濾掉軟刪除的小說, 包括每個小說的作者(關聯User)
            var novels = await _context.Novels.Where(n => !n.IsDeleted).Include(n => n.User).ToListAsync();
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 如果用戶未登錄，不需要檢查點讚記錄
            if (int.TryParse(userIdClaim, out var userId) && userId > 0)
            {
                // 獲取用戶點讚過的小說ID集合
                var likedNovelIds = await _context.Likes
                    .Where(l => l.UserId == userId)
                    .Select(l => l.NovelId)
                    .ToListAsync();

                // 為每個小說添加是否已點讚的標誌
                foreach (var novel in novels)
                {
                    novel.IsLiked = likedNovelIds.Contains(novel.NovelId);
                }
            }
            else
            {
                // 用戶未登入，所有小說的 IsLiked 屬性設置為 false
                foreach (var novel in novels)
                {
                    novel.IsLiked = false;
                }
            }
            return Ok(novels);
        }

        /// <summary>
        /// 根據UserId獲取該User的所有小說 (對特定作者感興趣時)
        /// </summary>
        /// <param name="userId">userId</param>
        /// <returns>指定作者的小說data</returns>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetNovelsByUserId([FromRoute] int userId)
        {
            var novels = await _context.Novels
                .Where(n => n.AuthorId == userId && !n.IsDeleted) // 根據UserId過濾並排除已刪除的小說
                .Include(n => n.User) // 包含User信息
                .ToListAsync();


            // 檢查用戶是否已登入
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 如果用戶已登入，獲取點讚信息
            if (int.TryParse(userIdClaim, out var id) && id > 0)
            {
                // 獲取用戶點讚過的小說ID集合
                var likedNovelIds = await _context.Likes
                    .Where(l => l.UserId == id)
                    .Select(l => l.NovelId)
                    .ToListAsync();

                // 為每個小說添加是否已點讚的標誌
                foreach (var novel in novels)
                {
                    novel.IsLiked = likedNovelIds.Contains(novel.NovelId);
                }
            }
            else
            {
                // 用戶未登入，所有小說的 IsLiked 屬性設置為 false
                foreach (var novel in novels)
                {
                    novel.IsLiked = false;
                }
            }

            return Ok(novels);
        }

        /// <summary>
        /// 根據NickName獲取該User的所有小說 (搜尋用)
        /// </summary>
        /// <param name="nickName">暱稱</param>
        /// <returns>特定作者的小說</returns>
        [HttpGet("authorName/{nickName}")]
        public async Task<IActionResult> GetNovelsByUserName([FromRoute] string nickName)
        {
            // 先找到該User
            var user = await _context.Users
                .Where(u => u.NickName == nickName)
                .FirstOrDefaultAsync();

            if(user == null) return NotFound("找不到該作者");

            var novels = await _context.Novels
                .Where(n => n.AuthorId == user.Id && !n.IsDeleted) // 根據UserId過濾並排除已刪除的小說
                .Include(n => n.User) // 包含User信息
                .ToListAsync();

            // 檢查用戶是否已登入
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 如果用戶已登入，獲取點讚信息
            if (int.TryParse(userIdClaim, out var userId) && userId > 0)
            {
                // 獲取用戶點讚過的小說ID集合
                var likedNovelIds = await _context.Likes
                    .Where(l => l.UserId == userId)
                    .Select(l => l.NovelId)
                    .ToListAsync();

                // 為每個小說添加是否已點讚的標誌
                foreach (var novel in novels)
                {
                    novel.IsLiked = likedNovelIds.Contains(novel.NovelId);
                }
            }
            else
            {
                // 用戶未登入，所有小說的 IsLiked 屬性設置為 false
                foreach (var novel in novels)
                {
                    novel.IsLiked = false;
                }
            }

            return Ok(novels);
        }

        /// <summary>
        /// 根據關鍵字搜尋文章 (搜尋用)
        /// </summary>
        /// <param name="keywords"></param>
        /// <returns>符合關鍵字的小說</returns>
        [HttpGet("keywords/{keywords}")]
        public async Task<IActionResult> GetNovelsByTitleKeyWords([FromRoute] string keywords)
        {
            if (string.IsNullOrEmpty(keywords))
            {
                return BadRequest("關鍵字不能是空的");
            }

            var novels = await _context.Novels
                .Where(n => n.Title.Contains(keywords) && !n.IsDeleted) // 根據關鍵字查找標題並排除已刪除的小說
                .ToListAsync();

            // 檢查用戶是否已登入
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // 如果用戶已登入，獲取點讚信息
            if (int.TryParse(userIdClaim, out var userId) && userId > 0)
            {
                // 獲取用戶點讚過的小說ID集合
                var likedNovelIds = await _context.Likes
                    .Where(l => l.UserId == userId)
                    .Select(l => l.NovelId)
                    .ToListAsync();

                // 為每個小說添加是否已點讚的標誌
                foreach (var novel in novels)
                {
                    novel.IsLiked = likedNovelIds.Contains(novel.NovelId);
                }
            }
            else
            {
                // 用戶未登入，所有小說的 IsLiked 屬性設置為 false
                foreach (var novel in novels)
                {
                    novel.IsLiked = false;
                }
            }

            return Ok(novels);
        }

        /// <summary>
        /// 創建新小說
        /// </summary>
        /// <param name="novel"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateNovel([FromBody] Novel novel)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("用戶未登錄");
            }

            novel.AuthorId = userId;

            await  _context.Novels.AddAsync(novel);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetNovels), new { id = novel.NovelId}, novel);
        }

        /// <summary>
        /// 更新小說
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updatedNovel"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateNovel([FromRoute] int id, [FromBody] Novel updatedNovel/*, [FromQuery] int userId*/)
        {
            if (id != updatedNovel.NovelId)
                return BadRequest("Novel ID mismatch");

            // 查要更新的小說
            var existingNovel = await _context.Novels
                .Include(n => n.User) // 包括User data
                .FirstOrDefaultAsync(n => n.NovelId == id);

            if (existingNovel == null)
                return NotFound("Novel not found");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // 確認作者Id跟userId是否一樣
            if (!int.TryParse(userIdClaim, out var userId) || existingNovel.AuthorId != userId)
                return Forbid("沒有權限更新小說");

            existingNovel.Title = updatedNovel.Title;
            existingNovel.Description = updatedNovel.Description;
            existingNovel.UpdatedAt = DateTime.Now;

            // 標記實體狀態為修改
            _context.Entry(existingNovel).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            // 返回 204 NoContent
            return NoContent();
        }

        /// <summary>
        /// 刪除小說
        /// </summary>
        /// <param name="id">NovelId</param>
        /// <param name="userId">UserId</param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteNovel([FromRoute] int id/*, [FromQuery]int userId*/)
        {
            var novel = await _context.Novels.FindAsync(id);
            if (novel == null) return NotFound("Novel not found");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId) || novel.AuthorId != userId)
                return Forbid("沒有權限刪除小說");

            novel.IsDeleted = true;
            novel.DeletedAt = DateTime.Now;

            _context.Update(novel);
            await _context.SaveChangesAsync();

            return NoContent(); 
        }

        /// <summary>
        /// 點讚小說記錄
        /// </summary>
        /// <param name="id">NovelId</param>
        /// <returns></returns>
        [HttpPost("{id}/like")]
        [Authorize]
        public async Task<IActionResult> LikeNovel([FromRoute] int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("用戶未登錄");

            var novel = await _context.Novels.FindAsync(id);
            if (novel == null) return NotFound("Novel not found");

            // 檢查用戶是否點過讚
            var existingLike = await _context.Likes.FirstOrDefaultAsync(l => l.NovelId == id && l.UserId == userId);
            if (existingLike != null)
            {
                // 如果已經點過讚, 則取消點讚
                _context.Likes.Remove(existingLike);
                novel.LikeCount--;
            }
            else
            {
                // 如果沒有點過讚, 則新增點讚記錄
                await _context.Likes.AddAsync(new Like
                {
                    NovelId = id,
                    UserId = userId,
                    CreateAt = DateTime.Now
                });
                novel.LikeCount++;
            }

            // 指定 novel 實體的 LikeCount 屬性為已修改
            _context.Entry(novel).Property(n => n.LikeCount).IsModified = true;
            await _context.SaveChangesAsync();

            return Ok(new { LikeCount = novel.LikeCount });
        }

        /// <summary>
        /// 記錄觀看API
        /// </summary>
        /// <param name="id">NovelId</param>
        /// <returns>OK</returns>
        [HttpPost("{id}/view")]
        [Authorize]
        public async Task<IActionResult> RecordView([FromRoute] int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
                return Unauthorized("用戶未登入");

            var novel = await _context.Novels.FindAsync(id);
            if (novel == null) return NotFound("Novel not found");


            await _novelService.RecordViewAsync(id, userId);
            return Ok();
        }
    }
}
