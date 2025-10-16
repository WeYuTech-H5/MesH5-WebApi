let cicoDataSID = '359809494503962' //WIP_OPI_WDOEACICO_HIST_FOR_OPI
let cicoData;
let reasonCodeListSID = '350218189246470'
let reasonCodeList;

let ganttDataSID = '358003490890214' // GET_WIP_OPI_WDOEACICO_HIST_KANBAN_GANTT

//URL取參數
const urlParams = new URLSearchParams(window.location.search);
const DEPT_NO = urlParams.get('DEPT_NO');
const WIP_OPI_WDOEACICO_HIST_SID = urlParams.get('WIP_OPI_WDOEACICO_HIST_SID');
$("#DEPARTMENT").text(DEPT_NO)
//返回紐
$('#backButton').click(function() {
    window.location.href = window.location.protocol+'//' + default_ip + '/' + PROJECT_NAME +"/"+kanbanRoute+ '/MES-WIP/setup/wip-query.html?SID=347301502426686&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&DEPT_NO=' + DEPT_NO
})
//取得撈資料用時間
let currentDay = (new Date()).toLocaleString('en-CA', { hour12: false }).split(',')[0] // ex. 2024-01-01
let currentTime = (new Date()).toLocaleString('en-CA', { hour12: false }).split(' ')[1].padStart(8, "00000000"); // ex. 23:59:59
let shift_start_end = '00:00:00' // 開始&結束時間
$("#selectDate").val(currentDay).attr("max",currentDay) //不可選未來的日期
$("#selectTime").val(currentTime.slice(0,5))

