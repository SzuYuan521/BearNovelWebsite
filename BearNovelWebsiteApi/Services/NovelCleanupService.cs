using Microsoft.EntityFrameworkCore;
using BearNovelWebsiteApi.Data;

namespace BearNovelWebsiteApi.Services
{
    public class NovelCleanupService : BackgroundService
    {
        private readonly IServiceProvider _services;

        public NovelCleanupService(IServiceProvider services)
        {
            _services = services;
        }

        /// <summary>
        /// 執行清理操作的主要方法, 這會在背景中運行, 並定期執行清理邏輯。
        /// </summary>
        /// <param name="stoppingToken">取消令牌, 用於停止服務</param>
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _services.CreateScope())
                {
                    // 獲取 ApplicationDbContext 實例
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    // 查詢所有符合刪除條件的小說
                    var articlesToDelete = await context.Novels
                        .Where(a => a.IsDeleted && a.DeletedAt.HasValue && a.DeletedAt.Value.AddDays(Constants.NovelDeleteTime) < DateTime.Now)
                        .ToListAsync(stoppingToken);

                    // 移除符合條件的小說
                    context.Novels.RemoveRange(articlesToDelete);
                    await context.SaveChangesAsync(stoppingToken);
                }

                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}
