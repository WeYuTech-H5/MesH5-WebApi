//左上環狀圖SID
let doughnutSID = "361124905113294";

//右上長餅條圖SID
let BarChartASID = "361278205913350";

//中下長條圖SID
let BarChartBSID = "361288730930910";

//雷達圖SID
let RadarSID = "361289842096298";

//左下表格
let GridListASID = "361298642496299";

//中間表格
let GridListB1SID = "361531161090242";
let GridListB2SID = "361531234726885";
let GridListB3SID = "361531301640497";

async function fetchData() {
    let doughnutData = await getChartData(doughnutSID);
    let BarChartAData = await getChartData(BarChartASID);
    let BarChartBData = await getChartData(BarChartBSID);
    let RadarData = await getChartData(RadarSID);
    let GridListAData = await getGridData(GridListASID);
    let GridListB1Data = await getGridData(GridListB1SID);
    let GridListB2Data = await getGridData(GridListB2SID);
    let GridListB3Data = await getGridData(GridListB3SID);

    try {
        if (doughnutData) {
            DoughnutChart(doughnutData);
            BarChartA(BarChartAData);
            BarChartB(BarChartBData);
            RadarChart(RadarData);
            GridListA(GridListAData);
            GridListB(GridListB1Data, 'gridB1Container');
            GridListB(GridListB2Data, 'gridB2Container');
            GridListB(GridListB3Data, 'gridB3Container');
        } else {
            console.error("獲取的數據為空");
        }
    } catch (error) {
        console.error("獲取數據時發生錯誤:", error.message);
    }
}
fetchData();


// 環狀圖
function DoughnutChart(Data) {
    let labels = Data.data.labels;
    let ChartADATA = Data.data.datasets[0].data;
    let total = ChartADATA[0] + ChartADATA[1] + ChartADATA[2];
    let percentage = total > 0 ? ((ChartADATA[1] + ChartADATA[2]) / total) * 100 : 0;

    let fillBgColor = ['#FF0000', '#FFFF00', '#00FF00'];
    let doughnutCanvas = document.getElementById('myDoughnutChart');
    // 甜甜圈圖
    new Chart(doughnutCanvas, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                data: ChartADATA,
                backgroundColor: fillBgColor,
                borderWidth: 1
            }],
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '機台狀態',
                    color: 'white',
                    font: {
                        size: 20
                    },
                    padding: {
                        bottom: -5
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        color: 'white'
                    }
                },
                datalabels: {
                    color: 'black',
                    anchor: 'center',
                    align: 'center',
                }
            },
            cutout: '60%',
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 1
        },
        plugins: [ChartDataLabels]
    });
    document.getElementById("Run").innerText = `${ChartADATA[2]}`; 
    document.getElementById("Error").innerText = `${ChartADATA[0]}`;
    document.getElementById("OEE").innerText = `${percentage.toFixed(0)}%`;
}
//Y軸長餅圖 右上
function BarChartA(Data) {
    const ctx = document.getElementById('BarChartA').getContext('2d');
    const backgroundColors = [
        '#FF5733',
        '#33FF57',
        '#3357FF',
        '#FFC300',
        '#DAF7A6'
    ];
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Data.data.labels,
            datasets: [{
                label: 'OEE(%)', // 这个标签仍会在数据集中，但不会在图例中显示
                data: Data.data.datasets[0].data,
                borderColor: backgroundColors,
                backgroundColor: backgroundColors,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    ticks: { color: 'white' },
                    beginAtZero: true
                },
                y: {
                    ticks: { color: 'white' },
                    beginAtZero: true,
                    suggestedMin: 0
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: '運行時間最高前五',
                    color: 'white',
                    font: {
                        size: 20
                    },
                    padding: {
                        bottom: 5
                    }
                },
                legend: {
                    display: false, // 设置为 false 隐藏图例
                },
                datalabels: {
                    display: true, // 确保数据标签显示
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 1
        },
        plugins: [ChartDataLabels]
    });
}


