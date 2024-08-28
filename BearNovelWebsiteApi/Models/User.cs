using Microsoft.AspNetCore.Identity;
using static BearNovelWebsiteApi.Constants;

namespace BearNovelWebsiteApi.Models
{
    public class User : IdentityUser<int>
    {
        public Role Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
