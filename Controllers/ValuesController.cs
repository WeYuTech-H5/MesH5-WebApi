using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using WeYuDB_H5;
using WeYuSEC_H5S;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class ValuesController : ApiController
    {
        // GET api/values
        public IEnumerable<string> Get()
        {
            //string sessionExpiration = "";
            //string sessionToken = "";
            //string theme = "";
            var session = System.Web.HttpContext.Current.Session;
            var sessionToken = session["Key"];
            var sessionExpiration = session["Expiration"];

            return new string[] { "sessionToken:" + sessionToken.ToString(), "sessionExpiration:" + sessionExpiration };
        }

        // GET api/values/5
        public string Get(int id)
        {
            WeYuSEC_H5S.WeyuToken NewToken = new WeyuToken("",DateTime.MinValue);

            WeYuDB_H5.QueryFunction queryFunction = new QueryFunction();
            DateTime GetSIDTimeStart = DateTime.Now;
            for (int i=0;i<1000;i++)
                       queryFunction.GetSid();
            DateTime GetSIDTimeEnd = DateTime.Now;

            DateTime GetDBSIDTimeStart = DateTime.Now;
            using (WeYuDB_H5.DBQuery_H5 _query=new DBQuery_H5())
            {
                for (int i = 0; i < 1000; i++)
                    _query.GetDBSid();
            }
            DateTime GetDBSIDTimeEND = DateTime.Now;
            return "value";
        }

        // POST api/values
        public void Post([FromBody]string value)
        {
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
        }
    }
}
