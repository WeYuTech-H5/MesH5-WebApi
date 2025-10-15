$(document).ready(async()=>{
    // 替換為需要的資料
    let response = await fetch('./data/lineData.json');  // 等待 fetch 完成
    let lineDataSet = await response.json();  // 等待解析 JSON 資料
    kWhData = lineDataSet.kWh
    FrequencyData = lineDataSet.Frequency
    PFData = lineDataSet.PF
    kWData = lineDataSet.kW
    CurrentData = lineDataSet.Current
    monthlyUsageData = lineDataSet.monthlyUsage
    yearlyUsageData = lineDataSet.yearlyUsage

    // 繪圖
    drawLineChart($("#lineAWrapper")[0], kWhData);
    drawLineChart($("#lineBWrapper")[0], FrequencyData);
    drawLineChart($("#lineCWrapper")[0], PFData);
    drawLineChart($("#lineDWrapper")[0], kWData);
    drawLineChart($("#lineEWrapper")[0], CurrentData);
    drawLineChart($("#lineFWrapper")[0], monthlyUsageData);
    drawLineChart($("#lineGWrapper")[0], yearlyUsageData);

    drawPieChart();
    drawMultiLineChart();
    drawStackedBarChart();
})

function drawLineChart(target, data){
    // 圖表設定
    let option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'line',
                lineStyle: {
                    color: 'yellow'
                }
            }
        },
        grid: {
            top: '5%',
            left: '1%',
            right: '1%',
            bottom: '2%',
            containLabel: true
        },
        xAxis: data.xAxis,
        yAxis: data.yAxis,
        series: data.series
    };
    // 初始化畫布
    let myChart = echarts.init(target);  // Initialize ECharts instance
    // 開始繪圖
    myChart.setOption(option);
    // 監聽畫面縮放 更新圖表尺寸
    window.addEventListener('resize', function () {
        myChart.resize();
    });
}

function drawPieChart() {
    $('#pieAWrapper').empty();
    // $('#pieAWrapper').append('<canvas id="pieA"></canvas>');
    
    pieA();
    async function pieA() {
        let response = await fetch('./data/pieData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
                
        var chartDom = document.getElementById('pieAWrapper');
        var pieChart = echarts.init(chartDom);
        var option;

        option = {
            title: {
                text: 'Meter Usage Ratio',
                left: 'center',
                top: 8, // 與容器頂部的距離為 20px
                textStyle: {
                    color: 'white',
                    fontSize: 24
                }
            },
            tooltip: {
                trigger: 'item',
                // formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle:{
                    color: 'white'
                }
            },
            color: [
                '#00ddcc',
                '#1E90FF',
                '#4682B4',
                '#5F9EA0',
                '#6495ED',
                '#00BFFF',
                '#87CEFA',
                '#B0E0E6'
            ],
            series: [
                {
                    name: 'Meter',
                    type: 'pie',
                    radius: '88%',
                    center: ['50%', '55%'],
                    data: chartData.seriesData,
                    label: {
                        show: true, // 顯示文字
                        position: 'inside',
                        formatter: (params) => {
                            // 根据百分比值判断是否显示内容
                            if (params.percent > 5) {
                                return [
                                    `{nameStyle|${params.name}}`, // 名称
                                    `{percentStyle|${params.percent}%}` // 百分比值
                                ].join('\n'); // 换行显示
                            }
                            return ''; // 小于等于5时不显示
                        },
                        rich: {
                            nameStyle: {
                                fontSize: 18,
                                color: 'white',
                                fontWeight: 'bold'
                            },
                            percentStyle: {
                                fontSize: 20,
                                color: 'yellow',
                                fontWeight: 'bold'
                            }
                        },
                        emphasis: {
                            show: true, // 高亮状态标签始终显示
                            textStyle: {
                                fontSize: 20, // 高亮时字体变大
                                fontWeight: 'bold',
                                color: '#FFD700' // 高亮字体颜色
                            },
                            formatter: (params) => {
                                return [
                                    `{nameStyle|${params.name}}`,
                                    `{percentStyle|${params.percent}%}`
                                ].join('\n'); // 高亮状态下显示完整内容
                            },
                            rich: {
                                nameStyle: {
                                    fontSize: 20,
                                    fontWeight: 'bolder'
                                },
                                percentStyle: {
                                    fontSize: 22, // 高亮时百分比字体变大
                                    fontWeight: 'bolder'
                                }
                            },

                        },
                    },
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && pieChart.setOption(option);
        window.addEventListener('resize', function () {
            // legend RWD
            if ($(window).width() < 992 && $(window).width() > 768) {
                // 小于 992px 时设置为水平排列
                option.legend.orient = 'horizontal';
                option.legend.left = 'center';
                option.legend.top = "bottom";
            } else {
                // 否则设置为水平排列
                option.legend.orient = 'vertical';
                option.legend.left = 'left';
                option.legend.top = "top";
            }
            // 使用 ECharts 实例重新设置配置项
            pieChart.setOption(option);
            pieChart.resize();
        });
    };
};

function drawMultiLineChart() {
    $('#multiLineAWrapper').empty();
    // $('#multiLineAWrapper').append('<canvas id="multiLineA"></canvas>');
    
    multiLineA();
    async function multiLineA() {
        let response = await fetch('./data/multiLineData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        // 定義 ECharts 配置
        var option = {
            title: {
                text: 'Factory Usage Over Time',
                left: 'center',
                top: 10,
                textStyle: {
                    color: '#fff',
                    fontSize: 20
                }
            },
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
                data: ['Injection', 'Stamping'],
                top: 35,
                left: 'center',
                textStyle: {
                    color: '#eee'
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '0%',
                containLabel: true
            },
            xAxis: chartData.xAxis, // 從 JSON 加載 xAxis 配置
            yAxis: chartData.yAxis, // 從 JSON 加載 yAxis 配置
            series: chartData.series // 從 JSON 加載 series 配置
        };

        // 使用 ECharts 初始化圖表
        var areaChart = echarts.init(document.getElementById('multiLineAWrapper'));
        areaChart.setOption(option);
        window.addEventListener('resize', function () {
            areaChart.resize();
        });
    };
};

function drawStackedBarChart() {
    $('#barAWrapper').empty();
    // $('#barAWrapper').append('<canvas id="barA"></canvas>');
    
    barA();
    async function barA() {
        let response = await fetch('./data/barData.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var chartDom = document.getElementById('barAWrapper');
        var barChart = echarts.init(chartDom);
        var option;

        option = {
            title: {
                text: 'Each Factory Usage (yr)',
                left: 'center',
                textStyle: {
                    color: 'white',
                    fontSize: 20
                }
            },
            color: ['rgb(102, 204, 204)', 'rgb(100, 149, 237)'], // 主題顏色
            label: {
                // color: '#eee', // 標籤文字顏色
                // fontSize: 12,  // 字體大小
                // fontWeight: 'light' // 字體粗細
            },
            legend: {
                top: 30,
                left: 'center',
                textStyle: {
                    color: '#eee',
                    fontSize: 12
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
                }
            },
            grid: {
                left: '0%',
                right: '0%',
                bottom: '0%',
                containLabel: true
            },
            yAxis: chartData.yAxis,
            xAxis: chartData.xAxis,
            series: chartData.series
        };

        barChart.setOption(option);
        window.addEventListener('resize', function () {
            barChart.resize();
        });
    };
};