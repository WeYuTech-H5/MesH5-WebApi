using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using MESH5_WEBAPI_20250228V2.Services;

namespace MESH5_WEBAPI_20250228V2.Handlers
{
    /// <summary>
    /// 每次 API 請求時更新 Session 的最後存活時間。
    /// </summary>
    public class SessionActivityHandler : DelegatingHandler
    {
        private const string HeaderName = "X-Session-Id";
        private readonly AppSessionRegistryRepository _repository = new AppSessionRegistryRepository();

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            var session = System.Web.HttpContext.Current.Session;

            if (session["SessionId"] != null)
            {
                var sid = session["SessionId"].ToString();
                Guid sessionId;
                if (Guid.TryParse(sid, out sessionId))
                {
                    // 用這個 sessionId 去更新資料庫 (TouchSession)
                    _repository.TouchSession(sessionId);
                }
            }

            return await base.SendAsync(request, cancellationToken);
        }
    }
}
