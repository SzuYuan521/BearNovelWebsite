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

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _services.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                    var articlesToDelete = await context.Novels
                        .Where(a => a.IsDeleted && a.DeletedAt.HasValue && a.DeletedAt.Value.AddDays(Constants.NovelDeleteTime) < DateTime.Now)
                        .ToListAsync(stoppingToken);

                    context.Novels.RemoveRange(articlesToDelete);
                    await context.SaveChangesAsync(stoppingToken);
                }

                await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
            }
        }
    }
}
