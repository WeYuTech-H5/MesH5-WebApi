let airListData // AIR-FLOW
let airListSID = '353775257206643'

let nListData // N-FLOW
let nListSID = '353775271010728'

let tapwaterListData // Tap-Water
let tapwatertSID = '353781152726098'

let wastewaterListData // Waste Water
let wastewaterSID = '353781183330744'

let GridListC // Ranking C
let GridListCsid = "310917519483319"

let doughnutA // Carbon A
let doughnutASID = "321618901510638"

let stackChartASID = "321981534510696" // 12 months

let stackBChartBSID = "300535057513078" // Day by Day

let multiLineASID = '353692416180040' // All Fabs

let DrawDoughnut
let drawStackA
let drawStackB
let drawLineChart

// 圖表
async function fetchData() {
  let DoughnutData = await getGridData(doughnutASID)
  let StackData = await getGridData(stackChartASID)
  let stackBData = await getGridData(stackBChartBSID)
  let multiLineA = await getGridData(multiLineASID)

  if(DoughnutData) {
    InitialDoughnut(DoughnutData)
  }

  if(StackData) {
    InitialStackChartA(StackData)
  }

  if(multiLineA) {
    InitialMultiLine(multiLineA)
  }

  if(stackBData) {
    InitialStackChartB(stackBData)
  }

  // 表格
  let airListData = await getGridData(airListSID)
  let nListData = await getGridData(nListSID)
  let tapwaterListData = await getGridData(tapwatertSID)
  let wastewaterListData = await getGridData(wastewaterSID)

  let GridListC = await getGridData(GridListCsid)

  if (GridListC) {
    const gridCTable = InitialGridC(GridListC.Grid_Data)
    document.getElementById('gridCContainer').appendChild(gridCTable)
}

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
  setInterval(async () => RefreshData(), 30000)

}
fetchData()

// 更新資料
async function refreshData() {
  let DoughnutData = await getGridData(doughnutASID)
  let drawStackA = await getGridData(stackChartASID)
  let drawStackB = await getGridData(stackBChartBSID)
  let drawLineChart = await getGridData(multiLineASID)

  if (DoughnutData) {
    UpdateDoughnut(DoughnutData)
  }

  if (drawStackA) {
    UpdateStackChartA(drawStackA)
  }

  if (drawLineChart) {
    UpdateMultiLine(drawLineChart)
  }

  if (drawStackB) {
    UpdateStackChartB(drawStackB)
  }

  // 表格
  let airListData = await getGridData(airListSID)
  let nListData = await getGridData(nListSID)
  let tapwaterListData = await getGridData(tapwatertSID)
  let wastewaterListData = await getGridData(wastewaterSID)

  let GridListC = await getGridData(GridListCsid)

  if (GridListC) {
    const gridCTable = InitialGridC(GridListC.Grid_Data)
    document.getElementById('gridCContainer').innerHTML = ''
    document.getElementById('gridCContainer').appendChild(gridCTable)
  }

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
  let fillBgColor = ['#FFC107', '#00ACC1', '#4CAF50']

  // 標題
  let typeTitle = ['最大需量 (kW)', '剩餘量 (Remain)', '太陽能 (Solar)']

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
  document.querySelector('#doughnutATitle').innerHTML = `最大需量 (kW): ${Total_kW} kW<br>契約容量：6000 kW`
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
  
  DrawDoughnut.data.typeTitle = ['最大需量 (kW)', '剩餘量 (Remain)', '太陽能 (Solar)']
  DrawDoughnut.data.datasets[0].data = newChartADATA

  DrawDoughnut.update()

  let Total_kW = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').TOTAL_KW || 0;
  document.querySelector('#doughnutATitle').innerHTML = `最大需量 (kW): ${Total_kW} kW<br>合同容量：6000 kW`
  document.querySelector('#doughnutAKID').innerHTML = `${newChartADATA[0].toFixed()} %`
}

// 甜甜圈
// function InitialDoughnut(Data) {
//   console.log(Data)
//   // 設定甜甜圈色彩
//   let fillBgColor = ['#FFC107', '#00ACC1', '#4CAF50']

//   // 甜甜圈小標題
//   let labels = ['使用量 (Used Power)', '剩餘量 (Remain)', '太陽能 (Solar)']

