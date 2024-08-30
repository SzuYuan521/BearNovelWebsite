﻿namespace BearNovelWebsiteApi
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
        public static int PopularNovelsCacheMinutes = 30;

        /// <summary>
        /// 日榜更新間隔時間
        /// </summary>
        public static int DailyRankingsUpdateDays = 1;
    }
}
