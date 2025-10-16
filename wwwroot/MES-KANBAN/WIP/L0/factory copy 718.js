const dataViewConfig = (title, hours, fieldNames) => ({
    show: true,
    lang: [title, 'Close', 'Refresh'],
    readOnly: true,
    optionToContent: function (opt) {
        // opt.xAxis[0].data 就是 hours (時間字串陣列)
        const axisData = opt.xAxis[0].data; // 也可以用 hours 參數

        const series = opt.series;

        // 表頭
        const tableHeader = `
            <tr>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">TIME</th>
                ${fieldNames.map(field => `<th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">${field}</th>`).join('')}
            </tr>
        `;

        // body：每個時間點一行，欄位值用 series.data[i]
        const tableBody = axisData.map((timeStr, i) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${timeStr}</td>
                ${series.map(s => `<td style="border: 1px solid #ccc; padding: 8px;">${s.data[i]}</td>`).join('')}
            </tr>
        `).join('');

        return `
            <div style="max-height: 100%; overflow-y: auto; border: 1px solid #ccc;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; user-select: text; background-color: #f0f0f0;color: black">
                    <thead style="position: sticky; top: 0; background-color: #ddd; z-index: 1;">
                        ${tableHeader}
                    </thead>
                    <tbody>
                        ${tableBody}
                    </tbody>
                </table>
            </div>
        `;
    }
});

const dataViewConfig2 = {
    show: true,
    lang: ['Production per Plant (Past 7 Days)', 'Close', 'Refresh'],
    readOnly: true,
    optionToContent: function (opt) {
        const axisData = opt.xAxis[0].data;  // 日期陣列
        const series = opt.series;           // 各個欄位（STR, FORM, ...）

        // === 動態產生表頭 ===
        const headerCols = series.map(s => `<th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">${s.name}</th>`).join('');
        const tableHeader = `
            <tr>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">DATE</th>
                ${headerCols}
            </tr>
        `;

        // === 動態產生每列資料 ===
        const tableBody = axisData.map((day, i) => {
            const rowCells = series.map(s => `<td style="border: 1px solid #ccc; padding: 8px;">${s.data[i]}</td>`).join('');
            return `
                <tr>
                    <td style="border: 1px solid #ccc; padding: 8px;">${day}</td>
                    ${rowCells}
                </tr>
            `;
        }).join('');

        return `
            <div style="max-height: 100%; overflow-y: auto; border: 1px solid #ccc;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; user-select: text; background-color: #f0f0f0; color: black;">
                    <thead style="position: sticky; top: 0; background-color: #ddd; z-index: 1;">
                        ${tableHeader}
                    </thead>
                    <tbody>${tableBody}</tbody>
                </table>
            </div>
        `;
    }
};


// url取參數
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
var today = new Date().toLocaleDateString('en-CA')
var EQP_TYPE = Request["EQP_TYPE"]
var SHIFT_DAY = Request["SHIFT_DAY"] || today

//TODAT 24H OUTPUT
let outputdaySid = '383585130400228'; //V_ZZ_KANBAN_FAB_TYPE_OUTPUT
let outputdayData;
//7DAY OUTPUT
let outputtotalSid = '383068605850639';//V_ZZ_KANBAN_FAB_TOTAL_OUTPUT
let outputtotalData;

//表格資料
let gridsid = '383072137660507'; //V_ZZ_KANBAN_TABLE
let griddata;

//TABLE 欄位 STATUS  TYPE 當前各機況總數
let gridstatussid = '383566011373702'; //V_ZZ_KANBAN_L0_TABLE_STATUS
let gridstatusdata;

//outputdayData  outputtotalData 需要畫圖的產量TYPE
let EQPTYPESid = '383584637823974';//select EQP_TYPE from eqp_master group by eqp_type
let EQPTYPEdata;

//各TYPE 的 產量單位
let UNITESid = '384189745466966';//select * from V_ZZ_KANBAN_TYPE_UNIT
let UNITdata;



$("#data_show").text(SHIFT_DAY.replaceAll('-', '/')).click(function () {
    $('#date')[0].showPicker();
})
$('#date').attr('max', today).val(SHIFT_DAY).change(function () {
    window.location.href = window.location.href.split('?')[0] + '?EQP_TYPE=' + EQP_TYPE + '&SHIFT_DAY=' + this.value
})


