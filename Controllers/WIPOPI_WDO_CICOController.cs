using log4net;
using log4net.Config;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Transactions;
using System.Web;
using System.Web.Http;

namespace WeyuBiApi.Controllers
{
    /// <summary>
    /// WIP OPI FOR WDOEAQ CHECK-IN、CHECK-OUT、 CANCEL API.
    /// </summary>
    public class WIPOPI_WDO_CICOController : ApiController
    {
        /// <summary>
        /// Gets some very important data from the server.
        /// </summary>
        public static ILog log;
        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }
        public static string APIToken
        {
            get
            {
                return "WEYU"+ ConfigurationSettings.AppSettings["APIToken"];
            }
        }

        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 Action_H5 = new WeYuDB_H5.DBAction_H5();

        public class H5OPI_WDO_CI_INFO
        {
            public string WO_ID { get; set; }
            public string DEP_ID { get; set; }
            public string OPE_ID { get; set; }
            public string EQP_ID { get; set; }
            public string ACCOUNT_ID { get; set; }
            public string NUM_OF_ACC { get; set; }
            public string CI_TIME { get; set; }
            public string EDIT_USER { get; set; }
        }

        public class H5_OPI_WDO_CO_INFO
        {
            public string HIST_SID { get; set; }
            public string CO_TIME { get; set; }
            public string OK_QTY { get; set; }
            public string NG_QTY { get; set; }
            public string COMMENT { get; set; }
            public string EDIT_USER { get; set; }

        }

        public class H5_OPI_WDO_Del_INFO
        {
            public string HIST_SID { get; set; }
            public string EDIT_USER { get; set; }
        }

