// url取參
const urlParams = new URLSearchParams(window.location.search);
const EQP_TYPE = urlParams.get('EQP_TYPE');
const EQP_NO = urlParams.get('EQP_NO');
const SHIFT_DAY = urlParams.get('SHIFT_DAY');
$('#date').val(SHIFT_DAY)
$("#data_show").text(SHIFT_DAY.replaceAll('-','/')).click(function(){
  $('#date')[0].showPicker();
})
// 用到的SID
const sidMapping = {
  EQPListSid: '348937168590495', //EQP下拉清單選項
  OEEStandardSid: '350057276290452', //OEE標準&對應顏色
  statusLegendColorSid: '238864537250988', //機況甘特圖例顏色
  IOTCounterSid: '358706730326253', //IOT開合次數
  outputSid: '357998862096973', //柱狀圖
  EQPGanttSid: '305991215183875', //機況甘特圖
  CICOGanttSid: '358003490890214', //進出站甘特圖
  CICOTableSid: '358008238060773', //進出站table
  EQPInfoSid: EQP_TYPE == 'DC' ? '349107999670934' : EQP_TYPE == 'CNC' ? '350762135420309' : ''
}

// 決定開始&結束時間
const shift_start_end = '08:00:00'
// 資料刷新間隔(秒)
const RefreshTime = 180;

// 事先宣告
let woHints=[] //20240514更新 儲存甘特圖HINT資訊
let DataSet = []
let Standards = {};
let OEE_Parameters = {}

//取得撈資料用時間
const currentDay = (new Date()).toLocaleString('en-CA').split(',')[0] // ex. 2024-01-01
const currentTime = (new Date()).toLocaleString('en-CA').split(' ')[1] // ex. 23:59:59
const next_shift_day = new Date(new Date(SHIFT_DAY).setDate(new Date(SHIFT_DAY).getDate() + 1)).toISOString().slice(0, 10);

let startTime, endtime;
if(currentDay == SHIFT_DAY){ //當天
  startTime = currentDay + ' ' + shift_start_end;
  endtime = currentDay + ' ' + currentTime
}else{ //歷史
  startTime = SHIFT_DAY + ' ' + shift_start_end;
  endtime = next_shift_day + ' ' + shift_start_end;
}

//限制日期選擇不可大於今日
$("#date").attr("max",currentDay)
//加入選項觸發
$('#date').change(function(){
  location.href = location.href.split('?')[0] + `?EQP_TYPE=${EQP_TYPE}&EQP_NO=${EQP_NO}&SHIFT_DAY=${$(this).val()}`;
})
$('#EQPList').change(()=>{
  location.href = location.href.split('?')[0] + `?EQP_TYPE=${EQP_TYPE}&EQP_NO=${$('#EQPList').val()}&SHIFT_DAY=${SHIFT_DAY}`;
})

//頁面加載完後 開始繪製圖表
$(document).ready(async function(){
  //順序不可改
  await initChartConfig();
  await GetOEEStandard();
  await GetEQPInfo();
  await GetEQPOutPut ();
  await GetEQPList();
  await printcolors();
  await GetIOTCounter();
  await LoadhorizontalBarChart();
  await GetEQPGantt();
  await GetCICOGantt();
  await GetCICOTable();

  await setRefreshTimmer();

  // $("th").addClass("Lang").addClass("text-nowrap");
  // ChangeLang();
});

