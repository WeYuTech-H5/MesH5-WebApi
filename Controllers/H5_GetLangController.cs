using MESH5_WEBAPI_20250228V2.Areas.HelpPage.ModelDescriptions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_GetLangController : ApiController
    {
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();

        [ModelName("H5_GetLang_Query_Data")]
        public class Query_Data
        {
            public string[] Field { get; set; }
            public string[] Oper { get; set; }
            public string[] Value { get; set; }
        }

        public HttpResponseMessage Post([FromBody] Query_Data oDATA)
        {
            string ReturnJson = "";
            JObject obj = new JObject();
            obj.Add(new JProperty("result", false));
            try
            {

                IEnumerable<string> LangCodeheaderValues = Request.Headers.GetValues("LangCode");

                string LangCode = LangCodeheaderValues.First();

                string sql = $@" SELECT A.KEYWORDS,ISNULL(B.VALUE,A.DEFAULT_VALUE) AS VALUE
                                    FROM SEC_LANG_KEYWORDS A LEFT JOIN SEC_LANG_DATA B
                                    ON A.SID = B.KEYWORD_SID AND B.LANGUAGE = '{LangCode}' ORDER BY A.KEYWORDS";

                DataTable dt = MyDBQuery.GetReader(sql);

                var result = new
                {
                    result = true,
                    data = dt
                };


                string json = JsonConvert.SerializeObject(result);

                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;
            }
            catch (Exception ex)
            {
                obj["result"] = false;
                obj.Add(new JProperty("Msg", ex.Message));
            }
            finally
            {

            }
            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            httpResponseMessage.Content = new StringContent(ReturnJson, System.Text.Encoding.UTF8, "application/json");
            return httpResponseMessage;
        }

    }
}
