let IOTchartSID = '358767276276553'
let IOTchartData

async function fetchData() {
    try {
        IOTchartData = await getGridData(IOTchartSID)
        console.log(IOTchartData)
        drawIOTchart(IOTchartData)
    } catch (error) {
        console.log('Error:', error)
    }
}
fetchData()

function drawIOTchart(Data){
    // EQP_NO 分組顏色
    const colors = {
        'JV02': {
            KWH_USE: 'rgba(14, 144, 179, .8)', 
            KWH_EACH: 'rgba(239, 177, 107, .8)' 
        },
        'JV03': {
            KWH_USE: 'rgba(149, 173, 223, .8)',
            KWH_EACH: 'rgba(173, 220, 96, .8)'
        },
        'JV04': {
            KWH_USE: 'rgba(202, 252, 121, .8)', 
            KWH_EACH: 'rgba(229, 87, 139, .8)' 
        },
        'JA14': {
            KWH_USE: 'rgba(241, 131, 197, .8)',
            KWH_EACH: 'rgba(11, 239, 207, .8)'
        }
    }
    
    const eqpNos = ['JV02', 'JV03', 'JV04', 'JA14']

    eqpNos.forEach(eqp => {
        const getData = Data.Grid_Data.filter(item => item.EQP_NO === eqp)
        const dates = getData.map(item => item.DATE)
        
        const datasets = [
            {
            // KWH_EACH
                label: `${GetLangDataV2('KWH_EACH')}`,
                data: getData.map(item => item.KWH_EACH),
                backgroundColor: colors[eqp].KWH_EACH,
                borderColor: colors[eqp].KWH_EACH,
                borderWidth: 2,
                type: 'line',
                fill: false,
                yAxisID: 'y1'
            },
            {
            // KWH_USE
                label: `${GetLangDataV2('KWH_USE')}`,
                data: getData.map(item => item.KWH_USE),
                backgroundColor: colors[eqp].KWH_USE,
                borderColor: colors[eqp].KWH_USE,
                borderWidth: 1,
                type: 'bar',
                yAxisID: 'y'
            },
        ]

    const canvasId = `beBox${eqp}`
    const resetZoomId = `resetZoom${eqp}`

    // 圖表
    const ctx = document.getElementById(canvasId).getContext('2d')
    const mixedChart = new Chart(ctx, {
        data: {
            labels: dates,
            datasets: datasets 
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 0,
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        color: '#fff'
                    },
                    title: {
                        display: true,
                        text: GetLangDataV2('KWH_USE'),
                        color: '#fff'
                    }
                },
                y1: {
                    max: 0.1,
                    min: 0,
                    type: 'linear',
                    position: 'right',
                    beginAtZero: true,
                    ticks: {
                        color: '#fff'
                    },
                    title: {
                        display: true,
                        text: GetLangDataV2('KWH_EACH'),
                        color: '#fff'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ticks: {
                        color: '#fff'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                },
                title: {
                    display: false,
                    text: GetLangDataV2('IoT Power Usage Chart'),
                    color: '#fff',
                    font: {
                        size: 24
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x',
                        modifierKey: 'ctrl',
                    },
                    zoom: {
                        drag: {
                            enabled: true 
                        },
                        mode: 'x',
                    }
                }
            }
        }
    })
    document.getElementById(resetZoomId).addEventListener('click', function() {
        mixedChart.resetZoom()
    })
  })
}


// 回到上一頁
document.getElementById('btnBackURL').addEventListener('click', () => {
    const route = document.referrer
    const nowRoute = window.location.href

    if(nowRoute) {
     window.location.href = route
    } else {
     window.location.href = '../../EMS-index.html' // 回總看板入口
    }
 })