using log4net;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json.Linq;
using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web.Http;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_KAOSUController : ApiController
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

        public class KAOSU_PROD_EPS_SAVE
        {
            public string ZZ_KAOSU_PROD_SCHEDULE_SID { get; set; }
            public string SCHEDULE_DATE { get; set; } // 串 ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE
            public string SCHEDULE_START_TIME { get; set; } 
            public string SCHEDULE_END_TIME { get; set; }
            public string OPERATION_CODE { get; set; }
            public string EQP_SID { get; set; }
            public string TOL_SID { get; set; }
            public string SCHEDULE_CYCLE_TIME { get; set; }
            public string TARGET_SHOT { get; set; }
            public string CHANGE_MOLD { get; set; }
            public string COMMENT { get; set; }
            public string LOGIN_USER { get; set; }

            public List<KAOSU_PROD_EPS_DETAIL> DETAILS { get; set; }
        }

        public class KAOSU_PROD_EPS_DETAIL
        {
            public string TOL_DETALS_SID { get; set; }
            public string SCHEDULE_CUR_CAV { get; set; }
            public string PART_NO { get; set; }
            public string PART_SPEC { get; set; }
            public string WO_SID { get; set; }
            public string WO_QUANTITY { get; set; }
            public string TARGET_PCS { get; set; }
        }

        /// <summary>
        /// OPI SCHEDULE Insert/Update
        /// </summary>
        [Route("api/H5_KAOSU_PROD_SAVE")]
        public HttpResponseMessage Post([FromBody] KAOSU_PROD_EPS_SAVE data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

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

                        #region 解析data

                        #region 參考 ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE [EQP_NO + SHIFT_DAY]

                        //抓EQP_NO
                        //string GetEQPSQL = $@"SELECT * FROM EQP_MASTER WHERE EQP_SID = '{data.EQP_SID}'";
                        //var GetEQP = MyDBQuery.GetReader(ref _SessionToken, GetEQPSQL);
                        //DataTable GetEQPDt = GetEQP.Tables[0].Copy();


                        //_SessionToken.Key = "WeyuTech" + _SessionToken.Key;


                        string BASESQL = $@"SELECT * FROM ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE WHERE  '{data.SCHEDULE_DATE}' BETWEEN SHIFT_START_DAY AND SHIFT_END_DAY";
                        var GetBASE = MyDBQuery.GetReader(ref _SessionToken, BASESQL);
                        DataTable GetBASEDt = GetBASE.Tables[0].Copy();
                        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                        string SHIFT_TYPE = null;
                        string SHIFT_CLASS_1 = null;
                        string SHIFT_START_TIME_1 = null;
                        string SHIFT_END_TIME_1 = null;
                        string SHIFT_CLASS_2 = null;
                        string SHIFT_START_TIME_2 = null;
                        string SHIFT_END_TIME_2 = null;
                        string ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID = null;
                        if (GetBASEDt.Rows.Count > 0)
                        {
                            //有串到Base資料
                            //SHIFT_TYPE = GetBASEDt.Rows[0]["SHIFT_TYPE"].ToString();
                            SHIFT_CLASS_1 = GetBASEDt.Rows[0]["SHIFT_CLASS_1"].ToString();
                            if (GetBASEDt.Rows[0]["SHIFT_START_TIME_1"] != DBNull.Value)
                            {
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE); 
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_START_DATE_1"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_START_TIME_1"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_START_TIME_1 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                                //SHIFT_START_TIME_1 = Convert
                                //    .ToDateTime(GetBASEDt.Rows[0]["SHIFT_START_TIME_1"])
                                //    .ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            if (GetBASEDt.Rows[0]["SHIFT_END_TIME_1"] != DBNull.Value)
                            {
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_END_DATE_1"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_END_TIME_1"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_END_TIME_1 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                                //SHIFT_END_TIME_1 = Convert
                                //    .ToDateTime(GetBASEDt.Rows[0]["SHIFT_END_TIME_1"])
                                //    .ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            SHIFT_CLASS_2 = GetBASEDt.Rows[0]["SHIFT_CLASS_2"].ToString();
                            if (GetBASEDt.Rows[0]["SHIFT_START_TIME_2"] != DBNull.Value)
                            {
                                //SHIFT_START_TIME_2 = Convert
                                //    .ToDateTime(GetBASEDt.Rows[0]["SHIFT_START_TIME_2"])
                                //    .ToString("yyyy-MM-dd HH:mm:ss");
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_START_DATE_2"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_START_TIME_2"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_START_TIME_2 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            if (GetBASEDt.Rows[0]["SHIFT_END_TIME_2"] != DBNull.Value)
                            {
                                //SHIFT_END_TIME_2 = Convert
                                //    .ToDateTime(GetBASEDt.Rows[0]["SHIFT_END_TIME_2"])
                                //    .ToString("yyyy-MM-dd HH:mm:ss");
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_END_DATE_2"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_END_TIME_2"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_END_TIME_2 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID = GetBASEDt.Rows[0]["ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID"].ToString();
                        }

                        #endregion

                        List<string> Sqls = new List<string>();
                        decimal MSID = MyDBQuery.GetDBSid();
                        decimal DSID = MSID + 1;

                        string FINAL_MSID = "";

                        if (string.IsNullOrEmpty(data.ZZ_KAOSU_PROD_SCHEDULE_SID))
                        {
                            //新增 -- 含表身

                            #region 表頭處理

                            string MSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE(ZZ_KAOSU_PROD_SCHEDULE_SID,SCHEDULE_DATE,SCHEDULE_START_TIME,SCHEDULE_END_TIME,OPERATION_CODE,EQP_SID,TOL_SID,SCHEDULE_CYCLE_TIME,TARGET_SHOT,CHANGE_MOLD,COMMENT,SHIFT_TYPE,SHIFT_CLASS_1,SHIFT_START_TIME_1,SHIFT_END_TIME_1,SHIFT_CLASS_2,SHIFT_START_TIME_2,SHIFT_END_TIME_2,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME,ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID)
                                            VALUES({MSID},'{data.SCHEDULE_DATE}','{data.SCHEDULE_START_TIME}','{data.SCHEDULE_END_TIME}','{data.OPERATION_CODE}','{data.EQP_SID}','{data.TOL_SID}','{data.SCHEDULE_CYCLE_TIME}','{data.TARGET_SHOT}','{data.CHANGE_MOLD}','{data.COMMENT}',{ToSqlValue(SHIFT_TYPE)} ,{ToSqlValue(SHIFT_CLASS_1)} ,{ToSqlValue(SHIFT_START_TIME_1)},{ToSqlValue(SHIFT_END_TIME_1)},{ToSqlValue(SHIFT_CLASS_2)},{ToSqlValue(SHIFT_START_TIME_2)},{ToSqlValue(SHIFT_END_TIME_2)},N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}',{ToSqlValue(ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID)} )";

                            //string MSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE(ZZ_KAOSU_PROD_SCHEDULE_SID,SCHEDULE_DATE,SCHEDULE_START_TIME,SCHEDULE_END_TIME,OPERATION_CODE,EQP_SID,TOL_SID,SCHEDULE_CYCLE_TIME,TARGET_SHOT,CHANGE_MOLD,COMMENT,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
                            //                VALUES({MSID},'{data.SCHEDULE_DATE}','{data.SCHEDULE_START_TIME}','{data.SCHEDULE_END_TIME}','{data.OPERATION_CODE}','{data.EQP_SID}','{data.TOL_SID}','{data.SCHEDULE_CYCLE_TIME}','{data.TARGET_SHOT}','{data.CHANGE_MOLD}','{data.COMMENT}',N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}')";
                            Sqls.Add(MSQL);
                            FINAL_MSID = MSID.ToString();
                            #endregion

                            #region 表身處理
                            string DSQL = "";

                            

                            for (int i = 0; i < data.DETAILS.Count; i++)
                            {
                                DSID++;

                                //表示新增
                                DSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE_DETAIL(ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID,ZZ_KAOSU_PROD_SCHEDULE_SID,TOL_DETALS_SID,SCHEDULE_CUR_CAV,PART_NO,PART_SPEC,WO_SID,WO_QUANTITY,TARGET_PCS,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
                                            VALUES({DSID},{FINAL_MSID},{data.DETAILS[i].TOL_DETALS_SID},{data.DETAILS[i].SCHEDULE_CUR_CAV},'{data.DETAILS[i].PART_NO}','{data.DETAILS[i].PART_SPEC}','{data.DETAILS[i].WO_SID}','{data.DETAILS[i].WO_QUANTITY}','{data.DETAILS[i].TARGET_PCS}',N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}' )";

                              
                                Sqls.Add(DSQL);
                            }

                            #endregion
                        }
                        else
                        {
                            //既有更新

                            #region 表頭處理

                            string MSQL = $@"UPDATE ZZ_KAOSU_PROD_SCHEDULE
                                SET SCHEDULE_DATE='{data.SCHEDULE_DATE}',SCHEDULE_START_TIME='{data.SCHEDULE_START_TIME}',SCHEDULE_END_TIME='{data.SCHEDULE_END_TIME}',
                                OPERATION_CODE='{data.OPERATION_CODE}',EQP_SID='{data.EQP_SID}',TOL_SID='{data.TOL_SID}',SCHEDULE_CYCLE_TIME='{data.SCHEDULE_CYCLE_TIME}',
                                TARGET_SHOT='{data.TARGET_SHOT}',CHANGE_MOLD='{data.CHANGE_MOLD}',COMMENT='{data.COMMENT}',SHIFT_TYPE={ToSqlValue(SHIFT_TYPE)},
                                SHIFT_CLASS_1={ToSqlValue(SHIFT_CLASS_1)},SHIFT_START_TIME_1={ToSqlValue(SHIFT_START_TIME_1)},SHIFT_END_TIME_1={ToSqlValue(SHIFT_END_TIME_1)},
                                SHIFT_CLASS_2={ToSqlValue(SHIFT_CLASS_2)}, SHIFT_START_TIME_2={ToSqlValue(SHIFT_START_TIME_2)},SHIFT_END_TIME_2={ToSqlValue(SHIFT_END_TIME_2)},
                                EDIT_USER=N'{data.LOGIN_USER}',EDIT_TIME = '{now_time_string}',ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID={ToSqlValue(ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID)}
                                WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";
                            //string MSQL = $@"UPDATE ZZ_KAOSU_PROD_SCHEDULE
                            //    SET SCHEDULE_DATE='{data.SCHEDULE_DATE}',SCHEDULE_START_TIME='{data.SCHEDULE_START_TIME}',SCHEDULE_END_TIME='{data.SCHEDULE_END_TIME}',
                            //    OPERATION_CODE='{data.OPERATION_CODE}',EQP_SID='{data.EQP_SID}',TOL_SID='{data.TOL_SID}',SCHEDULE_CYCLE_TIME='{data.SCHEDULE_CYCLE_TIME}',
                            //    TARGET_SHOT='{data.TARGET_SHOT}',CHANGE_MOLD='{data.CHANGE_MOLD}',COMMENT='{data.COMMENT}',
                            //    EDIT_USER=N'{data.LOGIN_USER}',EDIT_TIME = '{now_time_string}'
                            //    WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";
                            Sqls.Add(MSQL);
                            FINAL_MSID = data.ZZ_KAOSU_PROD_SCHEDULE_SID;
                            #endregion

                            //表身可能也有更新/新增
                            #region 表身
                            string DSQL = "";

                            //先幹掉表身LINK資料
                            string DEL_DSQL = $@"DELETE FROM ZZ_KAOSU_PROD_SCHEDULE_DETAIL WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{FINAL_MSID}'";
                            Sqls.Add(DEL_DSQL);

                            for (int i = 0; i < data.DETAILS.Count; i++)
                            {
                                DSID++;

                                //表示新增
                                DSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE_DETAIL(ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID,ZZ_KAOSU_PROD_SCHEDULE_SID,TOL_DETALS_SID,SCHEDULE_CUR_CAV,PART_NO,PART_SPEC,WO_SID,WO_QUANTITY,TARGET_PCS,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
                                            VALUES({DSID},{FINAL_MSID},{data.DETAILS[i].TOL_DETALS_SID},{data.DETAILS[i].SCHEDULE_CUR_CAV},'{data.DETAILS[i].PART_NO}','{data.DETAILS[i].PART_SPEC}','{data.DETAILS[i].WO_SID}','{data.DETAILS[i].WO_QUANTITY}','{data.DETAILS[i].TARGET_PCS}',N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}')";

                                Sqls.Add(DSQL);
                            }
                            #endregion
                        }

                        #endregion

                        //開始進行交易
                        try
                        {
                            
                            
                            string[] SQLs_list = Sqls.ToArray();
                            DataSet DtSet = Action_H5.doTranExecute(ref _SessionToken, SQLs_list);
                            SessionHelper.UpdateToken(_SessionToken);
                            DataTable ResultDt = DtSet.Tables[1].Copy();

                            for (int i = 0; i < ResultDt.Rows.Count; i++)
                            {
                                if (ResultDt.Rows[i]["Result"].ToString() != "true")
                                {
                                    var result_err = new
                                    {
                                        result = false,
                                        Msg = "The Insert Transaction has been Fail",
                                        DtInfo = ResultDt
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result_err);
                                }
                            }

                            var result = new
                            {
                                result = true,
                                Msg = "The Insert Transaction has been completed",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {
                            //throw new Exception("Insert Fail");
                            var result = new
                            {
                                result = false,
                                Msg = "Insert Fail"
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
                        var result = new
                        {
                            result = false,
                            Msg = "Token Verify Fail !"
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

        #region 2版
        public class KAOSU_PROD_EPS_SAVE_V2
        {
            public string ZZ_KAOSU_PROD_SCHEDULE_SID { get; set; }
            public string SCHEDULE_DATE { get; set; } // 串 ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE
            public string SCHEDULE_START_TIME { get; set; }
            public string SCHEDULE_END_TIME { get; set; }
            public string OPERATION_CODE { get; set; }
            public string EQP_SID { get; set; }
            public string TOL_SID { get; set; }
            public string SCHEDULE_CYCLE_TIME { get; set; }
            public string TARGET_SHOT { get; set; }
            public string CHANGE_MOLD { get; set; }
            public string COMMENT { get; set; }
            public string LOGIN_USER { get; set; }
            public string PRODUCTION_STATUS { get; set; }

            public List<KAOSU_PROD_EPS_DETAIL_V2> DETAILS { get; set; }
        }

        public class KAOSU_PROD_EPS_DETAIL_V2
        {
            public string ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID { get; set; }
            public string TOL_DETALS_SID { get; set; }
            public string SCHEDULE_CUR_CAV { get; set; }
            public string PART_NO { get; set; }
            public string PART_SPEC { get; set; }
            public string WO_SID { get; set; }
            public string WO_QUANTITY { get; set; }
            public string TARGET_PCS { get; set; }
        }

        /// <summary>
        /// OPI SCHEDULE Insert/Update
        /// </summary>
        [Route("api/H5_KAOSU_PROD_SAVE_V2")]
        public HttpResponseMessage Post([FromBody] KAOSU_PROD_EPS_SAVE_V2 data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

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

                        #region 解析data

                        #region 參考 ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE [EQP_NO + SHIFT_DAY]

                        string BASESQL = $@"SELECT * FROM ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE WHERE  '{data.SCHEDULE_DATE}' BETWEEN SHIFT_START_DAY AND SHIFT_END_DAY";
                        var GetBASE = MyDBQuery.GetReader(ref _SessionToken, BASESQL);
                        DataTable GetBASEDt = GetBASE.Tables[0].Copy();
                        _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                        string SHIFT_TYPE = null;
                        string SHIFT_CLASS_1 = null;
                        string SHIFT_START_TIME_1 = null;
                        string SHIFT_END_TIME_1 = null;
                        string SHIFT_CLASS_2 = null;
                        string SHIFT_START_TIME_2 = null;
                        string SHIFT_END_TIME_2 = null;
                        string ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID = null;
                        if (GetBASEDt.Rows.Count > 0)
                        {
                            //有串到Base資料
                            //SHIFT_TYPE = GetBASEDt.Rows[0]["SHIFT_TYPE"].ToString();
                            SHIFT_CLASS_1 = GetBASEDt.Rows[0]["SHIFT_CLASS_1"].ToString();
                            if (GetBASEDt.Rows[0]["SHIFT_START_TIME_1"] != DBNull.Value)
                            {
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_START_DATE_1"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_START_TIME_1"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_START_TIME_1 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            if (GetBASEDt.Rows[0]["SHIFT_END_TIME_1"] != DBNull.Value)
                            {
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_END_DATE_1"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_END_TIME_1"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_END_TIME_1 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            SHIFT_CLASS_2 = GetBASEDt.Rows[0]["SHIFT_CLASS_2"].ToString();
                            if (GetBASEDt.Rows[0]["SHIFT_START_TIME_2"] != DBNull.Value)
                            {
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_START_DATE_2"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_START_TIME_2"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_START_TIME_2 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            if (GetBASEDt.Rows[0]["SHIFT_END_TIME_2"] != DBNull.Value)
                            {
                                DateTime baseDate = Convert.ToDateTime(data.SCHEDULE_DATE);
                                baseDate = baseDate.AddDays(double.Parse(GetBASEDt.Rows[0]["SHIFT_END_DATE_2"].ToString()));
                                TimeSpan shiftTime = TimeSpan.Parse(GetBASEDt.Rows[0]["SHIFT_END_TIME_2"].ToString());

                                DateTime shiftStart = baseDate.Date.Add(shiftTime);
                                SHIFT_END_TIME_2 = shiftStart.ToString("yyyy-MM-dd HH:mm:ss");
                            }
                            ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID = GetBASEDt.Rows[0]["ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID"].ToString();
                        }

                        #endregion

                        List<string> Sqls = new List<string>();
                        decimal MSID = MyDBQuery.GetDBSid();
                        decimal DSID = MSID + 1;

                        string FINAL_MSID = "";

                        if (string.IsNullOrEmpty(data.ZZ_KAOSU_PROD_SCHEDULE_SID))
                        {
                            //新增 -- 含表身

                            #region 表頭處理

                            string MSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE(ZZ_KAOSU_PROD_SCHEDULE_SID,SCHEDULE_DATE,SCHEDULE_START_TIME,SCHEDULE_END_TIME,OPERATION_CODE,EQP_SID,TOL_SID,SCHEDULE_CYCLE_TIME,TARGET_SHOT,CHANGE_MOLD,COMMENT,SHIFT_TYPE,SHIFT_CLASS_1,SHIFT_START_TIME_1,SHIFT_END_TIME_1,SHIFT_CLASS_2,SHIFT_START_TIME_2,SHIFT_END_TIME_2,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME,ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID,PRODUCTION_STATUS)
                                            VALUES({MSID},'{data.SCHEDULE_DATE}','{data.SCHEDULE_START_TIME}','{data.SCHEDULE_END_TIME}','{data.OPERATION_CODE}','{data.EQP_SID}','{data.TOL_SID}','{data.SCHEDULE_CYCLE_TIME}','{data.TARGET_SHOT}','{data.CHANGE_MOLD}','{data.COMMENT}',{ToSqlValue(SHIFT_TYPE)} ,{ToSqlValue(SHIFT_CLASS_1)} ,{ToSqlValue(SHIFT_START_TIME_1)},{ToSqlValue(SHIFT_END_TIME_1)},{ToSqlValue(SHIFT_CLASS_2)},{ToSqlValue(SHIFT_START_TIME_2)},{ToSqlValue(SHIFT_END_TIME_2)},N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}',{ToSqlValue(ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID)},'{data.PRODUCTION_STATUS}' )";

                            Sqls.Add(MSQL);
                            FINAL_MSID = MSID.ToString();
                            #endregion

                            #region 表身處理
                            string DSQL = "";

                            for (int i = 0; i < data.DETAILS.Count; i++)
                            {
                                DSID++;

                                //表示新增
                                DSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE_DETAIL(ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID,ZZ_KAOSU_PROD_SCHEDULE_SID,TOL_DETALS_SID,SCHEDULE_CUR_CAV,PART_NO,PART_SPEC,WO_SID,WO_QUANTITY,TARGET_PCS,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
                                    VALUES({DSID},{FINAL_MSID},{data.DETAILS[i].TOL_DETALS_SID},{data.DETAILS[i].SCHEDULE_CUR_CAV},'{data.DETAILS[i].PART_NO}','{data.DETAILS[i].PART_SPEC}','{data.DETAILS[i].WO_SID}','{data.DETAILS[i].WO_QUANTITY}','{data.DETAILS[i].TARGET_PCS}',N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}' )";

                                Sqls.Add(DSQL);
                            }

                            #endregion
                        }
                        else
                        {
                            //既有更新

                            #region 表頭處理

                            string MSQL = $@"UPDATE ZZ_KAOSU_PROD_SCHEDULE
                                SET SCHEDULE_DATE='{data.SCHEDULE_DATE}',SCHEDULE_START_TIME='{data.SCHEDULE_START_TIME}',SCHEDULE_END_TIME='{data.SCHEDULE_END_TIME}',
                                OPERATION_CODE='{data.OPERATION_CODE}',EQP_SID='{data.EQP_SID}',TOL_SID='{data.TOL_SID}',SCHEDULE_CYCLE_TIME='{data.SCHEDULE_CYCLE_TIME}',
                                TARGET_SHOT='{data.TARGET_SHOT}',CHANGE_MOLD='{data.CHANGE_MOLD}',COMMENT='{data.COMMENT}',SHIFT_TYPE={ToSqlValue(SHIFT_TYPE)},
                                SHIFT_CLASS_1={ToSqlValue(SHIFT_CLASS_1)},SHIFT_START_TIME_1={ToSqlValue(SHIFT_START_TIME_1)},SHIFT_END_TIME_1={ToSqlValue(SHIFT_END_TIME_1)},
                                SHIFT_CLASS_2={ToSqlValue(SHIFT_CLASS_2)}, SHIFT_START_TIME_2={ToSqlValue(SHIFT_START_TIME_2)},SHIFT_END_TIME_2={ToSqlValue(SHIFT_END_TIME_2)},
                                EDIT_USER=N'{data.LOGIN_USER}',EDIT_TIME = '{now_time_string}',ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID={ToSqlValue(ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID)},
                                PRODUCTION_STATUS='{data.PRODUCTION_STATUS}'
                                WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";

                            Sqls.Add(MSQL);
                            FINAL_MSID = data.ZZ_KAOSU_PROD_SCHEDULE_SID;
                            #endregion

                            //表身可能也有更新/新增
                            #region 表身
                            string DSQL = "";

                            //先幹掉表身LINK資料
                            //先刪除 除了 DETAIL傳來的 以外的表身資訊 
                            //(key: ZZ_KAOSU_PROD_SCHEDULE_SID + 非DETAIL的 ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID 皆砍)

                            //string DEL_DSQL = $@"DELETE FROM ZZ_KAOSU_PROD_SCHEDULE_DETAIL WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{FINAL_MSID}'";
                            string ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR = "";
                            for (int i = 0; i < data.DETAILS.Count; i++)
                            {
                                if (i == data.DETAILS.Count - 1)
                                {
                                    ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR += $@"'{data.DETAILS[i].ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID}'";
                                }
                                else
                                {
                                    ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR += $@"'{data.DETAILS[i].ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID}',";

                                }
                            }

                            if (!string.IsNullOrEmpty(ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR))
                            {
                                ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR = ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR.Replace(",''", "");
                                string DEL_DSQL = $@"DELETE FROM ZZ_KAOSU_PROD_SCHEDULE_DETAIL
                                WHERE ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID IN ( 
                                SELECT ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID 
                                FROM ZZ_KAOSU_PROD_SCHEDULE_DETAIL 
                                --符合表頭的單身
                                WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{FINAL_MSID}'
                                --排除本次編輯的表身資料 全砍 
                                AND ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID NOT IN ({ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID_STR})
                                )";

                                Sqls.Add(DEL_DSQL);
                            }

                           

                            for (int i = 0; i < data.DETAILS.Count; i++)
                            {
                                DSID++;

                                
                                if (string.IsNullOrEmpty(data.DETAILS[i].ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID))
                                {
                                    //表示新增
                                    DSQL = $@"INSERT INTO ZZ_KAOSU_PROD_SCHEDULE_DETAIL(ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID,ZZ_KAOSU_PROD_SCHEDULE_SID,TOL_DETALS_SID,SCHEDULE_CUR_CAV,PART_NO,PART_SPEC,WO_SID,WO_QUANTITY,TARGET_PCS,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
                                            VALUES({DSID},{FINAL_MSID},{data.DETAILS[i].TOL_DETALS_SID},{data.DETAILS[i].SCHEDULE_CUR_CAV},'{data.DETAILS[i].PART_NO}','{data.DETAILS[i].PART_SPEC}','{data.DETAILS[i].WO_SID}','{data.DETAILS[i].WO_QUANTITY}','{data.DETAILS[i].TARGET_PCS}',N'{data.LOGIN_USER}',N'{now_time_string}',N'{data.LOGIN_USER}',N'{now_time_string}')";


                                }
                                else
                                {
                                    //表示更新
                                    DSQL = $@"UPDATE ZZ_KAOSU_PROD_SCHEDULE_DETAIL
                                            SET TOL_DETALS_SID = '{data.DETAILS[i].TOL_DETALS_SID}',SCHEDULE_CUR_CAV='{data.DETAILS[i].SCHEDULE_CUR_CAV}',PART_NO='{data.DETAILS[i].PART_NO}',
                                            PART_SPEC='{data.DETAILS[i].PART_SPEC}',WO_SID='{data.DETAILS[i].WO_SID}', WO_QUANTITY='{data.DETAILS[i].WO_QUANTITY}',TARGET_PCS='{data.DETAILS[i].TARGET_PCS}',
                                            EDIT_USER='{data.LOGIN_USER}',EDIT_TIME='{now_time_string}'
                                            WHERE ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID = '{data.DETAILS[i].ZZ_KAOSU_PROD_SCHEDULE_DETAIL_SID}'";
                                }
                                Sqls.Add(DSQL);

                            }
                            #endregion
                        }

                        #endregion

                        //開始進行交易
                        try
                        {


                            string[] SQLs_list = Sqls.ToArray();
                            DataSet DtSet = Action_H5.doTranExecute(ref _SessionToken, SQLs_list);
                            DataTable ResultDt = DtSet.Tables[1].Copy();

                            for (int i = 0; i < ResultDt.Rows.Count; i++)
                            {
                                if (ResultDt.Rows[i]["Result"].ToString() != "true")
                                {
                                    var result_err = new
                                    {
                                        result = false,
                                        Msg = "The Insert Transaction has been Fail",
                                        DtInfo = ResultDt
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result_err);
                                }
                            }

                            var result = new
                            {
                                result = true,
                                Msg = "The Insert Transaction has been completed",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {
                            //throw new Exception("Insert Fail");
                            var result = new
                            {
                                result = false,
                                Msg = "Insert Fail"
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
                        var result = new
                        {
                            result = false,
                            Msg = "Token Verify Fail !"
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
        #endregion


        public static string ToSqlValue(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return "NULL"; // 直接給 SQL NULL
            }
            else
            {
                return $"'{input.Replace("'", "''")}'"; // 加單引號，並處理掉內部的單引號
            }
        }

        [HttpGet]
        [Route("api/H5_KAOSU_WO_GET_SERIAL_NUMBER")]
        public HttpResponseMessage Get()
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

                JObject obj = new JObject();
                obj.Add(new JProperty("result", false));
                try
                {
                    if (session["Key"] == null)
                    {
                        var fail = new { result = false, Msg = "Token Verify Fail !" };
                        return Request.CreateResponse(HttpStatusCode.ExpectationFailed, fail);
                    }

                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);

                    // 取 DB 時間（如果後續要用）
                    DateTime now_time = MyDBQuery.GetDBTime();
                    string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                    // 以 61 開頭、長度剛好 8（61 + 6碼數字），抓目前「最大尾碼」
                    string GetMaxSuffixSql = @"
                    SELECT ISNULL(MAX(CAST(RIGHT(LTRIM(RTRIM(WO)), 6) AS INT)), 0) AS MAX_SUFFIX
                    FROM WOR_MASTER
                    WHERE LTRIM(RTRIM(WO)) LIKE '61[0-9][0-9][0-9][0-9][0-9][0-9]';
                    ";
                    DataTable dt = MyDBQuery.GetTable(ref _SessionToken, GetMaxSuffixSql);
                    SessionHelper.UpdateToken(_SessionToken);

                    int maxSuffix = 0;
                    if (dt.Rows.Count > 0 && dt.Rows[0]["MAX_SUFFIX"] != DBNull.Value)
                    {
                        maxSuffix = Convert.ToInt32(dt.Rows[0]["MAX_SUFFIX"]);
                    }

                    // 下一號：最大尾碼 + 1
                    int nextSuffix = maxSuffix + 1;

                    // 防呆：尾碼最多 6 碼（000001 ~ 999999）
                    if (nextSuffix > 999999)
                    {
                        var overflow = new
                        {
                            result = false,
                            Msg = "序號已達上限（61 + 6 碼）。"
                        };
                        return Request.CreateResponse(HttpStatusCode.OK, overflow);
                    }

                    // 組成 "61" + 6 碼補零
                    string newWO = "61" + nextSuffix.ToString("D6");

                    var ok = new
                    {
                        result = true,
                        WO_NUMBER = newWO
                    };
                    return Request.CreateResponse(HttpStatusCode.OK, ok);
                }
                catch (Exception ex)
                {
                    log.Error(ex.Message);
                    var error = new
                    {
                        result = false,
                        Msg = ex.Message,
                        SID = ""
                    };
                    return Request.CreateResponse(HttpStatusCode.ExpectationFailed, error);
                }

            }



        }

        // ▼ 新模板的一列資料
        public class WorkOrderRow
        {
            public string CustomerCode { get; set; }
            public string MoldCode { get; set; }      // 模具編號（"-" 視為空）
            public string Partname { get; set; }      // PART_NAME
            public string Partcode { get; set; }      // PART_SPEC
            public string Productcode { get; set; }   // PART_NO
            public double? Qty { get; set; }          // Q'ty (pcs)
        }

        // ▼ 12 個月份別名
        private static readonly Dictionary<string, int> MonthAliases =
            new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                ["JAN"] = 1,
                ["JANUARY"] = 1,
                ["FEB"] = 2,
                ["FEBRUARY"] = 2,
                ["MAR"] = 3,
                ["MARCH"] = 3,
                ["APR"] = 4,
                ["APRIL"] = 4,
                ["MAY"] = 5,
                ["JUN"] = 6,
                ["JUNE"] = 6,
                ["JUL"] = 7,
                ["JULY"] = 7,
                ["AUG"] = 8,
                ["AUGUST"] = 8,
                ["SEP"] = 9,
                ["SEPT"] = 9,
                ["SEPTEMBER"] = 9,
                ["OCT"] = 10,
                ["OCTOBER"] = 10,
                ["NOV"] = 11,
                ["NOVEMBER"] = 11,
                ["DEC"] = 12,
                ["DECEMBER"] = 12,
            };

        // ▼ 由工作表名稱判斷月份（支援 "2025 SEP", "SEP-2025", "Sep", "September"...）
        private static int DetectMonthFromSheetName(string sheetName)
        {
            if (string.IsNullOrWhiteSpace(sheetName))
                throw new ArgumentException("工作表名稱為空，無法判斷月份。");

            var tokens = Regex.Split(sheetName, @"[^A-Za-z]+")
                              .Where(t => !string.IsNullOrWhiteSpace(t));

            foreach (var t in tokens)
                if (MonthAliases.TryGetValue(t.Trim(), out int m)) return m;

            throw new InvalidOperationException($"無法由工作表名稱「{sheetName}」判斷月份（需含 JAN..DEC 或完整月份）。");
        }

        // ▼ 依規則計算：WO 前5碼（例 62509）與起始流水（兩位數）與第一筆工單號
        private static (string Prefix5, int StartSerial, string FirstWO) GetWoStartInfo(
            ref WeYuSEC_H5S.WeyuToken sessionToken,
            string sheetName,
            DateTime now // 可改用 DB 時間
        )
        {
            int yy = now.Year % 100;
            int mm = DetectMonthFromSheetName(sheetName);
            string prefix5 = $"6{yy:00}{mm:00}"; // 例：2025/SEP => "62509"

            string sql = $@"
                SELECT COUNT(*) AS CNT
                FROM WOR_MASTER WITH (NOLOCK)
                WHERE LEN(WO)=7 AND LEFT(WO,5)='{prefix5}'";

            DataTable dt = MyDBQuery.GetTable(ref sessionToken, sql);
            int count = (dt.Rows.Count > 0) ? Convert.ToInt32(dt.Rows[0]["CNT"]) : 0;

            int nextSerial = count + 1;
            string firstWO = $"{prefix5}{nextSerial:00}";
            return (prefix5, nextSerial, firstWO);
        }

        // ▼ 建立最終要回傳/寫庫的 DataTable 結構
        private static DataTable CreateWorkOrderDataTable()
        {
            var dt = new DataTable("KAOSU_WorkOrders");
            dt.Columns.Add("ROW_NO", typeof(int));
            dt.Columns.Add("CustomerCode", typeof(string));
            dt.Columns.Add("MoldCode", typeof(string));
            dt.Columns.Add("Partname", typeof(string));
            dt.Columns.Add("Partcode", typeof(string));
            dt.Columns.Add("Productcode", typeof(string));
            dt.Columns.Add("Qty", typeof(decimal));
            dt.Columns.Add("UPDATE_FLAG", typeof(string));  // "Y" or "N"
            dt.Columns.Add("WO", typeof(string));           // 7 碼
            return dt;
        }

        private static object DbNullIfEmpty(string s)
        {
            return string.IsNullOrWhiteSpace(s) ? (object)DBNull.Value : s.Trim();
        }

        // MoldCode 清洗："-" 或破折號 → 視為空字串
        private static string CleanMold(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return "";
            var t = s.Trim();
            if (t == "-" || t == "–" || t == "—") return "";
            return t;
        }

        // 比對用 key（忽略大小寫、前後空白、Mold 的 '-' 當空）
        private static string MakeKey(string productcode, string customercode, string moldcode)
        {
            string norm(string v) => (v ?? "").Trim().ToUpperInvariant();
            var mold = CleanMold(moldcode);
            return $"{norm(productcode)}||{norm(customercode)}||{norm(mold)}";
        }

        // 單引號轉義
        private static string Esc(string s) => (s ?? "").Replace("'", "''");

        // 逐筆查：有舊資料才算 UPDATE；回傳是否找到，以及舊的 WO
        // 有 WORK_MONTH 欄位版本
        private static bool TryGetExistingWO(
            ref WeYuSEC_H5S.WeyuToken sessionToken,
            string partNo, string customerName, string moldNo,
            int workMonth,
            out string wo)
        {
            partNo = partNo ?? "";
            customerName = customerName ?? "";
            moldNo = CleanMold(moldNo);

            string moldCond = string.IsNullOrEmpty(moldNo)
                ? "(MOLD_NO IS NULL OR LTRIM(RTRIM(MOLD_NO))='')"
                : $"MOLD_NO = N'{Esc(moldNo)}'";

            string sql = $@"
        SELECT TOP 1 WO
        FROM WOR_MASTER WITH (NOLOCK)
        WHERE PART_NO = N'{Esc(partNo)}'
          AND CUSTOMER_NO = N'{Esc(customerName)}'
          AND {moldCond}
          AND ZZ_WORK_MONTH = {workMonth}
        ORDER BY WO";

            sessionToken.Key = "WeyuTech" + sessionToken.Key;
            var dt = MyDBQuery.GetTable(ref sessionToken, sql);
            if (dt.Rows.Count > 0) { wo = Convert.ToString(dt.Rows[0]["WO"]); return true; }
            wo = null; return false;
        }

        // ▼ 由 rows 建出 DataTable：只收 Qty 有值；設定 UPDATE_FLAG 與 WO（新值會吃流水並自增）
        //   - 同一批檔案內若同組合重複，會共用同一個新 WO，不會重複吃號
        // rows：解析好的 Excel 資料（只會在這裡再過濾 Qty）
        // prefix5：例如 "62509"
        // currentSerial：起始流水（函式內會遞增，因此用 ref）
        // sessionToken：給逐筆查詢用
        private static DataTable BuildWorkOrderDataTable(
            List<WorkOrderRow> rows,
            string prefix5,
            int workMonth,
        ref int currentSerial,
            ref WeYuSEC_H5S.WeyuToken sessionToken)
        {
            var dt = CreateWorkOrderDataTable();

            // 批內快取：避免同一組合重複打 DB；key = Productcode||CustomerCode||MoldCode
            var existCache = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase); // key -> 已存在WO
            var newCache = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase); // key -> 本批新配WO

            int rowNo = 0;



            foreach (var r in rows)
            {
                // 只有 Qty 有值才寫入（若要 >0 再寫，改成 r.Qty.HasValue && r.Qty.Value > 0）
                if (!r.Qty.HasValue) continue;

                var product = r.Productcode ?? "";
                var customer = r.CustomerCode ?? "";
                var mold = CleanMold(r.MoldCode); // "-" → ""

                string key = MakeKey(product, customer, mold);

                string updateFlag, wo;

                // 1) 批內快取：舊資料存在？
                if (existCache.TryGetValue(key, out string woExist))
                {
                    updateFlag = "Y";
                    wo = woExist;
                }
                // 2) 批內快取：本批已配新號？
                else if (newCache.TryGetValue(key, out string woNew))
                {
                    updateFlag = "N";
                    wo = woNew;
                }
                else
                {

                    // 3) 第一次遇到 → 打 DB 查是否有舊資料
                    if (TryGetExistingWO(ref sessionToken, product, customer, mold, workMonth, out string foundWO))
                    {
                        updateFlag = "Y";
                        wo = foundWO;
                        existCache[key] = wo; // 記錄到快取
                    }
                    else
                    {
                        // 沒有舊資料 → 配新號
                        updateFlag = "N";
                        wo = $"{prefix5}{currentSerial:00}";
                        currentSerial++;          // 流水 +1
                        newCache[key] = wo;       // 批內記錄，避免同組合重複吃號
                    }
                }

                dt.Rows.Add(
                    ++rowNo,
                    DbNullIfEmpty(r.CustomerCode),
                    DbNullIfEmpty(mold),                 // "-" 已轉空
                    DbNullIfEmpty(r.Partname),
                    DbNullIfEmpty(r.Partcode),
                    DbNullIfEmpty(product),
                    Convert.ToDecimal(r.Qty.Value),
                    updateFlag,
                    wo
                );
            }

            return dt;
        }

        // ===================== 上傳 API（新模板 + 流水配號 + DataTable 產出） =====================

        [Route("api/H5_KAOSU_UploadScheduleXlsx")]
        [HttpPost]
        public async Task<HttpResponseMessage> PostUploadScheduleXlsx()
        {
            var session = System.Web.HttpContext.Current.Session;

            try
            {
                // 需要 Session 的話，保留以下驗證；否則可移除
                if (session?["Key"] == null)
                    return Request.CreateResponse(HttpStatusCode.Unauthorized, new { result = false, msg = "Token Verify Fail !" });

                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken =
                    new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), Convert.ToDateTime(sessionExpiration));

                if (!Request.Content.IsMimeMultipartContent())
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { result = false, msg = "Content-Type 必須為 multipart/form-data" });

                // 讀取上傳檔
                var provider = new MultipartMemoryStreamProvider();
                await Request.Content.ReadAsMultipartAsync(provider).ConfigureAwait(false);

                var fileContent = provider.Contents.FirstOrDefault(c =>
                    c.Headers.ContentDisposition != null &&
                    (!string.IsNullOrEmpty(c.Headers.ContentDisposition.FileName) ||
                     !string.IsNullOrEmpty(c.Headers.ContentDisposition.FileNameStar)));

                if (fileContent == null)
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { result = false, msg = "找不到檔案欄位（請用 form-data 欄位名 file）" });

                var cd = fileContent.Headers.ContentDisposition;
                var originalFileName = (cd.FileNameStar ?? cd.FileName ?? "").Trim('"');
                if (string.IsNullOrWhiteSpace(originalFileName))
                    return Request.CreateResponse(HttpStatusCode.BadRequest,
                        new { result = false, msg = "上傳檔案沒有檔名" });

                var ext = Path.GetExtension(originalFileName)?.ToLowerInvariant();
                if (ext != ".xlsx")
                    return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "只允許 .xlsx 檔案" });

                // 儲存上傳檔（HostingEnvironment 比 Server.MapPath 穩）
                string root = System.Web.Hosting.HostingEnvironment.MapPath("~/");
                if (string.IsNullOrEmpty(root))
                    return Request.CreateResponse(HttpStatusCode.InternalServerError,
                        new { result = false, msg = "無法解析網站根目錄（MapPath 失敗）" });

                string uploadDir = Path.Combine(root, "excel", "uploads");
                if (!Directory.Exists(uploadDir)) Directory.CreateDirectory(uploadDir);

                string stampedName = $"{DateTime.Now:yyyyMMdd_HHmmssfff}_{Path.GetFileNameWithoutExtension(originalFileName)}{ext}";
                string savedPath = Path.Combine(uploadDir, stampedName);

                var fileBytes = await fileContent.ReadAsByteArrayAsync().ConfigureAwait(false);
                File.WriteAllBytes(savedPath, fileBytes);

                // ========= 取得工單流水資訊（只需讀 sheet 名稱） =========
                string sheetNameForMonth;
                using (var pkgForName = new ExcelPackage(new FileInfo(savedPath)))
                {
                    var ws0 = pkgForName.Workbook.Worksheets.FirstOrDefault();
                    if (ws0 == null)
                        return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "Excel 內沒有任何工作表" });
                    sheetNameForMonth = ws0.Name;
                }

                // DB 時間（你已有方法）
                DateTime dbTime = MyDBQuery.GetDBTime();

                var woStart = GetWoStartInfo(ref _SessionToken, sheetNameForMonth, dbTime);
                SessionHelper.UpdateToken(_SessionToken);
                // woStart.Prefix5 例 "62509"
                // woStart.StartSerial 例 1
                // woStart.FirstWO 例 "6250901"

                // ========= 解析 Excel 內容（新模板） =========
                var rows = new List<WorkOrderRow>();
                var columnsDetected = new List<string>();

                using (var package = new ExcelPackage(new FileInfo(savedPath)))
                {
                    var ws = package.Workbook.Worksheets.FirstOrDefault();
                    if (ws == null)
                        return Request.CreateResponse(HttpStatusCode.BadRequest, new { result = false, msg = "Excel 內沒有任何工作表" });

                    if (ws.Dimension == null || ws.Dimension.End.Row < 2)
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { result = false, msg = "工作表沒有可讀資料（至少需要標題列與一列資料）" });

                    int startRow = 2;
                    int startCol = ws.Dimension.Start.Column;
                    int endCol = ws.Dimension.End.Column;
                    int endRow = ws.Dimension.End.Row;

                    string NormalizeHeader(string s)
                    {
                        if (s == null) return string.Empty;
                        return s.Replace("\u00A0", " ").Replace("\u2007", " ").Replace("\u202F", " ").Trim();
                    }

                    var headerToIndex = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                    for (int c = startCol; c <= endCol; c++)
                    {
                        var header = NormalizeHeader(ws.Cells[1, c].Text);
                        if (!string.IsNullOrEmpty(header) && !headerToIndex.ContainsKey(header))
                        {
                            headerToIndex[header] = c;
                            columnsDetected.Add(header);
                        }
                    }
                    if (headerToIndex.Count == 0)
                        return Request.CreateResponse(HttpStatusCode.BadRequest,
                            new { result = false, msg = "找不到標題列（第 1 列全為空白）" });

                    var map = new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
                    {
                        { "CustomerCode", new[] { "Customer Code", "Customer", "CustomerCode" } },
                        { "MoldCode",     new[] { "Mold Code", "Mold", "MoldCode" } },
                        { "Partname",     new[] { "Part name", "Partname", "Part Name" } },
                        { "Partcode",     new[] { "Part code", "Partcode", "Part Code" } },
                        { "Productcode",  new[] { "Product code", "Productcode", "Product Code", "PART NO", "Part No", "PartNo" } },
                        { "Qty",          new[] { "Q'ty (pcs)", "Q’ty (pcs)", "Qty (pcs)", "Qty", "Quantity", "Q'ty" } },
                    };

                    int? FindCol(string logical)
                    {
                        if (!map.ContainsKey(logical)) return null;
                        foreach (var alias in map[logical])
                            if (headerToIndex.TryGetValue(alias, out int col)) return col;
                        return null;
                    }

                    // 必填：至少 Productcode 與 Partname
                    var required = new[] { "Productcode", "Partname" };
                    var missing = required.Where(k => FindCol(k) == null).ToList();
                    if (missing.Any())
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest, new
                        {
                            result = false,
                            msg = $"缺少必要欄位標頭：{string.Join(", ", missing)}",
                            columnsDetected
                        });
                    }

                    string GetText(int? col, int row)
                    {
                        if (!col.HasValue) return "";
                        var txt = (ws.Cells[row, col.Value].Text ?? "").Trim();
                        return (txt == "-" ? "" : txt);
                    }

                    double? GetQty(int? col, int row)
                    {
                        if (!col.HasValue) return null;
                        var cell = ws.Cells[row, col.Value];
                        var v = cell.Value;
                        if (v == null) return null;

                        if (v is double d) return d;
                        if (v is decimal m) return (double)m;
                        if (v is float f) return (double)f;

                        var s = cell.Text?.Trim();
                        if (string.IsNullOrEmpty(s) || s == "-") return null;
                        s = s.Replace(",", ""); // 去千分位
                        if (double.TryParse(s, out var parsed)) return parsed;
                        return null;
                    }

                    for (int r = startRow; r <= endRow; r++)
                    {
                        var product = GetText(FindCol("Productcode"), r);
                        var partname = GetText(FindCol("Partname"), r);
                        var mold = GetText(FindCol("MoldCode"), r);
                        var customer = GetText(FindCol("CustomerCode"), r);
                        var partcode = GetText(FindCol("Partcode"), r);
                        var qty = GetQty(FindCol("Qty"), r);

                        // 主要欄位全空且數量空 → 略過
                        if (string.IsNullOrWhiteSpace(product) &&
                            string.IsNullOrWhiteSpace(partname) &&
                            string.IsNullOrWhiteSpace(partcode) &&
                            string.IsNullOrWhiteSpace(mold) &&
                            string.IsNullOrWhiteSpace(customer) &&
                            qty == null)
                            continue;

                        rows.Add(new WorkOrderRow
                        {
                            CustomerCode = customer,
                            MoldCode = mold,
                            Partname = partname,
                            Partcode = partcode,
                            Productcode = product,
                            Qty = qty
                        });
                    }
                }
                // 取得月份（由工作表名稱）與年份（用 DB 時間）
                int monthNumber = DetectMonthFromSheetName(sheetNameForMonth);
                int yearNumber = dbTime.Year;

                int workMonth = yearNumber * 100 + monthNumber;
                // ========= 依規則建 DataTable：UPDATE_FLAG 與 WO 配號 =========
                int currentSerial = woStart.StartSerial;
                DataTable excelDt = BuildWorkOrderDataTable(rows, woStart.Prefix5, workMonth, ref currentSerial, ref _SessionToken);
                SessionHelper.UpdateToken(_SessionToken);
                // TODO: 在此依 UPDATE_FLAG 分流，進行 INSERT / UPDATE 到資料庫

                #region UPDATE_FLAG 分流，進行 INSERT / UPDATE 到資料庫 WOR_MASTER

                List<string> SQLS = new List<string>();
                string SQL = "";
                decimal SID = MyDBQuery.GetSid();
                

                // 本月1號 00:00:00
                var firstOfMonth = new DateTime(yearNumber, monthNumber, 1, 0, 0, 0);

                // 下個月1號 00:00:00
                var firstOfNextMonth = firstOfMonth.AddMonths(1);

                // 轉成你要的字串格式
                string SCHEDULE_INPUT_DATE = $"{firstOfMonth:yyyy-MM-dd} 00:00:00";
                string ERP_SCHEDULE_FINISH_DATE = $"{firstOfNextMonth:yyyy-MM-dd} 00:00:00";
                string DateTimeNow = MyDBQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");
                for (int i = 0; i < excelDt.Rows.Count; i++)
                {
                    SID++;
                    if (excelDt.Rows[i]["UPDATE_FLAG"].ToString() == "Y")
                    {
                        //Update
                        SQL = $@"UPDATE WOR_MASTER SET QUANTITY='{excelDt.Rows[i]["Qty"].ToString()}' , EDIT_USER='ExcelUpdload_Loader' , EDIT_TIME = '{DateTimeNow}'
                              WHERE MOLD_NO='{excelDt.Rows[i]["MoldCode"].ToString()}' AND CUSTOMER_NO='{excelDt.Rows[i]["CustomerCode"].ToString()}' AND PART_NO='{excelDt.Rows[i]["Productcode"].ToString()}' AND ZZ_WORK_MONTH = {workMonth}";
                    }
                    else
                    {
                        //Insert
                        SQL = $@"INSERT INTO WOR_MASTER(WO_SID,WO,WO_TYPE,STATUS,QUANTITY,UNIT,PART_NO,ACTIVE_DATE,ZZ_DUEDATE,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME,CUSTOMER_NO,MOLD_NO,ERP_WO_TYPE,ZZ_WORK_MONTH)
                        VALUES('{SID}','{excelDt.Rows[i]["WO"].ToString()}','Standard','Release','{excelDt.Rows[i]["Qty"].ToString()}','PCS','{excelDt.Rows[i]["Productcode"].ToString()}','{SCHEDULE_INPUT_DATE}','{ERP_SCHEDULE_FINISH_DATE}','ExcelUpdload_Loader','{DateTimeNow}','ExcelUpdload_Loader','{DateTimeNow}','{excelDt.Rows[i]["CustomerCode"].ToString()}','{excelDt.Rows[i]["MoldCode"].ToString()}','EPS','{workMonth}')";
                    }
                    SQLS.Add(SQL);
                }

                _SessionToken.Key = "WeyuTech" + _SessionToken.Key;

                var sqls = SQLS.ToArray();

                var result = Action_H5.doExecute(ref _SessionToken, sqls);
                SessionHelper.UpdateToken(_SessionToken);
                #endregion


                // 回傳
                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    result = true,
                    savedFile = $"excel/uploads/{stampedName}",
                    parsedCount = rows.Count,
                    outputCount = excelDt.Rows.Count,
                    prefix5 = woStart.Prefix5,
                    startSerial = woStart.StartSerial,
                    lastSerialUsed = currentSerial - 1
                    // 若要預覽 excelDt，請自行序列化 DataTable 再擷取前幾列
                });
            }
            catch (Exception ex)
            {
                // 開發期建議回傳完整錯誤；上線可改成 ex.Message
                return Request.CreateResponse(HttpStatusCode.InternalServerError,
                    new { result = false, msg = ex.ToString() });
            }
        }

        public class SCHEDULE_CREATE
        {
            public string ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID { get; set; }
            public string SHIFT_START_DAY { get; set; }   // 開始日期 (yyyy-MM-dd)
            public string SHIFT_END_DAY { get; set; }     // 結束日期 (yyyy-MM-dd)

            public string SHIFT_CLASS_1 { get; set; }     // 班別 1 名稱
            public string SHIFT_START_DATE_1 { get; set; } // 開始日偏移 (0=當日, 1=隔日)
            public string SHIFT_START_TIME_1 { get; set; } // 開始時間 (HH:mm)
            public string SHIFT_END_DATE_1 { get; set; }   // 結束日偏移 (0=當日, 1=隔日)
            public string SHIFT_END_TIME_1 { get; set; }   // 結束時間 (HH:mm)

            public string SHIFT_CLASS_2 { get; set; }
            public string SHIFT_START_DATE_2 { get; set; }
            public string SHIFT_START_TIME_2 { get; set; }
            public string SHIFT_END_DATE_2 { get; set; }
            public string SHIFT_END_TIME_2 { get; set; }
            public string LOGIN_USER { get; set; }
        }

        [Route("api/H5_KAOSU_SCHEDULE_CREATE")]
        public HttpResponseMessage Post([FromBody] SCHEDULE_CREATE data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

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
                        
                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                        #region 異動資料的準備
                        decimal SID = MyDBQuery.GetDBSid();
                        string DateTimeNow = MyDBQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                        string SQL = "";
                        //檢查是否為Update 或 Insert
                        if (string.IsNullOrEmpty(data.ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID))
                        {
                            //空表示 新增
                            //檢查是否介於 ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE 裡面資料的 SHIFT_START_DAY ~ SHIFT_END_DAY 跟傳來是否重疊
                            string overlapSql = $@"
                        SELECT 
                            ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID AS SID,
                            CAST(SHIFT_START_DAY AS date) AS SHIFT_START_DAY,
                            CAST(SHIFT_END_DAY   AS date) AS SHIFT_END_DAY,
                            SHIFT_CLASS_1, SHIFT_CLASS_2
                        FROM ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE
                        WHERE CAST(SHIFT_START_DAY AS date) <= '{data.SHIFT_END_DAY}'
                          AND CAST(SHIFT_END_DAY   AS date) >= '{data.SHIFT_START_DAY}';
                        ";
                            //重疊回傳錯誤
                            var CheckSet = MyDBQuery.GetReader(ref _SessionToken, overlapSql);
                            DataTable CheckDt = CheckSet.Tables[0].Copy();
                            if (CheckDt.Rows.Count > 0)
                            {
                                //throw new Exception("Token Verify Fail !");
                                var result = new
                                {
                                    result = false,
                                    Msg = "Start time or end time already exists."
                                };

                                return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                            }




                            //組成資料
                            SQL = $@"INSERT INTO ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE(ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID,SHIFT_START_DAY,SHIFT_END_DAY,SHIFT_CLASS_1,SHIFT_START_DATE_1,SHIFT_START_TIME_1,SHIFT_END_DATE_1,SHIFT_END_TIME_1,SHIFT_CLASS_2,SHIFT_START_DATE_2,SHIFT_START_TIME_2,SHIFT_END_DATE_2,SHIFT_END_TIME_2,CREATE_USER,CREATE_TIME,EDIT_USER,EDIT_TIME)
                                        VALUES({SID},'{data.SHIFT_START_DAY}','{data.SHIFT_END_DAY}','{data.SHIFT_CLASS_1}','{data.SHIFT_START_DATE_1}','{data.SHIFT_START_TIME_1}','{data.SHIFT_END_DATE_1}','{data.SHIFT_END_TIME_1}','{data.SHIFT_CLASS_2}','{data.SHIFT_START_DATE_2}','{data.SHIFT_START_TIME_2}','{data.SHIFT_END_DATE_2}','{data.SHIFT_END_TIME_2}','{data.LOGIN_USER}','{DateTimeNow}','{data.LOGIN_USER}','{DateTimeNow}')";


                        }
                        else
                        {
                            //表示 更新,檢查自己以外的時間 有沒有重疊
                            //檢查是否介於 ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE 裡面資料的 SHIFT_START_DAY ~ SHIFT_END_DAY 跟傳來是否重疊
                            string overlapSql = $@"
                            SELECT 
                                ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID AS SID,
                                CAST(SHIFT_START_DAY AS date) AS SHIFT_START_DAY,
                                CAST(SHIFT_END_DAY   AS date) AS SHIFT_END_DAY,
                                SHIFT_CLASS_1, SHIFT_CLASS_2
                            FROM ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE
                            WHERE CAST(SHIFT_START_DAY AS date) <= '{data.SHIFT_END_DAY}'
                              AND CAST(SHIFT_END_DAY   AS date) >= '{data.SHIFT_START_DAY}'
                              AND ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID != '{data.ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID}'
                            ";

                            //重疊回傳錯誤
                            var CheckSet = MyDBQuery.GetReader(ref _SessionToken, overlapSql);
                            DataTable CheckDt = CheckSet.Tables[0].Copy();
                            if (CheckDt.Rows.Count > 0)
                            {
                                //throw new Exception("Token Verify Fail !");
                                var result = new
                                {
                                    result = false,
                                    Msg = "Start time or end time already exists."
                                };

                                return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                            }

                            SQL = $@"UPDATE ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE
                                SET SHIFT_START_DAY='{data.SHIFT_START_DAY}',SHIFT_END_DAY='{data.SHIFT_END_DAY}',SHIFT_CLASS_1='{data.SHIFT_CLASS_1}',SHIFT_START_DATE_1='{data.SHIFT_START_DATE_1}',
                                SHIFT_START_TIME_1='{data.SHIFT_START_TIME_1}',SHIFT_END_DATE_1='{data.SHIFT_END_DATE_1}',SHIFT_END_TIME_1='{data.SHIFT_END_TIME_1}',SHIFT_CLASS_2='{data.SHIFT_CLASS_2}',
                                SHIFT_START_DATE_2='{data.SHIFT_START_DATE_2}',SHIFT_START_TIME_2='{data.SHIFT_START_TIME_2}',SHIFT_END_DATE_2='{data.SHIFT_END_DATE_2}',
                                SHIFT_END_TIME_2='{data.SHIFT_END_TIME_2}',EDIT_USER='{data.LOGIN_USER}',EDIT_TIME='{DateTimeNow}'
                                WHERE ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID='{data.ZZ_KAOSU_PROD_SHIFT_DAILY_REPORT_BASE_SID}'";

                        }
                        #endregion


                        List<string> Sqls = new List<string>();

                        Sqls.Add(SQL);
                        //開始進行交易
                        try
                        {


                            string[] SQLs_list = Sqls.ToArray();
                            _SessionToken.Key = "WeyuTech"+_SessionToken.Key;
                            DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            DataTable ResultDt = DtSet.Tables[1].Copy();

                            for (int i = 0; i < ResultDt.Rows.Count; i++)
                            {
                                if (ResultDt.Rows[i]["Result"].ToString() != "true")
                                {
                                    var result_err = new
                                    {
                                        result = false,
                                        Msg = "The Insert Transaction has been Fail",
                                        DtInfo = ResultDt
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result_err);
                                }
                            }

                            var result = new
                            {
                                result = true,
                                Msg = "The Insert Transaction has been completed",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {
                            //throw new Exception("Insert Fail");
                            var result = new
                            {
                                result = false,
                                Msg = "Insert Fail"
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
                        var result = new
                        {
                            result = false,
                            Msg = "Token Verify Fail !"
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

        public class SCHEDULE_CHECK_IN_OUT
        {
            public string CHECK_IN_TIME { get; set; }
            public string CHECK_OUT_TIME { get; set; }
            public string ZZ_KAOSU_PROD_SCHEDULE_SID { get; set; }
            public string LOGIN_USER { get; set; }
        }

        [Route("api/H5_KAOSU_SCHEDULE_CHECK_IN_OUT")]
        public HttpResponseMessage Post([FromBody] SCHEDULE_CHECK_IN_OUT data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

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

                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                        #region 異動資料的準備
                        decimal SID = MyDBQuery.GetDBSid();
                        string DateTimeNow = MyDBQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                        #region 檢查誰是空值

                        string UPDATE_SQL = "";
                        
                        if (string.IsNullOrEmpty(data.CHECK_OUT_TIME))
                        {
                            //CHECK-OUT-TIME 空值 表示 輸入的為 CHECK-IN-TIME
                            UPDATE_SQL = $@"CHECK_IN_TIME='{data.CHECK_IN_TIME}'";

                            // 檢查傳進來的CHECK_IN時間 是否為NULL
                            string CHECK_IN_SQL = $@"SELECT COUNT(*) AS CNT 
                        FROM WIP_OPI_WDOEACICO_HIST 
                        WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}' AND CHECK_IN_TIME IS NOT NULL";

                            var CheckInSet = MyDBQuery.GetReader(ref _SessionToken, CHECK_IN_SQL);
                            DataTable CheckInDt = CheckInSet.Tables[0].Copy();

                            if (int.Parse(CheckInDt.Rows[0]["CNT"].ToString()) > 0)
                            {
                                //表示 被填過了
                                var result_err = new
                                {
                                    result = false,
                                    Msg = "Update Fail. check-in-time is not null."
                                };

                                return Request.CreateResponse(HttpStatusCode.OK, result_err);
                            }

                        }
                        else if (string.IsNullOrEmpty(data.CHECK_IN_TIME))
                        {
                            //CHECK-IN-TIME 空值 表示 輸入的為 CHECK-OUT-TIME
                            UPDATE_SQL = $@"CHECK_OUT_TIME='{data.CHECK_OUT_TIME}' , COMPLETED='Y' , COMPLETED_TIME='{data.CHECK_OUT_TIME}'";

                            //檢查 CHECK-OUT-TIME 是否都為NULL
                            string CHECK_OUT_SQL = $@"SELECT COUNT(*) AS CNT 
                        FROM WIP_OPI_WDOEACICO_HIST 
                        WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}' AND CHECK_OUT_TIME IS NOT NULL";

                            var CheckOutSet = MyDBQuery.GetReader(ref _SessionToken, CHECK_OUT_SQL);
                            DataTable CheckOutDt = CheckOutSet.Tables[0].Copy();

                            if (int.Parse(CheckOutDt.Rows[0]["CNT"].ToString()) > 0)
                            {
                                //表示 被填過了
                                var result_err = new
                                {
                                    result = false,
                                    Msg = "Update Fail. check-out-time is not null."
                                };

                                return Request.CreateResponse(HttpStatusCode.OK, result_err);
                            }

                        }

                        #endregion

                        string SQL = $@"UPDATE WIP_OPI_WDOEACICO_HIST 
                                        SET {UPDATE_SQL} ,
                                        EDIT_USER = '{data.LOGIN_USER}' , EDIT_TIME = '{now_time_string}'
                                        WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";

                        #endregion

                        List<string> Sqls = new List<string>();

                        Sqls.Add(SQL);
                        //開始進行交易
                        try
                        {

                            string[] SQLs_list = Sqls.ToArray();
                            _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                            DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            DataTable ResultDt = DtSet.Tables[1].Copy();

                            for (int i = 0; i < ResultDt.Rows.Count; i++)
                            {
                                if (ResultDt.Rows[i]["Result"].ToString() != "true")
                                {
                                    var result_err = new
                                    {
                                        result = false,
                                        Msg = "The Insert Transaction has been Fail",
                                        DtInfo = ResultDt
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result_err);
                                }
                            }

                            var result = new
                            {
                                result = true,
                                Msg = "The Insert Transaction has been completed",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {
                            //throw new Exception("Insert Fail");
                            var result = new
                            {
                                result = false,
                                Msg = "Insert Fail"
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
                        var result = new
                        {
                            result = false,
                            Msg = "Token Verify Fail !"
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


        public class SCHEDULE_CHECK_IN_OUT_CANCEL
        {
            public string CHECK_IN_TIME { get; set; }
            public string CHECK_OUT_TIME { get; set; }
            public string ZZ_KAOSU_PROD_SCHEDULE_SID { get; set; }
            public string LOGIN_USER { get; set; }
        }

        [Route("api/H5_KAOSU_SCHEDULE_CHECK_IN_OUT_CANCEL")]
        public HttpResponseMessage Post([FromBody] SCHEDULE_CHECK_IN_OUT_CANCEL data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

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

                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                        #region 異動資料的準備
                        decimal SID = MyDBQuery.GetDBSid();
                        string DateTimeNow = MyDBQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                        #region 檢查誰是空值
                        // 假設 now_time 是 DateTime，loginUser 是 string
                        var setClauses = new List<string>();

                        // 符合 CLEAR 就清成 NULL（大小寫不敏感＆避免 null 例外）
                        if (string.Equals(data.CHECK_IN_TIME, "CLEAR", StringComparison.OrdinalIgnoreCase))
                        {
                            setClauses.Add("CHECK_IN_TIME = NULL");
                        }
                        if (string.Equals(data.CHECK_OUT_TIME, "CLEAR", StringComparison.OrdinalIgnoreCase))
                        {
                            setClauses.Add("CHECK_OUT_TIME = NULL");
                        }


                        string setSql = string.Join(", ", setClauses);

                        string SQL = $@"
                        UPDATE WIP_OPI_WDOEACICO_HIST
                        SET {setSql} , 
                        EDIT_USER = '{data.LOGIN_USER}' , EDIT_TIME = '{now_time_string}'
                        WHERE ZZ_KAOSU_PROD_SCHEDULE_SID='{data.ZZ_KAOSU_PROD_SCHEDULE_SID}'";




                        #endregion

                                        
                                        

                        #endregion

                        List<string> Sqls = new List<string>();

                        Sqls.Add(SQL);
                        //開始進行交易
                        try
                        {

                            string[] SQLs_list = Sqls.ToArray();
                            _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                            DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            DataTable ResultDt = DtSet.Tables[1].Copy();

                            for (int i = 0; i < ResultDt.Rows.Count; i++)
                            {
                                if (ResultDt.Rows[i]["Result"].ToString() != "true")
                                {
                                    var result_err = new
                                    {
                                        result = false,
                                        Msg = "The Insert Transaction has been Fail",
                                        DtInfo = ResultDt
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result_err);
                                }
                            }

                            var result = new
                            {
                                result = true,
                                Msg = "The Insert Transaction has been completed",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {
                            //throw new Exception("Insert Fail");
                            var result = new
                            {
                                result = false,
                                Msg = "Insert Fail"
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
                        var result = new
                        {
                            result = false,
                            Msg = "Token Verify Fail !"
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


        public class SCHEDULE_CHECK_IN_OUT_EPS_PACKAGE
        {
            public string CHECK_IN_TIME { get; set; }
            public string CHECK_OUT_TIME { get; set; }
            public string WIP_OPI_WDOEACICO_HIST_SID { get; set; }
            public string LOGIN_USER { get; set; }
            public string OK_QTY { get; set; }
            public string NG_QTY { get; set; }
        }

        [Route("api/H5_KAOSU_SCHEDULE_EPS_PACKAGE_CHECK_IN_OUT")]
        public HttpResponseMessage Post([FromBody] SCHEDULE_CHECK_IN_OUT_EPS_PACKAGE data)
        {
            {

                var session = System.Web.HttpContext.Current.Session;

                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(H5_KAOSUController));

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

                        DateTime now_time = MyDBQuery.GetDBTime();
                        string now_time_string = now_time.ToString("yyyy-MM-dd HH:mm:ss");

                        #region 異動資料的準備
                        decimal SID = MyDBQuery.GetDBSid();
                        string DateTimeNow = MyDBQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                        #region 檢查誰是空值

                        string UPDATE_SQL = "";

                        if (string.IsNullOrEmpty(data.CHECK_OUT_TIME)&& string.IsNullOrEmpty(data.CHECK_IN_TIME))
                        {
                            UPDATE_SQL = "ACCOUNT_NO=ACCOUNT_NO";
                        }
                        else if (string.IsNullOrEmpty(data.CHECK_OUT_TIME))
                        {
                            //CHECK-OUT-TIME 空值 表示 輸入的為 CHECK-IN-TIME
                            UPDATE_SQL = $@"CHECK_IN_TIME='{data.CHECK_IN_TIME}'";

                            // 檢查傳進來的CHECK_IN時間 是否為NULL
                            string CHECK_IN_SQL = $@"SELECT COUNT(*) AS CNT 
                        FROM WIP_OPI_WDOEACICO_HIST 
                        WHERE WIP_OPI_WDOEACICO_HIST_SID='{data.WIP_OPI_WDOEACICO_HIST_SID}' AND CHECK_IN_TIME IS NOT NULL";

                            var CheckInSet = MyDBQuery.GetReader(ref _SessionToken, CHECK_IN_SQL);
                            DataTable CheckInDt = CheckInSet.Tables[0].Copy();

                            if (int.Parse(CheckInDt.Rows[0]["CNT"].ToString()) > 0)
                            {
                                //表示 被填過了
                                var result_err = new
                                {
                                    result = false,
                                    Msg = "Update Fail. check-in-time is not null."
                                };

                                return Request.CreateResponse(HttpStatusCode.OK, result_err);
                            }

                        }
                        else if (string.IsNullOrEmpty(data.CHECK_IN_TIME))
                        {
                            //CHECK-IN-TIME 空值 表示 輸入的為 CHECK-OUT-TIME
                            UPDATE_SQL = $@"CHECK_OUT_TIME='{data.CHECK_OUT_TIME}' , COMPLETED='Y' , COMPLETED_TIME='{data.CHECK_OUT_TIME}'";

                            //檢查 CHECK-OUT-TIME 是否都為NULL
                            string CHECK_OUT_SQL = $@"SELECT COUNT(*) AS CNT 
                        FROM WIP_OPI_WDOEACICO_HIST 
                        WHERE WIP_OPI_WDOEACICO_HIST_SID='{data.WIP_OPI_WDOEACICO_HIST_SID}' AND CHECK_OUT_TIME IS NOT NULL";

                            var CheckOutSet = MyDBQuery.GetReader(ref _SessionToken, CHECK_OUT_SQL);
                            DataTable CheckOutDt = CheckOutSet.Tables[0].Copy();

                            if (int.Parse(CheckOutDt.Rows[0]["CNT"].ToString()) > 0)
                            {
                                //表示 被填過了
                                var result_err = new
                                {
                                    result = false,
                                    Msg = "Update Fail. check-out-time is not null."
                                };

                                return Request.CreateResponse(HttpStatusCode.OK, result_err);
                            }

                        }

                        #endregion

                        string SQL = $@"UPDATE WIP_OPI_WDOEACICO_HIST 
                                        SET {UPDATE_SQL} ,
                                        EDIT_USER = '{data.LOGIN_USER}' , EDIT_TIME = '{now_time_string}' ,
                                        OK_QTY = '{data.OK_QTY}' , NG_QTY = '{data.NG_QTY}'
                                        WHERE WIP_OPI_WDOEACICO_HIST_SID='{data.WIP_OPI_WDOEACICO_HIST_SID}'";

                        #endregion

                        List<string> Sqls = new List<string>();

                        Sqls.Add(SQL);
                        //開始進行交易
                        try
                        {

                            string[] SQLs_list = Sqls.ToArray();
                            _SessionToken.Key = "WeyuTech" + _SessionToken.Key;
                            DataSet DtSet = Action_H5.doExecute(ref _SessionToken, SQLs_list);
                            DataTable ResultDt = DtSet.Tables[1].Copy();

                            for (int i = 0; i < ResultDt.Rows.Count; i++)
                            {
                                if (ResultDt.Rows[i]["Result"].ToString() != "true")
                                {
                                    var result_err = new
                                    {
                                        result = false,
                                        Msg = "The Insert Transaction has been Fail",
                                        DtInfo = ResultDt
                                    };

                                    return Request.CreateResponse(HttpStatusCode.OK, result_err);
                                }
                            }

                            var result = new
                            {
                                result = true,
                                Msg = "The Insert Transaction has been completed",
                            };

                            return Request.CreateResponse(HttpStatusCode.OK, result);
                        }
                        catch (Exception ex)
                        {
                            //throw new Exception("Insert Fail");
                            var result = new
                            {
                                result = false,
                                Msg = "Insert Fail"
                            };

                            return Request.CreateResponse(HttpStatusCode.ExpectationFailed, result);
                        }
                    }
                    else
                    {
                        //throw new Exception("Token Verify Fail !");
                        var result = new
                        {
                            result = false,
                            Msg = "Token Verify Fail !"
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
