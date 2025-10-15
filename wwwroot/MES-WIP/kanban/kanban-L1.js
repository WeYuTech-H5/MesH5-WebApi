let dcDataSid = '353686518696440';
let dcData;
let cncDataSid = '353686533736470';
let cncData;
let qcDataSid = '353686571783530';
let qcData;

let colorDef = '#d4d4d4c0'
let colorLow = '#EB3645'
let colorMid = '#FFA552'
let colorHigh = '#5bbfb3'

let dcCtx = document.getElementById('dcChart').getContext('2d');
let cncCtx = document.getElementById('cncChart').getContext('2d');
let qcCtx = document.getElementById('qcChart').getContext('2d');

let dcChart,cncChart,qcChart;

$(document).ready(async function() {
    let dcDataGrid = await getGridData(dcDataSid)
    let cncDataGrid = await getGridData(cncDataSid)
    let qcDataGrid = await getGridData(qcDataSid)
    dcData = dcDataGrid.Grid_Data[0]
    cncData = cncDataGrid.Grid_Data[0]
    qcData = qcDataGrid.Grid_Data[0]
    $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

    // 卡片圖表
    setCard()

    // 定時更新圖表
    setInterval(() => {
        refreshCard()
    }, 30000);
});

function setCard(){
    // 畫圓餅圖
    dcChart = createEqpChart(dcCtx, dcData.OEE);
    cncChart = createEqpChart(cncCtx, cncData.OEE);
    qcChart = createQcChart(qcCtx, qcData.COMPLETION_RATE);
    
    //填入數字 沒有相關數據則為 -1
    // DC
    $('#dcOEE').text(dcData.OEE);
    $('#dcAVL').text(dcData.AVAILABILITY);
    dcData.PERFORMANCE === -1
        ? $('#dcPRF').text('-')
        : $('#dcPRF').text(dcData.PERFORMANCE)
    dcData.YEILD === -1
        ? $('#dcYLD').text('-')
        : $('#dcYLD').text(dcData.YEILD)
    // CNC
    $('#cncOEE').text(cncData.OEE);
    $('#cncAVL').text(cncData.AVAILABILITY);
    cncData.PERFORMANCE === -1
        ? $('#cncPRF').text('-')
        : $('#cncPRF').text(cncData.PERFORMANCE)
    cncData.YEILD === -1
        ? $('#cncYLD').text('-')
        : $('#cncYLD').text(cncData.YEILD)
    // QC
    $('#qcCompletion').text(qcData.COMPLETION_RATE);
    $('#ENTERED_TIME_COUNT').text(qcData.ENTERED_TIME_COUNT);
    $('#TOTAL_TIME_COUNT').text(qcData.TOTAL_TIME_COUNT);
    qcData.PASS_RATE === -1
        ? $('#qcPass').text('-')
        : $('#qcPass').text(qcData.PASS_RATE).addClass('percent');
    qcData.ONTIME_RATE === -1
        ? $('#qcOntime').text('-')
        : $('#qcOntime').text(qcData.ONTIME_RATE).addClass('percent');

    function createEqpChart(ctx, percentage) {
        let BGColor = percentage < 60 ? colorLow : percentage < 80 ? colorMid : colorHigh
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [100 - percentage, percentage],
                    backgroundColor: [colorDef, BGColor],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '75%',
                responsive: true,
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    function createQcChart(ctx, percentage) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [100 - percentage, percentage],
                    backgroundColor: [colorDef, "#22aed1"],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '75%',
                responsive: true,
                plugins: {
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}
async function refreshCard(){
    let dcDataGrid = await getGridData(dcDataSid)
    let cncDataGrid = await getGridData(cncDataSid)
    let qcDataGrid = await getGridData(qcDataSid)
    dcData = dcDataGrid.Grid_Data[0]
    cncData = cncDataGrid.Grid_Data[0]
    qcData = qcDataGrid.Grid_Data[0]

    // 更新圓餅圖
    updateEqpChart(dcChart, dcData.OEE);
    updateEqpChart(cncChart, cncData.OEE);
    updateQcChart(qcChart, qcData.COMPLETION_RATE);
    
    //填入數字 沒有相關數據則為 -1
    // DC
    $('#dcOEE').text(dcData.OEE);
    $('#dcAVL').text(dcData.AVAILABILITY);
    dcData.PERFORMANCE === -1
        ? $('#dcPRF').text('-')
        : $('#dcPRF').text(dcData.PERFORMANCE)
    dcData.YEILD === -1
        ? $('#dcYLD').text('-')
        : $('#dcYLD').text(dcData.YEILD)
    // CNC
    $('#cncOEE').text(cncData.OEE);
    $('#cncAVL').text(cncData.AVAILABILITY);
    cncData.PERFORMANCE === -1
        ? $('#cncPRF').text('-')
        : $('#cncPRF').text(cncData.PERFORMANCE)
    cncData.YEILD === -1
        ? $('#cncYLD').text('-')
        : $('#cncYLD').text(cncData.YEILD)
    // QC
    $('#qcCompletion').text(qcData.COMPLETION_RATE);
    $('#ENTERED_TIME_COUNT').text(qcData.ENTERED_TIME_COUNT);
    $('#TOTAL_TIME_COUNT').text(qcData.TOTAL_TIME_COUNT);
    qcData.PASS_RATE === -1
        ? $('#qcPass').text('-').removeClass('percent')
        : $('#qcPass').text(qcData.PASS_RATE).addClass('percent');
    qcData.ONTIME_RATE === -1
        ? $('#qcOntime').text('-').removeClass('percent')
        : $('#qcOntime').text(qcData.ONTIME_RATE).addClass('percent');

    function updateEqpChart(chart, percentage) {
        let BGColor = percentage < 60 ? colorLow : percentage < 80 ? colorMid : colorHigh
        chart.data.datasets[0].backgroundColor[1] = BGColor;
        chart.data.datasets[0].data[0] = 100 - percentage;
        chart.data.datasets[0].data[1] = percentage;
        chart.update();
    }
    function updateQcChart(chart, percentage) {
        chart.data.datasets[0].data[0] = 100 - percentage;
        chart.data.datasets[0].data[1] = percentage;
        chart.update();
    }
}

// 連結預設帶到今日
let today = new Date().toLocaleDateString('en-CA')

$("#dcCard").click(()=>{
    window.location.href = 'kanban-L2.html?EQP_TYPE=DC&SHIFT_DAY=' + today
})
$("#cncCard").click(()=>{
    window.location.href = 'kanban-L2.html?EQP_TYPE=CNC&SHIFT_DAY=' + today
})
$("#qcCard").click(()=>{
    window.location.href = '../../query/grid-smart-query.html?MODULE_NAME=QC&SID=353163959260376&LEVEL=L3&BUTTON=B'
})