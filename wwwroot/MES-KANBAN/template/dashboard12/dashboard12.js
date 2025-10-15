const layoutItems =[
    { "id":"2PCT40900", "label": "外氣溫度", "dataType":"number", "x": 0, "y": 5.09 },
    { "id":"2PCT40901", "label": "外氣濕度", "dataType":"number", "x": 0, "y": 11.31 },
    { "id":"2PCT40902", "label": "水壓壓力", "dataType":"number", "x": 0, "y": 17.2 },
    { "id":"2PCT40903", "label": "T6", "dataType":"number", "x": 31.1, "y": 4.36 },
    { "id":"2PCT40904", "label": "PS", "dataType":"number", "x": 3.56, "y": 30.91 },
    { "id":"2PCT40905", "label": "T5", "dataType":"number", "x": 21.53, "y": 47.59 },
    { "id":"2PCT40906", "label": "EV3FAN", "dataType":"number", "x": 31.77, "y": 13.44 },
    { "id":"2PCT40907", "label": "EV1", "dataType":"number", "x": 34.23, "y": 37.67 },
    { "id":"2PCT40908", "label": "EV5", "dataType":"number", "x": 48.84, "y": 19.38 },
    { "id":"2PCT40909", "label": "EV4FAN", "dataType":"number", "x": 59.19, "y": 14 },
    { "id":"2PCT40911", "label": "EV6", "dataType":"number", "x": 68.12, "y": 25.13 },
    { "id":"2PCT40944", "label": "A2", "dataType":"status", "x": 63.46, "y": 1.81 },
    { "id":"2PCT40948", "label": "B2", "dataType":"status", "x": 52.72, "y": 4.77 },
    { "id":"2PCT40952", "label": "C2", "dataType":"status", "x": 74.71, "y": 4.77 },
    { "id":"2PCT40940", "label": "Z1", "dataType":"status", "x": 42.76, "y": 6.07 },
    { "id":"2PCT40932", "label": "X1", "dataType":"status", "x": 36.68, "y": 25.74 },
    { "id":"2PCT40913", "label": "T1", "dataType":"number", "x": 26.2, "y": 62.47 },
    { "id":"2PCT40916", "label": "T2", "dataType":"number", "x": 22.06, "y": 86.18 },
    { "id":"2PCT40912", "label": "T3", "dataType":"number", "x": 11.53, "y": 61.47 },
    { "id":"2PCT40915", "label": "T4", "dataType":"number", "x": 9.72, "y": 86.37 },
    { "id":"2PCT40914", "label": "EV2", "dataType":"number", "x": 41.21, "y": 58.99 },
    { "id":"2PCT40936", "label": "Y1", "dataType":"status", "x": 44.21, "y": 45.99 },
]

const labelMapping = {
    "2PCT40900": "二外氣溫度",
    "2PCT40903":"管路溫度T6(回水)",
    "2PCT40905":"管路溫度T5(出水)",
    "2PCT40912":"管路溫度T3",
    "2PCT40913":"管路溫度T1",
    "2PCT40915":"管路溫度T4",
    "2PCT40916":"管路溫度T2",
    "2PCT40917":"頻率1",
    "2PCT40918":"頻率2",
    "2PCT40919":"頻率3",
    "2PCT40920":"頻率4",
    "2PCT40921":"頻率5",
    "2PCT40922":"頻率6",
    "OUTPUT":"kW",
}

