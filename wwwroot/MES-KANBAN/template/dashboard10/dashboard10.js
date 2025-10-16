$(document).ready(()=>{
  loadDoughnutChart();
  loadPieChart();
  loadBar();
  loadGantt();
  loadBarLine();
})

function loadDoughnutChart() {
  $('#doughnutWrapper').empty();
  $('#doughnutWrapper').append('<canvas id="doughnut"></canvas>');
  
  doughnutChart();
  async function doughnutChart() {
      let response = await fetch('./data/doughnutData.json');  // 等待 fetch 完成
      let chartData = await response.json();  // 等待解析 JSON 資料
  
      let ctx = $('#doughnut');
      new Chart(ctx,
      {
          type: 'doughnut',
          data: chartData,
          options: {
              plugins: {
                  legend: {
                      display: false
                  },
                  tooltips: {
                      enabled: false
                  }
              },
              responsive: true,  // 讓圖表自動適應容器大小
              maintainAspectRatio: true,  // 允許打破寬高比的限制
              aspectRatio: 1.5,
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
                  var fontSize = (height / 50).toFixed(2);
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

function loadPieChart() {
    $('#pieWrapper').empty();
    $('#pieWrapper').append('<canvas id="pie"></canvas>');
    
    pieChart();
    async function pieChart() {
        let response = await fetch('./data/pieData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
    
        let ctx = $('#pie');
        new Chart(ctx, {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                plugins: {
                    tooltip: {
                        backgroundColor: 'rgba(0,0,0,.6)',  // 工具提示的背景顏色
                    },
                    legend:{
                        // display: false,
                        position: 'right',
                        labels:{
                            color:'white'
                        }
                    },
                    datalabels: {
                        color: 'white',
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    };
};

function loadBar() {
    $('#barWrapper').empty();
    $('#barWrapper').append('<canvas id="bar"></canvas>');
    
    bar();
    async function bar() {
        let response = await fetch('./data/barData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#bar');
        new Chart(ctx, {
            type: 'bar',  // 使用 bar 圖表類型
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',  // 設置為水平條形圖
                plugins: {
                    legend:{
                        display: false
                        // labels:{
                        //     color: 'white',
                        //     font: {
                        //         size: 12 // 調整文字大小
                        //     }
                        // },
                        // onClick: null // 禁止圖例的點擊事件
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
                            display:false
                        },
                        ticks: {
                            display:false
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

function loadGantt() {
    $('#ganttWrapper').empty();
    $('#ganttWrapper').append('<canvas id="gantt"></canvas>');
    
    gantt();
    async function gantt() {
        let response = await fetch('./data/ganttData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#gantt');
        new Chart(ctx, {
            type: "bar",
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio:false,
                indexAxis: "y",
                plugins: {
                    // title:{
                    //     display: true,
                    //     text: "P. 時間線圖",
                    //     color: 'skyblue',
                    //     font: {
                    //         size: 20
                    //     },
                    //     padding: {
                    //         top: 10,    // 標題與圖表之間的間距
                    //         bottom: 40
                    //     }
                    // },
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
                                size: 14, // 設定 legend 文字大小
                            },
                            // padding:10,
                            // boxWidth: 60 // 調整顏色方塊的寬度
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
                            // color: 'grey'
                        },
                        ticks: {
                            color: 'white'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                            // color: 'grey'
                        },
                        ticks: {
                            // color: 'white',
                            // font:{
                            //     size: 18
                            // }
                            display:false
                        }
                    },
                },
                layout: {
                    padding: {
                        left: 20,
                        right: 20,
                        bottom: 10 // 增加圖表下方間距
                    }
                }
            },
        });
    };
};

function loadBarLine() {
    $('#barLineWrapper').empty();
    $('#barLineWrapper').append('<canvas id="barLine"></canvas>');
    
    barLine();
    async function barLine() {
        let response = await fetch('./data/barLineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#barLine');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title:{
                        display: true,
                        text: "title",
                        color: 'rgb(101, 178, 254)',
                        font: {
                            size: 18
                        },
                        padding: {
                            top: 0,    // 標題與圖表之間的間距
                            bottom: 0
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: true
                    },
                    legend: {
                        labels:{
                            color: 'white',
                        },
                    }
                },
                scales: {
                    x: {
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
                },
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        bottom:5
                    }
                }
            }
        });
    };
};