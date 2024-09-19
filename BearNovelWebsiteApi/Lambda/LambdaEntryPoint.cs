using Amazon.Lambda.AspNetCoreServer;

namespace BearNovelWebsiteApi.Lambda
{
    public class LambdaEntryPoint : APIGatewayHttpApiV2ProxyFunction
    {
        // 初始化 ASP.NET Core 應用程式的 WebHostBuilder
        protected override void Init(IWebHostBuilder builder)
        {
            builder.UseStartup<Program>();
        }
    }
}
