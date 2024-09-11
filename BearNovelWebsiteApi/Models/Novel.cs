using System.ComponentModel.DataAnnotations.Schema;
using static BearNovelWebsiteApi.Constants;

namespace BearNovelWebsiteApi.Models
{
    public class Novel
    {
        public int NovelId { get; set; }
        public string Title { get; set;}
        public int AuthorId { get; set; }
        public string Description { get; set;} = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set;} = DateTime.Now;
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsEnding { get; set; }

        // 小說總觀看數
        public int ViewCount { get; set; } 

        // 點讚總觀看數
        public int LikeCount { get; set; }

        // 用於表示是否已點讚, 前端用, 不用回傳
        [NotMapped]
        public bool IsLiked { get; set; }

        public List<NovelType> NovelTypes { get; set; } = new List<NovelType>();

        public User User { get; set; }
        public ICollection<NovelView> NovelViews { get; set; }
    }
}
