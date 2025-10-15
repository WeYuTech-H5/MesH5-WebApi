

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
let MOLD_NO = Request["MOLD_NO"] || null;

$('#MOLD_NO').html(MOLD_NO);

//backUrl參數
let LEVEL = Request["LEVEL"] || null;
let MODULE_NAME = Request["MODULE_NAME"] || null;
let BUTTON = Request["BUTTON"] || null;


function LoadMoldDataInfo(){
    //MOLD_STATUS
    var GridSid3='304963978833852';
    var GridStructer3;
    var GridData3;

    $.ajax({
        type: 'GET',
        url:'http://' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid3,
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
        url:'http://' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer3.Charts),SQL: GridStructer3.MasterSql,AddedSQL:GridStructer3.AddedSql, Conds:  JSON.stringify(GridStructer3.Conditions), GridFieldType: JSON.stringify(GridStructer3.GridFieldType) ,
        SID:+GridSid3,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            console.log(msg);

        var jsonObj = jQuery.parseJSON(msg);
            GridData3 = jsonObj;
        }
    });

     //REASON
    var GridSid4='304943747896670';
    var GridStructer4;
    var GridData4;

    $.ajax({
        type: 'GET',
        url:'http://' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid4,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                        jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        GridStructer4 = jsonObj
        }
    });
    $.ajax({
        type: 'post',
        url:'http://' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer4.Charts),SQL: GridStructer4.MasterSql,AddedSQL:GridStructer4.AddedSql, Conds:  JSON.stringify(GridStructer4.Conditions), GridFieldType: JSON.stringify(GridStructer4.GridFieldType) ,
        SID:+GridSid4,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            console.log(msg);

        var jsonObj = jQuery.parseJSON(msg);
            GridData4 = jsonObj;
        }
    });

     

    //載入資料
    for(var i=0;i<GridData3.rows.length;i++){
        $("#MOLD_STATUS").append('<option  label="'+GridData3.rows[i]["MOLD_STATUS_CODE"]+'" value="'+GridData3.rows[i]["MOLD_STATUS_SID"]+'"></option>');
    }

    for(var i=0;i<GridData4.rows.length;i++){
        $("#REASON").append('<option  label="'+GridData4.rows[i]["REASON_NAME"]+'" value="'+GridData4.rows[i]["SID"]+'"></option>');
    }
    
   


}
LoadMoldDataInfo();

function GET_MOLD_STATUS(){
    var MOLD_NO = $('#MOLD_NO').html();

    //Mold STATUS 詳細資料
    var GridSid2='304964631666818';
    var GridStructer2;
    var GridData2;

        $.ajax({
            type: 'GET',
            url:'http://' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridSid2,
            async: false,
            success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                            jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                            jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                            GridStructer2 = jsonObj
            }
        });

        GridStructer2.MasterSql = GridStructer2.MasterSql.replace('{CON}',"{CON} AND MOLD_NO='"+MOLD_NO+"'")
        console.log(GridStructer2.MasterSql)
        $.ajax({
        type: 'post',
        url:'http://' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(GridStructer2.Charts),SQL: GridStructer2.MasterSql,AddedSQL:GridStructer2.AddedSql, Conds:  JSON.stringify(GridStructer2.Conditions), GridFieldType: JSON.stringify(GridStructer2.GridFieldType) ,
        SID:+GridSid2,rows:100},
        async: false,
        success: function (msg) {
            msg = TransSpecialChar(msg);
            console.log(msg);

                var jsonObj = jQuery.parseJSON(msg);
            GridData2 = jsonObj;

            $("#progress,#loading").fadeOut(600);
        }
    });

    var MOLD_STATUS_CODE = GridData2.rows[0].MOLD_STATUS_CODE;
    $('#CUR_STATUS').html(MOLD_STATUS_CODE);

    var MOLD_SID = GridData2.rows[0].MOLD_SID;
    $('#MOLD_SID').html(MOLD_SID);

    var MOLD_NAME = GridData2.rows[0].MOLD_NAME;
    $('#MOLD_NAME').html(MOLD_NAME);

    var LAST_STATUS_CHANGE_TIME = GridData2.rows[0].LAST_STATUS_CHANGE_TIME;
    $('#CUR_STATUS_TIME').html(LAST_STATUS_CHANGE_TIME);
}
GET_MOLD_STATUS()

function MOLD_STATUS_CHANGE() {

    var status = false;

    status = ($('#MOLD_STATUS').val() == "NULL") || ($('#REASON').val() == "NULL") ? false : true;

    if(status){
        var MOLD_SID  = $('#MOLD_SID').html();
        var MOLD_STATUS = $('#MOLD_STATUS').val();
        var REASON = $('#REASON').val();
        var username = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo');
        var COMMENTValue = $('#COMMENT').val();

        var jsondata = "{ \"ActionMode\": \"MOLD_STATUS_CHANGE\",";
        jsondata += "\"INPUT_FORM_NAME\": \"BI_MOLD_STATUS_CHANGE\",";
        jsondata += "\"MOLD_SID\":\"" + MOLD_SID + "\",";
        jsondata += "\"MOLD_STATUS\":\"" + MOLD_STATUS + "\",";
        jsondata += "\"REASON_SID\":\"" + REASON + "\",";
        jsondata += "\"INPUT_USER\":\"" +username+"\"";
        jsondata += "}";
        
        var headersdata = JSON.parse(jsondata);
        $.ajax({
            type: 'GET',
            url: 'http://'+default_ip+'/'+default_WebSiteName+'/Handler/MOLDHandler.ashx',
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
                    $('#MOLD_NO').val("NULL")
                    $('#MOLD_STATUS').val("NULL")
                    $('#REASON').val("NULL")
                    $('#COMMENT').val("")
                    $('#CUR_STATUS').html("N/A");

                    // alert(resultJson.msg);
                    $('#resultMsg').text(resultJson.msg)
                    $('#resultMsg').attr("style",getLabel(resultJson.msg))
                }
                else {
                    // $('#msg').html("<span style='font-size:40px;background-color:red'>" + resultJson.msg + "</span>");
                    alert(resultJson.msg);
                }
                GET_MOLD_STATUS()
                $("#progress,#loading").fadeOut(600);
            }
        })
    }
    else{
        alert("請檢查 機台編號/機台狀態/原因 是否輸入");
    }
    
};

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