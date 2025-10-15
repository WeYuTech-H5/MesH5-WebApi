$("document").ready(()=>{
    loadChartA();
    loadChartB();
    loadChartC();
    loadChartD();
    loadChartE();
    loadChartF();
    loadChartG();
    loadChartH();
    loadChartI();
    loadChartJ();
    loadChartK();
    loadChartL();
    loadChartM();
    loadChartN();
    loadChartO();
    loadChartP();
    loadChartQ();
    
    loadTableA();

    // setInterval(function(){
    //     loadChartA();
    //     loadChartB();
    //     loadChartC();
    // }, 30 * 1000);

    $('.extend-button').on('click', function() {
        // 查找最近的.chartWrapper，並獲取其中的canvas元素
        var canvasElement = $(this).closest('.chart-box').find('.chartWrapper canvas')[0];
        var chartInstance = Chart.getChart(canvasElement); // 獲取原始canvas上的Chart.js實例
        // chartInstance.config.options.animation = false // 取消動畫效果

        // 創建一個新圖表，使用與原圖表相同的配置
        $("#extendCanvas").remove()
        $('#extendContainer').append('<canvas id="extendCanvas"></canvas>'); 
        
        // 複製原圖表的配置，並在新 canvas 上重新生成圖表
        var ctx = $('#extendCanvas')
        new Chart(ctx, {
            type: chartInstance.config.type,  // 圖表類型
            data: chartInstance.config.data,  // 複製數據
            options: chartInstance.config.options,  // 複製設置
            plugins: chartInstance.config.plugins  // 複製設置
        });

        $("#extendModal").modal('show')
    });
})

