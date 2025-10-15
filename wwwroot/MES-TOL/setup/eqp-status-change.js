

var getUrlParameter = function getUrlParameter() {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    var par = {};
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        par[sParameterName[0]] = decodeURI(sParameterName[1])
    }
    return par;
};
Request = getUrlParameter();
let EQP_NO = Request["EQP_NO"] || null;

$('#EQP_NO').html(EQP_NO);

//backUrl參數
let LEVEL = Request["LEVEL"] || null;
let MODULE_NAME = Request["MODULE_NAME"] || null;
let BUTTON = Request["BUTTON"] || null;


function LoadEQPDataInfo(){

    //EQP清單
    var GridSid='304943671810709';
    var GridStructer;
    var GridData;

    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                        jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        GridStructer = jsonObj
        }
    });

    GridStructer.MasterSql = GridStructer.MasterSql.replace('{CON}',"{CON} AND EQP_NO='"+EQP_NO+"'")

    $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer.Charts),SQL: GridStructer.MasterSql,AddedSQL:GridStructer.AddedSql, Conds:  JSON.stringify(GridStructer.Conditions), GridFieldType: JSON.stringify(GridStructer.GridFieldType) ,
        SID:+GridSid,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            // console.log(msg);

        var jsonObj = jQuery.parseJSON(msg);
            GridData = jsonObj;
        }
    });

    $('#EQP_NAME').html(GridData.rows[0].EQP_NAME);
    $('#CUR_STATUS_TIME').html(GridData.rows[0].STATUS_CHANGE_TIME);
    

    //EQP STATUS 清單
    var GridSid2='304943683756998';
    var GridStructer2;
    var GridData2;

    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid2,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                        jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        GridStructer2 = jsonObj
        }
    });
        $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer2.Charts),SQL: GridStructer2.MasterSql,AddedSQL:GridStructer2.AddedSql, Conds:  JSON.stringify(GridStructer2.Conditions), GridFieldType: JSON.stringify(GridStructer2.GridFieldType) ,
        SID:+GridSid2,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            // console.log(msg);

        var jsonObj = jQuery.parseJSON(msg);
            GridData2 = jsonObj;
        }
    });

    //REASON
    var GridSid3='304943747896670';
    var GridStructer3;
    var GridData3;

    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid3,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                        jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        GridStructer3 = jsonObj
        }
    });
        $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer3.Charts),SQL: GridStructer3.MasterSql,AddedSQL:GridStructer3.AddedSql, Conds:  JSON.stringify(GridStructer3.Conditions), GridFieldType: JSON.stringify(GridStructer3.GridFieldType) ,
        SID:+GridSid3,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            // console.log(msg);

        var jsonObj = jQuery.parseJSON(msg);
            GridData3 = jsonObj;
        }
    });

    //載入資料
    for(var i=0;i<GridData.rows.length;i++){
        // $("#EQP_NO").append('<option  label="'+GridData.rows[i]["EQP_NAME"]+'" value="'+GridData.rows[i]["EQP_SID"]+'"></option>');
        $('#EQP_SID').html(GridData.rows[i]["EQP_SID"]);
    }
    
    for(var i=0;i<GridData2.rows.length;i++){
        $("#EQPSTATUS").append('<option  label="('+GridData2.rows[i]["EQP_STATUS_CODE"]+')'+GridData2.rows[i]["EQP_STATUS_NAME"]+'" value="'+GridData2.rows[i]["EQP_STATUS_SID"]+'"></option>');
    }

    for(var i=0;i<GridData3.rows.length;i++){
        $("#REASON").append('<option  label="('+GridData3.rows[i]["REASON_CODE"]+')'+GridData3.rows[i]["REASON_NAME"]+'" value="'+GridData3.rows[i]["SID"]+'"></option>');
    }
    


}
LoadEQPDataInfo();

