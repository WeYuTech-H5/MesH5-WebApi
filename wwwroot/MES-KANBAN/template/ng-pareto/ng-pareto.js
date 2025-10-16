const dataViewConfig = (title) => ({
  show: true,
  title: "查看數據",
  icon: "path://M12 10V20M3 15L21 15M3 10H21M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V7.2C21 6.0799 21 5.51984 20.782 5.09202C20.5903 4.71569 20.2843 4.40973 19.908 4.21799C19.4802 4 18.9201 4 17.8 4H6.2C5.0799 4 4.51984 4 4.09202 4.21799C3.71569 4.40973 3.40973 4.71569 3.21799 5.09202C3 5.51984 3 6.07989 3 7.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20Z",
  lang: [title, '關閉', '刷新'],  // 將圖表的 title 作為第一個元素
  readOnly: true,
  // backgroundColor: 'transparent', // 背景顏色
  optionToContent: function (opt) {
      const axisData = opt.xAxis[0].data; // x 軸類別
      const series = opt.series; // 所有數據集
  
      // 構建表格 HTML
      const tableHeader = `
          <tr>
              <th style="border: 1px solid #ccc; border-top: 0; padding: 8px;">原因碼</th>
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

let myChart
$(document).ready(()=>{
    drawBarChart($("#paretoWrapper")[0])
    initDateRangePicker()
})

function drawBarChart(target, chartData) {
  let option = {
    grid:{
      top:"80",
      bottom: "1%",
      left: "1%",
      right: "1%",
      containLabel: true,
    },
    textStyle:{
        color: "white",
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        },
        label:{
          precision: 0 //取到整數
        }
      }
    },
    toolbox: {
      show: true,
      orient: "horizontal",
      right: "0",
      top: "top",
    //   backgroundColor: "#ffffff",
      itemSize: 24,
      itemGap: 15,
      iconStyle: {
        borderColor: '#ffffff', // 圖標顏色為白色
      },
      emphasis: {
        iconStyle: {
          borderColor: '#FFD700',
        }
      },
      feature: {
        mark: { show: true },
        dataView: dataViewConfig("NG Pareto"),
        saveAsImage: { 
          title: '保存圖片',
          icon:'path://M0 26.016q0 2.496 1.76 4.224t4.256 1.76h20q2.464 0 4.224-1.76t1.76-4.224v-20q0-2.496-1.76-4.256t-4.224-1.76h-20q-2.496 0-4.256 1.76t-1.76 4.256v20zM4 26.016v-20q0-0.832 0.576-1.408t1.44-0.608h20q0.8 0 1.408 0.608t0.576 1.408v20q0 0.832-0.576 1.408t-1.408 0.576h-20q-0.832 0-1.44-0.576t-0.576-1.408zM6.016 24q0 0.832 0.576 1.44t1.408 0.576h16q0.832 0 1.408-0.576t0.608-1.44v-0.928q-0.224-0.448-1.12-2.688t-1.6-3.584-1.28-2.112q-0.544-0.576-1.12-0.608t-1.152 0.384-1.152 1.12-1.184 1.568-1.152 1.696-1.152 1.6-1.088 1.184-1.088 0.448q-0.576 0-1.664-1.44-0.16-0.192-0.48-0.608-1.12-1.504-1.6-1.824-0.768-0.512-1.184 0.352-0.224 0.512-0.928 2.24t-1.056 2.56v0.64zM6.016 9.024q0 1.248 0.864 2.112t2.112 0.864 2.144-0.864 0.864-2.112-0.864-2.144-2.144-0.864-2.112 0.864-0.864 2.144z',
          show: true, 
          backgroundColor: '#00000043',
        },
        myTool: {
          show: true,
          title: '匯出表格',
          icon: 'path://m0 1016.081 409.186 409.073 79.85-79.736-272.867-272.979h1136.415V959.611H216.169l272.866-272.866-79.85-79.85L0 1016.082ZM1465.592 305.32l315.445 315.445h-315.445V305.32Zm402.184 242.372-329.224-329.11C1507.042 187.07 1463.334 169 1418.835 169h-743.83v677.647h112.94V281.941h564.706v451.765h451.765v903.53H787.946V1185.47H675.003v564.705h1242.353V667.522c0-44.498-18.07-88.207-49.581-119.83Z',
          onclick: function () {
            exportToExcel();
          },
        },
      },
    },
    xAxis: [
      {
        type: 'category',
        data: ["reason 1", "reason 2", "reason 3", "reason 4", "reason 5"],
        axisPointer: {
          type: 'shadow'
        },
        axisLine: {lineStyle: {"color": "#ffffff95"}, "show": true},
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'count',
        interval: 50,
        axisLabel: {
          formatter: '{value}'
        },
        splitLine:{show:false},
        axisLine: {
          show:true,
          // lineStyle: {
          //   color: "#ffffff", // 讓Y軸的線條顏色變白
          // },
        },
      },
      {
        type: 'value',
        name: 'Percentage',
        interval: 10,
        axisLabel: {
          formatter: '{value} %'
        },
        splitLine:{
          lineStyle:{
            color: "#ffffff50"
          }
        },
      }
    ],
    series: [
      {
        name: 'count',
        type: 'bar',
        data: [134, 56, 28, 20, 13], // 纯数据
        itemStyle: {
          color: function (params) {
            const colors = ['#FF5733', '#33FF57', '#3357FF', '#FFC300', '#DAF7A6'];
            return colors[params.dataIndex]; // 根据索引返回对应的颜色
          }
        }
      },
      {
        name: 'Percentage',
        type: 'line',
        yAxisIndex: 1,
        data: [53.39, 75.5, 86.86, 94.83, 100]
      }
    ]
  };
  
  myChart = echarts.init(target);
  myChart.setOption(option);
  $(window).on("resize", function () {
    // 使用 ECharts 实例重新设置配置项
    myChart.setOption(option);
    myChart.resize();
  });

  // 应用图表选项
  myChart.setOption(option);

  // 定义导出函数
  function exportToExcel() {
    // 获取图表数据
    const xAxisData = option.xAxis[0].data; // X轴数据 (原因碼)
    const countData = option.series[0].data; // 第一组数据 (count)
    const percentageData = option.series[1].data; // 第二组数据 (Percentage)

    // 转换为二维数组
    const data = [['时间', 'count', 'Percentage']]; // 表头
    for (let i = 0; i < xAxisData.length; i++) {
        data.push([
            xAxisData[i], // 原因碼
            countData[i], // count 值
            percentageData[i] // Percentage 值
        ]);
    }

    // 使用 SheetJS 导出 Excel
    const worksheet = XLSX.utils.aoa_to_sheet(data); // 转换为工作表
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Chart Data');
    XLSX.writeFile(workbook, 'chart-data.xlsx'); // 导出文件
}
}

// 初始化日期選擇器
function initDateRangePicker() {
	// 計算過去30天的日期
	var startDate = moment().subtract(30, "days"); // 29天前
	var endDate = moment(); // 當前日期

	$("#dateRange").daterangepicker({
		startDate: startDate,
		endDate: endDate,
		locale: {
			format: "YYYY/MM/DD",
			applyLabel: "確定",
			cancelLabel: "取消",
			fromLabel: "開始日期",
			toLabel: "結束日期",
			customRangeLabel: "自訂日期區間",
			daysOfWeek: ["日", "一", "二", "三", "四", "五", "六"],
			monthNames: [
				"1月",
				"2月",
				"3月",
				"4月",
				"5月",
				"6月",
				"7月",
				"8月",
				"9月",
				"10月",
				"11月",
				"12月",
			],
			firstDay: 1,
		},
		ranges: {
			今天: [moment(), moment()],
			昨天: [moment().subtract(1, "days"), moment().subtract(1, "days")],
			"過去 7 天": [moment().subtract(6, "days"), moment()],
			"過去 30 天": [moment().subtract(29, "days"), moment()],
			本月: [moment().startOf("month"), moment().endOf("month")],
			上個月: [
				moment().subtract(1, "month").startOf("month"),
				moment().subtract(1, "month").endOf("month"),
			],
		},
		alwaysShowCalendars: true,
	});
}
