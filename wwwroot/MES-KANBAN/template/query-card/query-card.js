const category = "REPORT_TIME" //X軸欄位
const myChart = echarts.init($("#chartWrapper")[0]);
let currentType = "line" //預設圖表類型
let isStacked = "total" //預設堆疊
let option = {
	grid: {
	  top: "10%",
	  left: "1%",
	  right: "1%",
	  bottom: "0%",
	  containLabel: true,
	},
	tooltip: {
	  trigger: "axis",
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
	legend: {
	  top:"top"
	},
	dataZoom: [
		{
		  type: 'inside', // 啟用滾輪縮放
		  start: 0,  // 初始顯示的起始位置（百分比）
		  end: 100   // 初始顯示的結束位置（百分比）
		}
	],
	xAxis: [
	  {
		  type: "category",
		  //   axisTick: { show: false },
		  data: [],
		  boundaryGap:false,
		  axisPointer: {
			  shadowStyle: {
				  color: "rgba(0, 0, 0, 0.08)", // 自定義陰影顏色
			  },
			  lineStyle: {
				  width:2
			  },
		  },
	  },
	],
	yAxis: [
	  {
		  type: "value"
	  },
	],
	series: [],
};

// 文檔加載完後執行
$(document).ready(async function () {
	initDateRangePicker(); // 初始化日期選擇器
	initEventTrigger(); //初始化按鈕事件
	await refresh(); // 初始化图表

	// setInterval(()=>{
	// 	refresh()
	// },30000)
});

// 更新資料
async function refresh() {
	myChart.showLoading()
	let gridData = await fetchData();
	let chartData = dataProcessing(gridData, category)

	updateChart(myChart, chartData);
	updateTable(gridData);
	$("#chartType").trigger("change")
	myChart.hideLoading()
	$(".updateTime").text(`資料時間: ${moment().format("YYYY-MM-DD hh:mm:ss")}`)
}

// 從API取得數據
async function fetchData() {
	// 查詢條件
	let conditions = {
		TABLE_NAME: "GET_GAS_CHART_DATA",
		VALUE: getTimeRangeOptions(),
		CON: {
			Field: [],
			Oper: [],
			Value: []
		}
	}

	const response = await getFunctionGridData('366647515707003', conditions)
	const gridData = response.Grid_Data
	return gridData
}
// 處理資料
function dataProcessing(gridData, category){
	const fields = Object.keys(gridData[0]).filter(key => key !== category);
	const colors = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40",
					"#D83F87","#00B3A9","#2E97FF","#EAC435","#6A4C93","#EF6C00",];

	let chartData = {
		xAxisData:gridData.map(row => row[category]),
		seriesData:fields.map((field, index) => {
			return {
				name: field, // 設定系列名稱
				type: currentType,
				stack: isStacked,
				smooth: true,
				barGap: 0,
				emphasis: {
					focus: "series",
				},
				itemStyle: {
					color: colors[index % colors.length], // 設置顏色
				},
				areaStyle: {
					color: colors[index % colors.length], // 設置區域顏色，可以和 line 顏色一致
					opacity: 0.3, // 調整區域透明度
				},
				data: gridData.map(row => row[field]), // 提取該欄位的數據
			};
		})
	}

	return chartData
}
// 更新圖表
function updateChart(myChart, chartData){
	option.xAxis[0].data = chartData.xAxisData
	option.series = chartData.seriesData

	myChart.setOption(option);
}

// 更新表格
function updateTable(gridData) {
	const table = $("#gridTable");
	table.empty();
  
	// 動態生成表格標題
	const columns = Object.keys(gridData[0]); //取得所有欄位名
	const header = `
		<thead>
			${columns.map((column)=>`<th scope="col">${column}</th>`)}
		</thead>
	`
	const body = `
		<tbody>
			${gridData.map((row)=>`
				<tr>
					${columns.map((column)=>`<td>${row[column]}</td>`)}
				</tr>
			`)}
		</tbody>
	`

	table.append(header)
	table.append(body)
}

// 初始化日期選擇器
function initDateRangePicker() {
	// 計算過去30天的日期
	// var startDate = moment().subtract(3, "days"); // 預設3天前
	// var endDate = moment(); // 當前日期
	var startDate = '2024/12/09'
	var endDate = '2024/12/12'

	$("#dateRange").daterangepicker({
		timePicker: true, //是否可選時間
		timePicker24Hour: true, //24小時制
		timePickerIncrement: 60, //只能選"時"
		alwaysShowCalendars: true,
		showDropdowns: true,
		linkedCalendars: false,

		startDate: startDate,
		endDate: endDate,
		// minDate:'2024-01-01',
		maxDate: moment(),
		locale: {
			format: "YYYY/MM/DD HH:00",
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
			"今天": [moment(), moment()],
			"昨天": [moment().subtract(1, "days"), moment().subtract(1, "days")],
			"過去 7 天": [moment().subtract(6, "days"), moment()],
			"過去 30 天": [moment().subtract(29, "days"), moment()],
			"本月": [moment().startOf("month"), moment().endOf("month")],
			"上個月": [
				moment().subtract(1, "month").startOf("month"),
				moment().subtract(1, "month").endOf("month"),
			],
		}

	});
}

