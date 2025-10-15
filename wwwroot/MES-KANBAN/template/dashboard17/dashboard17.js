let CNCSID = '367336953286906'
let DCSID = '367337348733019'
let PieChartSID = '367580013003627'

// 封裝圖表的初始化邏輯
async function renderChart(dataSID, chartTitle, colorSet, maxRatio, containerId) {
    const $wrapper = $(`#${containerId}`);
    const loadingElement = `
      <div class="loading-container">
          <div class="loading-spinner"></div>
      </div>`;
    $wrapper.html(loadingElement);

    //假資料
    let chartData = {
        category: [
            '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07',
            '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11', '2025-01-12', '2025-01-13', '2025-01-14', '2025-01-15',
            '2025-01-16', '2025-01-17', '2025-01-18', '2025-01-19', '2025-01-20', '2025-01-21', '2025-01-22', '2025-01-23',
            '2025-01-24', '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30'
        ],
        maxProductionTime: [
            18, 20, 22, 19, 21, 23, 20, 18, 21, 22, 23, 19, 18, 20, 22,
            21, 23, 24, 19, 22, 21, 23, 20, 19, 21, 22, 23, 19, 21, 22
        ],
        currentProductionTime: [
            15, 17, 19, 16, 18, 20, 17, 15, 18, 19, 20, 16, 15, 17, 19,
            18, 20, 21, 16, 19, 18, 20, 17, 16, 18, 19, 20, 16, 18, 19
        ],
        dailyOutput: [
            100, 120, 110, 115, 105, 130, 125, 110, 115, 120, 130, 105, 110, 125, 115,
            120, 125, 135, 110, 115, 130, 125, 120, 110, 130, 115, 120, 110, 125, 120
        ]
    };


    // 如果要抓SID 改這邊
    // let chartData = {
    //     category: [],
    //     maxProductionTime: [],
    //     currentProductionTime: [],
    //     dailyOutput: []
    // };
    // let rowData = await (await getGridData2(dataSID)).Grid_Data
    // rowData.forEach(row => {
    //     chartData.category.push(row.SHIFT_DAY)
    //     chartData.maxProductionTime.push(row.MAX_PRODUCTION_TIME * maxRatio)
    //     chartData.currentProductionTime.push(parseFloat(row.CUR_PRODUCTION_TIME).toFixed(1))
    //     chartData.dailyOutput.push(row.OUTPUT_TOTAL)
    // });

    // 初始化畫布
    let chartDom = document.getElementById(containerId);
    let myChart = echarts.init(chartDom);
    let option;

    // 圖表設定
    option = {
        title: {
            text: chartTitle,
            left: 'center',
            top: 10,
            textStyle: {
                fontFamily: 'Josefin Sans, sans-serif',
                color: '#ffffff',
                fontSize: 18
            }
        },
        backgroundColor: '#0f375f',
        textStyle: {
            fontSize: 12, // 設定全局文字大小為 16px
            color: '#ccc' // 可選，設定文字顏色
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['dailyOutput', 'currentProductionTime', 'maxProductionTime'],
            textStyle: {
                color: '#ccc',
                fontFamily: 'Josefin Sans, sans-serif',
            },
            top: "45"
        },
        grid: {
            top: '20%',
            left: '4%',
            right: '4%',
            bottom: '2%',
            containLabel: true
        },
        xAxis: {
            data: chartData.category,
            axisLine: {
                lineStyle: {
                    color: '#ccc'
                }
            }
        },
        yAxis: [
            {
                type: 'value',
                name: 'Production Time',
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    },
                },
                nameGap: 30,
                splitLine: { show: false }
            },
            {
                type: 'value',
                name: 'Daily Output',
                position: 'right', // 放置在右側
                axisLine: {
                    lineStyle: {
                        color: '#ccc'
                    }
                },
                nameGap: 30,
                splitLine: { show: false },

            }
        ],
        series: [
            {
                name: 'dailyOutput',
                type: 'line',
                showAllSymbol: true,
                symbol: 'emptyCircle',
                symbolSize: 8,
                lineStyle: {
                    width: 4, // 線條粗細
                    color: colorSet.output
                },
                data: chartData.dailyOutput,
                yAxisIndex: 1 // 將此系列分配到右側的 Y 軸
            },
            {
                name: 'currentProductionTime',
                type: 'bar',
                itemStyle: {
                    borderRadius: 5,
                    color: colorSet.current
                },
                data: chartData.currentProductionTime
            },
            {
                name: 'maxProductionTime',
                type: 'bar',
                barGap: '-100%',
                itemStyle: {
                    borderRadius: 5,
                    color: colorSet.max
                },
                z: -12,
                data: chartData.maxProductionTime
            }
        ]
    };

    // 開始渲染圖形
    option && myChart.setOption(option);

    // 超連結到當天詳情
    myChart.on('click', function (params) {
        if (params.componentType === 'series') {
            var url = window.location.protocol + '//' + default_ip + '/' + PROJECT_NAME+"/"+kanbanRoute + '/zz_query/kanban-L2.html?EQP_TYPE=CNC&SHIFT_DAY=' + params.name;
            window.open(url, '_blank');
        }
    });

    // 響應視窗大小縮放
    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

