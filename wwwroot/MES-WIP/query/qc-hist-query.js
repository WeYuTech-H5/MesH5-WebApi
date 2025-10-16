// URL取參
var currentURL = new URL(window.location.href);
var URLparams = new URLSearchParams(currentURL.search);
var MODULE_TYPE = URLparams.get('MODULE_TYPE');
var LEVEL = URLparams.get('LEVEL');
var MODULE_NAME = URLparams.get('MODULE_NAME');
var BUTTON = URLparams.get('BUTTON');
var QC_INSPECTION_PLAN_SID = URLparams.get('QC_INSPECTION_PLAN_SID');
var QC_INSPECTION_ORDER_SID = URLparams.get('QC_INSPECTION_ORDER_SID');
var ORDER_NAME = URLparams.get('ORDER_NAME');

var table;

//上一頁
$("#backButton").click(()=>{
    GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
})
//匯出功能
$("#ExportExcel").click(function () {
    // 获取第一行header
    var headers1 = [];
    $('#example thead tr:eq(0) th').each(function() {
        headers1.push($(this).text().trim());
    });

    // 获取第二行header
    var headers2 = ['','']; //從第三列開始
    $('#example thead tr:eq(1) th').each(function() {
        headers2.push($(this).text().trim());
    });

    var data = table.rows().data().toArray();
    var worksheet = XLSX.utils.aoa_to_sheet([headers1,headers2, ...data]);

    var range = XLSX.utils.decode_range(worksheet['!ref']);
    for (var R = range.s.r + 2; R <= range.e.r; ++R) {
        for (var C = range.s.c; C <= range.e.c; ++C) {
            var cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell && !isNaN(cell.v)) {
                cell.t = 'n'; // Set cell type to number
                cell.z = '0.00'; // Optional: set cell format to two decimal places
            }
        }
    }

    var workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, ORDER_NAME + '.xlsx');
});
async function fetchData() {
    try {
        let qcHistData = await getQcHist();
        let masterData = await getGridDataQcMaster();
        masterData.sort((a, b) => parseInt(a.TIME) - parseInt(b.TIME)); //確保時間排序正確

        setTitle(qcHistData) // 填入Title => 日期/計畫/單號
        insertTableHtml(qcHistData,masterData) //填入表格資料
        setDataTable() //設置DataTable
    } catch (error) {
        console.error("获取数据时出错：", error);
    }
}
fetchData();

async function getQcHist() {
    return new Promise((resolve, reject) => {
        let body = {
            "QC_INSPECTION_PLAN_SID": QC_INSPECTION_PLAN_SID,
            "QC_INSPECTION_ORDER_SID": QC_INSPECTION_ORDER_SID
        };
        
        // 将查询参数转换为 URL query string 格式
        let queryString = $.param(body);
        
        $.ajax({
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/QCInspectOrderName?' + queryString,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey'), // 替换为你的自定义Header
            },
            success: function(response) {
                if (response.result) {
                    resolve(response.data); // 解析数据
                } else {
                    reject(new Error('Error: result is false'));
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                reject(new Error('Error: ' + textStatus + ' - ' + errorThrown)); // 拒绝并传递错误
            }
        });
    });
}
async function getGridDataQcMaster() {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';
  
    // 定义要传递的参数对象
    let params = {
        SID: '352745197556596', // V_QC_INSPECTION_MASTER_HIST_QUERY
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
    };
  
    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛
        Field: ["QC_INSPECTION_ORDER_SID"],
        Oper: ["="],
        Value: [QC_INSPECTION_ORDER_SID]
    };
  
    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
        // 可以添加其他必要的请求头信息
    });
  
    // 构建请求体
    let requestBody = JSON.stringify(conditions);
  
    // 构建请求配置
    let requestOptions = {
        method: 'POST', // 将请求方法设置为 "POST"
        headers: headers,
        body: requestBody // 将条件参数放入请求体
    };
  
    try {
        // 发送请求并等待响应
        let response = await fetch(getGridURL, requestOptions);
  
        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取Grid数据成功:", data);
            if(data.result){
                return data.Grid_Data;
            }
            else{
                Set_Clean();
            }
        } else {
             throw new Error('获取Grid数据失败，状态码：' + response.status);
            
        }
    } catch (error) {
        console.error(error);
    }
}

