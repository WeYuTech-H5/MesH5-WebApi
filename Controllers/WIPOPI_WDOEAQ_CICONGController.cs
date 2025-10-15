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
using System.Transactions;
using System.Web;
using System.Web.Http;

namespace WeyuBiApi.Controllers
{
    public class WIPOPI_WDOEAQ_CICONGController : ApiController
    {
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
                return "WEYU" + ConfigurationSettings.AppSettings["APIToken"];
            }
        }
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 Action_H5 = new WeYuDB_H5.DBAction_H5();

        public class WIP_NG_INFO
        {
            public string CICO_SID { get; set; }
            public string OK_TOTAL { get; set; }
            public string NG_TOTAL { get; set; }
            public NG_CODE_INFO[] NG_CODE_INFOS { get; set; }
            public string COMMENT { get; set; }
            public string EDIT_USER { get; set; }
        }
        public class NG_CODE_INFO
        {
            public string NG_CODE_NO { get; set; }
            public string NG_CODE_QTY { get; set; }
            public string NG_CODE_COMMENT { get; set; }

        }
        public class WIP_UPDATE_NG_INFO
        {
            public string NG_HIST_SID { get; set; }
            public string OK_TOTAL { get; set; }
            public string NG_TOTAL { get; set; }
            public NG_CODE_INFO[] NG_CODE_INFOS { get; set; }
            public string COMMENT { get; set; }
            //public string ENABLE_FLAG { get; set; }
            public string EDIT_USER { get; set; }
        }
        public class WIP_Del_NG_INFO
        {
            public string NG_HIST_SID { get; set; }
            public string EDIT_USER { get; set; }
        }

        /// <summary>
        /// OPI WDOEA GET NG Data API.
        /// </summary>
        /// 
        public string Get(string NG_HIST_ID)
        {

            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICONGController));
            string GET_NGInfo_SQL = "SELECT A.WIP_OPI_WDOEACICOOUTPUT_HIST_SID,A.WIP_OPI_WDOEACICO_HIST_SID,A.NG_QTY,A.COMMENT,A.ENABLE_FLAG,A.EDIT_USER,B.NG_CODE,B.NG_CODE_QTY,B.COMMENT AS NG_CODE_COMMENT, A.OK_QTY FROM WIP_OPI_WDOEACICOOUTPUT_HIST A JOIN WIP_OPI_WDOEACICONG_HIST_DETAIL B ON A.WIP_OPI_WDOEACICOOUTPUT_HIST_SID=B.WIP_OPI_WDOEACICOOUTPUT_HIST_SID AND A.WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' order by WDOEACICONG_NG_HIST_DETAIL_SID";

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
                    GET_NGInfo_SQL = string.Format(GET_NGInfo_SQL, NG_HIST_ID);
                    DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, GET_NGInfo_SQL);
                    SessionHelper.UpdateToken(_SessionToken);

                    DataTable dt_val = set_val.Tables[0].Copy();
                    //DataTable dt_val = MyDBQuery.GetTable(GET_NGInfo_SQL);

                    bool CIExistFlag = false;
                    if (dt_val.Rows.Count == 0)
                    {
                        //沒有資料
                        obj["result"] = false;
                        obj.Add(new JProperty("SID", NG_HIST_ID));
                        obj.Add(new JProperty("Msg", "No Data"));
                        return JsonConvert.SerializeObject(obj, Formatting.None);
                    }
                    else
                    {
                        //
                        WIP_UPDATE_NG_INFO Return_NG_INF0 = new WIP_UPDATE_NG_INFO();
                        NG_CODE_INFO[] Return_Ccode_info = new NG_CODE_INFO[dt_val.Rows.Count];

                        Return_NG_INF0.NG_HIST_SID = NG_HIST_ID;
                        Return_NG_INF0.COMMENT = dt_val.Rows[0]["COMMENT"].ToString();
                        Return_NG_INF0.NG_TOTAL = dt_val.Rows[0]["NG_QTY"].ToString();
                        Return_NG_INF0.OK_TOTAL = dt_val.Rows[0]["OK_QTY"].ToString();
                        Return_NG_INF0.EDIT_USER = dt_val.Rows[0]["EDIT_USER"].ToString();
                        for (int i = 0; i < dt_val.Rows.Count; i++)
                        {
                            Return_Ccode_info[i] = new NG_CODE_INFO();
                            Return_Ccode_info[i].NG_CODE_NO = dt_val.Rows[i]["NG_CODE"].ToString();
                            Return_Ccode_info[i].NG_CODE_QTY = dt_val.Rows[i]["NG_CODE_QTY"].ToString();
                            Return_Ccode_info[i].NG_CODE_COMMENT = dt_val.Rows[i]["NG_CODE_COMMENT"].ToString();

                        }
                        Return_NG_INF0.NG_CODE_INFOS = Return_Ccode_info;
                        //JArray ja = new JArray();


                        //string jsonString = JsonConvert.SerializeObject(Return_NG_INF0, Formatting.None);
                        //ja.Add(jsonString);

                        //obj["result"] = true;
                        //obj.Add(new JProperty("SID", NG_HIST_ID));
                        //obj.Add(new JProperty("Msg", "Query completed"));
                        //obj["DataArrays"] = ja;
                        ////Add(new JProperty("DataArrays", ja));
                        //string aa = JsonConvert.SerializeObject(obj, Formatting.None);
                        //return JsonConvert.SerializeObject(obj, Formatting.None);
                        var result = new
                        {
                            result = true,
                            SID = NG_HIST_ID,
                            TokenInfo = new
                            {
                                Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                            },
                            Msg = "Query completed",
                            DataArrays = new[]
                            {
                            JsonConvert.SerializeObject(Return_NG_INF0, Formatting.None)
                        }
                        };

                        return JsonConvert.SerializeObject(result, Formatting.None);

                    }
                }
                else
                {
                    var result = new
                    {
                        result = false,
                        Msg = "Token Verify Fail !",
                    };

                    return JsonConvert.SerializeObject(result, Formatting.None);
                }
              
            }
            catch (Exception Exc)
            {

                log.Error(Exc.Message);
                //obj["result"] = false;
                //obj.Add(new JProperty("SID", NG_HIST_ID));
                //obj.Add(new JProperty("Msg", Exc.Message));
                //return JsonConvert.SerializeObject(obj, Formatting.None);
                var result = new
                {
                    result = false,
                    Msg = Exc.Message,
                };

                return JsonConvert.SerializeObject(result, Formatting.None);
            }
        }

        /// <summary>
        /// OPI WDOEA Add NG Data API.
        /// </summary>
        public HttpResponseMessage Post([FromBody] WIP_NG_INFO NG_Info)
        {
            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICONGController));

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
                    string WDOEACICONG_HIST_SID = "";
                    string WIP_OPI_WDOEACICO_HIST_SID = "";
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
                                            ,[COMMENT]
                                            ,[ENABLE_FLAG]
                                            ,[CREATE_USER]
                                            ,[CREATE_TIME]
                                            ,[EDIT_USER]
                                            ,[EDIT_TIME]
                                            ,[OK_QTY])
                                                VALUES ({0},'{1}','{2}','{3}','Y','{4}','{5}','{4}','{5}','{6}')";
                    string NG_Detail_Sql = @"INSERT INTO [WIP_OPI_WDOEACICONG_HIST_DETAIL]
                                           ([WDOEACICONG_NG_HIST_DETAIL_SID]
                                           ,[WIP_OPI_WDOEACICOOUTPUT_HIST_SID]
                                           ,[NG_CODE]
                                           ,[NG_CODE_QTY]
                                           ,[COMMENT]
                                           ,[CREATE_USER]
                                           ,[CREATE_TIME]
                                           ,[EDIT_USER]
                                           ,[EDIT_TIME])
                                            VALUES ({0},'{1}','{2}','{3}','{4}','{5}','{6}','{5}','{6}')";
                    ;
                    string[] UP_SQLS = null; ;

                    //主程式,檢查上傳資料是否齊全
                    double sid = 0;
                    string M_OK_QTY = "";
                    if (NG_Info.CICO_SID != null && NG_Info.NG_CODE_INFOS != null)
                    {
                        //進行 NG 資料異動的準備
                        EDIT_USER = NG_Info.EDIT_USER;
                        NG_QTY = System.Convert.ToInt32(NG_Info.NG_TOTAL);
                        //抓取更新時間
                        DateTime now_time = MyDBQuery.GetDBTime();
                        EDIT_TIME = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                        COMMENT = NG_Info.COMMENT;
                        sid = Convert.ToDouble(now_time.Subtract(DateTime.Parse("2013-04-01")).TotalMilliseconds);
                        sid = sid * 100;
                        WDOEACICONG_HIST_SID = sid.ToString();
                        //準備新增NG Code 的SQL 
                        string[] InsertSql = new string[NG_Info.NG_CODE_INFOS.Length + 1];
                        string TempInsertSql = "";
                        M_OK_QTY = NG_Info.OK_TOTAL;
                        for (int i = 0; i < NG_Info.NG_CODE_INFOS.Length; i++)
                        {
                            NG_CODE_NO = NG_Info.NG_CODE_INFOS[i].NG_CODE_NO;
                            NG_CODE_QTY = System.Convert.ToInt32(NG_Info.NG_CODE_INFOS[i].NG_CODE_QTY);
                            NG_CODE_COMMENT = NG_Info.NG_CODE_INFOS[i].NG_CODE_COMMENT;
                            //NG_QTY += NG_CODE_QTY;
                            TempInsertSql = string.Format(NG_Detail_Sql, sid + i, sid, NG_CODE_NO, NG_CODE_QTY, NG_CODE_COMMENT, EDIT_USER, EDIT_TIME);
                            InsertSql[i + 1] = TempInsertSql;
                        }
                        NG_Insert_Sql = string.Format(NG_Insert_Sql, sid, NG_Info.CICO_SID, NG_QTY, COMMENT, EDIT_USER, EDIT_TIME, M_OK_QTY);
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
                                Msg = "The NG Data Transaction has been completed",
                                TokenInfo = new
                                {
                                    Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                }
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
                    var result = new
                    {
                        result = false,
                        Msg = "Token Verify Fail !",
                        SID = ""
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

        /// <summary>
        /// OPI WDOEA Update NG Data API.
        /// </summary>
        public HttpResponseMessage Put([FromBody] WIP_UPDATE_NG_INFO NG_HIS_Info)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICONGController));

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
                        string NG_HIST_SID = "";
                        int NG_QTY = 0;
                        string COMMENT = "";
                        string ENABLE_FLAG = "";
                        string NG_CODE = "";
                        int NG_CODE_QTY = 0;
                        string NG_CODE_COMMENT = "";
                        string EDIT_USER = "";
                        string EDIT_TIME = "";


                        string Check_NG_Info_SQL = "select TOP 1 * from WIP_OPI_WDOEACICOOUTPUT_HIST where ENABLE_FLAG='Y' AND WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' ";

                        string Update_NG_HIST_Sql = "update WIP_OPI_WDOEACICOOUTPUT_HIST set NG_QTY='{1}' , COMMENT='{2}' , ENABLE_FLAG='{3}', EDIT_USER='{4}', EDIT_TIME='{5}',OK_QTY='{6}'  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}'";
                        string Update_NG_DETAIL_Sql = "update WIP_OPI_WDOEACICONG_HIST_DETAIL set NG_CODE_QTY='{2}' , COMMENT='{3}' , EDIT_USER='{4}', EDIT_TIME='{5}'  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' AND NG_CODE='{1}'";

                        //主程式,檢查上傳資料是否齊全
                        if (NG_HIS_Info != null && NG_HIS_Info.NG_HIST_SID != "")
                        {
                            // 資料處理前的檢查

                            Check_NG_Info_SQL = string.Format(Check_NG_Info_SQL, NG_HIS_Info.NG_HIST_SID);
                            DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, Check_NG_Info_SQL);
                            SessionHelper.UpdateToken(_SessionToken);

                            DataTable dt_val = set_val.Tables[0].Copy();
                            //DataTable dt_val = MyDBQuery.GetTable(Check_NG_Info_SQL);

                            if (dt_val.Rows.Count > 0)
                            {
                                //NG 資料存在,進行NG HIS 資料異動的準備
                                // 
                                NG_HIST_SID = NG_HIS_Info.NG_HIST_SID;
                                NG_QTY = System.Convert.ToInt32(NG_HIS_Info.NG_TOTAL); ;
                                COMMENT = NG_HIS_Info.COMMENT;
                                //抓取更新時間
                                DateTime now_time = MyDBQuery.GetDBTime();
                                EDIT_TIME = now_time.ToString("yyyy-MM-dd HH:mm:ss");
                                EDIT_USER = NG_HIS_Info.EDIT_USER;
                                ENABLE_FLAG = "Y";
                                string[] Update_Sqls = new string[NG_HIS_Info.NG_CODE_INFOS.Length + 1];
                                string Temp_UpdateSql = "";
                                string M_OK_QTY = NG_HIS_Info.OK_TOTAL;
                                //準備NG Code 更新資料
                                for (int i = 0; i < NG_HIS_Info.NG_CODE_INFOS.Length; i++)
                                {
                                    NG_CODE = NG_HIS_Info.NG_CODE_INFOS[i].NG_CODE_NO;
                                    NG_CODE_QTY = System.Convert.ToInt32(NG_HIS_Info.NG_CODE_INFOS[i].NG_CODE_QTY);
                                    NG_CODE_COMMENT = NG_HIS_Info.NG_CODE_INFOS[i].NG_CODE_COMMENT;
                                    //NG_QTY += NG_CODE_QTY;
                                    //準備更新的SQL 
                                    Temp_UpdateSql = string.Format(Update_NG_DETAIL_Sql, NG_HIST_SID, NG_CODE, NG_CODE_QTY, NG_CODE_COMMENT, EDIT_USER, EDIT_TIME);
                                    Update_Sqls[i + 1] = Temp_UpdateSql;
                                }
                                //準備 NG HIST 更新資料
                                Update_NG_HIST_Sql = string.Format(Update_NG_HIST_Sql, NG_HIST_SID, NG_QTY, COMMENT, ENABLE_FLAG, EDIT_USER, EDIT_TIME, M_OK_QTY);
                                Update_Sqls[0] = Update_NG_HIST_Sql;

                                //開始進行交易
                                try
                                {
                                    _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    DataSet DtSet = Action_H5.doExecute(ref _SessionToken, Update_Sqls);
                                    SessionHelper.UpdateToken(_SessionToken);


                                    //obj["result"] = true;
                                    //obj.Add(new JProperty("Msg", "There Update NG Data Transation has been completed "));
                                    //obj.Add(new JProperty("SID", NG_HIST_SID));
                                    //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.OK, obj);
                                    //return httpResponseMessage400;
                                    var result = new
                                    {
                                        result = true,
                                        Msg = "The Update NG Data Transaction has been completed",
                                        SID = NG_HIST_SID,
                                        TokenInfo = new
                                        {
                                            Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
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
                                string Return_Msg = string.Format("Hist SID='{0}' NG HIST data not exists", NG_HIS_Info.NG_HIST_SID);
                                //obj["result"] = false;
                                //obj.Add(new JProperty("Msg", Return_Msg));
                                //obj.Add(new JProperty("SID", NG_HIS_Info.NG_HIST_SID));
                                //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                //return httpResponseMessage400;
                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = NG_HIS_Info.NG_HIST_SID,
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
                    //obj["result"] = false;
                    //obj.Add(new JProperty("Msg", ex.Message));
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


        /// <summary>
        /// OPI WDOEA Add NG Data API.
        /// </summary>
        [HttpDelete]
        public HttpResponseMessage Delete(WIP_Del_NG_INFO del_data)
        {
            {
                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(WIPOPI_WDOEAQ_CICONGController));

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
                        string NG_HIST_SID = del_data.NG_HIST_SID;
                        string EDIT_USER = del_data.EDIT_USER;
                        string EDIT_TIME = "";


                        string Check_NG_Info_SQL = "select TOP 1 * from WIP_OPI_WDOEACICOOUTPUT_HIST where ENABLE_FLAG='Y' AND WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}' ";

                        string Del_NG_HIST_Sql = "update WIP_OPI_WDOEACICOOUTPUT_HIST set ENABLE_FLAG='N', EDIT_USER='{1}', EDIT_TIME='{2}'  where WIP_OPI_WDOEACICOOUTPUT_HIST_SID='{0}'";

                        //主程式,檢查上傳資料是否齊全
                        if (NG_HIST_SID != "")
                        {
                            // 資料處理前的檢查

                            Check_NG_Info_SQL = string.Format(Check_NG_Info_SQL, NG_HIST_SID);
                            _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                            DataSet set_val = MyDBQuery.GetReader(ref _SessionToken, Check_NG_Info_SQL);
                            SessionHelper.UpdateToken(_SessionToken);

                            DataTable dt_val = set_val.Tables[0].Copy();
                            //DataTable dt_val = MyDBQuery.GetTable(Check_NG_Info_SQL);

                            if (dt_val.Rows.Count > 0)
                            {
                                //資料存在,進行NG資料異動的準備
                                //抓取更新時間
                                DateTime now_time = MyDBQuery.GetDBTime();
                                string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                                //準備刪除的SQL 
                                Del_NG_HIST_Sql = string.Format(Del_NG_HIST_Sql, NG_HIST_SID, EDIT_USER, now_time_string);
                                //開始進行交易
                                try
                                {
                                    _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                                    List<string> SQLs = new List<string>();
                                    SQLs.Add(Del_NG_HIST_Sql);
                                    string[] SQLs_list = SQLs.ToArray();
                                    DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                                    SessionHelper.UpdateToken(_SessionToken);

                                    //obj["result"] = true;
                                    //obj.Add(new JProperty("Msg", "There Delete Transation has been completed "));
                                    //obj.Add(new JProperty("SID", NG_HIST_SID));
                                    //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.OK, obj);
                                    //return httpResponseMessage400;

                                    var result = new
                                    {
                                        result = true,
                                        Msg = "There Delete Transaction has been completed",
                                        SID = NG_HIST_SID,
                                        TokenInfo = new
                                        {
                                            Expiration = _SessionToken.Expiration  // 假設這裡就是你取到的到期時間
                                        }
                                    };

                                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK, result);
                                    return httpResponseMessage;


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
                                //obj["result"] = false;
                                //obj.Add(new JProperty("Msg", Return_Msg));
                                //obj.Add(new JProperty("SID", NG_HIST_SID));
                                //HttpResponseMessage httpResponseMessage400 = Request.CreateResponse(HttpStatusCode.BadRequest, obj);
                                //return httpResponseMessage400;
                                var result = new
                                {
                                    result = false,
                                    Msg = Return_Msg,
                                    SID = NG_HIST_SID,
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
                    
                }

                catch (Exception ex)
                {
                    log.Error(ex.Message);
                    //obj["result"] = false;
                    //obj.Add(new JProperty("Msg", ex.Message));
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

    }
}
