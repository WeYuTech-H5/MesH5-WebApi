// 真實SQL VIEW 需電表持續有收值才有數據
// let dailyDataSID = '351878418033821' // 日用電量
// let voltageDataSID = '351880170106094'; // 電壓值
// let PFDataSID = '351880238040271'; // 功率因數
// let demandDateSID = '351949611456205'; // 需量
// let currentDataSID = '351950401870835'; // 當前電流
// let MonthlyDataSID = '351961949823191'; // 月用電量
// let totalDataSID = '351962271030887'; // 總用電量
// let hourlyDataSID = '351962500510111'; // 時用電量
// let factoryCurrentSID = '351963756820521'; // 廠區用電趨勢 ( 當前 )
// let factoryMonthlySID = '351963800963076'; // 廠區用電趨勢 ( 月 )
// let dashboardDataSID = '351958554143803'; // 表格資料
// let rankingDataSID = '351965251420647'; // 設備用電排行

// DEMO用寫死假資料
let dailyDataSID = '364043499673770' // 日用電量
let voltageDataSID = '364043538910336'; // 電壓值
let PFDataSID = '364043629400830'; // 功率因數
let demandDateSID = '364043697353649'; // 需量
let currentDataSID = '364043748020959'; // 當前電流
let MonthlyDataSID = '364043802220538'; // 月用電量
let totalDataSID = '364043869960204'; // 總用電量
let hourlyDataSID = '364043921233957'; // 時用電量
let factoryCurrentSID = '364044084363807'; // 廠區用電趨勢 ( 當前 )
let factoryMonthlySID = '364044121880218'; // 廠區用電趨勢 ( 月 )
let dashboardDataSID = '364044152330447'; // 表格資料
let rankingDataSID = '364044177526280'; // 設備用電排行

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

$(document).ready(async function(){
    // 取得資料
    let dailyData = await getGridData(dailyDataSID); // 日用電量
    let voltageData = await getGridData(voltageDataSID); // 電壓值
    let PFData = await getGridData(PFDataSID); // 功率因數
    let demandDate = await getGridData(demandDateSID) // 需量
    let currentData = await getGridData(currentDataSID); // 當前電流
    let MonthlyData = await getGridData(MonthlyDataSID); // 月用電量
    let totalData = await getGridData(totalDataSID); // 總用電量
    let hourlyData = await getGridData(hourlyDataSID) // 時用電量
    let factoryCurrent = await getGridData(factoryCurrentSID) // 廠區用電趨勢 ( 當前 )
    let factoryMonthly = await getGridData(factoryMonthlySID) // 廠區用電趨勢 ( 月 )
    let dashboardData = await getGridData(dashboardDataSID); // 表格資料
    let rankingData = await getGridData(rankingDataSID); // 設備用電排行


    GetDailyData(dailyData.Grid_Data);
    GetVoltageData(voltageData.Grid_Data);
    GetPFData(PFData.Grid_Data);
    GetDemandData(demandDate.Grid_Data)
    GetCurrentData(currentData.Grid_Data)
    GetMonthlyData(MonthlyData.Grid_Data)
    GetTotalData(totalData.Grid_Data)
    GetHourlyData(hourlyData.Grid_Data)
    GetFactoryCurrent(factoryCurrent.Grid_Data)
    GetFactoryMonthly(factoryMonthly.Grid_Data)

    // 資料表格設定
    UpdateDashBoard(dashboardData.Grid_Data)

    // 用電排行
    UpdateRanking(rankingData.Grid_Data)
    
    // setInterval(updateTime, 1000 * 60)  // 每分鐘更新區域時間

    window.onload = updateTime; // 網頁載入時更新時間

    // setInterval(LoadData, 1000 * 60 * 5) // 每5分鐘更新一次全部資料

    // 現在時間
    function updateTime() {
        const now = new Date()
        const hour = now.getHours().toString().padStart(2, '0')
        const minute = now.getMinutes().toString().padStart(2, '0')
        const currentTime = `${hour}:${minute}`
        document.getElementById('timming').textContent = currentTime
    }



})

