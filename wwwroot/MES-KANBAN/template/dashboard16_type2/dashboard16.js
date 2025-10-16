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
              <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; user-select: text; background-color: #f0f0f0;color: black">
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

$(document).ready(async () => {
  drawPieChart($("#doughnutWrapper")[0], {title: "機況"});
  drawGaugeChart($("#guageA")[0], { value: 80, name: "OEE" });
  drawBarChart($("#barWrapper")[0], {title: "近30天 完工次數&產量"});
  drawLineChart($("#usage24hr")[0], {title: "24小時用電曲線圖"});
  drawHorizontalBarChart($("#usageShare")[0], {title: "本月用電量佔比"});

  loadTableA();
});

async function drawPieChart(target, chartData) {
  let option = {
    title: {
      text: chartData.title,
      left: "center",
      top: 10, // 與容器頂部的距離為 20px
      textStyle: {
        color: "white",
        fontSize: 20,
      },
    },
    tooltip: {
      trigger: "item",
      // formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    color: [
      "#00ddcc",
      "#1E90FF",
      "#4682B4",
      "#5F9EA0",
      "#6495ED",
      "#00BFFF",
      "#87CEFA",
      "#B0E0E6",
    ],
    series: [
      {
        name: "status",
        type: "pie",
        radius: ["55%","85%"],
        center: ["50%", "55%"],
        data: [
          {
              "name": "生產中",
              "value": 33
          },
          {
              "name": "非生產",
              "value": 7
          },
          {
              "name": "警報",
              "value": 3
          }
      ],
        label: {
          show: true, // 顯示文字
          fontSize: 16, // 文字大小
          color: "white", // 文字顏色（可選）
          fontWeight: "bold",
          position: "inside", // 将标签放在扇区内
          formatter: "{b}\n{c}"
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
          label: {
            fontSize: 20, // 高亮時的文字大小
            fontWeight: "bolder",
          },
        }
      },
    ],
    graphic: [
      {
        type: 'text', // 使用图形组件添加文本
        left: 'center',
        top: '50%',
        style: {
          text: '45%', // 设置中心的数字
          textAlign: 'center',
          fill: '#ffffff', // 文本颜色
          fontSize: 60, // 文本大小
          fontWeight: 'bold', // 加粗字体
        },
      },
    ]
  };

  let myChart = await echarts.init(target); //等待初始化完成
  myChart.setOption(option);
  $(window).on('resize', function () {
    myChart.resize();
  });
}

async function drawGaugeChart(target, chartData) {
  // 動態變色
  const setColor = (value)=>{
    if (value >= 80) {
      return '#74dd88'; // 綠色
    } else if (value >= 60) {
      return '#fda32b'; // 橙色
    } else {
      return '#ff6A6A'; // 紅色
    }
  }
  // 圖表設置
  let option = {
    tooltip: {
      show: true
    },
    series: [
      {
        name: chartData.name,
        type: 'gauge',
        radius: "90%",
        center: ["50%", "55%"],
        progress: {
          show: true
        },
        tooltip: {
          show: true,
          formatter: '{b}: {c}%', // 多行顯示，數值後加百分號
        },
        axisLine: {
          lineStyle: {
            color: [[1, '#fff']], // 刻度軸線顏色設為白色
            width: 10
          }
        },
        axisTick: {
          lineStyle: {
            color: '#fff' // 刻度小線顏色設為白色
          }
        },
        splitLine: {
          lineStyle: {
            color: '#fff', // 分割線顏色設為白色
            width: 2
          }
        },
        axisLabel: {
          show: false
        },
        pointer: {
          show: true,
          // length: '80%', // 指針長度
          // width: 6,      // 指針寬度
        },
        itemStyle: {
          color: setColor(chartData.value) // 指針顏色
        },
        detail: {
          valueAnimation: true, // 數字動畫
          formatter: '{value} %',
          color: setColor(chartData.value), // 數字顏色設為白色
          fontSize: 28,
          offsetCenter: [0, '50%']
        },
        data: [
          {
            value: chartData.value,
            name: chartData.name
          }
        ],
        title: {
          color: '#fff', // 標題文字顏色設為白色
          fontSize: 14,
        }
      }
    ]
  };

  let myChart = await echarts.init(target); //等待初始化完成
  myChart.setOption(option);
  $(window).on('resize', function () {
    myChart.resize();
  });

  // 動態更新效果 (DEMO用)
  function update() {
    let updateValue = Math.round(Math.random() * 60) + 40;
    option.series[0].data[0].value = updateValue;
    option.series[0].itemStyle.color = setColor(updateValue)
    option.series[0].detail.color = setColor(updateValue)
    myChart.setOption(option);
  }
  setInterval(function() {
    update();
  }, 5000);
}

