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
    public class UpdGridDataController : ApiController
    {
        //static WeYuDB.DBQuery MyDBQuery = new DBQuery();
        //static WeYuFunctionLibrary.SecFunction secfun = new SecFunction(MyDBQuery);
        //static WeYuBiFun wbfun = new WeYuBiFun(MyDBQuery);
        public static ILog log;
        static WeYuSEC_H5.SECFun_H5 SEC_H5 = new WeYuSEC_H5.SECFun_H5();
        static WeYuDB_H5.DBQuery_H5 MyDBQuery = new WeYuDB_H5.DBQuery_H5();
        static WeYuDB_H5.DBAction_H5 dBAction_H5 = new WeYuDB_H5.DBAction_H5();

        public static string Log4ConfigFilePath
        {
            get
            {
                return AppDomain.CurrentDomain.BaseDirectory + @"\\" + ConfigurationSettings.AppSettings["Log4ConfigFileName"];
            }
        }

        public class UpdGridData
        {
            public string TableName { get; set; }
            public string SID { get; set; }
            public string EditVal { get; set; }
            public string USER { get; set; }
            public string SID_VAL { get; set; }
            public string log_val { get; set; }
        }

        public HttpResponseMessage Post([FromBody] UpdGridData oDATA)
        {
            try
            {
                var session = System.Web.HttpContext.Current.Session;


                log4net.Config.XmlConfigurator.ConfigureAndWatch(new System.IO.FileInfo(Log4ConfigFilePath));
                log = LogManager.GetLogger(typeof(UpdGridDataController));

                //IEnumerable<string> TokenKeyheaderValues = Request.Headers.GetValues("TokenKey");
                //IEnumerable<string> TableNameheaderValues = Request.Headers.GetValues("TableName");
                //IEnumerable<string> EditValheaderValues = Request.Headers.GetValues("EditVal");
                //IEnumerable<string> SIDheaderValues = Request.Headers.GetValues("SID");
                //IEnumerable<string> USERheaderValues = Request.Headers.GetValues("USER");
                //IEnumerable<string> LOG_VALheaderValues = Request.Headers.GetValues("log_val");
                //IEnumerable<string> INPUT_SIDheaderValues = Request.Headers.GetValues("SID_VAL");
                if (session["Key"] != null)
                {

                    var sessionToken = "WeyuTech" + session["Key"];
                    var sessionExpiration = session["Expiration"];
                    WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                    SessionHelper.UpdateToken(_SessionToken);
                    //string TokenKey = TokenKeyheaderValues.First();
                    string TableName = oDATA.TableName;
                    string EditVal = oDATA.EditVal;
                    string SID = oDATA.SID;
                    string USER = oDATA.USER;
                    string MASTER_SID = SID.Remove(SID.Length - 1, 0).Split('=')[1];
                    string INPUT_SID = oDATA.SID_VAL;
                    string LOG_VAL = oDATA.log_val;

                    List<string> EditSql = new List<string>();
                    //EditSql = LOG_VAL.Replace("=NULL", "=N''").Split("=N'").ToList();
                    EditSql = LOG_VAL.Replace("=NULL", "=N''")
                     .Split(new[] { "=N'" }, StringSplitOptions.None)
                     .ToList();
                    string title = "";
                    string val = "";
                    for (int i = 0; i < EditSql.Count; i++)
                    {

                        if (i > 0 && i != EditSql.Count - 1)
                        {
                            //title += "," + EditSql[i].Split("',")[1].ToString();
                            //val += EditSql[i].Split("',")[0].ToString() + "@#$%^&";
                            title += "," + EditSql[i].Split(new[] { "'," }, StringSplitOptions.None)[1];
                            val += EditSql[i].Split(new[] { "'," }, StringSplitOptions.None)[0] + "@#$%^&";
                        }

                        else if (i == 0)
                        {
                            title += EditSql[i].ToString();
                        }
                        else if (i == EditSql.Count - 1)
                        {
                            val += EditSql[i].ToString().Remove(EditSql[i].ToString().Length - 2, 2) + "@#$%^&";
                        }
                    }

                    //string log_sql = log_record("Update", TableName, USER, INPUT_SID, title, val, MASTER_SID.ToDecimal(), "");
                    string strSql = $"UPDATE {TableName} SET {EditVal} EDIT_USER = '{USER}',EDIT_TIME = GETDATE() WHERE {SID};";//+ SidTitle + " = " + SidValue;

                    List<string> sqls = new List<string>();
                    //sqls.Add(log_sql);
                    sqls.Add(strSql);

                    string[] sqlArray = sqls.ToArray();
                    dBAction_H5.doTranExecute(sqlArray);

                    string[] TokenData = SEC_H5.VeriftyAndGetNewToken(sessionToken);

                    var data1 = new
                    {
                        result = TokenData[0].ToString(),
                        Msg = "Update Succeed",
                        TokenInfo = new[] // 新增 TOKENINFO 資料
                        {
                        new
                        {
                            TokenExpiry = TokenData[2].ToString()
                        }
                    }

                    };

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


        public string log_record(string Action, string Master_Table, string UserName, string inputSid, string field, string value, decimal Sid, string sid_field)
        {
            string log_sql = "";
            try
            {
                

                decimal logSid = MyDBQuery.GetDBSid();
                decimal DataSid = MyDBQuery.GetDBSid();
                string dbTime = MyDBQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss.fff");
                //Dictionary<string, string> dicFiledType = qr.GetTableFiledType(Master_Table);

                log_sql = @"INSERT INTO  BAS_MASTER_LOG 
                               ( SID 
                               , FORM_TYPE 
                               , ACTION_TYPE 
                               , TABLE_NAME 
                               , MASTER_SID 
                               , ACTION_USER 
                                ,INPUT_SID
                               , CREATE_USER 
                               , CREATE_TIME 
                               , EDIT_USER 
                               , EDIT_TIME )
                         VALUES
                               (" + logSid.ToString() + @"
                               ,N'Master'
                               ,N'" + Action + @"'
                               ,N'" + Master_Table + @"'
                               ," + Sid + @"
                               ,N'" + UserName + @"'
                               ,N'" + inputSid + @"'
                               ,N'" + UserName + @"'
                               ,convert(datetime,'" + dbTime + @"')
                               ,N'" + UserName + @"'
                               ,convert(datetime,'" + dbTime + @"'))
                    ;";


                List<string> AddTitle = new List<string>();

                List<string> AddVal = new List<string>();
                if (Action == "Insert")
                {
                    AddTitle = field.Split(',').ToList();
                    value = value.Remove(value.Length - 2, 2);
                    //AddVal = value.Remove(0, 2).Split("', N'").ToList();
                    AddVal = value.Remove(0, 2)
              .Split(new[] { "', N'" }, StringSplitOptions.None)
              .ToList();
                }

                else if (Action == "Update")
                {
                    AddTitle = field.Split(',').ToList();
                    //AddVal = value.Remove(value.Length - 6, 6).Split("@#$%^&").ToList();
                    AddVal = value
                    .Remove(value.Length - 6, 6)
                    .Split(new[] { "@#$%^&" }, StringSplitOptions.None)
                    .ToList();
                }
                else if (Action == "Delete")
                {

                    string sql_field = $@"
                                  SELECT a.Table_name
                                       ,b.COLUMN_NAME
                                       ,b.DATA_TYPE                    
                                FROM INFORMATION_SCHEMA.TABLES  a   
                                 LEFT JOIN INFORMATION_SCHEMA.COLUMNS b ON a.TABLE_NAME = b.TABLE_NAME   
                                WHERE TABLE_TYPE='BASE TABLE' AND a.TABLE_NAME = '{Master_Table}'
                                ORDER BY a.TABLE_NAME , b.ORDINAL_POSITION ";
                    DataTable dt_field = MyDBQuery.GetTable(sql_field);
                    for (int j = 0; j < dt_field.Rows.Count; j++)
                    {

                        //log_sql += GetLogDetailSql(logSid, dt_field.Rows[j]["COLUMN_NAME"].ToString(), qr.GetTableValue(Master_Table, sid_field, Sid.ToString(), dt_field.Rows[j]["COLUMN_NAME"].ToString()), get_type_code(dt_field.Rows[j]["DATA_TYPE"].ToString()), UserName);

                    }
                    return log_sql;
                }

                AddVal.Add(Sid.ToString());

                for (int i = 0; i < AddTitle.Count; i++)
                {


                    if (AddTitle[i].Equals("oper")) continue;
                    if (AddTitle[i].Equals("id")) continue;

                    //log_sql += GetLogDetailSql(logSid, AddTitle[i], AddVal[i], dicFiledType[AddTitle[i].ToUpper()], UserName);


                }
            }
            catch (Exception ex)
            {

            }
            return log_sql;
        }
        public string GetLogDetailSql(decimal logSid, string fieldName, string fieldValue, string fieldType, string UserName)
        {
            string sqlLogDetail = @"
                            INSERT INTO  BAS_MASTER_LOG_DETAIL 
                                       ( SID 
                                       , LOG_SID 
                                       , FIELD_NAME 
                                       , FIELD_VALUE 
                                       , FIELD_TYPE 
                                       , CREATE_USER 
                                       , CREATE_TIME 
                                       , EDIT_USER 
                                       , EDIT_TIME )
                                 VALUES
                                       (dbo.GetSid()
                                       ," + logSid.ToString() + @"
                                       ,'" + fieldName + @"'
                                       ,N'" + fieldValue.Replace("'", "''") + @"'
                                       ,'" + fieldType + @"'
                                       ,'" + UserName + @"'
                                       ,dbo.GET_DATETIME_STRING()
                                       ,'" + UserName + @"'
                                       ,dbo.GET_DATETIME_STRING())
                                   ";
            return sqlLogDetail;
        }
        public string get_type_code(string type)
        {
            switch (type)
            {
                case "image": return "34";
                case "text": return "35";
                case "uniqueidentifier": return "36";
                case "tinyint": return "48";
                case "smallint": return "52";
                case "int": return "56";
                case "smalldatetime": return "58";
                case "real": return "59";
                case "money": return "60";
                case "datetime": return "61";
                case "float": return "32";
                case "sql_variant": return "98";
                case "ntext": return "99";
                case "bit": return "104";
                case "decimal": return "106";
                case "numeric": return "108";
                case "smallmoney": return "122";
                case "bigint": return "127";
                case "varbinary": return "165";
                case "varchar": return "167";
                case "binary": return "173";
                case "char": return "175";
                case "timestamp": return "189";
                case "nvarchar": return "231";
                case "nchar": return "239";
                case "xml": return "241";
                default: return "999";
            }
        }
    }
}
