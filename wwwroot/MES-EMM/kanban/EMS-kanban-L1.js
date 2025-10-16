let titleDataSid = '353870739880994';
let titleData;

let lastdayKWSID = '354639246990362';
let lastdayData;

let lastdayFAB1SID = '354640758503539'
let lastFAB1Data
let lastdayFAB2SID = '354641205146681'
let lastFAB2Data
let lastdayFAB3SID = '354641234873476'
let lastFAB3Data

let ADataSid = '353686518696440';
let AData;
let BDataSid = '353686533736470';
let BData;
let CDataSid = '353686571783530';
let CData;
let DDataSid = '353862716260456';
let DData;

// let ACtx = document.getElementById('AChart').getContext('2d');
// let BCtx = document.getElementById('BChart').getContext('2d');
// let CCtx = document.getElementById('CChart').getContext('2d');
// let DCtx = document.getElementById('DChart').getContext('2d');

let AChart,BChart,CChart,DChart;

document.addEventListener('DOMContentLoaded', async function(){
    let titleDataGrid = await getGridData(titleDataSid)
    let lastdayKWGrid = await getGridData(lastdayKWSID)
    let lastFAB1Grid = await getGridData(lastdayFAB1SID)
    let lastFAB2Grid = await getGridData(lastdayFAB2SID)
    let lastFAB3Grid = await getGridData(lastdayFAB3SID)


    let ADataGrid = await getGridData(ADataSid)
    let BDataGrid = await getGridData(BDataSid)
    let CDataGrid = await getGridData(CDataSid)
    let DDataGrid = await getGridData(DDataSid)


    titleData = titleDataGrid.Grid_Data[0]
    lastdayData = lastdayKWGrid.Grid_Data
    lastFAB1Data = lastFAB1Grid.Grid_Data[0]
    lastFAB2Data = lastFAB2Grid.Grid_Data[0]
    lastFAB3Data = lastFAB3Grid.Grid_Data[0]

    AData = ADataGrid.Grid_Data[0]
    BData = BDataGrid.Grid_Data[0]
    CData = CDataGrid.Grid_Data[0]
    DData = DDataGrid.Grid_Data[0]


    // 卡片圖表
    setCard()

    // 定時更新圖表
    setTimeout(() => {
        refreshCard()
    }, 30000);
});