$(document).ready(async function() {
  await initChartConfig();
  cicoData = (await getGridData(cicoDataSID)).Grid_Data.filter((e) => e.WIP_OPI_WDOEACICO_HIST_SID == WIP_OPI_WDOEACICO_HIST_SID)[0]
  reasonCodeList = (await getGridData(reasonCodeListSID)).Grid_Data.filter((e) => e.REASON_CODE.slice(0,1) == DEPT_NO.slice(0,1)); //ex. 原因碼為 D01 or C01
  $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

  //顯示紀錄資訊
  $("#ACCOUNT_NO").html(cicoData.ACCOUNT_NO.replace(/\(.*?\)/g, '').split(',').map((e)=>`<div>${e}</div>`).join(''))
  $("#EQP_NO").text(cicoData.EQP_NO)
  $("#EQPNAME").text(`(${cicoData.EQP_NAME})`)
  $("#WO").text(cicoData.WO)
  $("#WC").text(cicoData.OPERATION_CODE)
  $("#PART_NO").text(cicoData.PART_NO)
  $("#ERP_QTY").text(cicoData.ERP_QTY)
  $("#CHECK_IN_TIME").text(cicoData.CHECK_IN_TIME.replace('T',' '))

  //NG輸入
  LoadNgCodeV3()
  SetNgHistQuery()
  $('#saveNgBtn').click(function(){
    var WDOEACICONG_HIST_SID = $(this).attr('ng-sid');

    $('#NGModal').modal('hide');
    $('#message-loader').show()

    if(WDOEACICONG_HIST_SID){
        EditNgData(WDOEACICONG_HIST_SID)
    }else{
        AddNgData()
    }
  })

  //時間選擇視窗
  $("#selectDate, #selectTime").click(function(){this.showPicker()});
  $("#selectDate").change(()=>GetCICOGantt());
  $("#CHECK_OUT_TIME").click(function(){
    GetCICOGantt()
    $("#timeModal").modal('show')
  });
  $("#saveTime").click(()=>{
    let _datetime = $("#selectDate").val()+" "+$("#selectTime").val()
    $("#CHECK_OUT_TIME").text(_datetime).data('value',_datetime)
    $("#timeModal").modal('hide')
  });
});
//取得已進站的工單資訊
async function getGridDataWDOEACICO(WIP_OPI_WDOEACICO_HIST_SID) {
  // 定义 GetGrid API 的 URL
  let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';

  // 定义要传递的参数对象
  let params = {
      SID: cicoDataSID, //WIP_OPI_WDOEACICO_HIST
      TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
  };

  // 定义查詢条件参数对象
  let conditions = {
      // 每個SID 要塞的條件皆不同,塞錯會掛
      Field: ["WIP_OPI_WDOEACICO_HIST_SID"],
      Oper: ["="],
      Value: [WIP_OPI_WDOEACICO_HIST_SID]
  };

  // 构建请求头
  let headers = new Headers({
      'Content-Type': 'application/json',
      'SID': params.SID,
      'TokenKey': params.TokenKey
      // 可以添加其他必要的请求头信息
  });

  // 构建请求体
  let requestBody = JSON.stringify(conditions);

  // 构建请求配置
  let requestOptions = {
      method: 'POST', // 将请求方法设置为 "POST"
      headers: headers,
      body: requestBody // 将条件参数放入请求体
  };

  try {
      // 发送请求并等待响应
      let response = await fetch(getGridURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          let data = await response.json();
          // console.log("获取Grid数据成功:", data);
          if(data.result){
              return data.Grid_Data[0];
          }
          else{
              Set_Clean();

          }
      } else {
              throw new Error('获取Grid数据失败，状态码：' + response.status);
          
      }
  } catch (error) {
      console.error(error);
  }
}
function GetCICOGantt(){
    let woHints=[] //儲存甘特圖HINT資訊
    let EQP_NO = $("#EQP_NO").text()
    let SHIFT_DAY = $("#selectDate").val()
    let next_shift_day = new Date(new Date(SHIFT_DAY).setDate(new Date(SHIFT_DAY).getDate() + 1)).toISOString().slice(0, 10);
    
    let startTime, endtime;
    if(currentDay == SHIFT_DAY){ //當天
      startTime = currentDay + ' ' + shift_start_end;
      endtime = currentDay + ' ' + currentTime
    }else{ //歷史
      startTime = SHIFT_DAY + ' ' + shift_start_end;
      endtime = next_shift_day + ' ' + shift_start_end;
    }
    drawChart()
    async function drawChart(){
      let condition = {
          "[EQP_NO]":EQP_NO,
          "[S_TIME]":startTime,
          "[E_TIME]":endtime
        }
      let GanttData = await getGanttData(ganttDataSID,condition)
      if(window.GanttChart && window.GanttChart !== null){
          window.GanttChart.destroy;
      }
    
      $('#ganttWrapper').empty();
      $('#ganttWrapper').append('<canvas id="ganttChart"><canvas>');
    
      let dataWrapper = [];
      let endObj;
      let dataObj;
      let gapObj;
      let previousEnd = '';
    
      for (i=0;i<GanttData.rows.length;i++){
        let start =GanttData.rows[i].CHECK_IN_TIME;
        let end   =GanttData.rows[i].CHECK_OUT_TIME;
        let wo = GanttData.rows[i].WO;
        let USER_NAME = GanttData.rows[i].USER_NAME;
        let dataType = GanttData.rows[i].OEE_TYPE.toUpperCase();
        let bgColor = GanttData.rows[i].BG_COLOR;
        //startTime,endtime => 班別的時間(08:00-08:00)
        //start,end => 工單綁定的時間
        if(previousEnd !== '' && start != previousEnd){
          gapObj = { x:{from: new Date(previousEnd.replaceAll('-', '/')), to: new Date(start.replaceAll('-', '/'))}, y: 1, backgroundColor: 'grey'};
          dataWrapper.push(gapObj);
          woHints.push('N/A')
        }
    
        switch(dataType){
          case 'RUN':
          case 'UNFINISHED':
            dataObj = { x:{from: new Date(start.replaceAll('-', '/')), to: new Date(end.replaceAll('-', '/'))}, y: 1, backgroundColor: bgColor};
            dataWrapper.push(dataObj);
            woHints.push(wo+' / '+USER_NAME);
            previousEnd = end
            break;
          case 'IDLE':
            dataObj = { x:{from: new Date(start.replaceAll('-', '/')), to: new Date(end.replaceAll('-', '/'))}, y: 1, backgroundColor: bgColor};
            dataWrapper.push(dataObj);
            woHints.push('N/A');
            previousEnd = end
            break;
        }
    
        //最後一筆
        if(i===GanttData.rows.length-1 && currentDay==SHIFT_DAY){
          let undefinedEndTime = next_shift_day + ' ' + shift_start_end;
          endObj = { x:{from: new Date(previousEnd.replaceAll('-', '/')), to: new Date(undefinedEndTime.replaceAll('-', '/'))}, y: 1, backgroundColor: 'transparent'};
          dataWrapper.push(endObj);
          woHints.push('N/A')
        }
      };
    
      //若無工單紀錄
      if(dataWrapper.length === 0){
        if(currentDay==SHIFT_DAY){
          let fromTime = new Date(currentDay+' ' + shift_start_end)
          let toTime = new Date(year+'/'+month+'/'+(date+1)+' ' + shift_start_end)
          dataObj = { x:{from: fromTime, to: new Date(time)}, y: 1, backgroundColor: 'grey'};
          dataWrapper.push(dataObj);
          woHints.push('N/A')
          dataObj = { x:{from: new Date(time), to: toTime}, y: 1, backgroundColor: 'transparent'};
          dataWrapper.push(dataObj);
          woHints.push('N/A')
        }else{
          dataWrapper =[
              {
                  "x": {
                      "from": new Date(startTime),
                      "to":  new Date(endtime)
                  },
                  "y": 1,
                  "backgroundColor": "grey"
              }
          ]
          woHints.push('N/A')
        }
        
      }
    
      //畫圖
      let ctx = document.getElementById('ganttChart').getContext('2d');
      window.GanttChart = new Chart(ctx, {
        type: "gantt",
        data: {
            datasets: [{
                height: 2,
                width: "24h",
                label: " ",
                data: dataWrapper
            }]
        },
        options: {
          showAllTooltips: true,
          tooltips: {
            backgroundColor:'transparent',
            displayColors: false,
            enabled: true,
            yAlign: 'center',
            xAlign: 'center',
            callbacks: {
              title: function () {
                return ''; // 否则返回标题
              },
              label: function(item) {
                if (woHints[item.index] == 'N/A') {
                    return ''; // 如果符合条件，则返回空字符串，禁用标题
                }
                return woHints[item.index].split(' / ')
              }
            }
          },
          legend: {
              display:false
          },
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              ticks: { padding: 0},
              scaleLabel: {display: true},
              type: "time-gantt",
              position: "bottom",
              time: {
                displayFormats: {
                    hour: "HH:mm",
                },
              }
            }],
            yAxes:[{
              gridLines: {color:'transparent'},
              ticks: { beginAtZero: true, min: 0, display: false},
              scaleLabel: {display: true, labelString: 'WO'},
            }]
          }
        }
      });
    }
    function getGanttData(SID,replaceConditions){
      return new Promise((resolve, reject) => {
        $.ajax({
          type: 'GET',
          url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + SID,
          success: function (msg) {
            let jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
            jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
            jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
            
            //視需求替換SQL語法
            //ex. replaceConditions = {"[EQP_NO]":'EQP-001',"[DATE]":'2024-01-01'}
            if(replaceConditions){
              for (let key in replaceConditions) {
                jsonObj.MasterSql = jsonObj.MasterSql.replaceAll(key, replaceConditions[key]);
              }
            }
    
            $.ajax({
              type: 'POST',
              url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
              data: {Charts: JSON.stringify(jsonObj.Charts),SQL: jsonObj.MasterSql,AddedSQL: jsonObj.AddedSql,Conds: JSON.stringify(jsonObj.Conditions),GridFieldType: JSON.stringify(jsonObj.GridFieldType),SID: SID,rows: 100},
              success: function (msg) {
                let jsonObj = jQuery.parseJSON(msg);
                resolve(jsonObj);
              },
              error: function (err) {
                reject(err);
              }
            });
          },
          error: function (err) {
            reject(err);
          }
        });
      });
    }
};

