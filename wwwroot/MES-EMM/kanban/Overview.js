//chart圖設定
var optionSet = {
    responsive: true,
    plugins: {
        legend: {
            labels: {
                color: 'white'
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: 'white'
            }
        },
        x: {
            ticks: {
                color: 'white'
            }
        }
    },
}

// 當前X軸增加label (小時)
const XYlabelHour = JSON.parse(JSON.stringify(optionSet))
XYlabelHour.scales.x.title = {
    display: true,
    text: GetLangDataV2('Hours (hrs)'),
    color: '#fff'
}

// 為每個機台固定一個顏色方便辨識用
const colorEQP = {
    "ACB1": {borderColor: 'rgba(6, 204, 135, 1)', backgroundColor: 'rgba(6, 204, 135, 0.5)'}, // lightgreen
    "ACB2": {borderColor: 'rgba(255, 25, 40, 1)', backgroundColor: 'rgba(255, 75, 90, 0.5)'}, // red
    "LV1_MAY": {borderColor: 'rgba(0, 75, 255, 1)', backgroundColor: 'rgba(50, 140, 255, 0.5)'}, // blue
    "MSB_ATS": {borderColor: 'rgba(255, 255, 50, 1)', backgroundColor: 'rgba(250, 255, 0, 0.5)'}, // yellow
    "TPPLV": {borderColor: 'rgba(0, 255, 30, 1)', backgroundColor: 'rgba(0, 255, 25, 0.5)'}, // green
    "LV1_MAY_ATS": {borderColor: 'rgba(180, 0, 255, 1)', backgroundColor: 'rgba(180, 0, 255, 0.5)'}, // purple
    "MP1": {borderColor: 'rgba(255, 40, 151, 1)', backgroundColor: 'rgba(255, 40, 151, 0.5)'}, // PINK
    "MP2": {borderColor: 'rgba(250, 80, 0, 1)', backgroundColor: 'rgba(250, 80, 0, 0.5)'}, // ORANGE
    "ACMP": {borderColor: 'rgba(0, 255, 250, 1)', backgroundColor: 'rgba(0, 255, 250, 0.5)'}, // #42f59e
}

