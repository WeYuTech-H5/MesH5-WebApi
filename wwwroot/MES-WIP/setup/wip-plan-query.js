// const tmpip = '10.0.20.114';
// const tmpWebSiteName = 'WeyuBiApi';
// //
//換版用 Ctrl+f 替換  http://'+tmpip+'/'+tmpWebSiteName+'/api/ ==>  http://'+default_ip+'/'+default_WebSiteName+'/api/

// var default_WebSiteName = 'WYBI_API';
//2024-01-10 edit/add合併
var isedit = true;
var rowArray
//$.fn.DataTable.ext.pager.numbers_length = 1;
$(document).ready(function () {
    // var username = GetSessionData('UESERNAME');
    var username = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo');
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
    var ODF = Request["ODF"]  ;

    //2023-11-08 整併參數列
    //設備維護參數
    var DEPT_NO = Request["DEPT_NO"];

    //backUrl參數
    var MODULE_TYPE = Request["MODULE_TYPE"] || null;
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;
    
    let backButton = document.getElementById("backButton");

    // 添加点击事件处理程序
    backButton.addEventListener("click", function() {
        GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
    });


    //2023-11-08新增 指定查詢的參數欄位 塞入參數
    function Set_Query_String(id){
        switch(SID){
            case '338297914450237':
            case "338297847263983":
            case "347301502426686":
                $('#Q'+id).val(DEPT_NO);
                $('#'+id).val(DEPT_NO);
                break;
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
        // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/MasterMainGridCol' ,
        // headers: {  SID: SID, TokenKey:TokenID},
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        data: { funcName: "MasterMainGridCol", SID: SID },
        dataType: 'json',
        async: false,
        success: function (result) {
            // result = result.data;
            for (var i = 0; i < result.length; i++) {
                QueryArray.push(result[i].CANQUERY);
                QueryArrayWE.push(result[i].EDITTYPE);
                QueryFiledType.push(result[i].FIELD_TYPE);
                QUERYeditv.push(result[i].EDITVALUE);
                ALLTitle == "" ? ALLTitle += result[i].COL_NAME : ALLTitle += (',' + result[i].COL_NAME);
                $('#addtitle').append('<th id="Title' + result[i].TITLE + '">' + GetLangDataV2(result[i].TITLE) + '</th>');
                if (result[i].HIDDEN == 'True') {
                    TitleFalseV.push(i + 1);
                }
            }
            $("th").addClass("Lang").addClass("text-nowrap");
        }//alert(TitleArray);不是HIDDEN!=True就加入標題
    });//撈標題
    var TableName = "", GRIDTABLENAME = "", SidField = "", WebHeader = "", Unique = "", EnADD = "", EnDEL = "", EnEDIT = "", EnQUERY = "", htmlTitle = "";
    $.ajax({ //撈tablename
        type: 'post',
        // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/MasterMain' ,
        // headers: {  SID: SID , TokenKey:TokenID},
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        data: { funcName: "MasterMain", SID: SID },
        dataType: 'json',
        async: false,
        success: function (result) {

            // result = result.data;

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
    if(typeof(ODF)=='undefined'){
        OrderFieldBy = SidField
    }
    else{
        OrderFieldBy = ODF ;
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
        // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/MasterMainCol' ,
        // headers: {  SID: SID , TokenKey:TokenID},
        url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        data: { funcName: "MasterMainCol", SID: SID },
        dataType: 'json',
        async: false,
        success: function (result) {

            // result = result.data;

            for (var i = 0; i < result.length; i++) {
                QueryEditType.push(result[i].EDITTYPE);
                QueryEditValue.push(result[i].EDITVALUE);
                QueryEditFieldType.push(result[i].FIELD_TYPE);
                AllEditTitle == "" ? AllEditTitle += result[i].COL_NAME : AllEditTitle += (',' + result[i].COL_NAME);
                if (result[i].EDITABLE === 'True') { //可以被編輯的話
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
        if (TitleFalseV.indexOf(i + 1) == -1 && QueryArray[i] != 'False') {
            switch (QueryArrayWE[i].toUpperCase()) {
                case 'SELECT':
                    // $("#QueryContent").append('<div class="Lang">' + ALLTitle.split(",")[i] + '</div>' + '<select id="Q' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" >' + SelectOption(QUERYeditv[i]) + '</select><p>');
                    //進階搜尋下拉式 2023-05-03
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">'+'<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="col-7" list="DATALIST_' + ALLTitle.split(",")[i] + '" id="Q' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '" required="" autocomplete="off" >' + '<datalist id="DATALIST_' + ALLTitle.split(",")[i] + '">' + SelectOption(QUERYeditv[i]) + '</datalist>' + '</div>');
                    
                    if(["DEPT_NO"].includes(ALLTitle.split(",")[i])){
                        Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                    }
                    
                    
                    break;
                case 'TEXT':
                case 'TEXTAREA':
                case 'CHECKBOX':
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">'+'<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="col-7" id="Q' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '"  autocomplete="off"  />'+'</div>');
                    if(["DEPT_NO"].includes(ALLTitle.split(",")[i])){
                        Set_Query_String(ALLTitle.split(",")[i]);//2023-11-08新增
                    }
                    break;
                case 'SMALLDATETIME':
                case 'DATETIME':
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">'+'<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="QDS' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '"  />');
                    DTpacker.push('QDS' + ALLTitle.split(",")[i]);
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">'+ '<div class="Lang col-4 text-end"> ~ </div> <input class="flatpickr-input col-7"  type="button" id="QDE' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '"/>'+'</div>');
                    DTpacker.push('QDE' + ALLTitle.split(",")[i]);
                    break;
                case 'DATE':
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">'+'<div class="Lang col-4 text-end">' + GetLangDataV2(ALLTitle.split(",")[i]) + '</div>' + '<input class="flatpickr-input col-7" type="button" id="QDS' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '"  />');
                    Dpacker.push('QDS' + ALLTitle.split(",")[i]);
                    $("#QueryContent").append('<div class="d-flex justify-content-between mb-1">'+'<div class="Lang col-4 text-end"> ~ </div> <input class="flatpickr-input col-7" type="button" id="QDE' + ALLTitle.split(",")[i] + '" name="' + editFieldType(QueryFiledType[i]) + '"/>'+'</div>');
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
    $("#EditData").click(function () {//編輯資料
        url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/MES-WIP/OPI/checkout/wo-check-out.html?DEPT_NO="+DEPT_NO+"&WIP_OPI_WDOEACICO_HIST_SID="+rowArray[1]
        window.location.href = url
    })//編輯資料
    var CBAValue = [];
    $("#AddData").click(function () {
        url = window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/MES-WIP/OPI/planopi/wo-plan-opi.html?DEPT_NO="+DEPT_NO
        window.location.href = url
    })
    $("#EditClose").click(function () {
        $("#EDDContent").empty();
        EditPkey = "";
        $("#progress,#loading").fadeOut(1000);
    })
    $("#EditSave").click(function () {
        if(!CheckEditReq(RequiredC))
        {
            alert('輸入不完全');
            return;
        }
        if (Unique != "" && UniqueArray.indexOf($("#" + Unique + "").val()) >= 0 && eUnique != $("#" + Unique + "").val()) {
            alert("Unique重複!");
        }
        else {
            var EditVal = "",log_val = "";
            for (var i = 0; i < EditTitle.length; i++) {
                
                if ($.trim($("#" + EditTitle[i] + "").val()) != "") {
                    if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false){
                        log_val += EditTitle[i] + "=N'" + CBEValue[1] + "',";
                    }
                    else{
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
                            if (EditType[i] == 'CheckBox' && $("#" + EditTitle[i] + "").is(':checked') == false)
                                EditVal += EditTitle[i] + "=N'" + CBEValue[1] + "',";
                            else
                                EditVal += EditTitle[i] + "=N'" + $("#" + EditTitle[i] + "").val().replace(/'/g, "''") + "',";
                    }
                }
                else{
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
                // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/UpdGridData' ,
                // headers: {  TableName: TableName, SID: SIDArray, EditVal: EditVal, USER: username,SID_VAL:SID,log_val : log_val , TokenKey:TokenID  },
                url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                data: { funcName: "UpdGridData", TableName: TableName, SID: SIDArray, EditVal: EditVal, USER: username,SID_VAL:SID,log_val : log_val },
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

    $("#QuerySave").click(function () {
        var SplitQuery;
        QueryString = " WHERE "
        for (var i = 0; i < QueryArray.length; i++) { //Query
            if (TitleFalseV.indexOf(i + 1) == -1 && QueryArray[i] != 'False') {
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
                                            QueryString += ALLTitle.split(",")[i] + " LIKE N'%" + SplitQuery[sp].trim().replace(/'/g, "''") + "%' OR ";
                                        }
                                        QueryString = QueryString.substring(0, QueryString.length - 4) + " AND ";

                                    }
                                    else {
                                        QueryString += ALLTitle.split(",")[i] + " LIKE N'%" + $("#Q" + ALLTitle.split(",")[i] + "").val().trim().replace(/'/g, "''") + "%' AND ";

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

        $.ajax({
            type: 'post',
            //url: window.location.protocol+'//localhost/DCMATEV4/MasterMaintain/Model/ExtendHandler.ashx',
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/ExtendHandler.ashx',
            data: { funcName: "Exportxlsx", FileName: htmlTitle, ColName: c, SQL: "SELECT " + b + " FROM " + GRIDTABLENAME + QueryString, mode: "MasterMaintain",CheckCol: b,SID:SID },//ExportExcel
            //dataType: 'json',
            async: false,
            success: function (result) {
                window.location.href = window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/tmp/' + result;
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
            rowArray = SelectData
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
                for(var i=0; i<thTextList.length; i++){
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
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
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
            // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/GridColDataQuery' ,
            // headers: {   TokenKey:TokenID ,SelectData:" COUNT(" + SidField + ") ",TableName:GRIDTABLENAME,QueryString:q },
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "GridColDataQuery", TableName: GRIDTABLENAME, SelectData: " COUNT(" + SidField + ") ", QueryString: q },
            dataType: 'json',
            async: false,
            success: function (result) {
                //result = result.data;
                $.each(result[0], function (key, value) {
                    DataSummary = value;
                })
                SqlTimes = Math.ceil(DataSummary / perPData);
                SqlTimes == 0 ? SqlTimes = 1 : '';
                CheckLoadNum = 1;
                let pages = GetLangDataV2("pages");
                let entries = GetLangDataV2("entries");
                $("#totalnum").text( SqlTimes + " "+pages+" (" + DataSummary +entries +")");

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
        //2024-01-10 edit/add合併
        if(OPEN){
            $("#EditData").hide();
            $("#AddData").show();
        }
        else{
            $("#EditData").show();
            $("#AddData").hide();
        }
    }
    function DataAddOnOff(OPEN) {
        $("#AddData").prop("disabled", OPEN);
        //2024-01-10 edit/add合併
        if(OPEN){
            $("#AddData").hide();
        }
        else{
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
                // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/OptSql' ,
                // headers: {  SQ: SSO.replace("SQL:", "") , TokenKey:TokenID  },
                url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
                data: { funcName: "OptSql", SQ: SSO.replace("SQL:", "") },
                dataType: 'json',
                async: false,
                success: function (result) {

                    // result = result.data;
                    //alert(result.length)
                    for (var i = 0; i < result.length; i++) {
                        for (var a in result[0]) {
                            cal += 1;
                        }
                    }
                    //alert(cal);
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
        switch(SID){
            case "338297914450237":
            case "338297847263983":
            case "347301502426686":
                table.column(1).visible(false);
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
            // url: window.location.protocol+'//'+tmpip+'/'+tmpWebSiteName+'/api/GridColDataQuery' ,
            // headers: {   TokenKey:TokenID ,SelectData:Unique,TableName:TableName,QueryString:"" },
            url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "GridColDataQuery", SelectData: Unique, TableName: TableName, QueryString: "" },
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
        perPData = Number( $("#perPData").val());
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
function CheckEditReq(RequiredC)
{
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
        //alert(table.rows('.selected').data().length + ' row(s) selected');        //alert(table.rows('.selected').data().length + ' row(s) selected');





        