async function fetchData() {
    try {
        outputdayData = await getGridData(outputdaySid)
        outputtotalData = await getGridData(outputtotalSid)
        griddata = await getGridData_Shift(gridsid, EQP_TYPE, SHIFT_DAY);
        gridstatusdata = await getGridData(gridstatussid)
        EQPTYPEdata = await getGridData(EQPTYPESid)
        UNITdata = await getGridData(UNITESid)


        outputChart(outputdayData, EQPTYPEdata, UNITdata);
        totaloutputChart(outputtotalData, gridstatusdata, UNITdata);


        //PULP
        outputChart2(outputdayData, EQPTYPEdata, UNITdata);
        totaloutputChart2(outputtotalData, gridstatusdata, UNITdata);



        SetGrid(griddata, gridstatusdata, UNITdata);

        $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

        // toggleScrollbar();
        //最後更新資料的時間
        updateTime('timming')

    } catch (error) {
        console.error("获取数据时出错：", error);
    }
}

fetchData();




//產生 卡片資訊的html
function SetGrid(griddata, gridstatusdata, UNITdata) {
    try {
        let statusArray = gridstatusdata.Grid_Data; // 取出 status 陣列

        let dataSet = griddata.map((e) => {
            const status = statusArray.find(s => s.EQP_TYPE === e.EQP_TYPE) || {};
            const match = UNITdata.Grid_Data.find(item => item.EQP_TYPE === e.EQP_TYPE);
            const unit = match ? `(${match.UNIT})`: "";
            const outputValue = e.OUTPUT ? `${e.OUTPUT} ${unit}` : '';

            return {
                "FAB": e.EQP_TYPE,
                "STATUS": {
                    RUN: status.RUN ?? 0,
                    IDLE: status.IDLE ?? 0,
                    POWEROFF: status.POWEROFF ?? 0
                },
                "OUTPUT": outputValue,
                "A(%)": e["A(%)"] || '',
                "OEE": e.OEE || '',
                "IOT_INPUT": e.IOT_INPUT || ''
            };
        });

        $("#theTable").DataTable({
            data: dataSet,
            columns: [
                { title: "FAB", data: "FAB" },
                // { title: "EQP_COUNT", data: "EQP_COUNT" },
                { title: "STATUS", data: "STATUS" },
                { title: "OUTPUT", data: "OUTPUT" },
                { title: "A(%)", data: "A(%)" },
                { title: "OEE", data: "OEE" },
                { title: "IOT_INPUT", data: "IOT_INPUT" }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "render": function (data, type, row) {
                        let url = `${window.location.protocol}//${default_ip}/${PROJECT_NAME}/wwwroot/MES-KANBAN/WIP/L1/fab.html?EQP_TYPE=${data}&EQP_NO=${data}&SHIFT_DAY=${SHIFT_DAY}`
                        return `<a href="${url}" target="_blank">${data}</a>`;
                    }
                },
                // {
                //     "targets": 1,
                //     "createdCell": function (td, cellData, rowData, row, col) {
                //         $(td).css('color', rowData.EQP_STATUS_LAYOUT_COLOR);
                //     }
                // },
                {
                    "targets": 1, // STATUS 欄位
                    "render": function (data, type, row) {
                        return `
                    <span style="color:#66bb6a">RUN：${data.RUN}</span>
                    <span style="color:orange">IDLE：${data.IDLE}</span>
                    <span>POWEROFF：${data.POWEROFF}</span>
                `;
                    }
                }
            ],
            destroy: true,
            stateSave: false,
            autoWidth: false,
            dom: 'rt',
            pageLength: 999,
            scrollY: "60vh"
        });
    } catch (error) {
        console.error("获取数据时出错：", error);
    }
}


// 取得 看板資訊
function getGridData_Shift(SID, EQP_TYPE, SHIFT_DAY) {
    var resultData;
    $.ajax({
        type: 'GET',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + SID,
        async: false,
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
            jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
            jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
            QueryStructer = jsonObj
        }
    });

    QueryStructer.MasterSql = QueryStructer.MasterSql.replace('[EQP_TYPE]', EQP_TYPE).replace('[SHIFT_DAY]', SHIFT_DAY)

    $.ajax({
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
        data: {
            Charts: JSON.stringify(QueryStructer.Charts), SQL: QueryStructer.MasterSql, AddedSQL: QueryStructer.AddedSql, Conds: JSON.stringify(QueryStructer.Conditions), GridFieldType: JSON.stringify(QueryStructer.GridFieldType),
            SID: SID, rows: 100
        },
        async: false,
        success: function (msg) {
            resultData = jQuery.parseJSON(msg);
        }
    });
    return resultData.rows;
}

