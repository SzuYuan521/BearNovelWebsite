using BearNovelWebsiteApi.Data;
using BearNovelWebsiteApi.Models;
using BearNovelWebsiteApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System.Security.Claims;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace BearNovelWebsiteApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NovelsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly NovelService _novelService;
        private readonly IDistributedCache _cache;

        public NovelsController(ApplicationDbContext context, NovelService novelService, IDistributedCache cache)
        {
            _context = context;
            _novelService = novelService;
            _cache = cache;
        }

        /// <summary>
        /// 取得所有小說, 包括每個小說的作者
        /// </summary>
        /// <returns>所有小說data</returns>
        [HttpGet]
        public async Task<IActionResult> GetNovels()
        {
            List<Novel> novels;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? (int?)id : null;

                novels = await _novelService.GetAllNovelsAsync(userId);

                return Ok(novels);
            }
            catch (Exception ex) {

                // 返回 500 Internal Server Error & 詳細錯誤
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: "無法獲取小說列表"
                );
            }
        }

        /// <summary>
        /// 根據UserId獲取該User的所有小說 (對特定作者感興趣時)
        /// </summary>
        /// <param name="userId">userId</param>
        /// <returns>指定作者的小說data</returns>
        [HttpGet("user/{authorId}")]
        public async Task<IActionResult> GetNovelsByUserId([FromRoute] int authorId)
        {
            List<Novel> novels;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? (int?)id : null;

                novels = await _novelService.GetAllNovelsAsync(userId);

                var filteredNovels = novels.Where(n => n.AuthorId == authorId);

                return Ok(filteredNovels);
            }
            catch (Exception ex)
            {
                // 返回 500 Internal Server Error & 詳細錯誤
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: $"無法獲取作者為{authorId}的小說列表"
                );
            }
        }

        /// <summary>
        /// 根據NickName獲取該User的所有小說 (搜尋用)
        /// </summary>
        /// <param name="nickName">暱稱</param>
        /// <returns>特定作者的小說</returns>
        [HttpGet("authorName/{nickName}")]
        public async Task<IActionResult> GetNovelsByNickName([FromRoute] string nickName)
        {
            List<Novel> novels;

            try
            {
                var authorUserId = await _context.Users
                    .Where(u => u.NickName == nickName)
                    .Select(u => u.Id)
                    .FirstOrDefaultAsync();

                if (authorUserId == 0)
                {
                    return NotFound($"未找到暱稱為 {nickName} 的用戶");
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? (int?)id : null;

                novels = await _novelService.GetAllNovelsAsync(userId);

                var filteredNovels = novels.Where(n => n.AuthorId == authorUserId).ToList();

                return Ok(filteredNovels);
            }
            catch (Exception ex)
            {
                // 返回 500 Internal Server Error & 詳細錯誤
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: $"無法獲取作者為{nickName}的小說列表"
                );
            }
        }

        /// <summary>
        /// 根據關鍵字搜尋小說 (搜尋用)
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

            List<Novel> novels;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? (int?)id : null;

                novels = await _novelService.GetAllNovelsAsync(userId);

                var filteredNovels = novels.Where(n => n.Title.Contains(keywords));

                return Ok(filteredNovels);
            }
            catch (Exception ex)
            {
                // 返回 500 Internal Server Error & 詳細錯誤
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: $"無法獲取關鍵字為{keywords}的小說列表"
                );
            }
        }

        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetNovelsByType([FromRoute] Constants.NovelType type)
        {
            List<Novel> novels;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? (int?)id : null;

                novels = await _novelService.GetAllNovelsAsync(userId);

                var filteredNovels = novels.Where(n => n.NovelTypes.Contains(type));

                return Ok(filteredNovels);
            }
            catch (Exception ex)
            {
                // 返回 500 Internal Server Error & 詳細錯誤
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: $"無法獲取{type}小說列表"
                );
            }
        }

        /// <summary>
        /// 創建新小說
        /// </summary>
        /// <param name="novel"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateNovel([FromBody] CreateNovelData createData)
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

            var novel = new Novel
            {
                AuthorId = userId,
                Title = createData.NovelTitle,
                Description = createData.NovelDescription,
            };


            await  _context.Novels.AddAsync(novel);
            await _context.SaveChangesAsync();

            await _cache.RemoveAsync(Constants.NovelCacheKey);

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
        public async Task<IActionResult> UpdateNovel([FromRoute] int id, [FromBody] UpdateNovelData updateData)
        {
            if (id != updateData.NovelId)
                return BadRequest("Novel ID mismatch");

            // 查要更新的小說
            var existingNovel = await _context.Novels
                .Include(n => n.User)
                .FirstOrDefaultAsync(n => n.NovelId == id);

            if (existingNovel == null)
                return NotFound("Novel not found");

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // 確認作者Id跟userId是否一樣
            if (!int.TryParse(userIdClaim, out var userId) || existingNovel.AuthorId != userId)
                return Forbid("沒有權限更新小說");

            existingNovel.Title = updateData.NovelTitle;
            existingNovel.Description = updateData.NovelDescription;
            existingNovel.IsEnding = updateData.IsEnding;
            existingNovel.UpdatedAt = DateTime.Now;

            // 標記實體狀態為修改
            _context.Update(existingNovel);
            await _context.SaveChangesAsync();

            await _cache.RemoveAsync(Constants.NovelCacheKey);

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
        public async Task<IActionResult> DeleteNovel([FromRoute] int id)
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

            await _cache.RemoveAsync(Constants.NovelCacheKey);

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
            bool isLiked = false;

            if (existingLike != null)
            {
                // 如果已經點過讚, 則取消點讚
                _context.Likes.Remove(existingLike);
                novel.LikeCount--;
                isLiked = false;
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
                isLiked = true;
            }

            // 指定 novel 實體的 LikeCount 屬性為已修改
            _context.Entry(novel).Property(n => n.LikeCount).IsModified = true;
            await _context.SaveChangesAsync();

            // 更新user點讚信息緩存
            var cacheKeyLikes = $"UserLikes_{userId}";
            var likedNovelIds = await _novelService.GetNovelLikeStatus(userId);
            if (isLiked)
            {
                likedNovelIds.Add(id);
            }
            else
            {
                likedNovelIds.Remove(id);
            }

            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(Constants.NovelsCacheMinutes)
            };
            await _cache.SetStringAsync(cacheKeyLikes, JsonConvert.SerializeObject(likedNovelIds), cacheOptions);

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

        /// <summary>
        /// 根據 NovelId 創建新章節
        /// </summary>
        /// <param name="novelId">NovelId</param>
        /// <param name="chapter">章節內容</param>
        /// <returns>新章節的訊息</returns>
        [HttpPost("{novelId}/chapters")]
        [Authorize]
        public async Task<IActionResult> CreateChapter(int novelId, [FromBody] ChapterData data)
        {
            // 確認小說是否存在
            var novel = await _context.Novels.FindAsync(novelId);
            if (novel == null)
            {
                return NotFound("找不到指定的小說");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId) || novel.AuthorId != userId)
            {
                return Forbid("沒有權限新增章節");
            }

            // 根據小說的現有章節數量決定新章節的順序
            var existingChapters = await _context.Chapters
                .Where(c => c.NovelId == novelId)
                .OrderBy(c => c.ChapterNumber)
                .ToListAsync();

            var chapter = new Chapter
            {
                NovelId = novelId,
                ChapterNumber = existingChapters.Count+1,
                Title = data.ChapterTitle,
                Content = data.ChapterContent,
            };

            // 新增章節
            _context.Chapters.Add(chapter);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetChapter), new { chapterId = chapter.ChapterId }, chapter);
        }

        /// <summary>
        /// 根據章節ID取得章節
        /// </summary>
        /// <param name="chapterId">章節ID</param>
        /// <returns>章節資料</returns>
        [HttpGet("chapters/{chapterId}")]
        public async Task<IActionResult> GetChapter(int chapterId)
        {
            var chapter = await _context.Chapters
                .Include(c => c.Novel)
                .FirstOrDefaultAsync(c => c.ChapterId == chapterId);

            if (chapter == null)
            {
                return NotFound("找不到該章節");
            }

            return Ok(chapter);
        }

        /// <summary>
        /// 更新章節標題和內容
        /// </summary>
        /// <param name="chapterId">章節ID</param>
        /// <param name="updatedChapter">更新後的章節資料</param>
        /// <returns>更新結果</returns>
        [HttpPut("chapter/{chapterId}")]
        [Authorize]
        public async Task<IActionResult> UpdateChapter([FromRoute] int chapterId, [FromBody] ChapterData updatedData)
        {
            // 驗證更新的章節資料是否符合模型要求
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // 查找需要更新的章節
            var existingChapter = await _context.Chapters
                .Include(c => c.Novel) // 包含小說資料，用於檢查作者權限
                .FirstOrDefaultAsync(c => c.ChapterId == chapterId);

            if (existingChapter == null)
            {
                return NotFound("章節不存在");
            }

            // 確認用戶是否為該小說的作者
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId) || existingChapter.Novel.AuthorId != userId)
            {
                return Forbid("沒有權限編輯章節");
            }

            // 更新章節的標題和內容
            existingChapter.Title = updatedData.ChapterTitle;
            existingChapter.Content = updatedData.ChapterContent;

            // 更新章節的修改時間
            existingChapter.UpdatedAt = DateTime.Now;

            // 將章節標記為修改狀態
            _context.Update(existingChapter);
            await _context.SaveChangesAsync();

            // 返回204 NoContent
            return NoContent();
        }

        [HttpDelete("chapter/{chapterId}")]
        [Authorize]
        public async Task<IActionResult> DeleteChapter([FromRoute] int chapterId)
        {
            try
            {
                // 查找需要刪除的章節
                var existingChapter = await _context.Chapters
                    .Include(c => c.Novel) // 包含小說資料，用於檢查作者權限
                    .FirstOrDefaultAsync(c => c.ChapterId == chapterId);

                if (existingChapter == null)
                {
                    return NotFound("章節不存在");
                }

                // 確認用戶是否為該小說的作者
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!int.TryParse(userIdClaim, out var userId) || existingChapter.Novel.AuthorId != userId)
                {
                    return Forbid("沒有權限編輯章節");
                }

                _context.Remove(existingChapter);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "刪除章節時發生錯誤");
            }
        }
    }

    public class CreateNovelData
    {
        public string NovelTitle { get; set; }
        public string NovelDescription { get; set; }
    }

    public class UpdateNovelData
    {
        public int NovelId { get; set; }
        public string NovelTitle { get; set; }
        public string NovelDescription { get; set; }
        public bool IsEnding { get; set; }
    }

    public class ChapterData
    {
        public string ChapterTitle { get; set; }
        public string ChapterContent { get; set; }
    }
}
