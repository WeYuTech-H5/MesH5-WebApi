using MESH5_WEBAPI_20250228V2.Helper;
using System;
using System.Data;
using System.Net;
using System.Web.Http;
using WeYuUMM_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_UMMController : ApiController
    {
        // GET: api/H5_UMM
        // public IEnumerable<string> Get()
        // {
        //     return new string[] { "value1", "value2" };
        // }

        // GET: api/H5_UMM/5
        // public string Get(int id)
        // {
        //     return "value";
        // }
        
        /// <summary>
        /// 模具狀態變更請求物件
        /// </summary>
        public class UMMStatusChangeRequest
        {
            /// <summary>
            /// 模具編號（UMM_NO）
            /// </summary>
            public string UMM_NO { get; set; }

            /// <summary>
            /// 要變更的模具狀態代碼（UMM_STATUS_CODE）
            /// </summary>
            public string UMM_STATUS_CODE { get; set; }

            /// <summary>
            /// 變更原因代碼（REASON_CODE）
            /// </summary>
            public string REASON_CODE { get; set; }

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
            /// 是否更新 UMM_MASTER 主檔狀態（true 表示要更新）
            /// </summary>
            public bool UPDATE_UMM_MASTER { get; set; }

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
        [Route("api/H5_UMM/UMM_STATUS_CHANGE")]
        public IHttpActionResult Post([FromBody] UMMStatusChangeRequest req)
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
            var action = new UMMAction_H5();
            var query = new UMMQuery_H5();

            decimal sid = query.GetSID();
            string reportTime = query.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");
            string formName = "POSTMAN";

            var result = action.UMMStatusChange(
                sid,
                req.UMM_NO,
                req.UMM_STATUS_CODE,
                reportTime,
                req.CREATE_USER,
                formName,
                req.REASON_CODE,
                req.ATTR01,
                req.ATTR02,
                req.ATTR03,
                req.ATTR04,
                req.ATTR05,
                req.UPDATE_UMM_MASTER,
                req.COMMENT,
                ref token,
                out DataTable output
            );

            // 回存 session
            session["Key"] = token.Key;
            session["Expiration"] = token.Expiration;
            SessionHelper.UpdateToken(token);

            return result;
        }


        // POST: api/H5_UMM
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/H5_UMM/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/H5_UMM/5
        public void Delete(int id)
        {
        }
    }
}