//X軸長餅圖 中下
function BarChartB(Data) {
    const ctx = document.getElementById('BarChartB').getContext('2d');
    const backgroundColors = [
        '#33FF57', // 綠色
        '#FF5733', // 橙紅色
    ];

    // 假設您有兩組數據，請確保 Data.data.datasets 具有兩個數組
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Data.data.labels,
            datasets: [
                {
                    label: '今日產量',
                    data: Data.data.datasets[0].data, // 第一組數據
                    backgroundColor: backgroundColors[0], // 第一組顏色
                    borderColor: backgroundColors[0],
                    borderWidth: 1
                },
                {
                    label: '昨日產量',
                    data: Data.data.datasets[1].data, // 第二組數據
                    backgroundColor: backgroundColors[1], // 第二組顏色
                    borderColor: backgroundColors[1],
                    borderWidth: 1
                }
            ]
        },
        options: {
            indexAxis: 'x',
            scales: {
                x: {
                    ticks: { color: 'white' },
                    beginAtZero: true
                },
                y: {
                    ticks: { color: 'white' },
                    beginAtZero: true,
                    suggestedMin: 0
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: '最高產前五機台對比 ',
                    color: 'white',
                    font: {
                        size: 12
                    },
                    padding: {
                        top: 5,
                        bottom: 5
                    }
                },
                legend: {
                    display: true,
                    labels: {
                        color: 'white' // 設置所有標籤為白色
                    }
                },
                datalabels: {
                    display: true,
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            devicePixelRatio: 1
        },
        plugins: [ChartDataLabels] // 使用 ChartDataLabels 插件
    });
}



//雷達圖
function RadarChart(Data) {
    const ctx = document.getElementById('RadarChart').getContext('2d');

    const datasets = Data.data.datasets.map((dataset, index) => {
        return {
            ...dataset,
            label: index === 0 ? '本月' : '上個月',
            backgroundColor: index === 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
            borderColor: index === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
            pointRadius: 2,
            borderWidth: 2,
            fill: false
        };
    });
    const myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Data.data.labels,
            datasets: datasets,
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 1)',
                        backdropColor: 'transparent',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 1)',
                        lineWidth: 0.5,
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 1)',
                        font: {
                            size: 12
                        }
                    },
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '總產品對比',
                    color: 'rgba(255, 255, 255, 1)',
                    font: {
                        size: 12,
                    },
                },
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 1)',
                        generateLabels: function (chart) {
                            const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                            labels.forEach(label => {
                                const dataset = chart.data.datasets[label.datasetIndex];
                                label.fillStyle = dataset.borderColor;
                            });
                            return labels;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    anchor: 'end',
                    align: 'start',
                    formatter: (value) => {
                        return value;
                    }
                },
            }
        },
        plugins: [ChartDataLabels]
    });
}
// 中上第三格
function chartA() {
    let OEE = 63;
    document.addEventListener('DOMContentLoaded', () => {
        const ctx = document.getElementById("dashboardChartA").getContext("2d");
        const dashboardChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                datasets: [{
                    label: 'OEE',
                    rotation: -90,
                    circumference: 180,
                    data: [OEE, 100-OEE],
                    backgroundColor: [
                        'rgba(255, 182, 193, 1)',
                        'rgba(0, 123, 255, 0.3)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: "60%",
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: false,
                        intersect: false,
                    }
                },
                interaction: {
                    intersect: false,
                    hover: false
                }
            }
        });
        document.getElementById("oeeValue1").innerText = `${OEE}%`;
    })
}
chartA();

