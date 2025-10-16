using MESH5_WEBAPI_20250228V2.Helper;
using System;
using System.Data;
using System.Net;
using System.Web.Http;
using WeYuTOL_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_TOLController : ApiController
    {
        // GET: api/H5_TOL
        // public IEnumerable<string> Get()
        // {
        //     return new string[] { "value1", "value2" };
        // }

        // GET: api/H5_TOL/5
        // public string Get(int id)
        // {
        //     return "value";
        // }
        
        /// <summary>
        /// 模具狀態變更請求物件
        /// </summary>
        public class TOLStatusChangeRequest
        {
            /// <summary>
            /// 模具編號（TOL_NO）
            /// </summary>
            public string TOL_NO { get; set; }

            /// <summary>
            /// 要變更的模具狀態代碼（TOL_STATUS_CODE）
            /// </summary>
            public string TOL_STATUS_CODE { get; set; }

            /// <summary>
            /// 變更原因代碼（REASON_CODE）
            /// </summary>
            public string REASON_CODE { get; set; } = string.Empty;

            /// <summary>
            /// 擴充屬性欄位 ATTR01
            /// </summary>
            public string ATTR01 { get; set; }

            /// <summary>
            /// 擴充屬性欄位 ATTR02
            /// </summary>
            public string ATTR02 { get; set; }

            /// <summary>
            /// 擴充屬性欄位 ATTR03
            /// </summary>
            public string ATTR03 { get; set; }

            /// <summary>
            /// 擴充屬性欄位 ATTR04
            /// </summary>
            public string ATTR04 { get; set; }

            /// <summary>
            /// 擴充屬性欄位 ATTR05
            /// </summary>
            public string ATTR05 { get; set; }

            /// <summary>
            /// 是否更新 TOL_MASTER 主檔狀態（true 表示要更新）
            /// </summary>
            public bool UPDATE_TOL_MASTER { get; set; }

            /// <summary>
            /// 備註文字（COMMENT）
            /// </summary>
            public string COMMENT { get; set; }

            /// <summary>
            /// 建立者帳號（通常為操作者登入帳號）
            /// </summary>
            public string CREATE_USER { get; set; }
        }
        
        /// <summary>
        /// 
        /// </summary>
        /// <param name="req"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/H5_TOL/TOL_STATUS_CHANGE")]
        public IHttpActionResult Post([FromBody] TOLStatusChangeRequest req)
        {
            var session = System.Web.HttpContext.Current?.Session;
            if (session == null || session["Key"] == null)
            {
                return Content(HttpStatusCode.Unauthorized, new { status = "error", message = "Session token is missing." });
            }

            // 抓 Token
            string sessionToken = "WeyuTech" + session["Key"];
            DateTime sessionExpiration = Convert.ToDateTime(session["Expiration"]);

            // 建立 Token 實體
            var token = new WeYuSEC_H5S.WeyuToken(sessionToken, sessionExpiration);

            // 執行主邏輯
            var action = new TOLAction_H5();
            var query = new TOLQuery_H5();

            decimal sid = query.GetSID();
            string reportTime = query.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");
            string formName = "POSTMAN";

            IHttpActionResult result;
            if (string.IsNullOrWhiteSpace(req.REASON_CODE))
            {
                // 傳 reason 走「不含 REASON_CODE」的多載
                result = action.TOLStatusChange(
                    sid,
                    req.TOL_NO,
                    req.TOL_STATUS_CODE,
                    reportTime,
                    req.CREATE_USER,
                    formName,
                    req.ATTR01,
                    req.ATTR02,
                    req.ATTR03,
                    req.ATTR04,
                    req.ATTR05,
                    req.UPDATE_TOL_MASTER,
                    req.COMMENT,
                    ref token,
                    out DataTable output
                );
            }
            else
            {
                // 有傳 reason 走「含 REASON_CODE」的多載
                result = action.TOLStatusChange(
                    sid,
                    req.TOL_NO,
                    req.TOL_STATUS_CODE,
                    reportTime,
                    req.CREATE_USER,
                    formName,
                    req.REASON_CODE,
                    req.ATTR01,
                    req.ATTR02,
                    req.ATTR03,
                    req.ATTR04,
                    req.ATTR05,
                    req.UPDATE_TOL_MASTER,
                    req.COMMENT,
                    ref token,
                    out DataTable output
                );
            }

            // 回存 session
            session["Key"] = token.Key;
            session["Expiration"] = token.Expiration;
            SessionHelper.UpdateToken(token);

            return result;
        }


        // POST: api/H5_TOL
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/H5_TOL/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/H5_TOL/5
        public void Delete(int id)
        {
        }
    }
}