// 表格資料
function UpdateDashBoard(data) {
    data.forEach(item => {
        if (item.TYPE === '當前用電量') {
            document.getElementById('dailyAmount').textContent = item.VALUE.toFixed(1)
        } else if (item.TYPE === '電壓') {
            document.getElementById('voltageAmount').textContent = item.VALUE.toFixed(1)
        } else if (item.TYPE === '功率因數') {
            document.getElementById('PFamount').textContent = item.VALUE.toFixed(2)
        } else if (item.TYPE === '需量') {
            document.getElementById('demandAmount').textContent = item.VALUE.toFixed(1)
        } else if (item.TYPE === '電流') {
            document.getElementById('currentAmount').textContent = item.VALUE.toFixed(1)
        } else if (item.TYPE === '本月用電量') {
            document.getElementById('monthUsed').textContent = item.VALUE.toFixed(1)
        } else if (item.TYPE === '年度用電量') {
            document.getElementById('yearUsed').textContent = item.VALUE.toFixed(1)
        }
    })
}


// 日用電表
function GetDailyData(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxA");
    var boxA = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '日用電量',
                    data: values,
                    borderColor: '#00FFFF',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    })
}

// 電壓值
function GetVoltageData(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxB");
    var boxB = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '電壓值',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}

// 功率因數
function GetPFData(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxC");
    var boxC = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '功率因數',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}



// 需量
function GetDemandData(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxD");
    var boxD = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '需量',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}


// 電流
function GetCurrentData(data) {

    const labels = data.map(item => item.TYPE)
    const valueCur = data.map(item => item.VALUE) // 當前電流
    const valueMax = data.map(item => item.VALUE2) // 最大
    const valueMin = data.map(item => item.VALUE3) // 最小

    var ctx = document.querySelector("#boxE");
    var boxE = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '當前電流',
                    data: valueCur,
                    borderColor: 'cyan',
                    backgroundColor: 'rgba(0, 255, 255, .5)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: '最大',
                    data: valueMax,
                    borderColor: 'red',
                    backgroundColor: 'rgba(255, 0, 0, .5)',
                    fill: true,
                    tension: 0.1
                },
                {
                    label: '最小',
                    data: valueMin,
                    borderColor: 'rgb(32, 198, 107)',
                    backgroundColor: "rgba(255, 255, 3, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}


// 月用電量
function GetMonthlyData(data) {
    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxF");
    var boxF = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '月用電量',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}

// 總用電量
function GetTotalData(data) {
    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxG");
    var boxG = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '總用電量',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}


// 時用電量
function GetHourlyData(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxH");
    var boxH = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '時用電量',
                    data: values,
                    backgroundColor: ["rgba(0, 255, 255, .5)", "rgba(255, 255, 3, .5)", "rgba(255, 50, 0, .5)"],
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}

// 廠區用電趨勢(當前)
function GetFactoryCurrent(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxI");
    var boxI = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '廠區用電趨勢 ( 當前 )',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    tension: 0.1
                },
            ]
        },
        options: optionSet
    });
}


// 廠區用電趨勢(月)
function GetFactoryMonthly(data) {

    const labels = data.map(item => item.TYPE)
    const values = data.map(item => item.VALUE)

    var ctx = document.querySelector("#boxJ");
    var boxJ = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '廠區用電趨勢 ( 月 )',
                    data: values,
                    borderColor: 'cyan',
                    backgroundColor: "rgba(0, 255, 255, .5)",
                    fill: true,
                    pointRadius: 0,
                },
            ]
        },
        options: optionSet
    });
}

// 設備用電排行
function UpdateRanking(data) {
    console.log(data)
    const rankingTable = document.querySelector("table");
    const tbody = rankingTable.querySelector("tbody");
    tbody.innerHTML = ""; // 清空表格內容

    data.forEach(item => {
        const row = document.createElement("tr");
        // Ranking = 排名
        // EQP_NO = 設備編號
        // KWH_TOT = 用電量
        row.innerHTML = `
            <td>${item.RANKING}</td> 
            <td>${item.EQP_NO}</td>
            <td>${item.KWH_TOT}</td>
        `;
        tbody.appendChild(row);
    });
}


/*************************************************************************/
/********************************Functions********************************/


// 圖表API (舊版)
function GetChartDataOld(SID) {
    try {
        let Sid = SID;
        let Structer;
        let Data;

        $.ajax({
            type: 'GET',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + Sid,
            async: false,
            success: function (msg) {
                var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                Structer = jsonObj
            }
        });

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
                DataR = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi, 'tech'));
            }
        });

        return [Data, Structer]
    }
    catch {
        return null
    }

}