using log4net;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class WIPOPI_SCHEDULE_WDOEAQ_CICOController : ApiController
    {
        public static ILog log;
        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 Action_H5 = new WeYuDB_H5.DBAction_H5();

        public class OPI_SCHEDULE_WDOEA_INFO
        {
            public string HIST_SID { get; set; }
            public string OK_QTY { get; set; }
            public string NG_QTY { get; set; }
            public string COMMENT { get; set; }
            public string EDIT_USER { get; set; }

        }

        /// <summary>
        /// OPI SCHEDULE WDOEA OK/NG UPDATE 
        /// </summary>
        public HttpResponseMessage Post([FromBody] OPI_SCHEDULE_WDOEA_INFO CI_data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));
                try
                {
                    if (session["Key"] != null)
                    {
                        var sessionToken = "WeyuTech" + session["Key"];
                        var sessionExpiration = session["Expiration"];
                        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                        SessionHelper.UpdateToken(_SessionToken);
                        //  取得 HTTP Header 內的 Token
                        //var request = HttpContext.Current.Request;
                        //var tokenKey = request.Headers["TokenKey"];
                        //var TokenExpiry = request.Headers["TokenExpiry"];
                        //string FinalTokenKey = "WeyuTech" + tokenKey;

                        //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

                        //異動資料的準備
                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                        string Update_Sql = $@"update WIP_OPI_WDOEACICO_HIST 
                        set  OK_QTY='{CI_data.OK_QTY}' , NG_QTY='{CI_data.NG_QTY}',COMMENT='{CI_data.COMMENT}',EDIT_USER='{CI_data.EDIT_USER}', EDIT_TIME='{now_time_string}'  
                        where WIP_OPI_WDOEACICO_HIST_SID='{CI_data.HIST_SID}'";
                        //開始進行交易
                        try
                        {
                            List<string> SQLs = new List<string>();
                            SQLs.Add(Update_Sql);
                            string[] SQLs_list = SQLs.ToArray();
                            DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            SessionHelper.UpdateToken(_SessionToken);

                            var result = new
                            {
                                result = true,
                                Msg = "The CHECK-OUT Transaction has been completed",
                                SID = CI_data.HIST_SID
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {

                            throw new Exception("UPDATE Fail");
                        }

                    }
                    else
                    {
                        throw new Exception("Token Verify Fail !");
                    }
                   

                }

                catch (Exception ex)
                {
                    log.Error(ex.Message);
                    //obj["result"] = false;
                    //obj.Add(new JProperty("Msg", ex.Message));
                    //obj.Add(new JProperty("SID", ""));
                    //HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.ExpectationFailed, obj);
                    //return httpResponseMessage;
                    var result = new
                    {
                        result = false,
                        Msg = ex.Message,
                        SID = "" 
                    };

                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                }

            }

        }

        public class OPI_SCHEDULE_WDOEA_UPDATE_INFO
        {
            public string HIST_SID { get; set; }
            public string COMPLETED { get; set; }
        }

        [Route("api/H5_WIP_COMPLETE")]
        public HttpResponseMessage Post([FromBody] OPI_SCHEDULE_WDOEA_UPDATE_INFO CI_data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));
                try
                {
                    if (session["Key"] != null)
                    {
                        var sessionToken = "WeyuTech" + session["Key"];
                        var sessionExpiration = session["Expiration"];
                        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                        SessionHelper.UpdateToken(_SessionToken);

                        //異動資料的準備
                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                        string Update_Sql = "";

                        if (CI_data.COMPLETED == "Y")
                        {
                            Update_Sql = $@"update WIP_OPI_WDOEACICO_HIST 
                        set  COMPLETED='{CI_data.COMPLETED}', COMPLETED_TIME='{now_time_string}'  
                        where WIP_OPI_WDOEACICO_HIST_SID='{CI_data.HIST_SID}'";
                        }
                        else
                        {
                            Update_Sql = $@"update WIP_OPI_WDOEACICO_HIST 
                         set  COMPLETED='{CI_data.COMPLETED}', COMPLETED_TIME=NULL  
                        where WIP_OPI_WDOEACICO_HIST_SID='{CI_data.HIST_SID}'";
                        }


                        //開始進行交易
                        try
                        {
                            List<string> SQLs = new List<string>();
                            SQLs.Add(Update_Sql);
                            string[] SQLs_list = SQLs.ToArray();
                            //DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            Action_H5.doExecute(SQLs_list);
                            var result = new
                            {
                                result = true,
                                Msg = "The WIP_COMPLETE Transaction has been completed",
                                SID = CI_data.HIST_SID
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {

                            throw new Exception("UPDATE Fail");
                        }

                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
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
                    var result = new
                    {
                        result = false,
                        Msg = ex.Message,
                        SID = ""
                    };

                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                }

            }

        }

        public class OPI_SCHEDULE_WDOEA_CAV_UPDATE_INFO
        {
            public string HIST_SID { get; set; }
            public string OPI_CAV { get; set; }
        }

        [Route("api/H5_WIP_CAV_UPDATE")]
        public HttpResponseMessage Post([FromBody] OPI_SCHEDULE_WDOEA_CAV_UPDATE_INFO CI_data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));
                try
                {
                    if (session["Key"] != null)
                    {
                        var sessionToken = "WeyuTech" + session["Key"];
                        var sessionExpiration = session["Expiration"];
                        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                        SessionHelper.UpdateToken(_SessionToken);

                        //異動資料的準備
                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                        string Update_Sql = "";

                       
                        Update_Sql = $@"update WIP_OPI_WDOEACICO_HIST 
                        set  COMPLETED='{CI_data.OPI_CAV}'  
                        where WIP_OPI_WDOEACICO_HIST_SID='{CI_data.HIST_SID}'";

                        //開始進行交易
                        try
                        {
                            List<string> SQLs = new List<string>();
                            SQLs.Add(Update_Sql);
                            string[] SQLs_list = SQLs.ToArray();
                            //DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            Action_H5.doExecute(SQLs_list);
                            var result = new
                            {
                                result = true,
                                Msg = "The WIP_CAV Transaction has been completed",
                                SID = CI_data.HIST_SID
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {

                            throw new Exception("UPDATE Fail");
                        }

                    }
                    else
                    {
                        throw new Exception("Token Verify Fail !");
                    }


                }

                catch (Exception ex)
                {
                    log.Error(ex.Message);
                    var result = new
                    {
                        result = false,
                        Msg = ex.Message,
                        SID = ""
                    };

                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                }

            }

        }

        public class OPI_SCHEDULE_WDOEA_COMPLETE
        {
            public string ZZ_KAOSU_PROD_SCHEDULE_SID { get; set; }
            public string COMPLETED { get; set; }
            public string LOGIN_USER { get; set; }
        }

        /// <summary>
        /// 更新OPI狀態 (現在為哪一隻報工在執行)
        /// </summary>
        /// <param name="CI_data"></param>
        /// <returns></returns>
        [Route("api/H5_WIP_OPI_COMPLETE")]
        public HttpResponseMessage Post([FromBody] OPI_SCHEDULE_WDOEA_COMPLETE CI_data)
        {
            var session = System.Web.HttpContext.Current.Session;

            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOController));

            JObject obj = new JObject();
            obj.Add(new JProperty("result", false));
            try
            {
                if (session["Key"] != null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);

                    //異動資料的準備
                    DateTime now_time = MyDBQuery.GetDBTime();
                    string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                    string Update_Sql = "";


                    Update_Sql = $@"update WIP_OPI_WDOEACICO_HIST 
                    set  COMPLETED='{CI_data.COMPLETED}' , COMPLETED_USER = '{CI_data.LOGIN_USER}' , COMPLETED_TIME = '{now_time_string}'
                    where ZZ_KAOSU_PROD_SCHEDULE_SID='{CI_data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";

                    //開始進行交易
                    try
                    {
                        List<string> SQLs = new List<string>();
                        SQLs.Add(Update_Sql);
                        string[] SQLs_list = SQLs.ToArray();
                        //DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                        Action_H5.doExecute(SQLs_list);

                        //找到下一筆開頭 將開始時間填入(等於now_time_string)
                        //找到目前最後一筆Y 機台+日期
                        string GetInfoSQL = $@"SELECT * FROM WIP_OPI_WDOEACICO_HIST where ZZ_KAOSU_PROD_SCHEDULE_SID='{CI_data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";
                        _SessionToken.Key = "WeyuTech"+_SessionToken.Key;
                        var GetInfo = MyDBQuery.GetReader(ref _SessionToken, GetInfoSQL);
                        DataTable GetInfoDt = GetInfo.Tables[0].Copy();
                        if (GetInfoDt.Rows.Count > 0)
                        {
                            string shiftDay = (GetInfoDt.Rows[0]["SHIFT_DAY"] is DateTime dt
                                ? dt
                                : DateTime.Parse(GetInfoDt.Rows[0]["SHIFT_DAY"].ToString(), new CultureInfo("zh-TW"))
                            ).ToString("yyyy-MM-dd");
                            //找到本次更新資訊
                            string Update_Check_SQL = $@"SELECT TOP 1 * 
                                    FROM WIP_OPI_WDOEACICO_HIST 
                                    WHERE EQP_NO='{GetInfoDt.Rows[0]["EQP_NO"].ToString()}' AND SHIFT_DAY='{shiftDay}'
                                    AND COMPLETED='N'
                                    ORDER BY CHECK_IN_TIME";

                            _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                            var UpInfo = MyDBQuery.GetReader(ref _SessionToken, Update_Check_SQL);
                            DataTable UpInfoDt = UpInfo.Tables[0].Copy();

                            if (UpInfoDt.Rows.Count > 0)
                            {
                                string UpdateSQL = $@"UPDATE WIP_OPI_WDOEACICO_HIST
                                                SET REAL_CHECK_IN_TIME = '{now_time_string}'
                                                WHERE ZZ_KAOSU_PROD_SCHEDULE_SID = '{UpInfoDt.Rows[0]["ZZ_KAOSU_PROD_SCHEDULE_SID"].ToString()}'";

                                Action_H5.doExecute(UpdateSQL);
                            }

                        }


                        var result = new
                        {
                            result = true,
                            Msg = "The WIP Complete Transaction has been completed",
                            SID = CI_data.ZZ_KAOSU_PROD_SCHEDULE_SID
                        };

                        return Request.CreateResponse(HttpStatusCode.OK, result);
                    }
                    catch (Exception ex)
                    {

                        //throw new Exception("UPDATE Fail");
                        var result = new
                        {
                            result = false,
                            Msg = "UPDATE Fail !",
                            SID = ""
                        };
                        return Request.CreateResponse(HttpStatusCode.OK, result);

                    }

                }
                else
                {
                    //throw new Exception("Token Verify Fail !");
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
                var result = new
                {
                    result = false,
                    Msg = ex.Message,
                    SID = ""
                };

                return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
            }

            

        }

        public class OPI_SCHEDULE_WDOEA_CAV_UPDATE
        {
            public string WIP_OPI_WDOEACICO_HIST_SID { get; set; }
            public string OPI_CAV { get; set; }
        }

        /// <summary>
        /// 更新OPI狀態 (現在為哪一隻報工在執行)
        /// </summary>
        /// <param name="CI_data"></param>
        /// <returns></returns>
        [Route("api/H5_WIP_OPI_CAV_UPDATE")]
        public HttpResponseMessage Post([FromBody] OPI_SCHEDULE_WDOEA_CAV_UPDATE CI_data)
        {
            var session = System.Web.HttpContext.Current.Session;

            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOController));

            JObject obj = new JObject();
            obj.Add(new JProperty("result", false));
            try
            {
                if (session["Key"] != null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);

                    //異動資料的準備
                    DateTime now_time = MyDBQuery.GetDBTime();
                    string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                    string Update_Sql = "";


                    Update_Sql = $@"update WIP_OPI_WDOEACICO_HIST 
                    set  OPI_CAV='{CI_data.OPI_CAV}' 
                    where WIP_OPI_WDOEACICO_HIST_SID='{CI_data.WIP_OPI_WDOEACICO_HIST_SID}'";

                    //開始進行交易
                    try
                    {
                        List<string> SQLs = new List<string>();
                        SQLs.Add(Update_Sql);
                        string[] SQLs_list = SQLs.ToArray();
                        //DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                        Action_H5.doExecute(SQLs_list);
                        var result = new
                        {
                            result = true,
                            Msg = "The WIP CAV Transaction has been completed",
                            SID = CI_data.WIP_OPI_WDOEACICO_HIST_SID
                        };

                        return Request.CreateResponse(HttpStatusCode.OK, result);
                    }
                    catch (Exception ex)
                    {

                        //throw new Exception("UPDATE Fail");
                        var result = new
                        {
                            result = false,
                            Msg = "UPDATE Fail !",
                            SID = ""
                        };
                        return Request.CreateResponse(HttpStatusCode.OK, result);

                    }

                }
                else
                {
                    //throw new Exception("Token Verify Fail !");
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
                var result = new
                {
                    result = false,
                    Msg = ex.Message,
                    SID = ""
                };

                return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
            }



        }


    }
}
