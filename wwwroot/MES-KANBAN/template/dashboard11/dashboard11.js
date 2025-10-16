
ChangeLang();

let airListData // AIR-FLOW
let airListSID = '353775257206643'

let nListData // N-FLOW
let nListSID = '353775271010728'

let tapwaterListData // Tap-Water
let tapwatertSID = '353781152726098'

let wastewaterListData // Waste Water
let wastewaterSID = '353781183330744'

// EMS-近一周碳用量 C
let drawStackCsid = "355055803583277"


let doughnutA // Carbon A
let doughnutASID = "321618901510638"

let stackChartASID = "321981534510696" // 12 months

let stackBChartBSID = "356091272190936" // Max CO2E

let multiLineASID = '353692416180040' // All Fabs

let scatterSID = "360664304080346" // 散佈圖

let DrawDoughnut
let drawStackA
let drawStackB
let drawStackC
let drawLineChart
let drawScatter

// async function stackBarChart(){
//   let StackData = await getGridData(stackChartASID)
//   InitialStackChartA(StackData)
// }

// function main(){
//   stackBarChart()
// }

// function gridData(){
//   let DoughnutData =  getGridData(doughnutASID)
//   let StackData =  getGridData(stackChartASID)
//   let multiLineA =  getGridData(multiLineASID)
//   let StackBarC =  getGridData(drawStackCsid)
//   let scatterData =  GetChartDataOld(scatterSID)
// }

// async function main(){
//   await gridData()
// }

// 圖表
async function fetchData() {
  let DoughnutData = await getGridData(doughnutASID)
  let StackData = await getGridData(stackChartASID)
  // let stackBData = await getGridData(stackBChartBSID)
  let multiLineA = await getGridData(multiLineASID)
  let StackBarC = await getGridData(drawStackCsid)
  let scatterData = await GetChartDataOld(scatterSID)

  if(DoughnutData) {
    InitialDoughnut(DoughnutData)
  }

  if(StackData) {
    InitialStackChartA(StackData)
  }

  if(multiLineA) {
    InitialMultiLine(multiLineA)
  }

  // if(stackBData) {
  //   InitialStackChartB(stackBData)
  // }

  if(StackBarC) {
    InitialGridC(StackBarC)
  }

  if(scatterData) {
    InitialScatter(scatterData)
  }

  // 表格
  let airListData = await getGridData(airListSID)
  let nListData = await getGridData(nListSID)
  let tapwaterListData = await getGridData(tapwatertSID)
  let wastewaterListData = await getGridData(wastewaterSID)

  if (airListData) {
    const airContent = InitialAirFlow(airListData.Grid_Data)
    document.getElementById('air-flow-content').innerHTML = airContent
}

  if (nListData) {
    const nFlowContent = InitialAirFlow(nListData.Grid_Data)
    document.getElementById('n-flow-content').innerHTML = nFlowContent
}

  if (tapwaterListData) {
    const tapwaterContent = InitialTapWater(tapwaterListData.Grid_Data)
    document.getElementById('tap-water-content').innerHTML = tapwaterContent
}

  if (wastewaterListData) {
    const wastewaterContent = InitialWasteWater(wastewaterListData.Grid_Data)
    document.getElementById('waste-water-content').innerHTML = wastewaterContent
}

  //最後更新資料的時間
  updateTime('timming')

  //定時更新
  setInterval(async () => refreshData(), 30000)

  setTimeout(() => {
    document.location.reload();
  }, 900000)

}

window.onload = async function() {
  await fetchData();  // 網頁載入時自動執行
};

