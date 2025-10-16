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
using WeYuSEC_H5;
using WeYuSEC_H5S;
using WeYuWIP_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_Lot_Check_INController : ApiController
    {
        public static ILog log;
        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }
        // GET: api/H5_Lot_Check_IN
        //public IEnumerable<string> Get()
        //{
        //    return new string[] { "value1", "value2" };
        //}

        // GET: api/H5_Lot_Check_IN/5
        public string Get(string LOT, string REPORT_TIME, string USER_NO, string INPUT_FORM_NAME, string SHIFT_SID, string COMMENT)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                //string[] Lots_List = new string[1];
                string Lots_List = LOT;

                //string[] Users_List = new string[1];
                string Users_List = "ADMINV2";

                //string[] Eqps_List = new string[1];
                string Eqps_List= "EQTW-1";


                bool CreateLotFlag = _wipAction.LotCheckIn(Lots_List, DATA_LINK_SID,DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"), Users_List, Eqps_List, System.Convert.ToDecimal(SHIFT_SID),"PROD","COMMENT","Jack-CheckIn", ref _SessionToken, out DataTable LotDT);
                if (CreateLotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Check-in SUCCESS!!";
                }
                else
                {
                    return "check-in fail!!";
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }
        public string Get(string Action, string LOT, string REPORT_TIME, string USER_SID, string INPUT_FORM_NAME, decimal SHIFT_SID, string COMMENT)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                string[] Lots_List = new string[1];
                Lots_List[0] = LOT;
                

                string[] Users_List = new string[1];
                Users_List[0] = "ADMINV2";
                //User= "ADMINV2";

                //string[] Eqps_List = new string[1];
                string EQP_NO = "EQTW-1";

                //string LOT, decimal DATA_LINK_SID, string REPORT_TIME, string ACCOUNT_NO, string[] EQP_NOs, decimal SHIFT_SID, bool GroupInUser,  string INPUT_FORM_NAME,  ref WeYuSEC_H5S.WeyuToken _weyuToken, out DataTable LotDT
                bool CheckOutLotFlag = _wipAction.LotCheckOut(LOT, DATA_LINK_SID, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"), "ADMINV2", EQP_NO, SHIFT_SID,false,"CHECK-OUT COMMENT","Jack-CheckOut", ref _SessionToken, out DataTable LotDT);
                SessionHelper.UpdateToken(_SessionToken);
                //bool CheckOutLotFlag = true;
                if (CheckOutLotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Check-Out LOT SUCCESS!!";
                }
                else
                {
                    return "Check-Out LOT fail!!";
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

        // POST: api/H5_Lot_Check_IN
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/H5_Lot_Check_IN/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/H5_Lot_Check_IN/5
        public void Delete(int id)
        {
        }

        public class DcItem
        {
            public string DC_ITEM_CODE { get; set; }
            public int DC_ITEM_SEQ { get; set; }
            public string DC_ITEM_VALUE { get; set; }
            public string DC_ITEM_COMMENT { get; set; }
            public string RESULT { get; set; }
        }
        public class RequestLotEDCModel
        {
            public string LOT { get; set; }
            public string ACCOUNT_NO { get; set; }
            public decimal SHIFT_SID { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string EQP_NO { get; set; }
            public string COMMENT { get; set; }
            public List<DcItem> dtDCList { get; set; } // 用 List<DcItem> 來接收 DataTable

        }

        public class RequestLotKeyPartModel
        {
            public string LOT { get; set; }
            public string MLOT { get; set; }
            public decimal QTY { get; set; }
            public string ACCOUNT_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
        }

        [Route("api/LotRecordKeyPart")]
        public HttpResponseMessage Post([FromBody] RequestLotKeyPartModel data)
        {
            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            try
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                WeYuDB_H5.DBQuery_H5 _query = new WeYuDB_H5.DBQuery_H5();
                #region 處理邏輯
               
                var session = System.Web.HttpContext.Current.Session;
                if (session["Key"] != null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    decimal DATA_LINK_SID = _wipAction.GetSID();
                    if (data == null)
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest, "請求內容為空");
                    }

                    //資料整備
                    
                    string LOT = data.LOT;
                    string MLOT = data.MLOT;
                    decimal QTY = data.QTY;
                    string REPORT_TIME = _query.GetDBTimeToString();
                    string ACCOUNT_NO = data.ACCOUNT_NO;
                    string COMMENT = data.COMMENT;
                    string INPUT_FORM_NAME = data.INPUT_FORM_NAME;
                    bool LotRecKeyPartFlag = _wipAction.LotRecordKeyPart(LOT,MLOT,QTY,DATA_LINK_SID,REPORT_TIME,ACCOUNT_NO,COMMENT, INPUT_FORM_NAME,ref _SessionToken, out DataTable LotDt);
                    SessionHelper.UpdateToken(_SessionToken);

                    if (LotRecKeyPartFlag == true)
                    {//回傳資料格式

                        var result = new
                        {
                            result = true,
                            data = LotDt
                        };


                        string json = JsonConvert.SerializeObject(result);

                        HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessageH5;
                    }
                    else
                    {
                        var result = new
                        {
                            result = false,
                            LOT = LotDt
                        };


                        string json = JsonConvert.SerializeObject(result);

                        HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessageH5;
                    }
                }
                else
                {
                    var result = new
                    {
                        result = false,
                        LOT = "token is null "
                    };



                    string json = JsonConvert.SerializeObject(result);

                    HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessageH5;
                }
                #endregion

            }
            catch (Exception ex)
            {
                //log.Error(ex.Message);
                //HttpResponseMessage httpResponseMessageerror = Request.CreateResponse(HttpStatusCode.Forbidden);
                //httpResponseMessageerror.Content = new StringContent(ex.Message, System.Text.Encoding.UTF8, "application/json");
                //return httpResponseMessageerror;
                var result = new
                {
                    result = false,
                    Msg = ex.Message
                };
                string json = JsonConvert.SerializeObject(result);

                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;
                //throw;
            }

        }


            [Route("api/LotEDC")]
        public HttpResponseMessage Post([FromBody] RequestLotEDCModel data)
        {
            log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
            //log = LogManager.GetLogger(typeof(WeyuLoginController));
            try
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
                #region 處理邏輯
                IEnumerable<string> TokenKeyheaderValues = Request.Headers.GetValues("TokenKey");
                string QrTokenKey = TokenKeyheaderValues.First();

                //  取得 HTTP Header 內的 Token
                var request = HttpContext.Current.Request;
                var tokenKey = request.Headers["TokenKey"];
                var TokenExpiry = request.Headers["TokenExpiry"];
                string FinalTokenKey = "WeyuTech" + tokenKey;
                var session = System.Web.HttpContext.Current.Session;
                if (session["Key"] != null)
                {
                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

                    decimal DATA_LINK_SID = _wipAction.GetSID();

                    if (data == null)
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest, "請求內容為空");
                    }

                    //資料整備
                    decimal LOT_SID = 0; //從LOT反找
                    string GetLotInfo = $@"select * FROM WIP_LOT WHERE LOT = '{data.LOT}'";
                    //晚點改回H5 Query方式
                    //DataSet LotInfoDSt = MyDBQuery.GetReader(_SessionToken.Key, GetLotInfo);
                    //DataTable LotInfo_DT = LotInfoDSt.Tables[0].Copy();
                    //DataTable LotInfoDt = MyDBQuery.GetReader(GetLotInfo);
                    //LOT_SID = LotInfoDt.Rows[0]["LOT_SID"].ToDecimal();

                    // 轉換 List<DcItem> 為 DataTable
                    DataTable dtDCList = ConvertToDataTable(data.dtDCList);

                    bool LotEDCFlag = _wipAction.LotRecordDC("LOT_EDC", "EDC", data.LOT, DATA_LINK_SID,data.ACCOUNT_NO, data.EQP_NO,data.SHIFT_SID, DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"), data.ACCOUNT_NO, dtDCList, data.COMMENT, data.INPUT_FORM_NAME, ref _SessionToken, out DataTable LotDt);
                    SessionHelper.UpdateToken(_SessionToken);


                    if (LotEDCFlag == true)
                    {//回傳資料格式

                        var result = new
                        {
                            result = true,
                            data = LotDt
                        };


                        string json = JsonConvert.SerializeObject(result);

                        HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessageH5;
                    }
                    else
                    {
                        var result = new
                        {
                            result = false,
                            LOT = LotDt
                        };


                        string json = JsonConvert.SerializeObject(result);

                        HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                        httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                        return httpResponseMessageH5;
                    }
                }
                else
                {
                    var result = new
                    {
                        result = false,
                        LOT = "token is null "
                    };



                    string json = JsonConvert.SerializeObject(result);

                    HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessageH5;
                }
                #endregion

            }
            catch (Exception ex)
            {
                //log.Error(ex.Message);
                //HttpResponseMessage httpResponseMessageerror = Request.CreateResponse(HttpStatusCode.Forbidden);
                //httpResponseMessageerror.Content = new StringContent(ex.Message, System.Text.Encoding.UTF8, "application/json");
                //return httpResponseMessageerror;
                var result = new
                {
                    result = false,
                    Msg = ex.Message
                };
                string json = JsonConvert.SerializeObject(result);

                HttpResponseMessage httpResponseMessageH5 = Request.CreateResponse(HttpStatusCode.OK);
                httpResponseMessageH5.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessageH5;
                //throw;
            }
        }

        public static DataTable ConvertToDataTable(List<DcItem> items)
        {
            DataTable table = new DataTable();
            table.Columns.Add("DC_ITEM_CODE", typeof(string));
            table.Columns.Add("DC_ITEM_SEQ", typeof(int));
            table.Columns.Add("DC_ITEM_VALUE", typeof(string));
            table.Columns.Add("DC_ITEM_COMMENT", typeof(string));

            foreach (var item in items)
            {
                DataRow row = table.NewRow();
                row["DC_ITEM_CODE"] = item.DC_ITEM_CODE;
                row["DC_ITEM_SEQ"] = item.DC_ITEM_SEQ;
                row["DC_ITEM_VALUE"] = item.DC_ITEM_VALUE;
                row["DC_ITEM_COMMENT"] = item.DC_ITEM_COMMENT;
                table.Rows.Add(row);
            }

            return table;
        }
    }
}