// dataView配置
const dataViewConfig = (title) => ({
    show: true,
    title: "查看數據",
    lang: [title, '關閉', '刷新'],  // 將圖表的 title 作為第一個元素
    readOnly: true,
    // backgroundColor: 'transparent', // 背景顏色
    optionToContent: function (opt) {
        const axisData = opt.xAxis[0].data; // x 軸類別
        const series = opt.series; // 所有數據集
    
        // 構建表格 HTML
        const tableHeader = `
            <tr>
                <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">時間</th>
                ${series.map(s => `<th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">${s.name}</th>`).join('')}
            </tr>
        `;
        
        const tableBody = axisData.map((category, index) => `
            <tr>
                <td style="border: 1px solid #ccc; padding: 8px;">${category}</td>
                ${series.map(s => `<td style="border: 1px solid #ccc; padding: 8px;">${s.data[index]}</td>`).join('')}
            </tr>
        `).join('');
    
        return `
            <div style="max-height: 100%; overflow-y: auto; border: 1px solid #ccc;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; user-select: text; background-color: #f0f0f0;">
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


//管道圖 數據
// var layoutGridSid = '332245892683112'
var layoutGridSid = './data/layoutGridSid.json'

//表格1參數 狀態清單
// var MultiGridSid1 ='332098016080802';
var MultiGridSid1 ='./data/MultiGridSid1.json';
//表格2參數 參數設定值
// var MultiGridSid2 ='332098023610850';
var MultiGridSid2 ='./data/MultiGridSid2.json';
//表格3參數 運行狀態
// var MultiGridSid3 ='332617798670170';
var MultiGridSid3 ='./data/MultiGridSid3.json';

// 左-1
// var chartSid1='332160811860295';
var chartSid1='./data/chartSid1.json';

// 左-2
// var chartSid2='332161895677808';
var chartSid2='./data/chartSid2.json';

// 左-3
// var chartSid3='365448816760901';
var chartSid3='./data/chartSid3.json';

// 右-1
// var chartSid4='332692103883314';
var chartSid4='./data/chartSid4.json';

// 右-2
// var chartSid5='332692532030770';
var chartSid5='./data/chartSid5.json';

// DEMO假資料模擬API，實際使用需移除
function getGridData(url){
    let data = fetch(url).then(response => response.json())
    return data
}

$(document).ready(async()=>{
    const charts = [
        { sid: chartSid1, wrapper: "multiLineAWrapper", type: "multi", title: "I", render: multiLineChart },
        { sid: chartSid2, wrapper: "barAWrapper", type: "bar", title: "kWh_tot", render: barChart },
        { sid: chartSid3, wrapper: "multiLineBWrapper", type: "multi", title: "kW", render: multiLineChart },
        { sid: chartSid4, wrapper: "multiLineCWrapper", type: "multi", title: "PCT Temperature", render: multiLineChart },
        { sid: chartSid5, wrapper: "multiLineDWrapper", type: "multi", title: "PCT Frequency", render: multiLineChart }
    ];

    charts.forEach(({ sid, wrapper, type, title, render }) => {
        // 顯示 loading 畫面
        const $wrapper = $(`#${wrapper}`);
        const loadingElement = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
            </div>`;
        $wrapper.html(loadingElement);

        // // 等待數據加載完成後畫圖
        const updateChartData = () => {
            console.log("開始更新:", title);
            
            const startTime = Date.now(); // 記錄開始時間
        
            getGridData(sid)
                .then(({ Grid_Data }) => {
                    const chartData = dataProcessing(Grid_Data, type, 'REPORT_TIME');
                    render(wrapper, chartData, title);

                    const endTime = Date.now(); // 記錄結束時間
                    const elapsedTime = endTime - startTime; // 計算所用時間
                    console.log(`已更新: ${title}, 耗時 ${elapsedTime} 毫秒`);
                })
                .catch(error => {
                    console.error(`Error fetching Grid Data for SID ${sid}:`, error);
                    // $wrapper.html(`<div class="error-message">Failed to load data</div>`);
                })
                .finally(() => {
                    // 每隔 60 秒重複執行
                    setTimeout(updateChartData, 60000);
                });
        };
    
        // 初始化圖表並設置初始數據
        updateChartData();
    });

    // 輪播表格
    loadCarouselTable();
    
    // 管道圖方塊
    setLayoutItems()

     //開啟拖拉功能
    // initDraggable()
})


// 生成管線圖上的數據方塊
function setLayoutItems(){
    console.log("開始更新Layout");

    // 載入管道圖數據
    getGridData(layoutGridSid)
        .then(({ Grid_Data }) => {
            // console.log("layout=",Grid_Data)
            Grid_Data.forEach((rowData) => {
                let girdItem = layoutItems.find((item) => (item.id === rowData.AUTODC_ITEM));

                // 若沒找到符合的 則退出這次迴圈
                if(!girdItem) return

                // 判斷資料類型
                let value;
                switch (girdItem.dataType) {
                    case "number":
                        value = rowData.AUTODC_OUTPUT;
                        break;
                    case "status":
                        value = rowData.AUTODC_OUTPUT == 1 ? "運轉" : rowData.AUTODC_OUTPUT == 0 ? "停止" : "undefined";
                        break;
                    default:
                        value = "unknown";
                }

                if (girdItem) { // 檢查 girdItem 是否為空，避免後續出錯
                    $(`#${girdItem.id}`).remove()
                    let itemHtml = `
                        <div id="${girdItem.id}" class="layout-item" style="top: ${girdItem.y}%; left: ${girdItem.x}%; ">
                            <div>${girdItem.label}</div>
                            <div>${value}</div>
                        </div>
                    `;
                    $("#layout").append(itemHtml);
                } else {
                    console.warn(`No matching item found for AUTODC_ITEM: ${rowData.AUTODC_ITEM}`);
                }
            });
        })
        .catch(error => {
            console.error(`Error fetching Grid Data for SID ${layoutGridSid}:`, error);
        })
        .finally(() => {
            console.log("已更新Layout");

            // 每隔 60 秒重複執行
            setTimeout(setLayoutItems, 60000);
        });;
}


// 將 Grid_Data 資料處理成 ECharts 的格式
// category: x軸的對應欄位，如: REPORT_TIME
function dataProcessing(rowData, chartType, category) {
    let result,xAxisData,seriesNames,seriesData;
    switch (chartType) {
        case 'multi':
            // 動態生成結果
            xAxisData = rowData.map(item => item[category]); // 取得 x 軸資料
            seriesNames = Object.keys(rowData[0]).filter(key => key !== category); // 取得 series 名稱
            seriesData = seriesNames.map((name, index) => ({
                name: labelMapping[name]||name,
                type: "line",
                data: rowData.map(item => item[name]),
                smooth: true,
            }));

            // 結果
            result = {
                legendData: seriesNames.map((name)=>({ name: labelMapping[name]||name, icon: 'circle' })),
                xAxis: {
                    type: "category",
                    data: xAxisData,
                    boundaryGap: false, //設置為 false 保證折線從邊界開始
                    axisLabel: { color: "#fff" },
                    axisLine: { lineStyle: { color: "#ffffff50" } },
                    splitLine: { show: true,lineStyle: {color: "#ffffff50" } }

                },
                yAxis: {
                    min: function(value) {
                        return value.min === 0 ? 0 : (value.min - 1).toFixed(0);  // 設定最小值
                    },
                    axisLabel: { color: "#fff" },
                    axisLine: { lineStyle: { color: "#ffffff50" } },
                    splitLine: { show: true,lineStyle: { color: "#ffffff50" } }
                },
                series: seriesData
            };
            return result;

        case 'bar':
            // 動態生成結果
            xAxisData = rowData.map(item => item[category]); // 取得 x 軸資料
            seriesNames = Object.keys(rowData[0]).filter(key => key !== category); // 取得 series 名稱
            seriesData = seriesNames.map((name, index) => ({
                name: labelMapping[name]||name,
                type: "bar",
                data: rowData.map(item => item[name]),
                emphasis: { "focus": "series" },
                label: {
                    show: true, // 顯示數據標籤
                    position: 'top', // 設置標籤位置（可選：'inside', 'outside', 'top', 'left', 'right', 等）
                    formatter: '{c}', // 使用數據值作為標籤內容，{c} 表示對應數據
                    color: '#ffffff', // 標籤文字顏色
                    distance: -10,
                    backgroundColor:"#00000050",
                    fontSize: 12, // 字體大小
                    fontWeight: 'bold', // 字體粗細，可選 'normal', 'bold', 'bolder', 'lighter' 或數值（如 100, 400, 700）
                    padding: [4, 6, 4, 6], // 上、右、下、左的內邊距，控制背景色大小
                    borderRadius: 5 // 圓角半徑，控制背景色的形狀（如圓角矩形）
                }
            }));

            // 結果
            result = {
                legendData: seriesNames.map((name)=>({ name: labelMapping[name]||name })),
                xAxis: {
                    type: "category",
                    data: xAxisData,
                    axisLabel: { color: "#fff" },
                    axisLine: { lineStyle: { color: "#ffffff50" } },
                    // splitLine: { show: true,lineStyle: {color: "#ffffff50" } }
                },
                yAxis: {
                                 axisLabel: { color: "#fff" },
                    axisLine: { lineStyle: { color: "#ffffff50" } },
                    splitLine: { show: true,lineStyle: { color: "#ffffff50" } }
                },
                series: seriesData
            };

            // console.log(result)
            return result;
    }
}

// 折線圖
function multiLineChart(targetId, chartData, title) {
    // 初始化容器
    const target = document.getElementById(targetId);
    let myChart = echarts.getInstanceByDom(target);
    if (!myChart) {
        // 第一次加載
        myChart = echarts.init(target); // 初始化實例

        const option = {
            title: {
                text: title,
                left: 'center',
                top: 5,
                textStyle: {
                    color: '#cceef9',
                    fontSize: 18
                }
            },
            color: [
                "#32cd32", // 更鮮艷的綠色 (鮮亮綠)
                "#00bcd4", // 更鮮艷的藍綠色 (鮮亮藍綠)
                "#ff5722", // 更鮮艷的橙色 (鮮亮橙)
                "#9b59b6", // 更鮮艷的紫色 (鮮亮紫)
                "#f1c40f", // 黃色 (保持不變，已經是鮮亮色)
                "#e74c3c", // 紅色 (保持不變，已經是鮮亮色)
                "#3498db", // 藍色 (保持不變，已經是鮮亮色)
                "#1abc9c", // 更鮮艷的青綠色 (鮮亮青綠)
                "#8e44ad", // 紫色 (保持不變，已經是鮮亮色)
                "#2c3e50"  // 深藍灰色 (保持不變，已經有對比度)
            ],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'line',
                    lineStyle: {
                        color: 'yellow'
                    }
                }
            },
            legend: {
                top: 30,
                left: 'center',       // 水平居中
                textStyle: {
                    color: '#eee'
                },
                data:chartData.legendData
            },
            grid: {
                top: '24%',
                left: '1%',
                right: '4%',
                bottom: '0%',
                containLabel: true
            },
            toolbox: {
                show: true,
                left: "right",
                top: "top",
                //   backgroundColor: "#ffffff",
                itemSize: 16,
                iconStyle: {
                    borderColor: '#ffffff95' // 圖標顏色為白色,
                },
                emphasis: {
                    iconStyle: {
                    borderColor: '#FFD700',
                    }
                },
                feature: {
                    dataView: dataViewConfig(title),
                }
            },
            yAxis: chartData.yAxis,
            xAxis: chartData.xAxis,
            series: chartData.series
        };
          
        // 使用配置项生成图表
        myChart.setOption(option);
        window.addEventListener('resize', function () {
            myChart.resize();
        });
    }
    // 更新圖表
    else {
        myChart.setOption({
            yAxis: chartData.yAxis,
            xAxis: chartData.xAxis,
            series: chartData.series,
            animation: false, // 關閉動畫
            toolbox:{feature:{dataView:dataViewConfig(title)}}
        })
    }
};