async function refreshData() {
    if (document.visibilityState === 'visible') {
        try {
            //定時更新
            refreshInterval = setInterval(async () => {
                fetchData();
                //最後更新資料的時間
                updateTime('timming')
                console.log("refresh!")
            }, 60000);

        } catch (error) {
            console.error("获取数据时出错：", error);
        }
    }
}

refreshData();




function outputChart(outputSidData, EQPTYPEdata, UNITdata) {
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);

    const hours = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
        "24:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"
    ];

    const unitList = UNITdata.Grid_Data
        .filter(item => item.EQP_TYPE !== 'PULP')  // 過濾掉 PULP
        .map(item => item.UNIT);

    const unitName = unitList[0] || 'Output';

    const eqpList = EQPTYPEdata.Grid_Data
        .filter(item => item.EQP_TYPE !== 'PULP')  // 過濾掉 PULP
        .map(item => item.EQP_TYPE);

    const hoursMap = {};
    hours.forEach((h, i) => hoursMap[h] = i);

    // 🔸初始化所有機台每小時為0
    const stackedData = {};
    eqpList.forEach(eqp => {
        stackedData[eqp] = new Array(hours.length).fill(0);
    });

    // 🔸如有資料才填入
    if (outputSidData.Grid_Data && outputSidData.Grid_Data.length > 0) {
        outputSidData.Grid_Data.forEach(item => {
            const timeStr = item.REPORT_TIME.substring(11, 16);
            const idx = hoursMap[timeStr];
            const eqp = item.EQP_TYPE;
            if (idx !== undefined && stackedData.hasOwnProperty(eqp)) {
                stackedData[eqp][idx] = parseFloat(item.AUTODC_OUTPUT) || 0;
            }
        });
    }

    const fieldNames = eqpList;

    const colors = [
        '#FF4500', '#FFD700', '#00FF00', '#1E90FF', '#8A2BE2',
        '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
    ];

    const getSeriesData = (type = 'bar', stack = false) => {
        return fieldNames.map((field, index) => ({
            name: field,
            type: type,
            data: stackedData[field],
            stack: stack ? 'total' : null,
            itemStyle: { color: colors[index % colors.length] }
        }));
    };

    const option = {
        

        title: {
            text: 'Hourly Output',
            left: 'center',
            textStyle: { color: 'white' }
        },
        grid: {
            top: '40%',
            bottom: '10%',
            left: '5%',
            right: '5%'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `<div>EQP_TYPE: ${params.seriesName}</div>
                        <div>${unitName}: ${params.value}</div>`;
            }
        },
        toolbox: {
            show: true,
            orient: 'horizontal',
            top: '0%',
            right: '5%',
            itemSize: 16,
            iconStyle: {
                borderColor: '#ffffff',
            },
            emphasis: {
                iconStyle: {
                    borderColor: '#FFD700',
                }
            },
            feature: {
                dataView: dataViewConfig("每小時產量", hours, fieldNames),
                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack'],
                    title: {
                        line: '切換折線圖',
                        bar: '切換柱狀圖',
                        stack: '切換堆疊'
                    },
                    option: {
                        line: {
                            smooth: true
                        },
                        stack:{
                            series:'total'
                        },

                    }
                },
                restore: { show: true },
                saveAsImage: { show: true },
            }
        },
        legend: {
            data: fieldNames,
            top: '15%',
            textStyle: { color: 'white' }
        },
        xAxis: {
            type: 'category',
            data: hours,
            name: 'TIME',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: unitName || 'Output', // ← 這裡改成從 unitList[0] 取得
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData('bar', false)
    };

    myChart.setOption(option);
}


