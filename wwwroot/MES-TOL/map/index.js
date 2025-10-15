var eqpLayout1;
var eqpLayout2;
var viewLayout1;
var viewLayout2;
var gridContent2 = "";

//撈配置圖資料sid
var viewLayoutsid = '239129617920103';
var eqpLayoutsid = '238522969613728';
//撈配置圖資料
function reLoadSID (){
  
  //viewLayoutsid
  $.ajax({
    type: 'GET',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+viewLayoutsid,
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      viewLayout1 = jsonObj
    }
  });
  $.ajax({
    type: 'post',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
    data: {Charts: JSON.stringify(viewLayout1.Charts),SQL: viewLayout1.MasterSql,AddedSQL:viewLayout1.AddedSql, Conds: JSON.stringify(viewLayout1.Conditions), GridFieldType: JSON.stringify(viewLayout1.GridFieldType) ,SID:viewLayoutsid,rows : 100},
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg);
      viewLayout2 = jsonObj;
    }
  });
 
  //eqpLayoutsid
  $.ajax({
    type: 'GET',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+eqpLayoutsid,
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
      eqpLayout1 = jsonObj
    }
  });
  $.ajax({
    type: 'post',
    url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
    data: {Charts: JSON.stringify(eqpLayout1.Charts),SQL: eqpLayout1.MasterSql,AddedSQL:eqpLayout1.AddedSql, Conds: JSON.stringify(eqpLayout1.Conditions), GridFieldType: JSON.stringify(eqpLayout1.GridFieldType) ,SID:eqpLayoutsid,rows : 100},
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg);
      eqpLayout2 = jsonObj;
    }
  });
}
reLoadSID ();

//畫格子
function printDataView () {
  for(var i = 0; i < viewLayout2.rows.length; i++) {
    gridContent2 += '<div class="col-12 col-sm-6 col-md-4 col-lg-3"><div class="card "><div class="card-body"><h5 class="card-title">' + viewLayout2.rows[i].EQPLAYOUT_CODE + '</h5><p class="card-text">' + viewLayout2.rows[i].EQPLAYOUT_NAME + '</p></div><div class="card-footer"><button type="button" class="btn btn-danger" data-toggle="modal" data-target="#confirmModal" id="'+viewLayout2.rows[i].EQPLAYOUT_SID+'" onclick="getDelClickID(this.id)">刪除</button><a href="map-editV2.html?EQPLAYOUT_SID='+viewLayout2.rows[i].EQPLAYOUT_SID+'" class="btn btn-success">編輯</a><a href="map.html?EQPLAYOUT_SID='+viewLayout2.rows[i].EQPLAYOUT_SID+'" class="btn btn-info">瀏覽</a></div></div></div>'
  };
  $('#map-list').html(gridContent2);
}
printDataView ();

//刪除配置圖 事件
function EQPLAYOUTSETUP_DELETE(sid){
  $.ajax({
    type: "post",//使用get方法访问后台    
    async: false,
    data: {
        //ActionMode: "add",
         'id': sid,
    },
    url: "http://"+default_ip+"/"+default_WebSiteName+"/masterset/MastermaintainDataHandle.ashx?ActionMode=del" + "&TableName=BAS_EQPLAYOUT_MASTER"   + "&sIdx=EQPLAYOUT_SID",
    success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg);
        if (jsonObj.result == "success") {
            location.reload();
        }
        $("#progress,#loading").fadeOut(2000);
    }
}

)};

//載入Loading動畫結束
$("#progress,#loading").fadeOut(2000);