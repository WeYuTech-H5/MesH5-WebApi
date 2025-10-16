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
        const axisData = opt.xAxis[0].data; // 也就是 SHIFT_DAY
        const series = opt.series;

        // Table Header
        const tableHeader = `
            <tr>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">DATE</th>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">STR</th>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">FORM</th>
            </tr>
        `;

        // Table Body
        const tableBody = axisData.map((day, i) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${day}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${series[0].data[i]}</td>
                <td style="border: 1px solid #ccc; padding: 8px;">${series[1].data[i]}</td>
            </tr>
        `).join('');

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

//卡片資料
let outputdaySid = '383068399116113'; //V_ZZ_KANBAN_FAB_TYPE_OUTPUT
let outputdayData;
//卡片資料
let outputtotalSid = '383068605850639';//V_ZZ_KANBAN_FAB_TOTAL_OUTPUT
let outputtotalData;

//表格資料
let gridsid = '383072137660507'; //V_ZZ_KANBAN_TABLE
let griddata;

let gridstatussid = '383566011373702'; //V_ZZ_KANBAN_L0_TABLE_STATUS
let gridstatusdata;



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



        outputChart(outputdayData);
        totaloutputChart(outputtotalData);
        SetGrid(griddata, gridstatusdata);

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
function SetGrid(griddata, gridstatusdata) {
    try {
        let statusArray = gridstatusdata.Grid_Data; // 取出 status 陣列

        let dataSet = griddata.map((e) => {
            const status = statusArray.find(s => s.EQP_TYPE === e.EQP_TYPE) || {};
            return {
                "FAB": e.EQP_TYPE,
                // "EQP_COUNT": e.EQP_COUNT,
                "STATUS": {
                    RUN: status.RUN ?? 0,
                    IDLE: status.IDLE ?? 0,
                    POWEROFF: status.POWEROFF ?? 0
                },
                "OUTPUT": e.OUTPUT || '',
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




function outputChart(outputSidData) {
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);

    const hours = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
        "24:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"
    ];

    // 無資料處理
    if (!outputSidData.Grid_Data || outputSidData.Grid_Data.length === 0) {
        myChart.setOption({
            title: { text: 'Hourly Output by Site (Today)', left: 'center', textStyle: { color: 'white' } },
            xAxis: { type: 'category', data: hours, axisLabel: { color: 'white' }, axisLine: { lineStyle: { color: 'white' } } },
            yAxis: { type: 'value', axisLabel: { color: 'white' }, axisLine: { lineStyle: { color: 'white' } } },
            series: []
        });
        return;
    }

    // 過濾欄位
    const outputData = outputSidData.Grid_Data.map(item => {
        const filtered = {};
        for (let key in item) {
            if (!['REPORT_TIME', 'HH', 'SHIFT_DAY', 'GRID_SID', 'RN'].includes(key)) {
                filtered[key] = item[key];
            }
        }
        return filtered;
    });

    const fieldNames = Object.keys(outputData[0]);

    const colors = [
        '#FF4500', '#FFD700', '#00FF00', '#1E90FF', '#8A2BE2',
        '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
    ];

    // 補齊資料
    const hourIndexMap = {};
    hours.forEach((h, i) => hourIndexMap[h] = i);

    const stackedData = {};
    fieldNames.forEach(field => {
        stackedData[field] = new Array(hours.length).fill(0);
    });

    outputSidData.Grid_Data.forEach(item => {
        const timeStr = item.REPORT_TIME.substring(11, 16);
        const idx = hourIndexMap[timeStr];
        if (idx !== undefined) {
            fieldNames.forEach(field => {
                stackedData[field][idx] = parseFloat(item[field]) || 0;
            });
        }
    });

    // ✅ 函數產生 series，依據堆疊狀態切換 stack
    const getSeriesData = (type = 'bar', stack = false) => {
        return fieldNames.map((field, index) => ({
            name: field,
            type: type,
            data: stackedData[field],
            stack: stack ? 'stack' : null,  // 不堆疊時為 null
            itemStyle: { color: colors[index % colors.length] }
        }));
    };

    const option = {
        title: {
            text: 'Hourly Output by Site (Today)',
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
                return `<div>機台: ${params.seriesName}</div>
                        <div>產出次數: ${params.value}</div>`;
            }
        },
        toolbox: {
            show: true,
            orient: 'horizontal',
            top: '10%',
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
                dataView: dataViewConfig("Hourly Output by Site (Today)", hours, fieldNames),

                magicType: {
                    show: true,
                    type: ['line', 'bar', 'stack'], // drawBarChart 也有 stack
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
            name: 'OUTPUT',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData()
    };

    myChart.setOption(option);


}

function totaloutputChart(outputSidData) {
    const chartDom = document.getElementById('totaloutput');
    const myChart = echarts.init(chartDom);

    const hours = outputSidData.Grid_Data.map(item => item.SHIFT_DAY);
    if (!hours.length) {
        myChart.setOption({
            title: { text: 'Production per Plant (Past 7 Days)', left: 'center', textStyle: { color: 'white' } },
            xAxis: { type: 'category', data: [], axisLabel: { color: 'white' }, axisLine: { lineStyle: { color: 'white' } } },
            yAxis: { type: 'value', axisLabel: { color: 'white' }, axisLine: { lineStyle: { color: 'white' } } },
            series: []
        });
        return;
    }

    // 保留 STR 與 FORM 的資料結構，但用 outputChart 的方式補齊資料
    const fieldNames = ['STR', 'FORM'];
    const colors = [
        '#FF4500', '#FFD700', '#00FF00', '#1E90FF', '#8A2BE2',
        '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
    ];

    // 補齊資料（以 days 為橫軸）
    const stackedData = {};
    fieldNames.forEach(field => {
        stackedData[field] = new Array(hours.length).fill(0);
    });

    outputSidData.Grid_Data.forEach((item, idx) => {
        fieldNames.forEach(field => {
            stackedData[field][idx] = Number(item[field]) || 0;
        });
    });

    // 堆疊狀態切換開關

    const getSeriesData = (type = 'bar', stack = false) => {
        return fieldNames.map((field, index) => ({
            name: field,
            type: type,
            data: stackedData[field],
            stack: stack ? 'stack' : null,  // 不堆疊時為 null
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
                return `<div>類別: ${params.seriesName}</div>
                        <div>數值: ${params.value}</div>`;
            }
        },
        toolbox: {
            show: true,
            orient: 'horizontal',
            top: '10%',
            right: '5%',
            itemSize: 16,
            iconStyle: { borderColor: '#ffffff' },
            emphasis: { iconStyle: { borderColor: '#FFD700' } },
            feature: {
                dataView: dataViewConfig2,  // 保留你的 dataView
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
            data: hours,
            name: 'DATE',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: 'OUTPUT',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData()
    };

    myChart.setOption(option);
}


//最後更新資料時間
async function updateTime(ElementID) {
    let getTimeData = await getGridData('252236119093442');
    let lastUpdateTime = new Date(getTimeData.Grid_Data[0].TIMESPAN)
    let hour = lastUpdateTime.getHours();
    let minute = lastUpdateTime.getMinutes();
    document.getElementById(ElementID).textContent = (`${hour}:${minute < 10 ? '0' : ''}${minute}`)
}