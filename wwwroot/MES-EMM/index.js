let airListData // AIR-FLOW
let airListSID = '353775257206643'

let nListData // N-FLOW
let nListSID = '353775271010728'

let tapwaterListData // Tap-Water
let tapwatertSID = '353781152726098'

let wastewaterListData // Waste Water
let wastewaterSID = '353781183330744'

// let emListData
// let emListDataSID = '358522196246850'

// EMS-近一周碳用量 C
let drawStackCsid = "355055803583277"

let doughnutA // Carbon A
let doughnutASID = "321618901510638"

let stackChartASID = "321981534510696" // 12 months

let stackBChartBSID = "356091272190936" // Max CO2E

let multiLineASID = '353692416180040' // All Fabs

let DrawDoughnut
let drawStackA
let drawStackB
let drawStackC
let drawLineChart

// 圖表
async function fetchData() {
  let DoughnutData = await getGridData(doughnutASID)
  let StackData = await getGridData(stackChartASID)
  let stackBData = await getGridData(stackBChartBSID)
  let multiLineA = await getGridData(multiLineASID)
  let StackBarC = await getGridData(drawStackCsid)

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

  if(StackBarC) {
    InitialGridC(StackBarC)
  }

  // 表格
  let airListData = await getGridData(airListSID)
  let nListData = await getGridData(nListSID)
  let tapwaterListData = await getGridData(tapwatertSID)
  let wastewaterListData = await getGridData(wastewaterSID)

  // EM 表格版本(定義名稱不動)
  // let airListData = await getGridData(emListDataSID)
  // let nListData = await getGridData(emListDataSID)
  // let tapwaterListData = await getGridData(emListDataSID)
  // let wastewaterListData = await getGridData(emListDataSID)

  if (airListData) {
    const airContent = InitialAirFlow(airListData.Grid_Data)
    document.getElementById('air-flow-content').innerHTML = airContent
}

  if (nListData) {
    const nFlowContent = InitialNFlow(nListData.Grid_Data)
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

  setTimeout(() => {
    document.location.reload();
  }, 900000)

}
fetchData()

// 更新資料
async function refreshData() {
  let DoughnutData = await getGridData(doughnutASID)
  let drawStackA = await getGridData(stackChartASID)
  let drawStackB = await getGridData(stackBChartBSID)
  let drawLineChart = await getGridData(multiLineASID)
  let drawStackC = await getGridData(drawStackCsid)

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

  if (drawStackB) {
    UpdateStackChartB(drawStackB)
  }

  // 表格
  // let airListData = await getGridData(airListSID)
  // let nListData = await getGridData(nListSID)
  // let tapwaterListData = await getGridData(tapwatertSID)
  // let wastewaterListData = await getGridData(wastewaterSID)

  // EM 表格版本(定義名稱不動)
  let airListData = await getGridData(emListDataSID)
  let nListData = await getGridData(emListDataSID)
  let tapwaterListData = await getGridData(emListDataSID)
  let wastewaterListData = await getGridData(emListDataSID)
  

  if (airListData) {
    const airContent = InitialAirFlow(airListData.Grid_Data)
    document.getElementById('air-flow-content').innerHTML = airContent
  }

  if (nListData) {
    const nFlowContent = InitialNFlow(nListData.Grid_Data)
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
  let fillBgColor = ['#19818F', '#B2F4BE']

  // 標題
  let typeTitle = [GetLangDataV2('Max kW (kW)'), GetLangDataV2('Remain')]

  let ChartADATA = [
    Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').VALUE,
    Data.Grid_Data.find(item => item.TYPE === 'LAVE_VALUE').VALUE,
    // Data.Grid_Data.find(item => item.TYPE === 'SOLAR_POWER').VALUE
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
      // responsive: true,
      // maintainAspectRatio: false,
      devicePixelRatio: 1,
      aspectRatio: 1.5,
    },
  })

  // 顯示合同容量和用電量
  let Total_kW = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').TOTAL_KW || 0;
  let CQtext = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE' && item.CQ != null)?.CQ || 0
  let kwTOT = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE' && item.KW_TOT != null)?.KW_TOT || 0
  document.querySelector('#doughnutATitle').innerHTML = `${GetLangDataV2('Max kW (kW)')}: ${Total_kW} kW<br>
  ${GetLangDataV2('kW Now (kW)')} : ${kwTOT} kW<br>
  ${GetLangDataV2('Contract Cap')}: ${CQtext} kW
  `
  document.querySelector('#doughnutAKID').innerHTML = `${ChartADATA[0].toFixed(0, 2)} %`
}