//-------------------------------------------------------- A 扇形圖
function loadChartA() {
    $('#chartAWrapper').empty();
    $('#chartAWrapper').append('<canvas id="chartA"></canvas>');
    
    chartA();
    async function chartA() {
        let response = await fetch('./data/fakeDataA.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
    
        let ctx = $('#chartA');
        new Chart(ctx,
        {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'A. 扇形圖',
                        color: 'skyblue',
                        font: {
                            size: 20
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
//-------------------------------------------------------- B 折線圖1
function loadChartB() {
    $('#chartBWrapper').empty();
    $('#chartBWrapper').append('<canvas id="chartB"></canvas>');
    
    chartB();
    async function chartB() {
        let response = await fetch('./data/fakeDataB.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#chartB');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'B. 折線圖1',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    },
                    legend: {
                        labels: {
                          color: 'white',
                        }
                    }
                },
                responsive: true,
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                scales: {
                    x: {  // x 軸
                        grid: {
                            color: 'white'  // X 軸網格設為白色
                        },
                        ticks: {
                            color: 'white'
                        },
                        stacked: true,
                    },
                    y: {  // y 軸
                        grid: {
                            display: false,  // 隱藏 Y 軸的網格線
                        },
                        ticks: {
                            color: 'white'
                        },
                        beginAtZero: 'true'
                    },
                },
            },
        });
        
    };
};
//-------------------------------------------------------- C 折線圖2
function loadChartC() {
    $('#chartCWrapper').empty();
    $('#chartCWrapper').append('<canvas id="chartC"></canvas>'); 

    chartC();
    async function chartC() {
        let response = await fetch('./data/fakeDataC.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        let ctx = $('#chartC');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                elements: {
                    line: {
                        tension: 0,  // 設置折線的彎曲程度
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'C. 折線圖2',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.parsed.y + ' %';  // 修改為直接取用 y 值
                                return label;
                            },
                        },
                    },
                    legend: {
                        labels: {
                          color: 'white',
                        }
                    },
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
                        stacked: true, // 堆疊數據
                    },
                    y: {
                        grid: {
                            color: 'white',  // 設置 Y 軸的網格顏色
                        },
                        ticks: {
                            color: 'white'
                        },
                        // beginAtZero: true,  // 確保從 0 開始
                        stacked: true,
                    },
                },
            },
        });
        
    };
};
//-------------------------------------------------------- D 堆疊圖
function loadChartD() {
    $('#chartDWrapper').empty();
    $('#chartDWrapper').append('<canvas id="chartD"></canvas>'); 
    
    chartD();
    async function chartD() {
        let response = await fetch('./data/fakeDataD.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#chartD');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: 'D. 推疊圖',
                        color: 'skyblue',
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
                            color: 'white',  // 設置 Y 軸的網格顏色
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
//-------------------------------------------------------- E 圓餅圖
function loadChartE() {
    $('#chartEWrapper').empty();
    $('#chartEWrapper').append('<canvas id="chartE"></canvas>');

    chartE();
    async function chartE() {
        let response = await fetch('./data/fakeDataE.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#chartE');
        new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                plugins: {
                    title: {
                        display: true,
                        text: 'E. 圓餅圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,.6)',  // 工具提示的背景顏色
                    },
                    legend:{
                        labels:{
                            color: "white"
                        }
                    }
                }
            }
        });
    };
};
//-------------------------------------------------------- F 折線混柱狀圖
function loadChartF() {
    $('#chartFWrapper').empty();
    $('#chartFWrapper').append('<canvas id="chartF"></canvas>'); 
    
    chartF();
    async function chartF() {
        let response = await fetch('./data/fakeDataF.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartF');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                plugins: {
                    title: {
                        display: true,
                        text: 'F. 折線混柱狀圖',
                        color: 'skyblue',
                        font: {
                            size: 20
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
                            color: 'white' //格線的顏色
                        },
                        ticks: {
                            color: 'white'
                        },
                    },
                    y1: {
                        grid: {
                            color: 'white' //格線的顏色
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
//-------------------------------------------------------- G 散佈圖
function loadChartG() {
    $('#chartGWrapper').empty();
    $('#chartGWrapper').append('<canvas id="chartG"></canvas>');
    
    chartG();
    async function chartG() {
        let response = await fetch('./data/fakeDataG.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartG');
        new Chart(ctx, {
            type: 'scatter',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false, // 保持響應式設計
                plugins: {
                    title: {
                        display: true,
                        text: 'G. 散佈圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.dataset.label || '';
                                if (context.raw) {
                                    label += ': (' + context.raw.x + ', ' + context.raw.y + ')';
                                }
                                return label;
                            }
                        }
                    },
                    legend:{
                        labels:{
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#6f868c'
                        },
                        ticks:{
                            color: 'white'
                        },
                        min: -10,
                        max: 10
                    },
                    y: {
                        grid: {
                            color: '#6f868c'
                        },
                        ticks:{
                            color: 'white'
                        },
                        min: -10,
                        max: 10
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- H 空心圓餅圖
function loadChartH() {
    $('#chartHWrapper').empty();
    $('#chartHWrapper').append('<canvas id="chartH"></canvas>');
    
    chartH();
    async function chartH() {
        let response = await fetch('./data/fakeDataH.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartH');
        new Chart(ctx, {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'H. 空心圓餅圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,.5)',  // 设置提示框背景颜色
                        yAlign: 'center',  // 垂直对齐方式
                        xAlign: 'center',  // 水平对齐方式
                        callbacks: {
                            label: function(item) {
                              return item.xLabel;
                            },
                        }
                    },
                    // datalabels: {
                    //     display: 'auto',
                    //     color: 'white',
                    //     // backgroundColor: 'rgb(210,210,210,0.8)',
                    //     labels: {
                    //         title: {
                    //             font: {
                    //                     weight: 'bold',
                    //                     size: 24
                    //             }
                    //         }
                    //    },
                    //    anchor: 'center', //錨點，在畫完圖的後方
                    //    align: 'center', //對齊錨點的中央
                    //    offset: 0 //位置調整
                    // },
                    legend:{
                        labels:{
                            color: 'white'
                        }
                    }
                },
                cutout: '65%',  // 空心的程度
            },
            plugins: [{
                id: 'customPlugin',
                beforeDraw: function(chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    
                    ctx.restore();
                    var fontSize = (height / 100).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";
                     // 設置文字顏色
                    ctx.fillStyle = 'white';  // 修改這裡為你想要的顏色
    
                    var text = chartData.datasets[0].data[0] + '%',  // 你想顯示的文字
                        textX = Math.round((width - ctx.measureText(text).width) / 2),
                        textY = height * 0.63;
    
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
            // plugins: [ChartDataLabels] //需引用chartjs-plugin-datalabels.js
        });
    };
};

//-------------------------------------------------------- I 極座標圓餅圖
function loadChartI() {
    $('#chartIWrapper').empty();
    $('#chartIWrapper').append('<canvas id="chartI"></canvas>');
    
    chartI();
    async function chartI() {
        let response = await fetch('./data/fakeDataI.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartI');
        new Chart(ctx, {
            type: 'polarArea',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { // 極座標圖表的比例屬性
                        ticks: {
                            color: '#cccccc',
                            beginAtZero: true,
                            backdropColor: 'rgba(0,0,0,0)' // 相當於舊版的 `showLabelBackdrop: false`
                        },
                        grid: {
                            color: 'grey'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'I. 極座標圓餅圖',
                        color: 'skyblue',
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
                        // displayColors: false,
                        // backgroundColor: 'rgba(0,0,0,.6)',
                        // callbacks: {
                        //     title: function() {
                        //         return ''; // 不顯示標題
                        //     }
                        // }
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- J 雷達圖
function loadChartJ() {
    $('#chartJWrapper').empty();
    $('#chartJWrapper').append('<canvas id="chartJ"></canvas>');
    
    chartJ();
    async function chartJ() {
        let response = await fetch('./data/fakeDataJ.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartJ');
        new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { // 在 Chart.js 4.x 中，radar 圖表使用 'r' 來定義比例尺
                        angleLines: {
                            display: false // 隱藏角度線
                        },
                        ticks: {
                            color: '#cccccc',
                            beginAtZero: true, // 從 0 開始
                            backdropColor: 'rgba(0, 0, 0, 0)' // 等同於 `showLabelBackdrop: false`
                        },
                        grid: {
                            color: 'grey' // 設定網格顏色
                        },
                        pointLabels: {
                            color: 'white', // 將數據點周圍的標籤設為白色
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'J. 雷達圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    legend:{
                        labels:{
                            color: 'white'
                        }
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- K 正負柱狀圖
function loadChartK() {
    $('#chartKWrapper').empty();
    $('#chartKWrapper').append('<canvas id="chartK"></canvas>');
    
    chartK();
    async function chartK() {
        let response = await fetch('./data/fakeDataK.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartK');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            beginAtZero: true,
                            color: 'white'
                        }
                    },
                    y: {
                        stacked: true,
                        ticks: {
                            beginAtZero: true,
                            color: 'white'
                        },
                        grid: {  // 替換 gridLines 屬性
                            color: 'white'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'K. 正負柱狀圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    legend:{
                        labels:{
                            color: 'white'
                        }
                    },
                    tooltip: {  // 改為 tooltip 而不是 tooltips
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- L 多筆線型
function loadChartL() {
    $('#chartLWrapper').empty();
    $('#chartLWrapper').append('<canvas id="chartL"></canvas>');
    
    chartL();
    async function chartL() {
        let response = await fetch('./data/fakeDataL.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartL');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive:true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'L. 多筆線型',
                        color: 'skyblue',
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
                            color: '#6f868c'
                        },
                        ticks:{
                            color: 'white'
                        }
                    },
                    y: {
                        grid: {
                            color: '#6f868c'
                        },
                        ticks:{
                            color: 'white'
                        }
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- M 橫式柱狀圖
function loadChartM() {
    $('#chartMWrapper').empty();
    $('#chartMWrapper').append('<canvas id="chartM"></canvas>');
    
    chartM();
    async function chartM() {
        let response = await fetch('./data/fakeDataM.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartM');
        new Chart(ctx, {
            type: 'bar',  // 使用 bar 圖表類型
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',  // 設置為水平條形圖
                plugins: {
                    title: {
                        display: true,
                        text: 'M. 橫式柱狀圖',
                        color: 'skyblue',
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
                                }
                            }
                       },
                       anchor: 'end', //錨點，在畫完圖的後方
                       align: 'center', //對齊錨點的中央
                       offset: 0 //位置調整
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#6f868c'
                        },
                        ticks: {
                            beginAtZero: true,
                            color: 'white'
                        }
                    },
                    y: {
                        grid: {
                            display:false
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels] //需引用chartjs-plugin-datalabels.js
        });
    };
};

//-------------------------------------------------------- N 柱狀圖
function loadChartN() {
    $('#chartNWrapper').empty();
    $('#chartNWrapper').append('<canvas id="chartN"></canvas>');
    
    chartN();
    async function chartN() {
        let response = await fetch('./data/fakeDataN.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartN');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            display:false
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        grid: {
                            color: '#6f868c'
                        },
                        ticks: {
                            color: 'white',
                            beginAtZero: true
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'N. 柱狀圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    legend: {
                        labels:{
                            color: 'white'
                        }
                    },
                    tooltip: {
                        enabled: false,
                    },
                    datalabels: {
                        display: 'auto',
                        color: 'white',
                        backgroundColor: 'rgb(0,0,0,0.5)',
                        padding: {  // 調整邊距，增加背景寬度
                            top: 3,
                            right: 6,
                            bottom: 3,
                            left: 6
                        },
                        labels: {
                            title: {
                                font: {
                                        weight: 'bold',
                                }
                            }
                       },
                       anchor: 'end', //錨點，在畫完圖的後方
                       align: 'center', //對齊錨點的中央
                       offset: 0 //位置調整
                    }
                }
            },
            plugins: [ChartDataLabels] //需引用chartjs-plugin-datalabels.js
        });
    };
};

//-------------------------------------------------------- O 線混多筆柱狀
function loadChartO() {
    $('#chartOWrapper').empty();
    $('#chartOWrapper').append('<canvas id="chartO"></canvas>');
    
    chartO();
    async function chartO() {
        let response = await fetch('./data/fakeDataO.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartO');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title:{
                        display: true,
                        text: "O. 線混多筆柱狀圖",
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: true
                    },
                    legend: {
                        labels:{
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: '#999'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        grid: {
                            color: '#999'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- P 甘特圖
// 需引用chartjs-adapter-date-fns.bundle.min.js
function loadChartP() {
    $('#chartPWrapper').empty();
    $('#chartPWrapper').append('<canvas id="chartP"></canvas>');
    
    chartP();
    async function chartP() {
        let response = await fetch('./data/fakeDataP.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartP');
        new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio:false,
                indexAxis: "y",
                plugins: {
                    title:{
                        display: true,
                        text: "P. 時間線圖",
                        color: 'skyblue',
                        font: {
                            size: 20
                        },
                        padding: {
                            top: 10,    // 標題與圖表之間的間距
                            bottom: 40
                        }
                    },
                    tooltip: {
                        enabled: false
                    },
                    legend: {
                        labels: {
                            generateLabels: function(chart) {
                                const uniqueLabels = [];
                                const uniqueLabelsColor = [];
                                const allLabels = chart.data.datasets.map(dataset => dataset.label);
        
                                allLabels.forEach((label,index) => {
                                    if (!uniqueLabels.includes(label)) {
                                        uniqueLabels.push(label);
                                        uniqueLabelsColor.push(chart.data.datasets[index].backgroundColor[0])
                                    }
                                });
        
                                return uniqueLabels.map((label, index) => {
                                    return {
                                        text: label,
                                        fontColor:'white',
                                        fillStyle: uniqueLabelsColor[index],  // 使用對應的顏色
                                        // strokeStyle: 'white', // 如果需要邊框顏色可以在這裡設定
                                        // lineWidth: 0.5, // 邊框寬度
                                    };
                                });
                            },
                            font: {
                                size: 16, // 設定 legend 文字大小
                            },
                            padding:10,
                            // boxWidth: 40 // 調整顏色方塊的寬度
                        }
                    }
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            unit: "hour",
                        },
                        min: "2022-01-01T00:00",
                        max: "2022-01-01T12:00",
                        grid: {
                            color: 'grey'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            color: 'grey'
                        },
                        ticks: {
                            color: 'white',
                            font:{
                                size: 18
                            }
                        }
                    },
                },
                layout: {
                    padding: {
                        bottom: 50 // 增加圖表下方間距
                    }
                }
            },
        });
    };
};
//-------------------------------------------------------- Q 柏拉圖(pareto chart)
// 需引用chartjs-adapter-date-fns.bundle.min.js
function loadChartQ() {
    $('#chartQWrapper').empty();
    $('#chartQWrapper').append('<canvas id="chartQ"></canvas>');
    
    chartQ();
    async function chartQ() {
        let response = await fetch('./data/fakeDataQ.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#chartQ');
        new Chart(ctx, {
            type: 'bar', // 将图表类型更改为 bar
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title:{
                        display: true,
                        text: "Q. 柏拉圖分析",
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    datalabels: {
                        color: "#fff",
                        font: {
                            weight: "bold",
                            size: 18
                        },
                        formatter: function(e, t) {
                            // Only show data labels for the bar chart (datasetIndex 0 for bar chart)
                            if (t.datasetIndex === 1) {
                                return e.toFixed(1) + '%'; // Return the data value for the bar chart
                            }
                            return null; // No data labels for the line chart
                        }
                    },
                    legend: {
                        labels: {
                            color: "#E3E3E3"
                        },
                        align: "center"
                    }
                },
                scales: {
                    barChart: {
                        id: "barChart",
                        type: "linear",
                        position: "left",
                        ticks: {
                            color: "#E3E3E3"
                        }
                    },
                    lineChart: {
                        id: "lineChart",
                        type: "linear",
                        position: "right",
                        suggestedMax: 100,
                        suggestedMin: 0,
                        display: true,
                        ticks: {
                            color: "white",
                        }
                    },
                    y: {
                        grid: {
                            color: "#4C4C4C"
                        },
                        ticks: {
                            display: false,
                            color: "white"
                        }
                    },
                    x: {
                        grid: {
                            color: "#4C4C4C"
                        },
                        ticks: {
                            color: "white"
                        }
                    }
                },
            },
            plugins: [ChartDataLabels]
        });
    };
};
//-------------------------------------------------------- 表1 輪播表格
// 需複製css樣式 => 搜尋 .slider-nav
async function loadTableA(){
    let gridDataList = await Promise.all([
        fetch('./data/fakeTableDataA01.json').then(response => response.json()),
        fetch('./data/fakeTableDataA02.json').then(response => response.json()),
        fetch('./data/fakeTableDataA03.json').then(response => response.json())
        // 實際應用可換成公版API
        // getGridData('361531161090242').then(data => data.Grid_Data),
        // getGridData('361531234726885').then(data => data.Grid_Data),
        // getGridData('361531301640497').then(data => data.Grid_Data)
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
    $("#carouselExampleIndicators .carousel-inner").html(htmlContent)

    // 添加點擊事件 -> 導航欄變色
    initCarousel()

    // 添加點擊事件 -> 自動輪播開關
    const carouselElement = document.querySelector('#carouselExampleIndicators');
    const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 2000 // 設定自動播放間隔（例如 2 秒）
    });
    $("#toggleTouch").on("click", function() {
        toggleAutoplay(carousel);
        $(this).blur();
    });

    function generateTable(gridData) {
        if (gridData.length === 0) return '<p>沒有數據可顯示</p>'; // 如果沒有數據，顯示提示信息
    
        // 提取欄位名（假設所有行都有相同的鍵）
        const columns = Object.keys(gridData[0]);
    
        // 生成表頭
        const headerRow = columns.map(column => `<th scope="col">${column}</th>`).join('');
    
        // 生成表格行
        const tableRows = gridData.map(row => `
            <tr>
                ${columns.map(column => {
                    // 根據狀態獲取對應的 CSS 類別（如果需要）
                    const statusClass = column === "狀態" ? getStatusClass(row[column]) : '';
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
            case '運行':
                return 'text-success';
            case '待機':
                return 'text-warning';
            case '故障':
                return 'text-danger';
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
}