// 頁面加載後執行
$(document).ready(async () => {
    // 第一張圖的配置
    let dataSID1 = '365963677460881';
    let chartTitle1 = 'Injection Efficiency Analysis';
    let colorSet1 = {
        current: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#14c8d4' },
            { offset: 1, color: '#43eec6' }
        ]),
        max: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(20,200,212,0.5)' },
            { offset: 0.2, color: 'rgba(20,200,212,0.2)' },
            { offset: 1, color: 'rgba(20,200,212,0)' }
        ]),
        output: '#0171a9' // Set line color for CNC
    };
    let maxRatio1 = 22 / 24; // 只運行22小時

    // 第二張圖的配置
    let dataSID2 = '366050571390506';
    let chartTitle2 = 'Stamping Efficiency Analysis';
    let colorSet2 = {
        current: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#004c99' },  // 深藍色，作為漸變的起始顏色
            { offset: 1, color: '#0066cc' }   // 較明亮的深藍色，作為漸變的結束顏色
        ]),
        max: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,153,255,0.5)' },  // 淺藍色，50%透明度
            { offset: 0.2, color: 'rgba(0,153,255,0.2)' },  // 淺藍色，20%透明度
            { offset: 1, color: 'rgba(102,255,102,0)' }
        ]),
        output: '#005b99' // 深藍色，用於與 current 顏色對比

    };
    let maxRatio2 = 8 / 24; // 只運行8小時

    // 渲染兩張圖
    await renderChart(dataSID1, chartTitle1, colorSet1, maxRatio1, 'CNC');
    await renderChart(dataSID2, chartTitle2, colorSet2, maxRatio2, 'DC');
});


let totalRunCount = 0;
let totalNRunCount = 0;
let totalEqpnoCount = 0;

let oeeValue = 0;


