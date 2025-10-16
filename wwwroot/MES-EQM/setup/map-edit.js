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

var eqpLayout1;
var eqpLayout2;
var viewLayout1;
var viewLayout2;
var gridContent = "";


var offset = '';
var xPos = '';
var yPos = '';
var width = '';
var height = '';
var eqpSID = '';
var eqpCODE = '';
var eqpNAME = '';

var EqpLayoutSetupData = {
sid: EQPLAYOUT_SID,
BackGroundImage: "",
count: 0,
code: "",
name: "",
isautoshow: "false",
refreshtime: "30",
width: 0,
height: 0,
EqpList: [],
contentTableName: "",
contentEQPField: "",
contentDatas:[]
};

//暫存檔案
$(".custom-file-input").on("change", function() {
var fileName = $(this).val().split("\\").pop();
$(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});

//撈此畫面主要資料
var viewsid = '239129617920103';
var viewLayout1;
var viewLayout2;
//撈此畫面綁定的EQP機台資料
var eqpsid = '303133223836169';
var eqpstructure;
var eqpdata;
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
    $('#map_no').val(viewLayout2.rows[0].EQPLAYOUT_CODE);
    $('#map_name').val(viewLayout2.rows[0].EQPLAYOUT_NAME);
    //跑背景圖
    Run_backgroundImage(viewLayout2.rows[0].BACKGROUND_IMAGE);
    
    //跑右側機台選項
    $.ajax({
      type: 'GET',
      url:window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=238522969613728',
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
      data: {Charts: JSON.stringify(eqpLayout1.Charts),SQL: eqpLayout1.MasterSql,AddedSQL:eqpLayout1.AddedSql, Conds: JSON.stringify(eqpLayout1.Conditions), GridFieldType: JSON.stringify(eqpLayout1.GridFieldType) ,SID:'238522969613728',rows : 100},
      async: false,
      success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg);
        eqpLayout2 = jsonObj;
      }
    });

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
    
}
reLoadSID ();

function Run_backgroundImage(url) {
  // var long_url = window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/' + url;
  var long_url = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/Layout_Background_Images/'+url;
  document.getElementById('list').style.backgroundImage = 'url('+long_url+')';
  EqpLayoutSetupData.BackGroundImage = url;
}


//處理 清單資料是否已經被選過的 顏色/事件處理
function reply_click(clicked_id,status) {

if(status==true){
  if($('#'+clicked_id)[0].style.backgroundColor!='rgb(102, 102, 102)'){ //深的按鈕才能觸發 click事件
    $('#'+clicked_id).addEventListener('click',$('#items>.resizeItem').click());
  }
}
};

//左下機台清單列表 style設定
$('#items').slimscroll({
  height: '53vh',
  disableFadeOut: false
});

var EqpLayoutSetupEqpInfo; //需上傳的機台暫存
var EqpLayoutSetupEqpInfoListTmp = [];
var EqpLayoutSetupEqpInfoListCheck = [];

//Loading 左下機台清單資料
function printData () {

for(var i = 0; i < eqpLayout2.rows.length; i++) {
  gridContent += '<div id="'+eqpLayout2.rows[i].EQP_SID+'" onClick="reply_click(this.id)" class="resizeItem v'+eqpLayout2.rows[i].EQP_SID+' ' +eqpLayout2.rows[i].EQP_STATUS+'"><span id="'+eqpLayout2.rows[i].EQP_NO+'"></span><small id="'+eqpLayout2.rows[i].EQP_NAME+'"></small>'+eqpLayout2.rows[i].EQP_NAME+'<a class="del">刪除</a></div>';
}

$('#items').html(gridContent);

}
printData ();