// 柱狀圖
function barChart(targetId, chartData, title) {
    // 初始化容器
    const target = document.getElementById(targetId);
    let myChart = echarts.getInstanceByDom(target);
    if (!myChart) {
        // 第一次加載
        myChart = echarts.init(target); // 如果沒有實例則初始化

        const option = {
            title: {
                text: title,
                left: 'center',
                textStyle: {
                    color: '#cceef9',
                    fontSize: 18
                }
            },
            color: ['#74d56a', 'rgb(102, 255, 204)', 'rgb(100, 149, 237)'], // 主題顏色
            label: {
                // color: '#eee', // 標籤文字顏色
                // fontSize: 12,  // 字體大小
                // fontWeight: 'light' // 字體粗細
            },
            legend: {
                top: 35,
                left: 'center',
                textStyle: {
                    color: '#eee',
                    fontSize: 12
                },
                data:chartData.legendData
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
            },
            grid: {
                left: '1%',
                right: '4%',
                bottom: '0%',
                containLabel: true
            },
            toolbox: {
                show: true,
                left: "right",
                top: "top",
                //   backgroundColor: "#ffffff",
                itemSize: 16,
                iconStyle: {
                    borderColor: '#ffffff95', // 圖標顏色為白色
                },
                emphasis: {
                    iconStyle: {
                    borderColor: '#FFD700',
                    }
                },
                feature: {
                    dataView: dataViewConfig(title)
                }
            },
            yAxis: chartData.yAxis,
            xAxis: chartData.xAxis,
            series: chartData.series
        };
        
        // 使用配置项生成图表
        myChart.setOption(option);
        window.addEventListener('resize', function () {
            myChart.resize();
        });
    }
    // 更新圖表
    else {
        myChart.setOption({
            yAxis: chartData.yAxis,
            xAxis: chartData.xAxis,
            series: chartData.series,
            animation: false, // 關閉動畫
            toolbox:{feature:{dataView:dataViewConfig(title)}}
        })
    }
};

