$("#logotext").html(PROJECT_SAVE_NAME);

let CurrentURL = new URL(window.location.href);
let URLparams = new URLSearchParams(CurrentURL.search);
let LEVEL = URLparams.get('LEVEL');
let MODULE_NAME = URLparams.get('MODULE_NAME');
let BUTTON = URLparams.get('BUTTON');

let GridChartsid
switch(MODULE_NAME){
    case 'DC':
        GridChartsid = '352572456963556'
        break;
    case 'CNC':
        GridChartsid = '352574712180625'
        break;
}
// call api
function getBarLineChartData(SID){

  let Sid = SID;
  let Structer;
  let Data;
  $.ajax({
      type: 'GET',
      url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+GridChartsid,
      async: false,
      success: function (msg) {
          let jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
          jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
          jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
          Structer = jsonObj
      }
  });
  
  $.ajax({
      type: 'post',
      url: window.location.protocol+'//'+default_ip+'/'+default_WebSiteName+'/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Chart&DBLink=SELF',
      data: {
          Charts: JSON.stringify(Structer.Charts),
          SQL: Structer.MasterSql,
          AddedSQL: Structer.AddedSql,
          Conds: JSON.stringify(Structer.Conditions),
          GridFieldType: JSON.stringify(Structer.GridFieldType),
          SID: +Sid,
          rows: 100
      },
      async: false,
      success: function (msg) {
          Data = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi, 'tech'));
      }
  });
  return Data
}
// 設定 Chart Data
let chartData = getBarLineChartData(GridChartsid);
let barData = Array.from(chartData.Series[0].data, item => item.y)
let lineData = Array.from(chartData.Series[1].data, item => item.y)

// 畫圖
let ctx = document.getElementById('drawpaper').getContext('2d');
const chartBarLine = new Chart(ctx, {
  plugins: [ChartDataLabels],

  type: 'bar', // 将图表类型更改为 bar
  data: {
    labels: chartData.XCategories,
    datasets: [
      {
        label: chartData.Series[0].tech,
        data: barData,
        backgroundColor: ['#7a8a41','#53ac36','#6ee28d','#63b4ae','#89b3ff'],
        order: 1,
        yAxisID: 'barChart',
      },
      {
        label: chartData.Series[1].tech,
        data: lineData,
        borderColor: chartData.Series[1].color,
        backgroundColor: chartData.Series[1].color,
        type: 'line', // 设置为线图
        order: 0,
        yAxisID: 'lineChart',
        borderWidth: 5,
        borderRadius: 5
      }
    ]
  },
  options: {
    plugins: {
        datalabels: {
            color: "#fff",
            borderColor: "#000",
            font: {
                weight: "bold",
                size: 23
            },
            formatter: function(e, t) {
                if (1 === t.datasetIndex)
                    return `${e}%`
            }
        },
        legend: {
            labels: {
                color: "#E3E3E3"
            },
            position: "bottom",
            align: "center"
        }
    },
    scales: {
        barChart: {
            id: "barChart",
            type: "linear",
            position: "left",
            ticks: {
                color: "#E3E3E3"
            }
        },
        lineChart: {
            id: "lineChart",
            type: "linear",
            position: "right",
            suggestedMax: 100,
            suggestedMin: 0,
            display: !0,
            grid: {
                display: !0
            },
            ticks: {
                color: "#E3E3E3",
            }
        },
        y: {
            grid: {
                color: "#4C4C4C"
            },
            ticks: {
                display: !1,
                color: "#E3E3E3"
            }
        },
        x: {
            grid: {
                color: "#4C4C4C"
            },
            ticks: {
                color: "#E3E3E3"
            }
        }
    },
    responsive: true,
    maintainAspectRatio: false
  },
});