$('#items>.resizeItem').click(function(){
  
eqpSID = $(this).attr('id');
eqpCODE = $(this).find('span').attr('id');
eqpNAME = $(this).find('small').attr('id');
offset = $(this).position();
xPos = offset.left;
yPos = offset.top;
width =  $(this).width();
height =  $(this).height();


//因為沒按過，所以可以複製到配置圖
if($(this).css("background-color") != 'rgb(153, 153, 153)')
{
  $(this).clone().attr('id', $(this).attr('id')).appendTo('#list').css('background-color','#666')
}

//當前操作按了，關閉Click事件
if($(this).css("background-color") != 'rgb(102, 102, 102)')//深
{
  $(this).off('click').css('background-color','#999');
}
else //當前操作按了刪除，把按鈕事件加回
{
  $(this).css('background-color','rgb(153, 153, 153)');//淺
}

$('#list>.resizeItem').draggable({
      containment: "#list",
      stop: function draggableStop (event, ui) {
        eqpSID = $(this).attr('id');
        eqpCODE = $(this).find('span').attr('id');
        eqpNAME = $(this).find('small').attr('id');
        offset = $(this).position();
        xPos = offset.left;
        yPos = offset.top;
        width =  $(this).width();
        height =  $(this).height();

        //檢查是否有加過了
        if(EqpLayoutSetupEqpInfoListCheck.indexOf(eqpSID)!=-1){
            //純改位置
            for(var i=0;i<EqpLayoutSetupEqpInfoListTmp.length;i++){
                if(EqpLayoutSetupEqpInfoListTmp[i].eqpsid==eqpSID){
                  EqpLayoutSetupEqpInfoListTmp[i].width = width;
                  EqpLayoutSetupEqpInfoListTmp[i].height = height;
                  EqpLayoutSetupEqpInfoListTmp[i].top = yPos;
                  EqpLayoutSetupEqpInfoListTmp[i].left = xPos;
                }
            }
        }
        else{
          // 第一次移動 加入
          EqpLayoutSetupEqpInfo =
          {
              eqpsid: eqpSID,
              eqpcode: eqpCODE,
              eqpname: eqpNAME,
              width: width,
              height: height,
              top: yPos,
              left: xPos
          };
          EqpLayoutSetupEqpInfoListTmp.push(EqpLayoutSetupEqpInfo);
          EqpLayoutSetupEqpInfoListCheck.push(eqpSID);
        }

    }
    }).resizable({
      ghost: true,
      stop: function resizableStop(event, ui) {
        eqpSID = $(this).attr('id');
        eqpCODE = $(this).find('span').attr('id');
        eqpNAME = $(this).find('small').attr('id');
        offset = $(this).position();
        xPos = offset.left;
        yPos = offset.top;
        width =  $(this).width();
        height =  $(this).height();
        for(var i=0;i<EqpLayoutSetupEqpInfoListTmp.length;i++){
          if(EqpLayoutSetupEqpInfoListTmp[i].eqpsid==eqpSID){
            EqpLayoutSetupEqpInfoListTmp[i].width = width;
            EqpLayoutSetupEqpInfoListTmp[i].height = height;
          }
      }
    }
});

$('#list>.resizeItem').parent().on('click');

//從清單拉出來的項目 可以刪除的按鈕 (既有儲存的則沒有)
$('#list>.resizeItem>.del').click(function(){
  
    var a = $(this).parent().attr('id');
    if(a!=undefined){
      //畫面UI消失

      $('#items>.resizeItem.v'+a).on('click').css('background-color','#666'); //左
      $('#list>.resizeItem.v'+a).remove();
     
      //清空資料
      //判斷是否存在暫存檔中
      if(EqpLayoutSetupEqpInfoListCheck.indexOf(a)!=-1){
        EqpLayoutSetupEqpInfoListCheck.splice(EqpLayoutSetupEqpInfoListCheck.indexOf(a), 1) // 從索引2的位置刪除1筆資料
        EqpLayoutSetupEqpInfoListTmp.splice(EqpLayoutSetupEqpInfoListCheck.indexOf(a), 1) // 從索引2的位置刪除1筆資料
      }
    }

    console.log(EqpLayoutSetupEqpInfoListCheck);
    console.log(EqpLayoutSetupEqpInfoListTmp);

    reply_click(a,true)
  
});
});

