let meterdata; //電表資料
let meterdataSID = "355073122066262";

// 定義variable
let Flow_rate = []
let Fluid_velocity = []
let Total_flow_positive = []
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
                case 'Flow_rate':
                    Flow_rate.push(e.AUTODC_OUTPUT);
                    break;
                case 'Fluid_velocity':
                    Fluid_velocity.push(e.AUTODC_OUTPUT);
                    break;
                case 'Total_flow_positive':
                    Total_flow_positive.push(e.AUTODC_OUTPUT);
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
                min: undefined,
                max: undefined,
                ticks: {
                    color: 'white',
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
    var optionSet2 = JSON.parse(JSON.stringify(optionSet)) // 複製原始設置
    optionSet2.scales.y.min = 0
    
    var optionSet3 = JSON.parse(JSON.stringify(optionSet)) // 複製原始設置
    optionSet3.scales.y.min = 0
    optionSet3.scales.y.max = 0.5

    // Flow_rate
    optionSet.scales.y.min = Math.min.apply(null, Flow_rate) - 5
    optionSet.scales.y.max = Math.max.apply(null, Flow_rate) + 5
    
    var ctx = document.getElementById('beBoxA').getContext('2d')
    var beBoxA = new Chart(ctx, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Flow_rate',
                data: Flow_rate,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    });
    
    // Fluid_velocity
    optionSet.scales.y.min = Math.min.apply(null, Fluid_velocity) - 5
    optionSet.scales.y.max = Math.max.apply(null, Fluid_velocity) + 5

    var ctx2 = document.getElementById('beBoxB').getContext('2d');
    var beBoxB = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Fluid_velocity',
                data: Fluid_velocity,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet2
    });
    
    // Total_flow_positive
    optionSet.scales.y.min = Math.min.apply(null, Total_flow_positive) - 5
    optionSet.scales.y.max = Math.max.apply(null, Total_flow_positive) + 5

    var ctx3 = document.getElementById('beBoxC').getContext('2d');
    var beBoxC = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Total_flow_positive',
                data: Total_flow_positive,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    })
}

// 回到上一頁
document.getElementById('btnBackURL').addEventListener('click', () => {
    if(document.referrer) {
     window.location.href = document.referrer
    } else {
     window.location.href = '../../../EMS-index.html' // 回總看板入口
    }
 })