// 更新資料
async function refreshData() {
  let DoughnutData = await getGridData(doughnutASID)
  let drawStackA = await getGridData(stackChartASID)
  // let drawStackB = await getGridData(stackBChartBSID)
  let drawLineChart = await getGridData(multiLineASID)
  let drawStackC = await getGridData(drawStackCsid)
  let drawScatter = await GetChartDataOld(scatterSID)

  if(drawStackC) {
    InitialGridC(drawStackC)
  }

  if (DoughnutData) {
    UpdateDoughnut(DoughnutData)
  }

  if (drawStackA) {
    UpdateStackChartA(drawStackA)
  }

  if (drawLineChart) {
    UpdateMultiLine(drawLineChart)
  }

  if(drawScatter) {
    InitialScatter(drawScatter)
  }

  // if (drawStackB) {
  //   UpdateStackChartB(drawStackB)
  // }

  // 表格
  let airListData = await getGridData(airListSID)
  let nListData = await getGridData(nListSID)
  let tapwaterListData = await getGridData(tapwatertSID)
  let wastewaterListData = await getGridData(wastewaterSID)

  if (airListData) {
    const airContent = InitialAirFlow(airListData.Grid_Data)
    document.getElementById('air-flow-content').innerHTML = airContent
  }

  if (nListData) {
    const nFlowContent = InitialAirFlow(nListData.Grid_Data)
    document.getElementById('n-flow-content').innerHTML = nFlowContent
  }

  if (tapwaterListData) {
    const tapwaterContent = InitialTapWater(tapwaterListData.Grid_Data)
    document.getElementById('tap-water-content').innerHTML = tapwaterContent
  }

  if (wastewaterListData) {
    const wastewaterContent = InitialWasteWater(wastewaterListData.Grid_Data)
    document.getElementById('waste-water-content').innerHTML = wastewaterContent
  }

  //最後更新資料的時間
  updateTime('timming')
}

// 甜甜圈
function InitialDoughnut(Data) {

  // 色彩
  let fillBgColor = ['#19818F', '#B2F4BE', '#FFC107']

  // 標題
  let typeTitle = [GetLangDataV2('Max kW (kW)'), GetLangDataV2('Remain (kW)'), GetLangDataV2('Solar')]

  let ChartADATA = [
    Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').VALUE,
    Data.Grid_Data.find(item => item.TYPE === 'LAVE_VALUE').VALUE,
    Data.Grid_Data.find(item => item.TYPE === 'SOLAR_POWER').VALUE
  ]

  let doughnutCanvas = document.getElementById('doughnutAChart')

  // 初始化甜甜圈圖
  DrawDoughnut = new Chart(doughnutCanvas, {
    type: "doughnut",
    data: {
      labels: typeTitle,
      datasets: [{
        data: ChartADATA,
        backgroundColor: fillBgColor,
        borderWidth: 1
      }],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: {
            color: 'white',
          }
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              let data = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex]
              return `${tooltipItem.label}: ${data}`
            }
          }
        },
        doughnutlabel: {
          labels: [{
            text: ChartADATA[0],
            font: {
              size: '20'
            },
            color: 'white'
          }]
        }
      },
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 1
    },
  })

  // 顯示合同容量和用電量
  let Total_kW = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').TOTAL_KW || 0;
  document.querySelector('#doughnutATitle').innerHTML = `${GetLangDataV2('Max kW (kW)')}: ${Total_kW} kW<br>${GetLangDataV2('Contract Cap')}: 10000 kW`
  document.querySelector('#doughnutAKID').innerHTML = `${ChartADATA[0].toFixed(0, 2)} %`
}

// 更新甜甜圈
function UpdateDoughnut(Data) {
  // 更新甜甜圈圖數據
  let newChartADATA = [
    Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').VALUE,
    Data.Grid_Data.find(item => item.TYPE === 'LAVE_VALUE').VALUE,
    Data.Grid_Data.find(item => item.TYPE === 'SOLAR_POWER').VALUE
  ]
  
  DrawDoughnut.data.typeTitle = ['Max kW (kW)', 'Remain (kW)', 'Solar']
  DrawDoughnut.data.datasets[0].data = newChartADATA

  DrawDoughnut.update()

  let Total_kW = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').TOTAL_KW || 0;
  document.querySelector('#doughnutATitle').innerHTML = `${GetLangDataV2('Max kW (kW)')}: ${Total_kW} kW<br>${GetLangDataV2('Contract Cap')}: 10000 kW`
  document.querySelector('#doughnutAKID').innerHTML = `${newChartADATA[0].toFixed()} %`
}

