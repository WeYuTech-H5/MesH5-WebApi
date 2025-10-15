using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WeYuDB_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_UpsertController : ApiController
    {
        private static readonly DBQuery_H5 H5DBQuery = new DBQuery_H5();
        private static readonly DBAction_H5 MyDBAction = new DBAction_H5();
        private static readonly WeYuSEC_H5.Auth_H5 Login = new WeYuSEC_H5.Auth_H5();

        // 接收到的JSON
        public class SyncDataRequest
        {
            public string TargetTable { get; set; }
            public string TargetSidName { get; set; }
            public string CustomName { get; set; }
            public string ExistsQuery { get; set; }
            public string InsertSql { get; set; }
            public string CompareQuery { get; set; }
            public string UpdateSql { get; set; }
            public List<Dictionary<string, object>> Data { get; set; }
        }

        [Route("api/DataSync")]
        public HttpResponseMessage Post([FromBody] SyncDataRequest request)
        {
            try
            {
                //log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                //log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
                //log.Info("Start");

                // 獲取本機 IP
                string localIP = GetLocalIPAddress();
                //log.Info($"當前機器 IP: {localIP}");
                //log.Info($"當前客戶: {request.CustomName}");

                // 從 AppConfig 取得 TokenKeyMinutes
                int tokenKeyMinutes = int.Parse(ConfigurationManager.AppSettings["TokenKeyMinutes"]);
                string UserAccount = ConfigurationManager.AppSettings["UserAccount"];
                string Password = ConfigurationManager.AppSettings["Password"];

                DataSet loginResult = Login.UserLogin(
                   UserAccount,
                   Password,
                   localIP,
                   tokenKeyMinutes
               );
                // 檢查登入結果
                if (loginResult == null || loginResult.Tables.Count == 0 || loginResult.Tables[0].Rows.Count == 0)
                {
                    //log.Error("登入失敗");

                    return Request.CreateResponse(HttpStatusCode.Unauthorized, new { result = false, message = "登入失敗" });
                }
                string tokenKey = "WeyuTech" + loginResult.Tables[0].Rows[0]["TokenKey"].ToString();

                // 轉換成 DataTable
                DataTable dt = ConvertToDatatable(request.Data, request.TargetSidName);

                var sqlCommands = new List<string>();
                Decimal SID = H5DBQuery.GetDBSid();

                foreach (DataRow row in dt.Rows)
                {
                    // 檢查記錄是否存在
                    bool exists = false;
                    if (!string.IsNullOrEmpty(request.ExistsQuery))
                    {
                        string existsSql = ReplaceParameters(request.ExistsQuery, row, tokenKey);
                        exists = CheckExists(existsSql, tokenKey);
                    }


                    if (!exists)
                    {
                        // Insert 邏輯
                        if (!string.IsNullOrEmpty(request.InsertSql))  // 在if內檢查InsertSql是否為NULL
                        {
                            row[request.TargetSidName] = SID; // 使用動態 SID 欄位名稱
                            row["CREATE_TIME"] = DateTime.Now;
                            row["CREATE_USER"] = "API_TEST";
                            row["EDIT_TIME"] = DateTime.Now;
                            row["EDIT_USER"] = "API_TEST";

                            // 動態修改 InsertSql
                            string modifiedInsertSql = ModifySqlTemplate(request.InsertSql, row, request.TargetSidName);
                            sqlCommands.Add(modifiedInsertSql);
                            //log.Info($"新增 SQL: {modifiedInsertSql}");
                            SID++;
                        }
                        else
                        {
                            //log.Info("InsertSql為NULL，跳過新增操作");
                        }
                    }
                    else
                    {
                        // 在else內檢查CompareQuery是否為NULL
                        if (!string.IsNullOrEmpty(request.CompareQuery))
                        {
                            string compareSql = ReplaceParameters(request.CompareQuery, row, tokenKey);
                            if (HasChanges(compareSql, row, tokenKey))
                            {
                                // 在if內檢查UpdateSql是否為NULL
                                if (!string.IsNullOrEmpty(request.UpdateSql))
                                {
                                    // Update 邏輯
                                    row["EDIT_TIME"] = DateTime.Now;
                                    row["EDIT_USER"] = "API_TEST";
                                    // 動態修改 UpdateSql
                                    string modifiedUpdateSql = ModifySqlTemplate(request.UpdateSql, row, request.TargetSidName);
                                    sqlCommands.Add(modifiedUpdateSql);
                                    //log.Info($"更新 SQL: {modifiedUpdateSql}");
                                }
                                else
                                {
                                    //log.Info("UpdateSql為NULL，跳過更新操作");
                                }
                            }
                        }
                        else
                        {
                            //log.Info("CompareQuery為NULL，跳過比較操作");
                        }
                    }
                }

                // 執行 SQL 命令
                //doExecute

                var error_list = new List<string>();  // 收集錯誤信息
                int errorCount = 0;

                try
                {
                    DataSet result = MyDBAction.doExecute(tokenKey, sqlCommands.ToArray());

                    if (result != null && result.Tables.Count > 1)
                    {
                        for (int i = 0; i < result.Tables[1].Rows.Count; i++)
                        {
                            DataRow resultRow = result.Tables[1].Rows[i];
                            //檢查每一行的錯誤訊息
                            if (!string.IsNullOrEmpty(resultRow["ErrorMsg"].ToString()))
                            {
                                // 可以記錄SQL命令索引以便知道是哪條命令出錯
                                //log.Info($"SQL執行錯誤 (命令 {i}): {resultRow["ErrorMsg"]} \nSQL: {sqlCommands[i]}");
                                errorCount++;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    //hasError = true;
                    //string errorMessage = $"執行失敗 SQL: {sql}\n錯誤類型: {ex.GetType().Name}\n錯誤訊息: {ex.Message}\n堆疊追蹤: {ex.StackTrace}";
                    //error_list.Add(errorMessage);
                    //log.Error(ex);
                }

                return CreateResponse(true);
            }
            catch (Exception ex)
            {
                //log.Error("錯誤：" + ex);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        private HttpResponseMessage CreateResponse(bool result)
        {
            var response = new { result = result, PATH = "" };
            return Request.CreateResponse(HttpStatusCode.OK, response);
        }
        private string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                // 只取得 IPv4 位址
                if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            return "127.0.0.1";
        }

        private string ModifySqlTemplate(string originalSql, DataRow row, string sidName)
        {
            bool isInsert = originalSql.TrimStart().StartsWith("INSERT", StringComparison.OrdinalIgnoreCase);

            if (isInsert)
            {
                int insertIndex = originalSql.IndexOf("(") + 1;
                string firstPart = originalSql.Substring(0, insertIndex);
                string remainingPart = originalSql.Substring(insertIndex);

                string newColumns = $"{sidName}, CREATE_TIME, CREATE_USER, EDIT_TIME, EDIT_USER, ";
                string newValues = $"{{{sidName}}}, {{CREATE_TIME}}, {{CREATE_USER}}, {{EDIT_TIME}}, {{EDIT_USER}}, ";

                string modifiedSql = firstPart + newColumns + remainingPart;
                modifiedSql = modifiedSql.Replace("VALUES (", $"VALUES ({newValues}");

                return ReplaceParameters(modifiedSql, row, "");
            }
            else
            {
                // UPDATE 邏輯
                int setIndex = originalSql.IndexOf("SET", StringComparison.OrdinalIgnoreCase) + 3;
                string firstPart = originalSql.Substring(0, setIndex);
                string remainingPart = originalSql.Substring(setIndex);

                string newSetColumns = "EDIT_TIME={EDIT_TIME}, EDIT_USER={EDIT_USER}, ";
                string modifiedSql = firstPart + " " + newSetColumns + remainingPart;

                return ReplaceParameters(modifiedSql, row, "");
            }
        }

        private DataTable ConvertToDatatable(List<Dictionary<string, object>> data, string SidName)
        {
            DataTable dt = new DataTable();

            // 如果沒有資料，返回空的 DataTable
            if (data == null || !data.Any()) return dt;

            // 從第一筆資料取得所有欄位名稱
            foreach (var key in data.First().Keys)
            {
                dt.Columns.Add(key, typeof(object));
            }

            // 為 Insert 新增 SID 欄位
            dt.Columns.Add(SidName, typeof(string));
            dt.Columns.Add("CREATE_TIME", typeof(DateTime));
            dt.Columns.Add("CREATE_USER", typeof(string));
            dt.Columns.Add("EDIT_TIME", typeof(DateTime));
            dt.Columns.Add("EDIT_USER", typeof(string));

            // 加入所有資料
            foreach (var item in data)
            {
                DataRow row = dt.NewRow();
                foreach (var key in item.Keys)
                {
                    row[key] = item[key] ?? DBNull.Value;
                }

                dt.Rows.Add(row);
            }

            return dt;
        }

        private string ReplaceParameters(string sql, DataRow row, string tokenKey)
        {
            if (string.IsNullOrEmpty(sql)) return sql;
            string result = sql;

            // 檢查 SQL 類型
            bool isInsert = result.TrimStart().StartsWith("INSERT", StringComparison.OrdinalIgnoreCase);
            bool isUpdate = result.TrimStart().StartsWith("UPDATE", StringComparison.OrdinalIgnoreCase);

            // 記錄原始 SQL
            //log.Debug($"原始 SQL: {result}");

            foreach (DataColumn col in row.Table.Columns)
            {
                string columnName = col.ColumnName;
                string placeholder = $"{{{columnName}}}";

                if (result.Contains(placeholder))
                {
                    var value = row[columnName];
                    string replaceValue;

                    if (value == DBNull.Value || (value is string strVal && string.IsNullOrWhiteSpace(strVal)))
                    {
                        // 統一處理 NULL 值
                        int placeholderPos = result.IndexOf(placeholder);

                        // 檢查是否在 UPDATE 的 SET 子句中（關鍵改進：在 SET 中使用 = NULL 而不是 IS NULL）
                        if (isUpdate && IsInSetClause(result, placeholderPos))
                        {
                            // 直接使用 NULL
                            replaceValue = "NULL";
                            //log.Debug($"欄位 {columnName} 在 UPDATE SET 中為 NULL，使用 = NULL");
                        }
                        // 檢查是否在等號比較中
                        else if (IsInEqualsComparison(result, placeholderPos))
                        {
                            string pattern = GetEqualsComparisonPattern(result, columnName);
                            if (!string.IsNullOrEmpty(pattern))
                            {
                                result = result.Replace(pattern, $"{columnName} IS NULL");
                                //log.Debug($"將 '{pattern}' 替換為 '{columnName} IS NULL'");
                                continue;
                            }
                            else
                            {
                                // 使用 NULL
                                replaceValue = "NULL";
                                //log.Debug($"欄位 {columnName} 為 NULL 或空字串，使用 NULL");
                            }
                        }
                        else
                        {
                            // 其他情況使用 NULL
                            replaceValue = "NULL";
                            //log.Debug($"欄位 {columnName} 為 NULL 或空字串，使用 NULL");
                        }
                    }
                    else if (value is string)
                    {
                        string strValue = (string)value;

                        // 轉義單引號
                        strValue = strValue.Replace("'", "''");

                        // 檢查是否需要添加引號和 N 前綴
                        if (result.Contains($"N'{{{columnName}}}'"))
                        {
                            // SQL 模板已經有 N 前綴和引號，只需替換內容
                            replaceValue = strValue;
                            //log.Debug($"欄位 {columnName}，SQL 模板已有 N 前綴和引號，替換為: {replaceValue}");
                        }
                        else if (result.Contains($"'{{{columnName}}}'"))
                        {
                            // SQL 模板已經有引號，只需替換內容
                            replaceValue = strValue;
                            //log.Debug($"欄位 {columnName}，SQL 模板已有引號，替換為: {replaceValue}");
                        }
                        else
                        {
                            // 需要添加 N 前綴和引號
                            bool containsNonAscii = strValue.Any(c => c > 127);
                            replaceValue = containsNonAscii ? $"N'{strValue}'" : $"'{strValue}'";
                            //log.Debug($"欄位 {columnName}，添加前綴和引號，替換為: {replaceValue}");
                        }
                    }
                    else if (value is DateTime)
                    {
                        string dateStr = ((DateTime)value).ToString("yyyy-MM-dd HH:mm:ss");

                        // 判斷是否需要添加引號
                        if (result.Contains($"'{{{columnName}}}'"))
                        {
                            // SQL 模板已經有引號
                            replaceValue = dateStr;
                        }
                        else
                        {
                            // 需要添加引號
                            replaceValue = $"'{dateStr}'";
                        }

                        //log.Debug($"欄位 {columnName}，日期值，替換為: {replaceValue}");
                    }
                    else
                    {
                        // 數字和其他非字串類型
                        replaceValue = value.ToString();
                        //log.Debug($"欄位 {columnName}，數值型，替換為: {replaceValue}");
                    }

                    result = result.Replace(placeholder, replaceValue);
                }
            }

            // 修正 NULL 值問題
            result = result.Replace("N'NULL'", "NULL");
            result = result.Replace("'NULL'", "NULL");

            // 修正 UPDATE SET 子句中的 IS NULL 為 = NULL
            if (isUpdate)
            {
                int setPos = result.IndexOf(" SET ", StringComparison.OrdinalIgnoreCase);
                int wherePos = result.IndexOf(" WHERE ", StringComparison.OrdinalIgnoreCase);

                if (setPos > 0 && wherePos > setPos)
                {
                    // 提取 SET 子句
                    string setClause = result.Substring(setPos + 5, wherePos - setPos - 5);
                    // 修正 IS NULL 為 = NULL
                    string fixedSetClause = setClause.Replace(" IS NULL", " = NULL");

                    if (!string.Equals(setClause, fixedSetClause))
                    {
                        //log.Debug($"修正 SET 子句中的 IS NULL 為 = NULL");
                        result = result.Replace(setClause, fixedSetClause);
                    }
                }
            }

            // 記錄最終 SQL
            //log.Debug($"最終 SQL: {result}");

            return result;
        }

        // 檢查佔位符是否在 SET 子句中
        private bool IsInSetClause(string sql, int position)
        {
            int setPos = sql.ToUpper().IndexOf(" SET ");
            int wherePos = sql.ToUpper().IndexOf(" WHERE ");

            if (setPos < 0) return false;
            if (wherePos < 0) wherePos = sql.Length;

            return position > setPos && position < wherePos;
        }

        // 檢查佔位符是否在 WHERE 子句中
        private bool IsInWhereClause(string sql, string placeholder)
        {
            int placeholderPos = sql.IndexOf(placeholder);
            if (placeholderPos == -1) return false;

            // 找到 WHERE 關鍵字的位置
            int wherePos = sql.ToUpper().IndexOf("WHERE");
            if (wherePos == -1) return false;

            // 檢查佔位符是否在 WHERE 之後
            return placeholderPos > wherePos;
        }

        // 檢查是否在等號比較的上下文中
        private bool IsInEqualsComparison(string sql, int position)
        {
            // 找到 placeholder 之前的部分
            string before = sql.Substring(0, position).Trim();
            // 檢查是否以 "= " 或 " =" 結束
            return before.EndsWith("=") || before.EndsWith("= ");
        }

        // 獲取等號比較的模式
        private string GetEqualsComparisonPattern(string sql, string columnName)
        {
            // 嘗試匹配 "columnName = {columnName}" 模式
            int start = sql.IndexOf($"{columnName} =");
            if (start >= 0)
            {
                int end = sql.IndexOf("}", start) + 1;
                if (end > start) return sql.Substring(start, end - start);
            }

            return null;
        }

        private bool CheckExists(string sql, string tokenKey)
        {
            DataSet getTable = H5DBQuery.GetReader(tokenKey, sql);
            //log.Info("Insert_Check：" + sql);
            // 檢查 DataSet 是否有資料表，且第一個資料表有資料(dataset)
            return getTable != null &&
                   getTable.Tables.Count > 0 &&
                   getTable.Tables[0].Rows.Count > 0;
        }

        private bool HasChanges(string sql, DataRow newData, string tokenKey)
        {
            DataSet getTable = H5DBQuery.GetReader(tokenKey, sql);
            //log.Info($"比較查詢: {sql}");

            // 確認 DataSet 有資料
            if (getTable == null || getTable.Tables.Count == 0 || getTable.Tables[0].Rows.Count == 0)
            {
                //log.Info("沒有找到現有資料，視為需要更新");
                return true; // 如果沒有找到舊資料，就視為需要更新
            }

            DataRow existingRow = getTable.Tables[0].Rows[0];
            bool hasChanges = false;
            List<string> changedColumns = new List<string>(); // 用於記錄變更的欄位

            // 比對每個欄位的值
            foreach (DataColumn col in existingRow.Table.Columns)
            {
                string columnName = col.ColumnName;

                // 檢查新資料是否包含此欄位
                if (newData.Table.Columns.Contains(columnName))
                {
                    object existingValue = existingRow[columnName];
                    object newValue = newData[columnName];

                    // 使用改進的比較方法
                    bool equals = ImprovedCompareValues(existingValue, newValue);

                    if (!equals)
                    {
                        //log.Info($"欄位 [{columnName}] 值不相等: 資料庫值=[{existingValue}], JSON值=[{newValue}]");
                        changedColumns.Add(columnName);
                        hasChanges = true;
                    }
                }
            }

            if (hasChanges)
            {
                //log.Info($"檢測到變更的欄位: {string.Join(", ", changedColumns)}");
            }
            else
            {
                //log.Info("所有欄位值相同，無需更新");
            }

            return hasChanges;
        }



        private bool IsNullOrEmpty(object value)
        {
            if (value == null || value == DBNull.Value)
                return true;

            if (value is string strValue)
                return string.IsNullOrWhiteSpace(strValue);

            return false;
        }

        // 輔助方法：檢查是否為數值類型
        private bool IsNumericType(object value)
        {
            return value is byte || value is sbyte ||
                   value is short || value is ushort ||
                   value is int || value is uint ||
                   value is long || value is ulong ||
                   value is float || value is double ||
                   value is decimal;
        }
        // 嘗試進行數值比較的專用方法
        private bool TryNumberComparison(object value1, object value2, out bool result)
        {
            result = false;

            // 首先嘗試將兩個值都轉換為decimal
            bool canConvert1 = TryConvertToDecimal(value1, out decimal decimal1);
            bool canConvert2 = TryConvertToDecimal(value2, out decimal decimal2);

            // 如果兩個值都能轉換為數值，則進行數值比較
            if (canConvert1 && canConvert2)
            {
                // 定義容許的誤差範圍
                const decimal tolerance = 0.00000001M;
                result = Math.Abs(decimal1 - decimal2) < tolerance;
                //log.Info($"數值比較: {decimal1} vs {decimal2}, 差異={Math.Abs(decimal1 - decimal2)}, 結果={result}");
                return true;
            }

            return false;
        }

        private bool ImprovedCompareValues(object existingValue, object newValue)
        {
            // 處理空值比較 - 修改這裡
            bool existingIsEmpty = IsNullOrEmptyOrWhitespace(existingValue);
            bool newIsEmpty = IsNullOrEmptyOrWhitespace(newValue);

            if (existingIsEmpty && newIsEmpty)
            {
                //log.Info("兩者都為空，視為相等");
                return true;
            }

            if (existingIsEmpty || newIsEmpty)
            {
                //log.Info("只有一者為空，不相等");
                return false;
            }

            //log.Info($"比較值: 資料庫=[{existingValue}]({existingValue.GetType().Name}), JSON=[{newValue}]({newValue.GetType().Name})");

            // 嘗試數值比較
            if (TryCompareAsNumbers(existingValue, newValue, out bool numericResult))
            {
                return numericResult;
            }

            // 字串比較
            if (existingValue is string && newValue is string)
            {
                return string.Compare(((string)existingValue).Trim(), ((string)newValue).Trim(), StringComparison.OrdinalIgnoreCase) == 0;
            }

            // 日期比較
            if (existingValue is DateTime existDate && newValue is DateTime newDate)
            {
                return existDate.Date == newDate.Date &&
                       existDate.Hour == newDate.Hour &&
                       existDate.Minute == newDate.Minute &&
                       existDate.Second == newDate.Second;
            }

            // 一般情況直接使用預設比較
            return object.Equals(existingValue, newValue);
        }

        // 判斷值是否為 NULL、DBNull 或空字串
        private bool IsNullOrEmptyOrWhitespace(object value)
        {
            if (value == null || value == DBNull.Value)
                return true;

            if (value is string strValue)
                return string.IsNullOrWhiteSpace(strValue);

            return false;
        }

        private bool TryCompareAsNumbers(object value1, object value2, out bool result)
        {
            result = false;

            // 嘗試將兩個值都轉換為 decimal
            bool value1IsNumeric = TryConvertToDecimal(value1, out decimal decimal1);
            bool value2IsNumeric = TryConvertToDecimal(value2, out decimal decimal2);

            // 如果兩個值都能轉換為數值，則進行數值比較
            if (value1IsNumeric && value2IsNumeric)
            {
                // 設定誤差容許值
                const decimal tolerance = 0.00000001M;
                result = Math.Abs(decimal1 - decimal2) < tolerance;
                //log.Info($"數值比較結果: {decimal1} vs {decimal2}, 差異={Math.Abs(decimal1 - decimal2)}, 結果={result}");
                return true;
            }

            return false;
        }

        private bool TryConvertToDecimal(object value, out decimal result)
        {
            result = 0;

            if (value == null || value == DBNull.Value)
                return false;

            if (IsNumericType(value))
            {
                try
                {
                    result = Convert.ToDecimal(value);
                    return true;
                }
                catch
                {
                    return false;
                }
            }

            if (value is string strValue && !string.IsNullOrWhiteSpace(strValue))
            {
                return decimal.TryParse(strValue.Trim(), out result);
            }

            return false;
        }
    }
}