// 更新甜甜圈
function UpdateDoughnut(Data) {
  // 更新甜甜圈圖數據
  let newChartADATA = [
    Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').VALUE,
    Data.Grid_Data.find(item => item.TYPE === 'LAVE_VALUE').VALUE,
    // Data.Grid_Data.find(item => item.TYPE === 'SOLAR_POWER').VALUE
  ]
  
  DrawDoughnut.data.typeTitle = ['Max kW (kW)', 'Remain', 'Solar']
  DrawDoughnut.data.datasets[0].data = newChartADATA

  DrawDoughnut.update()

  let Total_kW = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE').TOTAL_KW || 0;
  let CQtext = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE' && item.CQ != null)?.CQ || 0
  let kwTOT = Data.Grid_Data.find(item => item.TYPE === 'USE_VALUE' && item.KW_TOT != null)?.KW_TOT || 0
  document.querySelector('#doughnutATitle').innerHTML = `${GetLangDataV2('Max kW (kW)')}: ${Total_kW} kW<br>
  ${GetLangDataV2('Contract Cap')}: ${CQtext} kW<br>
  ${GetLangDataV2('kW Now (kW)')} : ${kwTOT} kW<br>
  `
  document.querySelector('#doughnutAKID').innerHTML = `${newChartADATA[0].toFixed()} %`
}

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
          label: 'CO2e',
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
          min: 0,
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
          text: GetLangDataV2('kWh & Carbon (Last 12 Months)'),
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
function InitialStackChartB(Data) {
  // console.log(Data)

  const labelOrder = ['YEAR', 'MONTH', 'DAY']

  const labelName = {
    'YEAR': [GetLangDataV2('Year'), GetLangDataV2('highest')],
    'MONTH': [GetLangDataV2('Month'), GetLangDataV2('highest')],
    'DAY': [GetLangDataV2('Today')]
  }

  const labels = Data.Grid_Data.map(item =>  item.LABEL)
  const maxCO2E = Data.Grid_Data.map(item => item.MAX_CO2E)

  const correctOrder = labelOrder.map(label => {
    const index = labels.indexOf(label)
    return {
      label: labelName[label] || label,
      data: maxCO2E[index],
      // date: Data.Grid_Data[index].REPORT_TIME.split('T')[0]
      date: Data.Grid_Data[index].REPORT_TIME
    }
  })


  const orderedLabel = correctOrder.map(item => item.label)
  const orderedCO2E = correctOrder.map(item => item.data)
  const co2eDates = correctOrder.map(item => item.date)
  
  const ctx = document.getElementById('stackBarB').getContext('2d')
  document.getElementById('stackBarBTitle').innerHTML = GetLangDataV2('Max Carbon Per Year/Month/Day')

  const stackBarB = new Chart(ctx, {
    data: {
        labels: orderedLabel,
        datasets: [
          {
            type: 'line',
            label: 'CO2e',
            data: orderedCO2E,
            borderColor: '#ed96fa',
            backgroundColor: '#ed96fa',
          },
          {
              type: 'bar',
              label: 'MAX CO2e',
              data: orderedCO2E,
              backgroundColor: [
                  '#ffe347',  
                  '#38FFB3',
                  '#36A2EB'
              ],
          },
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
              display: false,
              labels: {
                  color: 'white',
              }
            },
            tooltip: {
              callbacks: {
                  label: function(tooltipItem) {
                      const index = tooltipItem.dataIndex
                      const value = tooltipItem.raw.toFixed(2)
                      const date = co2eDates[index]
                      return `${GetLangDataV2('Date: ')}${date} , CO2e: ${value} T`
                  }
              }
          }            
        }
    }
})
}

