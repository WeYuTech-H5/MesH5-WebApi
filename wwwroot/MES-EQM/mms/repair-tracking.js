// url網址取參數
const urlParams = new URLSearchParams(window.location.search);
const MODULE_TYPE = urlParams.get('MODULE_TYPE');
const MODULE_NAME = urlParams.get('MODULE_NAME');
const LEVEL = urlParams.get('LEVEL');
const BUTTON = urlParams.get('BUTTON');
const TYPE = urlParams.get('TYPE');
const REPAIR_TYPE = urlParams.get('REPAIR_TYPE');

$(document).ready(function () {
	switch(REPAIR_TYPE){
		case 'EQP':
			$("#repairType").text('機台')
			// 修改主題顏色
			$('html').css('--title-color', '#0ea5e8');
			$('html').css('--th-bg-color', '#dbeaff');
			$('html').css('--th-text-color', '#1c3465');
			$('html').css('--btn-color', '#2550b5');
			$('html').css('--btn-hover-color', '#152f6b');
			break;
		case 'QUALITY':
			$("#repairType").text('品質')
			// 修改主題顏色
			$('html').css('--title-color', '#e8a70e');
			$('html').css('--th-bg-color', '#ffefdb');
			$('html').css('--th-text-color', '#65381c');
			$('html').css('--btn-color', '#f28900');
			$('html').css('--btn-hover-color', '#d38416');
			break;
	}

	// 示例數據
	const inspections = [
		{ id: 1, caseNO: 'case 1', factory: '廠區一', machine: '機台05', reasonCode: '原因A', reportTime: '2023-10-02T11:45', priority: '高' },
		{ id: 2, caseNO: 'case 2', factory: '廠區一', machine: '機台08', reasonCode: '原因B', reportTime: '2023-10-02T14:30', priority: '低' },
		{ id: 3, caseNO: 'case 3', factory: '廠區二', machine: '機台03', reasonCode: '原因C', reportTime: '2023-10-02T09:00', priority: '中' },
		{ id: 4, caseNO: 'case 4', factory: '廠區二', machine: '機台07', reasonCode: '原因D', reportTime: '2023-10-03T13:20', priority: '高' },
		{ id: 5, caseNO: 'case 5', factory: '廠區一', machine: '機台01', reasonCode: '原因E', reportTime: '2023-10-03T15:45', priority: '低' },
		{ id: 6, caseNO: 'case 6', factory: '廠區一', machine: '機台10', reasonCode: '原因F', reportTime: '2023-10-04T08:30', priority: '中' },
		{ id: 7, caseNO: 'case 7', factory: '廠區二', machine: '機台04', reasonCode: '原因G', reportTime: '2023-10-04T10:15', priority: '高' },
		{ id: 8, caseNO: 'case 8', factory: '廠區一', machine: '機台06', reasonCode: '原因H', reportTime: '2023-10-05T12:40', priority: '中' },
		{ id: 9, caseNO: 'case 9', factory: '廠區二', machine: '機台02', reasonCode: '原因I', reportTime: '2023-10-05T16:00', priority: '低' },
		{ id: 10, caseNO: 'case 10', factory: '廠區一', machine: '機台09', reasonCode: '原因J', reportTime: '2023-10-06T18:20', priority: '高' },
		{ id: 11, caseNO: 'case 11', factory: '廠區二', machine: '機台07', reasonCode: '原因K', reportTime: '2023-10-06T07:30', priority: '低' },
		{ id: 12, caseNO: 'case 12', factory: '廠區二', machine: '機台03', reasonCode: '原因L', reportTime: '2023-10-07T11:50', priority: '中' },
		{ id: 13, caseNO: 'case 13', factory: '廠區一', machine: '機台08', reasonCode: '原因M', reportTime: '2023-10-07T14:10', priority: '高' },
		{ id: 14, caseNO: 'case 14', factory: '廠區一', machine: '機台02', reasonCode: '原因N', reportTime: '2023-10-08T10:45', priority: '中' },
		{ id: 15, caseNO: 'case 15', factory: '廠區二', machine: '機台05', reasonCode: '原因O', reportTime: '2023-10-08T17:30', priority: '低' },
		{ id: 16, caseNO: 'case 16', factory: '廠區二', machine: '機台06', reasonCode: '原因P', reportTime: '2023-10-09T09:00', priority: '高' },
		{ id: 17, caseNO: 'case 17', factory: '廠區二', machine: '機台01', reasonCode: '原因Q', reportTime: '2023-10-09T13:30', priority: '低' },
		{ id: 18, caseNO: 'case 18', factory: '廠區一', machine: '機台09', reasonCode: '原因R', reportTime: '2023-10-10T16:45', priority: '中' },
		{ id: 19, caseNO: 'case 19', factory: '廠區二', machine: '機台04', reasonCode: '原因S', reportTime: '2023-10-10T08:20', priority: '高' },
		{ id: 20, caseNO: 'case 20', factory: '廠區二', machine: '機台07', reasonCode: '原因T', reportTime: '2023-10-11T10:50', priority: '中' },
		{ id: 21, caseNO: 'case 21', factory: '廠區二', machine: '機台03', reasonCode: '原因U', reportTime: '2023-10-11T15:30', priority: '低' },
		{ id: 22, caseNO: 'case 22', factory: '廠區一', machine: '機台06', reasonCode: '原因V', reportTime: '2023-10-12T09:45', priority: '高' },
		{ id: 23, caseNO: 'case 23', factory: '廠區一', machine: '機台05', reasonCode: '原因W', reportTime: '2023-10-12T18:30', priority: '中' },
		{ id: 24, caseNO: 'case 24', factory: '廠區二', machine: '機台02', reasonCode: '原因X', reportTime: '2023-10-13T13:10', priority: '低' },
		{ id: 25, caseNO: 'case 25', factory: '廠區二', machine: '機台09', reasonCode: '原因Y', reportTime: '2023-10-13T07:30', priority: '高' },
		{ id: 26, caseNO: 'case 26', factory: '廠區二', machine: '機台01', reasonCode: '原因Z', reportTime: '2023-10-14T11:20', priority: '低' },
		{ id: 27, caseNO: 'case 27', factory: '廠區一', machine: '機台08', reasonCode: '原因AA', reportTime: '2023-10-14T16:15', priority: '中' },
		{ id: 28, caseNO: 'case 28', factory: '廠區二', machine: '機台07', reasonCode: '原因BB', reportTime: '2023-10-15T09:30', priority: '高' },
		{ id: 29, caseNO: 'case 29', factory: '廠區二', machine: '機台04', reasonCode: '原因CC', reportTime: '2023-10-15T14:50', priority: '低' },
		{ id: 30, caseNO: 'case 30', factory: '廠區一', machine: '機台03', reasonCode: '原因DD', reportTime: '2023-10-16T12:00', priority: '中' }
	];
	
	// 排序優先級
	const priorityOrder = { '高': 1, '中': 2, '低': 3 };
	// 依據優先序和通報時間排序
	inspections.sort((a, b) => {
		if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
		// 優先序由高到低排序
		return priorityOrder[a.priority] - priorityOrder[b.priority];
		}
		// 若優先序相同，依通報時間由早到晚排序
		return new Date(a.reportTime) - new Date(b.reportTime);
	});
	// 動態生成檢修清單項目
	function renderInspectionList() {
		$('#inspectionList').empty();
		inspections.forEach(inspection => {
		$('#inspectionList').append(`
			<tr>
				<td>${inspection.caseNO}</td>
				<td>${inspection.factory}</td>
				<td>${inspection.machine}</td>
				<td>${inspection.reasonCode}</td>
				<td>${inspection.reportTime}</td>
				<td>${inspection.priority}</td>
				<td class="text-end">
					<button class="c-btn viewDetailBtn" data-case-number="${inspection.caseNO}" data-id="${inspection.id}">檢修</button>
				</td>
			</tr>
		`);
		});
	}

	// 初始化列表
	renderInspectionList();
	initDataTable()
	initEventHandlers()
	initDateRangePicker()

});


