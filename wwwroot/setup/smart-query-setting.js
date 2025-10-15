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

let gridField, conditionField, setupField
let masterDataset

// 添加点击事件处理程序
$("#backButton").click(()=>GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON))


$(document).ready(()=>{
    initTab()
    initFieldTable()
    initHandlers()
})

// 初始化表格切換功能
function initTab(){
    // tab切換事件
    $('.tab-btn').on('click', function () {
        const index = $('.tab-btn').index(this);
    
        // 移除所有按鈕和內容的 active 類別
        $('.tab-btn').removeClass('active');
        $('.tab-pane').removeClass('active');
    
        // 為當前按鈕和內容添加 active 類別
        $(this).addClass('active');
        $('.tab-pane').eq(index).addClass('active');
    });
}
// 初始化tabulator
function initFieldTable(){
    // 定義欄位參數
    const dataTypeParams = [ // 自訂選項列表
        {label: "string", value: "string"},
        {label: "number", value: "number"},
        {label: "date", value: "date"},
        {label: "datetime", value: "datetime"}
    ]
    const editorTypeParams = [ // 自訂選項列表
        {label: "KeyIn", value: "Text"},
        {label: "Select", value: "Select"},
        {label: "CheckBox", value: "CheckBox"},
    ]
    const operTypeParams = [ // 自訂選項列表
        {label: "=", value: "="},
        {label: "!=", value: "!="},
        {label: ">", value: ">"},
        {label: ">=", value: ">="},
        {label: "<", value: "<"},
        {label: "<=", value: "<="},
        {label: "in", value: "in"},
        {label: "between", value: "between"},
        {label: "like", value: "like"}
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

    gridField = new Tabulator("#grid-field", {
        data: [{
            "MM_GRID_COLUMN_SID":"12345",
            "COL_ID":"1",
            "COL_NAME":"EQP_NO",
            "FIELD_TYPE":"nvarchar",
            "HIDDEN":"true",
            "isHyperLink":"true",
            "hyperLinkURL":"./setup/master-maintain.html",
            "setup":"setup",
            "hyperLinkParam":"EQP_NO:EQP_NO,EQP_NAME:EQP_NAME"

        },{
            "MM_GRID_COLUMN_SID":"12345",
            "COL_ID":"2",
            "COL_NAME":"EQP_NAME",
            "FIELD_TYPE":"nvarchar",
            "HIDDEN":"true",
            "isHyperLink":"false",
            "hyperLinkURL":"",
            "setup":"setup",
            "hyperLinkParam":""

        }],
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
                title: "Can Hyper Link", 
                field: "isHyperLink", 
                width: 120, 
                ...booleanToggleConfig
            },
            { 
                title: "Hyper Link URL", 
                field: "hyperLinkURL", 
                width: 300, 
                editor: "input"
            },
            {
                title: "setup",
                field: "setup",
                formatter: function(cell, formatterParams) {
                    // 自定義按鈕
                    return `<button class="btn-action">${cell.getValue()}</button>`;
                },
                cellClick: function(event, cell) {
                  // alert("Row field: " + cell.getRow().getData().COL_NAME);
                  openSetupModal()
                }
            },
            { title: "Hyperlink Parameter", field: "hyperLinkParam", width: 250}, 
        ]
    });

    conditionField = new Tabulator("#condition-field", {
        data: [{
            "MM_COLUMN_SID":"12345",
            "COL_ID":"1",
            "CON_KEYWORD":"CON",
            "COL_NAME":"EQP_NO",
            "OPER":"=",
            "FIELD_TYPE":"string",
            "EDITTYPE":"KeyIn",
            "SOURCE_SQL":"",
            "DEFAULT":""

        },{
            "MM_COLUMN_SID":"12345",
            "COL_ID":"2",
            "CON_KEYWORD":"CON",
            "COL_NAME":"EQP_NAME",
            "OPER":"=",
            "FIELD_TYPE":"string",
            "EDITTYPE":"KeyIn",
            "SOURCE_SQL":"",
            "DEFAULT":""
        }],
        layout:"fitDataStretch",
        height:"calc(100% - 31px)",
        selectableRows:true, //開啟可選
        selectableRowsRangeMode:"click", //單選
        columns: [
            { title: "明細SID", field: "MM_COLUMN_SID", visible: false },          //specify width for specific column
            // { title: "#", field: "COL_ID", width: 50 },          //specify width for specific column
            { title: "條件關鍵字", field: "CON_KEYWORD", width: 250}, 
            { 
                title: "欄位", 
                field: "COL_NAME", 
                width: 200, 
                editor: "list", 
                editorParams: {
                    autocomplete: true,
                    allowEmpty: false,
                    listOnEmpty: true,
                    valuesLookup: true,
                    values: [
                        {label: "EQP_NO", value: "EQP_NO"},
                        {label: "EQP_NAME", value: "EQP_NAME"},
                        {label: "EDIT_USER", value: "EDIT_USER"},
                        {label: "CREATE_TIME", value: "EQP_NAME"},
                    ]
                }
            },
            { 
                title: "Oper", 
                field: "OPER", 
                width: 150, 
                editor: "list", 
                editorParams: {
                    autocomplete: true,
                    allowEmpty: false,
                    listOnEmpty: true,
                    valuesLookup: true,
                    values: operTypeParams // 自定選項的變數
                }
            },
            { 
                title: "數據類型", 
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
                title: "輸入類型", 
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
                title: "Data Source SQL", 
                field: "SOURCE_SQL", 
                width: 300, 
                editor: "input"
            },
            { 
                title: "預設值", 
                field: "DEFAULT", 
                width: 300, 
                editor: "input"
            },
        ]
    });

    setupField = new Tabulator("#setup-field", {
        layout:"fitDataStretch",
        height:"311px",
        rowHeader:{headerSort:false, resizable: false, frozen:true, headerHozAlign:"center", hozAlign:"center", formatter:"rowSelection", titleFormatter:"rowSelection", cellClick:function(e, cell){
          cell.getRow().toggleSelect();
        }},
        data:[{
            "PARAM_NAME":"",
            "COL_NAME":"EQP_NO",
            "FIELD_TYPE":"string",

        },{
            "PARAM_NAME":"",
            "COL_NAME":"EQP_NAME",
            "FIELD_TYPE":"string",
        }],
        columns:[
          {title:"參數名稱", field:"PARAM_NAME", width:150, editor: "input"},
          {title:"欄位名稱", field:"COL_NAME", width:150, hozAlign:"right", sorter:"number"},
          {title:"數據欄位類型", field:"FIELD_TYPE", width:100},
        ],
    });
}

function initHandlers(){
    $("#copyBtn").click(()=>openCopyModal())
    // $("#copySaveBtn").click(()=>copyData())
    $("#copySaveBtn").click(()=>customAlertSuccess("複製成功"))
    // $("#saveBtn").click(()=>saveData())
    $("#saveBtn").click(()=>customAlertSuccess("保存成功"))
    $("#verifyBtn").click(()=>customAlertSuccess("驗證成功"))
    $("#addRow").click(()=>{
        let totalRows = conditionField.getData().length;
        conditionField.addRow({"COL_ID":totalRows + 1,"CON_KEYWORD":"CON"})
    })
    $("#deleteRow").click(()=>{
        conditionField.getSelectedRows()[0].delete()
    })
}

function openCopyModal(){
    let copyCODE = $("#inputCODE").val() + "_COPY"
    let copyCAPTION = $("#inputCAPTION").val() + "_COPY"
    $("#copyCODE").val(copyCODE)
    $("#copyCAPTION").val(copyCAPTION)
    $("#copyModal").modal('show')
}

function openSetupModal(){
  $("#setupModal").modal('show')
}