// ALL FAB 
function InitialMultiLine(Data) {
  const ctx = document.getElementById('multiLineA').getContext('2d')

  console.log(Data)

  const reportDate = Data.Grid_Data.map(item => item.REPORT_DATE)

  const allFabData = Data.Grid_Data.map(item => item.MAIN)
  const em1Data = Data.Grid_Data.map(item => item.JV02)
  const em2Data = Data.Grid_Data.map(item => item.JV03)
  const em3Data = Data.Grid_Data.map(item => item.JV04)
  const em4Data = Data.Grid_Data.map(item => item.JA14)

  const maxAllFabData = Math.max(...allFabData) * 1.05 // 跟著 allFabData 讓 Max 最大值能夠動態顯示

  const multiLineChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: reportDate,
          datasets: [
              {
                label: 'YUANYANG',
                data: allFabData,
                borderColor: '#baff80',
                backgroundColor: '#baff80',
                fill: false,
              },
              {
                  label: 'JV-02',
                  data: em1Data,
                  borderColor: '#ea99ff',
                  backgroundColor: '#ea99ff',
                  fill: false,
              },
              {
                  label: 'JV-03',
                  data: em2Data,
                  borderColor: '#80ffe8',
                  backgroundColor: '#80ffe8',
                  fill: false,
              },
              {
                  label: 'JV-04',
                  data: em3Data,
                  borderColor: '#4CAF50',
                  backgroundColor: '#4CAF50',
                  fill: false,
              },
              {
                label: 'JA-14',
                data: em4Data,
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
  const row = gridData[1]
  content += `
  <tr>
    <td colspan="2" class="border-b border-gray-400 my-4"></td>
  </tr>
  <tr>
      <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
      <td class="pt-2 text-xs">${row.KWH_USE}</td>
  </tr>
  <tr>
    <td class="pr-4 pt-2 text-xs">${GetLangDataV2('CO2E:')}</td>
    <td class="pt-2 text-xs">${row.CO2E_COUNT}</td>
  </tr>    
  `

  // gridData.forEach(row => {
  //     content += `
  //         <tr>
  //           <td colspan="2" class="border-b border-gray-400 my-4"></td>
  //         </tr>
  //         <tr>
  //             <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
  //             <td class="pt-2 text-xs">${row.KWH_USE}</td>
  //         </tr>`
  // })
  return content
}

// N-FLOW
function InitialNFlow(gridData) {
  let content = ''
  const row = gridData[2]
  content += `
  <tr>
    <td colspan="2" class="border-b border-gray-400 my-4"></td>
  </tr>
  <tr>
      <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
      <td class="pt-2 text-xs">${row.KWH_USE}</td>
  </tr>
  <tr>
    <td class="pr-4 pt-2 text-xs">${GetLangDataV2('CO2E:')}</td>
    <td class="pt-2 text-xs">${row.CO2E_COUNT}</td>
  </tr>
  `

  // gridData.forEach(row => {
  //     content += `
  //         <tr>
  //           <td colspan="2" class="border-b border-gray-400 my-4"></td>
  //         </tr>
  //         <tr>
  //             <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
  //             <td class="pt-2 text-xs">${row.DEGREE_TOTAL}</td>
  //         </tr>`
  // })
  return content
}

// Tap-Water
function InitialTapWater(gridData) {
  let content = ''
  const row = gridData[3]
  content += `
  <tr>
    <td colspan="2" class="border-b border-gray-400 my-4"></td>
  </tr>
  <tr>
      <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
      <td class="pt-2 text-xs">${row.KWH_USE}</td>
  </tr>
  <tr>
    <td class="pr-4 pt-2 text-xs">${GetLangDataV2('CO2E:')}</td>
    <td class="pt-2 text-xs">${row.CO2E_COUNT}</td>
  </tr>    
  `

  // gridData.forEach(row => {
  //     content += `
  //         <tr>
  //           <td colspan="2" class="border-b border-gray-400 my-4"></td>
  //         </tr>
  //         <tr>
  //             <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
  //             <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
  //         </tr>`
  // })
  return content
}

// Waste Water
function InitialWasteWater(gridData) {
  let content = ''
  const row = gridData[0]
  content += `
  <tr>
    <td colspan="2" class="border-b border-gray-400 my-4"></td>
  </tr>
  <tr>
      <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
      <td class="pt-2 text-xs">${row.KWH_USE}</td>
      </tr>
  <tr>
    <td class="pr-4 pt-2 text-xs">${GetLangDataV2('CO2E:')}</td>
    <td class="pt-2 text-xs">${row.CO2E_COUNT}</td>
  </tr>    
      `

  // gridData.forEach(row => {
  //     content += `
  //         <tr>
  //           <td colspan="2" class="border-b border-gray-400 my-2"></td>
  //         </tr>
  //         <tr>
  //             <td class="pr-4 pt-2 text-xs">${row.EQP_NO}</td>
  //             <td class="pt-2 text-xs">${row.AUTODC_OUTPUT}</td>
  //         </tr>`
  // })
  return content
}

// 近一周碳用量
function InitialGridC(Data) {
  console.log(Data)
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