function getTimeRangeOptions(){
	let timePeriod = $("#timePeriod").val()
	let dateRange = $("#dateRange").val()
	let S_TIME,E_TIME
	
	switch(timePeriod){
		case "hr":
		case "day":
			S_TIME = dateRange.split(" - ")[0];
			E_TIME = dateRange.split(" - ")[1];
			break;
		case "month":
			// 使用 moment 處理日期範圍
			let startMonth = moment(dateRange.split(" - ")[0], "YYYY/MM");
			let endMonth = moment(dateRange.split(" - ")[1], "YYYY/MM");
			// 計算區間的開始和結束時間
			S_TIME = startMonth.startOf('month').format("YYYY/MM/DD HH:mm");
			E_TIME = endMonth.endOf('month').format("YYYY/MM/DD HH:mm");
			break;
	}

	return [S_TIME,E_TIME,timePeriod]
}
function initEventTrigger(){
	// RWD響應尺寸
	$(window).on('resize', function () {
		// RWD
		if ($(window).width() < 992) {
			option.grid.top = '0%';
			option.grid.bottom = '15%';
			option.legend.top = "bottom"
		} else {
			option.grid.top = '10%';
			option.grid.bottom = '0%';
			option.legend.top = "top"
		}
		// 使用 ECharts 实例重新设置配置项
		myChart.setOption(option);
		myChart.resize();
	});
	$(window).trigger('resize')

	// 切換圖表類型
	$("#chartType").change((event)=>{
		currentType = event.target.value
		// 將資料集type設為對應類型
		option.series.forEach((dataSet)=>{
			dataSet.type = currentType
		})
		// 設定左右邊界
		switch(currentType){
			case "line":
				option.xAxis[0].boundaryGap = false
				option.xAxis[0].axisPointer.type = "line"
				break;
			case "bar":
				option.xAxis[0].boundaryGap = true
				option.xAxis[0].axisPointer.type = "shadow"
				break;
		}

		myChart.setOption(option);
	})
	// 切換是否堆疊
	$("#isStackBtn").click(()=>{
		isStacked = isStacked ? null : "total"
		option.series.forEach((dataSet)=>{
			dataSet.stack = isStacked
			dataSet.areaStyle.opacity = isStacked ? 0.3 : 0
		})
		myChart.setOption(option);
	})

	// 選擇時間
	$("#timePeriod, #dateRange").change(()=>refresh())
	$("#timePeriod").change(function(){
		let pickerConfig = $("#dateRange").data("daterangepicker")
		switch(this.value){
			case "hr":
				pickerConfig.timePicker = true
				pickerConfig.locale.format = "YYYY/MM/DD HH:00"
				break;
			case "day":
				pickerConfig.timePicker = false
				pickerConfig.locale.format = "YYYY/MM/DD HH:mm"
				break;
			case "month":
				pickerConfig.timePicker = false
				pickerConfig.locale.format = "YYYY/MM"
				break;
		}
		$("#dateRange").daterangepicker(pickerConfig)
	})

	// 下載功能
	$("#downloadImageBtn").click(()=>downloadImage())
	$("#downloadXlsxBtn").click(()=>downloadXlsx())

	// 切換 圖表/表格
	$(".switchBtn").on("click", function () {
		$(".switchBtn").removeClass("selected");
		$(this).addClass("selected");
		myChart.resize();
	});
}

function downloadImage() {
	const chart = echarts.getInstanceByDom($("#chartWrapper")[0]);

	const url = chart.getDataURL({
		type: 'png', // 圖片格式
		pixelRatio: 2, // 圖片解析度
		backgroundColor: '#fff', // 背景顏色
	});

	// 創建一個隱藏的 a 標籤
	const link = document.createElement('a');
	link.href = url;
	link.download = 'chart.png'; // 圖片名稱
	link.click();
}
function downloadXlsx() {
	// 取得表格元素
	const table = document.getElementById('gridTable');
	
	// 將表格轉換為工作簿物件
	const wb = XLSX.utils.table_to_book(table, { raw: true });

	// 遍歷所有的工作表並設定數字格式
	Object.keys(wb.Sheets).forEach(sheetName => {
	  const ws = wb.Sheets[sheetName];
	  Object.keys(ws).forEach(cellAddress => {
		if (ws[cellAddress].t === 's' && !isNaN(ws[cellAddress].v)) {
		  // 如果儲存格是字串類型且內容是數字，轉為數字格式
		  ws[cellAddress].t = 'n';
		  ws[cellAddress].v = parseFloat(ws[cellAddress].v);
		}
	  });
	});

	// 將工作簿保存為檔案
	XLSX.writeFile(wb, 'table_export.xlsx');
}