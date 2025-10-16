//左上環狀圖SID
let doughnutSID = "361124905113294";

//右上長餅條圖SID
let BarChartASID = "361278205913350";

//中下長條圖SID
let BarChartBSID = "361288730930910";


async function fetchData() {
    let doughnutData = await getChartData(doughnutSID);
    let BarChartAData = await getChartData(BarChartASID);
    let BarChartBData = await getChartData(BarChartBSID);

    BarChartA(BarChartAData);
    BarChartB(BarChartBData);
    try {
        if (doughnutData) {
            DoughnutChart(doughnutData);
           
        } else {
            console.error("獲取的數據為空");
        }
    } catch (error) {
        console.error("獲取數據時發生錯誤:", error.message);
    }
}
fetchData();

//左 長餅圖 
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


function BarChartB(Data) {
    const ctx = document.getElementById('BarChartB').getContext('2d');
    const backgroundColors = [
        '#33FF57', // 綠色
        '#FF5733', // 橙紅色
    ];
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

// 中下左邊環狀圖
function DoughnutChart(Data) {
    let labels = Data.data.labels;
    let ChartADATA = Data.data.datasets[0].data;
    let total = ChartADATA[0] + ChartADATA[1] + ChartADATA[2];
    let percentage = total > 0 ? ((ChartADATA[1] + ChartADATA[2]) / total) * 100 : 0;

    let fillBgColor = ['#FF0000', '#FFFF00', '#00FF00'];
    let doughnutCanvas = document.getElementById('DoughnutChart');
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
    document.getElementById("OEE").innerText = `${percentage.toFixed(0)}%`;
}





// 中下右
function chartA() {
    let OEE = 81;
    document.addEventListener('DOMContentLoaded', () => {
        const ctx = document.getElementById("ChartA").getContext("2d");
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
                    },
                    title: {
                        display: true,
                        text: 'OEE (%)',
                        color: 'white',
                        font: {
                            size: 20
                        },
                        padding: {
                            top: 20,
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    hover: false
                }
            }
        });
        document.getElementById("oeeValue").innerText = `${OEE}%`;
    })
}
chartA();

