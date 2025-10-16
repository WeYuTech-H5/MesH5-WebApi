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
    public class WIPOPI_WDOEAQ_CICOController : ApiController
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
        public class OPI_WDOEA_CI_INFO
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

        public class OPI_WDOEA_CO_INFO
        {
            public string HIST_SID { get; set; }
            public string CO_TIME { get; set; }
            public string OK_QTY { get; set; }
            public string NG_QTY { get; set; }
            public string COMMENT { get; set; }
            public string EDIT_USER { get; set; }
           
        }

        public class OPI_WDOEA_Del_INFO
        {
            public string HIST_SID { get; set; }
            public string EDIT_USER { get; set; }
        }

        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 Action_H5 = new WeYuDB_H5.DBAction_H5();

        /// <summary>
        /// OPI WDOEA CHECK-IN API.
        /// </summary>
        public HttpResponseMessage Post([FromBody] OPI_WDOEA_CI_INFO CI_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICOController));

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
                                               ,[EQP_NO]
                                               ,[ACCOUNT_NO]
                                               ,[NUM_OF_ACC]
                                               ,[CHECK_IN_TIME]
                                               ,[ENABLE_FLAG]
                                               ,[CREATE_USER]
                                               ,[CREATE_TIME]
                                               ,[EDIT_USER]
                                               ,[EDIT_TIME])
                                                VALUES ({0},'{1}','{2}','{3}','{4}','{5}','{6}','{7}','Y','{8}','{9}','{8}','{9}')"
                                                            ;
                        string[] UP_SQLS = null; ;

                        //主程式,檢查上傳資料是否齊全
                        double sid = 0;
                        if (CI_data != null && CI_data.WO_ID != "" && CI_data.OPE_ID != "" && CI_data.EQP_ID != "")
                        {
                            // 資料處理前的檢查
                            Check_Info_SQL = string.Format(Check_Info_SQL, CI_data.EQP_ID);
                            DataSet dtset_val = MyDBQuery.GetReader(ref _SessionToken, Check_Info_SQL);
                            SessionHelper.UpdateToken(_SessionToken);

                            DataTable dt_val = dtset_val.Tables[0].Copy();
                            //DataTable dt_val = MyDBQuery.GetTable(Check_Info_SQL);


                            bool CIExistFlag = false;
                            if (dt_val.Rows.Count == 0)
                            {
                                //資料不存在,進行CHECK-IN 資料異動的準備
                                //2024-05-17 增加進站時間是否重複的檢查
                                #region CheckInCheck
                                string CheckInExistSql = "select Top 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_IN_TIME <='{0}' AND  CHECK_OUT_TIME>'{0}' AND EQP_NO='{1}' ";
                                CheckInExistSql = string.Format(CheckInExistSql, CI_data.CI_TIME, CI_data.EQP_ID);
                                //檢查進站時間是否坐落在已報工的區間
                                //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                //DataSet checkeqmset_val = MyDBQuery.GetReader(ref _SessionToken,CheckInExistSql);
                                //DataTable checkeqmdt_val = dtset_val.Tables[0].Copy();
                                DataTable checkeqmdt_val = MyDBQuery.GetTable(CheckInExistSql);

                                if (checkeqmdt_val.Rows.Count == 0)
                                {
                                    //表示沒有在已報工的區間內
                                    CIExistFlag = true;
                                }
                                #endregion

                                if (CIExistFlag == true)
                                {
                                    //抓取更新時間
                                    DateTime now_time = MyDBQuery.GetDBTime();
                                    string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                                    sid = Convert.ToDouble(now_time.Subtract(DateTime.Parse("2013-04-01")).TotalMilliseconds);
                                    Random Rad = new Random();//亂數種子
                                    sid = sid * 100 + Rad.Next(0, 100);

                                    //準備更新的SQL 
                                    Insert_Sql = string.Format(Insert_Sql, sid, CI_data.WO_ID, CI_data.DEP_ID, CI_data.OPE_ID, CI_data.EQP_ID, CI_data.ACCOUNT_ID, CI_data.NUM_OF_ACC, CI_data.CI_TIME, CI_data.EDIT_USER, now_time_string);
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
                                    //進站時間在已報工的時間內
                                    string Return_Msg = string.Format("EQP_NO='{0}' Check-IN Time='{0}' already exists other ", CI_data.EQP_ID, CI_data.CI_TIME);
                                    var result = new
                                    {
                                        result = false,
                                        Msg = Return_Msg,
                                        SID = sid,
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
                                //要處理的資料已經存在
                                string Return_Msg = string.Format("WO='{0}' AND OPERATION_CODE='{1}' AND  EQP_NO='{2}' Check-IN data already exists", CI_data.WO_ID, CI_data.OPE_ID, CI_data.EQP_ID);

                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = sid,
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
        /// OPI WDOEA CHECK-OUT API.
        /// </summary>
        public HttpResponseMessage Put([FromBody] OPI_WDOEA_CO_INFO CO_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICOController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));
                var session = System.Web.HttpContext.Current.Session;

                try
                {
                    //var request = HttpContext.Current.Request;
                    //var tokenKey = request.Headers["TokenKey"];
                    //var TokenExpiry = request.Headers["TokenExpiry"];
                    //string FinalTokenKey = "WeyuTech" + tokenKey;

                    //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

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
                                string EqpID = dt_val.Rows[0]["EQP_NO"].ToString();
                                string CheckInTime = System.Convert.ToDateTime(dt_val.Rows[0]["CHECK_IN_TIME"].ToString()).ToString("yyyy-MM-dd HH:mm:ss");

                                bool CheckOutCheckFlag = false;

                                #region CheckOutCheck
                                string CheckOutBetweenSql = "select top 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_IN_TIME <'{0}' AND  CHECK_OUT_TIME>='{0}' AND EQP_NO='{1}' ";
                                string CheckOuutCrossSql = "select top 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_IN_TIME >='{0}' AND  CHECK_OUT_TIME<='{1}' AND EQP_NO='{2}'";
                                CheckOutBetweenSql = string.Format(CheckOutBetweenSql, CO_data.CO_TIME, EqpID);
                                //檢查出站時間是否坐落在已報工的區間
                                //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                //DataSet dtcheckoutSet_val = MyDBQuery.GetReader(ref _SessionToken, CheckOutBetweenSql);
                                //DataTable dtcheckoutdt_val = dtcheckoutSet_val.Tables[0].Copy();
                                DataTable dtcheckoutdt_val = MyDBQuery.GetTable(CheckOutBetweenSql);
                                if (dtcheckoutdt_val.Rows.Count == 0)
                                {
                                    //表示沒有在已報工的區間內
                                    CheckOuutCrossSql = String.Format(CheckOuutCrossSql, CheckInTime, CO_data.CO_TIME, EqpID);

                                    //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    //DataSet dtcheckoutqrSet_val = MyDBQuery.GetReader(ref _SessionToken, CheckOuutCrossSql);
                                    //DataTable dtcheckoutqrdt_val = dtcheckoutqrSet_val.Tables[0].Copy();
                                    DataTable dtcheckoutqrdt_val = MyDBQuery.GetTable(CheckOuutCrossSql);

                                    if (dtcheckoutqrdt_val.Rows.Count == 0)
                                    {
                                        //表示從check-in 到 check-out範圍內都沒有報工的紀錄
                                        CheckOutCheckFlag = true;
                                    }
                                }
                                #endregion

                                if (CheckOutCheckFlag == true)
                                {
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

                                        //obj["result"] = true;
                                        //obj.Add(new JProperty("Msg", "There CHECK-OUT Transation has been completed "));
                                        //obj.Add(new JProperty("SID", CO_data.HIST_SID));
                                        //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.OK, obj);
                                        //return httpResponseMessage400;
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
                                    //進站與出站時間不正確,與其他報工紀錄衝突
                                    string Return_Msg = string.Format("Eqp NO= '{0}' CheckIn Time ='{1}' CheckOut Time = '{2}' Duplicate with other data  ", EqpID, CheckInTime, CO_data.CO_TIME);
                                    //obj["result"] = false;
                                    //obj.Add(new JProperty("Msg", Return_Msg));
                                    //obj.Add(new JProperty("SID", CO_data.HIST_SID));
                                    //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                    //return httpResponseMessage400;
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
                                //要處理的資料不存在
                                string Return_Msg = string.Format("Hist SID='{0}' Check-IN data not exists", CO_data.HIST_SID);
                                //obj["result"] = false;
                                //obj.Add(new JProperty("Msg", Return_Msg));
                                //obj.Add(new JProperty("SID", CO_data.HIST_SID));
                                //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                //return httpResponseMessage400;
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
                            //obj["result"] = false;
                            //obj.Add(new JProperty("Msg", "There is a problem with the upload parameters "));
                            //obj.Add(new JProperty("SID", ""));
                            //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                            //return httpResponseMessage400;
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
        public HttpResponseMessage Delete(OPI_WDOEA_Del_INFO del_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICOController));

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

                                    //obj["result"] = true;
                                    //obj.Add(new JProperty("Msg", "There Delete Transation has been completed "));
                                    //obj.Add(new JProperty("SID", del_data.HIST_SID));
                                    //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.OK, obj);
                                    //return httpResponseMessage400;
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
                                //obj["result"] = false;
                                //obj.Add(new JProperty("Msg", Return_Msg));
                                //obj.Add(new JProperty("SID", del_data.HIST_SID));
                                //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                //return httpResponseMessage400;
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
                            //obj["result"] = false;
                            //obj.Add(new JProperty("Msg", "There is a problem with the upload parameters "));
                            //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                            //return httpResponseMessage400;
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

                    //var request = HttpContext.Current.Request;
                    //var tokenKey = request.Headers["TokenKey"];
                    //var TokenExpiry = request.Headers["TokenExpiry"];
                    //string FinalTokenKey = "WeyuTech" + tokenKey;

                    //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

                    
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

        public class OPI_WDOEA_CO_SKIP_OK_INFO
        {
            public string HIST_SID { get; set; }
            public string CO_TIME { get; set; }
            public string NG_QTY { get; set; }
            public string COMMENT { get; set; }
            public string EDIT_USER { get; set; }

        }

        /// <summary>
        /// OPI WDOEA CHECK-OUT API. Not input OK qty
        /// </summary>
        [Route("api/WIPOPI_WDOEAQ_SKIP_OK_QTY_CO")]
        public HttpResponseMessage Post([FromBody] OPI_WDOEA_CO_SKIP_OK_INFO CO_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICOController));

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

                        string Update_Sql = "update WIP_OPI_WDOEACICO_HIST set CHECK_OUT_TIME='{0}' , NG_QTY='{1}',COMMENT='{2}',EDIT_USER='{3}', EDIT_TIME='{4}'  where WIP_OPI_WDOEACICO_HIST_SID='{5}'";

                        //主程式,檢查上傳資料是否齊全
                        if (CO_data != null && CO_data.HIST_SID != "")
                        {
                            // 資料處理前的檢查
                            Check_Info_SQL = string.Format(Check_Info_SQL, CO_data.HIST_SID);
                            DataSet dtset_val = MyDBQuery.GetReader(ref _SessionToken, Check_Info_SQL);
                            SessionHelper.UpdateToken(_SessionToken);

                            DataTable dt_val = dtset_val.Tables[0].Copy();

                            if (dt_val.Rows.Count > 0)
                            {
                                //資料存在,進行CHECK-OUT 資料異動的準備
                                // 2024-05-17 新增時段檢查 同一機台時段不可重複報工
                                string EqpID = dt_val.Rows[0]["EQP_NO"].ToString();
                                string CheckInTime = System.Convert.ToDateTime(dt_val.Rows[0]["CHECK_IN_TIME"].ToString()).ToString("yyyy-MM-dd HH:mm:ss");

                                bool CheckOutCheckFlag = false;

                                #region CheckOutCheck
                                string CheckOutBetweenSql = "select top 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_IN_TIME <'{0}' AND  CHECK_OUT_TIME>='{0}' AND EQP_NO='{1}' ";
                                string CheckOuutCrossSql = "select top 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_IN_TIME >='{0}' AND  CHECK_OUT_TIME<='{1}' AND EQP_NO='{2}'";
                                CheckOutBetweenSql = string.Format(CheckOutBetweenSql, CO_data.CO_TIME, EqpID);
                                //檢查出站時間是否坐落在已報工的區間
                                //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                //DataSet dtcheckoutSet_val = MyDBQuery.GetReader(ref _SessionToken, CheckOutBetweenSql);
                                //DataTable dtcheckoutdt_val = dtcheckoutSet_val.Tables[0].Copy();
                                DataTable dtcheckoutdt_val = MyDBQuery.GetTable(CheckOutBetweenSql);
                                if (dtcheckoutdt_val.Rows.Count == 0)
                                {
                                    //表示沒有在已報工的區間內
                                    CheckOuutCrossSql = String.Format(CheckOuutCrossSql, CheckInTime, CO_data.CO_TIME, EqpID);

                                    //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    //DataSet dtcheckoutqrSet_val = MyDBQuery.GetReader(ref _SessionToken, CheckOuutCrossSql);
                                    //DataTable dtcheckoutqrdt_val = dtcheckoutqrSet_val.Tables[0].Copy();
                                    DataTable dtcheckoutqrdt_val = MyDBQuery.GetTable(CheckOuutCrossSql);

                                    if (dtcheckoutqrdt_val.Rows.Count == 0)
                                    {
                                        //表示從check-in 到 check-out範圍內都沒有報工的紀錄
                                        CheckOutCheckFlag = true;
                                    }
                                }
                                #endregion

                                if (CheckOutCheckFlag == true)
                                {
                                    //抓取更新時間
                                    DateTime now_time = MyDBQuery.GetDBTime();
                                    string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                                    //準備更新的SQL 
                                    Update_Sql = string.Format(Update_Sql, CO_data.CO_TIME, CO_data.NG_QTY, CO_data.COMMENT, CO_data.EDIT_USER, now_time_string, CO_data.HIST_SID);
                                    //開始進行交易
                                    try
                                    {
                                        List<string> SQLs = new List<string>();
                                        SQLs.Add(Update_Sql);
                                        string[] SQLs_list = SQLs.ToArray();
                                        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                        DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                                        SessionHelper.UpdateToken(_SessionToken);

                                        //obj["result"] = true;
                                        //obj.Add(new JProperty("Msg", "There CHECK-OUT Transation has been completed "));
                                        //obj.Add(new JProperty("SID", CO_data.HIST_SID));
                                        //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.OK, obj);
                                        //return httpResponseMessage400;
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
                                    //進站與出站時間不正確,與其他報工紀錄衝突
                                    string Return_Msg = string.Format("Eqp NO= '{0}' CheckIn Time ='{1}' CheckOut Time = '{2}' Duplicate with other data  ", EqpID, CheckInTime, CO_data.CO_TIME);
                                    //obj["result"] = false;
                                    //obj.Add(new JProperty("Msg", Return_Msg));
                                    //obj.Add(new JProperty("SID", CO_data.HIST_SID));
                                    //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                    //return httpResponseMessage400;
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
                                //要處理的資料不存在
                                string Return_Msg = string.Format("Hist SID='{0}' Check-IN data not exists", CO_data.HIST_SID);
                                //obj["result"] = false;
                                //obj.Add(new JProperty("Msg", Return_Msg));
                                //obj.Add(new JProperty("SID", CO_data.HIST_SID));
                                //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                //return httpResponseMessage400;
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
                            //obj["result"] = false;
                            //obj.Add(new JProperty("Msg", "There is a problem with the upload parameters "));
                            //obj.Add(new JProperty("SID", ""));
                            //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                            //return httpResponseMessage400;
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