using Newtonsoft.Json;

namespace BearNovelWebsiteApi.Models
{
    public class Chapter
    {
        public int ChapterId { get; set; }
        public int NovelId { get; set; }
        public int ChapterNumber { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public int WordCount { get; set; }

        // 導航屬性
        [JsonIgnore]
        public Novel Novel { get; set; }
    }
}
