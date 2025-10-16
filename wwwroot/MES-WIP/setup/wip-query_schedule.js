var selectedId = null;
var SHIFT_DAY = null;
var OPERATION = null;
var originalTableData = null;

var currentPage = 1;  // 目前頁碼
var perPage = 20;     // 每頁筆數，預設 20
var totalPages = 1;   // 總頁數

$(document).ready(async function () {
    var Request = {};
    var getUrlParameter = function getUrlParameter() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        var par = {};
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            par[sParameterName[0]] = decodeURIComponent(sParameterName[1] || '');
        }
        return par;
    };

    Request = getUrlParameter();
    var SID = '386441309640341';
    OPERATION = Request["OPERATION"] || '';
    SHIFT_DAY = Request["SHIFT_DAY"] || '';

    var MODULE_TYPE = Request["MODULE_TYPE"] || null;
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;

    let backButton = document.getElementById("backButton");

    backButton.addEventListener("click", function () {
        GoBack(MODULE_TYPE, LEVEL, MODULE_NAME, BUTTON);
    });

    let tabledata = await getGridData(SID);
    originalTableData = tabledata;

    // 初始化分頁控制元件事件
    $('#perPData').val(perPage).change(onPerPageChange);
    $('#PrePage').click(onPrePageClick);
    $('#NexPage').click(onNextPageClick);
    $('#PageNum').val(currentPage).change(onPageNumChange);

    buildQueryFields();

    // 初始載入，先執行過濾+分頁顯示
    refreshTable();

    $('#QuerySave').click(function () {
        currentPage = 1; // 查詢後回到第 1 頁
        refreshTable();
        $('#Query').modal('hide');
    });

    $('#Queryclean').click(function () {
        clearQueryFields();
        currentPage = 1; // 清除後也回到第 1 頁
        refreshTable();
        $('#Query').modal('hide');
    });

    $('#EditData').click(function () {
        if (!selectedId) {
            alert("Please select a record first!");
            return;
        }
        const url = window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME + "/" + kanbanRoute + "/MES-WIP/OPI/schedule/wo-schedule.html?WIP_OPI_WDOEACICO_HIST_SID=" + encodeURIComponent(selectedId) + "&DEPT_NO=" + encodeURIComponent(OPERATION) + "&SHIFT_DAY=" + encodeURIComponent(SHIFT_DAY);
        window.location.href = url;
    });
});

