using Microsoft.AspNetCore.Identity;
using static BearNovelWebsiteApi.Constants;

namespace BearNovelWebsiteApi.Models
{
    public class User : IdentityUser<int>
    {
        // 暱稱
        public string NickName { get; set; }
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