async function BarChart(SID, ID, callback) {
    let chartData = {
        eqpno: [],  // 設備編號
        status: [],  // 狀態
        output: [],  // 輸出數據
        colors: []  // 用來儲存每個條形圖的顏色
    };

    let runcount = 0;  // RUN 的數量
    let stopcount = 0;  // 非 RUN 的數量
    let offcount = 0;
    let errorcount = 0;
    let outputTotal = 0;  // OUTPUT 的總和




    // 假資料    
    let rowData = [];
    if (SID === '367336953286906') {  
        rowData = [
            { EQP_NO: 'EQP001', CUR_STATUS: 'Run', AUTODC_OUTPUT: 120 },
            { EQP_NO: 'EQP002', CUR_STATUS: 'Idle', AUTODC_OUTPUT: 80 },
            { EQP_NO: 'EQP003', CUR_STATUS: 'PowerOff', AUTODC_OUTPUT: 0 },
            { EQP_NO: 'EQP004', CUR_STATUS: 'Run', AUTODC_OUTPUT: 150 },
            { EQP_NO: 'EQP005', CUR_STATUS: 'Error', AUTODC_OUTPUT: 50 },
            { EQP_NO: 'EQP006', CUR_STATUS: 'Run', AUTODC_OUTPUT: 110 },
            { EQP_NO: 'EQP007', CUR_STATUS: 'Idle', AUTODC_OUTPUT: 70 },
            { EQP_NO: 'EQP008', CUR_STATUS: 'Run', AUTODC_OUTPUT: 130 },
            { EQP_NO: 'EQP009', CUR_STATUS: 'Error', AUTODC_OUTPUT: 20 },
            { EQP_NO: 'EQP010', CUR_STATUS: 'PowerOff', AUTODC_OUTPUT: 2 },
        ];
    } else if (SID === '367337348733019') {  
        rowData = [
            { EQP_NO: 'G01', CUR_STATUS: 'Run', AUTODC_OUTPUT: 10 },
            { EQP_NO: 'G02', CUR_STATUS: 'Idle', AUTODC_OUTPUT: 80 },
            { EQP_NO: 'G03', CUR_STATUS: 'PowerOff', AUTODC_OUTPUT: 0 },
            { EQP_NO: 'G04', CUR_STATUS: 'Run', AUTODC_OUTPUT: 50 },
            { EQP_NO: 'G05', CUR_STATUS: 'Error', AUTODC_OUTPUT: 50 },
            { EQP_NO: 'G06', CUR_STATUS: 'Run', AUTODC_OUTPUT: 70 },
            { EQP_NO: 'G07', CUR_STATUS: 'Idle', AUTODC_OUTPUT: 70 },
            { EQP_NO: 'G08', CUR_STATUS: 'Run', AUTODC_OUTPUT: 30 },
            { EQP_NO: 'G09', CUR_STATUS: 'Error', AUTODC_OUTPUT: 20 },
            { EQP_NO: 'G10', CUR_STATUS: 'PowerOff', AUTODC_OUTPUT: 5 },
        ];
    }
    
    // SID獲取數據
    // let rowData = await (await getGridData2(SID)).Grid_Data;
    rowData.forEach(row => {
        chartData.eqpno.push(row.EQP_NO);
        chartData.status.push(row.CUR_STATUS);

        // 根據 STATUS 設置顏色並分配 OUTPUT
        if (row.CUR_STATUS === 'Run') {
            chartData.output.push(row.AUTODC_OUTPUT);  // 存储 RUN 的 OUTPUT
            chartData.colors.push('#00FF00');  // RUN 的颜色是绿色
            runcount++;  // 增加 RUN 的计数
        } else if (row.CUR_STATUS === 'Idle') {
            chartData.output.push(row.AUTODC_OUTPUT);  // 存储 NOT RUN 的 OUTPUT
            chartData.colors.push('#FFA500');  // NOT RUN 的颜色是红色
            stopcount++;  // 增加非 RUN 的计数
        } else if (row.CUR_STATUS === 'PowerOff') {
            chartData.output.push(row.AUTODC_OUTPUT);  // 存储 NOT RUN 的 OUTPUT
            chartData.colors.push('#D3D3D3');  // NOT RUN 的颜色是红色
            offcount++;
        } else {
            chartData.output.push(row.AUTODC_OUTPUT);  // 存储 NOT RUN 的 OUTPUT
            chartData.colors.push('#FF0000');  // NOT RUN 的颜色是红色
            errorcount++
        }

        // 計算 OUTPUT 的總和
        const outputValues = row.AUTODC_OUTPUT; // 拆分為陣列
        let outputSum = 0;
        outputSum += parseFloat(outputValues);
        outputTotal += outputSum;  // 計算總和
    });

    // 排序：根據 OUTPUT 的數值對 eqpno 和 output 進行排序，從大到小
    const sortedData = chartData.output
        .map((value, index) => ({
            value,
            eqpno: chartData.eqpno[index],
            status: chartData.status[index],
            color: chartData.colors[index]
        })) // 合併數據和顏色
        .sort((a, b) => b.value - a.value); // 根據數值進行排序

    // 更新排序後的數據
    chartData.eqpno = sortedData.map(item => item.eqpno);
    chartData.output = sortedData.map(item => item.value);
    chartData.colors = sortedData.map(item => item.color);

    // 更新 HTML 中的統計數據
    document.getElementById(`${ID}run`).innerText = ` ${runcount}`;  //RUN
    document.getElementById(`${ID}stop`).innerText = ` ${stopcount}`; //idle
    document.getElementById(`${ID}off`).innerText = ` ${offcount}`; //poweroff
    document.getElementById(`${ID}error`).innerText = ` ${errorcount}`; //error
    document.getElementById(`${ID}OutputTotal`).innerText = ` ${outputTotal}`;//OUTPUT
    // 呼叫外部回調函數更新總計
    callback(runcount, chartData.eqpno.length);

    // 初始化 ECharts
    var myChart = echarts.init(document.getElementById(`${ID}Chart`));

    // 配置選項
    var option = {
        legend: {
            data: ['RUN', 'NOT RUN'],  // 圖例項
            textStyle: {
                color: '#FFFFFF',  // 圖例文字顏色
                fontSize: 12,      // 圖例字體大小
            },
            top: '0',
            left: 'center',  // 圖例居中
        },
        xAxis: {
            type: 'value',  // 數值類型的 X 軸
            axisLabel: {
                fontSize: 10,
                color: '#FFFFFF',
                show: false,  // 隱藏 X 軸的標籤
            },
            axisLine: { show: false },
            splitLine: { show: false },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'category',  // Y 軸使用類別類型
            data: chartData.eqpno,  // 使用設備編號作為 Y 軸的資料
            axisLabel: {
                fontSize: 10,
                color: '#FFFFFF',
                padding: [10, 0]  // 調整 padding 來對齊標籤
            },
            inverse: true,
            axisLine: { show: false },
            splitLine: { show: false },
            axisTick: { show: false }
        },
        series: [{
            name: 'RUN & NOT RUN',  // 單個系列
            data: chartData.output,  // 使用 OUTPUT 作為條形圖的數值
            type: 'bar',  // 條形圖
            itemStyle: {
                normal: {
                    color: function (params) {
                        // 根據狀態顏色區分 RUN 和 NOT RUN
                        return chartData.colors[params.dataIndex];  // 根據顏色陣列設置每個條形圖的顏色
                    }
                }
            },
            label: {
                show: true,
                position: 'right',  // 數值顯示在條形圖外面的右側
                color: '#FFFFFF',  // 設置數值顏色為白色
                fontSize: 12,  // 設置字體大小
                distance: 10,  // 控制數值與條形圖的距離
            },
            barCategoryGap: '30%'  // 設置條形圖的間隙
        }],
        grid: {
            left: '20%',  // 增加左邊距
            right: '15%',  // 增加右邊距，確保數值不被遮擋
            top: '2%',  // 增加上邊距，給圖例和圖表之間留出空間
            bottom: '2%'  // 增加下邊距
        }
    };

    // 使用配置項加載圖表
    myChart.setOption(option);
    window.addEventListener('resize', function () {
        myChart.resize();  // 在窗口大小變動時調整圖表大小
    });
}

