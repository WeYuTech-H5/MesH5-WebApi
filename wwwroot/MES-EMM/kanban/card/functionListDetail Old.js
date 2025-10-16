let meterdata; //電表資料
let meterdataSID = "347808894706097";

// 定義variable
let totalKVA = []
let Current = []
let Freq = []
let totalKW = []
let AvgPF = []
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

$('#EQP_NO').text(EQP_NO)

async function fetchData() {
    meterdata = await getGridData(meterdataSID);
    gridData = meterdata.Grid_Data

    //取得不重複時間-1
    var uniqueReportHours = new Set();

    //GRID資料分類
    gridData.forEach(function(e){
        if(e.EQP_NO === EQP_NO){
            switch(e.AUTODC_ITEM){
                case 'KVAH_A':
                    KVAH_A.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'KVAH_B':
                    KVAH_B.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'KVAH_C':
                    KVAH_C.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'I_a':
                    I_a.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'I_b':
                    I_b.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'I_c':
                    I_c.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'Freq':
                    Freq.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'KWH_TOT':
                    KWH_TOT.push(e.AUTODC_DIFF_VALUE);
                    break;
                case 'PF':
                    PF.push(e.AUTODC_DIFF_VALUE);
                    break;
            }
            uniqueReportHours.add(e.REPORT_HOUR.split(' ')[1])
        }
    })

    //取得不重複時間-2
    HoursArray = Array.from(uniqueReportHours);
    
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
                    color: 'white'
                }
            }
        },
    };
    
    //三項電壓(KVAH_A、KVAH_B、KVAH_C)
    var ctx = document.getElementById('beBoxA').getContext('2d');
    var beBoxA = new Chart(ctx, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'KVAH_A',
                data: KVAH_A,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
                {
                label: 'KVAH_B',
                data: KVAH_B,
                borderColor: 'rgb(125, 132, 132)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
                {
                label: 'KVAH_C',
                data: KVAH_C,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
            ]
        },
        options: optionSet
    });
    
    //電流(I_a、I_c、I_b)
    var ctx2 = document.getElementById('beBoxB').getContext('2d');
    var beBoxB = new Chart(ctx2, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'I_a',
                data: I_a,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
                {
                label: 'I_b',
                data: I_b,
                borderColor: 'rgb(125, 132, 132)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
                {
                label: 'I_c',
                data: I_c,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                },
            ]
        },
        options: optionSet
    });
    
    //Frequency(Freq)
    var ctx3 = document.getElementById('beBoxC').getContext('2d');
    var beBoxC = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'Freq',
                data: Freq,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
    
    //電量KW (KWH_TOT)
    var ctx4 = document.getElementById('beBoxD').getContext('2d');
    var beBoxD = new Chart(ctx4, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'KWH_TOT',
                data: KWH_TOT,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
    
    //PF
    var ctx5 = document.getElementById('beBoxE').getContext('2d');
    var beBoxE = new Chart(ctx5, {
        type: 'line',
        data: {
            labels: HoursArray,
            datasets: [
                {
                label: 'PF',
                data: PF,
                borderColor: 'rgb(55, 142, 252)',
                backgroundColor: 'transparent',
                tension: 0.1
                }
            ]
        },
        options: optionSet
    });
}
