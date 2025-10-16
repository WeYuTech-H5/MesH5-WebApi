using System.Collections.Generic;
using MESH5_WEBAPI_20250228V2.Models;

namespace MESH5_WEBAPI_20250228V2.Services
{
    /// <summary>
    /// 定義將 SQL 陳述式集合以交易機制執行的服務合約。
    /// </summary>
    public interface ISqlExecutorService
    {
        /// <summary>
        /// 以單一交易逐條執行指定的 SQL 陳述式。
        /// </summary>
        /// <param name="sqlStatements">欲執行的 SQL 陳述式序列。</param>
        /// <returns>包含執行摘要資訊的 <see cref="SqlExecutionResult"/>。</returns>
        SqlExecutionResult ExecuteStatements(IEnumerable<string> sqlStatements);
    }
}
