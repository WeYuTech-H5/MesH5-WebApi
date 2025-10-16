using MESH5_WEBAPI_20250228V2.Helper;
using MESH5_WEBAPI_20250228V2.Models;
using MESH5_WEBAPI_20250228V2.Services;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using WeYuWIP_H5;
using static MESH5_WEBAPI_20250228V2.Controllers.H5_Lot_Check_INController;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_WIPController : ApiController
    {
        private const string SessionTokenPrefix = "WeyuTech";
        private readonly ISqlExecutorService _sqlExecutorService;

        /// <summary>
        /// 建立 <see cref="H5_WIPController"/> 的預設實例。
        /// </summary>
        /// <remarks>
        /// 以具體的 <see cref="SqlExecutorService"/> 作為預設交易執行邏輯，方便既有架構無縫移轉。
        /// </remarks>
        public H5_WIPController()
            : this(new SqlExecutorService())
        {
        }

        /// <summary>
        /// 允許透過依賴注入自訂 SQL 執行策略的建構式。
        /// </summary>
        /// <param name="sqlExecutorService">提供交易化 SQL 執行功能的服務。</param>
        public H5_WIPController(ISqlExecutorService sqlExecutorService)
        {
            _sqlExecutorService = sqlExecutorService ?? throw new ArgumentNullException(nameof(sqlExecutorService));
        }

        /// <summary>
        /// 建立標準化的失敗結果物件，確保回應格式一致。
        /// </summary>
        /// <param name="message">要回傳給前端的錯誤摘要。</param>
        /// <remarks>
        /// 請避免傳入包含敏感資料或完整 SQL 的訊息，以維護系統安全性。
        /// </remarks>
        private static SqlExecutionResult CreateFailureResult(string message)
        {
            return new SqlExecutionResult
            {
                Success = false,
                TotalStatements = 0,
                TotalAffectedRows = 0,
                Errors = new List<string> { message }
            };
        }

        /// <summary>
        /// 判斷 SQL 清單是否包含 Session Token 相關的錯誤訊息。
        /// </summary>
        /// <param name="statements">待檢查的 SQL 或訊息集合。</param>
        /// <returns>
        /// 若清單中包含「session token」關鍵字，表示發生驗證錯誤時傳回 <c>true</c>。
        /// </returns>
        private static bool ContainsSessionTokenError(IEnumerable<string> statements)
        {
            return statements != null && statements.Any(statement =>
                !string.IsNullOrWhiteSpace(statement) &&
                statement.IndexOf("session token", StringComparison.OrdinalIgnoreCase) >= 0);
        }

        public class LotCreate
        {
            public string WO { get; set; }
            public string LOT { get; set; }
            public string ROUTE_SID { get; set; }
            public decimal LOT_QTY { get; set; }
            public string ALIAS_LOT1 { get; set; }
            public string ALIAS_LOT2 { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
            public string ZZ_LOT_ATTR1 { get; set; }
            public string ZZ_LOT_ATTR2 { get; set; }
        }
        
        /// <summary>
        /// 以交易機制執行 Lot 建立流程所產生的 SQL 陳述式。
        /// </summary>
        /// <param name="data">建立批次所需的資料欄位。</param>
        /// <remarks>
        /// 會先呼叫既有元件產生 SQL，接著委派 <see cref="ISqlExecutorService"/> 在單一交易中逐條執行，以確保全有或全無。
        /// </remarks>
        /// <returns>包含執行狀態與錯誤資訊的 <see cref="SqlExecutionResult"/>。</returns>
        [Route("api/WIP/LotCreate")]
        public IHttpActionResult Post([FromBody] LotCreate data)
        {
            if (data == null)
            {
                return BadRequest("Request body cannot be null.");
            }

            var session = HttpContext.Current?.Session;
            if (session == null || session["Key"] == null || session["Expiration"] == null)
            {
                return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 不存在或已逾期。"));
            }

            try
            {
                var wipAction = new WIPAction_H5();
                var sessionToken = SessionTokenPrefix + session["Key"];
                var sessionExpiration = Convert.ToDateTime(session["Expiration"]);
                var weyuToken = new WeYuSEC_H5S.WeyuToken(sessionToken, sessionExpiration);

                SessionHelper.UpdateToken(weyuToken);

                var dataLinkSid = wipAction.GetSID();

                var sqlStatements = wipAction.CreateLotSql(
                    data.LOT,
                    dataLinkSid,
                    data.WO,
                    data.ALIAS_LOT1,
                    data.ALIAS_LOT2,
                    data.ROUTE_SID,
                    data.LOT_QTY,
                    data.REPORT_TIME,
                    data.USER_NO,
                    data.INPUT_FORM_NAME,
                    data.ZZ_LOT_ATTR1,
                    data.ZZ_LOT_ATTR2,
                    data.COMMENT,
                    ref weyuToken) ?? new List<string>();

                SessionHelper.UpdateToken(weyuToken);

                if (ContainsSessionTokenError(sqlStatements))
                {
                    return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 驗證失敗。"));
                }

                var executionResult = _sqlExecutorService.ExecuteStatements(sqlStatements);
                SessionHelper.UpdateToken(weyuToken);

                return Ok(executionResult);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError,
                    CreateFailureResult($"LotCreate 交易執行失敗 ({ex.GetType().Name}): {ex.Message}"));
            }
        }

        public class CheckInModel
        {
            public string LOT { get; set; }
            public string EQP_NO { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string SHIFT_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        
        /// <summary>
        /// 以單一交易執行 Lot Check-In 流程所需的 SQL 陳述式。
        /// </summary>
        /// <param name="data">Check-In 所需的欄位資訊。</param>
        /// <remarks>
        /// 若交易中任一 SQL 失敗會進行回滾並回傳錯誤摘要，以保證資料一致性。
        /// </remarks>
        // POST: api/H5_WIP
        [Route("api/WIP/LotCheckIn")]
        public IHttpActionResult Post([FromBody] CheckInModel data)
        {
            if (data == null)
            {
                return BadRequest("Request body cannot be null.");
            }

            var session = HttpContext.Current?.Session;
            if (session == null || session["Key"] == null || session["Expiration"] == null)
            {
                return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 不存在或已逾期。"));
            }

            try
            {
                var wipAction = new WIPAction_H5();
                var wipQuery = new WIPQuery_H5();
                var sessionToken = SessionTokenPrefix + session["Key"];
                var sessionExpiration = Convert.ToDateTime(session["Expiration"]);
                var weyuToken = new WeYuSEC_H5S.WeyuToken(sessionToken, sessionExpiration);

                SessionHelper.UpdateToken(weyuToken);

                var dataLinkSid = wipAction.GetSID();
                var lotsList = data.LOT;
                var usersList = data.USER_NO;
                var eqpsList = data.EQP_NO;

                DataTable shiftTable = wipQuery.GetShiftInfo(data.SHIFT_NO);
                if (shiftTable == null || shiftTable.Rows.Count == 0)
                {
                    return Content(HttpStatusCode.BadRequest, CreateFailureResult($"找不到班別 {data.SHIFT_NO} 的對應資料。"));
                }

                string shiftSid = shiftTable.Rows[0]["SHIFT_SID"].ToString();

                var sqlStatements = wipAction.LotCheckInSql(
                    lotsList,
                    dataLinkSid,
                    data.REPORT_TIME,
                    usersList,
                    eqpsList,
                    Convert.ToDecimal(shiftSid),
                    "PROD",
                    "COMMENT",
                    "Jack-CheckIn",
                    ref weyuToken) ?? new List<string>();

                SessionHelper.UpdateToken(weyuToken);

                if (ContainsSessionTokenError(sqlStatements))
                {
                    return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 驗證失敗。"));
                }

                var executionResult = _sqlExecutorService.ExecuteStatements(sqlStatements);
                SessionHelper.UpdateToken(weyuToken);

                return Ok(executionResult);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError,
                    CreateFailureResult($"LotCheckIn 交易執行失敗 ({ex.GetType().Name}): {ex.Message}"));
            }
        }

        public class CheckInCancel
        {
            public string LOT { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        
        /// <summary>
        /// 在單一交易中執行 Lot Check-In 取消流程的 SQL 指令。
        /// </summary>
        /// <param name="data">Check-In 取消流程所需的欄位資料。</param>
        /// <remarks>
        /// 若任何 SQL 執行失敗會立即回滾並回傳錯誤摘要，確保資料一致性與錯誤可追蹤性。
        /// </remarks>
        /// <returns>包含執行結果、影響筆數與錯誤訊息的 <see cref="SqlExecutionResult"/>。</returns>
        [Route("api/WIP/LotCheckInCancel")]
        public IHttpActionResult Post([FromBody] CheckInCancel data)
        {
            if (data == null)
            {
                return BadRequest("Request body cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(data.LOT))
            {
                return BadRequest("LOT is required.");
            }

            if (string.IsNullOrWhiteSpace(data.USER_NO))
            {
                return BadRequest("USER_NO is required.");
            }

            var session = HttpContext.Current?.Session;
            if (session == null || session["Key"] == null || session["Expiration"] == null)
            {
                return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 不存在或已逾期。"));
            }

            try
            {
                var wipAction = new WIPAction_H5();
                var sessionToken = SessionTokenPrefix + session["Key"];
                var sessionExpiration = Convert.ToDateTime(session["Expiration"]);
                var weyuToken = new WeYuSEC_H5S.WeyuToken(sessionToken, sessionExpiration);

                SessionHelper.UpdateToken(weyuToken);

                var dataLinkSid = wipAction.GetSID();
                var reportTime = string.IsNullOrWhiteSpace(data.REPORT_TIME)
                    ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)
                    : data.REPORT_TIME;

                var sqlStatements = wipAction.LotCheckInCancelSql(
                    data.LOT,
                    dataLinkSid,
                    reportTime,
                    data.USER_NO,
                    data.COMMENT,
                    data.INPUT_FORM_NAME,
                    ref weyuToken) ?? new List<string>();

                SessionHelper.UpdateToken(weyuToken);

                if (ContainsSessionTokenError(sqlStatements))
                {
                    return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 驗證失敗。"));
                }

                var executionResult = _sqlExecutorService.ExecuteStatements(sqlStatements);
                SessionHelper.UpdateToken(weyuToken);

                return Ok(executionResult);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError,
                    CreateFailureResult($"LotCheckInCancel 交易執行失敗 ({ex.GetType().Name}): {ex.Message}"));
            }
        }

        public class CheckOut
        {
            public string LOT { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string EQP_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        
        /// <summary>
        /// 在單一交易中執行 Lot Check-Out 流程的 SQL 指令。
        /// </summary>
        /// <param name="data">Check-Out 流程所需的欄位資料。</param>
        /// <remarks>
        /// 若任何 SQL 執行失敗會立即回滾，避免產生部分提交造成的製程異常。
        /// </remarks>
        /// <returns>包含影響筆數與錯誤摘要的 <see cref="SqlExecutionResult"/>。</returns>
        [Route("api/WIP/LotCheckOut")]
        public IHttpActionResult Post([FromBody] CheckOut data)
        {
            if (data == null)
            {
                return BadRequest("Request body cannot be null.");
            }

            if (string.IsNullOrWhiteSpace(data.LOT))
            {
                return BadRequest("LOT is required.");
            }

            if (string.IsNullOrWhiteSpace(data.USER_NO))
            {
                return BadRequest("USER_NO is required.");
            }

            if (string.IsNullOrWhiteSpace(data.EQP_NO))
            {
                return BadRequest("EQP_NO is required.");
            }

            var session = HttpContext.Current?.Session;
            if (session == null || session["Key"] == null || session["Expiration"] == null)
            {
                return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 不存在或已逾期。"));
            }

            try
            {
                var wipAction = new WIPAction_H5();
                var sessionToken = SessionTokenPrefix + session["Key"];
                var sessionExpiration = Convert.ToDateTime(session["Expiration"]);
                var weyuToken = new WeYuSEC_H5S.WeyuToken(sessionToken, sessionExpiration);

                SessionHelper.UpdateToken(weyuToken);

                var dataLinkSid = wipAction.GetSID();
                var reportTime = string.IsNullOrWhiteSpace(data.REPORT_TIME)
                    ? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)
                    : data.REPORT_TIME;

                var sqlStatements = wipAction.LotCheckOutSql(
                    data.LOT,
                    dataLinkSid,
                    reportTime,
                    data.USER_NO,
                    data.EQP_NO,
                    data.COMMENT,
                    data.INPUT_FORM_NAME,
                    ref weyuToken) ?? new List<string>();

                SessionHelper.UpdateToken(weyuToken);

                if (ContainsSessionTokenError(sqlStatements))
                {
                    return Content(HttpStatusCode.Unauthorized, CreateFailureResult("Session token 驗證失敗。"));
                }

                var executionResult = _sqlExecutorService.ExecuteStatements(sqlStatements);
                SessionHelper.UpdateToken(weyuToken);

                return Ok(executionResult);
            }
            catch (Exception ex)
            {
                return Content(HttpStatusCode.InternalServerError,
                    CreateFailureResult($"LotCheckOut 交易執行失敗 ({ex.GetType().Name}): {ex.Message}"));
            }
        }

        public class LotKeyPartModel
        {
            public string LOT { get; set; }
            public string MLOT { get; set; }
            public decimal QTY { get; set; }
            public string ACCOUNT_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotKeyPart")]
        public HttpResponseMessage Post([FromBody] RequestLotKeyPartModel data)
        {
            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            try
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                WeYuDB_H5.DBQuery_H5 _query = new WeYuDB_H5.DBQuery_H5();
                #region 處理邏輯

                var session = System.Web.HttpContext.Current.Session;
                if (session["Key"] != null && session["Expiration"]!=null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    if (System.Convert.ToDateTime(sessionExpiration)<System.DateTime.Now)
                        return Request.CreateResponse(HttpStatusCode.InternalServerError, "Token Timeout!!");

                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    decimal DATA_LINK_SID = _wipAction.GetSID();
                    if (data == null)
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest, "請求內容為空");
                    }

                    //資料整備

                    string LOT = data.LOT;
                    string MLOT = data.MLOT;
                    decimal QTY = data.QTY;
                    string REPORT_TIME = _query.GetDBTimeToString();
                    string ACCOUNT_NO = data.ACCOUNT_NO;
                    string COMMENT = data.COMMENT;
                    string INPUT_FORM_NAME = data.INPUT_FORM_NAME;
                    bool LotRecKeyPartFlag = _wipAction.LotRecordKeyPart(LOT, MLOT, QTY, DATA_LINK_SID, REPORT_TIME, ACCOUNT_NO, COMMENT, INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDt);

                    //回寫到Session中
                    session.Add("Key", _SessionToken.Key);
                    session.Add("Expiration", _SessionToken.Expiration.ToString("yyyy-MM-dd HH:mm:ss"));
                    SessionHelper.UpdateToken(_SessionToken);

                    if (LotRecKeyPartFlag == true)
                    {//回傳資料格式

                        var result = new
                        {
                            result = true,
                            data = LotDt
                        };


                        string json = JsonConvert.SerializeObject(result);

                        HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessageH5;
                    }
                    else
                    {
                        var result = new
                        {
                            result = false,
                            LOT = LotDt
                        };


                        string json = JsonConvert.SerializeObject(result);

                        HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessageH5;
                    }
                    // 將token 存入到session
                    
                   
                }
                else
                {
                    var result = new
                    {
                        result = false,
                        LOT = "token is null "
                    };



                    string json = JsonConvert.SerializeObject(result);

                    HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessageH5;
                }
                #endregion

            }
            catch (Exception ex)
            {
                //log.Error(ex.Message);
                //HttpResponseMessage httpResponseMessageerror = Request.CreateResponse(HttpStatusCode.Forbidden);
                //httpResponseMessageerror.Content = new StringContent(ex.Message, System.Text.Encoding.UTF8, "application/json");
                //return httpResponseMessageerror;
                var result = new
                {
                    result = false,
                    Msg = ex.Message
                };
                string json = JsonConvert.SerializeObject(result);

                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;
                //throw;
            }

        }

        public class LotFinishedModel
        {
            public string LOT { get; set; }
            public decimal REASON_SID { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotFinished")]
        public string Post([FromBody] LotFinishedModel data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                decimal REASON_SID = data.REASON_SID;
                //string[] Users_List = new string[1];
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotFinished_Flag = _wipAction.LotFinished(Lots_List, REASON_SID, DATA_LINK_SID, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotFinished_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "LotFinished SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  LotFinished fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }

        public class LotUNFinished
        {
            public string LOT { get; set; }
            public decimal REASON_SID { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotUNFinished")]
        public string Post([FromBody] LotUNFinished data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                decimal REASON_SID = data.REASON_SID;
                //string[] Users_List = new string[1];
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotUNFinished_Flag = _wipAction.LotUnFinished(Lots_List, REASON_SID, DATA_LINK_SID, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotUNFinished_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "LotUNTerminated SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  Lot UNFinished fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
                //var result = new
                //{
                //    result = false,
                //    Msg = "Token Verify Fail !",
                //    SID = ""
                //};

                //return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
            }
        }

        public class LotTerminated
        {
            public string LOT { get; set; }
            public decimal REASON_SID { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotTerminated")]
        public string Post([FromBody] LotTerminated data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                decimal REASON_SID = data.REASON_SID;
                //string[] Users_List = new string[1];
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotTerminated_Flag = _wipAction.LotTerminated(Lots_List, REASON_SID, DATA_LINK_SID, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotTerminated_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "LotTerminated SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  LotTerminated fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }

        public class LotUNTerminated
        {
            public string LOT { get; set; }
            public decimal REASON_SID { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotUNTerminated")]
        public string Post([FromBody] LotUNTerminated data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                decimal REASON_SID = data.REASON_SID;
                //string[] Users_List = new string[1];
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotUNTerminated_Flag = _wipAction.LotUnTerminated(Lots_List, REASON_SID, DATA_LINK_SID, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotUNTerminated_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Lot UNTerminated SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  LotUNTerminated fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }

        public class LotHold
        {
            public string LOT { get; set; }
            public decimal REASON_SID { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotHold")]
        public string Post([FromBody] LotHold data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                decimal REASON_SID = data.REASON_SID;
                //string[] Users_List = new string[1];
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotTerminated_Flag = _wipAction.LotHold(Lots_List,REASON_SID, DATA_LINK_SID, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotTerminated_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Lot Hold SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  Lot Hold fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }

        public class LotHoldRelease
        {
            public string LOT { get; set; }
            public decimal WIP_LOT_HOLD_HIST_SID { get; set; }
            public decimal RELEASE_REASON_SID { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotHoldRelease")]
        public string Post([FromBody] LotHoldRelease data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                decimal WIP_LOT_HOLD_HIST_SID = data.WIP_LOT_HOLD_HIST_SID;
                decimal REASON_SID = data.RELEASE_REASON_SID;
                //string[] Users_List = new string[1];
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotTerminated_Flag = _wipAction.LotHoldRelease(Lots_List, WIP_LOT_HOLD_HIST_SID, REASON_SID, DATA_LINK_SID, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotTerminated_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Lot Hold Release SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  Lot Hold Release fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }

        public class LotReassignOperation
        {
            public string LOT { get; set; }
            public int NEW_OPER_SEQ { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotReassignOperation")]
        public string Post([FromBody] LotReassignOperation data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;

                int NEW_OPER_SEQ = data.NEW_OPER_SEQ;
                string Users_NO = data.USER_NO;

                //string[] Eqps_List = new string[1];
                //string Eqps_List = "EQTW-1";
                string ReportTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");


                bool LotTerminated_Flag = _wipAction.LotReassignOperation(Lots_List, DATA_LINK_SID,NEW_OPER_SEQ, ReportTime, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotTerminated_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Lot Lot Reassign Operation SUCCESS!!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  Lot Reassign Operation fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }

        public class LotStateChangeOperation
        {
            public string LOT { get; set; }
            public string NEW_STATE_CODE { get; set; }
            public string REASON_CODE { get; set; }
            public string REPORT_TIME { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }
        [Route("api/WIP/LotStateChange")]
        public string Post([FromBody] LotStateChangeOperation data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //使用物件
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                WeYuWIP_H5.WIPQuery_H5 _wipQuery = new WIPQuery_H5();
                //開始處理
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = data.LOT;
                string NEW_STATE_CODE = data.NEW_STATE_CODE;
                string REASON_CODE = data.REASON_CODE;
                string Users_NO = data.USER_NO;
                string REPORT_TIME = data.REPORT_TIME;
                if (data.REPORT_TIME.ToUpper() == "NOW" || data.REPORT_TIME == "")
                    REPORT_TIME = _wipQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                bool LotTerminated_Flag = _wipAction.LotStateChange(DATA_LINK_SID,Lots_List,NEW_STATE_CODE,REASON_CODE,REPORT_TIME, Users_NO, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);

                if (LotTerminated_Flag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Lot State Change Success !!";
                }
                else
                {
                    throw new Exception("LOT:[" + data.LOT + "]  Lot State Change fail!!");
                }
            }
            else
            {
                throw new Exception("Token Verify Fail !");
            }
        }
    }
}
