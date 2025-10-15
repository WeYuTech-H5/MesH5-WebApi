$(document).ready(()=>{
    loadLine();
    loadBar();
    loadBarLine();
    loadPolarArea();
    loadMultiLine();
})

//-------------------------------------------------------- 上 折線圖
function loadLine() {
    $('#lineWrapper').empty();
    $('#lineWrapper').append('<canvas id="line"></canvas>'); 

    line();
    async function line() {
        let response = await fetch('./data/line.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        let ctx = $('#line');
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
                        text: '折線圖',
                        color: '#ffff33',
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

//-------------------------------------------------------- 中1 正負柱狀圖
function loadBar() {
    $('#barWrapper').empty();
    $('#barWrapper').append('<canvas id="bar"></canvas>');
    
    bar();
    async function bar() {
        let response = await fetch('./data/bar.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#bar');
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
                        text: '正負柱狀圖',
                        color: '#ffff33',
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

//-------------------------------------------------------- 中2 折線混柱狀圖
function loadBarLine() {
    $('#barLineWrapper').empty();
    $('#barLineWrapper').append('<canvas id="barLine"></canvas>'); 
    
    barLine();
    async function barLine() {
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
                        text: '折線混柱狀圖',
                        color: '#ffff33',
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

//-------------------------------------------------------- 中3 極座標圓餅圖
function loadPolarArea() {
    $('#polarAreaWrapper').empty();
    $('#polarAreaWrapper').append('<canvas id="polarArea"></canvas>');
    
    polarArea();
    async function polarArea() {
        let response = await fetch('./data/polarArea.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#polarArea');
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
                        text: '極座標圓餅圖',
                        color: '#ffff33',
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

//-------------------------------------------------------- 下 多筆線型
function loadMultiLine() {
    $('#multiLineWrapper').empty();
    $('#multiLineWrapper').append('<canvas id="multiLine"></canvas>');
    
    multiLine();
    async function multiLine() {
        let response = await fetch('./data/multiLine.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#multiLine');
        new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive:true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '多筆線型',
                        color: '#ffff33',
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