        /// <summary>
        /// OPI WDOEA CHECK-IN API.
        /// </summary>
        public HttpResponseMessage Post([FromBody] H5OPI_WDO_CI_INFO CI_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDO_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));

                var session = System.Web.HttpContext.Current.Session;
                try
                {
                    if (session["Key"] != null)
                    {
                        var sessionToken = "WeyuTech" + session["Key"];
                        var sessionExpiration = session["Expiration"];
                        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                        SessionHelper.UpdateToken(_SessionToken);
                        //異動資料的準備
                        string WO_ID = "";
                        string DEP_ID = "";
                        string OPE_ID = "";
                        string EQP_ID = "";
                        string ACCOUNT_ID = "";
                        string NUM_OFF_ACC = "1";
                        string CI_TIME = "";
                        string EDIT_USER = "";
                        string EDIT_TIME = "";

                        // 2024-05-17 修改同一機台、時間不可報工
                        string Check_Info_SQL = "select TOP 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_OUT_TIME IS NULL AND EQP_NO='{0}'";
                        string Insert_Sql = @"INSERT INTO [dbo].[WIP_OPI_WDOEACICO_HIST]
                                            ([WIP_OPI_WDOEACICO_HIST_SID]
                                                ,[WO]
                                                ,[DEPT_NO]
                                               ,[OPERATION_CODE]
                                               
                                               ,[ACCOUNT_NO]
                                               ,[NUM_OF_ACC]
                                               ,[CHECK_IN_TIME]
                                               ,[ENABLE_FLAG]
                                               ,[CREATE_USER]
                                               ,[CREATE_TIME]
                                               ,[EDIT_USER]
                                               ,[EDIT_TIME])
                                                VALUES ({0},'{1}','{2}','{3}','{4}','{5}','{6}','Y','{7}','{8}','{7}','{8}')"
                                                            ;
                        string[] UP_SQLS = null; ;

                        //主程式,檢查上傳資料是否齊全
                        double sid = 0;
                        if (CI_data != null && CI_data.WO_ID != "" && CI_data.OPE_ID != "")
                        {
                            // 資料處理前的檢查

                            bool CIExistFlag = false;
                            //沒有機台,所以獨立事件都可以ckeck-in
                            //抓取更新時間
                            DateTime now_time = MyDBQuery.GetDBTime();
                            string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                            sid = Convert.ToDouble(now_time.Subtract(DateTime.Parse("2013-04-01")).TotalMilliseconds);
                            Random Rad = new Random();//亂數種子
                            sid = sid * 100 + Rad.Next(0, 100);

                            //準備更新的SQL 
                            Insert_Sql = string.Format(Insert_Sql, sid, CI_data.WO_ID, CI_data.DEP_ID, CI_data.OPE_ID, CI_data.ACCOUNT_ID, CI_data.NUM_OF_ACC, CI_data.CI_TIME, CI_data.EDIT_USER, now_time_string);
                            //開始進行交易
                            try
                            {
                                List<string> SQLs = new List<string>();
                                SQLs.Add(Insert_Sql);
                                string[] SQLs_list = SQLs.ToArray();
                                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                                SessionHelper.UpdateToken(_SessionToken);

                                var result = new
                                {
                                    result = true,
                                    Msg = "There CHECK-IN Transation has been completed ",
                                    SID = sid.ToString(),
                                    TokenInfo = new
                                    {
                                        Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                    }
                                };

                                return Request.CreateResponse(HttpStatusCode.OK, result);
                            }
                            catch (Exception ex)
                            {
                                throw new Exception("CHECK-IN FAIL");
                            }


                        }
                        else
                        {
                            //資料不齊全Reject
                            var result = new
                            {
                                result = false,
                                Msg = "There is a problem with the upload parameters ",
                                SID = ""
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
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

        /// <summary>
        /// OPI WDOEA CHECK-OUT API.
        /// </summary>
        public HttpResponseMessage Put([FromBody] H5_OPI_WDO_CO_INFO CO_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDO_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));
                var session = System.Web.HttpContext.Current.Session;

                try
                {
                    if (session["Key"] != null)
                    {
                        var sessionToken = "WeyuTech" + session["Key"];
                        var sessionExpiration = session["Expiration"];
                        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                        SessionHelper.UpdateToken(_SessionToken);
                        //異動資料的準備
                        string SID = "";
                        string CO_TIME = "";
                        string OK_QTY = "";
                        string NG_QTY = "";
                        string COMMENT = "";
                        string EDIT_USER = "";
                        string EDIT_TIME = "";

                        string Check_Info_SQL = "select * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_OUT_TIME IS NULL AND WIP_OPI_WDOEACICO_HIST_SID='{0}' ";

                        string Update_Sql = "update WIP_OPI_WDOEACICO_HIST set CHECK_OUT_TIME='{0}' , OK_QTY='{1}' , NG_QTY='{2}',COMMENT='{3}',EDIT_USER='{4}', EDIT_TIME='{5}'  where WIP_OPI_WDOEACICO_HIST_SID='{6}'";

                        //主程式,檢查上傳資料是否齊全
                        if (CO_data != null && CO_data.HIST_SID != "")
                        {
                            // 資料處理前的檢查
                            Check_Info_SQL = string.Format(Check_Info_SQL, CO_data.HIST_SID);
                            DataSet dtset_val = MyDBQuery.GetReader(ref _SessionToken, Check_Info_SQL);
                            SessionHelper.UpdateToken(_SessionToken);

                            DataTable dt_val = dtset_val.Tables[0].Copy();
                            //DataTable dt_val = MyDBQuery.GetTable(Check_Info_SQL);

                            if (dt_val.Rows.Count > 0)
                            {
                                //資料存在,進行CHECK-OUT 資料異動的準備
                                // 2024-05-17 新增時段檢查 同一機台時段不可重複報工
                                string CheckInTime = System.Convert.ToDateTime(dt_val.Rows[0]["CHECK_IN_TIME"].ToString()).ToString("yyyy-MM-dd HH:mm:ss");

                                //檢查出站時間是否坐落在已報工的區間
                                //抓取更新時間
                                DateTime now_time = MyDBQuery.GetDBTime();
                                string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                                //準備更新的SQL 
                                Update_Sql = string.Format(Update_Sql, CO_data.CO_TIME, CO_data.OK_QTY, CO_data.NG_QTY, CO_data.COMMENT, CO_data.EDIT_USER, now_time_string, CO_data.HIST_SID);
                                //開始進行交易
                                try
                                {
                                    List<string> SQLs = new List<string>();
                                    SQLs.Add(Update_Sql);
                                    string[] SQLs_list = SQLs.ToArray();
                                    _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                                    SessionHelper.UpdateToken(_SessionToken);

                                    var result = new
                                    {
                                        result = true,
                                        Msg = "There CHECK-OUT Transation has been completed ",
                                        SID = CO_data.HIST_SID,
                                        TokenInfo = new
                                        {
                                            Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                        }
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result);
                                }
                                catch (Exception ex)
                                {

                                    throw new Exception("CHECK-OUT Fail");
                                }
                            }
                            else
                            {
                                //要處理的資料不存在
                                string Return_Msg = string.Format("Hist SID='{0}' Check-IN data not exists", CO_data.HIST_SID);
                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = CO_data.HIST_SID,
                                    TokenInfo = new
                                    {
                                        Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                    }
                                };

                                return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                            }
                        }
                        else
                        {
                            //資料不齊全Reject
                            var result = new
                            {
                                result = false,
                                Msg = "There is a problem with the upload parameters ",
                                SID = ""
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
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

        /// <summary>
        /// OPI WDOEA CHECK-IN CANCEL API.
        /// </summary>
        public HttpResponseMessage Delete(H5_OPI_WDO_Del_INFO del_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDO_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));

                var session = System.Web.HttpContext.Current.Session;

                try
                {
                    if (session["Key"] != null)
                    {
                        var sessionToken = "WeyuTech" + session["Key"];
                        var sessionExpiration = session["Expiration"];
                        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                        SessionHelper.UpdateToken(_SessionToken);
                        //異動資料的準備
                        string WIP_OPI_WDOEACICO_HIST_id = del_data.HIST_SID.Trim();

                        string Check_Info_SQL = "select * from WIP_OPI_WDOEACICO_HIST where WIP_OPI_WDOEACICO_HIST_SID='{0}' AND CHECK_OUT_TIME IS NULL AND ENABLE_FLAG='Y' ";

                        string delete_OPI_WDOEACICO_HIST_Sql = "update WIP_OPI_WDOEACICO_HIST set Enable_Flag='N', EDIT_USER='{0}', EDIT_TIME='{1}' where WIP_OPI_WDOEACICO_HIST_SID={2}";


                        //主程式,檢查上傳資料是否齊全
                        if (WIP_OPI_WDOEACICO_HIST_id != "")
                        {
                            // 資料處理前的檢查

                            Check_Info_SQL = string.Format(Check_Info_SQL, WIP_OPI_WDOEACICO_HIST_id);
                            DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, Check_Info_SQL);
                            SessionHelper.UpdateToken(_SessionToken);

                            DataTable dt_val = set_val.Tables[0].Copy();
                            //DataTable dt_val = MyDBQuery.GetTable(Check_Info_SQL);

                            if (dt_val.Rows.Count > 0)
                            {
                                //資料存在,進行CHECK-IN 資料異動的準備
                                //抓取更新時間
                                DateTime now_time = MyDBQuery.GetDBTime();
                                string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                                //準備刪除的SQL 
                                delete_OPI_WDOEACICO_HIST_Sql = string.Format(delete_OPI_WDOEACICO_HIST_Sql, del_data.EDIT_USER, now_time_string, WIP_OPI_WDOEACICO_HIST_id);
                                //開始進行交易
                                try
                                {
                                    List<string> SQLs = new List<string>();
                                    SQLs.Add(delete_OPI_WDOEACICO_HIST_Sql);
                                    string[] SQLs_list = SQLs.ToArray();
                                    _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                                    SessionHelper.UpdateToken(_SessionToken);

                                    var result = new
                                    {
                                        result = true,
                                        Msg = "There Delete Transation has been completed ",
                                        SID = del_data.HIST_SID,
                                        TokenInfo = new
                                        {
                                            Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                        }
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result);
                                }
                                catch (Exception ex)
                                {

                                    throw new Exception("Delete FAIL");
                                }
                            }
                            else
                            {
                                //要處理的資料不存在
                                string Return_Msg = string.Format("SID='{0}' data Not exists or already Check-out or incorrect status", WIP_OPI_WDOEACICO_HIST_id);
                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = del_data.HIST_SID,
                                    TokenInfo = new
                                    {
                                        Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                    }
                                };

                                return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                            }
                        }
                        else
                        {
                            //資料不齊全Reject
                            var result = new
                            {
                                result = false,
                                Msg = "There is a problem with the upload parameters ",
                                SID = ""
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
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
}