function EQP_STATUS_CHANGE() {

        var status = false;

        status = ($('#EQP_NO').html() == "NULL") || ($('#EQPSTATUS').val() == "NULL") || ($('#REASON').val() == "NULL") ? false : true;

        if(status){

            var EQP_SID  = $('#EQP_SID').html();
            var EQPStatus = $('#EQPSTATUS').val();
            var REASON = $('#REASON').val();
            var username = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo');
            var COMMENTValue = $('#COMMENT').val();

            var jsondata = "{ \"ActionMode\": \"EQP_STATUS_CHANGE\",";
            jsondata += "\"INPUT_FORM_NAME\": \"BI_EQP_STATUS_CHANGE\",";
            jsondata += "\"EQP_SID\":\"" + EQP_SID + "\",";
            jsondata += "\"STATUS_SID\":\"" + EQPStatus + "\",";
            jsondata += "\"REASON_SID\":\"" + REASON + "\",";
            jsondata += "\"INPUT_USER\":\"" +username+"\"";
            jsondata += "}";
            
            var headersdata = JSON.parse(jsondata);
            $.ajax({
                type: 'GET',
                url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/Handler/WebUIWipHandler.ashx',
                async: false,
                pagination: true,
                headers: headersdata,
                data: {
                    COMMENT: COMMENTValue.replace(/\n/g, ' ').replace(/\r/g, ' ')
                },
                success: function (msg) {
                    resultJson = JSON.parse(msg);
                    if (resultJson.result == true) {
                        // $('#msg').html("<span style='font-size:40px;background-color:green'>" + resultJson.msg + "</span>");
                        //UI CLEAN
                        $('#EQPSTATUS').val("NULL")
                        $('#REASON').val("NULL")
                        $('#COMMENT').val("")

                        // alert(resultJson.msg);
                        $('#resultMsg').text(resultJson.msg)
                        $('#resultMsg').attr("style",getLabel(resultJson.msg))

                    }
                    else {
                        // $('#msg').html("<span style='font-size:40px;background-color:red'>" + resultJson.msg + "</span>");
                        alert(resultJson.msg);
                    }
                    LoadEQPDataInfo();
                    GetEQPStatus();
                    $("#progress,#loading").fadeOut(600);
                }
            })
        }
        else{
            alert("請檢查 機台編號/機台狀態/原因 是否輸入");
        }
        
};



function GetEQPStatus(){
    var EQP_SID = $('#EQP_SID').html();

    //EQP STATUS
    var GridSid4='305486010513020';
    var GridStructer4;
    var GridData4;

    $.ajax({
        type: 'GET',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid4,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                        jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        GridStructer4 = jsonObj
        }
    });

    GridStructer4.MasterSql = GridStructer4.MasterSql.replace("{CON}","{CON} AND EQP_SID='"+EQP_SID+"'");

        $.ajax({
        type: 'post',
        url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer4.Charts),SQL: GridStructer4.MasterSql,AddedSQL:GridStructer4.AddedSql, Conds:  JSON.stringify(GridStructer4.Conditions), GridFieldType: JSON.stringify(GridStructer4.GridFieldType) ,
        SID:+GridSid4,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            // console.log(msg);

        var jsonObj = jQuery.parseJSON(msg);
            GridData4 = jsonObj;
            var status = GridData4.rows[0].STATUS;
            $('#CUR_STATUS').html(""+status+"");

        }
    });


}

GetEQPStatus();

// 获取具有 "Lang" 类的<span>元素
let backButton = document.getElementById("backButton");

// 添加点击事件处理程序
backButton.addEventListener("click", function() {
  
    GoBack(LEVEL,MODULE_NAME,BUTTON);
});

// 判斷MSG欄位顏色
function getLabel(msg){
    var regEx = /\[([^\]]*)\]/g
    msg = msg.match(regEx)
    var char = msg[1][1]

    if(char.toUpperCase() === 'E'){
        return "display: true; background-color: #d4012f"
    }else{
        return "display: true; background-color: #008626"
    }
}