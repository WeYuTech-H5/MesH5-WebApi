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
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">Time</th>
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

//運行機台數量的資料表
const dataViewConfig2 = (title, reportTimes, fieldNames, runcount) => ({
    show: true,
    lang: [title, '關閉', '刷新'],
    readOnly: true,
    optionToContent: function (opt) {
        // 不再使用 series，直接使用 reportTimes 和 runcount

        // 建構表頭
        const tableHeader = `
            <tr>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">Time</th>
                ${fieldNames.map(field => `<th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">${field}</th>`).join('')}
            </tr>
        `;

        // 建構表格內容
        const tableBody = Array.from({ length: reportTimes.length }).map((_, index) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${reportTimes[index] || '無數據'}</td>  
                ${fieldNames.map((_, i) => `<td style="border: 1px solid #ccc; padding: 8px;">${runcount[index] || '0'}</td>`).join('')}
            </tr>
        `).join('');

        return `
            <div style="max-height: 100%; overflow-y: auto; border: 1px solid #ccc;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; user-select: text; background-color: #f0f0f0; color: black">
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

//機台RUN總數
//SELECT * FROM GET_EQP_STATUS_RUN_COUNT('[EQP_TYPE]','[SHIFT_DAY]') 
let runcountSid = '376242334343744'; // RUN_COUNT
let runcountData;

//機台產量
//select* from GET_EQP_STATUS_OUTPUT_24H_V3 ('[EQP_TYPE]','[SHIFT_DAY]')
let outputSid = '383579207576287';
let outputSidData;

//要顯示產量的機台
//SELECT EQP_NO,EQP_TYPE FROM EQP_MASTER
let EQPNOtSid = '383582888640260';
let EQPNOdata;

//表格資料
//SELECT * FROM GET_EQP_KANBAN_TABLE_V4('[EQP_TYPE]','[SHIFT_DAY]') 機台稼動不吃工單
let gridsid = '360351530350765';
let griddata;

//各TYPE 的 產量單位
let UNITESid = '384189745466966';//select * from V_ZZ_KANBAN_TYPE_UNIT
let UNITdata;

//SELECT EQP_NO,AUTODC_OUTPUT AS CONCENTRATION FROM EQP_AUTODC_OUTPUT_CURRENT WHERE AUTODC_ITEM='CONCENTRATION'
// let CONCENTRATIONsid='384093731166011'; 
// let CONCENTRATIONdata;

//indiviadul interval id
let outputIntervalId = null;




$("#data_show").text(SHIFT_DAY.replaceAll('-', '/')).click(function () {
    $('#date')[0].showPicker();
})
$('#date').attr('max', today).val(SHIFT_DAY).change(function () {
    window.location.href = window.location.href.split('?')[0] + '?EQP_TYPE=' + EQP_TYPE + '&SHIFT_DAY=' + this.value
})

async function fetchData() {
    if (outputIntervalId) {
        clearInterval(outputIntervalId);  // 先清掉舊的
    }


    try {
        totalCardData = await getGridData_Shift(totalCardSid, EQP_TYPE, SHIFT_DAY);
        dayCardData = await getGridData_Shift(dayCardSid, EQP_TYPE, SHIFT_DAY)
        nightCardData = await getGridData_Shift(nightCardSid, EQP_TYPE, SHIFT_DAY)


        outputSidData = await getGridData_Shift(outputSid, EQP_TYPE, SHIFT_DAY)
        runcountData = await getGridData_Shift(runcountSid, EQP_TYPE, SHIFT_DAY)
        UNITdata = await getGridData(UNITESid)
        EQPNOdata = await getGridData2(EQPNOtSid)
        griddata = await getGridData_Shift(gridsid, EQP_TYPE, SHIFT_DAY);



        //產生卡片 html
        SetCard(totalCardData, dayCardData, nightCardData);
        try {

        } catch (err) {
            console.error("outputChart 發生錯誤：", err);
        }


        outputChart(outputSidData, EQPNOdata, UNITdata);
        console.log(outputSidData)


        runcountChart(runcountData);
        SetGrid(griddata, UNITdata);








        outputIntervalId = setInterval(async () => {
            outputSidData = await getGridData_Shift(outputSid, EQP_TYPE, SHIFT_DAY)
            outputChart(outputSidData, EQPNOdata, UNITdata);
            console.log(outputSidData.sort((a, b) => new Date(b.REPORT_TIME) - new Date(a.REPORT_TIME)))
        }, 180000);
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
function SetGrid(griddata, UNITdata) {
    try {
        // 先做資料過濾，篩選符合條件的資料
        function filterGridData(griddata) {
            const now = new Date();
            const nowDateStr = now.toISOString().split('T')[0];

            // 依 EQP_NO 分組
            const groups = griddata.reduce((acc, cur) => {
                (acc[cur.EQP_NO] = acc[cur.EQP_NO] || []).push(cur);
                return acc;
            }, {});

            const result = [];

            Object.entries(groups).forEach(([eqpNo, records]) => {
                const checkInDates = records.map(r => r.CHECK_IN_TIME.split(' ')[0]);

                if (!checkInDates.includes(nowDateStr)) {
                    // 當天日期不包含該 EQP_NO 的任何 CHECK_IN_TIME 日期，取 CHECK_OUT_TIME 最大的那筆
                    const latest = records.reduce((prev, curr) => {
                        return new Date(curr.CHECK_OUT_TIME) > new Date(prev.CHECK_OUT_TIME) ? curr : prev;
                    });
                    result.push(latest);
                } else {
                    const nowTime = now.getTime();

                    // 找符合 CHECK_IN_TIME <= 現在時間 <= CHECK_OUT_TIME 的筆
                    const inRangeRecord = records.find(r => {
                        const checkIn = new Date(r.CHECK_IN_TIME).getTime();
                        const checkOut = new Date(r.CHECK_OUT_TIME).getTime();
                        return nowTime >= checkIn && nowTime <= checkOut;
                    });

                    if (inRangeRecord) {
                        result.push(inRangeRecord);
                    } else {
                        // 找 CHECK_IN_TIME 大於現在時間且最近的筆
                        const futureRecords = records
                            .filter(r => new Date(r.CHECK_IN_TIME).getTime() > nowTime)
                            .sort((a, b) => new Date(a.CHECK_IN_TIME) - new Date(b.CHECK_IN_TIME));

                        if (futureRecords.length > 0) {
                            result.push(futureRecords[0]);
                        } else {
                            // 沒符合條件，取 CHECK_OUT_TIME 最大的那筆
                            const latest = records.reduce((prev, curr) => {
                                return new Date(curr.CHECK_OUT_TIME) > new Date(prev.CHECK_OUT_TIME) ? curr : prev;
                            });
                            result.push(latest);
                        }
                    }
                }
            });

            return result;
        }

        // 過濾資料
        let filteredData = filterGridData(griddata);

        // 接著用過濾後資料做 DataTable 用的轉換
        let dataSet = filteredData.map((e) => {
            const match = UNITdata.Grid_Data.find(item => item.EQP_TYPE === e.EQP_TYPE);
            const unit = match ? `(${match.UNIT})` : "";
            const outputValue = e.OUTPUT_TOTAL ? `${e.OUTPUT_TOTAL} ${unit}` : '';
            const targetShotValue = e.TARGET_SHOT ? `${e.TARGET_SHOT} ${unit}` : '';

            return {
                "EQP_NO": e.EQP_NO,
                "EQP_TYPE": e.EQP_TYPE,
                "STATUS": e.STATUS,
                "WO": e.WO || '',
                "USER_NAME": e.USER_NAME || '',
                "PART_NO": e.PART_NO || '',
                "PART_SPEC": e.PART_SPEC || '',
                "TARGET_SHOT": targetShotValue || '',
                "AVL": e.AVL || 0,
                "OUTPUT_TOTAL": outputValue || 0,
                "KEYIN_OUTPUT_TOTAL": e.KEYIN_OUTPUT_TOTAL || 0,
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
                { title: "Item NO.", data: "PART_NO" },
                { title: "Item Name", data: "PART_SPEC" },
                { title: "SCHEDULE_</br>SHOT", data: "TARGET_SHOT" },
                { title: "IoT count", data: "OUTPUT_TOTAL" },
                { title: "A(%)", data: "AVL" },
                { title: "Keyin output", data: "KEYIN_OUTPUT_TOTAL" }
            ],
            columnDefs: [
                {
                    targets: 0,
                    render: function (data, type, row) {
                        let url = `${window.location.protocol}//${default_ip}/${PROJECT_NAME}/wwwroot/MES-KANBAN/WIP/L2/eqp.html?EQP_TYPE=${row.EQP_TYPE}&EQP_NO=${data}&SHIFT_DAY=${SHIFT_DAY}`;
                        return `<a href="${url}" target="_blank">${data}</a>`;
                    }
                },
                {
                    targets: 1,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).css('color', rowData.EQP_STATUS_LAYOUT_COLOR);
                    }
                },
                {
                    targets: 5,
                    createdCell: function (td, cellData, rowData, row, col) {
                        $(td).css({
                            'word-break': 'break-word',     // 讓長英文斷行
                            'white-space': 'normal',        // 允許換行
                            'overflow-wrap': 'break-word'   // 現代瀏覽器的斷行控制
                        });
                    }
                },

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



