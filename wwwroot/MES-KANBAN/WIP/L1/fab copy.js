const dataViewConfig = (title, hours, fieldNames) => ({
    show: true,
    lang: [title, '關閉', '刷新'],
    readOnly: true,
    optionToContent: function (opt) {
        // opt.xAxis[0].data 就是 hours (時間字串陣列)
        const axisData = opt.xAxis[0].data; // 也可以用 hours 參數

        const series = opt.series;

        // 表頭
        const tableHeader = `
            <tr>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">時間</th>
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


if (EQP_TYPE) {
    document.title = `${EQP_TYPE}_Kanban`;
}
//卡片資料
let totalCardSid = '357927386800685'; // 右上角 全天圖表 GET_EQP_KANBAN_TOTAL_INFO
let totalCardData;
let dayCardSid = '357927437256436'; // 左上角 日班圖表 GET_EQP_KANBAN_SHIFT_INFO_V2
let dayCardData;
let nightCardSid = '357927477266843'; // 左上角 夜班圖表 GET_EQP_KANBAN_SHIFT_INFO_V2
let nightCardData;

//STR GET_EQP_STATUS_OUTPUT_24H_STR('[EQP_TYPE]','[SHIFT_DAY]')
//FORM GET_EQP_STATUS_OUTPUT_24H_FORM('[EQP_TYPE]','[SHIFT_DAY]')
let outputSid = EQP_TYPE == 'STR' ? '380483578303468' : EQP_TYPE == 'FORM' ? '380483712970527' : ''
let outputSidData;

//表格資料
let gridsid = '360351530350765'; // GET_EQP_KANBAN_TABLE_V3 機台稼動不吃工單
let griddata;

let lineChartSid = '357998862096973' //GET_ZZ_MOLD_HOURLY_OUTPUT

let EQPNOtSid = EQP_TYPE == 'STR' ? '380632832023754' : EQP_TYPE == 'FORM' ? '380632892610914' : '';
let EQPNOdata;


$("#data_show").text(SHIFT_DAY.replaceAll('-', '/')).click(function () {
    $('#date')[0].showPicker();
})
$('#date').attr('max', today).val(SHIFT_DAY).change(function () {
    window.location.href = window.location.href.split('?')[0] + '?EQP_TYPE=' + EQP_TYPE + '&SHIFT_DAY=' + this.value
})
if (EQP_TYPE === 'SC') {
    $("#title").text('LAMINATING Dashboard');
} else {
    $("#title").text(EQP_TYPE + ' Dashboard');
}

async function fetchData() {
    try {
        totalCardData = await getGridData_Shift(totalCardSid, EQP_TYPE, SHIFT_DAY);
        dayCardData = await getGridData_Shift(dayCardSid, EQP_TYPE, SHIFT_DAY)
        nightCardData = await getGridData_Shift(nightCardSid, EQP_TYPE, SHIFT_DAY)
        outputSidData = await getGridData_Shift(outputSid, EQP_TYPE, SHIFT_DAY)
        EQPNOdata = await getGridData(EQPNOtSid)
        // lineChartSidData = await getGridData_Shift(lineChartSid, EQP_TYPE, SHIFT_DAY)



        //產生卡片 html
        SetCard(totalCardData, dayCardData, nightCardData);
        try {
            outputChart(outputSidData,EQPNOdata);
        } catch (err) {
            console.error("outputChart 發生錯誤：", err);
        }

        griddata = await getGridData_Shift(gridsid, EQP_TYPE, SHIFT_DAY);

        SetGrid(griddata);

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
function SetCard(totalCardData, dayCardData, nightCardData) {

    try {
        //早班
        $('#day-manager').html(dayCardData[0].MANAGER);
        $('#day-output-per-capita').html(dayCardData[0].OUTPUT_PER_CAPITA || "-");
        $('#day-oee').html(Math.round(dayCardData[0].OEE, 1));
        $('#day-avl').html(Math.round(dayCardData[0].AVAILABILITY, 0));
        dayCardData[0].YEILD >= 0
            ? $('#day-yld').html(Math.round(dayCardData[0].YEILD, 0))
            : $('#day-yld').html('-').removeClass('percent');
        dayCardData[0].PERFORMANCE >= 0
            ? $('#day-prf').html(Math.round(dayCardData[0].PERFORMANCE, 0))
            : $('#day-prf').html('-').removeClass('percent');
        //晚班
        $('#night-manager').html(nightCardData[0].MANAGER);
        $('#night-output-per-capita').html(nightCardData[0].OUTPUT_PER_CAPITA || "-");
        $('#night-oee').html(Math.round(nightCardData[0].OEE, 1));
        $('#night-avl').html(Math.round(nightCardData[0].AVAILABILITY, 0));
        nightCardData[0].YEILD >= 0
            ? $('#night-yld').html(Math.round(nightCardData[0].YEILD, 0))
            : $('#night-yld').html('-').removeClass('percent');
        nightCardData[0].PERFORMANCE >= 0
            ? $('#night-prf').html(Math.round(nightCardData[0].PERFORMANCE, 0))
            : $('#night-prf').html('-').removeClass('percent');
        //全天
        $('#total-oee').html(totalCardData[0].OEE || 0);
        $('#total-product-time').html(totalCardData[0].TOTAL_PRODUCTION_TIME);
        $('#total-avl').html(totalCardData[0].AVAILABILITY || 0);
        totalCardData[0].YEILD >= 0
            ? $('#total-yld').html(Math.round(totalCardData[0].YEILD, 0))
            : $('#total-yld').html('-').removeClass('percent');
        totalCardData[0].PERFORMANCE >= 0
            ? $('#total-prf').html(Math.round(totalCardData[0].PERFORMANCE, 0))
            : $('#total-prf').html('-').removeClass('percent');
    }
    catch (error) {
        console.error("获取数据时出错：", error);
    }


}

//產生 卡片資訊的html
function SetGrid(griddata) {
    try {
        let dataSet = griddata.map((e) => {
            return {
                "EQP_NO": e.EQP_NO,
                "STATUS": e.STATUS,
                "WO": e.WO || '',
                "USER_NAME": e.USER_NAME || '',
                "PART_NO": e.PART_NO || '',
                "ERP_QTY": e.ERP_QTY || '',
                "AVL": e.AVL || 0,
                "OUTPUT_TOTAL": e.OUTPUT_TOTAL || 0, //IOT產出
                "KEYIN_OUTPUT_TOTAL": e.KEYIN_OUTPUT_TOTAL || 0, //人員輸入產出
                "EQP_STATUS_LAYOUT_COLOR": e.EQP_STATUS_LAYOUT_COLOR
            };
        });
        $("#theTable").DataTable({
            data: dataSet,
            columns: [
                { title: "EQP_NO", data: "EQP_NO" },
                { title: "Status", data: "STATUS" },
                { title: "User", data: "USER_NAME" },
                { title: "MO", data: "WO" },
                { title: "Part NO.", data: "PART_NO" },
                { title: "Planned Quantity", data: "ERP_QTY" },
                { title: "A(%)", data: "AVL" },
                { title: "IoT count", data: "OUTPUT_TOTAL" },
                { title: "Keyin output", data: "KEYIN_OUTPUT_TOTAL" }
            ],
            columnDefs: [
                {
                    "targets": 0,
                    "render": function (data, type, row) {
                        //設置超連結
                        let url = `${window.location.protocol}//${default_ip}/${PROJECT_NAME}/wwwroot/MES-KANBAN/WIP/L2/eqp.html?EQP_TYPE=${EQP_TYPE}&EQP_NO=${data}&SHIFT_DAY=${SHIFT_DAY}`
                        return `<a href="${url}" target="_blank">${data}</a>`;
                    }
                },
                {
                    "targets": 1,
                    "createdCell": function (td, cellData, rowData, row, col) {
                        // 根據 EQP_STATUS_LAYOUT_COLOR 欄位設置 Status 欄位的顏色
                        $(td).css('color', rowData.EQP_STATUS_LAYOUT_COLOR);
                    }
                }
            ],
            destroy: true, //每一次修改時銷毀資料
            stateSave: false, //表格狀態保存，當頁面刷新時，是否要保存當前表格狀態，不保存狀態便會在刷新時回復到原始狀態
            autoWidth: false, //是否要自動調整表格寬度
            dom: 'rt', //只顯示表格本身
            pageLength: 999,
            scrollY: "60vh"
        });
    }
    catch (error) {
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



//   function lineChart(lineChartSid) {
//     var chartDom = document.getElementById('main');
//     var myChart = echarts.init(chartDom);
//     var date = lineChartSidData.map(item => item.REPORT_TIME);
//     var hours = [
//         "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
//         "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
//         "24:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"
//     ];

//     // 提取除 'REPORT_TIME', 'HH', 'SHIFT_DAY' 之外的其他欄位
//     var outputData = lineChartSidData.map(item => {
//         var filteredItem = {};
//         // 遍歷每一個物件，並過濾掉 'REPORT_TIME', 'HH', 'SHIFT_DAY'
//         for (var key in item) {
//             if (key !== 'REPORT_TIME' && key !== 'HH' && key !== 'SHIFT_DAY' && key !== 'GRID_SID' && key !== 'RN') {
//                 filteredItem[key] = item[key]; // 保存其他欄位的數據
//             }
//         }
//         return filteredItem;
//     });

//     // 取得所有的欄位名稱，排除掉 REPORT_TIME, HH, SHIFT_DAY
//     var fieldNames = Object.keys(outputData[0]);

//     // 設置10個顏色
//     var colors = [
//         '#FF4500', '#FFD700', '#00FF00', '#1E90FF', '#8A2BE2',
//         '#FF6347', '#FF1493', '#00FFFF', '#DC143C', '#FFFF00'
//     ];

//     // 構建每個欄位對應的系列
//     var seriesData = fieldNames.map((field, index) => {
//         return {
//             name: field, // 每條線的名稱
//             data: lineChartSidData.map(item => parseFloat(item[field]) || 0), // 確保數據是有效的數字
//             type: 'bar',
//             stack: 'stack', // 設置為堆疊
//             itemStyle: {
//                 color: colors[index % colors.length] // 從顏色陣列中選擇顏色
//             },
//             // label: {
//             //     show: true, // 顯示標籤
//             //     position: 'top', // 標籤顯示在條形圖上方
//             //     color: 'white', // 標籤顏色
//             //     fontSize: 12, // 標籤字體大小
//             //     formatter: '{c}' // 顯示數字
//             // }
//         };
//     });

//     var option = {
//         title: {
//             text: '每小時產量',
//             left: 'center',
//             textStyle: {
//                 color: 'white'
//             }
//         },
//         grid: {
//             top: '25%',
//             bottom: '10%',
//             left: '5%',
//             right: '5%'
//         },
//         tooltip: {
//             trigger: 'item',
//             formatter: function (params) {
//                 return `<div>機台: ${params.seriesName}</div>
// 						<div>產出次數: ${params.value}</div>`;
//             }
//         },
//         toolbox: {
//             right: '5%',
//             feature: {
//                 dataView: dataViewConfig(" ", date, fieldNames),
//             },
//             iconStyle: {
//                 borderColor: 'white'
//             }
//         },
//         legend: {
//             data: fieldNames, // 顯示每個欄位的名稱
//             top: '10%', // 設置 legend 在圖表上方顯示
//             textStyle: {
//                 color: 'white' // 設置 legend 文本顏色
//             }
//         },
//         xAxis: {
//             type: 'category',
//             data: hours,
//             name: '時間',
//             axisLabel: { color: 'white' },
//             nameTextStyle: { color: 'white' },
//             axisLine: { lineStyle: { color: 'white' } }
//         },
//         yAxis: {
//             type: 'value',
//             name: '產量',
//             axisLabel: { color: 'white' },
//             nameTextStyle: { color: 'white' },
//             axisLine: { lineStyle: { color: 'white' } },
//             splitLine: {
//                 lineStyle: {
//                     color: "#ffffff50"
//                 },
//             },
//         },
//         series: seriesData // 將所有欄位的數據設置為多條堆疊的條形圖
//     };

//     myChart.setOption(option);
// }



function outputChart(outputSidData,EQPNOdata) {
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);

    const hours = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
        "24:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"
    ];

    // 無資料處理
    if (!outputSidData || outputSidData.length === 0) {
        myChart.setOption({
            title: { text: '每小時產量', left: 'center', textStyle: { color: 'white' } },
            xAxis: { type: 'category', data: hours, axisLabel: { color: 'white' }, axisLine: { lineStyle: { color: 'white' } } },
            yAxis: { type: 'value', axisLabel: { color: 'white' }, axisLine: { lineStyle: { color: 'white' } } },
            series: []
        });
        return;
    }

    // 過濾欄位
    const outputData = outputSidData.map(item => {
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

    outputSidData.forEach(item => {
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
            text: '每小時產量',
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
                dataView: dataViewConfig("每小時產量", hours, fieldNames),

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
            name: '時間',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: '產量',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: getSeriesData('bar', true)
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