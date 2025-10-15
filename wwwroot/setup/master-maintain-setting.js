// URL取參
let currentURL = new URL(window.location.href);
let URLparams = new URLSearchParams(currentURL.search);
let MODULE_TYPE = URLparams.get('MODULE_TYPE');
let LEVEL = URLparams.get('LEVEL');
let MODULE_NAME = URLparams.get('MODULE_NAME');
let BUTTON = URLparams.get('BUTTON');
let ACTION = URLparams.get('ACTION').toUpperCase();
let SID = URLparams.get('SID');

$("#SID").text(SID ? `SID:${SID}` : "")
$("#actionType").text(ACTION === "ADD" ? "新增" : ACTION === "EDIT" ? "編輯" : "")

// 添加点击事件处理程序
$("#backButton").click(()=>GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON))

let gridField, editField
let masterDataset

// 待文件解析完成 執行初始化
$(document).ready(async()=>init())
async function init() {
    initFieldTable();
    initTab();
    initHandlers()

    if(ACTION === 'ADD'){
        initTList()
        initVTList()
    }else if(ACTION === 'EDIT'){
        let masterData = await fetchDataBySid(SID); // 獲取現有主檔數據
        $("#inputCODE").val(masterData.master[0].CODE);
        $("#inputCAPTION").val(masterData.master[0].CAPTION);
        $(`input[name="inputSORTORDER"][value="${masterData.master[0].SORTORDER}"]`).prop("checked", true);

        updateSidField(masterData.T_Columns, masterData.master[0].SIDFIELD)
        updateSortName(masterData.VT_Columns, masterData.master[0].SORTNAME)
        await initTList(masterData.master[0].TABLENAME)
        await initVTList(masterData.master[0].GRIDTABLENAME)
        editField.setData(masterData.detailCols)
        gridField.setData(masterData.detailGridCols)
    }

    // 待全部加載完畢 隱藏loading畫面
    $(".loading-sign").addClass('d-none')
    $(".panel").removeClass('d-none')
}

// 取得現有主檔設定
function fetchDataBySid(SID) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/GetMasterMain?SID=${SID}`,
            method: 'GET',
            headers: {
                'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`), // 替換為您的 Token
            },
            success: async function (data) {
                if (data.result) {
                    data.detailGridCols = data.detailGridCols.map(row => {
                        return {
                            ...row,
                            HIDDEN: row.HIDDEN.toUpperCase() === 'TRUE' ? false : true // 顛倒 HIDDEN 值
                        };
                    })
                    resolve(data); // 成功時返回結果
                } else {
                    await customAlertError("不存在的SID")
                    window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
                }
            },
            error: async function (xhr, status, error) {
                await customAlertError("資料獲取錯誤")
                window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
            }
        });
    });
}
// 初始化選單
// 1.主檔Table
function initTList(defaultValue) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/GetT_list`,
            method: "GET",
            headers: {
                TokenKey: localStorage.getItem(
                    PROJECT_SAVE_NAME + "_BI_TokenKey"
                ),
            },
            success: function (data) {
                if (data.result) {
                    let opts = data.T_list
                        .map((row) => {
                            return `<option value="${row.TABLE_NAME}">${row.TABLE_NAME}</option>`;
                        })
                        .join("");
                    $("#inputTABLENAME")
                        .html(opts)
                        .selectpicker("destroy")
                        .selectpicker('val',defaultValue)
                    resolve()
                } else {
                    alert("获取数据失败");
                    reject()
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching options:", error);
            },
        });
    })

}
// 2.顯示用View/Table
function initVTList(defaultValue){
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/GetVT_list`,
            method: "GET",
            headers: {
                TokenKey: localStorage.getItem(
                    PROJECT_SAVE_NAME + "_BI_TokenKey"
                ),
            },
            success: function (data) {
                if (data.result) {
                    let opts = data.T_list
                        .map((row) => {
                            return `<option value="${row.TABLE_NAME}">${row.TABLE_NAME}</option>`;
                        })
                        .join("");
                    $("#inputGRIDTABLENAME")
                        .html(opts)
                        .selectpicker("destroy")
                        .selectpicker('val',defaultValue)
                    resolve()
                } else {
                    alert("获取数据失败");
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching options:", error);
                reject(error); // 通知 Promise 失败
            },
        });
    })

}

