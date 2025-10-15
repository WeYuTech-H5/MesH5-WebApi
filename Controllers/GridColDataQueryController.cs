using log4net;
using log4net.Config;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace WeyuBiApi.Controllers
{
    public class GridColDataQueryController : ApiController
    {
        //static WeYuDB.DBQuery MyDBQuery = new DBQuery();
        //static WeYuFunctionLibrary.SecFunction secfun = new SecFunction(MyDBQuery);
        //static WeYuBiFun wbfun = new WeYuBiFun(MyDBQuery);
        public static ILog log;
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();

        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }

        public class SelectGridData
        {
            public string SelectData { get; set; }
            public string TableName { get; set; }
            public string QueryString { get; set; }
        }

        public HttpResponseMessage Post([FromBody] SelectGridData oDATA)
        {
            try
            {
                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(GridColDataQueryController));

                //IEnumerable<string> TokenKeyheaderValues = Request.Headers.GetValues("TokenKey");

                if (session["Key"] != null)
                {

                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    //string TokenKey = TokenKeyheaderValues.First();
                    string SelectData = oDATA.SelectData;
                    string TableName = oDATA.TableName;
                    string QueryString = oDATA.QueryString;

                    string sql = $"SELECT {SelectData} FROM {TableName} {QueryString}";
                    //DataSet MDet = MyDBQuery.GetReader($@"WeyuTech{TokenKey}", sql);
                    DataSet MDet = MyDBQuery.GetReader(ref _SessionToken, sql);

                    //表示token過期
                    if (MDet.Tables.Count == 1)
                    {
                        var data2 = new
                        {
                            result = false
                        };
                        string json2 = JsonConvert.SerializeObject(data2);

                        HttpResponseMessage httpResponseMessage2 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessage2.Content = new StringContent(json2, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessage2;
                    }

                    DataTable MDt = MDet.Tables[0].Copy();

                    DataTable MDtStr = NumericColumnsToString(MDt, numberFormat: "0.##"); // 數字→字串（小數最多兩位）


                    DataTable TokenInfo = MDet.Tables[1].Copy();
                    var Tokendt = TokenInfo.Rows[0];
                    #region H5
                    var data1 = new
                    {
                        result = true,
                        data = MDtStr, // DataTable 直接序列化
                        TokenInfo = new[] // 新增 TOKENINFO 資料
                        {
                        new
                        {
                            TokenKey = Tokendt["TokenKey"].ToString(),
                            TokenExpiry = Tokendt["TokenExpiry"].ToString()
                        }
                    }
                    };
                    #endregion
                    string json = JsonConvert.SerializeObject(data1);
                    SessionHelper.UpdateToken(_SessionToken);
                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessage.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessage;
                }
                else
                {
                    var result = new
                    {
                        result = false,
                        Msg = "Token Verify Fail !",
                        SID = ""
                    };

                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);

                }

               
            }
            catch (Exception ex)
            {
                log.Error(ex.Message);
                HttpResponseMessage httpResponseMessageerror = Request.CreateResponse(HttpStatusCode.Forbidden);
                httpResponseMessageerror.Content = new StringContent(ex.Message, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageerror;
            }
        }

        public static DataTable NumericColumnsToString(DataTable source, string numberFormat = "0.##", IFormatProvider provider = null)
        {
            if (source == null) throw new ArgumentNullException(nameof(source));
            if (provider == null) provider = CultureInfo.InvariantCulture;

            // 建新表：數值欄位改為 string，其餘維持原型別
            var result = new DataTable(source.TableName);
            foreach (DataColumn col in source.Columns)
            {
                bool isNum = IsNumericType(col.DataType);
                result.Columns.Add(new DataColumn(col.ColumnName, isNum ? typeof(string) : col.DataType)
                {
                    AllowDBNull = col.AllowDBNull,
                    MaxLength = isNum ? -1 : col.MaxLength
                });
            }

            // 複製資料並將數值轉字串
            foreach (DataRow row in source.Rows)
            {
                var newRow = result.NewRow();
                foreach (DataColumn col in source.Columns)
                {
                    object v = row[col];
                    if (v == null || v == DBNull.Value)
                    {
                        newRow[col.ColumnName] = DBNull.Value;
                    }
                    else if (IsNumericType(col.DataType))
                    {
                        // 依格式輸出，如 "0.##"、"N2"
                        newRow[col.ColumnName] = (v is IFormattable f)
                            ? f.ToString(numberFormat, provider)
                            : Convert.ToString(v, provider);
                    }
                    else
                    {
                        newRow[col.ColumnName] = v;
                    }
                }
                result.Rows.Add(newRow);
            }
            return result;
        }

        private static bool IsNumericType(Type t)
        {
            if (t.IsGenericType && t.GetGenericTypeDefinition() == typeof(Nullable<>))
                t = Nullable.GetUnderlyingType(t);

            return t == typeof(byte) || t == typeof(sbyte) ||
                   t == typeof(short) || t == typeof(ushort) ||
                   t == typeof(int) || t == typeof(uint) ||
                   t == typeof(long) || t == typeof(ulong) ||
                   t == typeof(float) || t == typeof(double) ||
                   t == typeof(decimal);
        }
    }
}