//RUN總數
function runcountChart(runcountData) {
    const chartDom = document.getElementById('run_count');
    const myChart = echarts.init(chartDom);

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function padZero(num) {
        return num < 10 ? '0' + num : num;
    }

    function generateFullDayData(data, baseDateStr, startHour = 8, intervals = 96) {
        const timePoints = [];
        const baseDate = new Date(baseDateStr + 'T00:00:00');

        for (let i = 0; i < intervals; i++) {
            const time = new Date(baseDate.getTime());
            time.setHours(startHour);
            time.setMinutes(0);
            time.setSeconds(0);
            time.setMilliseconds(0);
            time.setMinutes(time.getMinutes() + i * 15);

            const y = time.getFullYear();
            const m = padZero(time.getMonth() + 1);
            const d = padZero(time.getDate());
            const h = padZero(time.getHours());
            const min = padZero(time.getMinutes());

            timePoints.push(`${y}-${m}-${d} ${h}:${min}`);
        }

        // 用 REPORT_TIME 的前16字（去秒）做索引
        const dataMap = {};
        data.forEach(item => {
            const key = item.REPORT_TIME ? item.REPORT_TIME.slice(0, 16) : null;
            if (key) {
                dataMap[key] = parseFloat(item.RUN_COUNT) || 0;
            }
        });

        return timePoints.map(tp => ({
            TIME: tp,
            RUN_COUNT: dataMap.hasOwnProperty(tp) ? dataMap[tp] : 0
        }));
    }

    const shiftDay = getQueryParam('SHIFT_DAY') || '';

    const fullData = generateFullDayData(runcountData, shiftDay);

    const timeLabels = fullData.map(item => item.TIME.slice(11));
    const runCounts = fullData.map(item => item.RUN_COUNT);

    const option = {
        title: {
            text: 'Running Machines',
            left: 'center',
            textStyle: { color: 'white' }
        },
        grid: {
            top: '25%',
            bottom: '10%',
            left: '5%',
            right: '5%'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'line' },
            formatter: function (params) {
                return params.map(p => `<div>TIME:${p.name}</br> RUN_COUNT：${p.value}</div>`).join('');
            }
        },
        toolbox: {
            right: '5%',
            feature: {
                dataView: dataViewConfig2(
                    " ",
                    fullData.map(d => d.TIME),
                    ['RUN_COUNT'],
                    fullData.map(d => d.RUN_COUNT)
                ),
            },
            iconStyle: { borderColor: 'white' }
        },
        xAxis: {
            type: 'category',
            data: timeLabels,
            boundaryGap: false,
            name: 'TIME',
            axisLabel: {
                color: 'white',
                interval: 0,
                formatter: val => val.endsWith(':00') ? val : ''
            },
            axisTick: {
                alignWithLabel: true,
                interval: (index, value) => value.endsWith(':00') ? 1 : 0
            },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } }
        },
        yAxis: {
            type: 'value',
            name: 'RUN COUNT',
            axisLabel: { color: 'white' },
            nameTextStyle: { color: 'white' },
            axisLine: { lineStyle: { color: 'white' } },
            splitLine: { lineStyle: { color: "#ffffff50" } }
        },
        series: [{
            name: 'RUN_COUNT',
            type: 'line',
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 5,
            itemStyle: {
                color: '#00FF00',       // 點內部填充色
                borderColor: '#00FF00', // 邊框色（深綠）
                borderWidth: 2
            },
            emphasis: {
                itemStyle: {
                    color: '#00FF00',
                    borderColor: '#00FF00',
                    borderWidth: 3
                }
            },
            data: runCounts,
            lineStyle: { color: '#00FF00' },
            smooth: true
        }]


    };

    myChart.setOption(option);
}

