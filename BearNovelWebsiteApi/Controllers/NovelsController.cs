using BearNovelWebsiteApi.Data;
using BearNovelWebsiteApi.Models;
using BearNovelWebsiteApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Security.Claims;
using static BearNovelWebsiteApi.Constants;
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
        private readonly IMemoryCache _memoryCache;

        public NovelsController(ApplicationDbContext context, NovelService novelService, IDistributedCache cache, IMemoryCache memoryCache)
        {
            _context = context;
            _novelService = novelService;
            _cache = cache;
            _memoryCache = memoryCache;
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
        /// 根據 NovelId 取得資料
        /// </summary>
        /// <param name="novelId"></param>
        /// <returns></returns>
        [HttpGet("{novelId}")]
        public async Task<IActionResult> GetNovel([FromRoute] int novelId)
        {
            try
            {
                var novel = await _context.Novels
                    .Include(n => n.User) // 包括作者資訊
                    .FirstOrDefaultAsync(n => n.NovelId == novelId);

                if (novel == null)
                {
                    return NotFound();
                }

                // 只取得章節的 ChapterId, ChapterNumber, Title
                var chapters = await _context.Chapters
                    .Where(c => c.NovelId == novelId)
                    .Select(c => new
                    {
                        c.ChapterId,
                        c.ChapterNumber,
                        c.Title,
                        c.UpdatedAt
                    })
                    .ToListAsync();

                var result = new
                {
                    Novel = novel,
                    Chapters = chapters
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "伺服器錯誤，請稍後再試。");
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
        /// 獲取當前使用者創建的所有小說
        /// </summary>
        /// <returns>當前使用者的小說列表</returns>
        [HttpGet("my-novels")]
        [Authorize]
        public async Task<IActionResult> GetMyNovels()
        {
            List<Novel> novels;

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                int? userId = int.TryParse(userIdClaim, out var id) ? (int?)id : null;

                novels = await _novelService.GetAllNovelsAsync(userId);

                var filteredNovels = novels.Where(n => n.AuthorId == userId);

                return Ok(filteredNovels);
            }
            catch (Exception ex)
            {
                // 返回 500 Internal Server Error & 詳細錯誤
                return Problem(
                    detail: ex.Message,
                    statusCode: StatusCodes.Status500InternalServerError,
                    title: $"無法獲取自己的小說"
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

        /// <summary>
        /// 創建新小說
        /// </summary>
        /// <param name="novel"></param>
        /// <returns></returns>
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateNovel([FromBody] CreateNovelData createData)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("用戶未登錄");
            }

            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Unauthorized("找不到用戶");
            }

            List<NovelType> novelTypeList = new List<NovelType>();

            foreach (var typeString in createData.NovelTypes)
            {
                if (Enum.TryParse(typeString, out NovelType result))
                {
                    novelTypeList.Add(result);
                }
                else
                {
                    Debug.WriteLine($"'{typeString}' 是無效的 NovelType");
                }
            }

            var novel = new Novel
            {
                AuthorId = userId,
                Title = createData.NovelTitle,
                NovelTypes = novelTypeList,
                User = user
            };

            try
            {
                await _context.Novels.AddAsync(novel);
                await _context.SaveChangesAsync();
                await _cache.RemoveAsync(Constants.NovelCacheKey);
            }
            catch (DbUpdateException dbEx)
            {
                Debug.WriteLine($"資料庫更新錯誤: {dbEx.Message}");
                Debug.WriteLine(dbEx.InnerException?.Message);
                return StatusCode(500, "伺服器內部錯誤，請檢查資料庫配置。");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"新增小說時發生錯誤: {ex.Message}");
                return StatusCode(500, "伺服器內部錯誤，請稍後再試");
            }

            return CreatedAtAction(nameof(GetNovels), new { id = novel.NovelId }, novel);
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
        /// 檢查用戶是不是該小說作者
        /// </summary>
        /// <param name="novelId"></param>
        /// <returns></returns>
        [HttpGet("{novelId}/check-author")]
        public async Task<IActionResult> CheckAuthor(int novelId)
        {
            var novel = await _context.Novels.FindAsync(novelId);
            if (novel == null)
            {
                return NotFound(); // Novel not found
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("userId無效"); // 無效的userId
            }

            if (novel.AuthorId != userId)
            {
                return Forbid("沒有權限刪除小說");
            }

            return Ok(new { isAuthor = true });
        }

        /// <summary>
        /// 點讚小說記錄 (之後要實作使用 Redis 緩存點讚數據,並定期將緩存數據同步到主數據庫)
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

            // 從緩存中獲取小說資料
            var cacheKey = Constants.NovelCacheKey;
            var cachedDataNovels = await _cache.GetStringAsync(cacheKey);
            if (cachedDataNovels == null)
                return StatusCode(StatusCodes.Status500InternalServerError, "緩存數據丟失");


            // var novel = await _context.Novels.FindAsync(id);
            var novels = JsonConvert.DeserializeObject<List<Novel>>(cachedDataNovels);
            var novel = novels.FirstOrDefault(n => n.NovelId == id);
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
        public async Task<IActionResult> CreateChapter(int novelId, [FromBody] string chapterTitle)
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

            if (string.IsNullOrEmpty(chapterTitle))
            {
                return BadRequest("章節標題是必填項。");
            }

            // 根據小說的現有章節數量決定新章節的順序
            var existingChapters = await _context.Chapters
                .Where(c => c.NovelId == novelId)
                .OrderBy(c => c.ChapterNumber)
                .ToListAsync();

            var chapter = new Chapter
            {
                NovelId = novelId,
                ChapterNumber = existingChapters.Count + 1,
                Title = chapterTitle,
                Content = string.Empty,
                WordCount = 0,
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
        /// 取章節分頁
        /// </summary>
        /// <param name="novelId"></param>
        /// <param name="page">第n頁</param>
        /// <param name="pageSize">預設10個一頁</param>
        /// <returns></returns>
        [HttpGet("{novelId}/chapterlist")]
        public async Task<IActionResult> GetChapterList(int novelId, int page = 1, int pageSize = 10)
        {
            var cacheKey = $"novel_{novelId}___chapters_page_{page}";

            if (!_memoryCache.TryGetValue(cacheKey, out List<ChapterDto> chapters))
            {
                chapters = await _novelService.GetChaptersAsync(novelId, page, pageSize);
                var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(10));
                _memoryCache.Set(cacheKey, chapters, cacheEntryOptions);
            }

            return Ok(chapters);
        }

        /// <summary>
        /// 取小說章節
        /// </summary>
        /// <param name="novelId"></param>
        /// <param name="chapterId"></param>
        /// <returns></returns>
        [HttpGet("{novelId}/chapters/{chapterId}")]
        public async Task<IActionResult> GetChapterContent(int novelId, int chapterId)
        {
            var cacheKey = $"novel_{novelId}_chapter_{chapterId}_content";

            if (!_memoryCache.TryGetValue(cacheKey, out string content))
            {
                content = await _novelService.GetChapterContentAsync(novelId, chapterId);
                var cacheEntryOptions = new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(Constants.NovelsCacheMinutes));
                _memoryCache.Set(cacheKey, content, cacheEntryOptions);
            }

            return Ok(new { content });
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

            existingChapter.WordCount = GetPlainTextLength(updatedData.ChapterContent);

            // 更新章節的修改時間
            existingChapter.UpdatedAt = DateTime.Now;

            var novel = existingChapter.Novel;

            // 更新小說的總字數
            var totalWordCount = await _context.Chapters
                .Where(c => c.NovelId == novel.NovelId && c.ChapterId != chapterId)
                .SumAsync(c => c.WordCount);

            novel.TotalWordCount = totalWordCount + existingChapter.WordCount;

            // 將章節標記為修改狀態
            _context.Update(existingChapter);
            _context.Novels.Update(novel);
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

                var novel = existingChapter.Novel;
                novel.TotalWordCount -= existingChapter.WordCount;

                _context.Remove(existingChapter);
                _context.Novels.Update(novel);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, "刪除章節時發生錯誤");
            }
        }

        [HttpGet("{novelId}/all-chapters")]
        public async Task<IActionResult> GetAllChapters([FromRoute] int novelId)
        {
            var chapters = await _context.Chapters.Where(c=>c.NovelId == novelId).ToListAsync(); ;
            return Ok(chapters);
        }

        /// <summary>
        /// 依照 draft.js 的文本儲存格式取出章節內文
        /// </summary>
        /// <param name="jsonContent"></param>
        /// <returns></returns>
        public int GetPlainTextLength(string jsonContent)
        {
            if (string.IsNullOrEmpty(jsonContent)) return 0;
            try
            {
                var content = JsonConvert.DeserializeObject<Content>(jsonContent);
                return content?.Blocks.Sum(b => b.Text.Length) ?? 0;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"解析 JSON 內容失敗: {ex.Message}");
                return 0;
            }
        }
    }


    public class CreateNovelData
    {
        public string NovelTitle { get; set; }
        public List<string> NovelTypes { get; set; } = new List<string>();
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

    public class ChapterDto
    {
        public int ChapterId { get; set; }
        public string Title { get; set; }
        public int ChapterNumber { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class Content
    {
        [JsonProperty("blocks")]
        public Block[] Blocks { get; set; }

        [JsonProperty("entityMap")]
        public object EntityMap { get; set; }
    }

    public class Block
    {
        [JsonProperty("text")]
        public string Text { get; set; }

        [JsonProperty("type")]
        public string Type { get; set; }
    }
}
