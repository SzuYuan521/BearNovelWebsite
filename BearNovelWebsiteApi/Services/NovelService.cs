using BearNovelWebsiteApi.Data;
using Microsoft.AspNetCore.Authorization;
using BearNovelWebsiteApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System.Security.Claims;

namespace BearNovelWebsiteApi.Services
{
    public class NovelService
    {
        private readonly ApplicationDbContext _context;
        private readonly IDistributedCache _cache;

        public NovelService(ApplicationDbContext context, IDistributedCache cache)
        {
            _context = context;
            _cache = cache;
        }

        /// <summary>
        /// 取得所有小說並處理點讚信息
        /// </summary>
        /// <returns>包含所有小說及其點讚狀態的列表</returns>
        public async Task<List<Novel>> GetAllNovelsAsync(int? userId)
        {
            var cacheKey = Constants.NovelCacheKey;
            List<Novel> novels;

            try
            {
                var cachedDataNovels = await _cache.GetStringAsync(cacheKey);
                if (cachedDataNovels != null)
                {
                    // 從緩存中取得所有小說
                    novels = JsonConvert.DeserializeObject<List<Novel>>(cachedDataNovels);
                }
                else
                {
                    // 從資料庫中獲取所有小說, 包括每個小說的作者
                    novels = await _context.Novels
                        .Where(n => !n.IsDeleted)
                        .Include(n => n.User)
                        .ToListAsync();

                    // 獲取所有小說的點讚數量
                    var novelLikeCounts = await _context.Likes
                        .GroupBy(l => l.NovelId)
                        .Select(g => new { NovelId = g.Key, LikeCount = g.Count() })
                        .ToDictionaryAsync(x => x.NovelId, x => x.LikeCount);

                    // 更新小說的點讚數量
                    foreach (var novel in novels)
                    {
                        novel.LikeCount = novelLikeCounts.TryGetValue(novel.NovelId, out var count) ? count : 0;
                    }

                    var cacheOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(Constants.NovelsCacheMinutes),
                    };
                    await _cache.SetStringAsync(cacheKey, JsonConvert.SerializeObject(novels), cacheOptions);
                }

                // 處理點讚信息
                await SetLikeStatusForNovels(novels, userId);

                return novels;
            }
            catch (Exception ex)
            {
                throw new Exception("取不到 novels", ex);
            }
        }

        /// <summary>
        /// 設置小說的點讚狀態
        /// </summary>
        /// <param name="novels">小說列表</param>
        public async Task SetLikeStatusForNovels(List<Novel> novels, int? userId)
        {
            if (userId.HasValue && userId.Value > 0)
            {
                List<int> likedNovelIds = await GetNovelLikeStatus(userId.Value);

                foreach (var novel in novels)
                {
                    novel.IsLiked = likedNovelIds.Contains(novel.NovelId);
                }
            }
            else
            {
                foreach (var novel in novels)
                {
                    novel.IsLiked = false;
                }
            }
        }

        /// <summary>
        /// 獲取用戶點讚的小說ID列表
        /// </summary>
        /// <param name="userId">用戶ID</param>
        /// <returns>用戶點讚的小說ID列表</returns>
        public async Task<List<int>> GetNovelLikeStatus(int userId)
        {
            var cacheKeyLikes = $"UserLikes_{userId}";
            List<int> likedNovelIds;

            try
            {
                var cachedLikesData = await _cache.GetStringAsync(cacheKeyLikes);

                if (cachedLikesData != null)
                {
                    likedNovelIds = JsonConvert.DeserializeObject<List<int>>(cachedLikesData);
                }
                else
                {
                    // 獲取用戶點讚過的小說ID集合
                    likedNovelIds = await _context.Likes
                        .Where(l => l.UserId == userId)
                        .Select(l => l.NovelId)
                        .ToListAsync();

                    var cacheOptions = new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 過期時間
                    };

                    await _cache.SetStringAsync(cacheKeyLikes, JsonConvert.SerializeObject(likedNovelIds), cacheOptions);
                }

                return likedNovelIds;
            }
            catch (Exception ex)
            {
                throw new Exception("取不到 Novel like status", ex);
            }        
        }

        /// <summary>
        /// 記錄小說觀看次數
        /// </summary>
        /// <param name="novelId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        public async Task RecordViewAsync(int novelId, int userId)
        {
            var existingView = await _context.NovelViews
                .FirstOrDefaultAsync(nv => nv.NovelId == novelId && nv.UserId == userId);

            if (existingView == null)
            {
                var view = new NovelView
                {
                    NovelId = novelId,
                    UserId = userId,
                    ViewedAt = DateTime.Now
                };

                await _context.NovelViews.AddAsync(view);

                // 更新小說的觀看次數
                var novel = await _context.Novels.FindAsync(novelId);
                if (novel != null)
                {
                    novel.ViewCount++;
                    _context.Entry(novel).Property(n => n.ViewCount).IsModified = true;
                }
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// 獲取熱門小說
        /// </summary>
        /// <returns></returns>
        public async Task<List<Novel>> GetPopularNovelsAsync()
        {
            var cacheKey = "PopularNovels";
            var cachedNovels = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedNovels))
            {
                return JsonConvert.DeserializeObject<List<Novel>>(cachedNovels);
            }

            var popularNovels = await _context.Novels
                .OrderByDescending(n => n.ViewCount) // 根據總觀看次數排序
                .Take(Constants.PopularNovelsRankingCount) // 取前10本熱門小說
                .ToListAsync();

            // 緩存到Redis
            var serializedNovels = JsonConvert.SerializeObject(popularNovels);
            await _cache.SetStringAsync(cacheKey, serializedNovels, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(Constants.NovelsCacheMinutes) // 快取過期時間, 緩存30分鐘
            });

            return popularNovels;
        }

        /// <summary>
        /// 更新排行榜日榜
        /// </summary>
        /// <returns></returns>
        public async Task UpdateDailyRankingsAsync()
        {
            // 日榜
            // 權重: 點讚數*2, 觀看數*1
            var dailyRankings = await _context.Novels
                .Select(n => new
                {
                    Novel = n,
                    // 用(data建立時間-現在時間), 計算前一天的觀看次數跟點讚次數
                    TotalViews = _context.NovelViews.Count(v => v.NovelId == n.NovelId && EF.Functions.DateDiffDay(v.ViewedAt, DateTime.Now) == 1),
                    TotalLikes = _context.Likes.Count(l => l.NovelId == n.NovelId && EF.Functions.DateDiffDay(l.CreateAt, DateTime.Now) == 1)
                })
                .OrderByDescending(r => r.TotalViews + r.TotalLikes * 2)
                .ToListAsync();

            // 更新排行榜緩存
            var cacheKey = "DailyRankings";
            // 排名結果轉成json
            var serializedRankings = JsonConvert.SerializeObject(dailyRankings);
            // 緩存到redis並設定過期時間
            await _cache.SetStringAsync(cacheKey, serializedRankings, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(Constants.DailyRankingsUpdateDays) // 每天更新
            });
        }
    }
}
