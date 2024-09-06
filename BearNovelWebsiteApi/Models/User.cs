using Microsoft.AspNetCore.Identity;
using static BearNovelWebsiteApi.Constants;

namespace BearNovelWebsiteApi.Models
{
    public class User : IdentityUser<int>
    {
        // 暱稱
        public string NickName { get; set; }


        // 大頭照
        public byte[]? ProfilePicture { get; set; } // 用於存儲大頭照的二進制數據

        public string? ProfilePictureContentType { get; set; } // 儲存圖片的類型

        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