//生成NG輸入表單
async function LoadNgCodeV3(){
  if (reasonCodeList == null || reasonCodeList.length == 0) {
      reasonCodeList = $.parseJSON('[{"REASON_CODE":"NONE","REASON_NAME":"NONE"}]');
  }

  $('#divData').html("");

  var $divrow = document.createElement("div");
  $divrow.setAttribute("class", "row d-flex w-100 m-0");
  for (var i = 0; i < reasonCodeList.length; i++) {
      var $divReason = document.createElement("div");
      $divReason.setAttribute("class", "p-3 w-auto border d-flex flex-column align-items-center justify-content-center ml-2");
      
      var $labelName = document.createElement("h5");

      $labelName.setAttribute("style", "width:150px;overflow-wrap: break-word;text-align:center");
      $labelName.innerHTML = reasonCodeList[i].REASON_CODE + "<BR>" + reasonCodeList[i].REASON_NAME + "<BR>" + reasonCodeList[i].DESCRIPTION //中榮客製

      var $labelQty = document.createElement("input");
      $labelQty.setAttribute("type", "number");
      $labelQty.setAttribute("inputmode", "numeric");
      $labelQty.setAttribute("min", "0");
      $labelQty.setAttribute("step", "any");
      $labelQty.setAttribute("autocomplete", "off");
      $labelQty.setAttribute("id", "lb_" + reasonCodeList[i].REASON_CODE);
      $labelQty.setAttribute("class", "badge-light num-right text-center fs-5");
      $labelQty.setAttribute("style", "width:80px;");
      $labelQty.setAttribute("REASON_CODE", reasonCodeList[i].REASON_CODE);
      $labelQty.innerText = "00";

      var $divReason1 = document.createElement("div");
      $divReason1.setAttribute("class", "input-group badge badge-secondary d-flex align-items-center w-100 justify-content-center");
      $divReason1.append($labelName);

      $divReason.append($divReason1);


      var $btndiv = document.createElement("div");
      $btndiv.setAttribute("class", "btn-group");
      $btndiv.setAttribute("role", "group");
      $btndiv.setAttribute("aria-label", "Basic example");


      $btndiv.append($labelQty);

      var $button = document.createElement("a");//新增數量
      $button.setAttribute("id", reasonCodeList[i].REASON_CODE + "_plus");
      $button.setAttribute("href", "#");
      $button.setAttribute("role", "button");
      $button.setAttribute("aria-disabled", "true");
      $button.setAttribute("class", "btn btn-info btn-lg w-50");
      $button.setAttribute("style", "text-decoration:none");
      $button.setAttribute("REASON_CODE", reasonCodeList[i].REASON_CODE);
      $button.innerText = "+";
      // var REASON_CODE = reasonCodeList[i].REASON_CODE;


      $button.onclick = function () {
          ModifyReasonQty($(this), "+");
      }

      
      $btndiv.append($button);


      var $button2 = document.createElement("a");//減少數量
      $button2.setAttribute("id", reasonCodeList[i].REASON_CODE + "_min");
      $button2.setAttribute("href", "#");
      $button2.setAttribute("role", "button");
      $button2.setAttribute("aria-disabled", "true");
      $button2.setAttribute("class", "btn btn-warning btn-lg w-50");
      $button2.setAttribute("style", "text-decoration:none");
      $button2.setAttribute("REASON_CODE", reasonCodeList[i].REASON_CODE);
      $button2.innerText = "─";

      $button2.onclick = function () {
          $(this).prop('disabled', true);
          ModifyReasonQty($(this), "-");
          $(this).prop('disabled', false);
      }


      $btndiv.append($button2);
      $divReason.append($btndiv);

      $divrow.append($divReason);
      //   $divrow.append($btndiv);

      $('#divData').append($divrow);
  }

  //修改NG數量
  function ModifyReasonQty(obj, type) {
    var NG_QTY = 0;

    var lbl_REASON_CODE_QTY = $("#lb_" + obj.attr("REASON_CODE"));
    if (lbl_REASON_CODE_QTY.val().length > 0) {
        NG_QTY = parseFloat(lbl_REASON_CODE_QTY.val());
    }
    // DebugLog("NG_QTY:" + NG_QTY);
    if (type == "+") {
        NG_QTY ++;
    }
    else if(type == "-" && NG_QTY > 0) {
        NG_QTY--;
    }
    lbl_REASON_CODE_QTY.val(NG_QTY);
  }
}

