let meterdata; //電表資料
let meterdataSID = "347808894706097";

// 定義variable
let Avg_Voltage_LN = []
let Avg_Volt_LL = []
let Avg_Current = []
let Total_kVA = []
let Total_kVAr = []
let Total_kW = []
let Freq = []
let Avg_PF = []
let HoursArray = [] //近24小時

//網址取參
var Request = {};
var getUrlParameter = function getUrlParameter() {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    var par = {};
    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        par[sParameterName[0]] = decodeURI(sParameterName[1])
    }
    return par;
};
Request = getUrlParameter();
var EQP_NO = Request["EQP_NO"]
var PATH = Request["PATH"];
$('#EQP_NO').text(EQP_NO)

async function fetchData() {
    meterdata = await getGridData(meterdataSID)
    gridData = meterdata.Grid_Data
    // queryData = meterdata.Query_Cond

    // setModal(queryData)

    console.log(gridData)
    // console.log(queryData)

    //取得不重複時間-1
    var uniqueReportHours = new Set();

    let eqpName = ''
    let eqpFab = ''
    let latestDate = ''

    //GRID資料分類
    gridData.forEach(function(e){
        if(e.EQP_NO === EQP_NO){
            switch(e.AUTODC_ITEM){
                case 'Avg_Voltage_LN':
                    Avg_Voltage_LN.push(e.AUTODC_OUTPUT);
                    break;
                case 'Avg_Volt_LL':
                    Avg_Volt_LL.push(e.AUTODC_OUTPUT);
                    break;
                case 'Avg_Current':
                    Avg_Current.push(e.AUTODC_OUTPUT);
                    break;
                case 'Total_kW':
                    Total_kW.push(e.AUTODC_OUTPUT);
                    break;
                case 'Total_kVA':
                    Total_kVA.push(e.AUTODC_OUTPUT);
                    break;
                case 'Total_kVAr':
                    Total_kVAr.push(e.AUTODC_OUTPUT);
                    break;
                case 'Freq':
                    Freq.push(e.AUTODC_OUTPUT);
                    break;
                case 'Avg_PF':
                    Avg_PF.push(e.AUTODC_OUTPUT);
                    break;
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
    HoursArray = Array.from(uniqueReportHours);

    $('#EQP_NAME').text(eqpName)
    // $('#EQP_NO').text(e.EQP_NO)
    $('#FAB').text(eqpFab)
    $('#DATE').text(latestDate)

    // console.log('EQP_NAME:', eqpName);
    // console.log('FAB:', eqpFab);
    // console.log('最新日期:', latestDate);
    
    //畫圖
    setChart()
}
fetchData()

function setChart(){
    //chart圖設定
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
                ticks: {
                    color: 'white'
                }
            },
            x: {
                ticks: {
                    color: 'white',
                    callback: function(value, index, ticks) {
                        // 每隔兩個點顯示一個標籤
                        if (index % 2 === 0) {
                            return this.getLabelForValue(value);
                        }
                        return '';
                    }
                }
            }
        },
    };

    // chart圖設定 - Y軸範圍 63~57
    var optionSet2 = JSON.parse(JSON.stringify(optionSet)); // 複製原始設置
    optionSet2.scales.y.min = 39.5;
    optionSet2.scales.y.max = 50.5;
    
    // Avg_Voltage_LN
    var ctx = document.getElementById('beBoxA').getContext('2d')
    var beBoxA = new Chart(ctx, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Avg_Voltage_LN',
                data: Avg_Voltage_LN,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
    
    // Avg_Volt_LL
    var ctx2 = document.getElementById('beBoxB').getContext('2d')
    var beBoxB = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Avg_Volt_LL',
                data: Avg_Volt_LL,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
    
    // Avg_Current
    var ctx3 = document.getElementById('beBoxC').getContext('2d')
    var beBoxC = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Avg_Current',
                data: Avg_Current,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
    
    // Total_kW, Total_kVA, Total_kVAr
    var ctx4 = document.getElementById('beBoxD').getContext('2d');
    var beBoxD = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Total_kW',
                data: Total_kW,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
                {
                label: 'Total_kVA',
                data: Total_kVA,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
                {
                label: 'Total_kVAr',
                data: Total_kVAr,
                borderColor: 'rgb(192, 171, 75)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
    
    //PF
    var ctx5 = document.getElementById('beBoxF').getContext('2d');
    var beBoxF = new Chart(ctx5, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Avg_PF',
                data: Avg_PF,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });

    // Freq
    var ctx3 = document.getElementById('beBoxE').getContext('2d');
    var beBoxE = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Freq',
                data: Freq,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    });
}

//Back事件
// function BackLastPage(){
//     let url = '../../card/'+PATH+'?LEVEL=ALL';
//     // 使用<a>元素來解析相對URL並取得絕對URL
//     let a = document.createElement('a');
//     a.href = url;
//     let absoluteUrl = a.href;

//     // 將頁面轉址到絕對URL
//     window.location.href = absoluteUrl;
// }