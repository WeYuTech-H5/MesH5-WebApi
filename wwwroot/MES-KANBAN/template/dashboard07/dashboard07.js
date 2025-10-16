//卡片資料
let totalCardSid = '357927386800685'; // 右上角 全天圖表 GET_EQP_KANBAN_TOTAL_INFO
let totalCardData ;
let dayCardSid = '357927437256436'; // 左上角 日班圖表 GET_EQP_KANBAN_SHIFT_INFO_V2
let dayCardData ;
let nightCardSid = '357927477266843'; // 左上角 夜班圖表 GET_EQP_KANBAN_SHIFT_INFO_V2
let nightCardData ;

//表格資料
let gridsid = '360351530350765'; // GET_EQP_KANBAN_TABLE_V3 機台稼動不吃工單
let griddata;

// url取參數
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
var today = new Date().toLocaleDateString('en-CA')
var EQP_TYPE = Request["EQP_TYPE"]
var SHIFT_DAY = Request["SHIFT_DAY"]||today
$("#data_show").text(SHIFT_DAY.replaceAll('-','/')).click(function(){
    $('#date')[0].showPicker();
})
$('#date').attr('max',today).val(SHIFT_DAY).change(function(){
    window.location.href = window.location.href.split('?')[0] + '?EQP_TYPE=' + EQP_TYPE + '&SHIFT_DAY=' + this.value
})
$("#title").text(EQP_TYPE+' Dashboard')

async function fetchData() {
    try {
        totalCardData = await getGridData_Shift(totalCardSid,EQP_TYPE,SHIFT_DAY);
        dayCardData = await getGridData_Shift(dayCardSid,EQP_TYPE,SHIFT_DAY)
        nightCardData = await getGridData_Shift(nightCardSid,EQP_TYPE,SHIFT_DAY)
        //產生卡片 html
        SetCard(totalCardData,dayCardData,nightCardData);

        griddata = await getGridData_Shift(gridsid,EQP_TYPE,SHIFT_DAY);

        SetGrid(griddata);
        
        $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

        // toggleScrollbar();
        //最後更新資料的時間
        updateTime('timming')

    } catch (error) {
      console.error("获取数据时出错：", error);
    }
}
  
fetchData();

//產生 卡片資訊的html
function SetCard(totalCardData,dayCardData,nightCardData){

    try{
        //早班
        $('#day-manager').html(dayCardData[0].MANAGER); 
        $('#day-output-per-capita').html(dayCardData[0].OUTPUT_PER_CAPITA||"-"); 
        $('#day-oee').html(Math.round(dayCardData[0].OEE,1)); 
        $('#day-avl').html(Math.round(dayCardData[0].AVAILABILITY,0)); 
        dayCardData[0].YEILD >= 0 
            ? $('#day-yld').html(Math.round(dayCardData[0].YEILD,0)) 
            : $('#day-yld').html('-').removeClass('percent');
        dayCardData[0].PERFORMANCE >= 0 
            ? $('#day-prf').html(Math.round(dayCardData[0].PERFORMANCE,0)) 
            : $('#day-prf').html('-').removeClass('percent');
        //晚班
        $('#night-manager').html(nightCardData[0].MANAGER); 
        $('#night-output-per-capita').html(nightCardData[0].OUTPUT_PER_CAPITA||"-"); 
        $('#night-oee').html(Math.round(nightCardData[0].OEE,1)); 
        $('#night-avl').html(Math.round(nightCardData[0].AVAILABILITY,0)); 
        nightCardData[0].YEILD >= 0 
            ? $('#night-yld').html(Math.round(nightCardData[0].YEILD,0)) 
            : $('#night-yld').html('-').removeClass('percent');
        nightCardData[0].PERFORMANCE >= 0 
            ? $('#night-prf').html(Math.round(nightCardData[0].PERFORMANCE,0)) 
            : $('#night-prf').html('-').removeClass('percent');
        //全天
        $('#total-oee').html(totalCardData[0].OEE||0); 
        $('#total-product-time').html(totalCardData[0].TOTAL_PRODUCTION_TIME); 
        $('#total-avl').html(totalCardData[0].AVAILABILITY||0); 
        totalCardData[0].YEILD >= 0 
            ? $('#total-yld').html(Math.round(totalCardData[0].YEILD,0)) 
            : $('#total-yld').html('-').removeClass('percent');
        totalCardData[0].PERFORMANCE >= 0 
            ? $('#total-prf').html(Math.round(totalCardData[0].PERFORMANCE,0)) 
            : $('#total-prf').html('-').removeClass('percent');
    }
    catch(error) {
        console.error("获取数据时出错：", error);
    }
    

}