//生成修改NG紀錄介面
function LoadNgEditPage(WDOEACICONG_HIST_SID,EDIT_TIME){
  $('#NGHISTModal').modal('hide');

  // 帶入歷史資料
  ngHistDetails.forEach((detail)=>{
      if(detail.NG_HIST_SID === WDOEACICONG_HIST_SID){
          detail.NG_CODE_INFOS.forEach((info)=>{
              $("#lb_" + info.NG_CODE_NO).val(info.NG_CODE_QTY);
          })
          $("#totalInputNG").val(detail.NG_TOTAL)
          $("#ng-comment").val(detail.COMMENT)
          $("#report-time").text(EDIT_TIME)
      }
  })



  $("#NGModalModalLabel").text("Edit NG record")
  $("#reportTimeWrapper").show()
  $('#NGModal').modal('show');
  
  // 將SID記錄在按鈕
  $('#saveNgBtn').attr('ng-sid',WDOEACICONG_HIST_SID)
}

async function AddNgData(){
  // 定義 API 的 URL
  let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WIPOPI_WDOEAQ_CICONG';

  let NGInfo = []
  
  for (var i = 0; i < reasonCodeList.length; i++) {
      var NGdetail = {}
      var REASON_CODE = reasonCodeList[i].REASON_CODE;
      var REASON_QTY = $("#lb_" + reasonCodeList[i].REASON_CODE).val()|0;
      NGdetail['NG_CODE_NO'] = REASON_CODE
      NGdetail['NG_CODE_QTY'] = REASON_QTY
      NGdetail['NG_CODE_COMMENT'] = "NG detail comment here..."
      NGInfo.push(NGdetail)
  }

  let conditions = {
      "CICO_SID": WIP_OPI_WDOEACICO_HIST_SID,
      "NG_TOTAL": $('#totalInputNG').val(),
      "NG_CODE_INFOS": NGInfo,
      "COMMENT": $('#ng-comment').val(),
      "EDIT_USER": username
  }

  // 构建请求头
  let headers = new Headers({
      'Content-Type': 'application/json',
      'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // 可以添加其他必要的请求头信息
  });

  // 构建请求体
  let requestBody = JSON.stringify(conditions);

  // 构建请求配置
  let requestOptions = {
      method: "POST",
      headers: headers,
      body: requestBody
  };

  try {
      // 发送请求并等待响应
      let response = await fetch(getGridURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          let data = await response.json();
          // console.log("获取Grid数据成功:", data);
          if(data.result){
              // $('#NG_QTY').text();
              $('#ng-hist-list').empty()
              SetNgHistQuery()
              $('#message-loader').hide()
              $('#success-message').attr("class","message-show")
              // 2秒後淡出提示訊息
              setTimeout(() => {
                  $('#success-message').attr("class","message-hide")
              }, 2000);
          }
          else{
              $('#message-loader').hide()
              $('#error-message').attr("class","message-show")
              // 2秒後淡出提示訊息
              setTimeout(() => {
                  $('#error-message').attr("class","message-hide")
              }, 2000);
          }
      } else {
              throw new Error('获取Grid数据失败，状态码：' + response.status);
          
      }
  } catch (error) {
      $('#message-loader').hide()
      $('#error-message').attr("class","message-show")
      // 2秒後淡出提示訊息
      setTimeout(() => {
          $('#error-message').attr("class","message-hide")
      }, 2000);
  }
}

