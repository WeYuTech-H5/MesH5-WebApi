using System;
using System.Web;
using System.Web.Http;
using MESH5_WEBAPI_20250228V2.Services;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    /// <summary>
    /// 管理使用者 Session 的 API，例如登出。
    /// </summary>
    [RoutePrefix("api/session")]
    public class H5_LogoutController : ApiController
    {
        private readonly AppSessionRegistryRepository _repository = new AppSessionRegistryRepository();

        /// <summary>
        /// 登出：移除目前 Session 內的 SessionId / Token / Expiration，並註銷 DB 權杖
        /// </summary>
        [HttpPost]
        [Route("logout")]
        public IHttpActionResult Logout()
        {
            var ctx = HttpContext.Current;
            var session = ctx?.Session;

            Guid sid;
            var sidObj = session?["SessionId"];

            // 先刪 DB 
            if (sidObj != null && Guid.TryParse(sidObj.ToString(), out sid))
            {
                try { _repository.RemoveSession(sid); } catch { /*  */ }
            }

            // 清掉所有 Session 資料
            session.Remove("SessionId");
            session.Remove("Key");
            session.Remove("Expiration");
            session?.Clear();
            session?.RemoveAll();

            // Abandon：讓伺服器丟棄舊的 Session 物件並產生新 ID（防止重放）
            session?.Abandon();

            // 讓瀏覽器丟棄 Session Cookie
            var cookie = new HttpCookie("ASP.NET_SessionId", "")
            {
                Expires = DatabaseTimeProvider.GetUtcNow().AddDays(-1),
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Lax
            };
            ctx?.Response.Cookies.Add(cookie);

            return Ok(new { result = true });
        }

    }
}