function totaloutputChart(outputSidData, gridstatusdata, UNITdata) {
    const chartDom = document.getElementById('totaloutput');
    const myChart = echarts.init(chartDom);

    // === 固定過去七天日期 ===
    const today = new Date();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d.toISOString().slice(0, 10); // yyyy-MM-dd
    });

    const unitList = UNITdata.Grid_Data
        .filter(item => item.EQP_TYPE !== 'PULP')  // 過濾掉 PULP
        .map(item => item.UNIT);

    const unitName = unitList[0] || 'Output';

    // === 固定欄位來自 gridstatusdata ===
    const fieldNames = gridstatusdata.Grid_Data
        .filter(item => item.EQP_TYPE !== 'PULP')  // 過濾掉 PULP
        .map(item => item.EQP_TYPE);

    // === 初始化每個類別的產量陣列 ===
    const stackedData = {};
    fieldNames.forEach(field => {
        stackedData[field] = new Array(7).fill(0); // 7 天，預設為 0
    });

    // === 把資料填入 stackedData ===
    outputSidData.Grid_Data.forEach(item => {
        const dayIndex = past7Days.indexOf(item.SHIFT_DAY);
        if (dayIndex !== -1) {
            const eqpType = item.EQP_TYPE;
            if (stackedData[eqpType]) {
                stackedData[eqpType][dayIndex] = Number(item.TOTAL_OUTPUT) || 0;
            }
        }
    });

    const colors = [
        '#FF4500', '#FFD700', '#00FF00', '#1E90FF', '#8A2BE2',
        '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
    ];

    const getSeriesData = (type = 'bar', stack = false) => {
        return fieldNames.map((field, index) => ({
            name: field,
            type: type,
            data: stackedData[field],
            stack: stack ? 'stack' : null,
            itemStyle: { color: colors[index % colors.length] }
        }));
    };

    const option = {
        title: {
            text: 'Production per Plant (Past 7 Days)',
            left: 'center',
            textStyle: { color: 'white' }
        },
        grid: {
            top: '40%',
            bottom: '10%',
            left: '5%',
            right: '5%'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `<div>EQP_TYPE: ${params.seriesName}</div>
                        <div>${unitName}: ${params.value}</div>`;
            }
        },
        toolbox: {
            show: true,
            orient: 'horizontal',
            top: '0%',
            right: '5%',
            itemSize: 16,
            iconStyle: { borderColor: '#ffffff' },
            emphasis: { iconStyle: { borderColor: '#FFD700' } },
            feature: {
                dataView: dataViewConfig2,
                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack'],
                    title: {
                        line: '切換折線圖',
                        bar: '切換柱狀圖',
                        stack: '切換堆疊'
                    },
                    option: {
                        line: { smooth: true }
                    }
                },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        legend: {
            data: fieldNames,
            top: '15%',
            textStyle: { color: 'white' }
        },
        xAxis: {
            type: 'category',
            data: past7Days,
            name: 'DATE',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: unitName,
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData()
    };

    myChart.setOption(option);
}

function outputChart2(outputSidData, EQPTYPEdata, UNITdata) {
    const chartDom = document.getElementById('main2');
    const myChart = echarts.init(chartDom);

    const hours = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
        "24:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"
    ];

    const unitList = UNITdata.Grid_Data
        .filter(item => item.EQP_TYPE === 'PULP')  // 過濾掉 PULP
        .map(item => item.UNIT);
    const unitName = unitList[0] || 'Output';


    const eqpList = EQPTYPEdata.Grid_Data
        .filter(item => item.EQP_TYPE === 'PULP')
        .map(item => item.EQP_TYPE); // 或者 EQP_ID、EQP_NO，看你要畫哪個欄位的名稱

    const hoursMap = {};
    hours.forEach((h, i) => hoursMap[h] = i);

    // 🔸初始化所有機台每小時為0
    const stackedData = {};
    eqpList.forEach(eqp => {
        stackedData[eqp] = new Array(hours.length).fill(0);
    });

    // 🔸如有資料才填入
    if (outputSidData.Grid_Data && outputSidData.Grid_Data.length > 0) {
        outputSidData.Grid_Data.forEach(item => {
            const timeStr = item.REPORT_TIME.substring(11, 16);
            const idx = hoursMap[timeStr];
            const eqp = item.EQP_TYPE;
            if (idx !== undefined && stackedData.hasOwnProperty(eqp)) {
                stackedData[eqp][idx] = parseFloat(item.AUTODC_OUTPUT) || 0;
            }
        });
    }

    const fieldNames = eqpList;

    const colors = [
        '#00FF00', '#1E90FF', '#8A2BE2',
        '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
    ];

    const getSeriesData = (type = 'bar', stack = false) => {
        return fieldNames.map((field, index) => ({
            name: field,
            type: type,
            data: stackedData[field],
            stack: stack ? 'stack' : null,
            itemStyle: { color: colors[index % colors.length] }
        }));
    };

    const option = {
        title: {
            text: 'Hourly Output',
            left: 'center',
            textStyle: { color: 'white' }
        },
        grid: {
            top: '40%',
            bottom: '10%',
            left: '5%',
            right: '5%'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `<div>EQP_TYPE: ${params.seriesName}</div>
                        <div>${unitName}: ${params.value}</div>`;
            }
        },
        toolbox: {
            show: true,
            orient: 'horizontal',
            top: '0%',
            right: '5%',
            itemSize: 16,
            iconStyle: {
                borderColor: '#ffffff',
            },
            emphasis: {
                iconStyle: {
                    borderColor: '#FFD700',
                }
            },
            feature: {
                dataView: dataViewConfig("每小時產量", hours, fieldNames),
                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack'],
                    title: {
                        line: '切換折線圖',
                        bar: '切換柱狀圖',
                        stack: '切換堆疊'
                    },
                    option: {
                        line: {
                            smooth: true
                        }
                    }
                },
                restore: { show: true },
                saveAsImage: { show: true },
            }
        },
        legend: {
            data: fieldNames,
            top: '15%',
            textStyle: { color: 'white' }
        },
        xAxis: {
            type: 'category',
            data: hours,
            name: 'TIME',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: unitName,
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData('bar', true)
    };

    myChart.setOption(option);
}