function setCard(){
    // 畫圓餅圖
    // AChart = createAChart(ACtx, AData.VALUE);
    // BChart = createBChart(BCtx, BData.VALUE);
    // CChart = createCChart(CCtx, CData.VALUE);
    // DChart = createDChart(DCtx, DData.VALUE);
    
    //title
    switch(titleData.TYPE){
        case "LOW":
            $('#TOTALCard').text(titleData.KW_TOT).addClass('low-square');
            break;
        case "MID":
            $('#TOTALCard').text(titleData.KW_TOT).addClass('mid-square');
            break;
        case "HIGH":
            $('#TOTALCard').text(titleData.KW_TOT).addClass('high-square');
            break; 
    }
    $('#Contract').html('Contract Cap: '+titleData.PARAMETER_VALUE+' kW')

    // const lastFAB1 = lastFAB1Data.EQPNAMES === 'NonEMS1' ? lastFAB1Data.LAST_KW : 0
    // const lastFAB2 = lastFAB2Data.EQPNAME === 'EMS' ? lastFAB2Data.LAST_KW : 0
    // const lastFAB3 = lastFAB3Data.EQPNAMES === 'NonEMS2' ? lastFAB3Data.LAST_KW : 0
    // const lastTotal = lastdayData.find(item => item.EQP_NO === 'MAIN')?.LAST_KW || 0

    // // last day kw total
    // $('#lastDayKW').text(lastTotal)

    // // last day Non-EMS1 
    // $('#lastFAB1').text(lastFAB1)
    // // last day EMS
    // $('#lastFAB2').text(lastFAB2)
    // // last day Non-EMS2
    // $('#lastFAB3').text(lastFAB3)

    lastdayData.forEach(item => {
        const eqpNo = item.EQP_NO
        const maxKW = item.MAX_KW

        if (eqpNo === 'MAIN') {
            $('#lastDayKW').text(maxKW)
        } else if (eqpNo === 'JV02') {
            $('#lastJV02').text(maxKW)
        } else if (eqpNo === 'JV03') {
            $('#lastJV03').text(maxKW)
        } else if (eqpNo === 'JV04') {
            $('#lastJV04').text(maxKW)
        } else if (eqpNo === 'JA14') {
            $('#lastJA14').text(maxKW)
        }
    })
    
    //填入數字 沒有相關數據則為 -1
    // A製程
    $('#AOEE').text(AData.VALUE);
    // $('#AAVL').text('N/A');
   
    // B製程
    $('#BOEE').text(BData.VALUE);
    // $('#BAVL').text('N/A');
    
    // C製程
    $('#CCompletion').text(CData.VALUE);
    // $('#CENTERED_TIME_COUNT').text('N/A');
    // $('#CTOTAL_TIME_COUNT').text('N/A');
   
    // D製程
    $('#DCompletion').text(DData.VALUE);
    // $('#DENTERED_TIME_COUNT').text('N/A');
    // $('#DTOTAL_TIME_COUNT').text('N/A');
   
}
async function refreshCard(){
    let ADataGrid = await getGridData(ADataSid)
    let BDataGrid = await getGridData(BDataSid)
    let CDataGrid = await getGridData(CDataSid)
    let DDataGrid = await getGridData(DDataSid)

    AData = ADataGrid.Grid_Data[0]
    BData = BDataGrid.Grid_Data[0]
    CData = CDataGrid.Grid_Data[0]
    DData = DDataGrid.Grid_Data[0]

    // 更新圓餅圖
    // updateChart(AChart, AData.VALUE);
    // updateChart(BChart, BData.VALUE);
    // updateChart(CChart, CData.VALUE);
    // updateChart(DChart, DData.VALUE);

    
    //title
    $('#TOTALCard').removeClass('low-square');
    $('#TOTALCard').removeClass('mid-square');
    $('#TOTALCard').removeClass('high-square');

    switch(titleData.TYPE){
        case "LOW":
            $('#TOTALCard').text(titleData.KW_TOT).addClass('low-square');
            break;
        case "MID":
            $('#TOTALCard').text(titleData.KW_TOT).addClass('mid-square');
            break;
        case "HIGH":
            $('#TOTALCard').text(titleData.KW_TOT).addClass('high-square');
            break; 
    }
   

    
    $('#Contract').html(`${GetLangDataV2('Contract Cap:')}`+titleData.PARAMETER_VALUE+' kW')

    //填入數字 沒有相關數據則為 -1
    // A製程
    $('#AOEE').text(AData.VALUE);
    // $('#AAVL').text('N/A');
    
    // B製程
    $('#BOEE').text(BData.VALUE);
    // $('#BAVL').text('N/A');
    
    // C製程
    $('#CCompletion').text(CData.VALUE);
    // $('#CENTERED_TIME_COUNT').text('N/A');
    // $('#CTOTAL_TIME_COUNT').text('N/A');
   
    // D製程
    $('#DCompletion').text(DData.VALUE);
    // $('#DENTERED_TIME_COUNT').text('N/A');
    // $('#DTOTAL_TIME_COUNT').text('N/A');
  
}
function createAChart(ctx, percentage) {
    var BGColor =
    percentage < 60
        ? '#EB3645'
        :percentage < 80
        ? '#FFA552'
        : '#5bbfb3'
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [100 - AData.FAB1, AData.FAB1],
                backgroundColor: ['#d4d4d4c0', BGColor],
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
function createBChart(ctx, percentage) {
    var BGColor =
    percentage < 60
        ? '#EB3645'
        :percentage < 80
        ? '#FFA552'
        : '#5bbfb3'
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [100 - BData.FAB2, BData.FAB2],
                backgroundColor: ['#d4d4d4c0', BGColor],
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
function createCChart(ctx, percentage) {
    var BGColor =
    percentage < 60
        ? '#EB3645'
        :percentage < 80
        ? '#FFA552'
        : '#5bbfb3'
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [100 - CData.FAB3, CData.FAB3],
                backgroundColor: ['#d4d4d4c0', BGColor],
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
function createDChart(ctx, percentage) {
    var BGColor =
    percentage < 60
        ? '#EB3645'
        :percentage < 80
        ? '#FFA552'
        : '#5bbfb3'
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [100 - DData.PER, DData.PER],
                backgroundColor: ['#d4d4d4c0', BGColor],
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
function updateChart(chart, percentage) {

switch(chart.canvas.id){
    case "AChart":
        chart.data.datasets[0].data[0] = 100 - AData.FAB1;
        chart.data.datasets[0].data[1] = AData.FAB1;
        break;
    case "BChart":
        chart.data.datasets[0].data[0] = 100 - BData.FAB2;
        chart.data.datasets[0].data[1] = BData.FAB2;
        break;
    case "CChart":
        chart.data.datasets[0].data[0] = 100 - CData.FAB3;
        chart.data.datasets[0].data[1] = CData.FAB3;
        break;
    case "DChart":
        chart.data.datasets[0].data[0] = 100 - DData.PER;
        chart.data.datasets[0].data[1] = DData.PER;
        break;
}
    chart.update();
}


$("#ACard").click(()=>{
    // window.location.href = '../zz_query/kanban-L2-DC.html?MODULE_NAME=DC&&BUTTON=A&level=2'
})
$("#BCard").click(()=>{
    // window.location.href = '../zz_query/kanban-L2-CNC.html?MODULE_NAME=CNC&&BUTTON=A&level=2'
})
$("#CCard").click(()=>{
    // window.location.href = '../query/grid-smart-query.html?MODULE_NAME=QC&SID=353163959260376&LEVEL=L3&BUTTON=B'
})
$("#DCard").click(()=>{
    // window.location.href = '../query/grid-smart-query.html?MODULE_NAME=QC&SID=353163959260376&LEVEL=L3&BUTTON=B'
})