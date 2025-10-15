using log4net;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_CopyController : ApiController
    {
        public static ILog log;
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 DBAction_H5 = new WeYuDB_H5.DBAction_H5();

        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }
        public class DetailItem
        {
            /// <summary>欄位名稱</summary>
            public string KEY { get; set; }

            /// <summary>欄位值（可放字串/數字/布林…）</summary>
            public object VALUE { get; set; }
        }

        public class SaveRequest
        {
            /// <summary>資料SID</summary>
            public string SID { get; set; }

            /// <summary>資料表名稱</summary>
            public string TableName { get; set; }

            /// <summary>資料表名稱PK_SID名稱</summary>
            public string TABLENAME_COLUMN_SID_NAME { get; set; }

            /// <summary>明細清單（可為 null 或空集合）</summary>
            public List<DetailItem> DETAIL_LIST { get; set; } = new List<DetailItem>();
        }

        [Route("api/CopyData")]
        public HttpResponseMessage Post([FromBody] SaveRequest data)
        {
            var session = System.Web.HttpContext.Current.Session;
            //if (session["Key"] == null) throw new Exception("Token Verify Fail !");
            if (session?["Key"] == null)
            {
                log.Warn("Token Verify Fail: session key missing.");
                var resp = new
                {
                    result = false,
                    Msg = "Token Verify Fail !",
                    SID = ""
                };
                return Request.CreateResponse(HttpStatusCode.Unauthorized, resp);
            }
            var sessionToken = "WeyuTech" + session["Key"];
            var sessionExpiration = session["Expiration"];


            WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));


            // 1. 撈原始資料
            string selectSql = $@"SELECT TOP 1 * 
                          FROM {data.TableName} 
                          WHERE {data.TABLENAME_COLUMN_SID_NAME} = {data.SID}";

            var tabletest = MyDBQuery.GetReader(ref _SessionToken,selectSql);



            DataTable table = MyDBQuery.GetReader(selectSql);
            if (table == null || table.Rows.Count == 0)
                throw new Exception("來源資料不存在");

            DataRow srcRow = table.Rows[0];

            // 2. 產生新的 SID
            decimal newSid = MyDBQuery.GetDBSid();

            // 3. 複製一份 row（先全部複製）
            DataRow newRow = table.NewRow();
            foreach (DataColumn col in table.Columns)
                newRow[col.ColumnName] = srcRow[col.ColumnName];

            // 4. 替換 SID
            newRow[data.TABLENAME_COLUMN_SID_NAME] = newSid;

            // 5. 替換 JSON 傳進來的欄位
            if (data.DETAIL_LIST != null && data.DETAIL_LIST.Any())
            {
                foreach (var item in data.DETAIL_LIST)
                {
                    if (!table.Columns.Contains(item.KEY)) continue;
                    newRow[item.KEY] = item.VALUE ?? DBNull.Value;
                }
            }

            // 6. 組 INSERT SQL
            var colNames = new List<string>();
            var colValues = new List<string>();

            foreach (DataColumn col in table.Columns)
            {
                string colName = col.ColumnName;
                object val = newRow[col];

                colNames.Add("[" + colName + "]");

                if (val == null || val == DBNull.Value)
                {
                    colValues.Add("NULL");
                }
                else if (col.DataType == typeof(DateTime))
                {
                    DateTime dt = Convert.ToDateTime(val);
                    colValues.Add($"'{dt.ToString("yyyy-MM-dd HH:mm:ss")}'");
                }
                else if (col.DataType == typeof(string))
                {
                    colValues.Add($"N'{val.ToString().Replace("'", "''")}'");
                }
                else if (col.DataType == typeof(bool))
                {
                    colValues.Add(((bool)val) ? "1" : "0");
                }
                else
                {
                    colValues.Add(val.ToString());
                }
            }

            string insertSql = $@"INSERT INTO {data.TableName} ({string.Join(",", colNames)})
                          VALUES ({string.Join(",", colValues)})";

            _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

            List<string> sqls = new List<string>();
            sqls.Add(insertSql);


            var result = DBAction_H5.doExecute(ref _SessionToken, sqls.ToArray());
            #region H5
            var data1 = new
            {
                result = true,
                TokenInfo = new[] // 新增 TOKENINFO 資料
                {
                        new
                        {
                            TokenExpiry = _SessionToken.Expiration
                        }
                    }
            };
            #endregion
            string json = JsonConvert.SerializeObject(data1);

            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            httpResponseMessage.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            return httpResponseMessage;

        }
    }
}
