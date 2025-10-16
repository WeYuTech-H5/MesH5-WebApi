var getUrlParameter = function getUrlParameter() {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    var par = {};
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        par[sParameterName[0]] = sParameterName[1]
    }
    return par;
};

Request = getUrlParameter();

var EQPLAYOUT_SID = Request["EQPLAYOUT_SID"];

//撈此畫面主要資料
var viewsid = '239129617920103';
var viewLayout1;
var viewLayout2;
//撈此畫面綁定的EQP機台資料
var eqpsid = '303133223836169';
var eqpstructure;
var eqpdata;
//撈此畫面綁定的底圖
function reLoadSID (){
 
  $.ajax({
    type: 'GET',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+viewsid,
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      viewLayout1 = jsonObj
    }
  });

  viewLayout1.MasterSql = viewLayout1.MasterSql.replace("{CON}","{CON} AND EQPLAYOUT_SID='"+EQPLAYOUT_SID+"'")

  $.ajax({
    type: 'post',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
    data: {Charts: JSON.stringify(viewLayout1.Charts),SQL: viewLayout1.MasterSql,AddedSQL:viewLayout1.AddedSql, Conds: JSON.stringify(viewLayout1.Conditions), GridFieldType: JSON.stringify(viewLayout1.GridFieldType) ,SID:viewsid,rows : 100},
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg);
      viewLayout2 = jsonObj;
    }
  });

  //跑標題
  $('#EQPLAYOUT_TITLE').html(viewLayout2.rows[0].EQPLAYOUT_CODE + "-" + viewLayout2.rows[0].EQPLAYOUT_NAME)
  //跑背景圖
  Run_backgroundImage(viewLayout2.rows[0].BACKGROUND_IMAGE);
  
  //跑綁定機台資料
  $.ajax({
    type: 'GET',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+eqpsid,
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      eqpstructure = jsonObj
    }
  });

  eqpstructure.MasterSql = eqpstructure.MasterSql.replace("{CON}","{CON} AND EQPLAYOUT_SID='"+EQPLAYOUT_SID+"'")

  $.ajax({
    type: 'post',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
    data: {Charts: JSON.stringify(eqpstructure.Charts),SQL: eqpstructure.MasterSql,AddedSQL:eqpstructure.AddedSql, Conds: JSON.stringify(eqpstructure.Conditions), GridFieldType: JSON.stringify(eqpstructure.GridFieldType) ,SID:eqpsid,rows : 100},
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg);
      eqpdata = jsonObj;
    }
  });

    // console.log(eqpdata);

    //組EQP機台到畫面上
    var eqphtml = '';
    //機台資訊
    var EQP_SID ; 
    var STATUS ;
    var OFFSET_LEFT;
    var OFFSET_TOP;
    var WIDTH;
    var HEIGHT;
    var EQP_CODE;
    var url;
    var WO_CNT;

    var tmpWO ;

    for(var i=0;i<eqpdata.rows.length;i++){
    EQP_SID = eqpdata.rows[i].EQP_SID; 
    STATUS = eqpdata.rows[i].STATUS.toUpperCase() ;
    OFFSET_LEFT = eqpdata.rows[i].OFFSET_LEFT ;
    OFFSET_TOP = eqpdata.rows[i].OFFSET_TOP ;
    WIDTH = eqpdata.rows[i].WIDTH ;
    HEIGHT = eqpdata.rows[i].HEIGHT ;
    EQP_CODE = eqpdata.rows[i].EQP_CODE ;
    url = eqpdata.rows[i].URL ;
    WO_CNT  = eqpdata.rows[i].WO_CNT ;
    tmpWO = WO_CNT.length >6 ? WO_CNT.substring(0,6) : WO_CNT;
    eqphtml += `<div id="${EQP_SID}"  class="resizeItem ${STATUS}" style="position: absolute; left: ${OFFSET_LEFT}px; top: ${OFFSET_TOP}px; width: ${WIDTH}px; height: ${HEIGHT}px;"><a  href="#" onclick="javascript:window.open('${url}','${EQP_CODE}','height=1000,width=1000,top=0,left=250, status=no')">${EQP_CODE}<br/></a>WO:${tmpWO} Piece/${STATUS}</div>`;
  }
    $('#main-content').html(eqphtml);
}
reLoadSID ();

//跑底圖用 function
function Run_backgroundImage(url) {
    // var long_url = window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/' + url;
  var long_url = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/Layout_Background_Images/'+url;
    $('#main-content')[0].style.backgroundImage = "url('"+long_url+"')";
}

$("#progress,#loading").fadeOut(2000); 