// 重新整理表格並同步分頁資訊
function refreshTable() {
    let filteredData = filterData(originalTableData.Grid_Data);

    // 計算總頁數
    totalPages = Math.max(1, Math.ceil(filteredData.length / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    // 取出本頁要顯示的資料範圍
    const startIndex = (currentPage - 1) * perPage;
    const pageData = filteredData.slice(startIndex, startIndex + perPage);

    // 設定表格資料
    SetGrid({ Grid_Data: pageData });

    // 更新分頁控件狀態
    $('#PageNum').val(currentPage);
    $('#totalnum').text(`Total ${filteredData.length} entries across ${totalPages} pages`);
    $('#PrePage').prop('disabled', currentPage === 1);
    $('#NexPage').prop('disabled', currentPage === totalPages);
}

// 每頁顯示筆數改變事件
function onPerPageChange() {
    perPage = parseInt($(this).val()) || 20;
    currentPage = 1; // 每頁筆數變動，頁碼回第一頁
    refreshTable();
}

// 點上一頁按鈕
function onPrePageClick() {
    if (currentPage > 1) {
        currentPage--;
        refreshTable();
    }
}

// 點下一頁按鈕
function onNextPageClick() {
    if (currentPage < totalPages) {
        currentPage++;
        refreshTable();
    }
}

// 輸入頁碼跳轉事件
function onPageNumChange() {
    let inputPage = parseInt($(this).val());
    if (isNaN(inputPage) || inputPage < 1) inputPage = 1;
    else if (inputPage > totalPages) inputPage = totalPages;

    currentPage = inputPage;
    refreshTable();
}

function SetGrid(tabledata) {
    const rawData = tabledata.Grid_Data || [];

    const dataSet = rawData.map(item => ({
        TIME: `${formatDate(item.CHECK_IN_TIME)}<br>${formatTime(item.CHECK_IN_TIME)} ~ ${formatTime(item.CHECK_OUT_TIME)}`,
        EQP: `${item.EQP_NO || ''}<br>${item.OPERATION || ''}<br>${item.WO || ''}`,
        PART_NO: `${item.PART_NO || ''}<br>${item.PART_SPEC || ''}`,
        TOL: `${item.TOL_NO || ''}<br>${item.SCHEDULE_CUR_CAV || ''}/${item.SCHEDULE_CYCLE_TIME || ''}(s)<br>${item.OPI_CAV || ''}`,
        TARGET: `${item.TARGET_SHOT || ''}/${item.TARGET_PCS || ''}`,
        QTY: (item.OK_QTY || item.NG_QTY) ? `${item.OK_QTY || 0}/${item.NG_QTY || 0}` : '0/0',
        SHIFT_DAY: formatDate(item.SHIFT_DAY) || '',
        COMMENT: item.COMMENT || '',
        SID: item.WIP_OPI_WDOEACICO_HIST_SID || '',
        COMPLETED: item.WIP_OPI_WDOEACICO_HIST_SID.toString() === '387139981913686'
            ? 'Y<br>2025-08-07 17:00:00'
            : 'N<br>Not Reported',
    }));

    if ($.fn.DataTable.isDataTable('#example')) {
        $('#example').DataTable().clear().destroy();
    }

    const table = $('#example').DataTable({
        data: dataSet,
        columns: [
            { title: "SCHEDULE_DATE", data: "TIME" },
            { title: "EQP_NO<br>OPERATION<br>WO", data: "EQP" },
            { title: "OK_QTY/NG_QTY", data: "QTY" },
            { title: "ITEM NO<br>SPEC", data: "PART_NO" },
            { title: "TOL_NO<br>SCHEDULE_CAV/CYCLE_TIME<br>OPI_CAV", data: "TOL" },   // 標題換行
            { title: "TARGET SHOT/PCS", data: "TARGET" },
            { title: "COMPLETED<br>COMPLETED_TIME", data: "COMPLETED" },
            { title: "SHIFT DAY", data: "SHIFT_DAY" },
            { title: "COMMENT", data: "COMMENT" }

        ],

        searching: false,
        paging: false,
        info: false,
        ordering: false,
        lengthChange: false
    });

    $('#example tbody').off('click').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selectedId = null;
        } else {
            table.$('tr.selected').removeClass('selected');
            $(this).addClass('selected');
            const data = table.row(this).data();
            selectedId = data.SID;
        }
    });
}

function formatDate(datetimeStr) {
    if (!datetimeStr) return '';
    const date = new Date(datetimeStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatTime(datetimeStr) {
    if (!datetimeStr) return '';
    const date = new Date(datetimeStr);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

function buildQueryFields() {
    const fields = [
        { key: 'EQP_NO', label: 'EQP_NO' },
        { key: 'OPERATION', label: 'OPERATION' },
        { key: 'SHIFT_DAY', label: 'SHIFT_DAY' }
    ];

    let html = '';
    fields.forEach(f => {
        let defaultValue = '';
        if (f.key === 'OPERATION') defaultValue = OPERATION;
        if (f.key === 'SHIFT_DAY') defaultValue = SHIFT_DAY;

        html += `
            <div style="display:flex; align-items:center; margin-bottom:8px;">
                <label style="width:150px; font-weight:bold; color: black;">${f.label}</label>
                <input type="text" class="form-control query-input" data-key="${f.key}" value="${defaultValue}">
            </div>
        `;
    });

    $('#QueryContent').html(html);
}

function clearQueryFields() {
    $('#QueryContent .query-input').val('');
}

function filterData(data) {
    let filters = {};
    $('#QueryContent .query-input').each(function () {
        const key = $(this).data('key');
        const val = $(this).val().trim();
        if (val) filters[key] = val.toLowerCase();
    });
    if (Object.keys(filters).length === 0) return data;

    return data.filter(item => {
        return Object.entries(filters).every(([k, v]) => {
            let value = item[k] || '';
            if (k === 'SHIFT_DAY') value = formatDate(value);
            return value.toString().toLowerCase().includes(v);
        });
    });
}
