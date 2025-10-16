let lineOptionSet = {
    
    responsive: true,
    maintainAspectRatio: false,  // 允許打破寬高比的限制
    plugins: {
        legend: {
            display:false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                color: '#ffffff90'
            }
        },
        x: {
            ticks: {
                color: '#ffffff90'
            }
        }
    },
}
let multiLineOptionSet = {
    responsive:true,
    maintainAspectRatio: false,
    plugins: {
        title: {
            display: true,
            text: 'Each Factory Usage (mth)',
            color: 'white',
            font: {
                size: 20
            }
        },
        legend:{
            labels:{
                color: 'white'
            }
        },
        tooltip: {
            mode: 'point'
        }
    },
    scales: {
        x: {
            grid: {
                // color: '#6f868c'
            },
            ticks:{
                color: 'white'
            }
        },
        y: {
            grid: {
                // color: '#6f868c'
            },
            ticks:{
                color: 'white'
            }
        }
    }
}
let barOptionSet = {
    plugins: {
        title: {
            display: true,
            text: 'Each Factory Usage (yr)',
            color: 'white',
            font: {
                size: 20
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
        legend: {
            labels:{
                color: 'white'
            }
        }
    },
    responsive: true,
    maintainAspectRatio: false,  // 允許打破寬高比的限制
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: 'white'
            },
            beginAtZero: true,  // 確保從 0 開始
            stacked: true,  // 堆疊 X 軸的數據
        },
        y: {
            grid: {
                color: '#888',  // 設置 Y 軸的網格顏色
            },
            ticks: {
                color: 'white'
            },
            beginAtZero: true,  // 確保從 0 開始
            stacked: true,  // 堆疊 Y 軸的數據
        },
    },
}

$(document).ready(()=>{
    loadLineA();
    loadLineB();
    loadLineC();
    loadLineD();
    loadLineE();
    loadLineF();
    loadLineG();
    loadPieA();
    loadMultiLineA();
    loadBarA();
})
function loadLineA() {
    $('#lineAWrapper').empty();
    $('#lineAWrapper').append('<canvas id="lineA"></canvas>');
    
    lineA();
    async function lineA() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.kWh

        let ctx = $('#lineA');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
        
    };
};
function loadLineB() {
    $('#lineBWrapper').empty();
    $('#lineBWrapper').append('<canvas id="lineB"></canvas>');
    
    lineB();
    async function lineB() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.Frequency

        let ctx = $('#lineB');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
        
    };
};
function loadLineC() {
    $('#lineCWrapper').empty();
    $('#lineCWrapper').append('<canvas id="lineC"></canvas>');

    
    lineC();
    async function lineC() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.PF

        let ctx = $('#lineC');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
        
    };
};
function loadLineD() {
    $('#lineDWrapper').empty();
    $('#lineDWrapper').append('<canvas id="lineD"></canvas>');
    
    lineD();
    async function lineD() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.kW

        let ctx = $('#lineD');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
        
    };
};
function loadLineE() {
    $('#lineEWrapper').empty();
    $('#lineEWrapper').append('<canvas id="lineE"></canvas>');
    
    lineE();
    async function lineE() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.Current

        let ctx = $('#lineE');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
        
    };
};
function loadLineF() {
    $('#lineFWrapper').empty();
    $('#lineFWrapper').append('<canvas id="lineF"></canvas>');
    
    lineF();
    async function lineF() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.monthlyUsage

        let ctx = $('#lineF');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
        
    };
};
function loadLineG() {
    $('#lineGWrapper').empty();
    $('#lineGWrapper').append('<canvas id="lineG"></canvas>');
    
    lineG();
    async function lineG() {
        let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        chartData = chartData.yearlyUsage

        let ctx = $('#lineG');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: lineOptionSet,
        });
    };
};

function loadPieA() {
    $('#pieAWrapper').empty();
    $('#pieAWrapper').append('<canvas id="pieA"></canvas>');
    
    pieA();
    async function pieA() {
        let response = await fetch('./data/pieData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let sortedPercentageData = [
            44.0004,
            29.2322,
            11.1261,
            5.1941,
            4.9626,
            3.1472,
            1.5732,
            0.7638
        ]
        var ctx = $('#pieA');
        new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio:false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,  
                        text: 'Meter Usage Ratio', 
                        font: {
                            size: 20, 
                            weight: 'bold'
                        },
                        color: '#FFF'  
                    },
                    // Datalabel 設定
                    datalabels: {
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 16
                        },
                        formatter: (value, ctx) => {
                            let dataIndex = ctx.dataIndex
                            let percent = sortedPercentageData[dataIndex]
                            let label = ctx.chart.data.labels[dataIndex]
                            return [`${label}`, `${percent.toFixed(1)}%`]
                        },
                        anchor: 'center',
                        align: 'center',
                        offset: 0,
                        borderWidth: 2,
                        borderColor: 'transparent',
                        borderRadius: 4,
                        // backgroundColor: (context) => {
                        //     return context.dataset.backgroundColor
                        // },
                    }
                }
            },
            plugins: [ChartDataLabels]
        })
    };
};

function loadMultiLineA() {
    $('#multiLineAWrapper').empty();
    $('#multiLineAWrapper').append('<canvas id="multiLineA"></canvas>');
    
    multiLineA();
    async function multiLineA() {
        let response = await fetch('./data/multiLineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#multiLineA');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: multiLineOptionSet
        });
    };
};

function loadBarA() {
    $('#barAWrapper').empty();
    $('#barAWrapper').append('<canvas id="barA"></canvas>');
    
    barA();
    async function barA() {
        let response = await fetch('./data/barData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#barA');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: barOptionSet,
        });
    };
};