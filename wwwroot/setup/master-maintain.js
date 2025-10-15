let TokenID = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey');

// var default_WebSiteName = 'WYBI_API';
//2024-01-10 edit/add合併
var isedit = true;
//$.fn.DataTable.ext.pager.numbers_length = 1;
$(document).ready(function () {
    var username = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_accountNo');
    var pgn = 1, WithQuery = 0;
    var table;
    var CKMD = 0;
    var perPData = 20;
    //網址取參
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
    var SID = Request["SID"] || 262434954353762;
    var RequiredC = [];

    //2023-04-27 撈排序欄位
    var ODF = Request["ODF"];

    //2023-11-08 整併參數列
    //設備維護參數
    var MSID = Request["MSID"];
    var EQP_NO = Request["EQP_NO"];
    var MOLD_NO = Request["MOLD_NO"];
    var CUSTOMER_COMPLAINTS_SID = Request["CUSTOMER_COMPLAINTS_SID"];
    var OPERATION_CODE = Request["OPERATION_CODE"];
    var PROJECT_CODE = Request["PROJECT_CODE"];


    //backUrl參數
    var MODULE_TYPE = Request["MODULE_TYPE"] || null;
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;

    //2024-01-25新增 客製按鈕
    switch (SID) {
        case "308655613750623":
            $('#Appendix').show() //顯示 附件上傳 按鈕
            break;
    }
    //2023-11-08新增 指定查詢的參數欄位 塞入參數
    function Set_Query_String(id) {
        switch (SID) {
            case "102785271380810": //設備維護 帶參數
                $('#Q' + id).val(EQP_NO);
                break;
            case "334340636776805":
                $('#Q' + id).val(MOLD_NO);
                break
            case "335036498080839": //客訴處理 帶參數
                $('#Q' + id).val(CUSTOMER_COMPLAINTS_SID);
                $('#' + id).val(CUSTOMER_COMPLAINTS_SID);
                break
            case "336144755800209"://工作站報工 待參數
                if (id == "OPERATION_CODE") {
                    $('#Q' + id).val(OPERATION_CODE);
                    $('#' + id).val(OPERATION_CODE);
                }
                break;
            case '308655613750623'://專案管理 帶參數
                $('#Q' + id).val(PROJECT_CODE);
            case '337101820166137'://定期巡檢 帶參數
                $('#Q' + id).val(MSID);
                $('#' + id).val(MSID);
            default:
                break;
        }
    }

    //CRUD 開關設定 ----start
    SelectRowOnOff(true);
    DataAddOnOff(true);
    $("#PrePage").attr("disabled", true);
    $("#NexPage").attr("disabled", true);
    //CRUD 開關設定 ---- end
    //CURD 細項設定 ---- start
    var TitleArray = "", ALLTitle = "", QueryArray = [], TitleFalseV = [], QueryArrayWE = [], QueryFiledType = [], QUERYeditv = []; // TitleArray:會被顯示的title,ALLTitle:所有的title
    $.ajax({ //撈標題
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/MasterMainGridCol',
        headers: { SID: SID, TokenKey: TokenID },
        // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        // data: { funcName: "MasterMainGridCol", SID: SID },
        dataType: 'json',
        async: false,
        success: function (result) {
            result = result.data;
            for (var i = 0; i < result.length; i++) {
                QueryArray.push(result[i].CANQUERY);
                QueryArrayWE.push(result[i].EDITTYPE);
                QueryFiledType.push(result[i].FIELD_TYPE);
                QUERYeditv.push(result[i].EDITVALUE);
                ALLTitle == "" ? ALLTitle += result[i].COL_NAME : ALLTitle += (',' + result[i].COL_NAME);
                $('#addtitle').append('<th id="Title' + result[i].TITLE + '">' + GetLangDataV2(result[i].TITLE) + '</th>');
                if (result[i].HIDDEN.toUpperCase() == 'TRUE') {
                    TitleFalseV.push(i + 1);
                }
            }
            $("th").addClass("Lang").addClass("text-nowrap");
        }//alert(TitleArray);不是HIDDEN!=True就加入標題
    });//撈標題
    var TableName = "", GRIDTABLENAME = "", SidField = "", WebHeader = "", Unique = "", EnADD = "", EnDEL = "", EnEDIT = "", EnQUERY = "", htmlTitle = "";
    $.ajax({ //撈tablename
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/MasterMain',
        headers: { SID: SID, TokenKey: TokenID },
        // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        // data: { funcName: "MasterMain", SID: SID },
        dataType: 'json',
        async: false,
        success: function (result) {

            result = result.data;

            TableName = result[0].TABLE_NAME;
            GRIDTABLENAME = result[0].GRID_TABLE_NAME
            SidField = result[0].SID_FIELD
            Unique = result[0].UNIQUE_KEY
            EnADD = result[0].ENABLE_ADD;
            EnDEL = result[0].ENABLE_DEL;
            EnEDIT = result[0].ENABLE_EDIT;
            EnQUERY = result[0].ENABLE_QUERY;
            htmlTitle = result[0].CAPTION;
            $("#midtitle").text(GetLangDataV2(result[0].CAPTION));
            $("title").text(result[0].CAPTION);
        }
    });//撈tablename
    // var OrderFieldBy = SidField;
    // 2023-04-27 改排序
    var OrderFieldBy = '';
    if (typeof (ODF) == 'undefined') {
        OrderFieldBy = SidField
    }
    else {
        OrderFieldBy = ODF;
    }
    UniqueArray = [];
    if (Unique != '') GetUniqueValue();
    var CurrentRow = [], DataSet = [];
    var QueryString = "";
    //PageDataSplite頁數切割,DataSummary資料數量,SqlTimes切割後撈取次數,CheckLoadNum是否為第一次讀取
    var PageDataSplite = 20, DataSummary = 0, SqlTimes = 0, CheckLoadNum = 0;
    GetGridData();//撈資料
    TableSet();//Datatables 設定
    ChangeLang();//多國語系
    var ColName = [], ColSID = "", Colindex = 0; //抓Col名字
    table.columns().every(function () {
        //alert(this.header().innerText)
        ColName.push(this.header().innerText);
    });
    for (var col in ColName) {
        if (ColName[col] == SidField) {
            //alert(ColName[col]);
            ColSID = ColName[col];
            Colindex = col;
            break;
        }
    }
    var AllEditTitle = "", EditTitle = [], EditType = [], EditValue = [], EditFieldType = [], QueryEditFieldType = [], UpdateInEdit = [], AddRequired = [], QueryEditType = [], QueryEditValue = [];
    $.ajax({ //撈編輯標題
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/MasterMainCol',
        headers: { SID: SID, TokenKey: TokenID },
        // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        // data: { funcName: "MasterMainCol", SID: SID },
        dataType: 'json',
        async: false,
        success: function (result) {

            result = result.data;

            for (var i = 0; i < result.length; i++) {
                QueryEditType.push(result[i].EDITTYPE);
                QueryEditValue.push(result[i].EDITVALUE);
                QueryEditFieldType.push(result[i].FIELD_TYPE);
                AllEditTitle == "" ? AllEditTitle += result[i].COL_NAME : AllEditTitle += (',' + result[i].COL_NAME);
                if (result[i].EDITABLE.toUpperCase() === 'TRUE') { //可以被編輯的話
                    EditTitle.push(result[i].COL_NAME) //編輯標題
                    EditType.push(result[i].EDITTYPE) //編輯的類型
                    EditValue.push(result[i].EDITVALUE) //類型的value
                    EditFieldType.push(result[i].FIELD_TYPE) //編輯的值類別
                    UpdateInEdit.push(result[i].ENABLE_INEDIT) //可以在編輯畫面裡面編輯嗎?
                    AddRequired.push(result[i].REQUIRED) //屬於必定要填寫的欄位嗎?
                }
            }
            if (EditTitle.length > 0) {
                DataAddOnOff(false);
            }
        }
    });//撈編輯標題
    var Dpacker = [], DTpacker = [];
    for (var i = 0; i < QueryArray.length; i++) { //Query
        if (TitleFalseV.indexOf(i + 1) == -1 && QueryArray[i].toUpperCase() != 'FALSE') {
            switch (QueryArrayWE[i].toUpperCase()) {
                case 'SELECT':
                    // $("#QueryContent").append('<div class="Lang">' + ALLTitle.split(",")[i] + '</div>' + '<select id="Q' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" >' + SelectOption(QUERYeditv[i]) + '</select><p>');
                    //進階搜尋下拉式 2023-05-03
                    $("#QueryContent").append(
                        '<div class="d-flex justify-content-between mb-1">' +
                        '<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' +
                        '<select class="col-7" id="Q' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" required>' +
                        SelectOption(QUERYeditv[i]) +
                        '</select>' +
                        '</div>'
                    );
                    if (["EQP_NO", "MOLD_NO", "MASTER_SID", "OPERATION_CODE", "PROJECT_CODE", "MSID"].includes(ALLTitle.split(",")[i])) {
                        Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                    }


                    break;
                case 'TEXT':
                case 'TEXTAREA':
                case 'CHECKBOX':
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="col-7" id="Q' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '"  autocomplete="off"  />' + '</div>');
                    if (["EQP_NO", "MOLD_NO", "MASTER_SID", "OPERATION_CODE", "PROJECT_CODE", "MSID"].includes(ALLTitle.split(",")[i])) {
                        Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                    }
                    break;
                case 'SMALLDATETIME':
                case 'DATETIME':
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="QDS' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" autocomplete="off"/>');
                    DTpacker.push('QDS' + ALLTitle.split(",")[i]);
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end"> ~ </div> <input class="flatpickr-input col-7"  type="button" id="QDE' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" autocomplete="off"/>' + '</div>');
                    DTpacker.push('QDE' + ALLTitle.split(",")[i]);
                    break;
                case 'DATE':
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-6">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="QDS' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" autocomplete="off"/>');
                    Dpacker.push('QDS' + ALLTitle.split(",")[i]);
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end"> ~ </div> <input class="flatpickr-input col-7" type="button" id="QDE' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" autocomplete="off"/>' + '</div>');
                    Dpacker.push('QDE' + ALLTitle.split(",")[i]);
                    break;
            }
        }
    }
    for (var i = 0; i < DTpacker.length; i++) {
        let lastPickrTime = null;
        flatpickr("#" + DTpacker[i] + "", {
            enableTime: true,
            dateFormat: "Y-m-d H:i",
            allowInput: true,
            time_24hr: true,
            onChange: function (selectedDates, dateStr) {
                if (selectedDates.length > 0 && lastPickrTime === dateStr.split(' ')[1]) {
                    this.close();
                }
                lastPickrTime = dateStr.split(' ')[1];
            }
        })
    }
    for (var i = 0; i < Dpacker.length; i++) {
        flatpickr('#' + Dpacker[i], {
            dateFormat: "Y-m-d",
            allowInput: true,
            onChange: function (selectedDates) {
                if (selectedDates.length > 0) {
                    this.close();
                }
            }
        })
    }
    $("#Queryclean").click(function () {
        for (var i = 0; i < ALLTitle.split(",")[i].length; i++) {
            $("#Q" + ALLTitle.split(",")[i] + "").val("");
        }
        if (DTpacker.length > 0 || Dpacker.length > 0) {
            for (var i = 0; i < DTpacker.length; i++) {
                $("#" + DTpacker[i] + "").val("");
            }
            for (var i = 0; i < Dpacker.length; i++) {
                jQuery('#' + Dpacker[i]).val("");
            }
        }

    })

    //CRUD 細項設定 ---- end
    //CRUD 操作設定 ---- start
    var SelectData; //SelectData:儲存選取資料
    var SIDArray = "";
    var CBEValue = [], EditString = "", EditFiledData = [], eUnique = "";
    var EditPkey = "";
    $("#EditData").click(async function () {//編輯資料
        EditPkey = SelectData[col];
        // 主檔維護設定
        if (SID === "367252115657308") {
            window.location.href = `/${PROJECT_NAME}/setup/master-maintain-setting.html?ACTION=EDIT&SID=${EditPkey}&MODULE_TYPE=ADM&MODULE_NAME=SMART_MASTER&LEVEL=L3&BUTTON=A`
        }
        // Layout設定
        if (SID === "369761779674442") {
            window.location.href = `/${PROJECT_NAME}/setup/layout-setting/layoutSetting.html?action=edit&SID=${EditPkey}&MODULE_TYPE=ADM&MODULE_NAME=LAYOUT&LEVEL=L2&BUTTON=A`
        }

        $("#EDDContent").empty();
        var EditRequiredC = [];
        EditFiledData = []
        for (var i = 0; i < ALLTitle.split(",").length; i++) {
            if (ALLTitle.split(",")[i] == SidField) {
                EditString = "";
                EditString += " WHERE " + ALLTitle.split(",")[i] + "=" + SelectData[i + 1];
            }
        }
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/GridColDataQuery',
            headers: { TokenKey: TokenID },
            data: {
                SelectData: AllEditTitle,
                TableName: TableName,
                QueryString: EditString
            },
            // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            // data: { funcName: "GridColDataQuery", SelectData: AllEditTitle, TableName: TableName, QueryString: EditString },
            dataType: 'json',
            async: false,
            success: function (result) {
                result = result.data;
                $.each(result[0], function (key, value) {
                    EditFiledData.push(value);
                    if (key == Unique) {
                        eUnique = value;
                    }
                });
            }
        });
        for (var i = 0; i < AllEditTitle.split(",").length; i++) {
            if (AllEditTitle.split(",")[i] == SidField) {
                SIDArray = "";
                SIDArray += AllEditTitle.split(",")[i] + "=" + EditFiledData[i] //EditFiledData原值
            }
            //ALLTitle.split(",")[i].indexOf('SID') >= 0 ? SIDArray += ALLTitle.split(",")[i] + "=" + SelectData[i + 1] : "";//抓SID跟他的title
            if ($.inArray(AllEditTitle.split(",")[i], EditTitle) >= 0) {//如果有屬於要編輯的title的話
                var a = $.inArray(AllEditTitle.split(",")[i], EditTitle); //抓編輯的索引值


                switch (EditType[a].toUpperCase()) {
                    case 'TEXT':
                        $("#EDDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<input class="col-7" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off" />' + '</div>');
                        $("#" + AllEditTitle.split(",")[i] + "").val(EditFiledData[i]);
                        break;
                    case 'SMALLDATETIME':
                    case 'DATETIME':
                        $("#EDDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" autocomplete="off"/>' + '</div>');
                        let lastPickrTime = null;
                        flatpickr('#' + AllEditTitle.split(",")[i], {
                            enableTime: true,
                            dateFormat: "Y-m-d H:i",
                            allowInput: true,
                            time_24hr: true,
                            onChange: function (selectedDates, dateStr) {
                                if (selectedDates.length > 0 && lastPickrTime === dateStr.split(' ')[1]) {
                                    this.close();
                                }
                                lastPickrTime = dateStr.split(' ')[1];
                            }
                        })
                        $("#" + AllEditTitle.split(",")[i] + "").val(EditFiledData[i]);
                        break;
                    case 'DATE':
                        $("#EDDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" autocomplete="off" />' + '</div>');
                        flatpickr('#' + AllEditTitle.split(",")[i], {
                            dateFormat: "Y-m-d",
                            allowInput: true,
                            onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                    this.close();
                                }
                            }
                        })
                        $("#" + AllEditTitle.split(",")[i] + "").val(EditFiledData[i]);
                        break;
                    case 'SELECT':
                        // $("#EDDContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<select id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '">' + SelectOption(EditValue[a]) + '</select><p>');
                        // $("#" + AllEditTitle.split(",")[i] + "").val(EditFiledData[i]);
                        //進階搜尋下拉式 2023-05-03
                        // 建立 select 欄位
                        $("#EDDContent").append(
                            '<div class="d-flex justify-content-between mb-1">' +
                            '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' +
                            '<select class="col-7" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" required>' +
                            SelectOption(EditValue[a]) +
                            '</select>' +
                            '</div>'
                        );


                        console.log('EditFiledData[i] 原始值:', EditFiledData[i]);
                        // 設定預設值
                        $("#" + AllEditTitle.split(",")[i]).val(EditFiledData[i]);
                        if (SID === '385898768680272' && AllEditTitle.split(",")[i] === 'TOL_SID') {
                            let toldata = await getGridData('385899299673778');
                            let operName = $("#OPERATION_SID option:selected").text().trim();
                            let matchedTolOptions = toldata.Grid_Data.filter(item => item.TOL_OPERATION === operName);

                            let html = '';
                            matchedTolOptions.forEach(item => {
                                html += `<option value="${item.TOL_SID}">${item.TOL_NO}</option>`;
                            });
                            $('#TOL_SID').html(html);

                            // 加強判斷
                            const valToSet = String(EditFiledData[i]);
                            const exists = matchedTolOptions.some(item => item.TOL_SID === valToSet);


                            // 最後設定
                            setTimeout(() => {
                                $('#TOL_SID').val(valToSet);
                                console.log('實際設定後的值:', $('#TOL_SID').val());
                            }, 50);

                        }

                        break;
                    case 'CHECKBOX':
                        // CBEValue = EditValue[a].split("|");//418之前的code 不確定這個值用處
                        // EditFiledData[i]原值
                        console.log(AllEditTitle.split(",")[i], 111)//418
                        console.log(EditFiledData[i], 333)
                        console.log($("#" + EditTitle[i] + "").is(':checked'), 444)

                        // $("#EDDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<div class="col-7">' + '<input class="text-end" type="CheckBox" id="' + AllEditTitle.split(",")[i] + '" value="' + CBEValue[0] + '" name="' + editFieldType(EditFieldType[a]) + '"/>' + '</div>' + '</div>');
                        //同上 value處

                        $("#EDDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<div class="col-7">' + '<input class="text-end" type="CheckBox" id="' + AllEditTitle.split(",")[i] + '"  name="' + editFieldType(EditFieldType[a]) + '"/>' + '</div>' + '</div>');
                        //418將value處刪掉

                        if (EditFiledData[i] === 'Y') {
                            console.log('Y')
                            $('#' + AllEditTitle.split(",")[i]).prop('checked', true);

                        }


                        // EditFiledData[i].replace("         ", "") == CBEValue[0] ? $("#" + AllEditTitle.split(",")[i] + "").attr("checked", true) : "";


                        break;
                    case 'TEXTAREA':
                        $("#EDDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<TextArea class="col-7"  id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off" >' + EditFiledData[i] + '</textarea>' + '</div>');
                        break;
                } //編輯的類型判斷
                UpdateInEdit[a].toUpperCase() === 'FALSE' ? $("#" + AllEditTitle.split(",")[i] + "").attr("disabled", true) : "";
                if (AddRequired[a].toUpperCase() === 'TRUE') {
                    $("#" + AllEditTitle.split(",")[i] + "").css("background-color", "#f96c7226");
                    EditRequiredC.push(AllEditTitle.split(",")[i]);
                } else {
                    $("#" + AllEditTitle.split(",")[i] + "").css("background-color", "#F9F9F9");

                }
            }
        }
        ChangeLang();
        RequiredC = EditRequiredC;
        // $("#EDDContent").on('change', 'input', function () {
        //     var RequiredSum = 0, FieldSum = 0, EditSum = [0, 0];
        //     $("#EditSave").attr("disabled", true);
        //     for (var a in EditRequiredC) {
        //         $("#" + EditRequiredC[a] + "").val() != '' ? RequiredSum += 1 : RequiredSum += 0;
        //     }
        //     if (RequiredSum == EditRequiredC.length) {
        //         $("#EditSave").attr("disabled", false);
        //         RequiredSum = 0;
        //     } else {
        //         $("#EditSave").attr("disabled", true);
        //         RequiredSum = 0;
        //     }
        // })
        // $("#EDDContent").on('change', 'select', function () {
        //     var RequiredSum = 0, FieldSum = 0, EditSum = [0, 0];
        //     $("#EditSave").attr("disabled", true);
        //     for (var a in EditRequiredC) {
        //         $("#" + EditRequiredC[a] + "").val() != '' ? RequiredSum += 1 : RequiredSum += 0;
        //     }
        //     if (RequiredSum == EditRequiredC.length) {
        //         $("#EditSave").attr("disabled", false);
        //         RequiredSum = 0;
        //     } else {
        //         $("#EditSave").attr("disabled", true);
        //         RequiredSum = 0;
        //     }
        // })
        $("#progress,#loading").fadeOut(1000);
    })//編輯資料
    var CBAValue = [];
    $("#AddData").click(async function () {//新增資料
        // 主檔維護設定
        if (SID === "367252115657308") {
            window.location.href = `/${PROJECT_NAME}/setup/master-maintain-setting.html?ACTION=ADD&MODULE_TYPE=ADM&MODULE_NAME=SMART_MASTER&LEVEL=L3&BUTTON=A`
        }
        // Layout設定
        if (SID === "369761779674442") {
            window.location.href = `/${PROJECT_NAME}/setup/layout-setting/layoutSetting.html?action=add&MODULE_TYPE=ADM&MODULE_NAME=LAYOUT&LEVEL=L2&BUTTON=A`
        }
        var AddRequiredC = [];
        $("#ADDContent").empty();
        for (var i = 0; i < AllEditTitle.split(",").length; i++) {
            if (AllEditTitle.split(",")[i] == SidField) {
                SIDArray = "";
                SIDArray = SidField;
            }
            if ($.inArray(AllEditTitle.split(",")[i], EditTitle) >= 0) {
                var a = $.inArray(AllEditTitle.split(",")[i], EditTitle);

                switch (EditType[a].toUpperCase()) {
                    case 'TEXT':
                        if (['MSID', 'MASTER_SID'].includes(AllEditTitle.split(",")[i])) {
                            $("#ADDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + AllEditTitle.split(",")[i] + '</div>' + '<input class="col-7" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off" disabled="disabled"  />' + '</div>');
                        } else {
                            $("#ADDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + AllEditTitle.split(",")[i] + '</div>' + '<input class="col-7" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off"  />' + '</div>');
                        }
                        if (["MASTER_SID"].includes(ALLTitle.split(",")[i])) {
                            Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                        }
                        if (["OPERATION_CODE"].includes(ALLTitle.split(",")[i])) {
                            Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                        }
                        if (['MSID', 'MASTER_SID'].includes(ALLTitle.split(",")[i])) {
                            Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                        }
                        break;
                    case 'SMALLDATETIME':
                    case 'DATETIME':
                        $("#ADDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" autocomplete="off"/>' + '</div>');
                        let lastPickrTime = null;
                        flatpickr('#' + AllEditTitle.split(",")[i], {
                            enableTime: true,
                            dateFormat: "Y-m-d H:i",
                            allowInput: true,
                            time_24hr: true,
                            onChange: function (selectedDates, dateStr) {
                                if (selectedDates.length > 0 && lastPickrTime === dateStr.split(' ')[1]) {
                                    this.close();
                                }
                                lastPickrTime = dateStr.split(' ')[1];
                            }
                        })
                        break;
                    case 'DATE':
                        $("#ADDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" autocomplete="off"/>' + '</div>');
                        flatpickr('#' + AllEditTitle.split(",")[i], {
                            dateFormat: "Y-m-d",
                            allowInput: true,
                            onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                    this.close();
                                }
                            }
                        })
                        break;
                    case 'SELECT':
                        // $("#ADDContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<select id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" >' + SelectOption(EditValue[a]) + '</select><p>');
                        //進階搜尋下拉式 2023-05-03
                        $("#ADDContent").append(
                            '<div class="d-flex justify-content-between mb-1">' +
                            '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' +
                            '<select class="col-7" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '" required>' +
                            SelectOption(EditValue[a]) +
                            '</select>' +
                            '</div>'
                        );
                        if (SID === '385898768680272') {
                            let toldata = await getGridData('385899299673778');

                            // 綁定 OPERATION_SID 的變更事件
                            $(document).on('change', '#OPERATION_SID', function () {
                                let selectedSid = $(this).val(); // OPERATION_SID 的值
                                let selectedText = $("#OPERATION_SID option:selected").text(); // 對應的顯示名稱

                                // 以 OPERATION_CODE 當作 TOL_OPERATION 過濾條件（你可能需要對照碼表）
                                let matchedTolOptions = toldata.Grid_Data.filter(item => item.TOL_OPERATION === selectedText);

                                // 建立下拉選單選項 HTML（移除「請選擇」）
                                let html = '';
                                matchedTolOptions.forEach(item => {
                                    html += `<option value="${item.TOL_SID}">${item.TOL_NO}</option>`;
                                });

                                // 將對應的下拉欄位填入選項（假設 ID 是 TOL_SID）
                                $('#TOL_SID').html(html);
                            });
                        }


                        break;
                    case 'CHECKBOX':


                        CBAValue = EditValue[a].split("|");//417


                        $("#ADDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<div class="col-7">' + '<input class="text-end" type="CheckBox" id="' + AllEditTitle.split(",")[i] + '"   name="' + editFieldType(EditFieldType[a]) + '" />' + '</div>' + '</div>');
                        //417原來value設為CBAValue改為default

                        break;
                    case 'TEXTAREA':
                        $("#ADDContent").append('<div class="d-flex justify-content-between mb-1">' + '<div class="Lang col-4 text-end">' + GetLangDataV2(AllEditTitle.split(",")[i]) + '</div>' + '<TextArea class="col-7" id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off" ></textarea>' + '</div>');
                        break;
                }
                ChangeLang();
                if (AddRequired[a].toUpperCase() === 'TRUE') {
                    $("#" + AllEditTitle.split(",")[i] + "").css("background-color", "#f96c7226", "border", "1px solid #000");
                    AddRequiredC.push(AllEditTitle.split(",")[i]);
                } else {
                    $("#" + AllEditTitle.split(",")[i] + "").css("background-color", "#F9F9F9", "border", "1px solid #000");

                }

            }

        }
        RequiredC = AddRequiredC;
        // AddRequiredC.length > 0 ? $("#SaveData").attr("disabled", true) : "";
        // $("#ADDContent").on('change', 'input', function () {
        //     var sum = 0;
        //     $("#SaveData").attr("disabled", true);
        //     for (var a in AddRequiredC) {
        //         $("#" + AddRequiredC[a] + "").val() != '' ? sum += 1 : sum += 0;
        //     }
        //     if (sum == AddRequiredC.length) {
        //         $("#SaveData").attr("disabled", false);
        //         sum = 0;
        //     } else {
        //         $("#SaveData").attr("disabled", true);
        //         sum = 0;
        //     }
        // })
        // $("#ADDContent").on('change', 'select', function () {
        //     var sum = 0;
        //     $("#SaveData").attr("disabled", true);
        //     for (var a in AddRequiredC) {
        //         $("#" + AddRequiredC[a] + "").val() != '' ? sum += 1 : sum += 0;
        //     }
        //     if (sum == AddRequiredC.length) {
        //         $("#SaveData").attr("disabled", false);
        //         sum = 0;
        //     } else {
        //         $("#SaveData").attr("disabled", true);
        //         sum = 0;
        //     }
        // })
        $("#progress,#loading").fadeOut(1000);
    })//新增資料
    //--------
    $("#CopyData").click(function () {//編輯資料
        EditPkey = SelectData[col];
        $("#COPYContent").empty();
        var EditRequiredC = [];
        EditFiledData = []
        for (var i = 0; i < AllEditTitle.split(",").length; i++) {
            if (AllEditTitle.split(",")[i] == SidField) {
                EditString = "";
                EditString += " WHERE " + AllEditTitle.split(",")[i] + "=" + SelectData[i + 1];
            }
        }
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/GridColDataQuery',
            headers: { TokenKey: TokenID },
            data: {
                SelectData: AllEditTitle,
                TableName: TableName,
                QueryString: EditString
            },
            // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            // data: { funcName: "GridColDataQuery", SelectData: AllEditTitle, TableName: TableName, QueryString: EditString },
            dataType: 'json',
            async: false,
            success: function (result) {
                result = result.data;
                $.each(result[0], function (key, value) {
                    EditFiledData.push(value);
                    if (key == Unique) {
                        eUnique = value;
                    }
                });
            }
        });
        for (var i = 0; i < AllEditTitle.split(",").length; i++) {
            if (AllEditTitle.split(",")[i] == SidField) {
                SIDArray = "";
                SIDArray += AllEditTitle.split(",")[i] + "=" + EditFiledData[i]
            }
            //ALLTitle.split(",")[i].indexOf('SID') >= 0 ? SIDArray += ALLTitle.split(",")[i] + "=" + SelectData[i + 1] : "";//抓SID跟他的title
            if ($.inArray(AllEditTitle.split(",")[i], EditTitle) >= 0) {//如果有屬於要編輯的title的話
                var a = $.inArray(AllEditTitle.split(",")[i], EditTitle); //抓編輯的索引值
                switch (EditType[a].toUpperCase()) {
                    case 'TEXT':
                        $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<input id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off" /><p>');
                        $("#" + AllEditTitle.split(",")[i] + "").val(EditFiledData[i]);
                        break;
                    // case 'DATE':
                    //     $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<input type="button" id="' + AllEditTitle.split(",")[i] + '" value="' + EditFiledData[i] + '" name="' + editFieldType(EditFieldType[a]) + '" /><p>');
                    //     $("#" + AllEditTitle.split(",")[i] + "").datetimepicker({ timepicker: false, format: 'Y.m.d',scrollMonth:false,scrollTime:false,scrollInput:false });
                    //     break;
                    // case 'SMALLDATETIME':
                    // case 'DATETIME':
                    //     $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<input type="button" id="' + AllEditTitle.split(",")[i] + '" value="' + EditFiledData[i] + '" name="' + editFieldType(EditFieldType[a]) + '" /><p>');
                    //     $("#" + AllEditTitle.split(",")[i] + "").datetimepicker({scrollMonth:false,scrollTime:false,scrollInput:false});
                    //     break;
                    case 'SMALLDATETIME':
                    case 'DATETIME':
                        $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<input type="button" id="' + AllEditTitle.split(",")[i] + '" value="' + EditFiledData[i] + '" name="' + editFieldType(EditFieldType[a]) + '" /><p>');
                        let lastPickrTime = null;
                        flatpickr('#' + AllEditTitle.split(",")[i], {
                            enableTime: true,
                            dateFormat: "Y-m-d H:i",
                            allowInput: true,
                            time_24hr: true,
                            onChange: function (selectedDates, dateStr) {
                                if (selectedDates.length > 0 && lastPickrTime === dateStr.split(' ')[1]) {
                                    this.close();
                                }
                                lastPickrTime = dateStr.split(' ')[1];
                            }
                        })
                        break;
                    case 'DATE':
                        $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<input type="button" id="' + AllEditTitle.split(",")[i] + '" value="' + EditFiledData[i] + '" name="' + editFieldType(EditFieldType[a]) + '" /><p>');
                        flatpickr('#' + AllEditTitle.split(",")[i], {
                            dateFormat: "Y-m-d",
                            allowInput: true,
                            onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                    this.close();
                                }
                            }
                        })
                        break;
                    case 'SELECT':
                        $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<select id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '">' + SelectOption(EditValue[a]) + '</select><p>');
                        $("#" + AllEditTitle.split(",")[i] + "").val(EditFiledData[i]);

                        break;
                    case 'CHECKBOX':
                        CBEValue = EditValue[a].split("|");
                        $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<input type="CheckBox" id="' + AllEditTitle.split(",")[i] + '" value="' + CBEValue[0] + '" name="' + editFieldType(EditFieldType[a]) + '"/><p>');
                        EditFiledData[i].replace("         ", "") == CBEValue[0] ? $("#" + AllEditTitle.split(",")[i] + "").attr("checked", true) : "";






                        break;
                    case 'TEXTAREA':
                        $("#COPYContent").append('<div class="Lang">' + AllEditTitle.split(",")[i] + '</div>' + '<TextArea  id="' + AllEditTitle.split(",")[i] + '" name="' + editFieldType(EditFieldType[a]) + '"  autocomplete="off" >' + EditFiledData[i] + '</textarea><p>');
                        break;
                } //編輯的類型判斷
                //UpdateInEdit[a] === 'False' ? $("#" + AllEditTitle.split(",")[i] + "").attr("disabled", true) : "";
                if (AddRequired[a].toUpperCase() === 'TRUE') {
                    $("#" + AllEditTitle.split(",")[i] + "").css("background-color", "#f96c7226");
                    EditRequiredC.push(AllEditTitle.split(",")[i]);
                } else {
                    $("#" + AllEditTitle.split(",")[i] + "").css("background-color", "#F9F9F9");
                }
            }
        }
        ChangeLang();
        $("#COPYContent").on('change', 'input', function () {
            var RequiredSum = 0, FieldSum = 0, EditSum = [0, 0];
            $("#COPYSave").attr("disabled", true);
            for (var a in EditRequiredC) {
                $("#" + EditRequiredC[a] + "").val() != '' ? RequiredSum += 1 : RequiredSum += 0;
            }
            if (RequiredSum == EditRequiredC.length) {
                $("#COPYSave").attr("disabled", false);
                RequiredSum = 0;
            } else {
                $("#COPYSave").attr("disabled", true);
                RequiredSum = 0;
            }
        })
        $("#COPYContent").on('change', 'Select', function () {
            var RequiredSum = 0, FieldSum = 0, EditSum = [0, 0];
            $("#COPYSave").attr("disabled", true);
            for (var a in EditRequiredC) {
                $("#" + EditRequiredC[a] + "").val() != '' ? RequiredSum += 1 : RequiredSum += 0;
            }
            if (RequiredSum == EditRequiredC.length) {
                $("#COPYSave").attr("disabled", false);
                RequiredSum = 0;
            } else {
                $("#COPYSave").attr("disabled", true);
                RequiredSum = 0;
            }
        })
        $("#progress,#loading").fadeOut(1000);
    })//編輯資料
    $("#COPYClose").click(function () {
        $("#COPYContent").empty();
        EditPkey = "";
        $("#progress,#loading").fadeOut(1000);
    })
    $("#COPYSave").click(function () {
        GetUniqueValue();
        if (Unique != "" && UniqueArray.indexOf($("#" + Unique + "").val()) >= 0) {
            alert("Unique重複!");
            $("#progress,#loading").fadeOut(1000);
        }
        else {
            var AddVal = "", AddTitle = "";
            for (var i = 0; i < EditTitle.length; i++) {
                if ($.trim($("#" + EditTitle[i] + "").val()) != "") {
                    switch (EditFieldType[i].toUpperCase()) {
                        case 'DECIMAL':
                        case 'INT':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += CBEValue[1] + ",";
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += $("#" + EditTitle[i] + "").val() + ",";
                            }
                            break;
                        case 'DATETIME':
                        case 'SMALLDATETIME':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + CBEValue[1] + ":00',";
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + $("#" + EditTitle[i] + "").val() + "',";
                            }
                            break;
                        case 'DATE':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + CBEValue[1] + "',";
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + $("#" + EditTitle[i] + "").val() + "',";
                            }
                            break;
                        default:   //case char nvarchar nchar datetime smalldatetime date


                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += " N'" + CBEValue[1] + "',";



                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += " N'" + $("#" + EditTitle[i] + "").val() + "',";


                            }
                    }
                }
            }

            AddTitle += SidField;

            console.log("要傳給後端的資料：", {
                funcName: "AddSingleRowData",
                TableName: TableName,
                AddVal: AddVal,
                AddTitle: AddTitle,
                USER: username
            });
            $.ajax({
                type: 'post',
                url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                data: { funcName: "AddSingleRowData", TableName: TableName, AddVal: AddVal, AddTitle: AddTitle, USER: username },
                dataType: 'json',
                async: false,
                success: function (result) {
                    OrderFieldBy = " CREATE_TIME desc ";
                    GetGridData(1, 1, "");
                    $("#COPYClose").click();
                    $("#example tbody").find("tr").eq(0).addClass('selected');
                    SelectRowOnOff(false);
                    $("th").children("img").attr("src", "");
                    $("#TitleCREATE_TIME").children("img").attr("src", "../img/weyu/arrow-up.svg");
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (xhr.status = 500)
                        alert("資料格式錯誤!");
                    alert(thrownError);
                    $("#progress,#loading").fadeOut(1000);

                }
            });
        }
    })
    //--------
    $("#EditClose").click(function () {
        $("#EDDContent").empty();
        EditPkey = "";
        $("#progress,#loading").fadeOut(1000);
    })
    $("#AddClose").click(function () {
        $("#ADDContent").empty();
        // $("#SaveData").attr("disabled", true);
        $("#progress,#loading").fadeOut(1000);
    })
    $("#EditSave").click(function () {
        if (!CheckEditReq(RequiredC)) {
            alert('輸入不完全');
            return;
        }
        if (Unique != "" && UniqueArray.indexOf($("#" + Unique + "").val()) >= 0 && eUnique != $("#" + Unique + "").val()) {
            alert("Unique重複!");
        }
        else {
            var EditVal = "", log_val = "";
            for (var i = 0; i < EditTitle.length; i++) {

                if ($.trim($("#" + EditTitle[i] + "").val()) != "") {
                    if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                        log_val += EditTitle[i] + "=N'" + CBEValue[1] + "',";
                    }
                    else {
                        log_val += EditTitle[i] + "=N'" + $("#" + EditTitle[i] + "").val() + "',";
                    }
                    switch (EditFieldType[i].toUpperCase()) {
                        case 'DECIMAL':
                        case 'INT':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false)
                                EditVal += EditTitle[i] + "=" + CBEValue[1] + ",";
                            else
                                EditVal += EditTitle[i] + "=" + $("#" + EditTitle[i] + "").val() + ",";
                            break;
                        case 'DATE':
                            EditVal += EditTitle[i] + "='" + $("#" + EditTitle[i] + "").val() + "',";
                            break;
                        case 'DATETIME':
                        case 'SMALLDATETIME':
                            if ($("#" + EditTitle[i] + "").val().length > 16)
                                EditVal += EditTitle[i] + "='" + $("#" + EditTitle[i] + "").val() + "',";
                            else
                                EditVal += EditTitle[i] + "='" + $("#" + EditTitle[i] + "").val() + ":00',";
                            break;
                        default:   //case char nvarchar nchar datetime smalldatetime date
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                console.log('ncheck')
                                // EditVal += EditTitle[i] + "=N'" + CBEValue[1] + "',"; 4/18修改前
                                const cBoxValue = 'N'
                                EditVal += EditTitle[i] + "=N'" + cBoxValue + "',";

                                // const cBoxValue = 'N'
                                // EditVal += EditTitle[i] + cBoxValue + "',";
                            }


                            else {
                                // EditVal += EditTitle[i] + "=N'" + $("#" + EditTitle[i] + "").val() + "',";4/18修改前
                                if (EditType[i] == 'CheckBox') {
                                    const cBoxValue = 'Y'
                                    EditVal += EditTitle[i] + "=N'" + cBoxValue + "',";
                                } else { EditVal += EditTitle[i] + "=N'" + $("#" + EditTitle[i] + "").val() + "',"; }


                            }

                    }
                }


                //     AddTitle += EditTitle[i] + ",";//417
                //     const cBoxValue = 'N' //417checkbox uncheck的值
                //     AddVal += " N'"  + cBoxValue + "',";//
                // }
                // else {
                //     AddTitle += EditTitle[i] + ",";
                //     const cBoxValue = 'Y'  //417checkbox check的值
                //     AddVal += " N'" + $("#" + EditTitle[i] + "").val() + "',";
                // }
                else {
                    // log_val += " N'" + $("#" + EditTitle[i] + "").val() + "',";
                    switch (EditFieldType[i].toUpperCase()) {
                        case 'DECIMAL':
                        case 'INT':
                        case 'DATETIME':
                        case 'SMALLDATETIME':
                        case 'DATE':
                            EditVal += EditTitle[i] + "=" + 'NULL' + ",";
                            log_val += EditTitle[i] + "=" + 'NULL' + ",";

                            break;
                        default:   //case char nvarchar nchar datetime smalldatetime date
                            EditVal += EditTitle[i] + "=N'',";
                            log_val += EditTitle[i] + "=N'',";

                    }
                }
            }
            //alert(EditVal);
            $.ajax({
                type: 'post',
                url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/UpdGridData',
                headers: { TokenKey: TokenID },
                data: {
                    TableName: TableName,
                    SID: SIDArray,
                    EditVal: EditVal,
                    USER: username,
                    SID_VAL: SID,
                    log_val: log_val,
                },
                // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                // data: { funcName: "UpdGridData", TableName: TableName, SID: SIDArray, EditVal: EditVal, USER: username,SID_VAL:SID,log_val : log_val },
                dataType: 'json',
                async: false,
                success: function (result) {
                    GetGridData(2, pgn, QueryString);
                    AfterDML(EditPkey);
                    $("#EditClose").click();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (xhr.status = 500)
                        alert("資料格式錯誤!");
                    alert(thrownError);
                    $("#progress,#loading").fadeOut(1000);

                }
            });
        }
    })
    ADDstate = false;
    $("#SaveData").click(function () {

        if (!CheckReq(RequiredC)) {
            alert('輸入不完全');
            return;
        }

        if (Unique != "" && UniqueArray.indexOf($("#" + Unique + "").val()) >= 0) {
            alert("Unique重複!");
        }
        else {
            var AddVal = "", AddTitle = "", log_val = "";
            for (var i = 0; i < EditTitle.length; i++) {
                let CheckBoxCount = 0 //有多少個checkbox
                console.log($.trim($("#" + EditTitle[i] + "").val()) == "", EditTitle[i])
                if ($.trim($("#" + EditTitle[i] + "").val()) != "") {
                    log_val += " N'" + $("#" + EditTitle[i] + "").val() + "',";
                    switch (EditFieldType[i].toUpperCase()) {
                        case 'DECIMAL':
                        case 'INT':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += CBAValue[1] + ",";
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += $("#" + EditTitle[i] + "").val() + ",";
                            }
                            break;
                        case 'DATETIME':
                        case 'SMALLDATETIME':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + CBAValue[1] + ":00',";
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + $("#" + EditTitle[i] + "").val() + ":00',";
                            }
                            break;
                        case 'DATE':
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + CBAValue[1] + "',";
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                AddVal += "'" + $("#" + EditTitle[i] + "").val() + "',";
                            }
                            break;
                        default:   //case char nvarchar nchar datetime smalldatetime date

                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false) {

                                AddTitle += EditTitle[i] + ",";//417
                                const cBoxValue = 'N' //417checkbox uncheck的值
                                AddVal += " N'" + cBoxValue + "',";//
                            }
                            else {
                                AddTitle += EditTitle[i] + ",";
                                const cBoxValue = 'Y'  //417checkbox check的值
                                if (EditType[i] == 'CheckBox') {
                                    AddVal += " N'" + cBoxValue + "',";
                                }
                                else { AddVal += " N'" + $("#" + EditTitle[i] + "").val() + "',"; }
                            }
                    }
                }

            }
            AddTitle += SIDArray;
            $.ajax({
                type: 'post',
                url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/AddSingleRowData',
                headers: { TokenKey: TokenID },
                data: {
                    TableName: TableName,
                    AddVal: AddVal,
                    AddTitle: AddTitle,
                    USER: username,
                    SID_VAL: SID,
                    log_val: AddVal
                },
                // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                // data: { funcName: "AddSingleRowData", TableName: TableName, AddVal: AddVal, AddTitle: AddTitle, USER: username,SID_VAL : SID ,log_val: log_val },
                dataType: 'json',
                async: false,
                success: function (result) {
                    OrderFieldBy = " CREATE_TIME desc ";
                    GetGridData(1, 1, "");
                    ADDstate = true;
                    $("#example tbody").find("tr").eq(0).addClass('selected');
                    SelectRowOnOff(false);
                    $("th").children("img").attr("src", "");
                    $("#TitleCREATE_TIME").children("img").attr("src", "../img/weyu/arrow-up.svg");
                    SelectData = $('#example').DataTable().row('.selected').data();
                    //GetUniqueValue();
                    $("#AddClose").click();
                    QuerySave.click();//2023-12-27觸發查詢過濾功能
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (xhr.status = 500)
                        alert("資料格式錯誤!");
                    alert(thrownError);
                    $("#progress,#loading").fadeOut(1000);

                }
            });
        }
    })
    $("#QuerySave").click(function () {
        var SplitQuery;
        QueryString = " WHERE "
        for (var i = 0; i < QueryArray.length; i++) { //Query
            if (TitleFalseV.indexOf(i + 1) == -1 && QueryArray[i].toUpperCase() != 'FALSE') {
                switch (QueryArrayWE[i].toUpperCase()) {//QueryEditType
                    case 'TEXT':
                    case 'TEXTAREA':
                    case 'SELECT':
                    case 'CHECKBOX':
                        if ($.trim($("#Q" + ALLTitle.split(",")[i] + "").val()) != "") {
                            SplitQuery = $("#Q" + ALLTitle.split(",")[i] + "").val().trim().split("||");
                            switch ($("#Q" + ALLTitle.split(",")[i] + "").attr("name")) {
                                case 'numType':
                                    if (SplitQuery.length > 1) {
                                        for (var sp = 0; sp < SplitQuery.length; sp++) {
                                            QueryString += ALLTitle.split(",")[i] + "=" + SplitQuery[sp].trim() + " OR ";
                                        }
                                        QueryString = QueryString.substring(0, QueryString.length - 4) + " AND ";
                                    }
                                    else {
                                        QueryString += ALLTitle.split(",")[i] + "=" + $("#Q" + ALLTitle.split(",")[i] + "").val().trim() + " AND ";
                                    }
                                    break;
                                case 'strType':
                                    if (SplitQuery.length > 1) {
                                        for (var sp = 0; sp < SplitQuery.length; sp++) {
                                            QueryString += ALLTitle.split(",")[i] + " LIKE N'%" + SplitQuery[sp].trim() + "%' OR ";
                                        }
                                        QueryString = QueryString.substring(0, QueryString.length - 4) + " AND ";

                                    }
                                    else {
                                        QueryString += ALLTitle.split(",")[i] + " LIKE N'%" + $("#Q" + ALLTitle.split(",")[i] + "").val().trim() + "%' AND ";

                                    }
                                    break;
                                case 'dateType':
                                    QueryString += ALLTitle.split(",")[i] + "='" + $("#Q" + ALLTitle.split(",")[i] + "").val().trim() + "' AND ";
                                    break;
                            }
                        }
                        break;
                    case 'SMALLDATETIME':
                    case 'DATETIME':
                        var qds = $("#QDS" + ALLTitle.split(",")[i] + "").val().trim(), qde = $("#QDE" + ALLTitle.split(",")[i] + "").val().trim();
                        if (qds != "" && qde != "") {
                            QueryString += ALLTitle.split(",")[i] + " BETWEEN '" + qds + ":00" + "' AND '" + qde + ":59" + "' AND ";
                        } else if (qds == "" && qde != "") {
                            QueryString += ALLTitle.split(",")[i] + "<='" + qde + ":59" + "' AND "
                        }
                        else if (qds != "" && qde == "") {
                            QueryString += ALLTitle.split(",")[i] + ">='" + qds + ":00" + "' AND "
                        }
                        break;
                    case 'DATE':
                        var qds = $("#QDS" + ALLTitle.split(",")[i] + "").val().trim(), qde = $("#QDE" + ALLTitle.split(",")[i] + "").val().trim();
                        if (qds != "" && qde != "") {
                            QueryString += ALLTitle.split(",")[i] + " BETWEEN '" + qds + "' AND '" + qde + " 23:59:59" + "' AND "
                        } else if (qds == "" && qde != "") {
                            QueryString += ALLTitle.split(",")[i] + "<='" + qde + " 23:59:59" + "' AND "
                        }
                        else if (qds != "" && qde == "") {
                            QueryString += ALLTitle.split(",")[i] + ">='" + qds + "' AND "
                        }
                        break;
                }
            }
        }
        QueryString != " WHERE " ? QueryString = QueryString.substring(0, QueryString.length - 4) : QueryString = "";

        CurrentRow = [], DataSet = [];
        GetGridData(1, 1, QueryString)//撈資料
        GetPageInfo("y");
        SqlTimes == 1 ? $("#NexPage").attr("disabled", true) : $("#NexPage").attr("disabled", false);
        table.clear().draw();
        table.destroy();
        TableSet();
        $("#QueryClose").click();
        ChangeLang();
        pgn = 1
        $("#PageNum").val(pgn);
        $("#PrePage").attr("disabled", true);
        $("#progress,#loading").fadeOut(1000);
        WithQuery = 1;
        SelectRowOnOff(true);
    })
    var Delval = "";
    $('#DeleteData').click(function () {
        $("#DELETEContent").empty();
        $("#DELETEContent").append('<div style="font-size:30px">是否要刪除?</div>')
        for (var i = 0; i < SelectData.length - 1; i++) {
            if (TitleFalseV.indexOf(i) == -1)
                $("#DELETEContent").append('<span style="color:red;">' + ColName[i + 1] + " : " + SelectData[i + 1] + '</span><p>')
        }
        Delval = SelectData[col];
    });
    $("#DELETESave").click(function () {
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/DelRowData',
            headers: { TokenKey: TokenID },
            data: {
                TableName: TableName,
                Delval: Delval,
                SID: SidField,
                SID_VAL: SID,
                USER: username
            },
            // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            // data: { funcName: "DelRowData", TableName: TableName, Delval: Delval, SID: SidField,SID_VAL : SID,USER: username },
            dataType: 'json',
            async: false,
            success: function (result) {
                table.row('.selected').remove().draw(false);
                SelectRowOnOff(true);
                $("#DELETECancel").click();
                Delval = "";
                GetGridData(1, 1, "");
                $("#progress,#loading").fadeOut(1000);
            }
        });
    })
    $('#Mutiadd').click(function () {
        window.location = 'MasterMaintainMutipleData.html?SID=' + SID;
    });
    $('#CK').click(function () {
        window.location = 'FormADD.html?SID=' + SID;
    });
    $("#PrePage").click(function () {
        PreviousPageNextPage(-1, "PrePage", "NexPage")
    })
    $("#NexPage").click(function () {
        PreviousPageNextPage(1, "NexPage", "PrePage")
    })
    //CRUD 操作設定 ---- end
    var SortState, tmpText = "";
    $("th").click(function () {
        tmpText = this.innerText;
        //alert(this.id.toString().substring(5, this.id.toString().length))
        $("th").children("img").attr("src", "");
        if (OrderFieldBy == this.id.toString().substring(5, this.id.toString().length)) {
            OrderFieldBy += " desc "
            $("#" + this.id + "").children("img").attr("src", "../img/weyu/arrow-up.svg");
        } else {
            OrderFieldBy = this.id.toString().substring(5, this.id.toString().length);
            $("#" + this.id + "").children("img").attr("src", "../img/weyu/arrow-down.svg");
        }
        OrderFieldBy == 'state' ? OrderFieldBy = SidField : "";
        GetGridData(2, pgn, QueryString)
        SortState = this.id;
        SelectRowOnOff(true);
    });
    $("#ExportExcel").click(function () {
        //alert("black hole!");
        var a = ALLTitle.split(","), b = "", c = "";

        for (var i = 0; i < a.length; i++) {
            if (TitleFalseV.indexOf(i + 1) == -1) {
                b += a[i] + ",";
                c += ColName[i + 1] + ",";
            }
        }
        b = b.substring(0, b.length - 1);
        c = c.substring(0, c.length - 1);

        // QueryString = Get_QS_STRING(QueryString);//2023-11-08新增


        let Export_Body = {
            FileName: htmlTitle,
            ColName: c,
            SQL: "SELECT " + b + " FROM " + GRIDTABLENAME + QueryString,
            mode: "MasterMaintain",
            CheckCol: b,
            SID: SID,
            customNumericFieldsIndex: ""
        };

        // 构建请求体
        let requestBody = JSON.stringify(Export_Body);
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/Exportxlsx',
            headers: { TokenKey: TokenID },
            contentType: "application/json",
            data: requestBody,
            // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/ExtendHandler.ashx',
            // data: { funcName: "Exportxlsx", FileName: htmlTitle, ColName: c, SQL: "SELECT " + b + " FROM " + GRIDTABLENAME + QueryString, mode: "MasterMaintain",CheckCol: b,SID:SID },//ExportExcel
            //dataType: 'json',
            async: false,
            success: function (result) {
                result = result.PATH;
                window.location.href = window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/Excel/' + result;
                $("#progress,#loading").fadeOut(1000);
            },
            error: function (jqXHR, exception) {
                JasonError("GetLangType", jqXHR, exception);
                $("#progress,#loading").fadeOut(1000);
            }
        });
    })

    var rowData; // 宣告rowData
    $('#example tbody').on('click', 'tr', function () { //選擇事件
        //多行選擇
        //$(this).toggleClass('selected');
        //單行選擇
        if ($(this).hasClass('selected')) { //如果已經被選取
            $(this).removeClass('selected');  //移除選擇標記
            SelectData = "";
            SelectRowOnOff(true);
            isedit = false;
        } else {                            //如果未被選取
            table.$('tr.selected').removeClass('selected'); //移除之前被選擇的標記
            $(this).addClass('selected');           //現在被選擇的標記
            SelectData = $('#example').DataTable().row('.selected').data(); //獲取選擇的資料
            rowData = getRowData(this); // 獲取選擇資料的rowdata 11/8新增 未用到先放著
            SelectRowOnOff(false);
            if (EditTitle.length < 1) {
                $("#EditData").prop("disabled", true);  //開啟編輯按鈕
            }
            isedit = true;
        }

        function getRowData(rowHtml) {
            // 取得RowData元素
            var tdElements = rowHtml.querySelectorAll('td');

            if (tdElements) {
                // 取得 column 欄位名
                var thElements = document.querySelectorAll('th');
                var thTextList = Array.from(thElements).map(item => item.textContent);
                // 取得RowData內文
                var tdTextList = Array.from(tdElements).map(item => item.textContent);

                // 將結果儲存
                var RowData = {};
                for (var i = 0; i < thTextList.length; i++) {
                    RowData[thTextList[i]] = tdTextList[i]
                }

                return RowData
            }

            return null;
        }
    });//選擇事件

    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            switch (e.keyCode) {
                case 80: //p
                    //alert('換頁功能(未完成)');
                    GetGridData(4, SqlTimes, QueryString);
                    SqlTimes == 1 ? $("#PrePage").attr("disabled", true) : $("#PrePage").attr("disabled", false);
                    break;
                case 79: //q
                    GetGridData(1, 1, QueryString);
                    break;
                case 83:  //s
                    SelectData != undefined ? alert(SelectData[col]) : "";
                    SIDMemory = SelectData[col];
                    break;
                case 67: //c
                    alert(ColName[col]);
                    break;
                case 49: //1
                    if (SelectData != undefined) {
                        alert(SelectData);
                    }
                    break;
                case 50:
                    alert(ColName);
                    break;
            }
        }
    })
    $(document).keydown(function () {
        //alert(event.keyCode);
        //alert(Keyboard)
        switch (event.keyCode) {
            case 39:
                pgn < SqlTimes ? $("#NexPage").click() : "";
                break;
            case 37:
                pgn > 1 ? $("#PrePage").click() : "";
                break;
            case 45:
                if ($("#ADD").hasClass('show') == false && $("#DELETE").hasClass('show') == false && $("#ADD").hasClass('show') == false && $("#EDD").hasClass('show') == false && $("#Query").hasClass('show') == false && $("#AddData").attr('disabled') != true)
                    $("#AddData").click();
                break;
            case 46:
                $('#example tbody tr').hasClass('selected') == true && $("#DELETE").hasClass('show') == false && $("#ADD").hasClass('show') == false && $("#EDD").hasClass('show') == false && $("#Query").hasClass('show') == false ? $('#DeleteData').click() : "";
                break;
            //case 65 && 90:
            //    alert('ctrl');
            //    break;
        }
    })
    function GetGridData(refresh = 0, pg, QS = "") {//撈資料 GetGridData(刷新[0,1],頁數,查詢子句[ where ....],//顯示筆數)

        // QS = Get_QS_STRING(QS) //2023-11-08新增

        CurrentRow = [];
        DataSet = [];
        CheckLoadNum == 0 ? GetPageInfo() : "";
        $.ajax({
            type: 'post',
            //url: window.location.protocol+'//localhost/DCMATEV4/DataPasteTest/DataPasteTestHandler.ashx',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "SplitPageDataGridQuery", TableName: GRIDTABLENAME, SelectData: "TOP " + perPData + " " + ALLTitle, PageNum: pg, SID: OrderFieldBy, QueryString: QS, perPData: perPData },
            dataType: 'json',
            async: false,
            success: function (result) {
                var rowV = 0;
                for (var i = 0; i < result.length; i++) {
                    CurrentRow.push("-");
                    rowV = 0;
                    for (var j in result[i]) {
                        if ($.isNumeric(result[i][j]) != true && $.isNumeric(Date.parse(result[i][j])) == true && QueryArrayWE[rowV].toUpperCase() != "TEXT") {
                            var timestamp = new Date(Date.parse(result[i][j]));
                            if (QueryArrayWE[rowV].toUpperCase() == "DATE") {
                                timestamp = timestamp.getFullYear() + "-" + overnine((timestamp.getMonth() + 1)) + "-" + overnine(timestamp.getDate());

                            } else {
                                timestamp = timestamp.getFullYear() + "-" + overnine((timestamp.getMonth() + 1)) + "-" + overnine(timestamp.getDate()) + " " + overnine(timestamp.getHours()) + ":" + overnine(timestamp.getMinutes()) + ":" + overnine(timestamp.getSeconds());
                            }
                            CurrentRow.push(timestamp);
                        } else {
                            CurrentRow.push(result[i][j])
                        }
                        rowV += 1;
                    }
                    DataSet.push(CurrentRow);
                    CurrentRow = [];
                }
            }
        });
        if (refresh != 0) {
            table.clear().draw();
            table.destroy();
            TableSet();
            ChangeLang();
            switch (refresh) {
                case 1: //第一頁
                    pgn = 1;
                    $("#PrePage").attr("disabled", true);
                    SqlTimes != 1 ? $("#NexPage").attr("disabled", false) : $("#NexPage").attr("disabled", true);
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4: //最後一頁
                    pgn = SqlTimes;
                    $("#PrePage").attr("disabled", false);
                    $("#NexPage").attr("disabled", true);
                    break;
                default:
                    break;
            }
            $("#PageNum").val(pgn);
            $("#progress,#loading").fadeOut();
        }
    }
    function GetPageInfo(QTS = "n") {
        var q = "";
        QTS != "n" ? q = QueryString : q = "";
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/GridColDataQuery',
            headers: { TokenKey: TokenID },
            data: {
                SelectData: " COUNT(" + SidField + ") ",
                TableName: GRIDTABLENAME,
                QueryString: q
            },
            // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            // data: { funcName: "GridColDataQuery", TableName: GRIDTABLENAME, SelectData: " COUNT(" + SidField + ") ", QueryString: q },
            dataType: 'json',
            async: false,
            success: function (result) {
                result = result.data;
                $.each(result[0], function (key, value) {
                    DataSummary = value;
                })
                SqlTimes = Math.ceil(DataSummary / perPData);
                SqlTimes == 0 ? SqlTimes = 1 : '';
                CheckLoadNum = 1;
                let pages = GetLangDataV2("pages");
                let entries = GetLangDataV2("entries");
                $("#totalnum").text(SqlTimes + " " + pages + " (" + DataSummary + entries + ")");

                //if(SqlTimes == 1){
                //    $("#NexPage").attr("disabled", true) ;
                //    $("#PrePage").attr("disabled", true) ;
                //}
                //if($("#PageNum").val==1)
                //{
                //    $("#PrePage").attr("disabled", true);
                //}else{
                //    pgn==SqlTimes?$("#NexPage").attr("disabled", true):"";
                //}
                SqlTimes == 1 ? $("#NexPage").attr("disabled", true) : $("#NexPage").attr("disabled", false);
                pgn == SqlTimes ? $("#NexPage").attr("disabled", true) : "";
            }
        });
    }
    function AfterDML(SelectKey) {
        table.$('tr.selected').removeClass('selected');
        for (var i = 0; i < $("#example tbody").find("tr").length; i++) {
            table.$('tr.selected').removeClass('selected');
            $("#example tbody").find("tr").eq(i).addClass('selected');
            SelectData = $('#example').DataTable().row('.selected').data();
            if (SelectData[col] == SelectKey) {
                break;
            } else {
                continue;
            }
        }
    }
    function SelectRowOnOff(OPEN) {
        $("#EditData").prop("disabled", OPEN);
        $("#DeleteData").prop("disabled", OPEN);
        $("#CopyData").prop("disabled", OPEN);
        $("#Appendix").prop("disabled", OPEN);
        //2024-01-10 edit/add合併
        if (OPEN) {
            $("#EditData").hide();
            $("#AddData").show();
        }
        else {
            $("#EditData").show();
            $("#AddData").hide();
        }
    }
    function DataAddOnOff(OPEN) {
        $("#Mutiadd").prop("disabled", OPEN);
        $("#CopyData").prop("disabled", OPEN);
        $("#AddData").prop("disabled", OPEN);
        //2024-01-10 edit/add合併
        if (OPEN) {
            $("#AddData").hide();
        }
        else {
            $("#AddData").show();
        }
    }
    function editFieldType(eFT) { //name賦值
        var editFtype = "";
        switch (eFT) {
            case 'INT':
            case 'DECIMAL':
                editFtype = 'numType';
                break;
            case 'nvarchar':
            case 'varchar':
            case 'char':
            case 'nchar':
                editFtype = 'strType';
                break;
            default:
                editFtype = 'dateType';
                break;
        }
        return editFtype;
    }  //name賦值
    function SelectOption(SSO) { //選項賦值
        var SSOhtml = "";
        SSOhtml = '<option value="">-</option>';
        var x = 0, cal = 0;
        if (SSO.indexOf('SQL') >= 0) {
            $.ajax({
                type: 'post',
                url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/OptSql',
                headers: { TokenKey: TokenID },
                data: {
                    SQ: SSO.replace("SQL:", "")
                },
                // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                // data: { funcName: "OptSql", SQ: SSO.replace("SQL:", "") },
                dataType: 'json',
                async: false,
                success: function (result) {

                    result = result.data;

                    // alert(result.length)
                    for (var i = 0; i < result.length; i++) {
                        for (var a in result[0]) {
                            cal += 1;
                        }
                    }
                    // alert(cal);
                    if (cal != result.length) {

                        for (var i = 0; i <= result.length; i++) {
                            for (var a in result[0]) {
                                if (x == 0) {
                                    SSOhtml += '<option value="' + result[i][a] + '" >'
                                    x = 1;

                                } else if (x == 1) {
                                    SSOhtml += result[i][a] + '</option>';
                                    x = 0;

                                }
                                //SSOhtml += '<option value="' + result[i][a] + '" >' + result[i][a] + '</option>';
                            }
                        }

                    } else {
                        for (var i = 0; i <= result.length; i++) {
                            for (var a in result[1]) {
                                SSOhtml += '<option value="' + result[i][a] + '" >' + result[i][a] + '</option>';
                            }
                        }
                    }
                }
            });
        } else {
            for (var i = 0; i < SSO.split("|").length; i++) {
                SSOhtml += '<option value="' + SSO.split("|")[i] + '" >' + SSO.split("|")[i] + '</option>';
                //alert(SSO.split("|")[i]);
            }
        }
        console.log(SSOhtml)
        return SSOhtml;
    } //選項賦值
    function overnine(t) {
        t <= 9 ? t = "0" + t : t;
        return (t)
    }
    function TableSet() {//DataTable管理
        table = $('#example').DataTable({
            data: DataSet,
            dom: 'frt',
            "lengthMenu": [perPData],
            "ordering": false,
            "searching": false,
            "columnDefs": [
                {
                    "targets": TitleFalseV,//隱藏的欄位
                    "visible": false
                },

            ]
        });
        table.column(0).visible(false);

        //根據查詢 隱藏對應的欄位 2023-12-15
        switch (SID) {
            case "336144755800209":
                table.column(6).visible(false);
                break;
            case "337101820166137":
                table.column(2).visible(false);
                break;
        }

        ChangeLang();
    }
    function PreviousPageNextPage(key, id1, id2) {
        pgn += key;
        $("#PageNum").val(pgn);
        GetGridData(2, pgn, QueryString);
        $("#" + id2 + "").attr("disabled", false);
        if (id1 == "PrePage" && $("#PageNum").val() == 1) {
            $("#" + id1 + "").attr("disabled", true);
        } else if (id1 == "NexPage" && $("#PageNum").val() == SqlTimes) {
            $("#" + id1 + "").attr("disabled", true);
        } else $("#" + id1 + "").attr("disabled", false);
        SelectRowOnOff(true);
    }
    function GetUniqueValue() {
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_Api_Name + '/api/GridColDataQuery',
            headers: { TokenKey: TokenID },
            data: {
                SelectData: Unique,
                TableName: TableName,
                QueryString: ""
            },
            // url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            // data: { funcName: "GridColDataQuery", SelectData: Unique, TableName: TableName, QueryString: "" },
            dataType: 'json',
            async: false,
            success: function (result) {
                // result = result.data;
                for (var i in result) {
                    $.each(result[i], function (key, value) {
                        UniqueArray.push(value + '')
                    });
                }
            }
        });
    }
    $("#CK").click(function () {
        CKMD == 0 ? CKMD = 1 : CKMD = 0;
    })
    function CK_clear() {
        for (var i = 0; i < EditTitle.length; i++) {
            $("#" + EditTitle[i] + "").val("")
        }
    }
    $("#perPData").on('change', function () {
        perPData = Number($("#perPData").val());
        GetGridData(1, 1, QueryString);
        GetPageInfo(QueryString);
        $("#progress,#loading").fadeOut();
    })
    $("#PageNum").on('change', function () {
        if ($("#PageNum").val() > SqlTimes || $("#PageNum").val() < 1) {
            alert("超出頁數!");
        } else {
            pgn = Number($("#PageNum").val());
            GetGridData(5, pgn, QueryString);
            $("#PageNum").val(pgn);
            pgn == 1 ? $("#PrePage").attr("disabled", true) : $("#PrePage").attr("disabled", false);
            pgn == SqlTimes ? $("#NexPage").attr("disabled", true) : $("#NexPage").attr("disabled", false);
            $("#progress,#loading").fadeOut(1000);
        }
    })
    $('body').off('onload');
    $("th").append('<img />');


    //2023-11-08 用JS 觸發 實現按下查詢篩選資料功能
    let querySaveButton = document.getElementById('QuerySave');
    querySaveButton.click();


    let backButton = document.getElementById("backButton");

    // 添加点击事件处理程序
    backButton.addEventListener("click", function () {
        history.back();
        // GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
    });


})

//檢查新增必輸
function CheckReq(RequiredC) {
    var sum = 0;

    for (var a in RequiredC) {
        $("#" + RequiredC[a] + "").val() != '' ? sum += 1 : sum += 0;



    }
    if (sum == RequiredC.length) {
        //$("#SaveData").attr("disabled", false);
        sum = 0;
        return true;
    } else {
        //alert('輸入不完全');
        sum = 0;
        return false;
    }
}



//檢查編輯必輸
function CheckEditReq(RequiredC) {
    var RequiredSum = 0, FieldSum = 0, EditSum = [0, 0];
    for (var a in RequiredC) {
        $("#" + RequiredC[a] + "").val() != '' ? RequiredSum += 1 : RequiredSum += 0;
    }
    if (RequiredSum == RequiredC.length) {
        //$("#EditSave").attr("disabled", false);
        return true;
        RequiredSum = 0;
    } else {
        //$("#EditSave").attr("disabled", true);
        return false;
        RequiredSum = 0;
    }
}

