namespace BearNovelWebsiteApi.Models
{
    public class Comment
    {
        public int CommentId { get; set; }
        public int NovelId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // 導航屬性
        public Novel Novel { get; set; }
        public User User { get; set; }
    }
}