function totaloutputChart2(outputSidData, gridstatusdata) {
    const chartDom = document.getElementById('totaloutput2');
    const myChart = echarts.init(chartDom);

    // === 固定過去七天日期 ===
    const today = new Date();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        return d.toISOString().slice(0, 10); // yyyy-MM-dd
    });

    const unitList = UNITdata.Grid_Data
        .filter(item => item.EQP_TYPE === 'PULP')  // 過濾掉 PULP
        .map(item => item.UNIT);
    const unitName = unitList[0] || 'Output';


    // === 固定欄位來自 gridstatusdata ===
    const fieldNames = gridstatusdata.Grid_Data
        .filter(item => item.EQP_TYPE === 'PULP')  // 過濾掉 PULP
        .map(item => item.EQP_TYPE);

    // === 初始化每個類別的產量陣列 ===
    const stackedData = {};
    fieldNames.forEach(field => {
        stackedData[field] = new Array(7).fill(0); // 7 天，預設為 0
    });

    // === 把資料填入 stackedData ===
    outputSidData.Grid_Data.forEach(item => {
        const dayIndex = past7Days.indexOf(item.SHIFT_DAY);
        if (dayIndex !== -1) {
            const eqpType = item.EQP_TYPE;
            if (stackedData[eqpType]) {
                stackedData[eqpType][dayIndex] = Number(item.TOTAL_OUTPUT) || 0;
            }
        }
    });

    const colors = [
        '#00FF00', '#1E90FF', '#8A2BE2',
        '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
    ];

    const getSeriesData = (type = 'bar', stack = false) => {
        return fieldNames.map((field, index) => ({
            name: field,
            type: type,
            data: stackedData[field],
            stack: stack ? 'stack' : null,
            itemStyle: { color: colors[index % colors.length] }
        }));
    };

    const option = {
        title: {
            text: 'Production per Plant (Past 7 Days)',
            left: 'center',
            textStyle: { color: 'white' }
        },
        grid: {
            top: '40%',
            bottom: '10%',
            left: '5%',
            right: '5%'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return `<div>EQP_TYPE: ${params.seriesName}</div>
                        <div>${unitName}: ${params.value}</div>`;
            }
        },
        toolbox: {
            show: true,
            orient: 'horizontal',
            top: '0%',
            right: '5%',
            itemSize: 16,
            iconStyle: { borderColor: '#ffffff' },
            emphasis: { iconStyle: { borderColor: '#FFD700' } },
            feature: {
                dataView: dataViewConfig2,
                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack'],
                    title: {
                        line: '切換折線圖',
                        bar: '切換柱狀圖',
                        stack: '切換堆疊'
                    },
                    option: {
                        line: { smooth: true }
                    }
                },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        },
        legend: {
            data: fieldNames,
            top: '15%',
            textStyle: { color: 'white' }
        },
        xAxis: {
            type: 'category',
            data: past7Days,
            name: 'DATE',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: unitName,
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData()
    };

    myChart.setOption(option);
}


async function updateTime(ElementID) {
    let getTimeData = await getGridData('252236119093442');
    let lastUpdateTime = new Date(getTimeData.Grid_Data[0].TIMESPAN)
    let hour = lastUpdateTime.getHours();
    let minute = lastUpdateTime.getMinutes();
    document.getElementById(ElementID).textContent = (`${hour}:${minute < 10 ? '0' : ''}${minute}`)
}