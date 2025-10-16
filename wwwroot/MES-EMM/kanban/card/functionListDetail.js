let meterdata //電表資料
let meterdataSID = "347808894706097"

// 定義variable
let Vln_avg = []
let Vll_avg = []
let I_avg = []
let kVA_tot = []
let kvar_tot = []
let kW_tot = []
let Frequence = []
let PF_tot = []
let HoursArray = [] //近24小時

//網址取參
var Request = {}
var getUrlParameter = function getUrlParameter() {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i
    var par = {}
    for (i = 0 ; i < sURLVariables.length ; i++) {
        sParameterName = sURLVariables[i].split('=')
        par[sParameterName[0]] = decodeURI(sParameterName[1])
    }
    return par
}
Request = getUrlParameter()
var EQP_NO = Request["EQP_NO"]
var PATH = Request["PATH"]
$('#EQP_NO').text(EQP_NO)

async function fetchData() {
    meterdata = await getGridData(meterdataSID)
    gridData = meterdata.Grid_Data

    console.log(gridData)

    //取得不重複時間-1
    var uniqueReportHours = new Set()

    let eqpName = ''
    let eqpFab = ''
    let latestDate = ''

    //GRID資料分類
    gridData.forEach(function (e) {
        if (e.EQP_NO === EQP_NO) {
            switch (e.AUTODC_ITEM) {
                case 'Vln_avg':
                    Vln_avg.push(e.AUTODC_OUTPUT)
                    break
                case 'Vll_avg':
                    Vll_avg.push(e.AUTODC_OUTPUT)
                    break
                case 'I_avg':
                    I_avg.push(e.AUTODC_OUTPUT)
                    break
                case 'kW_tot':
                    kW_tot.push(e.AUTODC_OUTPUT)
                    break
                case 'kVA_tot':
                    kVA_tot.push(e.AUTODC_OUTPUT)
                    break
                case 'kvar_tot':
                    kvar_tot.push(e.AUTODC_OUTPUT)
                    break
                case 'Frequence':
                    Frequence.push(e.AUTODC_OUTPUT)
                    break
                case 'PF_tot':
                    PF_tot.push(e.AUTODC_OUTPUT)
                    break
            }
            uniqueReportHours.add(e.REPORT_TIME.split('T')[1].slice(0, 5))

            eqpName = e.EQP_NAME
            eqpFab = e.FAB

            if (!latestDate || new Date(e.DATE) > new Date(latestDate)) {
                latestDate = e.DATE
            }
        }
    })

    //取得不重複時間-2
    HoursArray = Array.from(uniqueReportHours)

    $('#EQP_NAME').text(eqpName)
    $('#FAB').text(eqpFab)
    $('#DATE').text(latestDate)

    //畫圖
    const charts = setChart()
    // bindUpdateButton(charts)
}
fetchData()

function updateChart(chart, newData) {
    if (chart && chart.data && chart.data.datasets) {
        chart.data.datasets.forEach((dataset, index) => {
            dataset.data = newData[index]
        })
        chart.update()
    }
}

function setChart() {
    var optionSet = {
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
                min: undefined,
                max: undefined,
                ticks: {
                    color: 'white',
                }
            },
            x: {
                ticks: {
                    color: 'white',
                    // callback: function (value, index, ticks) {
                    //     if (index % 2 === 0) {
                    //         return this.getLabelForValue(value)
                    //     }
                    //     return ''
                    // }
                }
            }
        },
    }

    var optionSet2 = JSON.parse(JSON.stringify(optionSet))
    optionSet2.scales.y.min = 49.5
    optionSet2.scales.y.max = 60.5

    var optionSet3 = JSON.parse(JSON.stringify(optionSet))
    optionSet3.scales.y.min = 0

    // Vln_avg
    // optionSet.scales.y.min = Math.min.apply(null, Vln_avg) - 5
    // optionSet.scales.y.max = Math.max.apply(null, Vln_avg) + 5
    // var ctx = document.getElementById('beBoxA').getContext('2d')
    // var beBoxA = new Chart(ctx, {
    //     type: 'line',
    //     data: {
    //         labels: HoursArray,
    //         datasets: [
    //             {
    //                 label: 'Vln_avg',
    //                 data: Vln_avg,
    //                 borderColor: 'rgb(75, 192, 192)',
    //                 backgroundColor: 'transparent',
    //                 tension: 0.1
    //             }
    //         ]
    //     },
    //     options: optionSet
    // })

    // Vll_avg
    optionSet.scales.y.min = Math.min.apply(null, Vll_avg) - 5
    optionSet.scales.y.max = Math.max.apply(null, Vll_avg) + 5
    var ctx2 = document.getElementById('beBoxB').getContext('2d')
    var beBoxB = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                    label: 'Vll_avg',
                    data: Vll_avg,
                    borderColor: 'rgb(55, 142, 252)',
                    backgroundColor: 'transparent',
                    tension: 0.1
                }
            ]
        },
        options: optionSet
    })

    // I_avg
    optionSet.scales.y.min = Math.min.apply(null, I_avg) - 5
    optionSet.scales.y.max = Math.max.apply(null, I_avg) + 5
    var ctx3 = document.getElementById('beBoxC').getContext('2d')
    var beBoxC = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                    label: 'I_avg',
                    data: I_avg,
                    borderColor: 'rgb(55, 142, 252)',
                    backgroundColor: 'transparent',
                    tension: 0.1
                }
            ]
        },
        options: optionSet
    })

    var ctx4 = document.getElementById('beBoxD').getContext('2d')
    var beBoxD = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                    label: 'kW_tot',
                    data: kW_tot,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'transparent',
                    tension: 0.1
                },
                // {
                //     label: 'kVA_tot',
                //     data: kVA_tot,
                //     borderColor: 'rgb(55, 142, 252)',
                //     backgroundColor: 'transparent',
                //     tension: 0.1
                // },
                // {
                //     label: 'kvar_tot',
                //     data: kvar_tot,
                //     borderColor: 'rgb(192, 171, 75)',
                //     backgroundColor: 'transparent',
                //     tension: 0.1
                // }
            ]
        },
        options: optionSet3
    })

    var ctx5 = document.getElementById('beBoxF').getContext('2d')
    var beBoxF = new Chart(ctx5, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                    label: 'PF_tot',
                    data: PF_tot,
                    borderColor: 'rgb(55, 142, 252)',
                    backgroundColor: 'transparent',
                    tension: 0.1
                }
            ]
        },
        options: optionSet3
    })

    var ctx3 = document.getElementById('beBoxE').getContext('2d')
    var beBoxE = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                    label: 'Frequence',
                    data: Frequence,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'transparent',
                    tension: 0.1
                }
            ]
        },
        options: optionSet2
    })

    // return { beBoxA, beBoxB, beBoxC, beBoxD, beBoxE, beBoxF }
    return { beBoxB, beBoxC, beBoxD, beBoxE, beBoxF }
}

// 回到上一頁
document.getElementById('btnBackURL').addEventListener('click', () => {
    const route = document.referrer
    const nowRoute = window.location.href

    if(route && route !== nowRoute) {
     window.location.href = route
    } else {
     window.location.href = '../../EMS-index.html' // 回總看板入口
    }
 })