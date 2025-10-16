using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using WeYuMMS_H5;
using WeYuWIP_H5;
using static MESH5_WEBAPI_20250228V2.Controllers.H5_WIPController;

namespace MESH5_WEBAPI_20250228V2.Controllers
{
    public class H5_MMSController : ApiController
    {
        public class MLotCreate
        {
            public string MLOT { get; set; }
            public string PARENT_MLOT { get; set; }
            public string ALIAS_MLOT1 { get; set; }
            public string ALIAS_MLOT2 { get; set; }
            public string MLOT_TYPE { get; set; }
            public string PART_NO { get; set; }
            public decimal MLOT_QTY { get; set; }
            public string MLOT_WO { get; set; }
            public string MLOT_STATUS_CODE { get; set;}
            public DateTime EXPIRY_DATE { get; set; }
            public string DATE_CODE { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
            public string REPORT_TIME { get; set; }
        }
        [Route("api/MMS/MLotCreate")]
        public string Post([FromBody] MLotCreate data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //開始處理
                WeYuMMS_H5.MMSAction_H5 _mmsAction = new MMSAction_H5();
                WeYuMMS_H5.MMSQuery_H5 _mmsQuery = new MMSQuery_H5();

               
                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));

                decimal DATA_LINK_SID = _mmsQuery.GetSID();
                string REPORT_TIME = data.REPORT_TIME;
                if (data.REPORT_TIME.ToUpper()=="NOW")
                    REPORT_TIME = _mmsQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");
                string MLOT = data.MLOT;
                string PARENT_MLOT = data.PARENT_MLOT;
                string ALIAS_MLOT1 = data.ALIAS_MLOT1;
                string ALIAS_MLOT2 = data.ALIAS_MLOT2;
                string MLOT_TYPE = data.MLOT_TYPE;
                string PART_NO = data.PART_NO;
                decimal MLOT_QTY = data.MLOT_QTY;
                string MLOT_WO = data.MLOT_WO;
                string MLOT_STATUS_CODE = data.MLOT_STATUS_CODE;
                DateTime EXPIRY_DATE = data.EXPIRY_DATE;
                string DATE_CODE = data.DATE_CODE;
                string CREATE_USER = data.USER_NO;
                string INPUT_FORM_NAME = data.INPUT_FORM_NAME;
                string COMMENT = data.COMMENT;
                //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                bool CreateMlotFlag = _mmsAction.CreateMLot(DATA_LINK_SID,MLOT,PARENT_MLOT,ALIAS_MLOT1, ALIAS_MLOT2, MLOT_TYPE, PART_NO, MLOT_QTY,MLOT_WO,MLOT_STATUS_CODE, EXPIRY_DATE,DATE_CODE,REPORT_TIME, CREATE_USER, INPUT_FORM_NAME,COMMENT, ref _SessionToken, out DataTable mLotDT);

