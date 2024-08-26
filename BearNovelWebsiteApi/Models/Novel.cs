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

        public User User { get; set; }
    }
}