// 日用電表
function GetKWHnow(data) {

    console.log(data)

    const reportTime = data.map(item => item.REPORT_HOUR)
    const kwhTOTAL = data.map(item => item.VALUE)

    document.getElementById('dailyAmount').textContent = kwhTOTAL[data.length - 1]

    var ctx = document.querySelector("#boxA")
    var boxA = new Chart(ctx, {
        type: 'line',
        data: {
            labels: reportTime,
            datasets: [
                {
                    label: GetLangDataV2('kWh (24 hrs)'),
                    data: kwhTOTAL,
                    borderColor: '#42f59e',
                    backgroundColor: "rgba(50, 180, 100, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    })
}

// Frequency
function getFreqData(data) {

    const reportDate = data.map(item => item.REPORT_HOUR)
    const Freq = data.map(item => item.VALUE)

    document.getElementById('freq').textContent = Freq[data.length - 1]

    var ctx = document.querySelector("#boxB")
    var boxB = new Chart(ctx, {
        type: 'line',
        data: {
            labels: reportDate,
            datasets: [
                {
                    label: GetLangDataV2('Frequency (24 hrs)'),
                    data: Freq,
                    borderColor: '#42f59e',
                    backgroundColor: "rgba(50, 180, 100, .5)",
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: optionSet
    })
}

// 功率因數
function GetPFData(data) {
    const hours = data.map(item => item.REPORT_HOUR)
    const PFvalue = data.map(item => item.VALUE)

    document.getElementById('PF').textContent = PFvalue[data.length - 1]

    var ctx = document.querySelector("#boxC")
    var boxC = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: GetLangDataV2('Power Factor (24 hrs)'),
                    data: PFvalue,
                    borderColor: '#42f59e',
                    backgroundColor: "rgba(50, 180, 100, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    })
}

// 需量
function GetKWData(data) {

    const hours = data.map(item => item.REPORT_HOUR)
    const kwTOT = data.map(item => item.VALUE)

    document.getElementById('kwTOT').textContent = kwTOT[data.length - 1].toFixed(2)

    var ctx = document.querySelector("#boxD")
    var boxD = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: GetLangDataV2('kW (24hrs)'),
                    data: kwTOT,
                    borderColor: '#42f59e',
                    backgroundColor: "rgba(50, 180, 100, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    })
}

// 電流
function GetCurrentData(data) {
    const hours = data.map(item => item.REPORT_HOUR)
    const current = data.map(item => item.VALUE)
    document.getElementById('current').textContent = current[data.length - 1]

    var ctx = document.querySelector("#boxE")
    var boxE = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: GetLangDataV2('Current (24 hrs)'),
                    data: current,
                    borderColor: '#42f59e',
                    backgroundColor: 'rgba(50, 180, 100, .5)',
                    fill: true,
                    tension: 0.1
                }
            ]
        },
        options: optionSet
    })
}

// 月用電量
function GetMonthlyData(data) {

    const daily = data.map(item => {
        const getDate = new Date(item.REPORT_DATE)
        return getDate.toISOString().slice(5, 10)
    })

    const allData = data.map(item => item.KWH_TOTAL)

    // 月用電量 (TEXT)
    const kwhText = data.reduce((sum, item) => sum + item.KWH_TOTAL, 0)
    document.getElementById('monthUsed').textContent = kwhText

    var ctx = document.querySelector("#boxF")
    var boxF = new Chart(ctx, {
        type: 'line',
        data: {
            labels: daily,
            datasets: [
                {
                    label: '',
                    data: allData,
                    borderColor: '#42f59e',
                    backgroundColor: "rgba(50, 180, 100, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: {
            plugins: {
                title: {
                    display: false,
                    text: 'All Factory Usage (Monthly)',
                    color: '#fff',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    }
                }
            },
        responsive: true,
        }
    })
}


// 總用電量
function GetTotalData(data) {

    const monthDate = data.map(item => item.MONTH)
    const totalData = data.map(item => item.KWH_TOTAL)

    
    // 總用電量(text)
    const kwhText = data.reduce((sum, item) => sum + item.KWH_TOTAL, 0)
    document.getElementById('yearUsed').textContent = kwhText.toFixed(2)

    var ctx = document.querySelector("#boxG")
    var boxG = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthDate,
            datasets: [
                {
                    label: '',
                    data: totalData,
                    borderColor: '#42f59e',
                    backgroundColor: "rgba(50, 180, 100, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: {
            plugins: {
                title: {
                    display: false,
                    text: '全廠本月用電量',
                    color: '#fff',
                    font: {
                        size: 18
                    }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    }
                }
            },
        responsive: true,
        }
    })
}

// 電表用電量比例
function GetHourlyData(data) {
    const colorEQP = {
        "JV02": 'rgba(127, 255, 212, 0.5)',
        "JV03": 'rgba(95, 158, 160, 0.5)', 
        "JV04": 'rgba(80, 200, 120, 0.5)', 
        "JA14": 'rgba(76, 187, 23, 0.5)',
        "MAIN": 'rgba(106, 207, 247, .5)'
      }

    const reportDate = data.map(item => item.REPORT_DATE)

    const eqpList = ['JV02', 'JV03', 'JV04', 'JA14', 'MAIN']

    // 提取 KWH 和 百分比數據
    const kwhData = eqpList.map(eqp => data[0][eqp])
    const percentageData = eqpList.map(eqp => {
        const percentKey = `${eqp}_PERCENT`
        const percent = data[0][percentKey]
        return typeof percent === 'number' ? percent : 0
    })

    const combinedData = eqpList.map((eqp, index) => ({
        eqp: eqp,
        kwh: kwhData[index],
        percent: percentageData[index],
        color: colorEQP[eqp]
    }))
    
    // 百分比排序（從大到小）
    combinedData.sort((a, b) => b.percent - a.percent)

    const sortedEqpList = combinedData.map(item => item.eqp)
    const sortedKwhData = combinedData.map(item => item.kwh)
    const sortedPercentageData = combinedData.map(item => item.percent)
    const sortedColors = combinedData.map(item => item.color)

    // console.log('Raw data:', data)
    // console.log('KWH data:', kwhData)
    // console.log('Percentage data:', percentageData)

    var ctx = document.querySelector("#boxH")
    var boxH = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedEqpList,
            datasets: [
                {
                    data: sortedKwhData,
                    backgroundColor: sortedColors
                }
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                // Datalabel 設定
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, ctx) => {
                        let dataIndex = ctx.dataIndex
                        let percent = sortedPercentageData[dataIndex]
                        let label = ctx.chart.data.labels[dataIndex]
                        return [`${label}`, `${percent.toFixed(1)}%`]
                    },
                    anchor: 'center',
                    align: 'center',
                    offset: 0,
                    borderWidth: 2,
                    borderColor: 'transparent',
                    borderRadius: 4,
                    // backgroundColor: (context) => {
                    //     return context.dataset.backgroundColor
                    // },
                    padding: {
                        top: 5,
                        bottom: 5,
                        left: 10,
                        right: 10
                    },
                    display: (context) => {
                        const dataset = context.dataset
                        const value = dataset.data[context.dataIndex]
                        return value > 0
                    }
                }
            },
            layout: {
                padding: {
                    top: 5,
                    bottom: 5,
                    left: 5,
                    right: 5
                }
            }
        },
        plugins: [ChartDataLabels]
    })
}