// 初始化日期選擇器
function initDateRangePicker() {
	$("#dateRange").daterangepicker({
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
			"今天": [moment(), moment()],
			"昨天": [moment().subtract(1, "days"), moment().subtract(1, "days")],
			"過去 7 天": [moment().subtract(6, "days"), moment()],
			"過去 30 天": [moment().subtract(29, "days"), moment()],
			"本月": [moment().startOf("month"), moment().endOf("month")],
			"上個月": [
				moment().subtract(1, "month").startOf("month"),
				moment().subtract(1, "month").endOf("month"),
			],
		},
		alwaysShowCalendars: true,
	});
}

// 初始化表格
function initDataTable(){
	$('#listTable').DataTable({
        dom:'rtilp',
		pagingType: "full_numbers", // 可選的值包括 "simple", "simple_numbers", "full", "full_numbers"
		columnDefs: [
			{ "orderable": false, "targets": -1 } // -1 代表最後一個欄位
		],
		drawCallback: function(){
			initDetailButton()
        },
		language: {
			"paginate": {
				"first": '<i class="fas fa-angle-double-left"></i>',  // 雙左箭頭代表首頁
				"previous": '<i class="fas fa-chevron-left"></i>',     // 單左箭頭代表上一頁
				"next": '<i class="fas fa-chevron-right"></i>',        // 單右箭頭代表下一頁
				"last": '<i class="fas fa-angle-double-right"></i>'    // 雙右箭頭代表末頁
			},
			"sProcessing": "處理中...",
            "sLengthMenu": "每頁顯示 _MENU_ 項結果",
            "sZeroRecords": "沒有匹配結果",
            "sInfo": "顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
            "sInfoEmpty": "顯示第 0 至 0 項結果，共 0 項",
            "sInfoFiltered": "(由 _MAX_ 項結果過濾)",
            "sInfoPostFix": "",
            "sSearch": "搜尋:",
            "sUrl": "",
            "sEmptyTable": "表中資料為空",
            "sLoadingRecords": "載入中...",
            "sInfoThousands": ",",
            "oAria": {
                "sSortAscending": ": 以升序排列此列",
                "sSortDescending": ": 以降序排列此列"
            }
		}
    });
	
	function initDetailButton(){
		// 點擊檢修按鈕，切換到維修紀錄回報表單
		$(".viewDetailBtn").on("click", function () {
			$("#inspectionListPage").hide();
			$("#repairReportPage").show();
			// 取得通報紀錄的ID，進行後續操作（例如填入資料或顯示紀錄）
			const recordId = $(this).data("id");
			console.log("選擇的通報紀錄ID:", recordId);
			const caseNumber = $(this).data("case-number");
			$("#caseNumber").text(caseNumber)
		});
	}

}

// 初始化按鈕事件
function initEventHandlers(){
	// 1.點擊返回清單列表按鈕，切換回尚未檢修的清單列表
	$("#backToList").on("click", function () {
		$("#repairForm")[0].reset(); // 清空表單
		$("#repairReportPage").hide();
		$("#inspectionListPage").show();
	});

	// 2.提交維修表單
	$("#repairForm").on("submit", async function (event) {
		event.preventDefault();
		await customAlertSuccess("維修紀錄已提交！");
		$("#repairForm")[0].reset();
		$("#repairReportPage").hide();
		$("#inspectionListPage").show();
	});

	// 3.返回上一頁
	$("#backButton").on("click", function () {
		GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON)
	});
}