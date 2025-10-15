$(document).ready(()=>{
    loadBarLine();
    loadStackBarA();
    loadStackBarB();
    loadDoughnutA();
    loadSemiDoughnutA();
    loadDoughnutB();
    loadSemiDoughnutB();
})

//-------------------------------------------------------- 上 折線混柱狀圖
function loadBarLine() {
    $('#barLineWrapper').empty();
    $('#barLineWrapper').append('<canvas id="barLine"></canvas>'); 
    
    BarLine();
    async function BarLine() {
        let response = await fetch('./data/barLine.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#barLine');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                plugins: {
                    title: {
                        display: true,
                        text: '全廠人員生產',
                        color: '#ffff33',
                        font: {
                            size: 24
                        }
                    },
                    legend: {
                        labels:{
                            color:'white'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#d3d3d3' //格線的顏色
                        },
                        ticks: {
                            color: 'white'
                        },
                    },
                    y1: {
                        grid: {
                            color: '#d3d3d3' //格線的顏色
                        },
                        ticks: {
                            color: 'white'
                        },
                        position: 'left'
                    },
                    // 可以添加第二個 Y 軸
                    y2: {
                        grid: {
                            display: false //隱藏格線
                        },
                        ticks: {
                            color: 'white'
                        },
                        position: 'right'
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- 中左 堆疊圖A
function loadStackBarA() {
    $('#stackBarAWrapper').empty();
    $('#stackBarAWrapper').append('<canvas id="stackBarA"></canvas>'); 
    
    stackBarA();
    async function stackBarA() {
        let response = await fetch('./data/stackBarA.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#stackBarA');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: '產線一',
                        color: '#ffff33',
                        font: {
                            size: 22
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
                            color: '#d3d3d3',  // 設置 Y 軸的網格顏色
                        },
                        ticks: {
                            color: 'white'
                        },
                        beginAtZero: true,  // 確保從 0 開始
                        stacked: true,  // 堆疊 Y 軸的數據
                    },
                },
            },
        });
    };
};
//-------------------------------------------------------- 中右 堆疊圖B
function loadStackBarB() {
    $('#stackBarBWrapper').empty();
    $('#stackBarBWrapper').append('<canvas id="stackBarB"></canvas>'); 
    
    stackBarB();
    async function stackBarB() {
        let response = await fetch('./data/stackBarB.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#stackBarB');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: '產線二',
                        color: '#ffff33',
                        font: {
                            size: 22
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
                            color: '#d3d3d3',  // 設置 Y 軸的網格顏色
                        },
                        ticks: {
                            color: 'white'
                        },
                        beginAtZero: true,  // 確保從 0 開始
                        stacked: true,  // 堆疊 Y 軸的數據
                    },
                },
            },
        });
    };
};

//-------------------------------------------------------- 下1 空心圓餅圖A
function loadDoughnutA() {
    $('#doughnutAWrapper').empty();
    $('#doughnutAWrapper').append('<canvas id="doughnutA"></canvas>');
    
    doughnutA();
    async function doughnutA() {
        let response = await fetch('./data/doughnutA.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#doughnutA');
        new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '產品佔比',
                        color: 'white',
                        font: {
                            size: 18
                        }
                    },
                    // tooltip: {
                    //     displayColors: false,  // 隐藏提示框中的颜色方块
                    //     backgroundColor: 'rgba(0,0,0,.5)',  // 设置提示框背景颜色
                    //     yAlign: 'center',  // 垂直对齐方式
                    //     xAlign: 'center',  // 水平对齐方式
                    //     callbacks: {
                    //         title: function() {},
                    //         label: function(item) {
                    //           return item.xLabel;
                    //         },
                    //     }
                    // },
                    tooltip: {
                        enabled:false
                    },
                    datalabels: {
                        display: 'auto',
                        color: 'white',
                        // backgroundColor: 'rgb(210,210,210,0.8)',
                        labels: {
                            title: {
                                font: {
                                        weight: 'bold',
                                        size: 24
                                }
                            }
                       },
                       anchor: 'center', //錨點，在畫完圖的後方
                       align: 'center', //對齊錨點的中央
                       offset: 0 //位置調整
                    },
                    legend:{
                        // labels:{
                        //     color: 'white'
                        // }
                        display:false
                    }
                },
                cutout: '50%',  // 空心的程度
            },
            plugins: [ChartDataLabels] //需引用chartjs-plugin-datalabels.js
        });
    };
};