// 表格A
function InitialStackChartA(Data) {
  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)
  const kwhData = Data.Grid_Data.map(item => item.KWH_TOT)
  const co2eData = Data.Grid_Data.map(item => item.CO2E_COUNT)
  const baselineData = Data.Grid_Data.map(item => item.VALUE)

  const ctx = document.getElementById('stackBarA').getContext('2d')

  const mixedChart = new Chart(ctx, {
    data: {
      labels: reportDate,
      datasets: [
        // {
        //   type: 'line',
        //   label: 'CO2e',
        //   data: co2eData,
        //   borderColor: '#bfff80',
        //   backgroundColor: '#bfff80',
        //   yAxisID: 'y1',
        // },
        {
          type: 'line',
          label: 'Baseline(kWh)',
          data: co2eData,
          borderColor: '#bfff80',
          backgroundColor: '#bfff80',
          yAxisID: 'y1',
        },
        {
          type: 'bar',
          label: 'Kwh',
          data: kwhData,
          backgroundColor: '#00ACC1',
          yAxisID: 'y',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        // KWH
        y: {
          type: 'linear',
          position: 'left',
          // beginAtZero: 'true',
          ticks: {
            color: 'white',
          }
        },
        // CO2E
        y1: {
          max: undefined,
          min: undefined,
          type: 'linear',
          position: 'right',
          // beginAtZero: 'true',
          ticks: {
            color: 'white',
          }
        },
        x: {
          ticks: {
            color: 'white'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'white',
          }
        },
        title: {
          display: true,
          text: GetLangDataV2('kWh & Baseline(kWh) (Last 12 Months)'),
          color: 'skyblue',
          font: {
            size: 18
          }
        }
      }
    }
  })
}

// 更新表格A
function UpdateStackChartA(Data) {
  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)
  const kwhData = Data.Grid_Data.map(item => item.KWH_TOT)
  const co2eData = Data.Grid_Data.map(item => item.CO2E_COUNT)

  const drawStackA = Chart.getChart('stackBarA')
  drawStackA.data.labels = reportDate
  drawStackA.data.datasets[0].data = co2eData
  drawStackA.data.datasets[1].data = kwhData

  drawStackA.update()
}

// Max CO2E
// function InitialStackChartB(Data) {
//   // console.log(Data)

//   const labelOrder = ['YEAR', 'MONTH', 'DAY']

//   const labelName = {
//     'YEAR': [GetLangDataV2('Year'), GetLangDataV2('highest')],
//     'MONTH': [GetLangDataV2('Month'), GetLangDataV2('highest')],
//     'DAY': [GetLangDataV2('Today')]
//   }

//   const labels = Data.Grid_Data.map(item =>  item.LABEL)
//   const maxCO2E = Data.Grid_Data.map(item => item.MAX_CO2E)

//   const correctOrder = labelOrder.map(label => {
//     const index = labels.indexOf(label)
//     return {
//       label: labelName[label] || label,
//       data: maxCO2E[index],
//       date: Data.Grid_Data[index].REPORT_TIME.split('T')[0]
//     }
//   })


//   const orderedLabel = correctOrder.map(item => item.label)
//   const orderedCO2E = correctOrder.map(item => item.data)
//   const co2eDates = correctOrder.map(item => item.date)
  
//   const ctx = document.getElementById('stackBarB').getContext('2d')
//   document.getElementById('stackBarBTitle').innerHTML = GetLangDataV2('Max Carbon Per Year/Month/Day')

//   const stackBarB = new Chart(ctx, {
//     type: 'bar',
//     data: {
//         labels: orderedLabel,
//         datasets: [
//             {
//                 label: 'MAX CO2e',
//                 data: orderedCO2E,
//                 backgroundColor: [
//                     '#ffe347',  
//                     '#38FFB3',
//                     '#36A2EB'
//                 ],
//             }
//         ]
//     },
//     options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         scales: {
//             y: {
//                 ticks: {
//                     color: 'white',
//                     beginAtZero: true
//                 }
//             },
//             x: {
//                 ticks: {
//                     color: 'white'
//                 }
//             }
//         },
//         plugins: {
//             legend: {
//               display: false,
//               labels: {
//                   color: 'white',
//               }
//             },
//             tooltip: {
//               callbacks: {
//                   label: function(tooltipItem) {
//                       const index = tooltipItem.dataIndex
//                       const value = tooltipItem.raw.toFixed(2)
//                       const date = co2eDates[index]
//                       return `${GetLangDataV2('Date: ')}${date} , CO2e: ${value} T`
//                   }
//               }
//           }            
//         }
//     }
// })
// }