// 中上第四格
function chartB() {
    let OEE = 81;
    document.addEventListener('DOMContentLoaded', () => {
        const ctx = document.getElementById("dashboardChartB").getContext("2d");
        const dashboardChart = new Chart(ctx, {
            type: "doughnut",
            data: {
                datasets: [{
                    label: 'OEE',
                    rotation: -90,
                    circumference: 180,
                    data: [OEE, 100 - OEE],
                    backgroundColor: [
                        'rgba(255, 182, 193, 1)',
                        'rgba(0, 123, 255, 0.3)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: "60%",
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: false,
                        intersect: false,
                    }
                },
                interaction: {
                    intersect: false,
                    hover: false
                }
            }
        });
        document.getElementById("oeeValue2").innerText = `${OEE}%`;
    })
}
chartB();

//左下表格
function GridListA(GridListA) {

    try {
        let gridAData = GridListA;

        // 小標題
        const TITLES = Object.keys(GridListA.Grid_Data[0]);
        const numColumns = TITLES.length;

        // 初始化陣列來儲存所有列的數據
        const allColumnsData = [];
        for (let i = 0; i < numColumns; i++) {
            allColumnsData[i] = [];
        }

        // 數據
        for (let i = 0; i < gridAData.Grid_Data.length; i++) {
            const row = gridAData.Grid_Data[i];
            for (let j = 0; j < numColumns; j++) {
                allColumnsData[j].push(row[TITLES[j]]);
            }
        }

        // 測量寬度
        function measureTextWidth(text, font = 'normal 14px Arial') {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = font;
            return context.measureText(text).width;
        }

        // 計算每列的最大寬度
        function getColumnWidths() {
            const columnWidths = [];

            for (let j = 0; j < numColumns; j++) {
                let maxWidth = measureTextWidth(TITLES[j]);
                for (let i = 0; i < gridAData.Grid_Data.length; i++) {
                    maxWidth = Math.max(maxWidth, measureTextWidth(allColumnsData[j][i]));
                }
                columnWidths[j] = Math.max(maxWidth, 100);
            }
            return columnWidths;
        }

        const columnWidths = getColumnWidths();

        // 生成表格
        function generateTable() {
            let gridAlistTitle = '';
            let gridAList = '';

            // 生成標題行
            gridAlistTitle = '<div class="table-thead-th" style="display: table; width: 100%; table-layout: fixed;">';
            for (let j = 0; j < numColumns; j++) {
                gridAlistTitle += `
        <div class="table-cell" style="display: table-cell; width: ${columnWidths[j]}px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box;">
            <strong>${(TITLES[j] || '')}</strong>
        </div>
      `;
            }
            gridAlistTitle += '</div>';

            // 生成數據行
            gridAList += '<div class="table-body" style="display: table; width: 100%; table-layout: fixed;">';
            for (let i = 0; i < gridAData.Grid_Data.length; i++) {
                gridAList += '<div class="table-row" style="display: table-row;">';
                for (let j = 0; j < numColumns; j++) {
                    gridAList += `
              <div class="table-tbody-td" style="display: table-cell; width: ${columnWidths[j]}px; overflow: hidden; text-overflow: ellipsis; white-space: normal; word-wrap: break-word; box-sizing: border-box;">
                  ${allColumnsData[j][i]}
              </div>
            `;
                }
                gridAList += '</div>';
            }
            gridAList += '</div>';


            return `    
          ${gridAlistTitle}       
          ${gridAList}
    `;
        }


        const gridAContainer = document.getElementById('gridAContainer');
        gridAContainer.innerHTML = generateTable();

    } catch (error) {
        console.error("獲取數據時出錯：", error);
    }
}



let currentTableIndex = 0;
const tableOrder = ['tableA', 'tableB', 'tableC'];

//中間表格輪播
function startAutoCarousel() {
    setInterval(() => {
        currentTableIndex = (currentTableIndex + 1) % tableOrder.length;
        toggleSelection(tableOrder[currentTableIndex]);
    }, 3000);
}

//正中間表格
function GridListB(GridListB, containerId) {
    try {
        let gridBData = GridListB;

        // 小標題
        const TITLES = Object.keys(GridListB.Grid_Data[0]);
        const numColumns = TITLES.length;

        // 初始化陣列來儲存所有列的數據
        const allColumnsData = [];
        for (let i = 0; i < numColumns; i++) {
            allColumnsData[i] = [];
        }

        // 填充數據
        for (let i = 0; i < gridBData.Grid_Data.length; i++) {
            const row = gridBData.Grid_Data[i];
            for (let j = 0; j < numColumns; j++) {
                allColumnsData[j].push(row[TITLES[j]]);
            }
        }

        //測量寬度
        function measureTextWidth(text, font = 'normal 14px Arial') {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = font;
            return context.measureText(text).width;
        }

        // 計算每列的最大寬度
        function getColumnWidths() {
            const columnWidths = [];
            for (let j = 0; j < numColumns; j++) {
                let maxWidth = measureTextWidth(TITLES[j]);
                for (let i = 0; i < gridBData.Grid_Data.length; i++) {
                    maxWidth = Math.max(maxWidth, measureTextWidth(allColumnsData[j][i]));
                }
                columnWidths[j] = Math.max(maxWidth, 100);
            }
            return columnWidths;
        }

        const columnWidths = getColumnWidths();

        // 生成表格
        function generateTable() {
            let gridBlistTitle = '';
            let gridBList = '';

            // 生成標題行
            gridBlistTitle = '<div class="table-thead-th" style="display: table; width: 100%; table-layout: fixed;">';
            for (let j = 0; j < numColumns; j++) {
                gridBlistTitle += `
                    <div class="table-cell" style="display: table-cell; width: ${columnWidths[j]}px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; box-sizing: border-box;">
                        <strong>${(TITLES[j] || '')}</strong>
                    </div>
                `;
            }
            gridBlistTitle += '</div>';

            gridBList += '<div class="table-body" style="display: table; width: 100%; table-layout: fixed;">';
            for (let i = 0; i < gridBData.Grid_Data.length; i++) {
                const row = gridBData.Grid_Data[i];

                // 检查特定列的值以设置文字颜色
                const status = row[TITLES[1]];
                let textColor = 'color: inherit;';

                if (status === '維護中') {
                    textColor = 'color: yellow';
                } else if (status === '故障') {
                    textColor = 'color: red;';
                } else if (status === '運行中') {
                    textColor = 'color: #66FF66;';
                }
                gridBList += `<div class="table-row" style="display: table-row; ${textColor}">`;

                for (let j = 0; j < numColumns; j++) {
                    gridBList += `
                        <div class="table-tbody-td" style="display: table-cell; width: ${columnWidths[j]}px; overflow: hidden; text-overflow: ellipsis; white-space: normal; word-wrap: break-word; box-sizing: border-box;">
                            ${allColumnsData[j][i]}
                        </div>
                    `;
                }
                gridBList += '</div>';
            }
            gridBList += '</div>';

            return `    
                ${gridBlistTitle}       
                ${gridBList}
            `;
        }

        const gridContainer = document.getElementById(containerId);
        gridContainer.innerHTML = generateTable();

    } catch (error) {
        console.error("獲取數據時出錯：", error);
    }
}

//正中間表格讀取資料
function toggleSelection(selectedTable) {
    const tableMap = {
        tableA: 'gridB1Container',
        tableB: 'gridB2Container',
        tableC: 'gridB3Container'
    };

    const buttons = ['tableA', 'tableB', 'tableC'];

    Object.values(tableMap).forEach(table => {
        document.getElementById(table).style.display = 'none';
    });

    // 重置按钮
    buttons.forEach(button => {
        document.getElementById(button).classList.remove('selected');
        document.getElementById(button).classList.add('unselected');
    });

    if (tableMap[selectedTable]) {
        document.getElementById(tableMap[selectedTable]).style.display = 'block';
        document.getElementById(selectedTable).classList.remove('unselected');
        document.getElementById(selectedTable).classList.add('selected');
    }
}

startAutoCarousel();





