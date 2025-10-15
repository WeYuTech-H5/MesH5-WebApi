using MESH5_WEBAPI_20250228V2.Helper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WeYuDB_H5;
using WeYuMMS_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_DBController : ApiController
    {
        public class doQuery
        {
            public string SQL { get; set; }
        }
        [Route("api/DB/doExecute")]
        public string Post([FromBody] doQuery data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //開始處理
               
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));

                //開始處理引用物件
                WeYuDB_H5.DBQuery_H5 _DBQuery = new DBQuery_H5();
                string Sql_String = data.SQL;

                //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                DataTable ResultDT = _DBQuery.GetTable(ref _SessionToken, Sql_String);
                SessionHelper.UpdateToken(_SessionToken);
                if (ResultDT!=null )
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;


                    return "GetTable SUCCESS!!";
                }
                else
                {
                    return "GetTable FAIL! Sql=" + Sql_String ;
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

    }
}