//   // 甜甜圈數據
//   let ChartADATA = [Data.data.datasets[0].data[2], Data.data.datasets[0].data[0], Data.data.datasets[0].data[1]]
//   let doughnutCanvas = document.getElementById('doughnutAChart')

//   // 初始化甜甜圈圖
//   DrawDoughnut = new Chart(doughnutCanvas, {
//     type: "doughnut",
//     data: {
//       labels: labels,
//       datasets: [{
//         data: ChartADATA,
//         backgroundColor: fillBgColor,
//         borderWidth: 1
//       }],
//     },
//     options: {
//       plugins: {
//         legend: {
//           display: true,
//           labels: {
//             color: 'white',
//           }
//         },
//         tooltip: {
//           callbacks: {
//             label: function(tooltipItem) {
//               let data = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex].data[tooltipItem.dataIndex]
//               return `${tooltipItem.label}: ${data}`
//             }
//           }
//         },
//         doughnutlabel: {
//           labels: [{
//             text: ChartADATA[0],
//             font: {
//               size: '20'
//             },
//             color: 'white'
//           }]
//         }
//       },
//       cutout: '70%',
//       responsive: true,
//       maintainAspectRatio: false,
//       devicePixelRatio: 1
//     },
//   })

//   // 顯示合同容量和用電量
//   document.querySelector('#doughnutATitle').innerHTML = `本日用電(kW)<br>契約容量：6000 kW`
//   document.querySelector('#doughnutAKID').innerHTML = `${ChartADATA[0].toFixed(0, 2)} %`
// }

// 更新甜甜圈
// function UpdateDoughnut(Data) {
//   // 更新甜甜圈圖數據
//   DrawDoughnut.data.labels = ['使用量 (Used Power)', '剩餘量 (Remain)', '太陽能 (Solar)']
//   DrawDoughnut.data.datasets[0].data = [Data.data.datasets[0].data[2], Data.data.datasets[0].data[0], Data.data.datasets[0].data[1]]

//   DrawDoughnut.update()

//   document.querySelector('#doughnutATitle').innerHTML = `目前全廠用電量(KW)<br>合同容量：6000 kW`
//   document.querySelector('#doughnutAKID').innerHTML = `${Data.data.datasets[0].data[2].toFixed()} %`
// }