                if (CreateMlotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Create MLot"+ MLOT + " SUCCESS!!";
                }
                else
                {
                    return "Create MLot" + MLOT + " FAIL!!"; ;
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

        public class MLotConsume
        {
            public string MLOT { get; set; }
            public string LOT { get; set; }
            public decimal CONSUME_QTY { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
            public string REPORT_TIME { get; set; }
        }
        [Route("api/MMS/MLotConsume")]
        public string Post([FromBody] MLotConsume data)
        {

            //    decimal DATA_LINK_SID, string MLOT
           //, string REPORT_TIME, string CREATE_USER, decimal CONSUME_QTY, string LOT,string WO
           //, string INPUT_FORM_NAME, string COMMENT, ref WeYuSEC_H5S.WeyuToken _weyuToken, out DataTable MLotDT
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //開始處理
                WeYuMMS_H5.MMSAction_H5 _mmsAction = new MMSAction_H5();
                WeYuMMS_H5.MMSQuery_H5 _mmsQuery = new MMSQuery_H5();


                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                decimal DATA_LINK_SID = _mmsQuery.GetSID();
                string REPORT_TIME = data.REPORT_TIME;
                if (data.REPORT_TIME.ToUpper() == "NOW")
                    REPORT_TIME = _mmsQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                string MLOT = data.MLOT;
                string LOT = data.LOT;
                string CREATE_USER = data.USER_NO;
                decimal CONSUME_QTY = data.CONSUME_QTY;
                string INPUT_FORM_NAME = data.INPUT_FORM_NAME;
                string COMMENT = data.COMMENT;

                //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                bool ConsumeMlotFlag = _mmsAction.MLotConsume(DATA_LINK_SID, LOT, MLOT, CONSUME_QTY,REPORT_TIME, CREATE_USER,  INPUT_FORM_NAME, COMMENT, ref _SessionToken, out DataTable mLotDT);

                if (ConsumeMlotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "Consume MLot" + MLOT + " SUCCESS!!";
                }
                else
                {
                    return "Consume MLot" + MLOT + " FAIL!!"; ;
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

        public class MLotUNConsume
        {
            public string MLOT { get; set; }
            public string LOT { get; set; }
            public decimal UNCONSUME_QTY { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
            public string REPORT_TIME { get; set; }
        }
        [Route("api/MMS/MLotUNConsume")]
        public string Post([FromBody] MLotUNConsume data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //開始處理
                WeYuMMS_H5.MMSAction_H5 _mmsAction = new MMSAction_H5();
                WeYuMMS_H5.MMSQuery_H5 _mmsQuery = new MMSQuery_H5();


                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                decimal DATA_LINK_SID = _mmsQuery.GetSID();
                string REPORT_TIME = data.REPORT_TIME;
                if (data.REPORT_TIME.ToUpper() == "NOW" || data.REPORT_TIME=="")
                    REPORT_TIME = _mmsQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                string MLOT = data.MLOT;
                string LOT = data.LOT;
               
                string CREATE_USER = data.USER_NO;
                decimal UNCONSUME_QTY = data.UNCONSUME_QTY;
                string INPUT_FORM_NAME = data.INPUT_FORM_NAME;
                string COMMENT = data.COMMENT;

                //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                bool ConsumeMlotFlag = _mmsAction.MLotUNConsume(DATA_LINK_SID,LOT, MLOT, UNCONSUME_QTY,REPORT_TIME,CREATE_USER,INPUT_FORM_NAME, COMMENT, ref _SessionToken, out DataTable mLotDT);

                if (ConsumeMlotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "UNConsume MLot" + MLOT + " SUCCESS!!";
                }
                else
                {
                    return "UNConsume MLot" + MLOT + " FAIL!!"; ;
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

        public class MLotStateChange
        {
            public string MLOT { get; set; }
            public string MLOT_STATE_CODE { get; set; }
            public string REASON_CODE { get; set; }
            public string USER_NO { get; set; }
            public string INPUT_FORM_NAME { get; set; }
            public string COMMENT { get; set; }
            public string REPORT_TIME { get; set; }
        }
        [Route("api/MMS/MLotStateChange")]
        public string Post([FromBody] MLotStateChange data)
        {
            var session = System.Web.HttpContext.Current.Session;
            if (session["Key"] != null)
            {
                //抓取Token
                var sessionToken = "WeyuTech" + session["Key"];
                var sessionExpiration = session["Expiration"];

                //開始處理
                WeYuMMS_H5.MMSAction_H5 _mmsAction = new MMSAction_H5();
                WeYuMMS_H5.MMSQuery_H5 _mmsQuery = new MMSQuery_H5();


                WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                decimal DATA_LINK_SID = _mmsQuery.GetSID();
                string REPORT_TIME = data.REPORT_TIME;
                if (data.REPORT_TIME.ToUpper() == "NOW" || data.REPORT_TIME == "")
                    REPORT_TIME = _mmsQuery.GetDBTime().ToString("yyyy-MM-dd HH:mm:ss");

                string MLOT = data.MLOT;
                string MLOT_STATE_CODE = data.MLOT_STATE_CODE;
                string REASON_CODE = data.REASON_CODE;

                string CREATE_USER = data.USER_NO;
                string INPUT_FORM_NAME = data.INPUT_FORM_NAME;
                string COMMENT = data.COMMENT;

                //WeYuSEC_H5S.WeyuToken _SessionToken = new WeYuSEC_H5S.WeyuToken(sessionToken.ToString(), System.Convert.ToDateTime(sessionExpiration));
                bool ConsumeMlotFlag = _mmsAction.MLotStateChange(DATA_LINK_SID, MLOT,MLOT_STATE_CODE,REASON_CODE, REPORT_TIME, CREATE_USER, INPUT_FORM_NAME, COMMENT, ref _SessionToken, out DataTable mLotDT);

                if (ConsumeMlotFlag == true)
                {
                    //回存Session
                    session["Key"] = _SessionToken.Key;
                    session["Expiration"] = _SessionToken.Expiration;

                    return "MLot=" + MLOT + " State Change to "+ MLOT_STATE_CODE + " SUCCESS!!";
                }
                else
                {
                    return  "MLot=" + MLOT + " State Change to " + MLOT_STATE_CODE + " S FAIL!!"; ;
                }
            }
            else
            {
                return "session token is empty!!";
            }

        }

    }
}
