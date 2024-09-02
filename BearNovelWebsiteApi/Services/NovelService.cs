using BearNovelWebsiteApi.Data;
using BearNovelWebsiteApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(Constants.PopularNovelsCacheMinutes) // 快取過期時間, 緩存30分鐘
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
