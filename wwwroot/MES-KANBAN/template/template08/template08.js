$(document).ready(()=>{
    loadPie();
    loadLineA();
    loadLineB();
    loadLineC();
})


//-------------------------------------------------------- 圓餅圖
function loadPie() {
    $('#pieWrapper').empty();
    $('#pieWrapper').append('<canvas id="pie"></canvas>');

    pie();
    async function pie() {
        let response = await fetch('./data/pie.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        let ctx = $('#pie');
        new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                plugins: {
                    title: {
                        display: true,
                        text: '產品佔比',
                        color: 'gold',
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
//-------------------------------------------------------- 折線圖A
function loadLineA() {
    $('#lineAWrapper').empty();
    $('#lineAWrapper').append('<canvas id="lineA"></canvas>'); 

    lineA();
    async function lineA() {
        let response = await fetch('./data/lineA.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        let ctx = $('#lineA');
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
                        text: '產品A',
                        color: 'gold',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
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
                            color: '#999999'
                        },
                        ticks: {
                            color: 'white'
                        },
                        stacked: true, // 堆疊數據
                    },
                    y: {
                        grid: {
                            color: '#999999',  // 設置 Y 軸的網格顏色
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
//-------------------------------------------------------- 折線圖B
function loadLineB() {
    $('#lineBWrapper').empty();
    $('#lineBWrapper').append('<canvas id="lineB"></canvas>'); 

    lineB();
    async function lineB() {
        let response = await fetch('./data/lineB.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        let ctx = $('#lineB');
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
                        text: '產品B',
                        color: 'gold',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
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
                            color: '#999999'
                        },
                        ticks: {
                            color: 'white'
                        },
                        stacked: true, // 堆疊數據
                    },
                    y: {
                        grid: {
                            color: '#999999',  // 設置 Y 軸的網格顏色
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
//-------------------------------------------------------- 折線圖A
function loadLineC() {
    $('#lineCWrapper').empty();
    $('#lineCWrapper').append('<canvas id="lineC"></canvas>'); 

    lineC();
    async function lineC() {
        let response = await fetch('./data/lineC.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
        let ctx = $('#lineC');
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
                        text: '產品C',
                        color: 'gold',
                        font: {
                            size: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
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
                            color: '#999999'
                        },
                        ticks: {
                            color: 'white'
                        },
                        stacked: true, // 堆疊數據
                    },
                    y: {
                        grid: {
                            color: '#999999',  // 設置 Y 軸的網格顏色
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