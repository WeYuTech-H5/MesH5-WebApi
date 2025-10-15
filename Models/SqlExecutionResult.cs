using System.Collections.Generic;

namespace MESH5_WEBAPI_20250228V2.Models
{
    /// <summary>
    /// 表示一批 SQL 陳述式的交易化執行結果摘要。
    /// </summary>
    public class SqlExecutionResult
    {
        /// <summary>
        /// 取得或設定執行是否全部成功。
        /// </summary>
        /// <remarks>
        /// 當任一陳述式失敗並進行回滾時，此值為 <c>false</c>。
        /// </remarks>
        public bool Success { get; set; }

        /// <summary>
        /// 取得或設定本次嘗試執行的 SQL 陳述式總數。
        /// </summary>
        public int TotalStatements { get; set; }

        /// <summary>
        /// 取得或設定成功執行的總影響列數。
        /// </summary>
        public int TotalAffectedRows { get; set; }

        /// <summary>
        /// 取得或設定執行期間所蒐集的錯誤訊息清單。
        /// </summary>
        /// <remarks>
        /// 為避免洩漏敏感資訊，此清單僅應包含友善且可公開的錯誤描述。
        /// </remarks>
        public List<string> Errors { get; set; } = new List<string>();
    }
}
