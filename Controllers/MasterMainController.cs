using log4net;
using log4net.Config;
using MESH5_WEBAPI_20250228V2.Areas.HelpPage.ModelDescriptions;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace WeyuBiApi.Controllers
{
    public class MasterMainController : ApiController
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

        [ModelName("MasterMain_Query_Data")]
        public class Query_Data
        {
            public string[] Field { get; set; }
            public string[] Oper { get; set; }
            public string[] Value { get; set; }
        }
        public HttpResponseMessage Post([FromBody] Query_Data oDATA)
        {

            var session = System.Web.HttpContext.Current.Session;
            try
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(MasterMainController));

                if (session["Key"] != null)
                {

                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));

                    //IEnumerable<string> TokenKeyheaderValues = Request.Headers.GetValues("TokenKey");
                    IEnumerable<string> SmartQuerySIDNoheaderValues = Request.Headers.GetValues("SID");

                    //string TokenKey = TokenKeyheaderValues.First();
                    string SID = SmartQuerySIDNoheaderValues.First();

                    string sql = $"SELECT * FROM BAS_MASTER_MAINTAIN WHERE MM_SID={SID}";

                    //DataSet MDet = MyDBQuery.GetReader($@"WeyuTech{TokenKey}", sql);
                    DataSet MDet = MyDBQuery.GetReader(ref _SessionToken, sql);
                    SessionHelper.UpdateToken(_SessionToken);

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
                    DataTable TokenInfo = MDet.Tables[1].Copy();
                    var Tokendt = TokenInfo.Rows[0];
                    #region H5
                    var data1 = new
                    {
                        result = true,
                        data = MDt, // DataTable 直接序列化
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

    }
}