function drawBarChart(target, chartData) {
  // 生成假資料 START
  const days = [];
  const completedCountData = [];
  const productionData = [];
  for (let i = 1; i <= 30; i++) {
    const day = `1/${i < 10 ? '0' + i : i}`;  // 生成日期格式为 1-01, 1-02, ..., 1-30
    days.push(day);
    
    const completedCount = Math.floor(Math.random() * 30) + 10;  // 随机生成完工次数，假设在10到40之间
    completedCountData.push(completedCount);
    
    const production = completedCount * 2;  // 產量 = 完工次數 * 5
    productionData.push(production);
  }
  // 生成假資料 END

  let app = {}
  app.config = {
    rotate: 90,
    align: "left",
    verticalAlign: "middle",
    formatter: "{c}",
    fontSize: 16,
    color: "white",
    rich: {
      name: {},
    },
    // 使用toolbox變換圖表時，保持設定
    onChange: function () {
      const labelOption = {
        rotate: app.config.rotate,
        align: app.config.align,
        verticalAlign: app.config.verticalAlign,
        position: app.config.position,
        formatter: app.config.formatter,
        fontSize: app.config.fontSize,
        color: app.config.color,
        rich: app.config.rich
      };
      myChart.setOption({
        series: [
          {
            label: labelOption
          },
          {
            label: labelOption
          },
          {
            label: labelOption
          }
        ]
      });
    }
  };
  const labelOption = {
    show: false,
    rotate: app.config.rotate,
    align: app.config.align,
    verticalAlign: app.config.verticalAlign,
    position: app.config.position,
    formatter: app.config.formatter,
    fontSize: app.config.fontSize,
    color: app.config.color,
    rich: app.config.rich
  };

  let option = {
    title: {
        text: chartData.title,
        left: 'center',
        top: 4, // 與容器頂部的距離為 20px
        textStyle: {
            color: 'white',
            fontSize: 20
        }
    },
    grid: {
      top: "25%",
      left: "1%",
      right: "1%",
      bottom: "1%",
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["完工次數", "產量"],
      textStyle: {
        color: "#ffffff", // 讓圖例文字顯示為白色
      },
      top:35
    },
    toolbox: {
      show: true,
      orient: "horizontal",
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
        mark: { show: true },
        dataView: dataViewConfig(chartData.title),
        magicType: {
          show: true,
          // type: ["line", "bar", "stack"],
          type: ["line", "bar"],
          option: {
            line: {
              smooth: true // 开启平滑
            }
        }
        },
        restore: { show: true },
        saveAsImage: { show: true },
        // dataZoom: {
        //   yAxisIndex: false // 仅缩放 X 轴
        // }
      },
    },
    xAxis: [
      {
        type: "category",
        axisTick: { show: false },
        axisLabel: {
          color: "#ffffff", // 讓X軸標籤文字變白
        },
        data: days,
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          color: "#ffffff", // 讓Y軸標籤文字變白
        },
        axisLine: {
          lineStyle: {
            color: "#ffffff", // 讓Y軸的線條顏色變白
          },
        },
        splitLine: {
          lineStyle: {
            color: "#ffffff50", // 讓Y軸分隔線顏色變白
          },
        },
      },
    ],
    series: [
      {
        name: "完工次數",
        type: "bar",
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: completedCountData ,
      },
      {
        name: "產量",
        type: "bar",
        barGap: 0,
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: productionData,
      }
    ],
  };

  let myChart = echarts.init(target);
  myChart.setOption(option);
  $(window).on('resize', function () {
    // 工具列RWD
    if ($(window).width() < 992) {
      // 小于 992px 时设置为垂直排列
      option.toolbox.orient = 'vertical';
      option.grid.right = '5%';
      option.toolbox.top = "bottom";
    } else {
      // 否则设置为水平排列
      option.toolbox.orient = 'horizontal';
      option.grid.right = '1%';
      option.toolbox.top = "top";
    }
    // 使用 ECharts 实例重新设置配置项
    myChart.setOption(option);
    myChart.resize();
  });
  $(window).trigger('resize')
}

