namespace BearNovelWebsiteApi.Models
{
    public class Novel
    {
        public int NovelId { get; set; }
        public string Title { get; set;}
        public int AuthorId { get; set; }
        public string Description { get; set;}
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set;} = DateTime.Now;
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        // 小說總觀看數
        public int ViewCount { get; set; } 

        // 點讚總觀看數
        public int LikeCount { get; set; }

        public User User { get; set; }
        public ICollection<NovelView> NovelViews { get; set; }
    }
}
