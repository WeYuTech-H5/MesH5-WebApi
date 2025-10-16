using MESH5_WEBAPI_20250228V2.Helper;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WeYuSEC_H5;
using WeYuWIP_H5;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_CreateLotController : ApiController
    {
        // GET: api/H5_CreateLot
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/H5_CreateLot/5
        public string Get(string WO, string ROUTE_SID, string LOT, string LOT_QTY, string ALIAS_LOT1, string ALIAS_LOT2, string REPORT_TIME, string USER_SID, string INPUT_FORM_NAME, string SHIFT_SID,string COMMENT)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                WeYuWIP_H5.WIPAction_H5 _wipAction = new WIPAction_H5();
                var sessionToken = "WeyuTech"+session["Key"];
                var sessionExpiration = session["Expiration"];
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                SessionHelper.UpdateToken(_SessionToken);
                decimal DATA_LINK_SID = _wipAction.GetSID();
                                
                bool CreateLotFlag = _wipAction.CreateLot(DATA_LINK_SID, LOT, ALIAS_LOT1, ALIAS_LOT2, WO, ROUTE_SID, LOT_QTY, REPORT_TIME, USER_SID, INPUT_FORM_NAME, SHIFT_SID, COMMENT, ref _SessionToken,out DataTable Lot_DT);
                SessionHelper.UpdateToken(_SessionToken);
                if (CreateLotFlag == true)
                {
                    //回存Session
                    session["Key"]= _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;
                   
                    return "Create LOT SUCCESS!!";
                }
                else
                {
                    return "Create LOT fail!!";
                }
            }
            else
            {
                return "session token is empty!!";
            }
            
        }

        // POST: api/H5_CreateLot
        public void Post([FromBody]string value)
        {
        }

        // PUT: api/H5_CreateLot/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/H5_CreateLot/5
        public void Delete(int id)
        {
        }
    }
}
