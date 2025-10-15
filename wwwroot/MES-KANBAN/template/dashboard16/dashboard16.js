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
  drawPieChart($("#doughnutWrapper")[0]);
  drawGaugeChart($("#guageA")[0], { value: 80, name: "Good Ratio" });
  drawGaugeChart($("#guageB")[0], { value: 60, name: "OEE" });
  drawBarChart($("#barWrapper")[0]);
  drawHorizontalBarChart($("#horizontalBarWrapper")[0]);
  drawRadarChart($("#radarWrapper")[0]);

  loadTableA();
});

async function drawPieChart(target, data) {
  let option = {
    title: {
      text: "Current report project status",
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
              "name": "Create",
              "value": 93
          },
          {
              "name": "Finished",
              "value": 23
          },
          {
              "name": "Terminated",
              "value": 52
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

async function drawGaugeChart(target, data) {
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
        name: data.name,
        type: 'gauge',
        radius: "100%",
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
          color: setColor(data.value) // 指針顏色
        },
        detail: {
          valueAnimation: true, // 數字動畫
          formatter: '{value} %',
          color: setColor(data.value), // 數字顏色設為白色
          fontSize: 28,
          offsetCenter: [0, '50%']
        },
        data: [
          {
            value: data.value,
            name: data.name
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

function drawBarChart(target, data) {
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
    show: true,
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
        text: 'Daily productivity of machine',
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
      data: ["Production line 1", "Production line 2", "Production line 3"],
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
        dataView: dataViewConfig('Daily productivity of machine'),
        magicType: {
          show: true,
          type: ["line", "bar", "stack"],
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
        data: ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
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
        name: "Production line 1",
        type: "bar",
        barGap: 0,
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [320, 332, 301, 334, 390, 373, 382],
      },
      {
        name: "Production line 2",
        type: "bar",
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [220, 182, 191, 234, 290, 286, 301],
      },
      {
        name: "Production line 3",
        type: "bar",
        label: labelOption,
        emphasis: {
          focus: "series",
        },
        data: [150, 232, 201, 154, 190, 210, 209],
      },
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

function drawHorizontalBarChart(target, data) {
  let option = {
    title: {
      text: 'Personnel Productivity',
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
      left: '2%',
      right: '4%',
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
      data: ['Amy', 'Benny', 'Charlie', 'Dennis', 'Ellen', 'Frank', 'Gary', 'Henry', 'Ivy'],
      axisLabel: {
        color: "#ffffff", // 讓Y軸標籤文字變白
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
        realtimeSort: true,
        name: 'Productivity',
        type: 'bar',
        label: {
          show: true, // 顯示數據標籤
          valueAnimation: true,
          position: 'right', // 設置標籤位置（可選：'inside', 'outside', 'top', 'left', 'right', 等）
          formatter: '{c}', // 使用數據值作為標籤內容，{c} 表示對應數據
          distance: -40,
          color: '#ffffff', // 標籤文字顏色
          fontSize: 16, // 字體大小
          fontWeight: 'bold' // 字體粗細，可選 'normal', 'bold', 'bolder', 'lighter' 或數值（如 100, 400, 700）
        },
        data: [321, 224, 183, 369, 258, 208, 254, 150, 223]
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

  // 動態更新效果 (DEMO用)
  function update() {
    let data = option.series[0].data;
    for (let i = 0; i < data.length; ++i) {
      if (Math.random() > 0.7) {
        data[i] += Math.round(Math.random() * 50);
      } else {
        data[i] += Math.round(Math.random() * 10);
      }
    }
    myChart.setOption(option);
  }
  setInterval(function() {
    update();
  }, 5000);
}

function drawRadarChart(target, data) {
  let myChart = echarts.init(target);
  let option;

  option = {
    title: {
      text: 'Transaction Trend Statisics',
      left: 'center',
      top: 4, // 與容器頂部的距離為 20px
      textStyle: {
          color: 'white',
          fontSize: 20
      }
    },
    // tooltip: {
    //   trigger: 'item'
    // },
    legend: {
      data: ['Product A', 'Product B', 'Product C'],
      top:30,
      textStyle:{
        color: 'white'
      }
    },
    radar: {
      // shape: 'circle',
      center: ['50%', '60%'], // 设置雷达图中心的位置
      radius: '70%', // 控制雷达图的大小
      nameGap: 5, // 指示器标签与轴之间的距离
      name: {
        textStyle: {
          color: '#ffffff', // 设置指示器文字颜色为蓝色
          fontSize: 12 // 字体大小
        }
      },
      indicator: [
        {"name": "Order Quantity", "max": 10000},         // 最大訂單量
        {"name": "Total Amount", "max": 50000},           // 最大總金額
        {"name": "Average Lead Time", "max": 365},        // 最大平均交期（天數）
        {"name": "Customer Complaints", "max": 500},      // 最大客訴數量
        {"name": "Payment Days", "max": 120}              // 最大付款天數
      ]
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        areaStyle: {
          opacity: 0.2 // 填充区域的透明度
        },
        label: {
          show: false,
          position: 'top', // 标记在数据点的顶部
          formatter: '{c}', // 显示数据的数值
          color: '#FFD700', // 标签颜色
          fontSize: 14, // 标签字体大小
          fontWeight: "bold",
        },
        emphasis: {
          label: {
            show: true, // 鼠标悬停时显示标签
          },
          areaStyle: {
            opacity: 1 // 填充区域的透明度
          }
        },
        data: [
          {
            "name": "Product A",
            "value": [2673, 25068, 265, 213, 72],
            "itemStyle": {
              color: "#0099CC" // 设置区域颜色
            }
          },
          {
            "name": "Product B",
            "value": [7527, 37538, 40, 313, 118],
            "itemStyle": {
              color: "#00CC99" // 设置区域颜色
            }
          },
          {
            "name": "Product C",
            "value": [9268, 30552, 151, 210, 95],
            "itemStyle": {
              color: "#6633FF" // 设置区域颜色
            }
          }
        ]
      }
    ]
  };

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