//儲存按鈕 (上傳DB)
function EQPLAYOUTSETUP_SAVE() {

EqpLayoutSetupData.isautoshow = "true";
EqpLayoutSetupData.sid = EQPLAYOUT_SID;
EqpLayoutSetupData.code = document.getElementById('map_no').value;
EqpLayoutSetupData.name = document.getElementById('map_name').value;
EqpLayoutSetupData.refreshtime = '30';

EqpLayoutSetupData.width = parseInt(1024);
EqpLayoutSetupData.height = parseInt(1024);

if (EqpLayoutSetupData.code == "") {
  alert("Layout Code Is Not Allowed To Be Empty");
  return;
}

if (EqpLayoutSetupData.name == "") {
  alert("Layout Name Is Not Allowed To Be Empty");
  return;
}

EqpLayoutSetupData.EqpList = [];

  EqpLayoutSetupData.EqpList = EqpLayoutSetupEqpInfoListTmp;

  EQPLAYOUTSETUP_action  = "edit";

if (EQPLAYOUTSETUP_action == "edit") {
  $.ajax({
      type: "post",//使用get方法访问后台    
      async: false,
      // data: { ActionMode: 'Update', data: JSON.stringify(EqpLayoutSetupData) },
      // url: "http://"+default_ip+"/"+default_WebSiteName+"/masterset/DcmateEQPLayoutSetupHandlerV2.ashx",
      headers: {  TokenKey:localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')  },
      data: { ActionMode: 'Update', data: JSON.stringify(EqpLayoutSetupData)  },
      url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+"/api/EQPLayoutSetup",
      success: function (msg) {
          if (msg.result) {
              alert('編輯上傳成功');
          }
      }
  });
  $("#progress,#loading").fadeOut(2000);
}

}

//移除現有畫面上設備
$('#removeAll').click(function(){
    var lens = EqpLayoutSetupEqpInfoListCheck.length;
    var LIST = EqpLayoutSetupEqpInfoListCheck.slice();
  for(var i=0;i<lens;i++){
    tmpsid = EqpLayoutSetupEqpInfoListCheck[0];
    $('#items>.resizeItem.v'+LIST[i]).css('background-color','#666'); //先變顏色
    $('#list>.resizeItem.v'+LIST[i]).remove();
    if(EqpLayoutSetupEqpInfoListCheck.indexOf(EqpLayoutSetupEqpInfoListCheck[i])!=-1){
      EqpLayoutSetupEqpInfoListCheck.splice(EqpLayoutSetupEqpInfoListCheck.indexOf(EqpLayoutSetupEqpInfoListCheck[i]), 1) // 從索引2的位置刪除1筆資料
      EqpLayoutSetupEqpInfoListTmp.splice(EqpLayoutSetupEqpInfoListCheck.indexOf(EqpLayoutSetupEqpInfoListCheck[i]), 1) // 從索引2的位置刪除1筆資料
    }
   
    // reply_click(tmpsid,true);
  }
  
  EqpLayoutSetupEqpInfoListCheck= [];
  EqpLayoutSetupEqpInfoListTmp = [];

})

//背景圖片上傳(暫存網頁)
$("input[name='EQPLAYOUTSETUP_file1']").on("change", function(event1) {
  src1 = URL.createObjectURL(event1.target.files[0]);
  document.getElementById('list').style.backgroundImage = 'url('+src1+')';
});
//背景圖片上傳 清空背景按鈕
$('#cancelUpload').on('click', function(){
  document.getElementById('list').style.backgroundImage = 'none';
});


//背景圖片上傳(儲存到db)
$(function () {
  $('#EQPLAYOUTSETUP_uploadfile').bind('click', function () {
    document.getElementById('list').style.backgroundImage = 'url('+src1+')';
    $("#EQPLAYOUTSETUP_uploadform").ajaxSubmit({
      
      url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/MasterSet/DcmateEQPLayoutSetupHandlerV2.ashx?ActionMode=UploadImage', /*设置post提交到的页面*/
      // url: 'http://10.0.20.114/WeyuBiApi/api/DcmateEQPLayoutSetupHandlerV2.ashx?ActionMode=UploadImage', /*设置post提交到的页面*/
      // data: {TokenKey:localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')},
      type: "post", /*设置表单以post方法提交*/
      async: true,
      success: function (msg) {
          resultJson = JSON.parse(msg);
          if (resultJson.result != "true") {
              alert(resultJson.msg);
          }
          else {
              $("#eqplayoutsetup_content").css("background-image", "url(" + resultJson.path + ")");
              EqpLayoutSetupData.BackGroundImage = resultJson.path;
          }
      }
    })
    $("#progress,#loading").fadeOut(2000);
  });
});

//放置EQP在圖中
function PushEQPPosition(){
    
  for(var i=0;i<eqpdata.rows.length;i++){
      $('#items>.resizeItem.v'+eqpdata.rows[i].EQP_SID).click();

      $('#'+eqpdata.rows[i].EQP_SID).off('click').css('background-color','#999');
      offset = $('#'+eqpdata.rows[i].EQP_SID).position();
      offset.left = parseInt(eqpdata.rows[i].OFFSET_LEFT);
      offset.top = parseInt(eqpdata.rows[i].OFFSET_TOP);
      $('#'+eqpdata.rows[i].EQP_SID)[0].style.left = eqpdata.rows[i].OFFSET_LEFT +'px';
      $('#'+eqpdata.rows[i].EQP_SID)[0].style.top  = eqpdata.rows[i].OFFSET_TOP +'px';
      $('#'+eqpdata.rows[i].EQP_SID)[0].style.width = eqpdata.rows[i].WIDTH +'px';
      $('#'+eqpdata.rows[i].EQP_SID)[0].style.height = eqpdata.rows[i].HEIGHT +'px';
      $('#'+eqpdata.rows[i].EQP_SID).css('background-color','#666');

    EqpLayoutSetupEqpInfo =
          {
              eqpsid: eqpdata.rows[i].EQP_SID,
              eqpcode: eqpdata.rows[i].EQP_NO,
              eqpname: eqpdata.rows[i].EQP_NAME,
              width: eqpdata.rows[i].WIDTH,
              height: eqpdata.rows[i].HEIGHT,
              top: offset.top,
              left: offset.left
          };
          EqpLayoutSetupEqpInfoListTmp.push(EqpLayoutSetupEqpInfo);
          EqpLayoutSetupEqpInfoListCheck.push(eqpSID);
  }
}
PushEQPPosition();

$("#progress,#loading").fadeOut(2000); 