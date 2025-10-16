let meterdata; // 氣表資料
let meterdataSID = "355148419706330"

// 定義variable
let Temperature = []
let Pressure = []
let Frequency = []
let Flow = []
let Degree = []
let HoursArray = [] //近24小時

let today = new Date()
let year = today.getFullYear()
let month = today.getMonth() + 1
let day = today.getDate()

let todayData = year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day)
document.getElementById('dateTime').innerText = todayData

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
    meterdata = await getGridData(meterdataSID);
    gridData = meterdata.Grid_Data

    console.log(gridData)

    //取得不重複時間-1
    var uniqueReportHours = new Set();

    //GRID資料分類
    gridData.forEach(function(e){
        if(e.EQP_NO === EQP_NO){
            switch(e.AUTODC_ITEM){
                case 'Temperature':
                    Temperature.push(e.AUTODC_OUTPUT);
                    break;
                case 'Pressure':
                    Pressure.push(e.AUTODC_OUTPUT);
                    break;
                case 'Frequency':
                    Frequency.push(e.AUTODC_OUTPUT);
                    break;
                case 'Flow':
                    Flow.push(e.AUTODC_OUTPUT);
                    break;
                case 'Degree':
                    Degree.push(e.AUTODC_OUTPUT);
                    break;
            }
            uniqueReportHours.add(e.REPORT_TIME.split('T')[1].slice(0, 5))

            eqpFAB = e.FAB
            eqpName = e.EQP_NAME
        }
    })
    
    //取得不重複時間-2
    HoursArray = Array.from(uniqueReportHours);
    
    $('#FAB').text(eqpFAB)
    $('#EQPNAME').text(eqpName)
    
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
                beginAtZero: false,
                max: undefined,
                min: undefined,
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

    // chart圖設定
    var optionSet2 = JSON.parse(JSON.stringify(optionSet)); // 複製原始設置
    optionSet2.scales.y.min = 0;
    // optionSet2.scales.y.max = 0.04;

    // Temperature
    var ctx = document.getElementById('beBoxA').getContext('2d');
    var beBoxA = new Chart(ctx, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Temperature',
                data: Temperature,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    })
    
    // Pressure
    var ctx2 = document.getElementById('beBoxB').getContext('2d');
    var beBoxB = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Pressure',
                data: Pressure,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    })
    
    // Frequency
    var ctx3 = document.getElementById('beBoxC').getContext('2d');
    var beBoxC = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Frequency',
                data: Frequency,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    })
    
    // Flow
    var ctx4 = document.getElementById('beBoxD').getContext('2d');
    var beBoxD = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Flow',
                data: Flow,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    })
    
    optionSet.scales.y.min = Math.min.apply(null, Degree) - 5
    optionSet.scales.y.max = Math.max.apply(null, Degree) + 5
    // Degree
    var ctx5 = document.getElementById('beBoxE').getContext('2d');
    var beBoxE = new Chart(ctx5, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Degree',
                data: Degree,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    })

    // // Freq
    // var ctx3 = document.getElementById('beBoxE').getContext('2d');
    // var beBoxE = new Chart(ctx3, {
    //     type: 'line',
    //     data: {
    //         labels: HoursArray,
    //         datasets: [
    //             {
    //             label: 'Freq',
    //             data: Freq,
    //             borderColor: 'rgb(75, 192, 192)',
    //             backgroundColor: 'transparent',
    //             tension: 0.1
    //             }
    //         ]
    //     },
    //     options: optionSet2
    // });
}

// 回到上一頁
document.getElementById('btnBackURL').addEventListener('click', () => {
   if(document.referrer) {
    window.location.href = document.referrer
   } else {
    window.location.href = '../../../EMS-index.html' // 回總看板入口
   }
})