// ========================================  EQP下拉清單選項   ==============================================================================================//
async function GetEQPList(){
  //替換SQL
  let condition = {
    '{CON}':`EQP_TYPE='${EQP_TYPE}' AND {CON}`
  }
  let EQPListData= await getData(sidMapping.EQPListSid,condition)

  let EQPOptions = ''
  if(EQPListData.rows.length>0){
    EQPListData.rows.forEach(e=>{
      EQPOptions += `<option value="${e.EQP_NO}">${e.EQP_NO}</option>`
    })
  }
  $('#EQPList').html(EQPOptions)
  $('#EQPList').val(EQP_NO);
}
// ========================================  OEE標準&對應顏色   ==============================================================================================//
async function GetOEEStandard(){
    let OEEStandardData = await getData(sidMapping.OEEStandardSid)

    for(let i=0; i<OEEStandardData.rows.length; i++){
      Standards[OEEStandardData.rows[i].FACTOR_NAME]={
        'HIGH_STANDARD':parseFloat(OEEStandardData.rows[i].HIGH_STANDARD),
        'LOW_STANDARD':parseFloat(OEEStandardData.rows[i].LOW_STANDARD),
        'HIGH_STANDARD_COLOR':OEEStandardData.rows[i].HIGH_STANDARD_COLOR,
        'MID_STANDARD_COLOR':OEEStandardData.rows[i].MID_STANDARD_COLOR,
        'LOW_STANDARD_COLOR':OEEStandardData.rows[i].LOW_STANDARD_COLOR,
        'COMMENT':OEEStandardData.rows[i].COMMENT
      }
    }
}
// ========================================   最上層 4格資料   ==============================================================================================//
async function GetEQPInfo(){
  //替換SQL
  let condition = {
    '{CON}': `EQP_NO='${EQP_NO}' AND SHIFT_DAY='${SHIFT_DAY}' AND {CON}`
  }
  let EQPInfoData2 = await getData(sidMapping.EQPInfoSid,condition);

  if(EQPInfoData2.rows.length>0){
      // 塞資料
      let OUTPUT_DAY = EQPInfoData2.rows[0].OUTPUT_DAY == '' ? 'N/A' : EQPInfoData2.rows[0].OUTPUT_DAY.split('.')[0]
      let KEYIN_OUTPUT_DAY = EQPInfoData2.rows[0].KEYIN_OUTPUT_DAY == '' ? 'N/A' : EQPInfoData2.rows[0].KEYIN_OUTPUT_DAY
      let KEYIN_NG_DAY = EQPInfoData2.rows[0].KEYIN_NG_DAY == '' ? 'N/A' : EQPInfoData2.rows[0].KEYIN_NG_DAY
      let OUTPUT_NIGHT = EQPInfoData2.rows[0].OUTPUT_NIGHT == '' ? 'N/A' : EQPInfoData2.rows[0].OUTPUT_NIGHT.split('.')[0] ;
      let KEYIN_OUTPUT_NIGHT = EQPInfoData2.rows[0].KEYIN_OUTPUT_NIGHT == '' ? 'N/A' : EQPInfoData2.rows[0].KEYIN_OUTPUT_NIGHT  ;
      let KEYIN_NG_NIGHT = EQPInfoData2.rows[0].KEYIN_NG_NIGHT == '' ? 'N/A' : EQPInfoData2.rows[0].KEYIN_NG_NIGHT  ;
      let OUTPUT_TOTAL = Number(OUTPUT_DAY) + Number(OUTPUT_NIGHT)
      let KEYIN_OUTPUT_TOTAL = Number(KEYIN_OUTPUT_DAY) + Number(KEYIN_OUTPUT_NIGHT)
      let KEYIN_NG_TOTAL = Number(KEYIN_NG_DAY) + Number(KEYIN_NG_NIGHT)

      // 橫條圖用Data
      OEE_Parameters['OEE'] = EQPInfoData2.rows[0].TOTAL_OEE
      OEE_Parameters['AVAILABILITY'] = EQPInfoData2.rows[0].TOTAL_ACTIVATION
      OEE_Parameters['PERFORMANCE'] = EQPInfoData2.rows[0].TOTAL_LOSSES
      OEE_Parameters['YIELD'] = EQPInfoData2.rows[0].TOTAL_YIELD
      
      $('#titleA').html(`Day shift production`);
      $('#OUTPUT_DAY').html(`${OUTPUT_DAY}`);
      // $('#COUNTER_DAY').html(`${(KEYIN_OUTPUT_DAY / OUTPUT_DAY * 100).toFixed(1)|0}%`);
      $('#LOSS_DAY').html(`${OUTPUT_DAY - KEYIN_OUTPUT_DAY}`);
      $('#KEYIN_OUTPUT_DAY').html(`${KEYIN_OUTPUT_DAY}`);
      $('#KEYIN_YIELD_DAY').html(`${(parseFloat(KEYIN_OUTPUT_DAY) / (parseFloat(KEYIN_OUTPUT_DAY) + parseFloat(KEYIN_NG_DAY)) * 100).toFixed(1)|0}%`);
      $('#KEYIN_NG_DAY').html(`${KEYIN_NG_DAY}`);

      
      $('#titleB').html(`Night shift production`);
      $('#OUTPUT_NIGHT').html(`${OUTPUT_NIGHT}`);
      // $('#COUNTER_NIGHT').html(`${(KEYIN_OUTPUT_NIGHT / OUTPUT_NIGHT * 100).toFixed(1)|0}%`);
      $('#LOSS_NIGHT').html(`${OUTPUT_NIGHT - KEYIN_OUTPUT_NIGHT}`);
      $('#KEYIN_OUTPUT_NIGHT').html(`${KEYIN_OUTPUT_NIGHT}`);
      $('#KEYIN_YIELD_NIGHT').html(`${(parseFloat(KEYIN_OUTPUT_NIGHT) / (parseFloat(KEYIN_OUTPUT_NIGHT) + parseFloat(KEYIN_NG_NIGHT)) * 100).toFixed(1)|0}%`);
      $('#KEYIN_NG_NIGHT').html(`${KEYIN_NG_NIGHT}`);

      $('#titleC').html(`Total production`);
      $('#OUTPUT_TOTAL').html(`${OUTPUT_TOTAL}`);
      // $('#COUNTER_TOTAL').html(`${(KEYIN_OUTPUT_TOTAL / OUTPUT_TOTAL * 100).toFixed(1)|0}%`);
      $('#LOSS_TOTAL').html(`${OUTPUT_TOTAL - KEYIN_OUTPUT_TOTAL}`);
      $('#KEYIN_OUTPUT_TOTAL').html(`${KEYIN_OUTPUT_TOTAL}`);
      $('#KEYIN_YIELD_TOTAL').html(`${(parseFloat(KEYIN_OUTPUT_TOTAL) / (parseFloat(KEYIN_OUTPUT_TOTAL) + parseFloat(KEYIN_NG_TOTAL)) * 100).toFixed(1)|0}%`);
      $('#KEYIN_NG_TOTAL').html(`${KEYIN_NG_TOTAL}`);

      $('#titleD').html('Overall Equipment Effectiveness')
      $('#totalOEE').html(OEE_Parameters['OEE']+'<span style="font-size:1.5rem">%</span>');

      //根據達成率改變文字顏色，維護主檔 => BAS_OEE_FACTOR
      $('#KEYIN_YIELD_DAY').css('color', parseFloat($('#KEYIN_YIELD_DAY').text().replace('%','')) < Standards.YIELD.LOW_STANDARD ? Standards.YIELD.LOW_STANDARD_COLOR : $('#KEYIN_YIELD_DAY').text().replace('%','') < Standards.YIELD.HIGH_STANDARD ? Standards.YIELD.MID_STANDARD_COLOR : Standards.YIELD.HIGH_STANDARD_COLOR);
      $('#KEYIN_YIELD_NIGHT').css('color', parseFloat($('#KEYIN_YIELD_NIGHT').text().replace('%','')) < Standards.YIELD.LOW_STANDARD ? Standards.YIELD.LOW_STANDARD_COLOR : $('#KEYIN_YIELD_NIGHT').text().replace('%','') < Standards.YIELD.HIGH_STANDARD ? Standards.YIELD.MID_STANDARD_COLOR : Standards.YIELD.HIGH_STANDARD_COLOR);
      $('#KEYIN_YIELD_TOTAL').css('color', parseFloat($('#KEYIN_YIELD_TOTAL').text().replace('%','')) < Standards.YIELD.LOW_STANDARD ? Standards.YIELD.LOW_STANDARD_COLOR : $('#KEYIN_YIELD_TOTAL').text().replace('%','') < Standards.YIELD.HIGH_STANDARD ? Standards.YIELD.MID_STANDARD_COLOR : Standards.YIELD.HIGH_STANDARD_COLOR);
      $('#totalOEE').css('color', parseFloat($('#totalOEE').text().replace('%','')) < Standards.OEE.LOW_STANDARD ? Standards.OEE.LOW_STANDARD_COLOR : $('#totalOEE').text().replace('%','') < Standards.OEE.HIGH_STANDARD ? Standards.OEE.MID_STANDARD_COLOR : Standards.OEE.HIGH_STANDARD_COLOR);
      $('#high-square').css('color',Standards.OEE.HIGH_STANDARD_COLOR)
      $('#mid-square').css('color',Standards.OEE.MID_STANDARD_COLOR)
      $('#low-square').css('color',Standards.OEE.LOW_STANDARD_COLOR)
      $('#high-standard').text(Standards.OEE.HIGH_STANDARD)
      $('#mid-standard').text(Standards.OEE.LOW_STANDARD + '-' + Standards.OEE.HIGH_STANDARD)
      $('#low-standard').text(Standards.OEE.LOW_STANDARD)

  }
  else{
      $('#titleA').html('Day shift production');
      $('#OUTPUT_DAY').html('N/A');
      $('#COUNTER_DAY').html('N/A');
      $('#LOSS_DAY').html('N/A');
      $('#KEYIN_OUTPUT_DAY').html('N/A');
      $('#KEYIN_YIELD_DAY').html('N/A');
      $('#KEYIN_NG_DAY').html('N/A');

      $('#titleB').html('Night shift production');
      $('#OUTPUT_NIGHT').html('N/A');
      $('#COUNTER_NIGHT').html('N/A');
      $('#LOSS_NIGHT').html('N/A');
      $('#KEYIN_OUTPUT_NIGHT').html('N/A');
      $('#KEYIN_YIELD_NIGHT').html('N/A');
      $('#KEYIN_NG_NIGHT').html('N/A');

      $('#titleC').html('Total production');
      $('#OUTPUT_TOTAL').html('N/A');
      $('#COUNTER_TOTAL').html('N/A');
      $('#LOSS_TOTAL').html('N/A');
      $('#KEYIN_OUTPUT_TOTAL').html('N/A');
      $('#KEYIN_YIELD_TOTAL').html('N/A');
      $('#KEYIN_NG_TOTAL').html('N/A');

      $('#titleD').html('Overall Equipment Effectiveness')
      $('#totalOEE').html(OEE_Parameters['OEE']+'<span style="font-size:1.5rem">%</span>');
  }

}
//IoT Counter 另外計算
async function GetIOTCounter(){
  //替換SQL
  let condition = {
    "[EQP_NO]":EQP_NO,
    "[DATE]":SHIFT_DAY
  }
  let EQPInfoData3 = await getData(sidMapping.IOTCounterSid,condition)

  EQPInfoData3.rows[0].OUTPUT_DAY
  let total_count = 0
  EQPInfoData3.rows.forEach(function(e){
    let count = parseInt(e.IOT_COUNT)
    switch(e.SHIFT_NO.toUpperCase()){
      case "DAY_SHIFT":
        $('#COUNTER_DAY').html(count);
        total_count += count
        break
      case "NIGHT_SHIFT":
        $('#COUNTER_NIGHT').html(count);
        total_count += count
        break
    }
    $('#COUNTER_TOTAL').html(total_count);
  })
}
// =======================================   右上 OEE橫式柱狀圖   ==============================================================================================//
async function LoadhorizontalBarChart(){

  $('#horizontalBarChartWrapper').empty();
  $('#horizontalBarChartWrapper').append('<canvas id="horizontalBarChart"><canvas>'); //圖畫布

  let barColor = [
    parseFloat(OEE_Parameters['AVAILABILITY']) < Standards.AVAILABILITY.LOW_STANDARD ? Standards.AVAILABILITY.LOW_STANDARD_COLOR : OEE_Parameters['AVAILABILITY'] < Standards.AVAILABILITY.HIGH_STANDARD ? Standards.AVAILABILITY.MID_STANDARD_COLOR : Standards.AVAILABILITY.HIGH_STANDARD_COLOR,
    parseFloat(OEE_Parameters['PERFORMANCE']) < Standards.PERFORMANCE.LOW_STANDARD ? Standards.PERFORMANCE.LOW_STANDARD_COLOR : OEE_Parameters['PERFORMANCE'] < Standards.PERFORMANCE.HIGH_STANDARD ? Standards.PERFORMANCE.MID_STANDARD_COLOR : Standards.PERFORMANCE.HIGH_STANDARD_COLOR,
    parseFloat(OEE_Parameters['YIELD']) < Standards.YIELD.LOW_STANDARD ? Standards.YIELD.LOW_STANDARD_COLOR : OEE_Parameters['YIELD'] < Standards.YIELD.HIGH_STANDARD ? Standards.YIELD.MID_STANDARD_COLOR : Standards.YIELD.HIGH_STANDARD_COLOR,
  ]
  let ctx = $('#horizontalBarChart');
  myhorizontalBarChart = new Chart(ctx, {
      type: 'horizontalBar', //Chart.js 2.9.4版參數
      data: {
          "labels": [
            "A(%)",
            "P(%)",
            "Q(%)"
        ],
          "datasets": [
            {
                "label": "COUNT",
                "data": [
                    OEE_Parameters['AVAILABILITY'],
                    OEE_Parameters['PERFORMANCE'],
                    OEE_Parameters['YIELD']
                ],
                "tension": 0,
                "fill": false,
                "backgroundColor": barColor,
                "borderColor": barColor,
                "borderWidth": 0,
                "type": "horizontalBar"
            }
        ],
      },
      options: {
          legend:{
            display:false
          },
          scales: {
              xAxes: [{
                  ticks: {
                      display:false,
                      min: 0,
                      max: 100
                  },
                  gridLines: {
                      display: false // 去除背景格線
                  }
              }],
              yAxes: [{
                  gridLines: {
                      display: false // 去除背景格線
                  }
              }]
          },
          // aspectRatio: 1.5, //圖長寬比
          responsive: true,
          maintainAspectRatio: false,
          showAllTooltips: true,
          tooltips: {
            backgroundColor: 'rgba(0,0,0,.5)',
            displayColors: false,
            yAlign: 'center',
            xAlign: 'center',
            callbacks: {
              title: function() {},
              label: function(item) {
                return item.xLabel;
              },
            }
          },
          plugins: {
            datalabels: {
              display: false
            }
          }
      }
  });
  // }

}