// 表格A
function InitialStackChartA(Data) {
  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)
  const kwhData = Data.Grid_Data.map(item => item.KWH_TOT)
  const co2eData = Data.Grid_Data.map(item => item.CO2E_COUNT)

  const ctx = document.getElementById('stackBarA').getContext('2d')

  const mixedChart = new Chart(ctx, {
    data: {
      labels: reportDate,
      datasets: [
        {
          type: 'line',
          label: 'CO2E',
          data: co2eData,
          borderColor: '#FFC107',
          backgroundColor: '#FFC107',
          yAxisID: 'y1',
        },
        {
          type: 'bar',
          label: 'Kwh tot',
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
          min: 700,
          type: 'linear',
          position: 'right',
          beginAtZero: 'true',
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
          text: '近12月用電量與碳用量',
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

// 表格 Day by Day
function InitialStackChartB(Data) {
  document.querySelector('#stackBarBTitle').innerHTML = `昨日用電量比較`
  const ctx = document.getElementById('stackBarB').getContext('2d')
  const nowKwData = Data.Grid_Data.map(item => item.NOW_KW)
  const lastKwData = Data.Grid_Data.map(item => item.LAST_KW)

  const nowDate = Data.Grid_Data.map(item => item.NOW_DATE)
  const lastDate = Data.Grid_Data.map(item => item.LAST_DATE)

  const Dates = [...new Set([...lastDate, ...nowDate])]

  const stackBarB = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: Dates,
          datasets: [
              {
                  label: '昨日用電量',
                  data: Dates.map(date => lastDate.includes(date) ? lastKwData[lastDate.indexOf(date)] : null),
                  backgroundColor: '#FFC107',
                  barPercentage: 1.5, 
                  categoryPercentage: 1.5
              },
              {
                label: '當前用電量',
                data: Dates.map(date => nowDate.includes(date) ? nowKwData[nowDate.indexOf(date)] : null),
                backgroundColor: '#38FFB3',
                barPercentage: 1.5, 
                categoryPercentage: 1.5

            }
          ]
      },
      options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
              y: {
                  ticks: {
                      color: 'white',
                      beginAtZero: true
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
              }
          }
      }
  })
}

// 更新表格 Day
function UpdateStackChartB(Data) {
  const nowKwData = Data.Grid_Data.map(item => item.NOW_KW)
  const lastKwData = Data.Grid_Data.map(item => item.LAST_KW)

  const nowDate = Data.Grid_Data.map(item => item.NOW_DATE)
  const lastDate = Data.Grid_Data.map(item => item.LAST_DATE)

  const drawStackB = Chart.getChart('stackBarB')
  drawStackB.data.datasets[0].data = lastKwData
  drawStackB.data.datasets[1].data = nowKwData
  drawStackB.data.datasets[2].data = nowDate
  drawStackB.data.datasets[3].data = lastDate

  drawStackB.update()
} 

// ALL FAB 
function InitialMultiLine(Data) {
  const ctx = document.getElementById('multiLineA').getContext('2d')

  console.log(Data)

  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)


  const fab1Data = Data.Grid_Data.map(item => item.NONEMS1)
  const fab2Data = Data.Grid_Data.map(item => item.EMS)
  const fab3Data = Data.Grid_Data.map(item => item.NONEMS2)
  const allFabData = Data.Grid_Data.map(item => item.GEMTEK_VN)

  const maxAllFabData = Math.max(...allFabData) * 1.05 // 跟著 allFabData 讓 Max 最大值能夠動態顯示

  //for allFabData find max value
  // let max_value =12000;
  // max_value = max_value+(max_value*0.1);

  const multiLineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: reportDate,
          datasets: [
              {
                label: 'GEMTEK全廠',
                data: allFabData,
                borderColor: '#fa321b',
                backgroundColor: '#fa321b',
                fill: false,
              },
              {
                  label: 'Non-EMS一廠',
                  data: fab1Data,
                  borderColor: '#FFC107',
                  backgroundColor: '#FFC107',
                  fill: false,
              },
              {
                  label: 'EMS廠',
                  data: fab2Data,
                  borderColor: '#00ACC1',
                  backgroundColor: '#00ACC1',
                  fill: false,
              },
              {
                  label: 'Non-EMS二廠',
                  data: fab3Data,
                  borderColor: '#4CAF50',
                  backgroundColor: '#4CAF50',
                  fill: false,
              }
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
                  text: '各廠區每日用電曲線',
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
  const fab1Data = Data.Grid_Data.map(item => item.NONEMS1)
  const fab2Data = Data.Grid_Data.map(item => item.EMS)
  const fab3Data = Data.Grid_Data.map(item => item.NONEMS2)
  const allFabData = Data.Grid_Data.map(item => item.GEMTEK_VN)

  const drawLineChart = Chart.getChart('multiLineA')
  drawLineChart.data.labels = reportDate
  drawLineChart.data.datasets[0].data = fab1Data
  drawLineChart.data.datasets[1].data = fab2Data
  drawLineChart.data.datasets[2].data = fab3Data
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
              <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
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
              <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
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
              <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
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
              <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
              <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
          </tr>`
  })
  return content
}

// RAKNING
function InitialGridC(gridData) {
  const table = document.createElement('table')
  table.classList.add('table-auto', 'w-full', 'text-white')

  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')

  const headers = ['Department', 'kWh', 'CO2E']
  headers.forEach(header => {
      const th = document.createElement('th')
      th.classList.add('px-4', 'py-2', 'text-left', 'border-b', 'border-gray-600')
      th.textContent = header
      headerRow.appendChild(th)
  })

  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = document.createElement('tbody')
  gridData.forEach(row => {
      const tr = document.createElement('tr')

      const titleTd = document.createElement('td')
      titleTd.classList.add('px-4', 'py-2', 'border-b', 'border-gray-600')
      titleTd.textContent = row.FAB
      tr.appendChild(titleTd)

      const outputTd = document.createElement('td')
      outputTd.classList.add('px-4', 'py-2', 'border-b', 'border-gray-600')
      outputTd.textContent = row.KWH.toFixed(2)
      tr.appendChild(outputTd)

      const co2eTd = document.createElement('td')
      co2eTd.classList.add('px-4', 'py-2', 'border-b', 'border-gray-600')
      co2eTd.textContent = row.CO2E
      tr.appendChild(co2eTd)

      tbody.appendChild(tr)
  })

  table.appendChild(tbody)

  return table
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