async function drawLineChart(target, chartData) {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // 隨機生成分電表數據
  const subMeters = Array.from({ length: 7 }, () =>
    hours.map(() => Math.floor(Math.random() * 100 + 50)) // 每小時隨機 50~150 kWh
  );

  // ECharts 配置
  const option = {
    title: {
      text: chartData.title,
      left: 'center',
      textStyle:{
        color: 'white'
      },
      top: 4
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line',
      },
    },
    // legend: {
    //   top:"10%",
    //   left: "center",
    //   textStyle: {
    //     color: '#FFFFFF',
    //   },
    // },
    grid:{
      top: "15%",
      bottom: "1%",
      left: "2%",
      right: "2%",
      containLabel:true
    },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false,
      axisLine: {lineStyle: {"color": "#ffffff95"}, "show": true},
      // axisTick: {show: false},
      axisLabel: {
        color: '#FFFFFF',
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {lineStyle: {"color": "#ffffff95"}, "show": true},
      axisLabel: {
        color: '#FFFFFF',
      },
      splitLine: {show: false},
    },
    series: [
      {
        name: '電表',
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.2, // 區域透明度設置
        },
        itemStyle: {color: "#42f59e"},
        lineStyle: {width: 2},
        data: hours.map(() => Math.floor(Math.random() * 600 + 50)), // 隨機數據示例
        markLine: {
          symbol: [
              "none",
              "none"
          ],
          data: [
              {
                  type: "max",
                  name: "最高需量",
                  label: {
                      position: "start",
                      offset: [
                          200,
                          0
                      ],
                      formatter: "{b}\r{c}",
                      fontSize: 14
                  },
                  emphasis: {
                      label: {
                          fontSize: 16
                      }
                  }
              },
              {
                  yAxis: 500,
                  silent: false,
                  name: "契約容量",
                  lineStyle: {
                      style: "solid",
                      color: "red"
                  },
                  label: {
                      position: "start",
                      offset: [
                          100,
                          0
                      ],
                      formatter: "{b}\r{c}",
                      fontSize: 14
                  },
                  emphasis: {
                      label: {
                          fontSize: 16
                      }
                  }
              }
          ]
        },
        markArea: {
          silent: true,
          data: [
            // 尖峰時段 (紅色)
            [
              { name: '', xAxis: '10:00', itemStyle: { color: 'rgba(255, 0, 0, 0.3)' } },
              { xAxis: '15:00' },
            ],
            [
              { name: '', xAxis: '18:00', itemStyle: { color: 'rgba(255, 0, 0, 0.3)' } },
              { xAxis: '20:00' },
            ],
  
            // 半尖峰時段 (橘色)
            [
              { name: '', xAxis: '6:00', itemStyle: { color: 'rgba(255, 165, 0, 0.3)' } },
              { xAxis: '10:00' },
            ],
            [
              { name: '', xAxis: '15:00', itemStyle: { color: 'rgba(255, 165, 0, 0.3)' } },
              { xAxis: '18:00' },
            ],
            [
              { name: '', xAxis: '20:00', itemStyle: { color: 'rgba(255, 165, 0, 0.3)' } },
              { xAxis: '22:00' },
            ],
  
            // 離峰時段 (綠色)
            [
              { name: '', xAxis: '0:00', itemStyle: { color: 'rgba(0, 100, 0, 0.3)' } },
              { xAxis: '6:00' },
            ],
            [
              { name: '', xAxis: '22:00', itemStyle: { color: 'rgba(0, 100, 0, 0.3)' } },
              { xAxis: '23:00' },
            ],
          ],
        }
      }
    ],
  };
  

  let myChart = await echarts.init(target); //等待初始化完成
  myChart.setOption(option);
  $(window).on('resize', function () {
    myChart.resize();
  });
}
function drawHorizontalBarChart(target, chartData) {
  let total = 23732 + 14311 + 17042; // 計算總和

  let option = {
    title: {
      text: chartData.title,
      left: 'center',
      top: 4, // 與容器頂部的距離為 20px
      textStyle: {
          color: 'white',
          fontSize: 20
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      show: false
    },
    grid: {
      top: "15%",
      left: '2%',
      right: '5%',
      bottom: '1%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.1], //左右留白的區域
      axisLabel: {
        color: "#ffffff", // 讓Y軸標籤文字變白
      },
      splitLine: {
        lineStyle: {
          color: "#ffffff50", // 讓Y軸分隔線顏色變白
        },
      },
    },
    yAxis: {
      type: 'category',
      inverse: true, // 大的排序在前
      data: ['尖峰', '半尖峰', '離峰'],
      axisLabel: {
        color: "#ffffff", // 讓Y軸標籤文字變白
        fontSize:16,
        fontWeight:"bold"
      },
      axisLine: {
        lineStyle: {
          color: "transparent", // 讓Y軸的線條顏色變白
        }
      },
      splitLine: {
        lineStyle: {
          color: "#ffffff", // 讓Y軸分隔線顏色變白
        },
      }
    },
    series: [
      {
        // realtimeSort: true,
        name: 'Productivity',
        type: 'bar',
        label: {
          show: true, // 顯示數據標籤
          valueAnimation: true,
          position: 'inside', // 設置標籤位置（可選：'inside', 'outside', 'top', 'left', 'right', 等）
          formatter: (params) => {
            let percentage = ((params.value / total) * 100).toFixed(1); // 計算佔比，保留1位小數
            return `${params.value} (${percentage}%)`; // 顯示數據和佔比
          },
          // distance: "-120",
          color: '#ffffff', // 標籤文字顏色
          fontSize: 16, // 字體大小
          fontWeight: 'bold' // 字體粗細，可選 'normal', 'bold', 'bolder', 'lighter' 或數值（如 100, 400, 700）
        },
        itemStyle: {
          color: (params) => {
            // 為每個數據條設置不同顏色
            const colors = ["#EF7373","#FFB74D","#81C784"];
            return colors[params.dataIndex];
          },
        },
        data: [23732, 14311, 17042]
      }
    ],
    animationDuration: 500,
    animationDurationUpdate: 500,
    animationEasing: 'linear',
    animationEasingUpdate: 'linear'
  };
  
  let myChart = echarts.init(target);
  myChart.setOption(option);
  $(window).on('resize', function () {
    myChart.resize();
  });
}

//-------------------------------------------------------- 輪播表格
// 需複製css樣式 => 搜尋 .slider-nav
async function loadTableA() {
  let gridDataList = await Promise.all([
    fetch("./data/fakeTableDataA01.json").then((response) => response.json()),
    fetch("./data/fakeTableDataA02.json").then((response) => response.json()),
    fetch("./data/fakeTableDataA03.json").then((response) => response.json()),
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
  $("#carouselExampleIndicators .carousel-inner").html(htmlContent);

  // 添加點擊事件 -> 導航欄變色
  initCarousel();

  // 添加點擊事件 -> 自動輪播開關
  const carouselElement = document.querySelector("#carouselExampleIndicators");
  const carousel = new bootstrap.Carousel(carouselElement, {
    interval: 5000, // 設定自動播放間隔（例如 5 秒）
  });

  // 預設為開
  carousel._config.ride = true

  $("#toggleTouch").on("click", function () {
    toggleAutoplay(carousel);
    $(this).blur();
  });

  function generateTable(gridData) {
    if (gridData.length === 0) return "<p>沒有數據可顯示</p>"; // 如果沒有數據，顯示提示信息

    // 提取欄位名（假設所有行都有相同的鍵）
    const columns = Object.keys(gridData[0]);

    // 生成表頭
    const headerRow = columns
      .map((column) => `<th scope="col">${column}</th>`)
      .join("");

    // 生成表格行
    const tableRows = gridData
      .map(
        (row) => `
            <tr>
                ${columns
                  .map((column) => {
                    // 根據狀態獲取對應的 CSS 類別（如果需要）
                    const statusClass =
                      column === "status" ? getStatusClass(row[column]) : "";
                    return `<td class="${statusClass}">${row[column]}</td>`;
                  })
                  .join("")}
            </tr>
        `
      )
      .join("");

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
      case "Run":
        return "text-success";
      case "Idle":
        return "text-warning";
      case "Error":
        return "text-danger";
      default:
        return "";
    }
  }

  function initCarousel() {
    $(".carousel-item").each(function (index) {
      const element = this;

      // 定義 MutationObserver 的回調函數
      const observer = new MutationObserver(function () {
        if (
          $(element).hasClass("active") ||
          $(element).hasClass("carousel-item-next")
        ) {
          // 移除所有按鈕的 active 樣式
          $(".slider-nav div").removeClass("active");
          // 添加 active 樣式到當前選中的按鈕
          $(`.slider-nav div:nth-child(${index + 1})`).addClass("active");
        }
      });

      // 設置監聽目標元素及其屬性
      observer.observe(element, {
        attributes: true, // 監聽屬性變化
        attributeFilter: ["class"], // 只監聽 class 屬性變化
      });
    });

    // 若手動點擊則馬上變更顏色
    $(".slider-nav div").click(function () {
      // 移除所有按鈕的 active 樣式
      $(".slider-nav div").removeClass("active");
      // 添加 active 樣式到當前選中的按鈕
      $(this).addClass("active");
    });
  }

  function toggleAutoplay(carousel) {
    if (carousel._config.ride) {
      carousel._config.ride = false; // 暫停自動播放
    } else {
      carousel._config.ride = true; // 開啟自動播放
    }
  }
}