// ==========================================   產量柱狀圖   ==============================================================================================//
async function GetEQPOutPut(){
  let outputStructer,outputData;
  $.ajax({
    type: 'GET',
    url:window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+sidMapping.outputSid,
    async: false,
    success: function (msg) {
      let jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    outputStructer = jsonObj
    }
  });

  outputStructer.MasterSql = outputStructer.MasterSql.replace('[EQP_NO]',EQP_NO).replace('[DATE]',SHIFT_DAY);

  $.ajax({
    type: 'post',
    url:window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Chart&DBLink=SELF',
    data: {Charts: JSON.stringify(outputStructer.Charts),SQL: outputStructer.MasterSql,AddedSQL:outputStructer.AddedSql, Conds: JSON.stringify(outputStructer.Conditions), GridFieldType: JSON.stringify(outputStructer.GridFieldType) ,
    SID:sidMapping.outputSid,rows:100},
    async: false,
    success: function (msg) {
    let jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi,'tech').replace(/y/gi,'Count'));
      outputData = jsonObj;
    }
  });

  $('#chartCWrapper').empty();
  $('#chartCWrapper').append('<canvas id="chartC"><canvas>');

  if (outputData.Series.length === 0) {
    let ctx = $('#chartC');
    let myBarChart = new Chart(ctx,{
      type:'bar',
      data:{
        "labels":['No Data'],
        "datasets":[
          {
            "data":[0],
            "fill":false,
            backgroundColor:['#ccc'],
            borderWidth:0
          }
        ]
      },
      options:{
        maintainAspectRatio:false,
        legend: {
          display: false
        },
        scales:{
          "xAxes":[{"ticks":{"beginAtZero":true}}],
          "yAxes":[{"ticks":{"beginAtZero":true}}],
          
        },
        tooltips: {
          enabled: false
        },
        plugins: {
          datalabels: {
            display: false
          }
        }
      }
    });
  }
  else{
    let column_data3 = [];
    for(let i = 0; i < outputData.Series[0].data.length; i++){
      column_data3.push(outputData.Series[0].data[i].Count);
    }
    //本日產出量
    let ctx = $('#chartC');
    let myBarChart = new Chart(ctx,
    {
    type:'bar',
      data:{
    "labels":outputData.XCategories,
    "datasets":[
      {
       "data":column_data3,
       "fill":false,
          backgroundColor:outputData.Series[0].color,
          borderWidth:1,
          borderColor: outputData.Series[0].color
          }]},
      options:{
        maintainAspectRatio:false,
        legend: {
          display: false
        },
      scales:{
        xAxes:[{
          gridLines: {color:'transparent'},
          ticks: { beginAtZero: true, padding: 5},
          scaleLabel: {display: true,labelString: 'Hour',},
        }],
        yAxes:[{
          gridLines: {color:'transparent'},
          ticks: { beginAtZero: true, min: 0, display: false},
          scaleLabel: {display: true, labelString: 'Quantity'},
        }]
      },
        layout: {
           padding: {
             top: 25  //set that fits the best
           }
        },
        showAllTooltips: true,
        tooltips: {
          backgroundColor: 'rgba(0,0,0,.5)',
          displayColors: false,
          yAlign: 'center',
          xAlign: 'center',
          callbacks: {
             title: function() {}
          }
        },
        plugins: {
          datalabels: {
            display: false
          }
        }
      
      }});

          }
      
};
// ========================================== 機況資料 Gantt ==============================================================================================//
async function printcolors(){
  let colorV = await getData(sidMapping.statusLegendColorSid)
  let colorPrint = "";
  for(let i = 0; i < colorV.rows.length; i++){
      colorPrint += "<span style='background-color:"+colorV.rows[i]['EQP_STATUS_LAYOUT_COLOR']+"'>"+colorV.rows[i]["EQP_STATUS_CODE"]+"</span>";
  };
  $('#colors').html(colorPrint);
}
async function GetEQPGantt(){
  //替換SQL
  let condition = {
    "[EQP_NO]":EQP_NO,
    "[S_TIME]":startTime,
    "[E_TIME]":endtime
  }
  let GanttData = await getData(sidMapping.EQPGanttSid,condition)

  if(window.GanttChart && window.GanttChart !== null){
      window.GanttChart.destroy;
  }
  
  $('#chartFWrapper').empty();
  $('#chartFWrapper').append('<canvas id="chartF"><canvas>');
    
  let dataWrapper = [];
  let dataObj;
  for (i=0;i<GanttData.rows.length;i++){
    let start =GanttData.rows[i].FROM_EQP_STATUS_TIME;
    let end   =GanttData.rows[i].TO_EQP_STATUS_TIME;
    
    let bgColor = GanttData.rows[i].EQP_STATUS_LAYOUT_COLOR;
    
    dataObj = { x:{from: new Date(start.replaceAll('-', '/')), to: new Date(end.replaceAll('-', '/'))}, y: 1, backgroundColor: bgColor};
    dataWrapper.push(dataObj);
  };
  
  if(SHIFT_DAY!=""&&currentDay==SHIFT_DAY){
    //畫透明區間時間段 2022-07-14
    let undefinedStartTime = GanttData.rows[GanttData.rows.length-1].TO_EQP_STATUS_TIME;
    let undefinedEndTime = next_shift_day + ' ' + shift_start_end;
    //console.log(undefinedEndTime);
    let undefinedColor = 'transparent';
    dataObj = { x:{from: new Date(undefinedStartTime.replaceAll('-', '/')), to: new Date(undefinedEndTime.replaceAll('-', '/'))}, y: 1, backgroundColor: undefinedColor};
    dataWrapper.push(dataObj);
  }

  let ctx = document.getElementById('chartF').getContext('2d');
  window.GanttChart = new Chart(ctx, {
    type: "gantt",
    data: {
        datasets: [{
            height: 1,
            width: "24h",
            label: " ",
            data: dataWrapper
        }]
    },
    options: {
      events:[''],
      onHover:[''],
      tooltips: {
        enabled: false,
      },
      legend: {
          display:false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          ticks: { padding: 0},
          scaleLabel: {display: true,labelString: 'Hour',},
          type: "time-gantt",
          position: "bottom",
          time: {
            displayFormats: {
                hour: "HH:mm",
            },
          }
        }],
        yAxes: [{
          display: true,
          gridLines: {color:'transparent'},
          ticks: {display: false},
          scaleLabel: {display: true, labelString: 'Status'},

        }]
      }
    }
  });
};
// ========================================== 進出站紀錄 Gantt ==============================================================================================//
async function GetCICOGantt(){
  //替換SQL
  let condition = {
    "[EQP_NO]":EQP_NO,
    "[S_TIME]":startTime,
    "[E_TIME]":endtime
  }
  let GanttData2 = await getData(sidMapping.CICOGanttSid,condition)
    if(window.GanttChart2 && window.GanttChart2 !== null){
        window.GanttChart2.destroy;
    }

  $('#chartGWrapper').empty();
  $('#chartGWrapper').append('<canvas id="chartG"><canvas>');

  let dataWrapper = [];
  let endObj;
  let dataObj;
  let gapObj;
  let previousEnd = '';

  for (i=0;i<GanttData2.rows.length;i++){
    let start =GanttData2.rows[i].CHECK_IN_TIME;
    let end   =GanttData2.rows[i].CHECK_OUT_TIME;
    let wo = GanttData2.rows[i].WO;
    let USER_NAME = GanttData2.rows[i].USER_NAME;
    let dataType = GanttData2.rows[i].OEE_TYPE.toUpperCase();
    let bgColor = GanttData2.rows[i].BG_COLOR;
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
    if(i===GanttData2.rows.length-1 && currentDay==SHIFT_DAY){
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
  let ctx2 = document.getElementById('chartG').getContext('2d');
  window.GanttChart2 = new Chart(ctx2, {
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
          // labelTextColor: (context)=>{
          //   return 'red'
          // },
          title: function () {
            return ''; // 否则返回标题
          },
          label: function(item) {
            if (woHints[item.index] == 'N/A') {
                return ''; // 如果符合条件，则返回空字符串，禁用标题
            }
            return woHints[item.index]
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
};
// ============================================   下層TABLE  ==============================================================//
async function GetCICOTable(){
  let QueryStructer, SmartQueryData;
  let TitleArray =[], ALLTitle = "", QueryArray = [], TitleFalseV = [], StructerValue = 0, DataSet = [], CurrentRow=[];
  $.ajax({
      type: 'GET',
      url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + sidMapping.CICOTableSid,
      async: false,
      success: function (msg) {
          let jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
          jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
          jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
          QueryStructer = jsonObj;
      }
  });
  $.each(QueryStructer.sColModels4EasyUI, function (k, v) {
      $.each(v, function (ka, va) {
          switch (ka) {
              case "title":
                  $('#addtitle').append('<th id="Title' + va + '">' + va + '</th>');
                  TitleArray.push(va);
                  break;
              case "field":
                  ALLTitle == "" ? ALLTitle += va : ALLTitle += (',' + va);
                  break;
              case "hidden":
                  if (va == true)
                      TitleFalseV.push(StructerValue);
                  break;
          }
      })
      StructerValue += 1;
  })
  
  QueryStructer.MasterSql = QueryStructer.MasterSql.replace('[EQP_NO]',EQP_NO).replaceAll('[S_TIME]',startTime).replaceAll('[E_TIME]',endtime);
  
  $.ajax({
      type: 'post',
      url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
      data: {
          Charts: JSON.stringify(QueryStructer.Charts),
          SQL: QueryStructer.MasterSql,
          AddedSQL: QueryStructer.AddedSql,
          Conds: JSON.stringify(QueryStructer.Conditions),
          GridFieldType: JSON.stringify(QueryStructer.GridFieldType),
          SID: sidMapping.CICOTableSid,
          rows: 100
      },
      async: false,
      success: function (msg) {
          let jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));//.replace(/name/gi, 'tech')
          SmartQueryData = jsonObj;
          for (let i = 0; i < SmartQueryData.rows.length; i++) {
              CurrentRow = [];
              for (let j = 0; j < TitleArray.length; j++) {
                  if (TitleArray[j] != "RN") {
                      if (SmartQueryData.rows[i][ALLTitle.split(",")[j]] == undefined || SmartQueryData.rows[i][ALLTitle.split(",")[j]] == "")
                          CurrentRow.push(" ");
                      else
                      CurrentRow.push(SmartQueryData.rows[i][ALLTitle.split(",")[j]]);
                  }
              }
              DataSet.push(CurrentRow);
          }
      }
  });

  $('#example').DataTable().destroy()
  let table = $('#example').DataTable({
      data: DataSet,
      "columnDefs": [
          {
              "targets": TitleFalseV,//隱藏的欄位
              "visible": false
          },
  
      ],
      "dom": 'frt',
      "lengthMenu": 20,
      "ordering": false,
      "searching": false,
      "scrollX": true, // 开启水平滚动
      "scrollCollapse": true, // 开启滚动收缩
      "width":"100%",
  });
  
  table.column(2).visible(false);
  table.column(8).visible(false);
  table.column(9).visible(false);
  table.column(19).visible(false);
  table.column(22).visible(false);
}
// ============================================   資料刷新   ==============================================================//
async function setRefreshTimmer(){
  setInterval(async function(){
    if(document.visibilityState=='visible'){
      await initChartConfig();
      await GetOEEStandard();
      await GetEQPInfo();
      await GetEQPOutPut ();
      await GetEQPList();
      await printcolors();
      await GetIOTCounter();
      await LoadhorizontalBarChart();
      await GetEQPGantt();
      await GetCICOGantt();
      await GetCICOTable();

      console.log('Data refresh!')
    }
  }, RefreshTime * 1000);
}
//==========================================CALL API 取資料===================//
function getData(SID,replaceConditions){
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
            let jsonObj2 = jQuery.parseJSON(msg);
            resolve(jsonObj2);
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