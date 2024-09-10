namespace BearNovelWebsiteApi
{
    public class Constants
    {
        /// <summary>
        /// 管理User role
        /// </summary>
        public enum Role
        {
            User, // 一般用戶
            VIP, // VIP
            Admin // 管理員
        }

        /// <summary>
        /// 小說的類型(用來篩選)
        /// </summary>
        public enum NovelType
        {
            Romance, // 戀愛言情
            Ancient, // 古代
            Doomsday, // 末日
            ScienceFiction, // 科幻
            Campus, // 校園
            MartialArts, // 武俠修仙
            System, // 系統
            RichFamily, // 豪門
            TimeTravel, // 穿越
            Rebirth, // 重生
            Suspense, // 懸疑
            Supernatural, // 靈異
            Imaginary, // 架空
            BL, // 男同性戀
            Lesbian, // 女同性戀
            CuteBaby, // 萌寶
        }

        public static string NovelCacheKey = "AllNovels";

        /// <summary>
        /// 小說刪除後保留天數
        /// </summary>
        public static int NovelDeleteTime = 7;

        /// <summary>
        /// 熱門小說取的小說數量
        /// </summary>
        public static int PopularNovelsRankingCount = 10;

        /// <summary>
        /// 熱門小說緩存時間
        /// </summary>
        public static int NovelsCacheMinutes = 30;

        /// <summary>
        /// 日榜更新間隔時間
        /// </summary>
        public static int DailyRankingsUpdateDays = 1;
    }
}