function insertTableHtml(qcHistData,masterData){
    //thead
    //動態長時間段
    let timePeriod = Object.keys(qcHistData[0]).filter(column => !isNaN(parseFloat(column)) && isFinite(column))
    let timePeriodTitleTop = timePeriod.map((time,index) => {
        let ontimeMarker = '';
        switch(masterData[index].ONTIME_FLAG){
            case 'Y':
                ontimeMarker = `<img src="../img/weyu/clock-green.png" title="${masterData[index].EDIT_TIME}">`
                break;
            case 'N':
                ontimeMarker = `<img src="../img/weyu/clock-red.png" title="${masterData[index].EDIT_TIME}">`
                break;
        }

        return `<th class="text-center">
                    ${time}:00
                    ${ontimeMarker}
                </th>`
    }).join('');
    //巡檢人&檢驗結果
    let timePeriodTitleBottom = masterData.map(master => {
        let result = master.RESULTS === 'Y'
        ? '<span style="color:#74d669">OK</span>'
        : master.EDIT_USER && master.RESULTS === 'N'
        ? '<span style="color:#fb3403">NG</span>'
        : '';
        return `<th class="text-center">${master.EDIT_USER||''} / ${result}</th>`
    }).join('');

    let theadHtml = `
        <thead>
            <tr>
                <th rowspan="2">DC_ITEM_NAME</th>
                <th rowspan="2">USL</th>
                <th rowspan="2">TARGET</th>
                <th rowspan="2">LSL</th>
                <th rowspan="2">SAMPLE_SIZE</th>
                ${timePeriodTitleTop}
            </tr>
            <tr>
                ${timePeriodTitleBottom}
            </tr>
        </thead>
    `
    $("#example").append(theadHtml)

    //tbody
    let rowsHtml,timePeriodRows
    qcHistData.forEach(rowData=>{
        timePeriodRows = timePeriod.map(time =>{
            if(!rowData[time]){
                return `<td></td>`
            }else if(rowData[time] > rowData.USL||rowData[time] < rowData.LSL){
                return `<td class="text-center" style="font-weight:bold;color:red">${rowData[time]}</td>`
            }else{
                return `<td class="text-center">${rowData[time]}</td>`
            }
        }).join('');
        rowsHtml += `
            <tr>
                <td>${rowData.DC_ITEM_NAME}</td>
                <td>${rowData.USL}</td>
                <td>${rowData.TARGET}</td>
                <td>${rowData.LSL}</td>
                <td>${rowData.SAMPLE_SIZE}</td>
                ${timePeriodRows}
            </tr>
        `
    })

    let tbodyHtml = `<tbody>${rowsHtml}</tbody>`
    $("#example").append(tbodyHtml)
}

function setDataTable(){
    table = $('#example').DataTable({
        dom: 'frt',  // 只顯示表格，不顯示分頁&長度
        "lengthMenu": [20], //預設每頁20筆
        "ordering": false,
        "searching": false,
    });
    // 初始化总页数和总条目数
    updatePageInfo();

    // 每页显示条数的下拉菜单事件
    $('#perPData').change(function() {
        var length = $(this).val();
        table.page.len(length).draw();
        updatePageInfo();
    });

    // 上一页按钮事件
    $('#PrePage').click(function() {
        table.page('previous').draw('page');
        updatePageInfo();
    });

    // 下一页按钮事件
    $('#NexPage').click(function() {
        table.page('next').draw('page');
        updatePageInfo();
    });

    // 页码输入框事件
    $('#PageNum').change(function() {
        var page = $(this).val() - 1;  // 页码从0开始
        table.page(page).draw('page');
        updatePageInfo();
    });
}

// 更新分页信息
function updatePageInfo() {
    var info = table.page.info();
    $('#PageNum').val(info.page + 1);
    $('#totalnum').text(info.pages + ' pages (' + info.recordsTotal + ' entries)');
    $('#PrePage').prop('disabled', info.page === 0);
    $('#NexPage').prop('disabled', info.page === info.pages - 1);
}

function setTitle(qcHistData){
    let date = qcHistData[0].DATE
    let planName = qcHistData[0].INSPECTION_NAME
    $("#date").text(date)
    $("#plan-name").text(planName)
    $("#order-number").text(ORDER_NAME)
}