function InitialScatter(Data) {
  const ctx = document.getElementById('regressionChart').getContext('2d')
  document.getElementById('stackBarBTitle').innerHTML = GetLangDataV2('Baseline Linear Regression')

  const seriesData0 = Data[0].Series[0] // 第一個 Series
  const seriesData1 = Data[0].Series[1] // 第二個 Series

  const labels = Data[0].XCategories
  const data1 = seriesData0.data.map(item => item.y)
  const data2 = seriesData1.data.map(item => item.y)

  const regressionChart = new Chart(ctx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'kWh',
        data: labels.map((label, index) => ({
          x: label,
          y: data1[index],
        })),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        pointRadius: 5,
      },
      {
        label: 'Baseline(kWh)',
        data: labels.map((label, index) => ({
          x: label,
          y: data2[index],
        })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 5,
      },
      {
        label: 'kWh Line',
        data: (() => {
          const coefficients = linearRegression(labels.map(Number), data1);
          return [
            { x: Math.min(...labels.map(Number)), y: coefficients.m * Math.min(...labels.map(Number)) + coefficients.b },
            { x: Math.max(...labels.map(Number)), y: coefficients.m * Math.max(...labels.map(Number)) + coefficients.b }
          ];
        })(),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        type: 'line',
        pointRadius: 0,
        showLine: true,
      },
      {
        label: 'Baseline Line',
        data: (() => {
          const coefficients = linearRegression(labels.map(Number), data2);
          return [
            { x: Math.min(...labels.map(Number)), y: coefficients.m * Math.min(...labels.map(Number)) + coefficients.b },
            { x: Math.max(...labels.map(Number)), y: coefficients.m * Math.max(...labels.map(Number)) + coefficients.b }
          ];
        })(),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        type: 'line',
        pointRadius: 0,
        showLine: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Baseline(kWh)',
          color: 'rgba(255, 255, 255, 1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 1)',
          callback: function (value) {
            return (value / 1000) + 'K'
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'kWh',
          color: 'rgba(255, 255, 255, 1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 1)',
          callback: function (value) {
            return (value / 1000) + 'K'
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 1)',
          filter: function(legendItem, chartData) {
            // 只移除 'kWh Line' 和 'Baseline'
            return legendItem.text !== 'kWh Line' && legendItem.text !== 'Baseline Line';
          }
        },
      },
      tooltip: {
        maxWidth: 200,
        callbacks: {
          label: function (context) {
            const index = context.dataIndex
            const month = index + 1
            let label = `${month}月`
            if (context.dataset.label) {
              label += `的${context.dataset.label}`
            }
            if (context.parsed.y !== null) {
              const 產量 = context.parsed.x.toFixed(0)
              const 電量 = context.parsed.y.toFixed(0)
              label += `\n${GetLangDataV2('Output')}: ${產量}\n${GetLangDataV2('Usage')}: ${電量}`
            }
            return label.split('\n');
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        bodyColor: '#fff',
      }
    }
  }
})
}

// 回傳 斜率 m , 截距 b
function linearRegression(x, y) {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0)
  const sumX2 = x.reduce((a, b) => a + b * b, 0)
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const b = (sumY - m * sumX) / n

  return { m, b }
}


// ALL FAB
function InitialMultiLine(Data) {
  const ctx = document.getElementById('multiLineA').getContext('2d')

  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)

  const allFabData = Data.Grid_Data.map(item => item.MAIN) // 主電表
  const JA14data = Data.Grid_Data.map(item => item.JA14)
  const JV02data = Data.Grid_Data.map(item => item.JV02)
  const JV03data = Data.Grid_Data.map(item => item.JV03)
  const JV04data = Data.Grid_Data.map(item => item.JV04)
  const BASELINEdata = Data.Grid_Data.map(item => item.BASELINE)

  const maxAllFabData = Math.max(...allFabData) * 1.05 // 跟著 allFabData 讓 Max 最大值能夠動態顯示

  const multiLineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: reportDate,
          datasets: [
              {
                label:  'Main',
                data: allFabData,
                borderColor: '#baff80',
                backgroundColor: '#baff80',
                fill: false,
              },
              {
                label: 'JA14',
                data: JA14data,
                borderColor: '#ea99ff',
                backgroundColor: '#ea99ff',
                fill: false,
              },
              {
              label: 'JV02',
              data: JV02data,
              borderColor: '#008bbb',
              backgroundColor: '#008bbb',
              fill: false,
              },
              {
                label: 'JV03',
                data: JV03data,
                borderColor: '#00898d',
                backgroundColor: '#00898d',
                fill: false,
              },
              {
                label: 'JV04',
                data: JV04data,
                borderColor: '#00835f',
                backgroundColor: '#00835f',
                fill: false,
              },
              {
                label: GetLangDataV2('Baseline'),
                data: BASELINEdata,
                borderColor: '#F68488',
                backgroundColor: '#F68488',
                fill: false,
              },
          ]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              y: {
                max: maxAllFabData,
                beginAtZero: true,
                  ticks: {
                      color: 'white',
                  }
              },
              x: {
                  ticks: {
                      color: 'white'
                  }
              }
          },
          plugins: {
              legend: {
                  labels: {
                      color: 'white',
                  }
              },
              title: {
                  display: true,
                  text: GetLangDataV2('kWh by Factory (Last 30 Days)'),
                  color: 'skyblue',
                  font: {
                      size: 18
                  }
              }
          }
      }
  })
}