async function EditNgData(WDOEACICONG_HIST_SID){
  // 定義 API 的 URL
  let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WIPOPI_WDOEAQ_CICONG';

  let NGInfo = []

  for (var i = 0; i < reasonCodeList.length; i++) {
      var NGdetail = {}
      var REASON_CODE = reasonCodeList[i].REASON_CODE;
      var REASON_QTY = $("#lb_" + reasonCodeList[i].REASON_CODE).val()|0;
      NGdetail['NG_CODE_NO'] = REASON_CODE
      NGdetail['NG_CODE_QTY'] = REASON_QTY
      NGdetail['NG_CODE_COMMENT'] = "NG detail comment here..."
      NGInfo.push(NGdetail)
  }

  let conditions = {
      "NG_HIST_SID": WDOEACICONG_HIST_SID,
      "NG_TOTAL": $('#totalInputNG').val(),
      "NG_CODE_INFOS": NGInfo,
      "COMMENT": $('#ng-comment').val(),
      "EDIT_USER": username
  }

  // 构建请求头
  let headers = new Headers({
      'Content-Type': 'application/json',
      'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // 可以添加其他必要的请求头信息
  });

  // 构建请求体
  let requestBody = JSON.stringify(conditions);

  // 构建请求配置
  let requestOptions = {
      method: "PUT",
      headers: headers,
      body: requestBody
  };

  try {
      // 发送请求并等待响应
      let response = await fetch(getGridURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          let data = await response.json();
          // console.log("获取Grid数据成功:", data);
          if(data.result){
              $('#ng-hist-list').empty()
              SetNgHistQuery()
              $('#message-loader').hide()
              $('#success-message').attr("class","message-show")
              // 2秒後淡出提示訊息
              setTimeout(() => {
                  $('#success-message').attr("class","message-hide")
              }, 2000);
          }
          else{
              $('#message-loader').hide()
              $('#error-message').attr("class","message-show")
              // 2秒後淡出提示訊息
              setTimeout(() => {
                  $('#error-message').attr("class","message-hide")
              }, 2000);
          }
      } else {
              throw new Error('获取Grid数据失败，状态码：' + response.status);
          
      }
  } catch (error) {
      $('#message-loader').hide()
      $('#error-message').attr("class","message-show")
      // 2秒後淡出提示訊息
      setTimeout(() => {
          $('#error-message').attr("class","message-hide")
      }, 2000);
  }
}
async function DeleteNgData(WDOEACICONG_HIST_SID){
  var r = confirm("Are you sure you want to delete the record?");
  if (r == true) {
      x = "您按了确认！";
      // 定義 API 的 URL
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WIPOPI_WDOEAQ_CICONG';
      let conditions = {
          "NG_HIST_SID": WDOEACICONG_HIST_SID,
          "EDIT_USER": username
      }

      // 构建请求头
      let headers = new Headers({
          'Content-Type': 'application/json',
          'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
          // 可以添加其他必要的请求头信息
      });

      // 构建请求体
      let requestBody = JSON.stringify(conditions);

      // 构建请求配置
      let requestOptions = {
          method: "DELETE",
          headers: headers,
          body: requestBody
      };

      try {
          // 发送请求并等待响应
          let response = await fetch(getGridURL, requestOptions);

          if (response.ok) {
              // 解析响应为 JSON
              let data = await response.json();
              // console.log("获取Grid数据成功:", data);
              if(data.result){
                  $('#ng-hist-list').empty()
                  SetNgHistQuery()
              }
              else{
              }
          } else {
                  throw new Error('获取Grid数据失败，状态码：' + response.status);
              
          }
      } catch (error) {
          $('#message-loader').hide()
          $('#error-message').attr("class","message-show")
          // 2秒後淡出提示訊息
          setTimeout(() => {
              $('#error-message').attr("class","message-hide")
          }, 2000);
      }
  }
}


