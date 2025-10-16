using Dapper;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web.Configuration;

namespace MESH5_WEBAPI_20250228V2.Services
{
    /// <summary>
    /// 管理 SEC_APP_SESSION_REGISTRY 的資料存取邏輯。
    /// </summary>
    public class AppSessionRegistryRepository
    {
        private readonly string _connectionString;
        private readonly int _maxOnlineUsers;
        private readonly TimeSpan _sessionTimeout; // 跟 sessionState 對齊

        public AppSessionRegistryRepository()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["WeYuConnection"].ConnectionString;

            // MaxOnlineUsers 照
            var maxUsersSetting = ConfigurationManager.AppSettings["MaxOnlineUsers"];
            _maxOnlineUsers = int.TryParse(maxUsersSetting, out var parsedMax) ? parsedMax : 5;

            // 從 <sessionState timeout="X"> 讀取
            var sessionSection = (SessionStateSection)WebConfigurationManager.GetSection("system.web/sessionState");
            // sessionSection.Timeout 是 TimeSpan
            _sessionTimeout = sessionSection?.Timeout > TimeSpan.Zero
                ? sessionSection.Timeout
                : TimeSpan.FromMinutes(30); 
        }

        /// <summary>
        /// 嘗試註冊新的登入 Session（以「人數」計），同一使用者已在線時即使滿人仍可新增（不增加人頭）
        /// </summary>
        /// <exception cref="InvalidOperationException">當「不同使用者」的人數已達上限時拋出。</exception>
        public Guid RegisterSession(string userId)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Open();
                using (var tx = conn.BeginTransaction(IsolationLevel.Serializable))
                {
                    var nowUtc = DatabaseTimeProvider.GetUtcNow(conn, tx);
                    var cutoff = nowUtc - _sessionTimeout;

                    // 1) 清掉過期（>20 分鐘未活躍）
                    conn.Execute(
                        @"UPDATE SEC_APP_SESSION_REGISTRY
                          SET IS_DELETE = 1
                          WHERE LAST_SEEN_AT < @cutoff AND IS_DELETE = 0",
                        new { cutoff }, tx);

                    // 2) 這位使用者是否已在線（活躍條件）
                    var existsActiveUser = conn.ExecuteScalar<int>(
                        @"SELECT COUNT(1)
                          FROM SEC_APP_SESSION_REGISTRY
                          WHERE USER_ID = @uid 
                            AND LAST_SEEN_AT >= @cutoff
                            AND IS_DELETE = 0",
                        new { uid = userId, cutoff }, tx) > 0;

                    // 3) 目前活躍「人數」（以人為單位，活躍條件）
                    var activeDistinctUsers = conn.ExecuteScalar<int>(
                        @"SELECT COUNT(DISTINCT USER_ID)
                          FROM SEC_APP_SESSION_REGISTRY
                          WHERE LAST_SEEN_AT >= @cutoff
                            AND IS_DELETE = 0",
                        new { cutoff }, tx);

                    // 4) 名額判斷：
                    //    - 若此使用者「不在裡面」且人數已滿，擋
                    //    - 若此使用者「已在裡面」，放行（人頭不變，只是多一筆該人的 session）
                    if (!existsActiveUser && activeDistinctUsers >= _maxOnlineUsers)
                    {
                        tx.Rollback();
                        throw new InvalidOperationException("Online user limit reached.");
                    }

                    // 5) 插入新 Session（允許同一 USER_ID 多裝置，多筆行）
                    var sessionId = Guid.NewGuid();
                    conn.Execute(
                        @"INSERT INTO SEC_APP_SESSION_REGISTRY (SESSION_ID, USER_ID, LAST_SEEN_AT, IS_DELETE)
                        VALUES (@sid, @uid, @nowUtc, 0)",
                        new { sid = sessionId, uid = userId, nowUtc }, tx);

                    tx.Commit();
                    return sessionId;
                }
            }
        }

        /// <summary>
        /// 每次 API 請求呼叫以滑動過期
        /// </summary>
        public void TouchSession(Guid sessionId)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                var nowUtc = DatabaseTimeProvider.GetUtcNow(conn);
                conn.Execute(
                    @"UPDATE SEC_APP_SESSION_REGISTRY
                      SET LAST_SEEN_AT = @nowUtc
                      WHERE SESSION_ID = @sid AND IS_DELETE = 0",
                    new { sid = sessionId, nowUtc });
            }
        }

        /// <summary>
        /// 登出：刪除指定 Session
        /// </summary>
        public void RemoveSession(Guid sessionId)
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                conn.Execute(
                    @"UPDATE SEC_APP_SESSION_REGISTRY
                      SET IS_DELETE = 1
                      WHERE SESSION_ID = @sid AND IS_DELETE = 0",
                    new { sid = sessionId });
            }
        }
    }
}
