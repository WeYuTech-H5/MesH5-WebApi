using Dapper;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web.Configuration;

namespace MESH5_WEBAPI_20250228V2.Services
{
    /// <summary>
    /// 提供登入狀態統計相關的資料存取與計算邏輯。
    /// </summary>
    public class LoginStatisticsService
    {
        private readonly string _connectionString;
        private readonly int _intervalMinutes;
        private readonly TimeSpan _sessionTimeout;

        public LoginStatisticsService()
        {
            _connectionString = ConfigurationManager.ConnectionStrings["WeYuConnection"].ConnectionString;

            var intervalSetting = ConfigurationManager.AppSettings["LoginStatisticsIntervalMinutes"];
            _intervalMinutes = int.TryParse(intervalSetting, out var minutes) && minutes > 0 ? minutes : 10;

            var sessionSection = (SessionStateSection)WebConfigurationManager.GetSection("system.web/sessionState");
            _sessionTimeout = sessionSection?.Timeout > TimeSpan.Zero ? sessionSection.Timeout : TimeSpan.FromMinutes(30);
        }

        /// <summary>
        /// 取得目前在線的人數（以 <c>USER_ID</c> 去重計算）。
        /// </summary>
        /// <remarks>
        /// 只計算未被標記為刪除且在 <see cref="_sessionTimeout"/> 期間內仍有活動的使用者，
        /// 可避免舊的 Session 紀錄影響結果。
        /// </remarks>
        /// <returns>目前在線的使用者人數。</returns>
        public int GetCurrentOnlineUserCount()
        {
            using (var conn = new SqlConnection(_connectionString))
            {
                var nowUtc = DatabaseTimeProvider.GetUtcNow(conn);
                var cutoff = nowUtc - _sessionTimeout;

                return conn.ExecuteScalar<int>(
                    @"SELECT COUNT(DISTINCT USER_ID)
                        FROM SEC_APP_SESSION_REGISTRY
                        WHERE LAST_SEEN_AT >= @cutoff
                          AND IS_DELETE = 0",
                    new { cutoff });
            }
        }

        /// <summary>
        /// 取得指定時間區間內的在線人數統計資料。
        /// </summary>
        public LoginStatisticsResult GetStatistics(DateTime start, DateTime end)
        {
            if (end < start)
            {
                throw new ArgumentException("end must be greater than or equal to start");
            }

            using (var conn = new SqlConnection(_connectionString))
            {
                var queryStart = start - _sessionTimeout;
                var rawSessions = conn.Query<SessionRecord>(
                    @"SELECT USER_ID AS UserId, LAST_SEEN_AT AS LastSeenAt
                          FROM SEC_APP_SESSION_REGISTRY
                          WHERE LAST_SEEN_AT BETWEEN @s AND @e
                          ORDER BY LAST_SEEN_AT",
                    new { s = queryStart, e = end }).ToList();

                var result = new LoginStatisticsResult
                {
                    Points = new List<LoginStatisticsPoint>()
                };

                var index = 0;  // 指標，指向 rawSessions（已排序）裡的紀錄，控制哪些紀錄已經處理過

                var active = new Dictionary<string, DateTime>();  // 「活躍清單」，key = USER_ID，value = 該使用者最後一次活動時間 

                var peakCount = 0;  // 記錄到目前為止的最大在線人數（尖峰值）

                var peakTime = start;  // 尖峰人數發生的時間點

                // 從 start 開始一路往 end 跑，每次跳 interval 分鐘（例如 10 分鐘）
                for (var t = start; t <= end; t = t.AddMinutes(_intervalMinutes))
                {
                    // 把這個時間點以前的新紀錄加進活躍清單
                    while (index < rawSessions.Count && rawSessions[index].LastSeenAt <= t)
                    {
                        var r = rawSessions[index];
                        active[r.UserId] = r.LastSeenAt; // 用 UserId 當 key ,如果同一人多筆紀錄，只保留最後一次活動時間
                        index++;  // 指標往後移，避免重複處理
                    }

                    // 計算過期線，移除已經 timeout 的人
                    var cutoff = t - _sessionTimeout;
                    // cutoff 之前沒有動作的人視為離線

                    var expired = active
                        .Where(kvp => kvp.Value < cutoff) // 找出已過期的人
                        .Select(kvp => kvp.Key)           // 只取 UserId
                        .ToList();

                    foreach (var user in expired)
                    {
                        active.Remove(user); // 從活躍清單移除
                    }

                    // Step 3: 計算當下在線人數
                    var count = active.Count;

                    // 記錄時間點和人數，丟進結果集（給前端畫圖用）
                    result.Points.Add(new LoginStatisticsPoint { Time = t, Count = count });

                    // Step 4: 更新尖峰資訊
                    if (count > peakCount)
                    {
                        peakCount = count;
                        peakTime = t;
                    }
                }

                // 迴圈結束，把尖峰統計結果填到回傳物件
                result.PeakCount = peakCount;
                result.PeakTime = peakTime;

                return result;

            }
        }

        private class SessionRecord
        {
            public string UserId { get; set; }
            public DateTime LastSeenAt { get; set; }
        }
    }

    public class LoginStatisticsResult
    {
        public List<LoginStatisticsPoint> Points { get; set; }
        public int PeakCount { get; set; }
        public DateTime PeakTime { get; set; }
    }

    public class LoginStatisticsPoint
    {
        public DateTime Time { get; set; }
        public int Count { get; set; }
    }
}
