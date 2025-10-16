using log4net;
using log4net.Config;
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
    public class OptSqlController : ApiController
    {
        //static WeYuDB.DBQuery MyDBQuery = new DBQuery();
        //static WeYuFunctionLibrary.SecFunction secfun = new SecFunction(MyDBQuery);
        //static WeYuBiFun wbfun = new WeYuBiFun(MyDBQuery);
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        public static ILog log;

        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }

        public class OptSQL
        {
            public string SQ { get; set; }
        }

        public HttpResponseMessage Post([FromBody] OptSQL oDATA)
        {
            try
            {
                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(OptSqlController));

                //IEnumerable<string> TokenKeyheaderValues = Request.Headers.GetValues("TokenKey");
                //IEnumerable<string> SQheaderValues = Request.Headers.GetValues("SQ");

                if (session["Key"] != null)
                {

                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    //string TokenKey = TokenKeyheaderValues.First();
                    string strSql = oDATA.SQ;

                    if (strSql.ToUpper().Contains("DELETE") || strSql.ToUpper().Contains("DROP") || strSql.ToUpper().Contains("INSERT") || strSql.ToUpper().Contains("UPDATE") || strSql.ToUpper().Contains("ALTER"))
                    {
                        throw new Exception("SQL IS ILLEGAL");
                    }
                    //DataTable dt = MyDBQuery.GetTable(strSql);

                    DataSet MDet = MyDBQuery.GetReader(ref _SessionToken, strSql);
                    SessionHelper.UpdateToken(_SessionToken);

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