async function SetNgHistQuery(){
  [ngHist,ngHistDetails] = await GetNgHist(WIP_OPI_WDOEACICO_HIST_SID);
  let sumNgQty = 0, summaryStr = '', rowHtml = '';
  
  if(ngHist.length>0){
      $('#EditNGBtn').attr('disabled', false)
      for(let i= 0; i < ngHist.length; i++){
          //加總NG數量
          sumNgQty += parseInt(ngHist[i].NG_QTY);
          //明細摘要
          summaryStr = ''
          ngHistDetails[i].NG_CODE_INFOS.forEach((info)=>{
              if(info.NG_CODE_QTY != 0){
                  summaryStr += info.NG_CODE_NO + ":" + info.NG_CODE_QTY + ','
              }
          })
          summaryStr = summaryStr.slice(0, -1);
          //組出rowData
          rowHtml = `
              <tr style="vertical-align: middle" class="border-bottom">
                  <th scope="row">${ngHist[i].WDOEACICONG_HIST_SID}</th>
                  <td>${ngHist[i].EDIT_TIME}</td>
                  <td>${ngHist[i].NG_QTY}</td>
                  <td class="summary">${summaryStr}</td>
                  <td>${ngHist[i].COMMENT}</td>
                  <td>
                      <button class="btn btn-warning" onclick="LoadNgEditPage('${ngHist[i].WDOEACICONG_HIST_SID}','${ngHist[i].EDIT_TIME}')">EDIT</button>
                      <button class="btn btn-danger" onclick="DeleteNgData('${ngHist[i].WDOEACICONG_HIST_SID}')">DEL</button>
                  </td>
              </tr>
          `
          $('#ng-hist-list').append(rowHtml)
      }
  }else{
      $('#EditNGBtn').attr('disabled', true)
  }
  $('#NG_QTY').text(sumNgQty)
  
  async function GetNgHist(WIP_OPI_WDOEACICO_HIST_SID){
    if(WIP_OPI_WDOEACICO_HIST_SID == null) return
    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';

    let params = {
        SID: '350839039710091', //WIP_OPI_WDOEACICONG_HIST
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
    };

    let conditions = {
        Field: ["WIP_OPI_WDOEACICO_HIST_SID"],
        Oper: ["="],
        Value: [WIP_OPI_WDOEACICO_HIST_SID]
    };

    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
    });

    let requestBody = JSON.stringify(conditions);

    let requestOptions = {
        method: 'POST',
        headers: headers,
        body: requestBody
    };

    try {
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            let data = await response.json();
            if(data.result){
                let master = data.Grid_Data.filter(e => e.ENABLE_FLAG === 'Y');
                let details = [];
                for (let i in master) {
                    let detail = await GetNgHistDetail(master[i].WDOEACICONG_HIST_SID);
                    details.push(detail[0]);
                }
                return [master,details]; // 返回详情列表
                // return data;
            }
            else{
                Set_Clean();
            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);
        }
    } catch (error) {
        console.error(error);
    }
  }
  async function GetNgHistDetail(NG_HIST_ID){
    // 定義 API 的 URL
    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WIPOPI_WDOEAQ_CICONG?NG_HIST_ID='+NG_HIST_ID;

    // 构建请求头
    let headers = new Headers({
        // 'Content-Type': 'application/json',
        // 'TokenKey': "WEYU54226552"
        'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
    });


    // 构建请求配置
    let requestOptions = {
        method: "GET",
        headers: headers,
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let responseData = await response.json();
            let parseData = JSON.parse(responseData)

            // console.log("获取Grid数据成功:", data);
            if(parseData.result){
                let DataArrays = [];
                for(let i=0; i<parseData.DataArrays.length; i++){
                    DataArrays.push(JSON.parse(parseData.DataArrays[i]))
                }
                return DataArrays
            }
            else{

            }
        } else {
                throw new Error('获取Grid数据失败，状态码：' + response.status);
            
        }
    } catch (error) {
        console.log("GetNgHistDetail Fail")
    }
  }
}