// 初始化按鈕事件
function initHandlers(){
    $("#inputTABLENAME").change(async(event)=>{
        let tableName = event.target.value
        let T_Data = await getAddEditField(tableName)
        updateSidField(T_Data.data.T_Columns)
        let fieldData = T_Data.data.EditField
        editField.setData(fieldData)
    })
    $("#inputGRIDTABLENAME").change(async(event)=>{
        let tableName = event.target.value
        let sidField = $("#inputSIDFIELD").val()
        let VT_Data = await getAddGridField(tableName,sidField)
        updateSortName(VT_Data.data.VT_Columns)
        let fieldData = VT_Data.data.GridField
        gridField.setData(fieldData)
    })

    $("#inputSIDFIELD").change((event)=>{
        let sidField = event.target.value
        let sortNames = $("#inputSORTNAME option").map(function() {
            return $(this).val(); // 取得每個 option 的 value
        }).get(); // 將結果轉換為陣列
        if(sortNames.length > 1 && !sortNames.includes(sidField)){
            customAlertWarning("顯示的View必須有與主檔表相同的SID欄位")
            $("#inputSORTNAME").html("")
            $('#inputSORTNAME').selectpicker('destroy');
            $('#inputSORTNAME').selectpicker();
            $("#inputGRIDTABLENAME").selectpicker('val','')
            gridField.setData([])
        }
    })

    $("#copyBtn").click(()=>openCopyModal())
    $("#copySaveBtn").click(()=>copyData())
    $("#saveBtn").click(()=>saveData())
    $("#refreshBtn").click(()=>refreshTableFields())
}

// 取得下方欄位維護資料
// 1. Edit Field (編輯)
function getAddEditField(tableName){
    // 取得SID欄位選項
    return new Promise((resolve, reject) => {
        $.ajax({
            url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetAddEditField?TABLE_NAME='+tableName,
            method: 'GET',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為您的 Token
            },
            success: async function (data) {
                if(data.result){
                    // updateSidField(data.data.T_Columns)
                    // let fieldData = data.data.EditField
                    // editField.setData(fieldData)
                    resolve(data)
                }else{
                    await customAlertError("資料取得失敗")
                    $("#inputSIDFIELD").html("")
                    $('#inputSIDFIELD').selectpicker('destroy');
                    $('#inputSIDFIELD').selectpicker();
                    $("#inputTABLENAME").selectpicker('val','')
                    editField.setData([])
                }
            },
            error: function (xhr, status, error) {
              console.error('Error fetching options:', error);
            }
        });
    })

}
// 2. Grid Field (顯示)
function getAddGridField(tableName, sidField){
    // 取得排序欄位選項
    return new Promise((resolve, reject) => {
        $.ajax({
            url: window.location.protocol+'//'+default_ip+'/'+default_Api_Name+`/api/GetAddGridField?TABLE_NAME=${tableName}&SID=${sidField}`,
            method: 'GET',
            headers: {
                'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'), // 替換為您的 Token
            },
            success: async function (data) {
                if(data.result){
                    // updateSortName(data.data.VT_Columns)
                    // let fieldData = data.data.GridField
                    // gridField.setData(fieldData)
                    data.data.GridField = data.data.GridField.map(row => {
                        return {
                            ...row,
                            HIDDEN: row.HIDDEN.toUpperCase() === 'TRUE' ? false : true // 顛倒 HIDDEN 值
                        };
                    })
                    resolve(data)
                }else{
                    await customAlertWarning("顯示的View必須有與主檔表相同的SID欄位")
                    $("#inputSORTNAME").html("")
                    $('#inputSORTNAME').selectpicker('destroy');
                    $('#inputSORTNAME').selectpicker();
                    $("#inputGRIDTABLENAME").selectpicker('val','')
                    gridField.setData([])
                }
            },
            error: function (xhr, status, error) {
              console.error('Error fetching options:', error);
            }
        });
    })
}

function updateSidField(columnData, defaultValue){
    let opts = columnData.map((col)=>{
        return `<option value="${col.COLUMN_NAME}">${col.COLUMN_NAME}</option>`
    }).join('')
    $("#inputSIDFIELD")
        .html(opts)
        .selectpicker('destroy')
        .selectpicker('val',defaultValue)
}
function updateSortName(columnData, defaultValue){
    let opts = columnData.map((col)=>{
        return `<option value="${col.COLUMN_NAME}">${col.COLUMN_NAME}</option>`
    }).join('')
    $("#inputSORTNAME")
        .html(opts)
        .selectpicker('destroy')
        .selectpicker('val',defaultValue)
}

