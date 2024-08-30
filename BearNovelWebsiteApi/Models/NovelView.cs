namespace BearNovelWebsiteApi.Models
{
    public class NovelView
    {
        public int NovelViewId { get; set; }
        public int NovelId { get; set; }
        public int UserId { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.Now; // 記錄觀看時間

        public Novel Novel { get; set; }
        public User User { get; set; }
    }
}
