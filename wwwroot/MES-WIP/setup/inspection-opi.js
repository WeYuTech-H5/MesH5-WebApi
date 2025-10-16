let gridInfo;
let gridInfoSID = "339787260876215"; // V_QC_INSPECTION_ORDER

let tableData;

$(document).ready(function () {
    var Request = {};
    var getUrlParameter = function getUrlParameter() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        var par = {};
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            par[sParameterName[0]] = decodeURI(sParameterName[1])
        }
        return par;
    };
    Request = getUrlParameter();
    var QC_INSPECTION_ORDER_SID = Request["QC_INSPECTION_ORDER_SID"] || null;
    //backUrl參數
    var MODULE_TYPE = Request["MODULE_TYPE"] || null;
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;

    async function fetchData() {
        tableData = await getTableData()
        gridInfo = await getGridDataOPI(gridInfoSID);
        gridInfo = gridInfo.Grid_Data

        // 長出單號標題&圖片
        $("#planName").html(gridInfo[0].INSPECTION_NAME + ' / ' + gridInfo[0].ORDER_NAME + ' / ' + gridInfo[0].INSPECTION_DATE.split('T')[0])
        try{
            let src = gridInfo[0].IMAGE_URL.match(/Content\\.*$/);
            // $("#planImage").attr("src",`${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`)
            $("#planImage").attr("src",`${window.location.protocol}//${default_ip}/${default_Api_Name}/${src[0]}`)
        }catch{
            console.log("No Image")
        }

        // 取得巡檢項目、資料類型&上下限
        let itemConfig = {};
        tableData.detail.forEach(function(item){
            let inputType = (item["DATA_TYPE"] === ('DECIMAL'||'INT')) ? 'number' : (item["DATA_TYPE"] === 'BOOLEAN') ? 'checkbox' : 'text';
            let usl = item["USL"] || '-';
            // let ucl = item["UCL"] || '-';
            let target = item["TARGET"] || '-';
            // let lcl = item["LCL"] || '-';
            let lsl = item["LSL"] || '-';
            // itemConfig[item.DC_ITEM_NAME]= [inputType, usl, ucl, target, lcl, lsl];
            itemConfig[item.DC_ITEM_NAME]= [inputType, usl, target, lsl];
        })

        // 創建表格元素
        var table = $("<table>").attr({
            id: "inspectionForm",
            class: "display",
            cellspacing: "0",
            width: "100%"
        });
        
        // 創建header 開始
        var thead = $("<thead>");
        var headerRow_top = $("<tr>");
        var headerRow_button = $("<tr>");
        
        headerRow_top.append("<th>Time</th>");
        // headerRow_button.append("<th>USL/UCL/Target/LCL/LSL</th>");
        headerRow_button.append("<th>USL/Target/LSL</th>");
        //長出不重複的巡檢項目&規格
        Object.keys(itemConfig).forEach(item => {
            //上半部
            var th_top = $("<th>").text(item);
            headerRow_top.append(th_top);
            //下半部(規格上下限)
            // var spc = `${itemConfig[item][1]}/${itemConfig[item][2]}/${itemConfig[item][3]}/${itemConfig[item][4]}/${itemConfig[item][5]}`
            var spc = `${itemConfig[item][1]}/${itemConfig[item][2]}/${itemConfig[item][3]}`
            var th_button = $("<th>").text(spc);
            headerRow_button.append(th_button);
        });

        //長出後巡檢項目外的部分
        headerRow_top.append("<th>result</th>");
        headerRow_button.append("<th>OK/NG</th>");
        headerRow_top.append("<th rowspan='2'>Description</th>");
        headerRow_top.append("<th rowspan='2'>Edit Time</th>");
        headerRow_top.append("<th rowspan='2'>User</th>");
        headerRow_top.append("<th rowspan='2'>-</th>");

        thead.append(headerRow_top);
        thead.append(headerRow_button);
        table.append(thead);
        // 創建header 結束

        // 創建body 開始
        var tbody = $("<tbody>");
        tableData.master = tableData.master.sort((a, b) => parseInt(a.TIME) - parseInt(b.TIME));

        tableData.master.forEach(function (period) {
            var row = $(`<tr id=row-${period.TIME} msid=${period.QC_INSPECTION_MASTER_SID}>`);
            var timeCell = $("<td>").text(period.TIME + ":00");
            row.append(timeCell);

            //巡檢項目
            tableData.detail.forEach(function (cells) {
                if(cells.MSID === period.QC_INSPECTION_MASTER_SID){
                    //規格上下限，用於判定輸入值是否超出規格
                    var spc_max = itemConfig[cells.DC_ITEM_NAME][1] != '-' ? itemConfig[cells.DC_ITEM_NAME][1] : Infinity;
                    var spc_min = itemConfig[cells.DC_ITEM_NAME][3] != '-' ? itemConfig[cells.DC_ITEM_NAME][3] : -Infinity;
                    //根據資料類型,長出輸入框,並代入已有資料
                    var inputCell = $("<td>").html(`<input 
                        type="${itemConfig[cells.DC_ITEM_NAME][0]}" 
                        sid=${cells.QC_INSPECTION_DETAIL_SID} 
                        value="${cells.VALUE||''}" 
                        oninput="checkSPC(this,${spc_max},${spc_min})" 
                        ${cells.VALUE==='Y' ? "checked" : ''} 
                    >`);
                    row.append(inputCell);
                }
            })

            //其他資訊
            if(period.RESULTS === 'Y'){
                var resultCell = $("<td>").html(`<input class="text-end" type="checkbox" value=${period.RESULTS} style="background-color: rgba(249, 108, 114, 0.15);" checked>`);
            }else{
                var resultCell = $("<td>").html(`<input class="text-end" type="checkbox" value=${period.RESULTS} style="background-color: rgba(249, 108, 114, 0.15);">`);
            }
            row.append(resultCell);
            
            var descriptionCell = $("<td>").html(`<input type="textArea" value="${period.DESCRIPTION}">`);
            row.append(descriptionCell);
            
            var editTimeCell = $("<td>").text(period.EDIT_TIME ? period.EDIT_TIME.slice(0, -3).replace("T", " ") : ""); // 2024-02-05T20:00:00 => 2024-02-05 20:00
            row.append(editTimeCell);

            var editUserCell = $("<td>").text(period.EDIT_USER);
            row.append(editUserCell);

            var saveCell = $("<td>").html(`<button id=button-${period.TIME} type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myModal">save</button>`);
            row.append(saveCell);

            tbody.append(row);
        })

        table.append(tbody);
        // 創建body 結束

        // 將表格添加到頁面中
        $('#tableContainer').html(table);
        
        // 初始化DataTable
        $('#inspectionForm').DataTable({
            "scrollX": '100%',
            "autoWidth": true,
            "searching": false,
            "paging": false,
            // "columnDefs": [
            //     { targets: 0, orderable: false},
            // ]
            "order": [1,'asc']
        });

        //觸發檢查規格
        $('input[type="number"]').trigger('input');
        
        //儲存巡檢時段
        tableData.master.forEach(function (period) {
            $(`#button-${period.TIME}`).click(function () {
                $("#saveContent").empty()
                $("#saveContent").append(`Sure you want to change the ${period.TIME}:00 inspection record?`)

                $("#saveButton").click(function(){
                    // 儲存最終API需要的數組
                    var inputValues = {};
                    // 遍歷指定行中的每個元素
                    $(`#row-${period.TIME}`).each(function () {

                        var row = $(this);
                        // 獲取所有input元素
                        var inputs = row.find("input");

                        var sidList = [];
                        var values = [];
                        var result;
                        var description;

                        // 遍歷每個input取值
                        inputs.each(function () {
                            var input = $(this);
                            switch(input.attr("type").toUpperCase()){
                                case 'TEXT':
                                case 'NUMBER':
                                    sidList.push(input.attr("sid"))
                                    values.push(input.val())
                                    break;
                                case 'CHECKBOX':
                                    //判斷是在巡檢項目or巡檢結果
                                    if(input.attr("sid")){
                                        sidList.push(input.attr("sid"))
                                        values.push(input.prop("checked") ? 'Y' : 'N');
                                    }else{
                                        result = input.prop("checked") ? 'Y' : 'N';
                                    }
                                    break;
                                case 'TEXTAREA':
                                    description = input.val()
                                    break;
                                
                            }
                        });

                        // 填入數組，發送給API
                        inputValues["QC_INSPECTION_MASTER_SID"] = row.attr('msid');
                        inputValues["QC_INSPECTION_DETAIL_SID"] = sidList;
                        inputValues["VALUE"] = values;
                        inputValues["RESULTS"] = result;
                        inputValues["DESCRIPTION"] = description;
                        inputValues["EDIT_USER"] = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo')
                        
                        updateTable(inputValues)

                    });
                    //關閉彈出視窗
                    $("#myModal").modal("hide");
                })
                
            });
        });

    }
    fetchData()

    // 获取具有 "Lang" 类的<span>元素
    let backButton = document.getElementById("backButton");

    // 添加点击事件处理程序
    backButton.addEventListener("click", function() {
    
        GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
    });

    // 標題單號、日期、圖片
    async function getGridDataOPI(SID) {
        // 定义 GetGrid API 的 URL
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';
      
        // 定义要传递的参数对象
        let params = {
            SID: SID,
            TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
            // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
        };
      
        // 定义查詢条件参数对象
        let conditions={};
        if(SID===gridInfoSID){
            conditions = {
                Field: ["QC_INSPECTION_ORDER_SID"],
                Oper: ["="],
                Value: [QC_INSPECTION_ORDER_SID]
            }
        }

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
                    return data;
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

    // 獲取table內容(master、detail)
    async function getTableData(){
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/QCInspectPlanHist';
    
        let headers = new Headers({
            'Content-Type': 'application/json',
            'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
        });
    
        let conditions = {
            "QC_INSPECTION_ORDER_SID": QC_INSPECTION_ORDER_SID,
        }
    
        let requestBody = JSON.stringify(conditions);
    
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
                    return data;
                }
                else{
                    Set_Clean();
                }
            } else {
                 throw new Error('獲取Grid數據失敗，狀態碼:' + response.status);
                
            }
        } catch (error) {
            console.error(error);
        }
    }
    async function updateTable(updateSet){
        let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/QCInspectPlanUpdate';
    
        let headers = new Headers({
            'Content-Type': 'application/json',
            'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
        });
    
        let requestBody = JSON.stringify(updateSet);
    
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
                    location.reload() //2024-02-06 暫用於畫面refresh，未來可套 weyu_loading
                    // return data;
                }
                else{
                    Set_Clean();
                }
            } else {
                 throw new Error('獲取Grid數據失敗，狀態碼:' + response.status);
                
            }
        } catch (error) {
            console.error(error);
        }
    }
})


// 2024-02-07 保留 判斷是否符合規格
function checkSPC(input, max, min) {
    $(input).next('img').remove();
    if ($(input).val() != "" && ($(input).val() > max || $(input).val() < min)) {
        var img = '<img src="../img/comm/error.svg" title="超出規格限制">'
        $(input).after(img);
        $(input).css({
            'color':'red',
            'outline':'none',
            'border-color':'red'
        });
    } else {
        $(input).css({
            'color':'black',
            'outline':'',
            'border-color':''
        });
    }
}