//產生 卡片資訊的html
function SetGrid(griddata){
    try{
        let dataSet = griddata.map((e) => {
            return {
                "EQP_NO": e.EQP_NO,
                "STATUS": e.STATUS,
                "WO": e.WO || '',
                "USER_NAME": e.USER_NAME || '',
                "PART_NO": e.PART_NO || '',
                "ERP_QTY": e.ERP_QTY || '',
                "AVL": e.AVL || 0,
                "OUTPUT_TOTAL": e.OUTPUT_TOTAL || 0, //IOT產出
                "KEYIN_OUTPUT_TOTAL": e.KEYIN_OUTPUT_TOTAL || 0, //人員輸入產出
                "EQP_STATUS_LAYOUT_COLOR": e.EQP_STATUS_LAYOUT_COLOR
            };
        });
        $("#theTable").DataTable({
            data: dataSet,
            columns: [
                { title: "EQP_NO", data: "EQP_NO" },
                { title: "Status", data: "STATUS" },
                { title: "User", data: "USER_NAME" },
                { title: "MO", data: "WO" },
                { title: "Part NO.", data: "PART_NO" },
                { title: "Planned Quantity", data: "ERP_QTY" },
                { title: "A(%)", data: "AVL" },
                { title: "IoT count", data: "OUTPUT_TOTAL" },
                { title: "Keyin output", data: "KEYIN_OUTPUT_TOTAL" }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "render": function(data, type, row) {
                        //設置超連結
                        let url = `${window.location.protocol}//${default_ip}/${PROJECT_NAME}/${kanbanRoute}/template/dashboard08/dashboard08.html?EQP_TYPE=${EQP_TYPE}&EQP_NO=${data}&SHIFT_DAY=${SHIFT_DAY}`
                        return `<a href="${url}" target="_blank">${data}</a>`;
                    }
                },
                {
                    "targets": 1,
                    "createdCell": function(td, cellData, rowData, row, col) {
                        // 根據 EQP_STATUS_LAYOUT_COLOR 欄位設置 Status 欄位的顏色
                        $(td).css('color', rowData.EQP_STATUS_LAYOUT_COLOR);
                    }
                }
            ],
            destroy: true, //每一次修改時銷毀資料
            stateSave: false, //表格狀態保存，當頁面刷新時，是否要保存當前表格狀態，不保存狀態便會在刷新時回復到原始狀態
            autoWidth: false, //是否要自動調整表格寬度
            dom: 'rt', //只顯示表格本身
            pageLength: 999,
            scrollY: "60vh"
        });
    }
    catch(error) {
        console.error("获取数据时出错：", error);
    }
}

// 取得 看板資訊
function getGridData_Shift(SID,EQP_TYPE,SHIFT_DAY) {
    var resultData;
    $.ajax({
        type: 'GET',
        url:window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+SID,
        async: false,
        success: function (msg) {
        var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                        jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                        QueryStructer = jsonObj
        }
    });

    QueryStructer.MasterSql = QueryStructer.MasterSql.replace('[EQP_TYPE]',EQP_TYPE).replace('[SHIFT_DAY]',SHIFT_DAY)

    $.ajax({
        type: 'post',
        url:window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {Charts: JSON.stringify(QueryStructer.Charts),SQL: QueryStructer.MasterSql,AddedSQL:QueryStructer.AddedSql, Conds:  JSON.stringify(QueryStructer.Conditions), GridFieldType: JSON.stringify(QueryStructer.GridFieldType) ,
        SID:SID,rows:100},
        async: false,
        success: function (msg) {
            resultData = jQuery.parseJSON(msg);
        }
    });
    return resultData.rows;
}

async function refreshData() {
    if (document.visibilityState === 'visible'){
        try {
            //定時更新
            refreshInterval = setInterval(async () => {
                fetchData();
                //最後更新資料的時間
                updateTime('timming')
                console.log("refresh!")
            }, 60000);
            
        } catch (error) {
          console.error("获取数据时出错：", error);
        }
    }
}

refreshData();



//最後更新資料時間
async function updateTime(ElementID){
    let getTimeData = await getGridData('252236119093442');
    let lastUpdateTime = new Date(getTimeData.Grid_Data[0].TIMESPAN)
    let hour = lastUpdateTime.getHours();
    let minute = lastUpdateTime.getMinutes();
    document.getElementById(ElementID).textContent = (`${hour}:${minute < 10 ? '0' : ''}${minute}`)
}