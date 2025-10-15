using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using WeYuEQM_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_EQMController : ApiController
    {
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 Action_H5 = new WeYuDB_H5.DBAction_H5();
        static WeYuEQM_H5.EQMAction_H5 EQMAction_H5 = new WeYuEQM_H5.EQMAction_H5();
        static WeYuEQM_H5.EQMQuery_H5 EQMQuery_H5 = new WeYuEQM_H5.EQMQuery_H5();


        // GET: api/H5_EQM
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/H5_EQM/5
        public string Get(int id)
        {
            return "value";
        }
        [Route("api/H5_EQM/EQP_STATUS_CHANGE/")]
        public string Get(string EQP_NO, string EQP_STATUS_CODE, string REASON_CODE,
           string ATTR01, string ATTR02, string ATTR03, string ATTR04, string ATTR05, bool UPDATE_EQP_MASTER, string COMMENT, string CREATE_USER)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //開始處理
                WeYuEQM_H5.EQMAction_H5 _eqmAction = new EQMAction_H5();
                WeYuEQM_H5.EQMQuery_H5 _eqmQuery = new EQMQuery_H5();

                string INPUT_USER = CREATE_USER;
                string INPUT_FORM_NAME = "api";

                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _eqmQuery.GetSID();
                string REPORT_TIME = _eqmQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                bool ConsumeMlotFlag;
                if (REASON_CODE == string.Empty)
                {
                    ConsumeMlotFlag = _eqmAction.EQPStatusChange(DATA_LINK_SID,EQP_NO,EQP_STATUS_CODE,REPORT_TIME,INPUT_USER,INPUT_FORM_NAME,ATTR01,ATTR02,ATTR03,ATTR04,ATTR05,true,COMMENT,ref _SessionToken, out DataTable outEqpDT);
                }
                else
                {
                    ConsumeMlotFlag = _eqmAction.EQPStatusChange(DATA_LINK_SID,EQP_NO,EQP_STATUS_CODE,REPORT_TIME,INPUT_USER,INPUT_FORM_NAME,REASON_CODE,ATTR01,ATTR02,ATTR03,ATTR04,ATTR05,true,COMMENT,ref _SessionToken, out DataTable outEqpDT);
                }

                if (ConsumeMlotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;
                    SessionHelper.UpdateToken(_SessionToken);


                    return "變更" + EQP_NO + "機況 to "+ EQP_STATUS_CODE + " SUCCESS!!";
                }
                else
                {
                    return "變更" + EQP_NO + "機況 to " + EQP_STATUS_CODE + " FAIL!!"; ;
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

        public class EQPStatusChange
        {
            public string EQP_SID { get; set; }
            public string EQP_STATUS_CODE { get; set; }

            public string InputUser { get; set; }
            public string INPUT_FROM_NAME { get; set; }

            public string REASON_CODE { get; set; }
            public string ATTR01 { get; set; }
            public string ATTR02 { get; set; }
            public string ATTR03 { get; set; }
            public string ATTR04 { get; set; }
            public string ATTR05 { get; set; }

            public bool UPDATE_EQP_MASTER { get; set; }

            public string COMMENT { get; set; }
        }

        [Route("api/EQPStatusChange")]
        public HttpResponseMessage Post([FromBody] EQPStatusChange data)
        {

            try
            {

                var session = System.Web.HttpContext.Current.Session;

                #region OLD
                //if (session["Key"] != null)
                //{
                //    var sessionToken = "WeyuTech" + session["Key"];
                //    var sessionExpiration = session["Expiration"];
                //    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                //    // 
                //    #region 處理邏輯

                //    decimal DATA_LINK_SID = EQMQuery_H5.GetSID();

                //    string CheckEQP_NO = $@"SELECT * FROM EQP_MASTER WHERE EQP_SID = '{data.EQP_SID}'";
                //    var eqpset = MyDBQuery.GetReader(ref _SessionToken, CheckEQP_NO);
                //    DataTable dt_val = eqpset.Tables[0].Copy();

                //    string EQP_NO = dt_val.Rows[0]["EQP_NO"].ToString();

                //    string RePort_Time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                //    _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                //    bool ChangeEQMFlag = EQMAction_H5.EQPStatusChange(
                //         DATA_LINK_SID,
                //         EQP_NO,//EQP_NO
                //         data.EQP_STATUS_CODE,//EQP_STATUS_CODE
                //         RePort_Time, // REPORT_TIME
                //         data.InputUser, // InputUser
                //         data.INPUT_FROM_NAME,  // INPUT_FROM_NAME
                //         data.REASON_CODE, //REASON_CODE
                //         data.ATTR01, // ATTR01
                //         data.ATTR02,  // ATTR02
                //         data.ATTR03, // ATTR03
                //         data.ATTR04,  // ATTR04
                //         data.ATTR05, // ATTR05
                //         data.UPDATE_EQP_MASTER, // UPDATE_EQP_MASTER
                //         data.COMMENT,
                //         ref _SessionToken,
                //         out DataTable out_dtEQP
                //     );


                //    #endregion

                //    //回傳資料格式
                //    var result = new
                //    {
                //        result = true,
                //        Data = out_dtEQP,
                //        TokenInfo = new
                //        {
                //            Expiration = _SessionToken.Expiration
                //        }
                //    };

                //    string json = JsonConvert.SerializeObject(result);

                //    HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                //    httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                //    return httpResponseMessageH5;
                //}
                //else
                //{
                //    //throw new Exception("Token Verify Fail !");
                //    var result = new
                //    {
                //        result = false,
                //        Msg = "Token Verify Fail !"
                //    };
                //    string json = JsonConvert.SerializeObject(result);

                //    HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                //    httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                //    return httpResponseMessageH5;
                //} 
                #endregion


                var ctx = HttpContext.Current;
                var s = ctx?.Session;

                if (s == null)
                    return NeedEnableSession();

                var sessCookie = ctx.Request.Cookies["ASP.NET_SessionId"];
                var hasCookie = sessCookie != null && !string.IsNullOrEmpty(sessCookie.Value);
                var isNew = s.IsNewSession;

                //if (!hasCookie)
                //    return Fail("No session cookie (check CORS/SameSite/HTTPS).", s, HttpStatusCode.Unauthorized);

                //if (isNew && s["Key"] == null)
                //    return Fail("New session (likely recycle/abandon/load balancer).", s, HttpStatusCode.Unauthorized);

                //// 必要欄位
                //if (s["Key"] == null)
                //    return Fail("Session exists but Key missing (not set or cleared).", s, HttpStatusCode.Unauthorized);

                //if (s["Expiration"] == null)
                //    return Fail("Session exists but Expiration missing.", s, HttpStatusCode.Unauthorized);

                //// 解析 Expiration
                //if (!DateTime.TryParse(Convert.ToString(s["Expiration"]), out var exp))
                //    return Fail("Session Expiration parse failed.", s, HttpStatusCode.Unauthorized);

                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                // 
                #region 處理邏輯

                decimal DATA_LINK_SID = EQMQuery_H5.GetSID();

                string CheckEQP_NO = $@"SELECT * FROM EQP_MASTER WHERE EQP_SID = '{data.EQP_SID}'";
                var eqpset = MyDBQuery.GetReader(ref _SessionToken, CheckEQP_NO);
                SessionHelper.UpdateToken(_SessionToken);

                DataTable dt_val = eqpset.Tables[0].Copy();

                string EQP_NO = dt_val.Rows[0]["EQP_NO"].ToString();

                string RePort_Time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                
                
                bool ChangeEQMFlag;
                DataTable out_dtEQP;
                if (string.IsNullOrWhiteSpace(data.REASON_CODE))
                {
                    // 傳 reason 走「不含 REASON_CODE」的多載
                    ChangeEQMFlag = EQMAction_H5.EQPStatusChange(
                        DATA_LINK_SID,
                        EQP_NO,
                        data.EQP_STATUS_CODE?.Trim(),
                        RePort_Time,
                        data.InputUser?.Trim(),
                        data.INPUT_FROM_NAME?.Trim(),
                        data.ATTR01,
                        data.ATTR02,
                        data.ATTR03,
                        data.ATTR04,
                        data.ATTR05,
                        data.UPDATE_EQP_MASTER,
                        data.COMMENT,
                        ref _SessionToken,
                        out out_dtEQP
                    );
                }
                else
                {
                    // 有傳 reason 走「含 REASON_CODE」的多載
                    ChangeEQMFlag = EQMAction_H5.EQPStatusChange(
                        DATA_LINK_SID,
                        EQP_NO,
                        data.EQP_STATUS_CODE?.Trim(),
                        RePort_Time,
                        data.InputUser?.Trim(),
                        data.INPUT_FROM_NAME?.Trim(),
                        data.REASON_CODE?.Trim(),
                        data.ATTR01,
                        data.ATTR02,
                        data.ATTR03,
                        data.ATTR04,
                        data.ATTR05,
                        data.UPDATE_EQP_MASTER,
                        data.COMMENT,
                        ref _SessionToken,
                        out out_dtEQP
                    );
                }


                #endregion

                //回傳資料格式
                var result = new
                {
                    result = true,
                    Data = out_dtEQP,
                    TokenInfo = new
                    {
                        Expiration = _SessionToken.Expiration
                    }
                };

                string json = JsonConvert.SerializeObject(result);
                SessionHelper.UpdateToken(_SessionToken);
                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;


            }
            catch (Exception ex)
            {
                var result = new
                {
                    result = false,
                    Msg = ex.Message
                };
                string json = JsonConvert.SerializeObject(result);

                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;
            }

        }

        // ===== 共用小工具 =====
        private HttpResponseMessage Json200(object obj)
        {
            var json = JsonConvert.SerializeObject(obj);
            var resp = Request.CreateResponse(HttpStatusCode.OK);
            resp.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            return resp;
        }

        private HttpResponseMessage Fail(string msg, System.Web.SessionState.HttpSessionState s, HttpStatusCode code)
        {
            // 也可以在這裡寫 log4net：log.Warn(msg + ...);
            var obj = new
            {
                result = false,
                Msg = msg,
                Diag = new
                {
                    SessionId = s?.SessionID,
                    IsNewSession = s?.IsNewSession
                }
            };
            var resp = Request.CreateResponse(code);
            resp.Content = new StringContent(JsonConvert.SerializeObject(obj), System.Text.Encoding.UTF8, "application/json");
            return resp;
        }

        private HttpResponseMessage NeedEnableSession()
        {
            var obj = new { result = false, Msg = "SessionState not enabled for this request." };
            var resp = Request.CreateResponse(HttpStatusCode.ExpectationFailed);
            resp.Content = new StringContent(JsonConvert.SerializeObject(obj), System.Text.Encoding.UTF8, "application/json");
            return resp;
        }

        // PUT: api/H5_EQM/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/H5_EQM/5
        public void Delete(int id)
        {
        }
    }
}
