let userListSID = '336930288980536' // SEC_USER
let userList;
let woListSID = '336928104643488' // V_WO_PARTNO_RELATION
let woList;
let eqpListSID = '349540422190761' // EQP綁定中WO
let eqpList;
let ganttDataSID = '358003490890214' // GET_WIP_OPI_WDOEACICO_HIST_KANBAN_GANTT

//URL取參數
const urlParams = new URLSearchParams(window.location.search);
const DEPT_NO = urlParams.get('DEPT_NO');
$("#DEPARTMENT").text(DEPT_NO)
//返回紐
$('#backButton').click(function () {
  window.location.href = window.location.protocol + '//' + default_ip + '/' + PROJECT_NAME + "/" + kanbanRoute + '/MES-WIP/setup/wip-query.html?SID=347301502426686&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&DEPT_NO=' + DEPT_NO
})
//取得撈資料用時間
let currentDay = (new Date()).toLocaleString('en-CA', { hour12: false }).split(',')[0] // ex. 2024-01-01
let currentTime = (new Date()).toLocaleString('en-CA', { hour12: false }).split(' ')[1].padStart(8, "00000000"); // ex. 23:59:59
let shift_start_end = '00:00:00' // 開始&結束時間
$("#selectDate").val(currentDay).attr("max", currentDay) //不可選未來的日期
$("#selectTime").val(currentTime.slice(0, 5))