//-------------------------------------------------------- 下2 扇形圖A
function loadSemiDoughnutA() {
    $('#semiDoughnutAWrapper').empty();
    $('#semiDoughnutAWrapper').append('<canvas id="semiDoughnutA"></canvas>');
    
    semiDoughnutA();
    async function semiDoughnutA() {
        let response = await fetch('./data/semiDoughnutA.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
    
        let ctx = $('#semiDoughnutA');
        new Chart(ctx,
        {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: '總良率',
                        color: 'white',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    }
                },
                responsive: true,  // 讓圖表自動適應容器大小
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                rotation: '-90',
                circumference: 180,
                cutout: '70%'
            },
            plugins: [{
                id: 'customPlugin',
                beforeDraw: function(chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    
                    ctx.restore();
                    var fontSize = (height / 80).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";
                     // 設置文字顏色
                    ctx.fillStyle = 'white';  // 修改這裡為你想要的顏色
    
                    var text = chartData.datasets[0].data[0] + '%',  // 你想顯示的文字
                        textX = Math.round((width - ctx.measureText(text).width) / 2),
                        textY = height * 0.75;
    
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
        });
    };
};

//-------------------------------------------------------- 下3 空心圓餅圖B
function loadDoughnutB() {
    $('#doughnutBWrapper').empty();
    $('#doughnutBWrapper').append('<canvas id="doughnutB"></canvas>');
    
    doughnutB();
    async function doughnutB() {
        let response = await fetch('./data/doughnutB.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#doughnutB');
        new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '產品佔比',
                        color: 'white',
                        font: {
                            size: 18
                        }
                    },
                    // tooltip: {
                    //     displayColors: false,  // 隐藏提示框中的颜色方块
                    //     backgroundColor: 'rgba(0,0,0,.5)',  // 设置提示框背景颜色
                    //     yAlign: 'center',  // 垂直对齐方式
                    //     xAlign: 'center',  // 水平对齐方式
                    //     callbacks: {
                    //         title: function() {},
                    //         label: function(item) {
                    //           return item.xLabel;
                    //         },
                    //     }
                    // },
                    tooltip: {
                        enabled:false
                    },
                    datalabels: {
                        display: 'auto',
                        color: 'white',
                        // backgroundColor: 'rgb(210,210,210,0.8)',
                        labels: {
                            title: {
                                font: {
                                        weight: 'bold',
                                        size: 24
                                }
                            }
                       },
                       anchor: 'center', //錨點，在畫完圖的後方
                       align: 'center', //對齊錨點的中央
                       offset: 0 //位置調整
                    },
                    legend:{
                        // labels:{
                        //     color: 'white'
                        // }
                        display:false
                    }
                },
                cutout: '50%',  // 空心的程度
            },
            plugins: [ChartDataLabels] //需引用chartjs-plugin-datalabels.js
        });
    };
};

//-------------------------------------------------------- 下4 扇形圖B
function loadSemiDoughnutB() {
    $('#semiDoughnutBWrapper').empty();
    $('#semiDoughnutBWrapper').append('<canvas id="semiDoughnutB"></canvas>');
    
    semiDoughnutB();
    async function semiDoughnutB() {
        let response = await fetch('./data/semiDoughnutB.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
    
        let ctx = $('#semiDoughnutB');
        new Chart(ctx,
        {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: '總良率',
                        color: 'white',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    }
                },
                responsive: true,  // 讓圖表自動適應容器大小
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                rotation: '-90',
                circumference: 180,
                cutout: '70%'
            },
            plugins: [{
                id: 'customPlugin',
                beforeDraw: function(chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    
                    ctx.restore();
                    var fontSize = (height / 80).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";
                     // 設置文字顏色
                    ctx.fillStyle = 'white';  // 修改這裡為你想要的顏色
    
                    var text = chartData.datasets[0].data[0] + '%',  // 你想顯示的文字
                        textX = Math.round((width - ctx.measureText(text).width) / 2),
                        textY = height * 0.75;
    
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
        });
    };
};