// 調用兩個圖的函數，並傳遞回調函數
BarChart(CNCSID, 'CNC', updateTotal);
BarChart(DCSID, 'DC', updateTotal);






// 外部回調函數，用於更新總的 RUN 數量和 EQP_NO 數量
function updateTotal(runCount, eqpnoCount) {
    totalRunCount += runCount;
    totalEqpnoCount += eqpnoCount;

    // 更新顯示總的 RUN 數量和 EQP_NO 數量
    document.getElementById('totalRunCount').innerText = `${totalRunCount}`; //中上 的總RUN

    if (totalRunCount !== 0 && totalEqpnoCount !== 0) {
        oeeValue = Math.round((totalRunCount / totalEqpnoCount) * 100);  // 計算 OEE 百分比
    } else {
        oeeValue = 0;  // 防止除以零或其他錯誤
    }

    // 呼叫 OEEChart 函數，將計算出的 oeeValue 傳遞給它
    OEEChart($("#guageB")[0], { value: oeeValue, name: "OEE" });



    // let percentage = ((totalRunCount / totalEqpnoCount) * 100).toFixed(2);

    // // 更新顯示
    // document.getElementById('totalEqpnoCount').innerText = `${percentage}%`;; // 中上 的 OEE
}

async function PieChart(SID) {
    // 初始化 KWH數據容器
    let kwhData = {
        EQP_NO: [],  // 設備編號
        OUTPUT: []   // 每個設備的KWH輸出
    };


    let containerWidth = document.getElementById('PieChart').offsetWidth;

    //假資料
    let rowData = [
        { EQP_NO: 'P1', OUTPUT: 3000 },
        { EQP_NO: 'P2', OUTPUT: 150 },
        { EQP_NO: 'P3', OUTPUT: 200 },
        { EQP_NO: 'P4', OUTPUT: 180 },
        { EQP_NO: 'P5', OUTPUT: 160 },
        { EQP_NO: 'P6', OUTPUT: 140 },
        { EQP_NO: 'P7', OUTPUT: 130 },
        { EQP_NO: 'P8', OUTPUT: 170 }
    ];


    // 獲取SID數據
    // let rowData = await (await getGridData2(SID)).Grid_Data;

    let selectedData = rowData.slice(1, 8);
    selectedData.forEach(row => {
        kwhData.EQP_NO.push(row.EQP_NO);         // 收集設備編號
        kwhData.OUTPUT.push(row.OUTPUT);         // 收集每個設備的 KWH 值

    });
    let KWH_TOT = rowData[0].OUTPUT;  // 記錄 KWH 總和
    // 根據容器寬度動態設置 itemHeight
    // let itemHeight = containerWidth < 490 ? 5 : containerWidth * 0.03;

    // 初始化 ECharts
    var myChart = echarts.init(document.getElementById('PieChart'));

    // 配置選項
    var option = {
        title: {
            text: 'KWH Distribution by P2～P8',  // 標題
            textStyle: {
                fontFamily: 'Josefin Sans, sans-serif',
                color: '#FFFFFF',  // 白色字體
                fontSize: 14
            },
            top: '10%',
            left: 'center'
        },
        legend: {
            orient: 'vertical',  // 圖例縱向排列
            right: '10%',
            top: '35%',  // 圖例的位置
            data: kwhData.EQP_NO,  // 使用設備編號作為圖例項目
            textStyle: {
                color: '#FFFFFF',
                fontSize: 12
            },
            itemHeight:10,  // 圖例項目高度
            formatter: function (name) {
                // 動態顯示每個設備的 KWH 值
                let index = kwhData.EQP_NO.indexOf(name);
                let outputValue = kwhData.OUTPUT[index];
                return name + ' - ' + outputValue + ' (Kwh)';
            }
        },
        series: [
            {
                name: 'KWH',
                type: 'pie',
                radius: '60%',  // 餅圖半徑
                center: ['30%', '60%'],  // 餅圖中心位置
                data: selectedData.map(row => ({
                    name: row.EQP_NO,  // 設備編號
                    value: row.OUTPUT   // 對應的KWH值
                })),
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                label: {
                    show: true,  // 顯示標籤
                    formatter: '{c}',  // 顯示每個扇形的數值（單位 KWH）
                    color: '#FFFFFF',  // 設置標籤文字顏色
                    fontSize: 8,  // 字體大小
                    position: 'inside'  // 標籤顯示在餅圖內部
                },
                labelLine: {
                    show: false  // 禁止顯示標籤線（連接線）
                }
            }
        ]
    };

    // 顯示 KWH 總和
    document.getElementById('KWH_TOT').innerText = ` ${KWH_TOT} (Kwh)`;

    // 使用配置項加載圖表
    myChart.setOption(option);

    // 在窗口大小變動時自動調整圖表大小
    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

PieChart(PieChartSID);




async function OEEChart(target, data) {
    // 動態變色
    const setColor = (value) => {
        if (value >= 80) {
            return '#74dd88'; // 綠色
        } else if (value >= 60) {
            return '#fda32b'; // 橙色
        } else {
            return '#ff6A6A'; // 紅色
        }
    };

    // 圖表設置
    let option = {
        tooltip: {
            show: true
        },
        series: [
            {
                name: data.name,
                type: 'gauge',
                radius: "100%",
                center: ['50%', '55%'],
                progress: {
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: [[1, '#fff']], // 刻度軸線顏色設為白色
                        width: 10
                    }
                },
                axisTick: {
                    lineStyle: {
                        color: '#fff' // 刻度小線顏色設為白色
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#fff', // 分割線顏色設為白色
                        width: 2
                    }
                },
                axisLabel: {
                    show: false
                },
                pointer: {
                    show: true,
                },
                itemStyle: {
                    color: setColor(data.value) // 指針顏色
                },
                detail: {
                    valueAnimation: true, // 數字動畫
                    formatter: '{value} %',
                    color: setColor(data.value), // 數字顏色
                    fontSize: 16,
                    offsetCenter: [0, '80%']
                },
                data: [
                    {
                        value: data.value,
                        name: data.name,
                    }
                ],
                title: {
                    color: '#fff', // 標題文字顏色設為白色
                    fontSize: 16,
                    offsetCenter: [0, '45%']
                }
            }
        ],
    };

    let myChart = await echarts.init(target); //等待初始化完成
    myChart.setOption(option);

    // 在窗口大小調整時，手動調整圖表大小
    $(window).on('resize', function () {
        myChart.resize();
    });
}




async function getGridData2(SID) {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/GetData';

    // 定义要传递的参数对象
    let params = {
        SID: SID,
        TokenKey: 'WEYU54226552'
        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };

    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛
        // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
        // Oper: ["like", "between"],
        // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
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
                // Set_Clean();
            }
        } else {
            throw new Error('获取Grid数据失败，状态码：' + response.status);

        }
    } catch (error) {
        console.error(error);
    }
}