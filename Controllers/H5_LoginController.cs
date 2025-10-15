using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WeYuDB_H5;
using WeYuErrorCodeService_H5;
using WeYuSEC_H5;
using MESH5_WEBAPI_20250228V2.Services;
using System.Globalization;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_LoginController : ApiController
    {
        private string _jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Configs", "ErrorMessages.json");

        public static string TokenKeyTime
        {
            get
            {
                return ConfigurationSettings.AppSettings["TokenKeyTime"];
            }
        }

        // GET: api/H5_Login
        public IEnumerable<string> Get()
        {
            decimal SID, SID2;

            using (DBQuery_H5 _query = new DBQuery_H5())
            {
                SID = _query.GetDBSid();
            }
            WeYuDB_H5.QueryFunction queryFunction = new QueryFunction();
            SID2 = queryFunction.GetSid();
            return new string[] { "DBSID:" + SID.ToString(), "SYSSID:" + SID2.ToString() };
        }

        // GET: api/H5_Login/5
        //public string Get(int id)
        //{
        //    return "value";
        //}
        // GET: api/H5_Login/id,pwd,IP,Domain,TokenTime
        public string Get(string id, string pwd, string IP, string Domain, int tokenTime)
        {
            string UserName, CheckRult, Token;
            string ResultJson = "";
            using (WeYuSEC_H5.Auth_H5 _MySEC = new Auth_H5())
            {
                WeYuSEC_H5S.WeyuToken _NewToken = new WeYuSEC_H5S.WeyuToken("", DateTime.MinValue);
                DataSet LoginInfo = _MySEC.UserLogin(id, pwd, "192.168.0.1", tokenTime, ref _NewToken);
                //DataSet LoginInfo = _MySEC.UserLogin((id, pwd, "192.168.0.1", tokenTime);
                if (LoginInfo.Tables["UserCertInfo"] != null)
                {
                    //登入資訊
                    //ResultJson = ConvertDataTableToJson(LoginInfo.Tables["UserCertInfo"]);
                    ResultJson = JsonConvert.SerializeObject(LoginInfo, Formatting.Indented);

                }
                else
                {
                    UserName = "";
                    CheckRult = "Login Error UserCertInfo is Empty";
                }
                // renew token
                WeYuSEC_H5.SECFun_H5 _secf_H5 = new SECFun_H5();
                _NewToken.Key = "WeyuTech" + _NewToken.Key;
                bool VandG_flag = _secf_H5.VeriftyAndGetTokenObj(ref _NewToken);
                var resp = new HttpResponseMessage();

                // 將 token 與相關資訊存入 session，方便後續驗證或登出
                var session = System.Web.HttpContext.Current.Session; // 宣告 Session
                session["Key"] = _NewToken.Key;
                session["Expiration"] = _NewToken.Expiration.ToString("yyyy-MM-dd HH:mm:ss");

            }

            //return new string[] { "ID:" + id, "PWD:"+pwd, "NAME:" + UserName, "CHECK:" + CheckRult };
            return ResultJson;
        }

        public class H5_Weyu_Login
        {
            public string UID { get; set; }
            public string PWD { get; set; }
        }

        // POST: api/H5_Login
        public HttpResponseMessage Post([FromBody] H5_Weyu_Login Login_data)
        {
            //log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            //log = LogManager.GetLogger(typeof(WeyuLoginController));

            // string ReturnJson = "\"restlt\": false";
            JObject obj = new JObject();
            obj.Add(new JProperty("result", false));
            try
            {
                WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
                WeYuSEC_H5.Auth_H5 Auth = new WeYuSEC_H5.Auth_H5();
                WeYuReg_H5.RegInfo_H5 regInfo = new WeYuReg_H5.RegInfo_H5();

                #region 抓IP
                string clientIp = GetClientIpAddress(Request);
                if (clientIp == "::1") //如果是localhost等等本機位置的話
                {
                    clientIp = "127.0.0.1";
                }
                //log.Info("Call IP:" + clientIp);
                #endregion

                string UID = Login_data.UID;
                string PWD = Login_data.PWD;
                var sessionRepo = new AppSessionRegistryRepository();
                Guid? sessionId = null;

                #region H5
                int times = int.Parse(TokenKeyTime);
                DataSet Info = Auth.UserLogin(UID, PWD, clientIp, times);

                if (Info.Tables.Count == 0)
                {
                    var resultError = new
                    {
                        result = false,
                        msg = "Login Fail"
                    };

                    string jsonError = JsonConvert.SerializeObject(resultError);

                    HttpResponseMessage httpResponseMessageH5_Error = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessageH5_Error.Content = new StringContent(jsonError, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessageH5_Error;
                }



                DataTable UserCert = Info.Tables[0];//登入是否成功
                DataTable User = Info.Tables[1];//登入者資料
                DataTable UserAuth = Info.Tables[2];//授權功能

                bool Login_Status = UserCert.Rows[0]["LoginStatus"].ToString() == "false" ? false : true;

                if (Login_Status)
                {
                    try
                    {
                        sessionId = sessionRepo.RegisterSession(UID);
                    }
                    catch (InvalidOperationException exception)
                    {
                        var limitError = new
                        {
                            result = false,
                            msg = exception
                        };
                        string limitJson = JsonConvert.SerializeObject(limitError);
                        HttpResponseMessage limitResponse = Request.CreateResponse(HttpStatusCode.Conflict);
                        limitResponse.Content = new StringContent(limitJson, System.Text.Encoding.UTF8, "application/json");
                        return limitResponse;
                    }
                }

                #region UserCert資料欄位過濾
                // 假設要移除的欄位名稱列表
                string[] UserCertToRemove = { "LoginMsg", "Column1", "DbDataSource", "SID", "REGCODE", "CREATE_USER", "CREATE_TIME", "EDIT_USER", "EDIT_TIME", "CHECK_CODE", "CUSTOMER_NAME" };

                // 迴圈移除欄位
                foreach (var columnName in UserCertToRemove)
                {
                    if (UserCert.Columns.Contains(columnName))
                    {
                        UserCert.Columns.Remove(columnName);
                    }
                }
                #endregion

                #region User 移除資料欄位
                // 假設要移除的欄位名稱列表
                //string[] UserToRemove = { "USER_SID", "USER_EN_NAME", "NICKNAME", "EMP_NO", "COMPANY", "DEPT_SID", "TITLE_SID", "LEVEL_SID", "ENABLE_FLAG", "LOGIN_ONCE", "ADMIN", "DEFAULT_PAGE_URL", "EMAIL", "MOBILE", "TEL", "CULTURE_LANGUAGE", "CREATE_USER", "CREATE_TIME", "EDIT_USER", "EDIT_TIME", "SEC_USER_STATUS_SID", "LAST_STATUS_CHANGE_TIME", "LAST_SEC_USER_HIST_SID", "SHIFT_SID", "WORKGROUP_SID", "SECURITY_ID", "LINE_NOTIFY_CODE", "REFRESH_TOKEN" };

                //// 迴圈移除欄位
                //foreach (var columnName in UserToRemove)
                //{
                //    if (User.Columns.Contains(columnName))
                //    {
                //        User.Columns.Remove(columnName);
                //    }
                //}
                #endregion


                // 將登入後產生的 token 與 sessionId 存入 Session
                var session = System.Web.HttpContext.Current.Session; // 宣告 Session
                session["Key"] = UserCert.Rows[0]["TokenKey"].ToString();
                //session["Expiration"] = Convert.ToDateTime(UserCert.Rows[0]["TokenExpiry"]).ToString("yyyy-MM-dd HH:mm:ss");
                var expiryDt = SafeParseDateTime(UserCert.Rows[0]["TokenExpiry"]);
                session["Expiration"] = expiryDt?.ToString("yyyy-MM-dd HH:mm:ss") ?? null; // 取不到就留 null/不設定
                if (sessionId.HasValue)
                {
                    // 保存後端產生的 sessionId，供登出時使用
                    session["SessionId"] = sessionId.Value.ToString();
                }

                #region 授權資料(UserAuth)轉換
                // 轉換成所需的格式
                var groupedData = UserAuth.AsEnumerable()
                    .GroupBy(row => row["CATEGORY_NAME"])
                    .ToDictionary(
                        group => group.Key,
                        group => group.Select(row => new
                        {
                            FUN_SID = row["FUN_SID"].ToString(),
                            Etext = row["Etext"]
                        }).ToList()
                    );

                // 創建模擬的 "module" 部分，包含 SID 和 NAME
                var module = UserAuth.AsEnumerable()
                    .Select(row => new
                    {
                        CATEGORY_SID = row["CATEGORY_SID"].ToString(),
                        CATEGORY_NAME = row["CATEGORY_NAME"].ToString()
                    })
                    .Distinct()
                    .ToList();
                #endregion

                // 返回結果
                var result = new
                {
                    result = Login_Status,
                    sessionId,
                    UserCertInfo = UserCert,
                    UserInfo = User,
                    UserAuthInfo = new
                    {
                        CATEGORY = module,  // 包含 CATEGORY
                        FUNCTION = groupedData // 包含 function
                    }

                };

                string json = JsonConvert.SerializeObject(result);

                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;
                #endregion

            }
            catch (Exception ex)
            {
                //log.Error(ex.Message);
                obj["result"] = false;
                obj.Add(new JProperty("Msg", ex.Message));
            }

            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK, obj);
            return httpResponseMessage;
        }

        private static DateTime? SafeParseDateTime(object raw)
        {
            if (raw == null || raw == DBNull.Value) return null;
            if (raw is DateTime dt) return dt;

            var s = raw.ToString()?.Trim();
            if (string.IsNullOrEmpty(s)) return null;

            // 可能的文化：zh-TW（支援 上午/下午）、Invariant、en-US
            var zhTW = new CultureInfo("zh-TW");
            var inv = CultureInfo.InvariantCulture;
            var enUS = new CultureInfo("en-US");

            // 常見格式（含 tt 代表 上午/下午）
            string[] formats = new[]
            {
        "yyyy/M/d tt h:mm:ss",
        "yyyy/M/d tt hh:mm:ss",
        "yyyy/MM/dd tt h:mm:ss",
        "yyyy/MM/dd tt hh:mm:ss",
        "yyyy/MM/dd HH:mm:ss",
        "yyyy/M/d H:mm:ss",
        "yyyy-MM-dd HH:mm:ss",
        "M/d/yyyy h:mm:ss tt",
        "M/d/yyyy hh:mm:ss tt",
        "yyyy-MM-ddTHH:mm:ss",
        "yyyy-MM-ddTHH:mm:ss.fff"
    };

            DateTime outDt;
            // 先試 TryParseExact（zh-TW 可處理 上午/下午）
            if (DateTime.TryParseExact(s, formats, zhTW, DateTimeStyles.AllowWhiteSpaces, out outDt)) return outDt;
            if (DateTime.TryParseExact(s, formats, enUS, DateTimeStyles.AllowWhiteSpaces, out outDt)) return outDt;
            if (DateTime.TryParseExact(s, formats, inv, DateTimeStyles.AllowWhiteSpaces, out outDt)) return outDt;

            // 再試一般 TryParse
            if (DateTime.TryParse(s, zhTW, DateTimeStyles.AllowWhiteSpaces, out outDt)) return outDt;
            if (DateTime.TryParse(s, enUS, DateTimeStyles.AllowWhiteSpaces, out outDt)) return outDt;
            if (DateTime.TryParse(s, inv, DateTimeStyles.AllowWhiteSpaces, out outDt)) return outDt;

            return null;
        }

        // PUT: api/H5_Login/5
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE: api/H5_Login/5
        public void Delete(int id)
        {
        }

        [HttpGet]
        [Route("api/session/check")]
        public IHttpActionResult CheckSession()
        {
            try
            {
                var session = System.Web.HttpContext.Current?.Session;

                // return ResultHelper.BuildResult("AUTHERR", "AUTHERR0002", StackTraceHelper.LogCurrentLocation(), _jsonFilePath);

                if (session == null || session["Key"]?.ToString()?.ToString() == null)
                {
                    return ResultHelper.BuildResult("AUTHERR", "AUTHERR0002", StackTraceHelper.LogCurrentLocation(), _jsonFilePath);
                }

                return Ok(new
                {
                    TokenKey = session["Key"]?.ToString(),
                    Expiration = session["Expiration"]?.ToString()
                });
            }
            catch (Exception ex)
            {
                return ResultHelper.BuildResult("ZZUNKNOWN", "ZZUNKNOWN0001", StackTraceHelper.LogCurrentLocation(), _jsonFilePath, ex);
            }
        }

        private string GetClientIpAddress(HttpRequestMessage request)
        {
            // 從 HTTP headers 中擷取 X-Forwarded-For（用於反向代理的情境）
            if (request.Headers.Contains("X-Forwarded-For"))
            {
                return request.Headers.GetValues("X-Forwarded-For").FirstOrDefault();
            }

            // 如果未經反向代理，則從原始連線擷取 IP
            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                var context = request.Properties["MS_HttpContext"] as System.Web.HttpContextBase;
                return context?.Request.UserHostAddress;
            }
            else if (request.Properties.ContainsKey("HttpContext"))
            {
                var context = request.Properties["HttpContext"] as System.Web.HttpContextBase;
                return context?.Request.UserHostAddress;
            }

            return null;
        }
    }
}