function CleanNgPage(){
  for (var i = 0; i < reasonCodeList.length; i++) {
      $("#lb_" + reasonCodeList[i].REASON_CODE).val('');
  }
  $("#totalInputNG").val("0")
  $('#ng-comment').val("")
  $("#saveNgBtn").removeAttr("ng-sid")
  $("#NGModalModalLabel").text("NG Input")
  $("#reportTimeWrapper").hide()
}


//出站按鈕
$('#checkOutBtn').click(async function(){
    let OK_QTY = $("#OUTPUT").val()
    let NG_QTY = $("#NG_QTY").text()
    let CHECK_IN_TIME = $("#CHECK_IN_TIME").text()
    let CHECK_OUT_TIME = $("#CHECK_OUT_TIME").data('value')
    let COMMENT = $("#Remark").val()
    // step1. 检查資料是否可用
    // 沒選時間
    if(!CHECK_OUT_TIME){
      customAlertWarning('Please select a check-out time!')
      return
    }
    // 所選時間小於進站時間
    if(new Date(CHECK_OUT_TIME) < new Date(CHECK_IN_TIME)){
      customAlertWarning('The check-out time cannot be earlier than the check-in time.')
      return
    }
    
    // step2. 檢查通過, 用戶確認是否繼續
    let yes = await customConfirm('Are you sure you want to check out?')
    if(yes){
      checkOut()
    }
    async function checkOut(){
      // 定义 GetGrid API 的 URL
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WIPOPI_WDOEAQ_CICO';
    
      // 定义要传递的参数对象
      let params = {
          TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
          // TokenKey: '54226552'
      };
  
      // 定义查詢条件参数对象
      let conditions = {
          "HIST_SID": WIP_OPI_WDOEACICO_HIST_SID,
          "CO_TIME": CHECK_OUT_TIME,
          "OK_QTY": OK_QTY,
          "NG_QTY": NG_QTY,
          "COMMENT": COMMENT,
          "EDIT_USER": username,
      }
      
      // 构建请求头
      let headers = new Headers({
          'Content-Type': 'application/json',
          'TokenKey': params.TokenKey
          // 可以添加其他必要的请求头信息
      });
  
      // 构建请求体
      let requestBody = JSON.stringify(conditions);
  
      // 构建请求配置
      let requestOptions = {
          method: 'PUT', // 将请求方法设置为 "PUT"
          headers: headers,
          body: requestBody // 将条件参数放入请求体
      };
  
      try {
          // 发送请求并等待响应
          let response = await fetch(getGridURL, requestOptions);
  
          if (response.ok) {
              // 解析响应为 JSON
              let data = await response.json();
              if(data.result){
                  await customAlertSuccess('Check-Out success!')
                  window.location.href = window.location.protocol+'//' + default_ip + '/' + PROJECT_NAME+"/"+kanbanRoute + '/MES-WIP/setup/wip-query.html?SID=347301502426686&MODULE_NAME='+DEPT_NO+'&BUTTON=A&LEVEL=L2&BUTTON=A&DEPT_NO=' + DEPT_NO
              }
              else{
                  await customAlertError(data.Msg)
              }
          } else {
              await customAlertError('Check-Out Time Duplicate with other data!')
          }
          throw new Error('获取Grid数据失败，状态码：' + response.status);

      } catch (error) {
        customAlertError(error)
      }
    }
})