// 廠區用電趨勢(當月)
function GetFactoryCurrent(data) {

    // console.log(data)
    const reportDate = data.map(item => {
        const getDate = new Date(item.DATE)
        return getDate.toISOString().slice(5, 10)
    })

    const em1Data = data.map(item => item.JV02)
    const em2Data = data.map(item => item.JV03)
    const em3Data = data.map(item => item.JV04)
    const em4Data = data.map(item => item.JA14)

    var ctx = document.querySelector("#boxI")
    var boxI = new Chart(ctx, {
        type: 'line',
        data: {
            labels: reportDate,
            datasets: [
                {
                    label: 'JV-02',
                    data: em1Data,
                    borderColor: '#42ed9a',
                    backgroundColor: "rgba(56, 199, 125, .2)",
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'JV-03',
                    data: em2Data,
                    borderColor: '#80deea',
                    backgroundColor: 'rgba(128, 222, 234, .2)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: 'JV-04',
                    data: em3Data,
                    borderColor: '#ffd54f',
                    backgroundColor: 'rgba(255, 213, 79, .2)',
                    fill: true,
                    tension: 0.1 
                },
                {
                    label: 'JA-14',
                    data: em4Data,
                    borderColor: '#f177f7',
                    backgroundColor: 'rgba(255, 213, 79, .2)',
                    fill: true,
                    tension: 0.1 
                }
            ]
        },
        options: optionSet
    })
}

// 廠區用電趨勢(YEAR)
function GetFactoryMonthly(data) {

    var optionSet2 = {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        },
        scales: {
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    color: 'white'
                }
            },
            x: {
                stacked: true,
                ticks: {
                    color: 'white'
                }
            }
        },
    }

    // console.log(data)

    const reportDate = data.map(item => item.DATE)
    const em1Data = data.map(item => item.JV02)
    const em2Data = data.map(item => item.JV03)
    const em3Data = data.map(item => item.JV04)
    const em4Data = data.map(item => item.JA14)

    var ctx = document.querySelector("#boxJ")
    var boxJ = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: reportDate,
            datasets: [
                {
                    label: 'JV-02',
                    data: em1Data,
                    backgroundColor: "rgb(102, 204, 204)",
                    fill: true,
                    pointRadius: 0,
                },
                {
                    label: 'JV-03',
                    data: em2Data,
                    backgroundColor: 'rgb(100, 149, 237)',
                    fill: true,
                    pointRadius: 0,
                },
                {
                    label: 'JV-04',
                    data: em3Data,
                    backgroundColor: '#a2fb9b',
                    fill: true,
                    pointRadius: 0,
                },
                {
                    label: 'JA-14',
                    data: em4Data,
                    backgroundColor: '#f177f7',
                    fill: true,
                    pointRadius: 0,
                },
            ]
        },
        options: optionSet2
    })
}

// 設備用電排行
function UpdateRanking(data) {
    // console.log(data)
    const rankingTable = document.querySelector("table")
    const tbody = rankingTable.querySelector("tbody")
    tbody.innerHTML = "" // 清空表格內容

    data.forEach(item => {
        const row = document.createElement("tr")
        // Ranking = 排名
        // EQP_NO = 設備編號
        // KWH_TOT = 用電量
        // <td>${item.RANKING}</td> 
        row.innerHTML = `
            <td class="pe-2">${item.EQP_NO}</td>
            <td class="pa-2">${item.DIFF_VALUE}</td>
        `
        tbody.appendChild(row)
    })
}


/*************************************************************************/
/********************************Functions********************************/


// 取得資料
async function LoadData() {
    // 圖表設定
    let dailyData = await getGridData('351878418033821') // 當前用電量 (kWh)
    GetKWHnow(dailyData.Grid_Data)
    let CCData = await getGridData('351880170106094') // Frequency
    getFreqData(CCData.Grid_Data)
    let PFData = await getGridData('351880238040271') // 功率因數
    GetPFData(PFData.Grid_Data)
    let KWData = await getGridData('351949611456205') // 需量
    GetKWData(KWData.Grid_Data)
    let currentData = await getGridData('351950401870835') // 當前電流
    GetCurrentData(currentData.Grid_Data)

    let MonthlyData = await getGridData('351961949823191') // 月用電量
    GetMonthlyData(MonthlyData.Grid_Data)
    // let totalMonthTextData = await getGridData('355235271906810') // 月用電量(text)
    // GetMonthText(totalMonthTextData.Grid_Data)
    let totalData = await getGridData('351962271030887') // 總用電量
    GetTotalData(totalData.Grid_Data)
    // let totalTextData = await getGridData('355241468866997') // 總用電量(TEXT)
    // GetTotalTextData(totalTextData.Grid_Data)

    let hourlyData = await getGridData('351962500510111') // 電表用電量比例
    GetHourlyData(hourlyData.Grid_Data)
    let factoryCurrent = await getGridData('351963756820521') // 廠區用電趨勢 ( 當前 )
    GetFactoryCurrent(factoryCurrent.Grid_Data)
    let factoryMonthly = await getGridData('351963800963076') // 廠區用電趨勢 ( 月 )
    GetFactoryMonthly(factoryMonthly.Grid_Data)

    // 資料表格設定
    // let dashboardData = await getGridData('351958554143803') // 表格資料
    // UpdateDashBoard(dashboardData.Grid_Data)

    // 用電排行
    let rankingData = await getGridData('351965251420647') // 設備用電排行
    UpdateRanking(rankingData.Grid_Data)
}
LoadData()

updateTime('timming')


// 圖表API (舊版)
function GetChartDataOld(SID) {
    try {
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
                DataR = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi, 'tech'))
            }
        })

        return [Data, Structer]
    }
    catch {
        return null
    }

}