// 輪播表格
async function loadCarouselTable(){
    // loading畫面
    const tableContainer = $("#carouselExampleIndicators .carousel-inner")
    if(tableContainer.text().trim() === ""){
        const loadingElement = `
            <div class="loading-container">
                <p class="text-white bg-dark w-100 lh-lg py-1 text-center">Loading...</p>
            </div>`;
        tableContainer.html(loadingElement);
    }

    let gridDataList = await Promise.all([
        // fetch('./data/fakeTableDataA01.json').then(response => response.json()),
        // fetch('./data/fakeTableDataA02.json').then(response => response.json()),
        // fetch('./data/fakeTableDataA03.json').then(response => response.json())
        // 實際應用可換成公版API
        getGridData(MultiGridSid1).then(data => data.Grid_Data),
        getGridData(MultiGridSid2).then(data => data.Grid_Data),
        getGridData(MultiGridSid3).then(data => data.Grid_Data)
    ]);

    // 建構輪播頁的內容
    let htmlContent = `
        <div class="carousel-item active">
            ${generateTable(gridDataList[0])}
        </div>
        <div class="carousel-item">
            ${generateTable(gridDataList[1])}
        </div>
        <div class="carousel-item">
            ${generateTable(gridDataList[2])}
        </div>
    `;

    // 將輪播頁內容插入網頁
    tableContainer.html(htmlContent)

    // 添加點擊事件 -> 導航欄變色
    initCarousel()

    // 添加點擊事件 -> 自動輪播開關
    const carouselElement = document.querySelector('#carouselExampleIndicators');
    const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 3000 // 設定自動播放間隔（例如 2 秒）
    });
    $("#toggleTouch").on("click", function() {
        toggleAutoplay(carousel);
        $(this).blur();
    });

    // 定時更新
    setInterval(()=>{
        updateTable()
    }, 60000)

    function generateTable(gridData) {
        if (gridData.length === 0) {
            return `
                <table class="table table-dark table-hover table-striped fw-bold">
                    <thead>
                        <tr>
                            <th class="text-center" scope="col">NO DATA</th>
                        </tr>
                    </thead>
                </table>
            `; // 如果沒有數據，顯示提示信息
        }
    
        // 提取欄位名（假設所有行都有相同的鍵）
        const columns = Object.keys(gridData[0]);
    
        // 生成表頭
        const headerRow = columns.map(column => `<th scope="col">${column}</th>`).join('');
    
        // 生成表格行
        const tableRows = gridData.map(row => `
            <tr>
                ${columns.map(column => {
                    // 根據狀態獲取對應的 CSS 類別（如果需要）
                    const statusClass = column === "STATUS" ? getStatusClass(row[column]) : '';
                    return `<td class="${statusClass}">${row[column]}</td>`;
                }).join('')}
            </tr>
        `).join('');
    
        // 返回完整的表格 HTML
        return `
            <table class="table table-dark table-hover table-striped fw-bold">
                <thead>
                    <tr>
                        ${headerRow}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    }

    function getStatusClass(status) {
        // 根據狀態改變字體顏色
        switch (status) {
            case '運轉':
            case 'Run':
                return 'text-success';
            case '停止':
                return 'text-warning';
            case '故障':
                return 'text-danger';
            case 'COOLING':
                return 'text-secondary';
            default:
                return '';
        }
    }

    function initCarousel(){
        $('.carousel-item').each(function(index) {
            const element = this;
    
            // 定義 MutationObserver 的回調函數
            const observer = new MutationObserver(function() {
                if($(element).hasClass('active')||$(element).hasClass('carousel-item-next')){
                    // 移除所有按鈕的 active 樣式
                    $('.slider-nav div').removeClass('active');
                    // 添加 active 樣式到當前選中的按鈕
                    $(`.slider-nav div:nth-child(${index+1})`).addClass('active');
                }
            });
        
            // 設置監聽目標元素及其屬性
            observer.observe(element, {
                attributes: true, // 監聽屬性變化
                attributeFilter: ['class'] // 只監聽 class 屬性變化
            });
        });
    
        // 若手動點擊則馬上變更顏色
        $('.slider-nav div').click(function () {
            // 移除所有按鈕的 active 樣式
            $('.slider-nav div').removeClass('active');
            // 添加 active 樣式到當前選中的按鈕
            $(this).addClass('active');
        });
    }

    function toggleAutoplay(carousel) {
        if (carousel._config.ride) {
            carousel._config.ride = false;  // 暫停自動播放
        } else {
            carousel._config.ride = true;  // 開啟自動播放
        }
    }

    async function updateTable(){
        console.log("開始更新Table")
        let gridDataList = await Promise.all([
            // fetch('./data/fakeTableDataA01.json').then(response => response.json()),
            // fetch('./data/fakeTableDataA02.json').then(response => response.json()),
            // fetch('./data/fakeTableDataA03.json').then(response => response.json())
            // 實際應用可換成公版API
            getGridData(MultiGridSid1).then(data => data.Grid_Data),
            getGridData(MultiGridSid2).then(data => data.Grid_Data),
            getGridData(MultiGridSid3).then(data => data.Grid_Data)
        ]);
    
        $(".carousel-item").each((index, element) => {
            // console.log($(element).html());
            $(element).html(generateTable(gridDataList[index]))
        });
        console.log("已更新Table")
    
        function generateTable(gridData) {
            if (gridData.length === 0) {
                return `
                    <table class="table table-dark table-hover table-striped fw-bold">
                        <thead>
                            <tr>
                                <th class="text-center" scope="col">NO DATA</th>
                            </tr>
                        </thead>
                    </table>
                `; // 如果沒有數據，顯示提示信息
            }
        
            // 提取欄位名（假設所有行都有相同的鍵）
            const columns = Object.keys(gridData[0]);
        
            // 生成表頭
            const headerRow = columns.map(column => `<th scope="col">${column}</th>`).join('');
        
            // 生成表格行
            const tableRows = gridData.map(row => `
                <tr>
                    ${columns.map(column => {
                        // 根據狀態獲取對應的 CSS 類別（如果需要）
                        const statusClass = column === "STATUS" ? getStatusClass(row[column]) : '';
                        return `<td class="${statusClass}">${row[column]}</td>`;
                    }).join('')}
                </tr>
            `).join('');
        
            // 返回完整的表格 HTML
            return `
                <table class="table table-dark table-hover table-striped fw-bold">
                    <thead>
                        <tr>
                            ${headerRow}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            `;
        }
    }
}

// 初始化拖拉功能
function initDraggable(){
    $(".layout-item").draggable({
        containment: "#layout", // 限制拖曳範圍
        stop: function (event, ui) {
          // 打印拖曳結束時的座標
          console.log("x:", ui.position.left, "y:", ui.position.top);
        },
    });
    // // 禁用拖曳
    // $(".layout-item").draggable('disable');

    // // 啟用拖曳
    // $(".layout-item").draggable('enable');
}

//取得當前每個item的座標
function getAllItemPositions() {
    const positions = [];
    const containerWidth = $("#layout").width();  // 取得父容器的寬度
    const containerHeight = $("#layout").height();  // 取得父容器的高度

    $(".layout-item").each(function () {
        const position = $(this).position(); // 取得座標
        const label = $(this).find("div:first").text().trim(); // 取得第一個 <div> 的文字作為 label
        const value = $(this).find("div:last").text().trim(); // 取得最後一個 <div> 的文字作為 value

        // 計算 x 和 y 的百分比，並四捨五入到小數點第一位
        const xPercent = ((position.left / containerWidth) * 100).toFixed(2);
        const yPercent = ((position.top / containerHeight) * 100).toFixed(2);

        positions.push({
            label: label,
            value: value,
            x: parseFloat(xPercent),  // 保留小數點第一位
            y: parseFloat(yPercent),  // 保留小數點第一位
        });
    });
    console.log(positions)
    // return positions;
}

