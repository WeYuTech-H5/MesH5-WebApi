using System;
using System.Configuration;
using System.Web;

namespace MESH5_WEBAPI_20250228V2.Helper
{
    /// <summary>
    /// 安全地更新使用者 Session 內的 Token 與 Expiration
    /// </summary>
    public static class SessionHelper
    {
        private static readonly object _lock = new object();

        /// <summary>
        /// 更新 Token，Expiration = 現在時間 + Web.config 設定的 TokenKeyTime
        /// </summary>
        /// <param name="token">從 WeYuSEC_H5S 取得的 Token</param>
        public static void UpdateToken(WeYuSEC_H5S.WeyuToken token)
        {
            var session = HttpContext.Current?.Session;
            if (session == null) return;

            int tokenKeyMinutes = GetTokenKeyTime();
            DateTime adjustedExpiration = DateTime.Now.AddMinutes(tokenKeyMinutes);

            lock (_lock)
            {
                session["Key"] = token.Key;
                session["Expiration"] = adjustedExpiration.ToString("yyyy-MM-dd HH:mm:ss");
            }
        }

        /// <summary>
        /// 從 Web.config 抓取 TokenKeyTime，若失敗則回傳預設值 10 分鐘
        /// </summary>
        private static int GetTokenKeyTime()
        {
            string value = ConfigurationManager.AppSettings["TokenKeyTime"];
            if (int.TryParse(value, out int minutes) && minutes > 0)
            {
                return minutes;
            }
            return 10; // fallback 預設 10 分鐘
        }
    }
}