//產量
function outputChart(outputSidData, EQPNOdata) {
    const chartDom = document.getElementById('main');



    let myChart = echarts.getInstanceByDom(chartDom);


    //delete instance
    if (myChart) {
        echarts.dispose(chartDom);
    }

    myChart = echarts.init(chartDom);


    const hours = [
        "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00",
        "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
        "24:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"
    ];

    const unitList = UNITdata.Grid_Data
        .filter(item => item.EQP_TYPE === EQP_TYPE)  // 過濾掉 PULP
        .map(item => item.UNIT);
    const unitName = unitList[0] || 'Output';

    const eqpList = EQPNOdata.Grid_Data.map(item => item.EQP_NO);
    const hoursMap = {};
    hours.forEach((h, i) => hoursMap[h] = i);

    // 🔸初始化所有機台每小時為0
    const stackedData = {};
    eqpList.forEach(eqp => {
        stackedData[eqp] = new Array(hours.length).fill(0);
    });

    // 🔸如有資料才填入
    if (outputSidData && outputSidData.length > 0) {
        outputSidData.forEach(item => {
            const timeStr = item.REPORT_TIME.substring(11, 16);
            const idx = hoursMap[timeStr];
            const eqp = item.EQP_NO;
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
                return `<div>EQP_NO: ${params.seriesName}</div>
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
                dataView: dataViewConfig("Hourly Output", hours, fieldNames),
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

    // const chartOption = myChart.getOption();
    const isCurrentlyStacked = option.series?.some(s => s.stack !== null);


    // 監聽 magicType 事件，動態調整 stack 屬性
    myChart.on('magicTypeChanged', function (params) {

        console.log(params.currentType)

        if (params.currentType === 'bar') {
            // 按下 bar，取消堆疊
            myChart.setOption({
                series: [
                    { stack: '' },
                    { stack: '' },
                    { stack: '' },
                    { stack: '' },
                    { stack: '' },
                    { stack: '' },
                    { stack: '' },
                    { stack: '' }
                ]
            });
        } else if (params.currentType === 'stack') {
            // 按下 stack，啟用堆疊

            if (isCurrentlyStacked) {
                myChart.setOption({
                    series: [
                        { stack: '' },
                        { stack: '' },
                        { stack: '' },
                        { stack: '' },
                        { stack: '' },
                        { stack: '' },
                        { stack: '' },
                        { stack: '' }
                    ]
                });

            }

        }
    });

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


async function getGridData2(SID) {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/H5_GetGrid';

    // 定义要传递的参数对象
    let params = {
        SID: SID,
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };

    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛
        Field: ["EQP_TYPE"],
        Oper: ["="],
        Value: [EQP_TYPE]
    };

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
        // 可以添加其他必要的请求头信息
    });

    // 构建请求体
    let requestBody = JSON.stringify(conditions);

    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };

    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if (data.result) {
                return data;
            }
            else {
                Set_Clean();
            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);

        }
    } catch (error) {
        console.error(error);
    }
}