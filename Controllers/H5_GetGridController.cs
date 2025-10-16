using MESH5_WEBAPI_20250228V2.Areas.HelpPage.ModelDescriptions;
using MESH5_WEBAPI_20250228V2.Helper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_GetGridController : ApiController
    {
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();

        [ModelName("H5_GetGrid_Query_Data")]
        public class Query_Data
        {
            public string[] Field { get; set; }
            public string[] Oper { get; set; }
            public string[] Value { get; set; }
        }

        public class Query_Wrapper
        {
            [JsonProperty("CON")]
            public Query_Data CON { get; set; }
        }

        [Route("api/H5_GetGrid")]
        public HttpResponseMessage Post([FromBody] Query_Wrapper payload)
        {
            try
            {
                // 這一行是關鍵：把外層的 CON 取出來，後續仍用 oDATA 變數
                var oDATA = payload?.CON;

                var session = System.Web.HttpContext.Current.Session;
                //if (session["Key"] == null) throw new Exception("Token Verify Fail !");
                if (session?["Key"] == null)
                {
                    var resp = new
                    {
                        result = false,
                        Msg = "Token Verify Fail !",
                        SID = ""
                    };
                    // 建議：Unauthorized (401)；若你目前前端只處理 417，就改回 ExpectationFailed
                    return Request.CreateResponse(HttpStatusCode.Unauthorized, resp);
                }


                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));



                #region 新版
                //if (session["Key"] != null)
                //{
                //    //  取得 HTTP Header 內的 Token
                //    //var request = HttpContext.Current.Request;
                //    //var tokenKey = request.Headers["TokenKey"];
                //    //var TokenExpiry = request.Headers["TokenExpiry"];
                //    //string FinalTokenKey = "WeyuTech" + tokenKey;

                //    //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

                //    var sessionToken = "WeyuTech" + session["Key"];
                //    var sessionExpiration = session["Expiration"];
                //    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));

                //    IEnumerable<string> SmartQuerySIDNoheaderValues = Request.Headers.GetValues("SID");

                //    //UTF8轉換
                //    string SQSID = HttpUtility.HtmlDecode(SmartQuerySIDNoheaderValues.First());

                //    bool LDAP = false;
                //    string ReturnJson = "";        //主要回傳Jason 資料
                //    string ReturnQSString = "";    //回傳BAS_QueryReport 資料
                //    string ReturnDSString = "";    //回傳BAS_QUERYREPORT_GRID 資料
                //    string ReturnDTString = "";    //回傳Master SQL 查詢Json資料
                //    string ReturnCondString = "";  //回傳Query Cond 相關Json資料
                //    string ReturnCONDDATA_SOURCE = ""; //回傳Query Cond Select Data 相關Json資料

                //    //bool LoginResult = MyUser.LoginResult(UID, PWD, "127.0.0.1", LDAP);
                //    //if (LoginResult)
                //    //{
                //    string Get_BAS_QUERYREPORT_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT WHERE QR_SID={0}", SQSID);
                //    string Get_BAS_QUERYREPORT_GRID_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT_GRID WHERE QR_SID={0} AND SHOW='YES' ORDER BY SEQ", SQSID);
                //    string Get_BAS_QUERYREPORT_CONDITION_SQL = String.Format(@"SELECT FIELD,CAPTION,OPER,DATATYPE,INPUTTYPE,DATA_SOURCE_SQL,ISREQUIRE,'' AS SELECT_ITEM FROM BAS_QUERYREPORT_CONDITION WHERE QR_SID={0} ORDER BY QR_SID", SQSID);
                //    DataTable BAS_QUERYREPORT_DT;
                //    DataTable BAS_QUERYREPORT_GRID_DT;
                //    DataTable BAS_QUERYREPORT_COND_DT;

                //    DataTable ReturnDT;
                //    BAS_QUERYREPORT_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_SQL);
                //    ReturnQSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                //    if (BAS_QUERYREPORT_DT.Rows.Count > 0)
                //    {
                //        //
                //        //進行抓取Grid Condition Query的處理
                //        //
                //        BAS_QUERYREPORT_COND_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_CONDITION_SQL);

                //        JArray jsonArray = new JArray();
                //        bool is_require = false;
                //        for (int i = 0; i < BAS_QUERYREPORT_COND_DT.Rows.Count; i++)
                //        {
                //            //
                //            //進行Grid Condition 如果是SELECT挑選值的處理
                //            //
                //            string DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"].ToString().ToUpper().Trim();
                //            string INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"].ToString().ToUpper();

                //            if (BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"].ToString() == "true")
                //            {
                //                is_require = true;
                //            }

                //            if (INPUTTYPE == "SELECT" && DATA_SOURCE_SQL != "")
                //            {
                //                //判斷資料是由Select來的還是固定值
                //                //if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
                //                if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
                //                {
                //                    //表示此項為SELECT 來的
                //                    DataTable BAS_QUERYREPORT_COND_DATA_DT = MyDBQuery.GetTable(DATA_SOURCE_SQL);
                //                    ReturnCONDDATA_SOURCE = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DATA_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                //                    BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"] = ReturnCONDDATA_SOURCE.Trim();
                //                    var o_con = new
                //                    {
                //                        FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
                //                        CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
                //                        OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
                //                        DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
                //                        INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
                //                        //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
                //                        ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
                //                        SELECT_ITEM = JArray.Parse(BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"].ToString())
                //                    };
                //                    jsonArray.Add(JObject.FromObject(o_con));


                //                }
                //                else
                //                {
                //                    //表示此項為固定值如

                //                }
                //            }
                //            else
                //            {
                //                var o_con = new
                //                {
                //                    FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
                //                    CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
                //                    OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
                //                    DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
                //                    INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
                //                    //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
                //                    ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
                //                    SELECT_ITEM = BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"]
                //                };
                //                jsonArray.Add(JObject.FromObject(o_con));
                //            }

                //        }

                //        //ReturnCondString = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                //        ReturnCondString = JsonConvert.SerializeObject(jsonArray, new JsonSerializerSettings { Formatting = Formatting.None });

                //        //
                //        //進行抓取Grid Data Row的處理
                //        //
                //        string BAS_MasterSQL = BAS_QUERYREPORT_DT.Rows[0]["MASTER_SQL"].ToString().ToUpper();
                //        //判斷是否要進行SELECT *的顯示欄位置換
                //        BAS_QUERYREPORT_GRID_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_GRID_SQL);
                //        if (BAS_MasterSQL.Substring(0, 8) == "SELECT *")
                //        {
                //            //表示要用顯示與否的欄位來進行SELECT 的置換
                //            //BAS_QUERYREPORT_GRID_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_GRID_SQL);
                //            string GRID_SELECT = "SELECT ";
                //            for (int i = 0; i < BAS_QUERYREPORT_GRID_DT.Rows.Count; i++)
                //            {

                //                if (BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString().Trim() != "")
                //                {
                //                    GRID_SELECT += "[" + BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + "] '" + BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString() + "',";
                //                }
                //                else
                //                {
                //                    GRID_SELECT += BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + ", ";
                //                }

                //            }
                //            GRID_SELECT = GRID_SELECT.Substring(0, GRID_SELECT.Length - 1);
                //            BAS_MasterSQL = GRID_SELECT.ToUpper() + BAS_MasterSQL.Substring(8);
                //            //ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                //        }
                //        ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                //        //
                //        // WHERE 條件的置換
                //        //
                //        //BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", "1=1");
                //        string qr_con = "1=1";

                //        if (oDATA != null && oDATA.Field != null)
                //        {
                //            for (int i = 0; i < oDATA.Field.Length; i++)
                //            {
                //                if (oDATA.Oper[i].ToString() == "between")
                //                {
                //                    string[] arr_val = oDATA.Value[i].ToString().Split('~');
                //                    qr_con += $" AND {oDATA.Field[i]} {oDATA.Oper[i]} '{arr_val[0]}' AND '{arr_val[1]}' ";
                //                }
                //                else if (oDATA.Oper[i].ToString() == "like")
                //                {
                //                    qr_con += $" AND {oDATA.Field[i]} {oDATA.Oper[i]} N'%{oDATA.Value[i]}%' ";
                //                }
                //                else
                //                {
                //                    qr_con += $" AND {oDATA.Field[i]} {oDATA.Oper[i]} N'{oDATA.Value[i]}' ";
                //                }

                //            }
                //        }
                //        //沒輸入必輸條件時 回應空table
                //        else if (is_require == true && oDATA.Field == null)
                //        {
                //            qr_con = "1 != 1 ";
                //        }

                //        BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", qr_con);

                //        //
                //        //開始抓取Data Row資料
                //        ReturnDT = MyDBQuery.GetTable(BAS_MasterSQL);
                //        ReturnDTString = JsonConvert.SerializeObject(ReturnDT, new JsonSerializerSettings { Formatting = Formatting.None });

                //        //
                //        //準備最後回傳Json資料
                //        //
                //        ReturnJson += "\"result\": true" + ",";
                //        ReturnJson += "\"Report_Schema\":" + ReturnQSString + ",";
                //        ReturnJson += "\"Query_Cond\":" + ReturnCondString + ",";
                //        ReturnJson += "\"Grid_Schema\":" + ReturnDSString + ",";
                //        ReturnJson += "\"Grid_Data\":" + ReturnDTString;

                //        // 新增 TokenInfo 區塊
                //        ReturnJson += ",\"TokenInfo\":{";
                //        //ReturnJson += "\"key\":\"" + _SessionToken.Key + "\",";
                //        ReturnJson += "\"Expiration\":\"" + _SessionToken.Expiration.ToString("yyyy-MM-ddTHH:mm:ss") + "\"";
                //        ReturnJson += "}";


                //        ReturnJson = "{" + ReturnJson + "}";
                //        HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                //        httpResponseMessage.Content = new StringContent(ReturnJson, System.Text.Encoding.UTF8, "application/json");
                //        return httpResponseMessage;
                //    }
                //    else
                //    {
                //        //找不到SID對應的資料
                //        HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                //        //httpResponseMessage.Headers= 
                //        httpResponseMessage.Content = new StringContent("\"result\": false", System.Text.Encoding.UTF8, "application/json");
                //        return httpResponseMessage;
                //    }
                //}
                //else
                //{
                //    throw new Exception("Token Verify Fail !");
                //} 
                #endregion


                IEnumerable<string> SmartQuerySIDNoheaderValues = Request.Headers.GetValues("SID");

                //UTF8轉換
                string SQSID = HttpUtility.HtmlDecode(SmartQuerySIDNoheaderValues.First());

                bool LDAP = false;
                string ReturnJson = "";        //主要回傳Jason 資料
                string ReturnQSString = "";    //回傳BAS_QueryReport 資料
                string ReturnDSString = "";    //回傳BAS_QUERYREPORT_GRID 資料
                string ReturnDTString = "";    //回傳Master SQL 查詢Json資料
                string ReturnCondString = "";  //回傳Query Cond 相關Json資料
                string ReturnCONDDATA_SOURCE = ""; //回傳Query Cond Select Data 相關Json資料

                //bool LoginResult = MyUser.LoginResult(UID, PWD, "127.0.0.1", LDAP);
                //if (LoginResult)
                //{
                string Get_BAS_QUERYREPORT_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT WHERE QR_SID={0}", SQSID);
                string Get_BAS_QUERYREPORT_GRID_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT_GRID WHERE QR_SID={0} AND SHOW='YES' ORDER BY SEQ", SQSID);
                string Get_BAS_QUERYREPORT_CONDITION_SQL = String.Format(@"SELECT FIELD,CAPTION,OPER,DATATYPE,INPUTTYPE,DATA_SOURCE_SQL,ISREQUIRE,'' AS SELECT_ITEM FROM BAS_QUERYREPORT_CONDITION WHERE QR_SID={0} ORDER BY QR_SID", SQSID);
                DataTable BAS_QUERYREPORT_DT;
                DataTable BAS_QUERYREPORT_GRID_DT;
                DataTable BAS_QUERYREPORT_COND_DT;

                DataTable ReturnDT;
                BAS_QUERYREPORT_DT = ExecuteSqlToDataTable(Get_BAS_QUERYREPORT_SQL);
                ReturnQSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                if (BAS_QUERYREPORT_DT.Rows.Count > 0)
                {
                    //
                    //進行抓取Grid Condition Query的處理
                    //
                    //BAS_QUERYREPORT_COND_DT = ExecuteSqlToDataTable(Get_BAS_QUERYREPORT_CONDITION_SQL);

                    var BAS_QUERYREPORT_COND_SET = MyDBQuery.GetReader(ref _SessionToken, Get_BAS_QUERYREPORT_CONDITION_SQL);
                    BAS_QUERYREPORT_COND_DT = BAS_QUERYREPORT_COND_SET.Tables[0].Copy();


                    JArray jsonArray = new JArray();
                    bool is_require = false;
                    for (int i = 0; i < BAS_QUERYREPORT_COND_DT.Rows.Count; i++)
                    {
                        //
                        //進行Grid Condition 如果是SELECT挑選值的處理
                        //
                        string DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"].ToString().ToUpper().Trim();
                        string INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"].ToString().ToUpper();

                        if (BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"].ToString() == "true")
                        {
                            is_require = true;
                        }

                        if (INPUTTYPE == "SELECT" && DATA_SOURCE_SQL != "")
                        {
                            //判斷資料是由Select來的還是固定值
                            //if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
                            if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
                            {
                                //表示此項為SELECT 來的
                                DataTable BAS_QUERYREPORT_COND_DATA_DT = ExecuteSqlToDataTable(DATA_SOURCE_SQL);
                                ReturnCONDDATA_SOURCE = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DATA_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                                BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"] = ReturnCONDDATA_SOURCE.Trim();
                                var o_con = new
                                {
                                    FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
                                    CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
                                    OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
                                    DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
                                    INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
                                    //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
                                    ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
                                    SELECT_ITEM = JArray.Parse(BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"].ToString())
                                };
                                jsonArray.Add(JObject.FromObject(o_con));


                            }
                            else
                            {
                                //表示此項為固定值如

                            }
                        }
                        else
                        {
                            var o_con = new
                            {
                                FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
                                CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
                                OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
                                DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
                                INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
                                //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
                                ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
                                SELECT_ITEM = BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"]
                            };
                            jsonArray.Add(JObject.FromObject(o_con));
                        }

                    }

                    //ReturnCondString = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                    ReturnCondString = JsonConvert.SerializeObject(jsonArray, new JsonSerializerSettings { Formatting = Formatting.None });

                    //
                    //進行抓取Grid Data Row的處理
                    //
                    string BAS_MasterSQL = BAS_QUERYREPORT_DT.Rows[0]["MASTER_SQL"].ToString().ToUpper();
                    //判斷是否要進行SELECT *的顯示欄位置換
                    BAS_QUERYREPORT_GRID_DT = ExecuteSqlToDataTable(Get_BAS_QUERYREPORT_GRID_SQL);
                    if (BAS_MasterSQL.Substring(0, 8) == "SELECT *")
                    {
                        //表示要用顯示與否的欄位來進行SELECT 的置換
                        //BAS_QUERYREPORT_GRID_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_GRID_SQL);
                        string GRID_SELECT = "SELECT ";
                        for (int i = 0; i < BAS_QUERYREPORT_GRID_DT.Rows.Count; i++)
                        {

                            if (BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString().Trim() != "")
                            {
                                GRID_SELECT += "[" + BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + "] '" + BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString() + "',";
                            }
                            else
                            {
                                GRID_SELECT += BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + ", ";
                            }

                        }
                        GRID_SELECT = GRID_SELECT.Substring(0, GRID_SELECT.Length - 1);
                        BAS_MasterSQL = GRID_SELECT.ToUpper() + BAS_MasterSQL.Substring(8);
                        //ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                    }
                    ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                    //
                    // WHERE 條件的置換
                    //
                    //BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", "1=1");
                    string qr_con = "1=1";

                    if (oDATA != null && oDATA.Field != null)
                    {
                        for (int i = 0; i < oDATA.Field.Length; i++)
                        {
                            if (oDATA.Oper[i].ToString() == "between")
                            {
                                string[] arr_val = oDATA.Value[i].ToString().Split('~');
                                qr_con += $" AND {oDATA.Field[i]} {oDATA.Oper[i]} '{arr_val[0]}' AND '{arr_val[1]}' ";
                            }
                            else if (oDATA.Oper[i].ToString() == "like")
                            {
                                qr_con += $" AND {oDATA.Field[i]} {oDATA.Oper[i]} N'%{oDATA.Value[i]}%' ";
                            }
                            else if(oDATA.Oper[i].ToString() == "in")
                            {
                                string[] arr_val = oDATA.Value[i].ToString().Split(',');
                                string tmp_value = "";
                                for (int j = 0; j < arr_val.Length; j++)
                                {
                                    if (arr_val.Length - 1 == j)
                                    {
                                        tmp_value += $@"'{arr_val[j]}'";
                                    }
                                    else
                                    {
                                        tmp_value += $@"'{arr_val[j]}',";
                                    }
                                }
                                qr_con += $" AND {oDATA.Field[i]} IN ({tmp_value})";
                            }
                            else
                            {
                                qr_con += $" AND {oDATA.Field[i]} {oDATA.Oper[i]} N'{oDATA.Value[i]}' ";
                            }

                        }
                    }
                    //沒輸入必輸條件時 回應空table
                    else if (is_require == true && oDATA.Field == null)
                    {
                        qr_con = "1 != 1 ";
                    }

                    BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", qr_con);

                    //
                    //開始抓取Data Row資料
                    ReturnDT = ExecuteSqlToDataTable(BAS_MasterSQL);
                    ReturnDTString = JsonConvert.SerializeObject(ReturnDT, new JsonSerializerSettings { Formatting = Formatting.None });



                    //
                    //準備最後回傳Json資料
                    //
                    ReturnJson += "\"result\": true" + ",";
                    ReturnJson += "\"Report_Schema\":" + ReturnQSString + ",";
                    ReturnJson += "\"Query_Cond\":" + ReturnCondString + ",";
                    ReturnJson += "\"Grid_Schema\":" + ReturnDSString + ",";
                    ReturnJson += "\"Grid_Data\":" + ReturnDTString;

                    //DateTime nowPlus10Min = DateTime.Now.AddMinutes(10);
                    //string expirationString = nowPlus10Min.ToString("yyyy-MM-ddTHH:mm:ss");
                    string tokenString = _SessionToken.Key;
                    string expirationString = _SessionToken.Expiration.ToString("yyyy-MM-dd HH:mm:ss");

                  

                    // 新增 TokenInfo 區塊
                    ReturnJson += ",\"TokenInfo\":{";
                    ReturnJson += "\"key\":\"" + tokenString + "\",";
                    ReturnJson += "\"Expiration\":\"" + expirationString + "\"";
                    ReturnJson += "}";
                    SessionHelper.UpdateToken(_SessionToken);

                    ReturnJson = "{" + ReturnJson + "}";
                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessage.Content = new StringContent(ReturnJson, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessage;
                }
                else
                {
                    //找不到SID對應的資料
                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    //httpResponseMessage.Headers= 
                    httpResponseMessage.Content = new StringContent("\"result\": false", System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessage;
                }

            }
            catch (Exception Exc)
            {
                HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.Forbidden);
                httpResponseMessage.Content = new StringContent(Exc.Message, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessage;
                //return (Exc.Message);
            }
            finally
            {
                //MyDBQuery.CloseDBConnection();
            }
        }

        [ModelName("H5_GetFunctionGrid_Request")]
        public class FunctionQueryRequest
        {
            public string TABLE_NAME { get; set; }
            public List<string> VALUE { get; set; }
            public FunctionQueryCondition CON { get; set; }
        }

        [ModelName("H5_GetFunctionGrid_Condition")]
        public class FunctionQueryCondition
        {
            public string[] Field { get; set; }
            public string[] Oper { get; set; }
            public string[] Value { get; set; }
        }

        [Route("api/H5_GetFunctionGrid")]
        public HttpResponseMessage Post([FromBody] FunctionQueryRequest oDATA)
        {
            #region 新版
            //var session = System.Web.HttpContext.Current.Session;
            //try
            //{
            //    if (session["Key"] != null)
            //    {
            //        var sessionToken = "WeyuTech" + session["Key"];
            //        var sessionExpiration = session["Expiration"];
            //        WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
            //        //var request = HttpContext.Current.Request;
            //        //var tokenKey = request.Headers["TokenKey"];
            //        //var TokenExpiry = request.Headers["TokenExpiry"];
            //        //string FinalTokenKey = "WeyuTech" + tokenKey;
            //        //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(FinalTokenKey.ToString(), System.Convert.ToDateTime(TokenExpiry));

            //        IEnumerable<string> SmartQuerySIDNoheaderValues = Request.Headers.GetValues("SID");

            //        //UTF8轉換
            //        string SQSID = HttpUtility.HtmlDecode(SmartQuerySIDNoheaderValues.First());

            //        bool LDAP = false;
            //        string ReturnJson = "";        //主要回傳Jason 資料
            //        string ReturnQSString = "";    //回傳BAS_QueryReport 資料
            //        string ReturnDSString = "";    //回傳BAS_QUERYREPORT_GRID 資料
            //        string ReturnDTString = "";    //回傳Master SQL 查詢Json資料
            //        string ReturnCondString = "";  //回傳Query Cond 相關Json資料
            //        string ReturnCONDDATA_SOURCE = ""; //回傳Query Cond Select Data 相關Json資料

            //        string Get_BAS_QUERYREPORT_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT WHERE QR_SID={0}", SQSID);
            //        string Get_BAS_QUERYREPORT_GRID_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT_GRID WHERE QR_SID={0} AND SHOW='YES' ORDER BY SEQ", SQSID);
            //        string Get_BAS_QUERYREPORT_CONDITION_SQL = String.Format(@"SELECT FIELD,CAPTION,OPER,DATATYPE,INPUTTYPE,DATA_SOURCE_SQL,ISREQUIRE,'' AS SELECT_ITEM FROM BAS_QUERYREPORT_CONDITION WHERE QR_SID={0} ORDER BY QR_SID", SQSID);
            //        DataTable BAS_QUERYREPORT_DT;
            //        DataTable BAS_QUERYREPORT_GRID_DT;
            //        DataTable BAS_QUERYREPORT_COND_DT;

            //        DataTable ReturnDT;
            //        BAS_QUERYREPORT_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_SQL);
            //        ReturnQSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_DT, new JsonSerializerSettings { Formatting = Formatting.None });
            //        if (BAS_QUERYREPORT_DT.Rows.Count > 0)
            //        {
            //            //
            //            //進行抓取Grid Condition Query的處理
            //            //
            //            BAS_QUERYREPORT_COND_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_CONDITION_SQL);

            //            JArray jsonArray = new JArray();
            //            bool is_require = false;
            //            for (int i = 0; i < BAS_QUERYREPORT_COND_DT.Rows.Count; i++)
            //            {
            //                //
            //                //進行Grid Condition 如果是SELECT挑選值的處理
            //                //
            //                string DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"].ToString().ToUpper().Trim();
            //                string INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"].ToString().ToUpper();

            //                if (BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"].ToString() == "true")
            //                {
            //                    is_require = true;
            //                }

            //                if (INPUTTYPE == "SELECT" && DATA_SOURCE_SQL != "")
            //                {
            //                    //判斷資料是由Select來的還是固定值
            //                    //if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
            //                    if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
            //                    {
            //                        //表示此項為SELECT 來的
            //                        DataTable BAS_QUERYREPORT_COND_DATA_DT = MyDBQuery.GetTable(DATA_SOURCE_SQL);
            //                        ReturnCONDDATA_SOURCE = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DATA_DT, new JsonSerializerSettings { Formatting = Formatting.None });
            //                        BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"] = ReturnCONDDATA_SOURCE.Trim();
            //                        var o_con = new
            //                        {
            //                            FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
            //                            CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
            //                            OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
            //                            DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
            //                            INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
            //                            //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
            //                            ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
            //                            SELECT_ITEM = JArray.Parse(BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"].ToString())
            //                        };
            //                        jsonArray.Add(JObject.FromObject(o_con));


            //                    }
            //                    else
            //                    {
            //                        //表示此項為固定值如

            //                    }
            //                }
            //                else
            //                {
            //                    var o_con = new
            //                    {
            //                        FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
            //                        CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
            //                        OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
            //                        DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
            //                        INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
            //                        //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
            //                        ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
            //                        SELECT_ITEM = BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"]
            //                    };
            //                    jsonArray.Add(JObject.FromObject(o_con));
            //                }

            //            }

            //            //ReturnCondString = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DT, new JsonSerializerSettings { Formatting = Formatting.None });
            //            ReturnCondString = JsonConvert.SerializeObject(jsonArray, new JsonSerializerSettings { Formatting = Formatting.None });

            //            //
            //            //進行抓取Grid Data Row的處理
            //            //
            //            string BAS_MasterSQL = BAS_QUERYREPORT_DT.Rows[0]["MASTER_SQL"].ToString().ToUpper();
            //            //判斷是否要進行SELECT *的顯示欄位置換
            //            BAS_QUERYREPORT_GRID_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_GRID_SQL);
            //            if (BAS_MasterSQL.Substring(0, 8) == "SELECT *")
            //            {
            //                //表示要用顯示與否的欄位來進行SELECT 的置換
            //                //BAS_QUERYREPORT_GRID_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_GRID_SQL);
            //                string GRID_SELECT = "SELECT ";
            //                for (int i = 0; i < BAS_QUERYREPORT_GRID_DT.Rows.Count; i++)
            //                {

            //                    if (BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString().Trim() != "")
            //                    {
            //                        GRID_SELECT += "[" + BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + "] '" + BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString() + "',";
            //                    }
            //                    else
            //                    {
            //                        GRID_SELECT += BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + ", ";
            //                    }

            //                }
            //                GRID_SELECT = GRID_SELECT.Substring(0, GRID_SELECT.Length - 1);
            //                BAS_MasterSQL = GRID_SELECT.ToUpper() + BAS_MasterSQL.Substring(8);
            //                //ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
            //            }
            //            ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
            //            //
            //            // WHERE 條件的置換
            //            //
            //            //BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", "1=1");
            //            string qr_con = "1=1";

            //            if (oDATA != null && oDATA.CON.Field != null)
            //            {
            //                for (int i = 0; i < oDATA.CON.Field.Length; i++)
            //                {
            //                    if (oDATA.CON.Oper[i].ToString() == "between")
            //                    {
            //                        string[] arr_val = oDATA.CON.Value[i].ToString().Split('~');

            //                        qr_con += $" AND {oDATA.CON.Field[i]} {oDATA.CON.Oper[i]} '{arr_val[0]}' AND '{arr_val[1]}' ";
            //                    }
            //                    else if (oDATA.CON.Oper[i].ToString() == "like")
            //                    {
            //                        qr_con += $" AND {oDATA.CON.Field[i]} {oDATA.CON.Oper[i]} N'%{oDATA.CON.Value[i]}%' ";
            //                    }
            //                    else
            //                    {
            //                        qr_con += $" AND {oDATA.CON.Field[i]} {oDATA.CON.Oper[i]} N'{oDATA.CON.Value[i]}' ";
            //                    }

            //                }
            //            }
            //            //沒輸入必輸條件時 回應空table
            //            else if (is_require == true && oDATA.CON.Field == null)
            //            {
            //                qr_con = "1 != 1 ";
            //            }

            //            BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", qr_con);

            //            // 加工更改 FROM 的 table 
            //            string pattern = $@"FROM\s+({oDATA.TABLE_NAME})\s*\((.*?)\)\s+WHERE"; // 使用 oDATA.TABLE_NAME 進行匹配
            //            Match match = Regex.Match(BAS_MasterSQL, pattern, RegexOptions.IgnoreCase);
            //            string result = BAS_MasterSQL;

            //            if (match.Success)
            //            {
            //                // 將每個值用單引號包起來，然後用逗號連接成一個字串
            //                string newValues = "'" + string.Join("','", oDATA.VALUE) + "'";

            //                // 然後替換括號中的內容
            //                string pattern2 = $@"\({Regex.Escape(match.Groups[2].Value)}\)"; // 這裡使用 match.Groups[2].Value 獲取原始括號內的內容
            //                result = Regex.Replace(result, pattern2, $"({newValues})");

            //            }



            //            //
            //            //開始抓取Data Row資料
            //            ReturnDT = MyDBQuery.GetTable(result);
            //            ReturnDTString = JsonConvert.SerializeObject(ReturnDT, new JsonSerializerSettings { Formatting = Formatting.None });

            //            //
            //            //準備最後回傳Json資料
            //            //
            //            ReturnJson += "\"result\": true" + ",";
            //            ReturnJson += "\"Report_Schema\":" + ReturnQSString + ",";
            //            ReturnJson += "\"Query_Cond\":" + ReturnCondString + ",";
            //            ReturnJson += "\"Grid_Schema\":" + ReturnDSString + ",";
            //            ReturnJson += "\"Grid_Data\":" + ReturnDTString;

            //            // 新增 TokenInfo 區塊
            //            ReturnJson += ",\"TokenInfo\":{";
            //            //ReturnJson += "\"key\":\"" + _SessionToken.Key.Replace("WeyuTech","") + "\",";
            //            ReturnJson += "\"Expiration\":\"" + _SessionToken.Expiration.ToString("yyyy-MM-ddTHH:mm:ss") + "\"";
            //            ReturnJson += "}";


            //            ReturnJson = "{" + ReturnJson + "}";
            //            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            //            httpResponseMessage.Content = new StringContent(ReturnJson, System.Text.Encoding.UTF8, "application/json");
            //            return httpResponseMessage;
            //        }
            //        else
            //        {
            //            //找不到SID對應的資料
            //            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            //            //httpResponseMessage.Headers= 
            //            httpResponseMessage.Content = new StringContent("\"result\": false", System.Text.Encoding.UTF8, "application/json");
            //            return httpResponseMessage;
            //        }
            //    }
            //    else
            //    {
            //        throw new Exception("Token Verify Fail !");
            //    }
            //}
            //catch (Exception Exc)
            //{
            //    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.Forbidden);
            //    httpResponseMessage.Content = new StringContent(Exc.Message, System.Text.Encoding.UTF8, "application/json");
            //    return httpResponseMessage;
            //    //return (Exc.Message);
            //}
            //finally
            //{
            //    //MyDBQuery.CloseDBConnection();
            //} 
            #endregion

            try
            {
                var session = System.Web.HttpContext.Current.Session;

                //if (session["Key"] == null) throw new Exception("Token Verify Fail !");
                if (session?["Key"] == null)
                {
                    var resp = new
                    {
                        result = false,
                        Msg = "Token Verify Fail !",
                        SID = ""
                    };
                    // 建議：Unauthorized (401)；若你目前前端只處理 417，就改回 ExpectationFailed
                    return Request.CreateResponse(HttpStatusCode.Unauthorized, resp);
                }

                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));


                IEnumerable<string> SmartQuerySIDNoheaderValues = Request.Headers.GetValues("SID");

                //UTF8轉換
                string SQSID = HttpUtility.HtmlDecode(SmartQuerySIDNoheaderValues.First());

                bool LDAP = false;
                string ReturnJson = "";        //主要回傳Jason 資料
                string ReturnQSString = "";    //回傳BAS_QueryReport 資料
                string ReturnDSString = "";    //回傳BAS_QUERYREPORT_GRID 資料
                string ReturnDTString = "";    //回傳Master SQL 查詢Json資料
                string ReturnCondString = "";  //回傳Query Cond 相關Json資料
                string ReturnCONDDATA_SOURCE = ""; //回傳Query Cond Select Data 相關Json資料

                string Get_BAS_QUERYREPORT_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT WHERE QR_SID={0}", SQSID);
                string Get_BAS_QUERYREPORT_GRID_SQL = String.Format(@"SELECT * FROM BAS_QUERYREPORT_GRID WHERE QR_SID={0} AND SHOW='YES' ORDER BY SEQ", SQSID);
                string Get_BAS_QUERYREPORT_CONDITION_SQL = String.Format(@"SELECT FIELD,CAPTION,OPER,DATATYPE,INPUTTYPE,DATA_SOURCE_SQL,ISREQUIRE,'' AS SELECT_ITEM FROM BAS_QUERYREPORT_CONDITION WHERE QR_SID={0} ORDER BY QR_SID", SQSID);
                DataTable BAS_QUERYREPORT_DT;
                DataTable BAS_QUERYREPORT_GRID_DT;
                DataTable BAS_QUERYREPORT_COND_DT;

                DataTable ReturnDT;
                BAS_QUERYREPORT_DT = ExecuteSqlToDataTable(Get_BAS_QUERYREPORT_SQL);
                ReturnQSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                if (BAS_QUERYREPORT_DT.Rows.Count > 0)
                {
                    //
                    //進行抓取Grid Condition Query的處理
                    //
                    //BAS_QUERYREPORT_COND_DT = ExecuteSqlToDataTable(Get_BAS_QUERYREPORT_CONDITION_SQL);

                    var BAS_QUERYREPORT_COND_SET = MyDBQuery.GetReader(ref _SessionToken, Get_BAS_QUERYREPORT_CONDITION_SQL);
                    BAS_QUERYREPORT_COND_DT = BAS_QUERYREPORT_COND_SET.Tables[0].Copy();



                    JArray jsonArray = new JArray();
                    bool is_require = false;
                    for (int i = 0; i < BAS_QUERYREPORT_COND_DT.Rows.Count; i++)
                    {
                        //
                        //進行Grid Condition 如果是SELECT挑選值的處理
                        //
                        string DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"].ToString().ToUpper().Trim();
                        string INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"].ToString().ToUpper();

                        if (BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"].ToString() == "true")
                        {
                            is_require = true;
                        }

                        if (INPUTTYPE == "SELECT" && DATA_SOURCE_SQL != "")
                        {
                            //判斷資料是由Select來的還是固定值
                            //if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
                            if (DATA_SOURCE_SQL.Length > 6 && DATA_SOURCE_SQL.Substring(0, 6) == "SELECT")
                            {
                                //表示此項為SELECT 來的
                                DataTable BAS_QUERYREPORT_COND_DATA_DT = ExecuteSqlToDataTable(DATA_SOURCE_SQL);
                                ReturnCONDDATA_SOURCE = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DATA_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                                BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"] = ReturnCONDDATA_SOURCE.Trim();
                                var o_con = new
                                {
                                    FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
                                    CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
                                    OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
                                    DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
                                    INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
                                    //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
                                    ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
                                    SELECT_ITEM = JArray.Parse(BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"].ToString())
                                };
                                jsonArray.Add(JObject.FromObject(o_con));


                            }
                            else
                            {
                                //表示此項為固定值如

                            }
                        }
                        else
                        {
                            var o_con = new
                            {
                                FIELD = BAS_QUERYREPORT_COND_DT.Rows[i]["FIELD"],
                                CAPTION = BAS_QUERYREPORT_COND_DT.Rows[i]["CAPTION"],
                                OPER = BAS_QUERYREPORT_COND_DT.Rows[i]["OPER"],
                                DATATYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["DATATYPE"],
                                INPUTTYPE = BAS_QUERYREPORT_COND_DT.Rows[i]["INPUTTYPE"],
                                //DATA_SOURCE_SQL = BAS_QUERYREPORT_COND_DT.Rows[i]["DATA_SOURCE_SQL"],
                                ISREQUIRE = BAS_QUERYREPORT_COND_DT.Rows[i]["ISREQUIRE"],
                                SELECT_ITEM = BAS_QUERYREPORT_COND_DT.Rows[i]["SELECT_ITEM"]
                            };
                            jsonArray.Add(JObject.FromObject(o_con));
                        }

                    }

                    //ReturnCondString = JsonConvert.SerializeObject(BAS_QUERYREPORT_COND_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                    ReturnCondString = JsonConvert.SerializeObject(jsonArray, new JsonSerializerSettings { Formatting = Formatting.None });

                    //
                    //進行抓取Grid Data Row的處理
                    //
                    string BAS_MasterSQL = BAS_QUERYREPORT_DT.Rows[0]["MASTER_SQL"].ToString().ToUpper();
                    //判斷是否要進行SELECT *的顯示欄位置換
                    BAS_QUERYREPORT_GRID_DT = ExecuteSqlToDataTable(Get_BAS_QUERYREPORT_GRID_SQL);
                    if (BAS_MasterSQL.Substring(0, 8) == "SELECT *")
                    {
                        //表示要用顯示與否的欄位來進行SELECT 的置換
                        //BAS_QUERYREPORT_GRID_DT = MyDBQuery.GetTable(Get_BAS_QUERYREPORT_GRID_SQL);
                        string GRID_SELECT = "SELECT ";
                        for (int i = 0; i < BAS_QUERYREPORT_GRID_DT.Rows.Count; i++)
                        {

                            if (BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString().Trim() != "")
                            {
                                GRID_SELECT += "[" + BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + "] '" + BAS_QUERYREPORT_GRID_DT.Rows[i]["CAPTION"].ToString() + "',";
                            }
                            else
                            {
                                GRID_SELECT += BAS_QUERYREPORT_GRID_DT.Rows[i]["FIELDNAME"].ToString() + ", ";
                            }

                        }
                        GRID_SELECT = GRID_SELECT.Substring(0, GRID_SELECT.Length - 1);
                        BAS_MasterSQL = GRID_SELECT.ToUpper() + BAS_MasterSQL.Substring(8);
                        //ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                    }
                    ReturnDSString = JsonConvert.SerializeObject(BAS_QUERYREPORT_GRID_DT, new JsonSerializerSettings { Formatting = Formatting.None });
                    //
                    // WHERE 條件的置換
                    //
                    //BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", "1=1");
                    string qr_con = "1=1";

                    if (oDATA != null && oDATA.CON.Field != null)
                    {
                        for (int i = 0; i < oDATA.CON.Field.Length; i++)
                        {
                            if (oDATA.CON.Oper[i].ToString() == "between")
                            {
                                string[] arr_val = oDATA.CON.Value[i].ToString().Split('~');

                                qr_con += $" AND {oDATA.CON.Field[i]} {oDATA.CON.Oper[i]} '{arr_val[0]}' AND '{arr_val[1]}' ";
                            }
                            else if (oDATA.CON.Oper[i].ToString() == "like")
                            {
                                qr_con += $" AND {oDATA.CON.Field[i]} {oDATA.CON.Oper[i]} N'%{oDATA.CON.Value[i]}%' ";
                            }
                            else if (oDATA.CON.Oper[i].ToString() == "in")
                            {
                                string[] arr_val = oDATA.CON.Value[i].ToString().Split(',');
                                string tmp_value = "";
                                for (int j = 0; j < arr_val.Length; j++)
                                {
                                    if (arr_val.Length - 1 == j)
                                    {
                                        tmp_value += $@"'{arr_val[j]}'";
                                    }
                                    else
                                    {
                                        tmp_value += $@"'{arr_val[j]}',";
                                    }
                                }
                                qr_con += $" AND {oDATA.CON.Field[i]} IN ({tmp_value})";
                            }
                            else
                            {
                                qr_con += $" AND {oDATA.CON.Field[i]} {oDATA.CON.Oper[i]} N'{oDATA.CON.Value[i]}' ";
                            }

                        }
                    }
                    //沒輸入必輸條件時 回應空table
                    else if (is_require == true && oDATA.CON.Field == null)
                    {
                        qr_con = "1 != 1 ";
                    }

                    BAS_MasterSQL = BAS_MasterSQL.Replace("{CON}", qr_con);

                    // 加工更改 FROM 的 table 
                    string pattern = $@"FROM\s+({oDATA.TABLE_NAME})\s*\((.*?)\)\s+WHERE"; // 使用 oDATA.TABLE_NAME 進行匹配
                    Match match = Regex.Match(BAS_MasterSQL, pattern, RegexOptions.IgnoreCase);
                    string result = BAS_MasterSQL;

                    if (match.Success)
                    {
                        // 將每個值用單引號包起來，然後用逗號連接成一個字串
                        string newValues = "'" + string.Join("','", oDATA.VALUE) + "'";

                        // 然後替換括號中的內容
                        string pattern2 = $@"\({Regex.Escape(match.Groups[2].Value)}\)"; // 這裡使用 match.Groups[2].Value 獲取原始括號內的內容
                        result = Regex.Replace(result, pattern2, $"({newValues})");

                    }



                    //
                    //開始抓取Data Row資料
                    ReturnDT = ExecuteSqlToDataTable(result);
                    ReturnDTString = JsonConvert.SerializeObject(ReturnDT, new JsonSerializerSettings { Formatting = Formatting.None });

                    //
                    //準備最後回傳Json資料
                    //
                    ReturnJson += "\"result\": true" + ",";
                    ReturnJson += "\"Report_Schema\":" + ReturnQSString + ",";
                    ReturnJson += "\"Query_Cond\":" + ReturnCondString + ",";
                    ReturnJson += "\"Grid_Schema\":" + ReturnDSString + ",";
                    ReturnJson += "\"Grid_Data\":" + ReturnDTString;


                    //DateTime nowPlus10Min = DateTime.Now.AddMinutes(10);
                    //string expirationString = nowPlus10Min.ToString("yyyy-MM-ddTHH:mm:ss");
                    string expirationString = _SessionToken.Expiration.ToString("yyyy-MM-dd HH:mm:ss");


                    // 新增 TokenInfo 區塊
                    ReturnJson += ",\"TokenInfo\":{";
                    //ReturnJson += "\"key\":\"" + _SessionToken.Key.Replace("WeyuTech","") + "\",";
                    ReturnJson += "\"Expiration\":\"" + expirationString + "\"";
                    ReturnJson += "}";
                    SessionHelper.UpdateToken(_SessionToken);

                    ReturnJson = "{" + ReturnJson + "}";
                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    httpResponseMessage.Content = new StringContent(ReturnJson, System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessage;
                }
                else
                {
                    //找不到SID對應的資料
                    HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
                    //httpResponseMessage.Headers= 
                    httpResponseMessage.Content = new StringContent("\"result\": false", System.Text.Encoding.UTF8, "application/json");
                    return httpResponseMessage;
                }
            }
            catch (Exception Exc)
            {
                HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.Forbidden);
                httpResponseMessage.Content = new StringContent(Exc.Message, System.Text.Encoding.UTF8, "application/json");
                return httpResponseMessage;
            }
        }

        public static String ConvertDataTableToJson(DataTable dt)
        {
            String json = JsonConvert.SerializeObject(dt, Formatting.Indented);

            return json;
        }

        public static string TransferEncoding(Encoding srcEncoding, Encoding dstEncoding, string srcStr)
        {
            byte[] srcBytes = srcEncoding.GetBytes(srcStr);
            byte[] bytes = Encoding.Convert(srcEncoding, dstEncoding, srcBytes);
            return dstEncoding.GetString(bytes);
        }


        public static string GetConnectionString()
        {
            return ConfigurationManager.ConnectionStrings["WeYuConnection"].ConnectionString;
        }

        public static DataTable ExecuteSqlToDataTable(string sql)
        {
            DataTable dt = new DataTable();

            try
            {
                using (SqlConnection conn = new SqlConnection(GetConnectionString()))
                {
                    using (SqlCommand cmd = new SqlCommand(sql, conn))
                    {
                        conn.Open();
                        SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                        adapter.Fill(dt);

                        // 建立新的 DataTable，將所有數值欄位轉成 string
                        DataTable resultTable = new DataTable();
                        foreach (DataColumn col in dt.Columns)
                        {
                            // 判斷是不是數值型態
                            if (col.DataType == typeof(int) ||
                                col.DataType == typeof(long) ||
                                col.DataType == typeof(short) ||
                                col.DataType == typeof(decimal) ||
                                col.DataType == typeof(double) ||
                                col.DataType == typeof(float))
                            {
                                resultTable.Columns.Add(col.ColumnName, typeof(string));
                            }
                            else
                            {
                                resultTable.Columns.Add(col.ColumnName, col.DataType);
                            }
                        }

                        // 把資料搬過去
                        foreach (DataRow row in dt.Rows)
                        {
                            DataRow newRow = resultTable.NewRow();
                            foreach (DataColumn col in dt.Columns)
                            {
                                if (resultTable.Columns[col.ColumnName].DataType == typeof(string) &&
                                    col.DataType != typeof(string))
                                {
                                    newRow[col.ColumnName] = row[col]?.ToString();
                                }
                                else
                                {
                                    newRow[col.ColumnName] = row[col];
                                }
                            }
                            resultTable.Rows.Add(newRow);
                        }

                        dt = resultTable; // 用轉換後的取代
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("執行 SQL 發生錯誤：" + ex.Message, ex);
            }

            return dt;
        }


        #region old 依照資料庫類型 抓該型態數值
        //public static DataTable ExecuteSqlToDataTable(string sql)
        //{
        //    DataTable dt = new DataTable();

        //    try
        //    {
        //        using (SqlConnection conn = new SqlConnection(GetConnectionString()))
        //        {
        //            using (SqlCommand cmd = new SqlCommand(sql, conn))
        //            {
        //                conn.Open();
        //                SqlDataAdapter adapter = new SqlDataAdapter(cmd);
        //                adapter.Fill(dt);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        // 可自行記錄 Log 或丟出錯誤
        //        throw new Exception("執行 SQL 發生錯誤：" + ex.Message);
        //    }

        //    return dt;
        //} 
        #endregion

    }
}