using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using Dapper;
using MESH5_WEBAPI_20250228V2.Models;

namespace MESH5_WEBAPI_20250228V2.Services
{
    /// <summary>
    /// 提供使用 Dapper 搭配 <see cref="SqlTransaction"/> 逐條執行 SQL 的服務實作。
    /// </summary>
    public class SqlExecutorService : ISqlExecutorService
    {
        private readonly string _connectionString;

        /// <summary>
        /// 建立 <see cref="SqlExecutorService"/> 類別的新執行個體。
        /// </summary>
        /// <remarks>
        /// 預設會從 <c>Web.config</c> 的 <c>WeYuConnection</c> 連線字串載入設定。
        /// </remarks>
        public SqlExecutorService()
            : this(ConfigurationManager.ConnectionStrings["WeYuConnection"]?.ConnectionString ??
                   throw new InvalidOperationException("Connection string 'WeYuConnection' is not configured."))
        {
        }

        /// <summary>
        /// 使用指定的連線字串建立 <see cref="SqlExecutorService"/> 實例。
        /// </summary>
        /// <param name="connectionString">資料庫連線字串。</param>
        public SqlExecutorService(string connectionString)
        {
            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new ArgumentException("Connection string cannot be null or whitespace.", nameof(connectionString));
            }

            _connectionString = connectionString;
        }

        /// <inheritdoc />
        public SqlExecutionResult ExecuteStatements(IEnumerable<string> sqlStatements)
        {
            if (sqlStatements == null)
            {
                throw new ArgumentNullException(nameof(sqlStatements));
            }

            var statements = sqlStatements
                .Where(statement => !string.IsNullOrWhiteSpace(statement))
                .Select(statement => statement.Trim())
                .ToList();

            if (statements.Count == 0)
            {
                return new SqlExecutionResult
                {
                    Success = true,
                    TotalStatements = 0,
                    TotalAffectedRows = 0
                };
            }

            using (var connection = new SqlConnection(_connectionString))
            {
                connection.Open();

                using (var transaction = connection.BeginTransaction())
                {
                    var result = new SqlExecutionResult
                    {
                        Success = true,
                        TotalStatements = statements.Count
                    };

                    var executedCount = 0;

                    try
                    {
                        for (var index = 0; index < statements.Count; index++)
                        {
                            var sql = statements[index];
                            var affectedRows = connection.Execute(sql, transaction: transaction);
                            result.TotalAffectedRows += affectedRows;
                            executedCount++;
                        }

                        transaction.Commit();
                    }
                    catch (Exception ex)
                    {
                        TryRollback(transaction);
                        result.Success = false;
                        var failedIndex = Math.Min(executedCount, statements.Count - 1);
                        result.Errors.Add($"Statement #{failedIndex + 1} failed ({ex.GetType().Name}): {ex.Message}");
                        result.TotalAffectedRows = 0;
                    }

                    return result;
                }
            }
        }

        private static void TryRollback(SqlTransaction transaction)
        {
            try
            {
                transaction?.Rollback();
            }
            catch
            {
                // 交易回滾失敗時不再拋例外，以免覆蓋原始錯誤訊息。
            }
        }
    }
}
