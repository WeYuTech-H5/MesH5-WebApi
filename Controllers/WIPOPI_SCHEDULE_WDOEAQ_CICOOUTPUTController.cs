using log4net;
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
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    
    //[RoutePrefix("api/WIPOUTPUT")]
    public class WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUTController : ApiController
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


        //[HttpOptions]
        //[Route("")]
        //public HttpResponseMessage Options()
        //{
        //    var response = Request.CreateResponse(HttpStatusCode.OK);
        //    response.Headers.Add("Access-Control-Allow-Origin", "http://10.0.20.182");
        //    response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, TokenKey");
        //    response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        //    return response;
        //}


        #region 查詢 api
        /// <summary>
        /// OPI WDOEA GET OK / NG Total Data API. --OK
        /// </summary>
        /// 
        public string Get(string WIP_OPI_WDOEACICOOUTPUT_HIST_SID)
        {
            var session = System.Web.HttpContext.Current.Session;

            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUTController));
            string GET_OKInfo_SQL = @"SELECT A.WIP_OPI_WDOEACICOOUTPUT_HIST_SID,A.WIP_OPI_WDOEACICO_HIST_SID,A.OK_QTY,A.NG_QTY,A.COMMENT,A.ENABLE_FLAG,A.EDIT_USER,B.NG_CODE,B.NG_CODE_QTY,B.COMMENT AS NG_CODE_COMMENT
                  FROM WIP_OPI_WDOEACICOOUTPUT_HIST A 
                  JOIN WIP_OPI_WDOEACICONG_HIST_DETAIL B 
                  ON A.WIP_OPI_WDOEACICOOUTPUT_HIST_SID=B.WIP_OPI_WDOEACICOOUTPUT_HIST_SID 
                  AND A.WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' 
                ";

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
                    // 抓取資料
                    GET_OKInfo_SQL = string.Format(GET_OKInfo_SQL, WIP_OPI_WDOEACICOOUTPUT_HIST_SID);
                    //DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, GET_OKInfo_SQL);
                    //DataTable dt_val = set_val.Tables[0].Copy();
                    DataTable dt_val = MyDBQuery.GetTable(GET_OKInfo_SQL);

                    bool CIExistFlag = false;
                    if (dt_val.Rows.Count == 0)
                    {
                        var result = new
                        {
                            result = false,
                            SID = WIP_OPI_WDOEACICOOUTPUT_HIST_SID,
                            Msg = "No Data",
                            TokenInfo = new
                            {
                                Expiration = _SessionToken.Expiration
                            }
                        };

                        return JsonConvert.SerializeObject(result, Formatting.None);

                    }
                    else
                    {
                        //
                        WIP_UPDATE_TOTAL_INFO Return_TOTAL_INF0 = new WIP_UPDATE_TOTAL_INFO();
                        //NG_CODE_INFO[] Return_Ccode_info = new NG_CODE_INFO[dt_val.Rows.Count];

                        NG_CODE_INFO[] Return_Ccode_info = new NG_CODE_INFO[dt_val.Rows.Count];

                        Return_TOTAL_INF0.WIP_OPI_WDOEACICOOUTPUT_HIST_SID = WIP_OPI_WDOEACICOOUTPUT_HIST_SID;
                        Return_TOTAL_INF0.NG_TOTAL = dt_val.Rows[0]["NG_QTY"].ToString();
                        Return_TOTAL_INF0.OK_TOTAL = dt_val.Rows[0]["OK_QTY"].ToString();
                        Return_TOTAL_INF0.EDIT_USER = dt_val.Rows[0]["EDIT_USER"].ToString();
                        Return_TOTAL_INF0.COMMENT = dt_val.Rows[0]["COMMENT"].ToString();

                        for (int i = 0; i < dt_val.Rows.Count; i++)
                        {
                            Return_Ccode_info[i] = new NG_CODE_INFO();
                            Return_Ccode_info[i].NG_CODE_NO = dt_val.Rows[i]["NG_CODE"].ToString();
                            Return_Ccode_info[i].NG_CODE_QTY = dt_val.Rows[i]["NG_CODE_QTY"].ToString();
                            //Return_Ccode_info[i].NG_CODE_COMMENT = dt_val.Rows[i]["NG_CODE_COMMENT"].ToString();

                        }
                        Return_TOTAL_INF0.NG_CODE_INFOS = Return_Ccode_info;

                        JArray ja = new JArray();


                        string jsonString = JsonConvert.SerializeObject(Return_TOTAL_INF0, Formatting.None);
                        ja.Add(jsonString);

                        var result = new
                        {
                            result = true,
                            SID = WIP_OPI_WDOEACICOOUTPUT_HIST_SID,
                            Msg = "Query completed",
                            DataArrays = ja, // 若 ja 是 JArray
                            TokenInfo = new
                            {
                                Expiration = _SessionToken.Expiration
                            }
                        };

                        return JsonConvert.SerializeObject(result, Formatting.None);

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
            catch (Exception Exc)
            {

                log.Error(Exc.Message);
                var result = new
                {
                    result = false,
                    SID = WIP_OPI_WDOEACICOOUTPUT_HIST_SID,
                    Msg = Exc.Message
                };

                return JsonConvert.SerializeObject(result, Formatting.None);
            }
        }
        #endregion

        #region 批次報工 api
        public class WIP_TOTAL_INFO
        {
            public string WIP_OPI_WDOEACICO_HIST_SID { get; set; }
            public string NG_TOTAL { get; set; }
            public string OK_TOTAL { get; set; }
            public string COMMENT { get; set; }
            public NG_CODE_INFO[] NG_CODE_INFOS { get; set; }
            public string EDIT_USER { get; set; }
        }
       
        /// <summary>
        /// OPI WDOEA Add NG Data API.
        /// </summary>
        public HttpResponseMessage Post([FromBody] WIP_TOTAL_INFO Total_Info)
        {
            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUTController));

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
                    // 抓取資料

                    //異動資料的準備
                    string WDOEACICONG_HIST_SID = "";
                    string WIP_OPI_WDOEACICO_HIST_SID = "";
                    int OK_QTY = 0;
                    int NG_QTY = 0;
                    string COMMENT = "";
                    string NG_CODE_NO = "";
                    int NG_CODE_QTY = 0;
                    string NG_CODE_COMMENT = "";
                    string ACCOUNT_ID = "";
                    string EDIT_USER = "";
                    string EDIT_TIME = "";

                    // 
                    // NG紀錄不需要檢查是否存在
                    //string Check_Info_SQL = "select TOP 1 * from WIP_OPI_WDOEACICO_HIST where ENABLE_FLAG='Y' AND CHECK_OUT_TIME IS NULL AND EQP_NO='{0}'";
                    string NG_Insert_Sql = @"INSERT INTO [WIP_OPI_WDOEACICOOUTPUT_HIST]
                                            ([WIP_OPI_WDOEACICOOUTPUT_HIST_SID]
                                            ,[WIP_OPI_WDOEACICO_HIST_SID]
                                            ,[NG_QTY]
                                            ,[OK_QTY]
                                            ,[ENABLE_FLAG]
                                            ,[CREATE_USER]
                                            ,[CREATE_TIME]
                                            ,[EDIT_USER]
                                            ,[EDIT_TIME]
                                            ,[COMMENT])
                                                VALUES ({0},'{1}','{2}','{3}','Y','{4}','{5}','{4}','{5}','{6}')";
                    string NG_Detail_Sql = @"INSERT INTO [WIP_OPI_WDOEACICONG_HIST_DETAIL]
                                           ([WDOEACICONG_NG_HIST_DETAIL_SID]
                                           ,[WIP_OPI_WDOEACICOOUTPUT_HIST_SID]
                                           ,[NG_CODE]
                                           ,[NG_CODE_QTY]
                                           ,[CREATE_USER]
                                           ,[CREATE_TIME]
                                           ,[EDIT_USER]
                                           ,[EDIT_TIME])
                                            VALUES ({0},'{1}','{2}','{3}','{4}','{5}','{4}','{5}')";
                    ;
                    string[] UP_SQLS = null; ;

                    //主程式,檢查上傳資料是否齊全
                    double sid = 0;
                    if (Total_Info.WIP_OPI_WDOEACICO_HIST_SID != null && Total_Info.NG_CODE_INFOS != null)
                    {
                        //進行 NG 資料異動的準備
                        EDIT_USER = Total_Info.EDIT_USER;
                        NG_QTY = System.Convert.ToInt32(Total_Info.NG_TOTAL);
                        //抓取更新時間
                        DateTime now_time = MyDBQuery.GetDBTime();
                        EDIT_TIME = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                        OK_QTY = System.Convert.ToInt32(Total_Info.OK_TOTAL);
                        COMMENT = Total_Info.COMMENT;
                        sid = Convert.ToDouble(now_time.Subtract(DateTime.Parse("2013-04-01")).TotalMilliseconds);
                        sid = sid * 100;
                        WDOEACICONG_HIST_SID = sid.ToString();
                        //準備新增NG Code 的SQL 
                        string[] InsertSql = new string[Total_Info.NG_CODE_INFOS.Length + 1];
                        string TempInsertSql = "";

                        for (int i = 0; i < Total_Info.NG_CODE_INFOS.Length; i++)
                        {
                            NG_CODE_NO = Total_Info.NG_CODE_INFOS[i].NG_CODE_NO;
                            NG_CODE_QTY = System.Convert.ToInt32(Total_Info.NG_CODE_INFOS[i].NG_CODE_QTY);
                            //NG_CODE_COMMENT = Total_Info.NG_CODE_INFOS[i].NG_CODE_COMMENT;
                            //NG_QTY += NG_CODE_QTY;
                            TempInsertSql = string.Format(NG_Detail_Sql, (sid + i), sid, NG_CODE_NO, NG_CODE_QTY, EDIT_USER, EDIT_TIME);
                            InsertSql[i + 1] = TempInsertSql;
                        }
                        NG_Insert_Sql = string.Format(NG_Insert_Sql, sid, Total_Info.WIP_OPI_WDOEACICO_HIST_SID, NG_QTY, OK_QTY, EDIT_USER, EDIT_TIME,COMMENT);
                        InsertSql[0] = NG_Insert_Sql;

                        //開始進行交易
                        try
                        {
                            DataSet DtSet = Action_H5.doExecute(ref _SessionToken, InsertSql);
                            SessionHelper.UpdateToken(_SessionToken);

                            //obj["result"] = true;
                            //obj.Add(new JProperty("SID", WDOEACICONG_HIST_SID));
                            //obj.Add(new JProperty("Msg", "There NG Data Transation has been completed "));
                            //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.OK, obj);
                            //return httpResponseMessage400;

                            var result = new
                            {
                                result = true,
                                SID = WDOEACICONG_HIST_SID,
                                Msg = "The NG Data Transaction has been completed"
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);


                        }
                        catch (Exception ex)
                        {

                            throw new Exception("NG Data Transation has been FAIL");
                        }
                    }
                    else
                    {
                        //資料不齊全Reject
                        var result = new
                        {
                            result = false,
                            Msg = "There is a problem with the upload parameters",
                            SID = ""
                        };

                        return Request.CreateResponse(HttpStatusCode.BadRequest, result);
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
        #endregion

        #region 編輯報工 api
        public class WIP_UPDATE_TOTAL_INFO
        {
            public string WIP_OPI_WDOEACICOOUTPUT_HIST_SID { get; set; }
            public string OK_TOTAL { get; set; }
            public string NG_TOTAL { get; set; }
            public string COMMENT { get; set; }
            public NG_CODE_INFO[] NG_CODE_INFOS { get; set; }
            public string EDIT_USER { get; set; }
        }
        public class NG_CODE_INFO
        {
            public string NG_CODE_NO { get; set; }
            public string NG_CODE_QTY { get; set; }
            //public string NG_CODE_COMMENT { get; set; }

        }
        /// <summary>
        /// OPI WDOEA Update NG Data API.
        /// </summary>
        [Route("api/H5_WIP_Update")]
        public HttpResponseMessage Post([FromBody] WIP_UPDATE_TOTAL_INFO TOTAL_HIS_Info)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUTController));

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
                        string WIP_OPI_WDOEACICOOUTPUT_HIST_SID = "";
                        int NG_QTY = 0;
                        int OK_QTY = 0;
                        string COMMENT = "";
                        string ENABLE_FLAG = "";
                        string NG_CODE = "";
                        int NG_CODE_QTY = 0;
                        string NG_CODE_COMMENT = "";
                        string EDIT_USER = "";
                        string EDIT_TIME = "";


                        string Check_TOTAL_Info_SQL = "select TOP 1 * from WIP_OPI_WDOEACICOOUTPUT_HIST where ENABLE_FLAG='Y' AND WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' ";

                        string Update_Total_HIST_Sql = "update WIP_OPI_WDOEACICOOUTPUT_HIST set NG_QTY='{1}' , ENABLE_FLAG='{2}', EDIT_USER='{3}', EDIT_TIME='{4}',OK_QTY='{5}',COMMENT=N'{6}'  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}'";
                        string Update_Total_DETAIL_Sql = "update WIP_OPI_WDOEACICONG_HIST_DETAIL set NG_CODE_QTY='{2}'  , EDIT_USER='{3}', EDIT_TIME='{4}'  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' AND NG_CODE='{1}'";

                        //主程式,檢查上傳資料是否齊全
                        if (TOTAL_HIS_Info != null && TOTAL_HIS_Info.WIP_OPI_WDOEACICOOUTPUT_HIST_SID != "")
                        {
                            // 資料處理前的檢查

                            Check_TOTAL_Info_SQL = string.Format(Check_TOTAL_Info_SQL, TOTAL_HIS_Info.WIP_OPI_WDOEACICOOUTPUT_HIST_SID);
                            //DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, Check_Total_Info_SQL);
                            //DataTable dt_val = set_val.Tables[0].Copy();
                            DataTable dt_val = MyDBQuery.GetTable(Check_TOTAL_Info_SQL);

                            if (dt_val.Rows.Count > 0)
                            {
                                //NG 資料存在,進行NG HIS 資料異動的準備
                                // 
                                WIP_OPI_WDOEACICOOUTPUT_HIST_SID = TOTAL_HIS_Info.WIP_OPI_WDOEACICOOUTPUT_HIST_SID;
                                NG_QTY = System.Convert.ToInt32(TOTAL_HIS_Info.NG_TOTAL);
                                OK_QTY = System.Convert.ToInt32(TOTAL_HIS_Info.OK_TOTAL);
                                //抓取更新時間
                                DateTime now_time = MyDBQuery.GetDBTime();
                                EDIT_TIME = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                                EDIT_USER = TOTAL_HIS_Info.EDIT_USER;
                                ENABLE_FLAG = "Y";
                                COMMENT = TOTAL_HIS_Info.COMMENT;
                                string[] Update_Sqls = new string[TOTAL_HIS_Info.NG_CODE_INFOS.Length + 1];
                                string Temp_UpdateSql = "";

                                //準備NG Code 更新資料
                                for (int i = 0; i < TOTAL_HIS_Info.NG_CODE_INFOS.Length; i++)
                                {
                                    NG_CODE = TOTAL_HIS_Info.NG_CODE_INFOS[i].NG_CODE_NO;
                                    NG_CODE_QTY = System.Convert.ToInt32(TOTAL_HIS_Info.NG_CODE_INFOS[i].NG_CODE_QTY);
                                    //NG_CODE_COMMENT = TOTAL_HIS_Info.NG_CODE_INFOS[i].NG_CODE_COMMENT;
                                    //NG_QTY += NG_CODE_QTY;
                                    //準備更新的SQL 
                                    Temp_UpdateSql = string.Format(Update_Total_DETAIL_Sql, WIP_OPI_WDOEACICOOUTPUT_HIST_SID, NG_CODE, NG_CODE_QTY, EDIT_USER, EDIT_TIME);
                                    Update_Sqls[i + 1] = Temp_UpdateSql;
                                }
                                //準備 NG HIST 更新資料
                                Update_Total_HIST_Sql = string.Format(Update_Total_HIST_Sql, WIP_OPI_WDOEACICOOUTPUT_HIST_SID, NG_QTY, ENABLE_FLAG, EDIT_USER, EDIT_TIME, OK_QTY,COMMENT);
                                Update_Sqls[0] = Update_Total_HIST_Sql;

                                //開始進行交易
                                try
                                {
                                    //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    DataSet DtSet = Action_H5.doExecute(ref _SessionToken, Update_Sqls);
                                    SessionHelper.UpdateToken(_SessionToken);

                                    var result = new
                                    {
                                        result = true,
                                        Msg = "The Update NG Data Transaction has been completed",
                                        SID = WIP_OPI_WDOEACICOOUTPUT_HIST_SID,
                                        TokenInfo = new
                                        {
                                            Expiration = _SessionToken.Expiration
                                        }
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result);


                                }
                                catch (Exception ex)
                                {

                                    throw new Exception("There Update NG Data Transation has been Fail");
                                }


                            }
                            else
                            {
                                //要處理的資料不存在
                                string Return_Msg = string.Format("Hist SID='{0}' NG HIST data not exists", TOTAL_HIS_Info.WIP_OPI_WDOEACICOOUTPUT_HIST_SID);
                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = TOTAL_HIS_Info.WIP_OPI_WDOEACICOOUTPUT_HIST_SID,
                                    TokenInfo = new
                                    {
                                        Expiration = _SessionToken.Expiration
                                    }
                                };

                                return Request.CreateResponse(HttpStatusCode.BadRequest, result);
                            }
                        }
                        else
                        {
                            //資料不齊全Reject
                            var result = new
                            {
                                result = false,
                                Msg = "There is a problem with the upload parameters",
                                SID = "",
                                TokenInfo = new
                                {
                                    Expiration = _SessionToken.Expiration
                                }
                            };

                            return Request.CreateResponse(HttpStatusCode.BadRequest, result);
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
                        Msg = ex.Message
                    };

                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                }

            }

        } 
        #endregion


        #region 作廢 api
        public class WIP_Del_Total_INFO
        {
            public string WIP_OPI_WDOEACICOOUTPUT_HIST_SID { get; set; }
            public string EDIT_USER { get; set; }
        }

        /// <summary>
        /// OPI WDOEA Add NG Data API. ok
        /// </summary>
        [Route("api/H5_WIP_Del")]
        public HttpResponseMessage Post(WIP_Del_Total_INFO del_data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_SCHEDULE_WDOEAQ_CICOOUTPUTController));

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
                        string NG_HIST_SID = del_data.WIP_OPI_WDOEACICOOUTPUT_HIST_SID;
                        string EDIT_USER = del_data.EDIT_USER;
                        string EDIT_TIME = "";


                        string Check_NG_Info_SQL = "select TOP 1 * from WIP_OPI_WDOEACICOOUTPUT_HIST where ENABLE_FLAG='Y' AND WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' ";

                        //string Del_NG_HIST_Sql = "update WIP_OPI_WDOEACICOOUTPUT_HIST set ENABLE_FLAG='N', EDIT_USER='{1}', EDIT_TIME='{2}'  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}'";

                        string Del_NG_HIST_Sql = "DELETE FROM WIP_OPI_WDOEACICOOUTPUT_HIST  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}'";

                        string Del_NG_detail_HIST_SQL = "DELETE FROM WIP_OPI_WDOEACICONG_HIST_DETAIL  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}'";

                        //主程式,檢查上傳資料是否齊全
                        if (NG_HIST_SID != "")
                        {
                            // 資料處理前的檢查

                            Check_NG_Info_SQL = string.Format(Check_NG_Info_SQL, NG_HIST_SID);


                            //DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, Check_Total_Info_SQL);
                            //DataTable dt_val = set_val.Tables[0].Copy();
                            DataTable dt_val = MyDBQuery.GetTable(Check_NG_Info_SQL);

                            if (dt_val.Rows.Count > 0)
                            {
                                //資料存在,進行NG資料異動的準備
                                //抓取更新時間
                                DateTime now_time = MyDBQuery.GetDBTime();
                                string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                                //準備刪除的SQL 
                                Del_NG_HIST_Sql = string.Format(Del_NG_HIST_Sql, NG_HIST_SID);

                                Del_NG_detail_HIST_SQL = string.Format(Del_NG_detail_HIST_SQL, NG_HIST_SID);


                                List<string> sqls = new List<string>();
                                sqls.Add(Del_NG_HIST_Sql);
                                sqls.Add(Del_NG_detail_HIST_SQL);

                                //開始進行交易
                                try
                                {
                                    //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    //DataSet DtSet = Action_H5.doExecute(ref _SessionToken, Del_NG_HIST_Sql);
                                    DataSet DtSet = Action_H5.doExecute(ref _SessionToken, sqls.ToArray());
                                    SessionHelper.UpdateToken(_SessionToken);

                                    var result = new
                                    {
                                        result = true,
                                        Msg = "The Delete Transaction has been completed",
                                        SID = NG_HIST_SID,
                                        TokenInfo = new
                                        {
                                            Expiration = _SessionToken.Expiration
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
                                string Return_Msg = string.Format("SID='{0}' data Not exists or already Check-out or incorrect status", NG_HIST_SID);
                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = NG_HIST_SID,
                                    TokenInfo = new
                                    {
                                        Expiration = _SessionToken.Expiration
                                    }
                                };

                                return Request.CreateResponse(HttpStatusCode.BadRequest, result);
                            }
                        }
                        else
                        {
                            //資料不齊全Reject
                            var result = new
                            {
                                result = false,
                                Msg = "There is a problem with the upload parameters",
                                TokenInfo = new
                                {
                                    Expiration = _SessionToken.Expiration
                                }
                            };

                            return Request.CreateResponse(HttpStatusCode.BadRequest, result);
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
                        Msg = ex.Message
                    };

                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                }

            }
        }


        #endregion

   
    }
}