async function refreshTableFields(){
    if(ACTION === 'ADD'){
            let T_Name = $("#inputTABLENAME").val()
            let VT_Name = $("#inputGRIDTABLENAME").val()
            let sidField = $("#inputSIDFIELD").val()
            let T_Data = await getAddEditField(T_Name)
            let VT_Data = await getAddGridField(VT_Name,sidField)
            editField.setData(T_Data.data.EditField)
            gridField.setData(VT_Data.data.GridField)

    }else if(ACTION === 'EDIT'){
        let masterData = await fetchDataBySid(SID); // 獲取現有主檔數據
        editField.setData(masterData.detailCols)
        gridField.setData(masterData.detailGridCols)
    }
}
function saveData(){
    let jsonData = {
        LOGIN_USER: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo'),
        master: [{
            SID: SID,
            CODE: $("#inputCODE").val(),
            CAPTION: $("#inputCAPTION").val(),
            TABLENAME: $("#inputTABLENAME").val(),
            GRIDTABLENAME: $("#inputGRIDTABLENAME").val(),
            SIDFIELD: $("#inputSIDFIELD").val(),
            SORTNAME: $("#inputSORTNAME").val(),
            SORTORDER: $('input[name="inputSORTORDER"]:checked').val()
        }],
        detailCols: editField.getData(),
        detailGridCols: gridField.getData()
        .map(row => {
            return {
                ...row,
                HIDDEN: !row.HIDDEN // 顛倒 HIDDEN 值
            };
        })
    };

    // 判斷是否可用
    for (let [key, value] of Object.entries(jsonData.master)) {
        if (!value && key !== "SID") { // 檢查是否為空或 null
            customAlertWarning(`請輸入 ${key}`);
            return; // 停止執行並返回
        }
    }
    
    // 資料檢查無誤 保存進資料庫
    Swal.showLoading()
    switch(ACTION){
        case "ADD":
            // 新增
            $.ajax({
                url: `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/MasterMainAdd`,
                method: 'POST',
                headers: {
                    'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`), // 替換為您的 Token
                },
                contentType: "application/json", // 告知服務器資料格式為 JSON
                data: JSON.stringify(jsonData),
                success: async function (data) {
                    if (data.result) {
                        customAlertSuccess("保存成功")
                        // 更新網址參數
                        SID = data.SID
                        ACTION = "EDIT"
                        $("#SID").text(`SID:${SID}`)
                        $("#actionType").text("編輯")

                        currentURL.searchParams.set("SID", SID);
                        currentURL.searchParams.set("ACTION", ACTION);
                        history.pushState(null, "", currentURL.toString()); // 更新瀏覽器地址欄
                        // 更新EditField & GridField
                        editField.setData(data.detailCols)
                        gridField.setData(data.detailGridCols.map(row => {
                            return {
                                ...row,
                                HIDDEN: row.HIDDEN.toUpperCase() === 'TRUE' ? false : true // 顛倒 HIDDEN 值
                            };
                        }))
                    } else {
                        await customAlertError("不存在的SID")
                        // window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
                    }
                },
                error: async function (xhr, status, error) {
                    await customAlertError("資料獲取錯誤")
                    // window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
                }
            });
            break;
        case "EDIT":
            // 編輯
            $.ajax({
                url: `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/MasterMainEdit`,
                method: 'PUT',
                headers: {
                    'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`), // 替換為您的 Token
                },
                contentType: "application/json", // 告知服務器資料格式為 JSON
                data: JSON.stringify(jsonData),
                success: async function (data) {
                    if (data.result) {
                        customAlertSuccess("保存成功")
                    } else {
                        await customAlertError("不存在的SID")
                        // window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
                    }
                },
                error: async function (xhr, status, error) {
                    await customAlertError("資料獲取錯誤")
                    // window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
                }
            });
            break;
    }
}

function openCopyModal(){
    let copyCODE = $("#inputCODE").val() + "_COPY"
    let copyCAPTION = $("#inputCAPTION").val() + "_COPY"
    $("#copyCODE").val(copyCODE)
    $("#copyCAPTION").val(copyCAPTION)
    $("#copyModal").modal('show')
}
function copyData(){
    let jsonData = {
        "MM_SID": SID,
        "CODE": $("#copyCODE").val(),
        "CAPTION": $("#copyCAPTION").val()
    };

    Swal.showLoading()
    $.ajax({
        url: `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/CopySave`,
        method: 'POST',
        headers: {
            'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`), // 替換為您的 Token
        },
        contentType: "application/json", // 告知服務器資料格式為 JSON
        data: JSON.stringify(jsonData),
        success: async function (data) {
            if (data.result) {
                await customAlertSuccess("保存成功")
                currentURL.searchParams.set("SID", data.master[0].SID);
                currentURL.searchParams.set("ACTION", "EDIT");
                window.location.href = currentURL.toString(); // 更新瀏覽器地址
            } else {
                await customAlertError("不存在的SID")
                // window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
            }
        },
        error: async function (xhr, status, error) {
            await customAlertError("資料獲取錯誤")
            // window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
        }
    });
}