//取消進站按鈕
$('#checkCancelBtn').click(async function(){
    // step1. 用戶確認是否繼續
    let yes = await customConfirm('Are you sure you want to cancel this record?')
    if(yes){
        checkInCancel()
    }
    async function checkInCancel(){
      // 定义 GetGrid API 的 URL
      let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/WIPOPI_WDOEAQ_CICO';
    
      // 定义要传递的参数对象
      let params = {
          TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
          // TokenKey: '54226552'
      };
  
      // 定义查詢条件参数对象
      let conditions = {
          "HIST_SID": WIP_OPI_WDOEACICO_HIST_SID,
          "EDIT_USER":username,
      }
  

      // 构建请求头
      let headers = new Headers({
          'Content-Type': 'application/json',
          'TokenKey': params.TokenKey
          // 可以添加其他必要的请求头信息
      });
  
      // 构建请求体
      let requestBody = JSON.stringify(conditions);
  
      // 构建请求配置
      let requestOptions = {
          method: 'DELETE', // 将请求方法设置为 "DELETE"
          headers: headers,
          body: requestBody // 将条件参数放入请求体
      };
  
      try {
          // 发送请求并等待响应
          let response = await fetch(getGridURL, requestOptions);
  
          if (response.ok) {
              // 解析响应为 JSON
              let data = await response.json();
              if(data.result){``
                  await customAlertSuccess('Record successfully canceled!')

                  window.location.href = window.location.protocol+'//' + default_ip + '/' + PROJECT_NAME +"/"+kanbanRoute+ '/MES-WIP/setup/wip-query.html?SID=347301502426686&MODULE_NAME='+DEPT_NO+'&BUTTON=A&LEVEL=L2&BUTTON=A&DEPT_NO=' + DEPT_NO
              }
              else{
                  await customAlertError(data.Msg)
              }
          } else {
              await customAlertError(data.Msg)
          }
          throw new Error('获取Grid数据失败，状态码：' + response.status);

      } catch (error) {
          await customAlertError(error)
      }
    }
})