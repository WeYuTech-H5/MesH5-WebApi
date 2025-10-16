using Dapper;
using System;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

namespace MESH5_WEBAPI_20250228V2.Services
{
    /// <summary>
    /// 提供以資料庫為準的時間來源，避免應用伺服器與資料庫時間差。
    /// </summary>
    public static class DatabaseTimeProvider
    {
        private static readonly string _connectionString =
            ConfigurationManager.ConnectionStrings["WeYuConnection"].ConnectionString;

        /// <summary>
        /// 取得資料庫的 UTC 時間。
        /// </summary>
        /// <param name="connection">已開啟的連線，為空時會自行建立。</param>
        /// <param name="transaction">可選交易物件。</param>
        /// <returns>資料庫伺服器的 UTC 時間。</returns>
        public static DateTime GetUtcNow(IDbConnection connection = null, IDbTransaction transaction = null)
        {
            var dispose = false;
            if (connection == null)
            {
                connection = new SqlConnection(_connectionString);
                dispose = true;
            }

            try
            {
                if (connection.State != ConnectionState.Open)
                {
                    connection.Open();
                }

                return connection.ExecuteScalar<DateTime>(
                    "SELECT GETDATE()",
                    param: null,
                    transaction: transaction
                );
            }
            finally
            {
                if (dispose)
                {
                    connection.Dispose();
                }
            }
        }
    }
}