// 初始化tabulator
function initFieldTable(){
    // 定義欄位參數
    const dataTypeParams = [ // 自訂選項列表
        {label: "decimal", value: "decimal"},
        {label: "nvarchar", value: "nvarchar"},
        {label: "int", value: "int"},
        {label: "varchar", value: "varchar"}
    ]
    const editorTypeParams = [ // 自訂選項列表
        {label: "Text", value: "Text"},
        {label: "CheckBox", value: "CheckBox"},
        {label: "Select", value: "Select"},
        {label: "Date", value: "Date"},
        {label: "DateTime", value: "DateTime"},
        {label: "TextArea", value: "TextArea"}
    ]
    const booleanToggleConfig = {
        formatter: "tickCross", // 顯示勾/叉圖示
        hozAlign: "center", // 水平居中
        cellClick: function (e, cell) { 
            const currentValue = cell.getValue();
            cell.setValue(!currentValue); // 切換 true/false
        }
    };
    // 初始化tabulator
    editField = new Tabulator("#edit-field", {
        data: [],
        layout:"fitDataStretch",
        height:"100%",
        columns: [
            { title: "明細SID", field: "MM_COLUMN_SID", visible: false },          //specify width for specific column
            { title: "#", field: "COL_ID", width: 50 },          //specify width for specific column
            { title: "欄位名稱", field: "COL_NAME", width: 250}, 
            { 
                title: "數據欄位類型", 
                field: "FIELD_TYPE", 
                width: 150, 
                editor: "list", 
                editorParams: {
                    autocomplete: true,
                    allowEmpty: false,
                    listOnEmpty: true,
                    valuesLookup: true,
                    values: dataTypeParams // 自定選項的變數
                }
            },
            { 
                title: "是否可新增", 
                field: "EDITABLE", 
                width: 120, 
                ...booleanToggleConfig
            },
            { 
                title: "是否可編輯", 
                field: "ENABLE_INEDIT", 
                width: 120, 
                ...booleanToggleConfig
            },
            { 
                title: "是否必填", 
                field: "REQUIRED", 
                width: 120, 
                ...booleanToggleConfig
            },
            { 
                title: "優先序", 
                field: "SEQ", 
                width: 100, 
                editor: "input"},
            { 
                title: "編輯種類", 
                field: "EDITTYPE", 
                width: 150, 
                editor: "list", 
                editorParams: {
                    autocomplete: true,
                    allowEmpty: false,
                    listOnEmpty: true,
                    valuesLookup: true,
                    values: editorTypeParams // 自定選項的變數
                }
            },
            { 
                title: "選單選項", 
                field: "EDITVALUE", 
                width: 300, 
                editor: "input"
            }
        ]
    });
    gridField = new Tabulator("#grid-field", {
        data: [],
        layout:"fitDataStretch",
        height:"100%",
        columns: [
            { title: "明細SID", field: "MM_GRID_COLUMN_SID", visible: false },          //specify width for specific column
            { title: "#", field: "COL_ID", width: 50 },          //specify width for specific column
            { title: "欄位名稱", field: "COL_NAME", width: 250}, 
            { 
                title: "數據欄位類型", 
                field: "FIELD_TYPE", 
                width: 150, 
                editor: "list", 
                editorParams: {
                    autocomplete: true,
                    allowEmpty: false,
                    listOnEmpty: true,
                    valuesLookup: true,
                    values: dataTypeParams // 自定選項的變數
                }
            },
            { 
                title: "是否顯示", 
                field: "HIDDEN", 
                width: 100, 
                ...booleanToggleConfig
            },
            { 
                title: "是否查詢條件", 
                field: "CANQUERY", 
                width: 120, 
                ...booleanToggleConfig
            },
            { 
                title: "優先序", 
                field: "SEQ", 
                width: 100, 
                editor: "input"},
            { 
                title: "編輯種類", 
                field: "EDITTYPE", 
                width: 150, 
                editor: "list", 
                editorParams: {
                    autocomplete: true,
                    allowEmpty: false,
                    listOnEmpty: true,
                    valuesLookup: true,
                    values: editorTypeParams // 自定選項的變數
                }
            },
            { 
                title: "選單選項", 
                field: "EDITVALUE", 
                width: 300, 
                editor: "input"
            }
        ]
    });
}
// 初始化表格切換功能
function initTab(){
    // tab切換事件
    $('.tab-btn').on('click', function () {
        const index = $('.tab-btn').index(this);
    
        // 移除所有按鈕和內容的 active 類別
        $('.tab-btn').removeClass('active');
        $('.tab-pane').removeClass('active');
    
        // 為當前按鈕和內容添加 active 類別
        $('.tab-btn').eq(index).addClass('active');
        $('.tab-pane').eq(index).addClass('active');
    });
}