$(document).ready(async function () {
  await initChartConfig();
  userList = (await getGridData(userListSID)).Grid_Data;
  woList = (await getGridData(woListSID)).Grid_Data.filter((e) => e.WC_TYPE === DEPT_NO);
  eqpList = (await getGridData(eqpListSID)).Grid_Data.filter((e) => e.EQP_TYPE === DEPT_NO && !e.WO);
  $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

  //解鎖按鈕
  $("#EQP_NO").change(() => $("#CHECK_IN_TIME").removeAttr('disabled'));

  //選單式選項
  $("#ACCOUNT_NO_1, #ACCOUNT_NO_2").click(function () {
    displayOptions($(this), userList)
    $("#woMaintainLink").hide()
  });
  $("#WO").click(function () {
    displayOptions($(this), woList)
    $("#woMaintainLink").show()
  });
  $("#EQP_NO").click(function () {
    displayOptions($(this), eqpList)
    $("#woMaintainLink").hide()
  });

  //時間選擇視窗
  $("#selectDate, #selectTime").click(function () {
    this.showPicker()
  });
  $("#selectDate").change(() => GetCICOGantt());
  $("#CHECK_IN_TIME").click(function () {
    GetCICOGantt()
    $("#timeModal").modal('show')
  });
  $("#saveTime").click(() => {
    let _datetime = $("#selectDate").val() + " " + $("#selectTime").val()
    $("#CHECK_IN_TIME").text(_datetime).data('value', _datetime)
    $("#timeModal").modal('hide')
  });
});
function displayOptions(inputBtn, data) {
  let options = formatOptionObj()
  let temp = ''
  for (let opt of options) {
    temp += `
            <button class="option-item btn btn-outline-secondary" data-title="${opt.title}" data-description="${opt.description}" data-value="${opt.value}">
                ${opt.title}<br>
                <span>${opt.description}</span>
            </button>
        `
  }
  $(".option-content").html(temp)
  $("#keyword").val('')
  $("#optionModal").modal('show')

  $(".option-item").click(function () {
    //客製判斷
    if (inputBtn.attr('id') === 'WO') {
      $("#WO").text($(this).data("title").split('(')[0])
      $("#WC").text($(this).data("title").split('(')[1].replace(')', ''))
      $("#WO").data('value', $(this).data("value").split(',')[0])
      $("#PART_NO").text($(this).data("value").split(',')[1])
      $("#ERP_QTY").text($(this).data("value").split(',')[2])
      $("#optionModal").modal('hide')
      return
    }
    if (inputBtn.attr('id') === 'EQP_NO') {
      $("#EQPNAME").text($(this).data("description"))
    }

    //預設
    inputBtn.text($(this).data("title"))
    inputBtn.data('value', $(this).data("value"))
    inputBtn.trigger('change')
    $("#optionModal").modal('hide')
  })
  //搜尋
  $("#keyword").on('keyup', function () {
    var filter = $('#keyword').val().toUpperCase();
    $('.option-item').each(function () {
      var button = $(this);
      if (button.text().toUpperCase().indexOf(filter) > -1) { //符合條件
        button.show()
      } else {
        button.hide()
      }
    });
  })
  function formatOptionObj() {
    let result = {};
    //這裡維護 各自要顯示跟實際儲存的欄位
    switch (inputBtn.attr('id')) {
      case "ACCOUNT_NO_1":
      case "ACCOUNT_NO_2":
        result = data.map((e) => ({
          "title": e.USER_NAME,
          "description": e.ACCOUNT_NO,
          "value": e.ACCOUNT_NO //實際要用的值
        }));
        break;
      case "WO":
        result = data.map((e) => ({
          "title": e.WO + '(' + e.WC + ')',
          "description": e.PART_SPEC,
          "value": e.WO + ',' + e.PART_SPEC + ',' + e.ERP_QTY //實際要用的值
        }));
        break;
      case "EQP_NO":
        result = data.map((e) => ({
          "title": e.EQP_NO,
          "description": e.EQP_NAME,
          "value": e.EQP_NO //實際要用的值
        }));
        break;
    }
    return result
  }
}
function GetCICOGantt() {
  let woHints = [] //儲存甘特圖HINT資訊
  let EQP_NO = $("#EQP_NO").data("value")
  let SHIFT_DAY = $("#selectDate").val()
  let next_shift_day = new Date(new Date(SHIFT_DAY).setDate(new Date(SHIFT_DAY).getDate() + 1)).toISOString().slice(0, 10);

  let startTime, endtime;
  if (currentDay == SHIFT_DAY) { //當天
    startTime = currentDay + ' ' + shift_start_end;
    endtime = currentDay + ' ' + currentTime
  } else { //歷史
    startTime = SHIFT_DAY + ' ' + shift_start_end;
    endtime = next_shift_day + ' ' + shift_start_end;
  }
  drawChart()
  async function drawChart() {
    let condition = {
      "[EQP_NO]": EQP_NO,
      "[S_TIME]": startTime,
      "[E_TIME]": endtime
    }
    let GanttData = await getGanttData(ganttDataSID, condition)
    if (window.GanttChart && window.GanttChart !== null) {
      window.GanttChart.destroy;
    }

    $('#ganttWrapper').empty();
    $('#ganttWrapper').append('<canvas id="ganttChart"><canvas>');

    let dataWrapper = [];
    let endObj;
    let dataObj;
    let gapObj;
    let previousEnd = '';

    for (i = 0; i < GanttData.rows.length; i++) {
      let start = GanttData.rows[i].CHECK_IN_TIME;
      let end = GanttData.rows[i].CHECK_OUT_TIME;
      let wo = GanttData.rows[i].WO;
      let USER_NAME = GanttData.rows[i].USER_NAME;
      let dataType = GanttData.rows[i].OEE_TYPE.toUpperCase();
      let bgColor = GanttData.rows[i].BG_COLOR;
      //startTime,endtime => 班別的時間(08:00-08:00)
      //start,end => 工單綁定的時間
      if (previousEnd !== '' && start != previousEnd) {
        gapObj = { x: { from: new Date(previousEnd.replaceAll('-', '/')), to: new Date(start.replaceAll('-', '/')) }, y: 1, backgroundColor: 'grey' };
        dataWrapper.push(gapObj);
        woHints.push('N/A')
      }

      switch (dataType) {
        case 'RUN':
        case 'UNFINISHED':
          dataObj = { x: { from: new Date(start.replaceAll('-', '/')), to: new Date(end.replaceAll('-', '/')) }, y: 1, backgroundColor: bgColor };
          dataWrapper.push(dataObj);
          woHints.push(wo + ' / ' + USER_NAME);
          previousEnd = end
          break;
        case 'IDLE':
          dataObj = { x: { from: new Date(start.replaceAll('-', '/')), to: new Date(end.replaceAll('-', '/')) }, y: 1, backgroundColor: bgColor };
          dataWrapper.push(dataObj);
          woHints.push('N/A');
          previousEnd = end
          break;
      }

      //最後一筆
      if (i === GanttData.rows.length - 1 && currentDay == SHIFT_DAY) {
        let undefinedEndTime = next_shift_day + ' ' + shift_start_end;
        endObj = { x: { from: new Date(previousEnd.replaceAll('-', '/')), to: new Date(undefinedEndTime.replaceAll('-', '/')) }, y: 1, backgroundColor: 'transparent' };
        dataWrapper.push(endObj);
        woHints.push('N/A')
      }
    };

    //若無工單紀錄
    if (dataWrapper.length === 0) {
      if (currentDay == SHIFT_DAY) {
        let fromTime = new Date(currentDay + ' ' + shift_start_end)
        let toTime = new Date(year + '/' + month + '/' + (date + 1) + ' ' + shift_start_end)
        dataObj = { x: { from: fromTime, to: new Date(time) }, y: 1, backgroundColor: 'grey' };
        dataWrapper.push(dataObj);
        woHints.push('N/A')
        dataObj = { x: { from: new Date(time), to: toTime }, y: 1, backgroundColor: 'transparent' };
        dataWrapper.push(dataObj);
        woHints.push('N/A')
      } else {
        dataWrapper = [
          {
            "x": {
              "from": new Date(startTime),
              "to": new Date(endtime)
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
          backgroundColor: 'transparent',
          displayColors: false,
          enabled: true,
          yAlign: 'center',
          xAlign: 'center',
          callbacks: {
            title: function () {
              return ''; // 否则返回标题
            },
            label: function (item) {
              if (woHints[item.index] == 'N/A') {
                return ''; // 如果符合条件，则返回空字符串，禁用标题
              }
              return woHints[item.index].split(' / ')
            }
          }
        },
        legend: {
          display: false
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            ticks: { padding: 0 },
            scaleLabel: { display: true },
            type: "time-gantt",
            position: "bottom",
            time: {
              displayFormats: {
                hour: "HH:mm",
              },
            }
          }],
          yAxes: [{
            gridLines: { color: 'transparent' },
            ticks: { beginAtZero: true, min: 0, display: false },
            scaleLabel: { display: true, labelString: 'WO' },
          }]
        }
      }
    });
  }
  function getGanttData(SID, replaceConditions) {
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
          if (replaceConditions) {
            for (let key in replaceConditions) {
              jsonObj.MasterSql = jsonObj.MasterSql.replaceAll(key, replaceConditions[key]);
            }
          }

          $.ajax({
            type: 'POST',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
            data: { Charts: JSON.stringify(jsonObj.Charts), SQL: jsonObj.MasterSql, AddedSQL: jsonObj.AddedSql, Conds: JSON.stringify(jsonObj.Conditions), GridFieldType: JSON.stringify(jsonObj.GridFieldType), SID: SID, rows: 100 },
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

//進站按鈕
$('#checkInBtn').click(async function () {
  let ACCOUNT_NO_1 = $("#ACCOUNT_NO_1").data('value')
  let ACCOUNT_NO_2 = $("#ACCOUNT_NO_2").data('value')
  let EQP_NO = $("#EQP_NO").data('value')
  let WO = $("#WO").data('value')
  let CHECK_IN_TIME = $("#CHECK_IN_TIME").data('value')
  // step1. 检查資料是否可用
  // 沒選用戶
  if (!ACCOUNT_NO_1 && !ACCOUNT_NO_2) {
    customAlertWarning('Please select a user!')
    return
  }
  // 用戶重複
  if (ACCOUNT_NO_1 && ACCOUNT_NO_2 && ACCOUNT_NO_1 === ACCOUNT_NO_2) {
    customAlertWarning('Duplicate user!')
    return
  }
  // 沒選機台
  if (!EQP_NO) {
    customAlertWarning('Please select an equipment!')
    return
  }
  // 沒選工單
  if (!WO) {
    customAlertWarning('Please select a work-order!')
    return
  }
  // 沒選時間
  if (!CHECK_IN_TIME) {
    customAlertWarning('Please select a check-in time!')
    return
  }
  // step2. 檢查通過, 用戶確認是否繼續
  let yes = await customConfirm('Are you sure you want to check in?')
  if (yes) {
    checkIn()
  }
  async function checkIn() {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/WIPOPI_WDOEAQ_CICO';

    // 定义要传递的参数对象
    let params = {
      TokenKey: localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
    };

    // 組ACCOUNT_NO欄位字串 & 判斷報工人數
    let ACCOUNT_ID, NUM_OF_ACC;
    if (ACCOUNT_NO_1 && ACCOUNT_NO_2) {
      ACCOUNT_ID = ACCOUNT_NO_1 + ',' + ACCOUNT_NO_2
      NUM_OF_ACC = 2
    }
    if (ACCOUNT_NO_1 && !ACCOUNT_NO_2) {
      ACCOUNT_ID = ACCOUNT_NO_1
      NUM_OF_ACC = 1
    }
    if (!ACCOUNT_NO_1 && ACCOUNT_NO_2) {
      ACCOUNT_ID = ACCOUNT_NO_2
      NUM_OF_ACC = 1
    }
    // 定义查詢条件参数对象
    let conditions = {
      "WO_ID": WO,
      "DEP_ID": $("#DEPARTMENT").text(),
      "OPE_ID": $("#WC").text(),
      "EQP_ID": EQP_NO,
      "ACCOUNT_ID": ACCOUNT_ID,
      "NUM_OF_ACC": NUM_OF_ACC,
      "CI_TIME": CHECK_IN_TIME,
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
        if (data.result) {
          await customAlertSuccess('Check-In success!')
          window.location.href = window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME + "/" + kanbanRoute + '/MES-WIP/OPI/checkout/wo-check-out.html?' + "DEPT_NO=" + DEPT_NO + "&WIP_OPI_WDOEACICO_HIST_SID=" + data.SID
        }
        else {
          customAlertError(data.Msg)
        }
      } else {
        customAlertError('Check-In Time already exists other!')
      }
      throw new Error('获取Grid数据失败，状态码：' + response.status);

    } catch (error) {
      customAlertError('Check-In Time already exists other!')
    }
  }
})