// UPDATE FAB
function UpdateMultiLine(Data) {
  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)
  const allFabData = Data.Grid_Data.map(item => item.FAB_TOTAL)

  const drawLineChart = Chart.getChart('multiLineA')
  drawLineChart.data.labels = reportDate
  drawLineChart.data.datasets[3].data = allFabData

  drawLineChart.update()
}

// AIR-FLOW
function InitialAirFlow(gridData) {
  let content = ''
  gridData.forEach(row => {
      content += `
          <tr>
            <td colspan="2" class="border-b border-gray-400 my-4"></td>
          </tr>
          <tr>
              <td class="pr-4 pt-2 text-xs Lang">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.DEGREE_TOTAL}</td>
          </tr>`
  })
  return content
}

// N-FLOW
function InitialNFlow(gridData) {
  let content = ''
  gridData.forEach(row => {
      content += `
          <tr>
            <td colspan="2" class="border-b border-gray-400 my-4"></td>
          </tr>
          <tr>
              <td class="pr-4 pt-2 text-xs Lang">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.DEGREE_TOTAL}</td>
          </tr>`
  })
  return content
}

// Tap-Water
function InitialTapWater(gridData) {
  let content = ''
  gridData.forEach(row => {
      content += `
          <tr>
            <td colspan="2" class="border-b border-gray-400 my-4"></td>
          </tr>
          <tr>
              <td class="pr-4 pt-2 text-xs Lang">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
          </tr>`
  })
  return content
}

// Waste Water
function InitialWasteWater(gridData) {
  let content = ''
  gridData.forEach(row => {
      content += `
          <tr>
            <td colspan="2" class="border-b border-gray-400 my-2"></td>
          </tr>
          <tr>
              <td class="pr-4 pt-2 text-xs Lang">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
          </tr>`
  })
  return content
}

// 近一周碳用量
function InitialGridC(Data) {
  // console.log(Data)
  const reportDate = Data.Grid_Data.map(item => {
    const getDate = new Date(item.REPORT_DATE)
    return getDate.toISOString().slice(5, 10)
  })
  const co2eData = Data.Grid_Data.map(item => item.CO2E)

  const ctx = document.getElementById('horizonalBarC').getContext('2d')

  const horizonalBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: reportDate,
      datasets: [
        {
          label: 'CO2e',
          data: co2eData,
          borderColor: '#bfff80',
          backgroundColor: '#bfff80'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: 'true',
          ticks: {
            color: 'white',
            autoskip: false
          }
        },
        x: {
          title: {
            display: true,
            text: 'CO2e(T)',
            color: 'white',
            font: {
              size: 14,
            }
          },
          ticks: {
            color: 'white'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'white',
          }
        }
      }
    }
  })
}

// call API取得回傳Data
function GetChartDataOld(SID){
  try{
    let Sid = SID
    let Structer
    let Data
    
    $.ajax({
        type: 'GET',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + Sid,
        async: false,
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""))
            jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt")
            jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt")
            Structer = jsonObj
        }
    })

    $.ajax({
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Chart&DBLink=SELF',
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
            Data = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi, 'tech'))
        }
    })

    return [Data,Structer]
  }
  catch{
    return null
  }

}
