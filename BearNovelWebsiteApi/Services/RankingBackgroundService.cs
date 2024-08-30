using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using BearNovelWebsiteApi.Services;

namespace BearNovelWebsiteApi.Services
{
    public class RankingBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RankingBackgroundService> _logger;

        public RankingBackgroundService(IServiceProvider serviceProvider, ILogger<RankingBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // 每24小時運行一次
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var novelService = scope.ServiceProvider.GetRequiredService<NovelService>();
                        await novelService.UpdateDailyRankingsAsync();
                    }
                    _logger.LogInformation("排行榜日榜更新");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "排行榜日榜更新錯誤");
                }

                // 設定更新間隔為24小時
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}
