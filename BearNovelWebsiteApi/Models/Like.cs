namespace BearNovelWebsiteApi.Models
{
    public class Like
    {
        public int LikeId { get; set; }
        public int NovelId { get; set; }
        public int UserId { get; set; }
        public DateTime CreateAt { get; set; } = DateTime.Now;

        public Novel Novel { get; set; }
        public User User { get; set; }
    }
}
