let tmpALLTitle; //2023-11-06新增

let rowData;

$(document).ready(function () {
    // var default_ip = 'cloud.weyutech.com'; //cloud.weyutech.com  localhost
    // var default_WebSiteName = 'NEW_WEYUTECHV4';//DCMATEV4_NEW_TEST dcmatev4
    var Request = {};
    var pgn = 1;
    var table;
    var SortState;
    var DataSummary = 0, SqlTimes = 1;
    var OrderF;
    var perPData = 20;
    var DataHideSet;
    var orgPara = {};
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
    var ODF = Request["ODF"] || null;
    var HyperMode = Request["HyperMode"] || null;
    var SID = Request["SID"];
    //backUrl參數
    var MOUDLE_TYPE = Request["MOUDLE_TYPE"] || null;
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;

    var QueryStructer, SmartQueryData, QueryString = "", MSQuery;
    var TitleArray = [], ALLTitle = "", QueryArray = [], TitleFalseV = [], StructerValue = 0, DataSet = [], CurrentRow = [], QueryFieldType = [], QueryFieldValue = 0;
    $.ajax({
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
        data: { funcName: "OptSql", SQ: "Select * from BAS_QUERYREPORT WHERE  QR_SID=" + SID },
        dataType: 'json',
        async: false,
        success: function (result) {
            $("#midtitle").text(GetLangDataV2(result[0]['QR_NAME']));
        }
    });
    $.ajax({
        type: 'GET',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + SID,
        async: false,
        success: function (msg) {
            var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
            jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
            jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
            QueryStructer = jsonObj;
            MSQuery = QueryStructer.MasterSql;
            if (QueryStructer.ValidExport != false)
                $("#ExportExcel").attr("disabled", false);
            else
                $("#ExportExcel").css("display", "none");
        }
    });
    var HyperLinkContent = {}, HyperLinkURL = {};
    $.each(QueryStructer.sColModels4EasyUI, function (k, v) {
        $.each(v, function (ka, va) {
            switch (ka) {
                case "title":
                    $('#addtitle').append('<th id="Title' + va + '" style="width:' + v['width'] + 'px">' + GetLangDataV2(va) + '</th>');
                    TitleArray.push(va);
                    break;
                case "field":
                    ALLTitle == "" ? ALLTitle += va : ALLTitle += (',' + va);
                    break;
                case "hidden":
                    if (va == true)
                        TitleFalseV.push(StructerValue);
                    break;
                case "CanHyperLink": //若有此選項表示必定有CanHyperLink: "Y"
                    if ($.inArray('?', v['HyberLinkURL']) >= 0)
                        HyperLinkContent[v['field']] = v['HyberLinkURL'] + '&' + paraSpliT(v['HyperLinkFields']);
                    else
                        HyperLinkContent[v['field']] = v['HyberLinkURL'] + '?' + paraSpliT(v['HyperLinkFields']);
                    HyperLinkURL[v['field']] = v['HyberLinkURL'];
                    //console.log(HyperLinkContent);
                    //HyberLinkTitle: ""
                    //HyberLinkURL: "mastermaintain/MasterMaintain.html"
                    //HyperLinkFields: "SID:MM_SID" 前為串接網址的參數:後方為參數來源
                    //field: "GRID_TABLE_NAME" //是為哪一個欄位的超連結
                    //hidden: false
                    break;


            }
        })
        StructerValue += 1;
    })

    tmpALLTitle = ALLTitle; //2023-11-06新增

    $("th").addClass("Lang").addClass("text-nowrap");
    OrderF = ALLTitle.split(',')[1];
    var QueryCaption = [], QueryConditionKey = [], QueryConditionKeyType = 0, QueryConditionKeyContent = {}, QueryCustomShow = [], QueryDataSourceSql = [], ConditionIndexValue = 0;
    var QueryDefaultValue = [], QueryDataType = [], QueryField = [], QueryInputType = [], QueryOper = [], QueryDefaultValue = [], QueryIsRepuire = [], QueryAlias = [];
    $.each(QueryStructer.Conditions, function (k, v) {
        $.each(v, function (ka, va) {
            switch (ka) {
                case "Caption":
                    QueryCaption.push(va)
                    break;
                case "ConditionKey":
                    if ($.inArray(va, QueryConditionKey) == -1) {
                        QueryConditionKeyType += 1;
                        QueryConditionKeyContent[va] = "";
                    }
                    QueryConditionKey.push(va)
                    break;
                case "DataSourceSql":
                    QueryDataSourceSql.push(va)
                    break;
                case "CustomShow":
                    QueryCustomShow.push(va)
                    break;
                case "DataType":
                    QueryDataType.push(va)
                    break;
                case "DefaultValue":
                    QueryDefaultValue.push(va)
                    break;
                case "Field":
                    QueryField.push(va)
                    break;
                case "InputType":
                    QueryInputType.push(va)
                    break;
                case "Oper":
                    QueryOper.push(va)
                    break;
                case "DefaultValue":
                    QueryDefaultValue.push(va)
                    break;
                case "IsRepuire":
                    QueryIsRepuire.push(va)
                    break;
                case 'Alias':
                    QueryAlias.push(va)
                    break;
            }
        })
        ConditionIndexValue += 1;
    })
    //alert(QueryConditionKeyType);
    TableSet();
    for (var i = 0; i < ConditionIndexValue; i++) {
        switch (QueryInputType[i]) {
            case "KeyIn":
                $("#QueryContent").append('<div class="Lang col-md-12">' + GetLangDataV2(QueryCaption[i]) + '</div>' + '<input class="col-md-12" value="' + QueryDefaultValue[i] + '" id="' + QueryField[i] + '"  autocomplete="off"/><p>');//value="' + QueryDefaultValue[i]+'"
                break;
            case "Select":
                let lastPickrTimeS = null;
                let lastPickrTimeE = null;
                switch (QueryDataType[i]) {
                    case "DateTime":
                        lastPickrTimeS = null;
                        lastPickrTimeE = null;
                        $("#QueryContent").append('<div class="Lang col-md-12">' + GetLangDataV2(QueryCaption[i]) + ' ' + GetLangDataV2('Start Time') + '</div>' + '<input class="col-md-12" type="button" id="QS' + QueryField[i] + '"  autocomplete="off"/><p>');
                        flatpickr("#QS" + QueryField[i] + "", {
                            enableTime: true,
                            dateFormat: "Y-m-d H:i",
                            allowInput: true,
                            time_24hr: true,
                            onChange: function (selectedDates, dateStr) {
                                if (selectedDates.length > 0 && lastPickrTimeS === dateStr.split(' ')[1]) {
                                    this.close();
                                }
                                lastPickrTimeS = dateStr.split(' ')[1];
                            }
                        })
                        if (QueryOper[i] == "between") {
                            $("#QueryContent").append(GetLangDataV2(QueryCaption[i]) + ' ' + GetLangDataV2('End Time') + '<input class="col-md-12" type="button" id="QE' + QueryField[i] + '"  autocomplete="off"/><p>')
                            flatpickr("#QE" + QueryField[i] + "", {
                                enableTime: true,
                                dateFormat: "Y-m-d H:i",
                                allowInput: true,
                                time_24hr: true,
                                onChange: function (selectedDates, dateStr) {
                                    if (selectedDates.length > 0 && lastPickrTimeE === dateStr.split(' ')[1]) {
                                        this.close();
                                    }
                                    lastPickrTimeE = dateStr.split(' ')[1];
                                }
                            })
                        }
                        break;
                    case "Date":
                        lastPickrTimeS = null;
                        lastPickrTimeE = null;
                        $("#QueryContent").append('<div class="Lang col-md-12">' + GetLangDataV2(QueryCaption[i]) + ' ' + GetLangDataV2('Start Time') + '</div>' + '<input class="col-md-12" type="button" id="QS' + QueryField[i] + '"  autocomplete="off"/><p>');
                        flatpickr("#QS" + QueryField[i] + "", {
                            dateFormat: "Y-m-d",
                            allowInput: true,
                            onChange: function (selectedDates) {
                                if (selectedDates.length > 0) {
                                    this.close();
                                }
                                lastPickrTimeS = dateStr.split(' ')[1];
                            }
                        })
                        if (QueryOper[i] == "between") {
                            $("#QueryContent").append(GetLangDataV2(QueryCaption[i]) + ' ' + GetLangDataV2('End Time') + '<input class="col-md-12" type="button" id="QE' + QueryField[i] + '"  autocomplete="off"/><p>')
                            flatpickr("#QE" + QueryField[i] + "", {
                                dateFormat: "Y-m-d",
                                allowInput: true,
                                onChange: function (selectedDates) {
                                    if (selectedDates.length > 0) {
                                        this.close();
                                    }
                                    lastPickrTimeE = dateStr.split(' ')[1];
                                }
                            })
                        }
                        break;
                    default:
                        if (QueryField[i].toUpperCase == "AUTO_ITEM") {
                            $("#QueryContent").append('<div class="Lang">' + GetLangDataV2(QueryCaption[i]) + '</div>' + '<select id="' + QueryField[i] + '"></select><p>');
                        } else
                            //進階搜尋下拉式 2023-05-03
                            $("#QueryContent").append('<div class="Lang">' + GetLangDataV2(QueryCaption[i]) + '</div>' + '<input list="DATALIST_' + QueryField[i] + '" id="' + QueryField[i] + '" required="" autocomplete="off" >' + '<datalist id="DATALIST_' + QueryField[i] + '">' + SelectOption(QueryDataSourceSql[i]) + '</datalist>' + '<p>');
                    // $("#QueryContent").append('<div class="Lang">' + QueryCaption[i] + '</div>' + '<select id="' + QueryField[i] + '" >' + SelectOption(QueryDataSourceSql[i]) + '</select><p>');
                }
                break;
            case "CheckBox":
                $("#QueryContent").append('<div class="Lang col-md-12">' + GetLangDataV2(QueryCaption[i]) + '</div>' + '<input class="col-md-12" id="' + QueryField[i] + '"  autocomplete="off"/><p>');
                break;
        }
        if (QueryDefaultValue[i] != "") {
            $('#' + QueryField[i]).val(QueryDefaultValue[i]);
        }
        //if (QueryIsRepuire[i].toUpperCase() = 'TRUE')
        //{
        //    $('#' + QueryField[i]).val();
        //}
    }
    if (HyperMode == "True") {
        if (ConditionIndexValue == 0) {
            MSQuery = QueryStructer.MasterSql.replace(QueryStructer.MasterSql.substring($.inArray('{', QueryStructer.MasterSql), $.inArray('}', QueryStructer.MasterSql) + 1), '1=1')
            $("#QueryData").attr('disabled', true);
            GetGridData();
            $("#PrePage").attr("disabled", true);
        } else {

            $.each(Request, function (k, v) {
                $("#" + k).val(v);
            });
            QuerySave();
        }
    } else {
        if (ConditionIndexValue == 0) {
            MSQuery = QueryStructer.MasterSql.replace(QueryStructer.MasterSql.substring($.inArray('{', QueryStructer.MasterSql), $.inArray('}', QueryStructer.MasterSql) + 1), '1=1')
            $("#QueryData").attr('disabled', true);
            if (ODF === null) {

            }
            else {
                OrderF = ODF;
            }
            GetGridData();
            $("#PrePage").attr("disabled", true);
        } else $("#QueryData").click();
    }
    //QueryField.length < 1 ? ALLTitle.split(',')[1] : OrderF = QueryField[0];
    function QuerySave() {
        pass = true;
        for (var i = 0; i < QueryIsRepuire.length; i++) {
            if (QueryIsRepuire[i].toUpperCase() == 'TRUE') {
                switch (QueryDataType[i]) {
                    case "Date":
                    case "DateTime":
                        if ($("#QS" + QueryField[i] + "").val() == "" || $("#QS" + QueryField[i] + "").val() == undefined) {
                            alert(QueryField[i] + "必須輸入");
                            pass = false;
                        }
                        break;
                    default:
                        if ($("#" + QueryField[i] + "").val() == "" || $("#" + QueryField[i] + "").val() == undefined) {
                            alert(GetLangDataV2(QueryCaption[i]) + "必須輸入");
                            pass = false;
                        }
                }
            }
        }
        if (pass == true) {
            $.each(QueryConditionKeyContent, function (k, v) {
                QueryConditionKeyContent[k] = "";
            })
            for (var i = 0; i < ConditionIndexValue; i++) {
                SplitQuery = $.trim($("#" + QueryField[i] + "").val()).split("||");
                switch (QueryInputType[i]) {
                    case "KeyIn":
                        if ($.trim($("#" + QueryField[i] + "").val()) != "") {
                            if (SplitQuery.length > 1) {
                                if (QueryDataType[i] != "Number") {
                                    if (QueryConditionKeyContent[QueryConditionKey[i]] != "") {
                                        QueryConditionKeyContent[QueryConditionKey[i]] += " AND ( ";
                                        for (var sp = 0; sp < SplitQuery.length; sp++) {
                                            QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'%" + $.trim(SplitQuery[sp]) + "%' OR ";
                                        }
                                        QueryConditionKeyContent[QueryConditionKey[i]] = QueryConditionKeyContent[QueryConditionKey[i]].substring(0, QueryConditionKeyContent[QueryConditionKey[i]].length - 4) + ")";
                                        //+ QueryField[i] + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'" :
                                    } else {
                                        QueryConditionKeyContent[QueryConditionKey[i]] += ' (';
                                        for (var sp = 0; sp < SplitQuery.length; sp++) {
                                            QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'%" + $.trim(SplitQuery[sp]) + "%' OR ";
                                        }
                                        QueryConditionKeyContent[QueryConditionKey[i]] = QueryConditionKeyContent[QueryConditionKey[i]].substring(0, QueryConditionKeyContent[QueryConditionKey[i]].length - 4) + ")";
                                    }
                                }
                                else {
                                    if (QueryConditionKeyContent[QueryConditionKey[i]] != "") {
                                        QueryConditionKeyContent[QueryConditionKey[i]] += " AND ( ";
                                        for (var sp = 0; sp < SplitQuery.length; sp++) {
                                            QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $.trim(SplitQuery[sp]) + " OR ";
                                        }
                                        QueryConditionKeyContent[QueryConditionKey[i]] = QueryConditionKeyContent[QueryConditionKey[i]].substring(0, QueryConditionKeyContent[QueryConditionKey[i]].length - 4) + ")";
                                        //+ QueryField[i] + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'" :
                                    } else {
                                        QueryConditionKeyContent[QueryConditionKey[i]] += ' (';
                                        for (var sp = 0; sp < SplitQuery.length; sp++) {
                                            QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $.trim(SplitQuery[sp]) + " OR ";
                                        }
                                        QueryConditionKeyContent[QueryConditionKey[i]] = QueryConditionKeyContent[QueryConditionKey[i]].substring(0, QueryConditionKeyContent[QueryConditionKey[i]].length - 4) + ")";
                                    }
                                }
                            }
                            else {
                                if (QueryDataType[i] != "Number") {
                                    if (QueryOper[i] == '=')
                                        QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'";
                                    else
                                        QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'%" + $("#" + QueryField[i] + "").val() + "%'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'%" + $("#" + QueryField[i] + "").val() + "%'";
                                } else {
                                    QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $("#" + QueryField[i] + "").val() : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $("#" + QueryField[i] + "").val();
                                }
                            }
                        }
                        break;
                    case "Select":
                        switch (QueryDataType[i]) {
                            case "DateTime":
                                if ($.trim($("#QS" + QueryField[i] + "").val()) != "") {
                                    QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " '" + $("#QS" + QueryField[i] + "").val() + ":00'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " '" + $("#QS" + QueryField[i] + "").val() + ":00'";
                                    //alert(QueryField[i] + ' ' + QueryOper[i] + ' ' + $("#QS" + QueryField[i] + "").val());
                                    if (QueryOper[i] == "between") {
                                        QueryConditionKeyContent[QueryConditionKey[i]] += " AND '" + $("#QE" + QueryField[i] + "").val() + ":59'";
                                    }
                                }
                                break;
                            case "Date":
                                if ($.trim($("#QS" + QueryField[i] + "").val()) != "") {
                                    QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " '" + $("#QS" + QueryField[i] + "").val() + "'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " '" + $("#QS" + QueryField[i] + "").val() + "'";
                                    //alert(QueryField[i] + ' ' + QueryOper[i] + ' ' + $("#QS" + QueryField[i] + "").val());
                                    if (QueryOper[i] == "between") {
                                        QueryConditionKeyContent[QueryConditionKey[i]] += " AND '" + $("#QE" + QueryField[i] + "").val() + "'";
                                        //alert(' AND ' + $("#QE" + QueryField[i] + "").val());
                                    }
                                }
                                break;
                            default:
                                if ($.trim($("#" + QueryField[i] + "").val()) != "") {
                                    if (QueryDataType[i] != "Number") {
                                        if (QueryField[i].toUpperCase() == "AUTODC_ITEM") {
                                            var KDC = $("#" + QueryField[i] + "").val().filter(el => el);
                                            for (var OP = 0; OP < KDC.length; OP++) {
                                                if (OP == 0) {
                                                    QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND (' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + KDC[OP] + "'" : QueryConditionKeyContent[QueryConditionKey[i]] += "(" + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + KDC[OP] + "'";
                                                }
                                                else {
                                                    QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' OR ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + KDC[OP] + "'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + KDC[OP] + "'";
                                                }
                                            }
                                            QueryConditionKeyContent[QueryConditionKey[i]] += ")";
                                        } else
                                            QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'";
                                    } else {
                                        QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $("#" + QueryField[i] + "").val() : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $("#" + QueryField[i] + "").val();
                                    }
                                }
                            //alert(QueryField[i] + ' ' + QueryOper[i] + ' ' + $("#" + QueryCaption[i] + "").val());
                        }
                        break;
                    case "CheckBox":
                        if ($.trim($("#" + QueryField[i] + "").val()) != "") {
                            if (QueryDataType[i] != "Number") {
                                QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'" : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + " N'" + $("#" + QueryField[i] + "").val() + "'";
                            } else {
                                QueryConditionKeyContent[QueryConditionKey[i]] != "" ? QueryConditionKeyContent[QueryConditionKey[i]] += ' AND ' + ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $("#" + QueryField[i] + "").val() : QueryConditionKeyContent[QueryConditionKey[i]] += ChackAlias(QueryField[i], QueryAlias[i]) + ' ' + QueryOper[i] + ' ' + $("#" + QueryField[i] + "").val();
                            }
                        }
                        break;
                }
                //if ($.trim($("#" + QueryCaption[i] + "")) != "") {
                //    alert(QueryField[i] + ' ' + QueryOper[i] + ' ' + $("#" + QueryCaption[i] + "").val());
                //}
            }
            MSQuery = QueryStructer.MasterSql;
            $.each(QueryConditionKeyContent, function (k, v) {
                if (QueryStructer.MasterSql.indexOf(k) != -1 && v != "") {
                    //卡[]參數
                    MSQuery = MSQuery.replaceAll('[' + k + ']', v.substring(v.indexOf("'") + 1).replaceAll("'", ""))
                    MSQuery = MSQuery.replaceAll('{' + k + '}', v);
                    MSQuery = MSQuery.replaceAll('WHERE {CON}', '');


                } else {
                    MSQuery = MSQuery.replaceAll('{' + k + '}', ' 1=1 ');
                }
            })
            if (firstV == 0 && ODF != null) {
                OrderF = ODF
                firstV += 1;
            }
            pgn = 1;

            //2024-01-05新增 卡 ' 特殊符號
            let Regex = /%[^%]+%/g;
            let matchStr = MSQuery.match(Regex);
            if (matchStr) {
                let newStr = ''
                for (let i = 0; i < matchStr.length; i++) {
                    newStr = matchStr[i].replace(/'/g, "''");
                    MSQuery = MSQuery.replace(matchStr[i], newStr);
                }
            }


            GetGridData();
            $("#PageNum").val(1);
            $("#PrePage").attr("disabled", true);
        }
    }
    var SplitQuery, pass = true, firstV = 0;
    $("#QuerySave").click(function () {
        QuerySave();
    })
    function SelectOption(SSO) { //選項賦值
        var SSOhtml = "";
        SSOhtml = '<option value="">-</option>';
        var x = 0, cal = 0;
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "OptSql", SQ: SSO },
            dataType: 'json',
            async: false,
            success: function (result) {
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
                                SSOhtml += '<option value="' + result[i][a] + '" >';
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
        return SSOhtml;
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
                }

            ]
        });
        ChangeLang();
    }
    function overnine(t) {
        t <= 9 ? t = "0" + t : t;
        return (t)
    }
    $("#PrePage").click(function () {
        PreviousPageNextPage(-1, "PrePage", "NexPage")
    })
    $("#NexPage").click(function () {
        PreviousPageNextPage(1, "NexPage", "PrePage")
    })
    function PreviousPageNextPage(key, id1, id2) {
        pgn += Number(key);
        $("#PageNum").val(pgn);
        GetGridData();
        $("#" + id2 + "").attr("disabled", false);
        if (id1 == "PrePage" && $("#PageNum").val() == '1') {
            $("#" + id1 + "").attr("disabled", true);
        } else if (id1 == "NexPage" && $("#PageNum").val() == SqlTimes) {
            $("#" + id1 + "").attr("disabled", true);
        } else $("#" + id1 + "").attr("disabled", false);
    }
    function GetGridData() {
        DataSet = [];
        $.ajax({ //撈標題
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "SmartQuerySplite", SQ: MSQuery, PageNum: pgn, OrderF: OrderF, perPData: perPData },
            dataType: 'json',
            async: false,
            success: function (result) {
                DataHideSet = result;
                for (var i = 0; i < result.length; i++) {
                    for (var j in result[i]) {
                        var tmp = "";
                        if (j == 'REPORT_DATE') {
                            tmp = result[i][j].split('T')[0];
                            CurrentRow.push(tmp);
                        }
                        else {
                            if ($.inArray(j, ALLTitle.split(',')) != -1 || $.inArray(j.toUpperCase(), ALLTitle.split(',')) != -1) {
                                CurrentRow.push(result[i][j]);
                            }
                        }

                        //if ($.inArray(j, QueryStructer.ColNames) != -1) {
                        //    CurrentRow.push(result[i][j]);
                        //}
                    }
                    DataSet.push(CurrentRow);
                    CurrentRow = [];
                }
            },
            error: function (jqXHR, exception) {
                JasonError("GetLangType", jqXHR, exception);
                $("#progress,#loading").fadeOut(1000);
            }
        });//撈標題
        table.clear().draw();
        table.destroy();
        TableSet();
        GetPageInfo();
        if (HyperLinkContent != {}) {
            replaceTD();
        }
        $("#progress,#loading").fadeOut();
        $("#QueryClose").click();
    }
    function GetPageInfo() {
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/MasterMaintainHandler.ashx',
            data: { funcName: "SmartQuerySpliteInfo", SQ: MSQuery },
            dataType: 'json',
            async: false,
            success: function (result) {
                $.each(result[0], function (key, value) {
                    DataSummary = value;
                })
                SqlTimes = Math.ceil(DataSummary / perPData);
                SqlTimes == 0 ? SqlTimes = 1 : '';
                let pages = GetLangDataV2("pages");
                let entries = GetLangDataV2("entries");
                $("#totalnum").text(SqlTimes + " " + pages + " (" + DataSummary + entries + ")");
                if (SqlTimes == 1) {
                    $("#NexPage").attr("disabled", true);
                    $("#PrePage").attr("disabled", true);
                }
                if ($("#PageNum").val() === 1) {
                    $("#PrePage").attr("disabled", true);
                } else {
                    pgn == SqlTimes ? $("#NexPage").attr("disabled", true) : $("#NexPage").attr("disabled", false);
                    pgn == SqlTimes && SqlTimes != 1 && pgn != 1 ? $("#PrePage").attr("disabled", false) : "";
                }
            }
        });
    }
    function ChackAlias(F, a = null) {
        var Fsting = "";
        if (a != null && $.trim(a) != "" && a != undefined)
            Fsting = a + "." + F;
        else
            Fsting = F;
        return Fsting;
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


    // $("#Maintain").prop("disabled", 'disabled');
    // $("#SwitchStatus").prop("disabled", 'disabled');
    // $("#SwitchMoudles").prop("disabled", 'disabled');
    $('#example tbody').on('click', 'tr', function () { //選擇事件

        if ($(this).hasClass('selected')) {
            $('#example tbody tr').removeClass('selected');
            SelectRowOnOff('disabled') // 按鈕不可用


        } else {
            $('#example tbody tr').removeClass('selected');
            $(this).toggleClass('selected');
            SelectRowOnOff(false) // 按鈕可用
            rowData = getRowData(this); // 儲存 RowData
            console.log(rowData)
        }

        function SelectRowOnOff(OPEN) {
            if (ifDisabledFunction) {
                $("#Maintain").prop("disabled", OPEN);
                $("#SwitchStatus").prop("disabled", OPEN);
                $("#SwitchMoudles").prop("disabled", OPEN);
                $("#QueryButton").prop("disabled", OPEN);
            }
        }

    });//選擇事件


    $("th").click(function () {
        var tmpText = this.innerText;

        tmpText = '[' + tmpText + ']';

        //alert(this.id.toString().substring(5, this.id.toString().length))
        $("th").children("img").attr("src", "");
        if (OrderF == '[' + this.id.toString().substring(5, this.id.toString().length) + ']') {
            OrderF += " desc "
            $("#" + this.id + "").children("img").attr("src", "../img/weyu/arrow-up.svg");
        } else {
            OrderF = this.id.toString().substring(5, this.id.toString().length);
            OrderF = '[' + OrderF + ']';
            $("#" + this.id + "").children("img").attr("src", "../img/weyu/arrow-down.svg");
        }
        GetGridData();
        SortState = this.id;

    });
    var ColName = [], ColSID = "", Colindex = 0; //抓Col名字
    table.columns().every(function () {
        //alert(this.header().innerText)
        ColName.push(this.header().innerText);
    });
    $("#ExportExcel").click(function () {
        let cnf = [];
        let cnfindex = '';

        //處僅為範本，輸入要轉成or輸出為數字的 sql 欄位
        if (SID == "331385097996563") {
            cnf = [GetLangDataV2('0hr')]; // 預設是字串，cnf內為需要轉為數字的欄位
        }
        //修改以上
        var a = TitleArray, b = "", c = "";

        for (var i = 0; i < a.length; i++) {
            if (TitleFalseV.indexOf(i) == -1) {
                b += a[i] + ",";
                c += ColName[i] + ",";
            }
        }
        b = b.substring(0, b.length - 1);
        c = c.substring(0, c.length - 1);

        let tmpsql = MSQuery + ' ORDER BY ' + OrderF;

        //int type index
        let tmp_c = c.split(',');
        for (var j = 0; j < tmp_c.length; j++) {

            if (cnf.includes(tmp_c[j])) {
                // cnfindex.push(j);
                if (cnfindex === '') {
                    cnfindex += '[' + j + ']';
                }
                else {
                    cnfindex += ',';
                    cnfindex += '[' + j + ']';
                }
            }

        }
        //alert(c);
        $.ajax({
            type: 'post',
            url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/MasterMaintain/Model/ExtendHandler.ashx',
            data: { funcName: "Exportxlsx", FileName: $("#midtitle").text(), SQL: tmpsql, ColName: c, CheckCol: b, mode: "GridDataSmartQuery", SID: SID },//ExportExcel ; , customNumericFieldsIndex : cnfindex 前端客製用參數
            //dataType: 'json',
            async: false,
            success: function (result) {
                //window.location.href = window.location.protocol+'//localhost/DCMATEV4/tmp/' + result;
                window.location.href = window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/tmp/' + result;
                $("#progress,#loading").fadeOut(1000);
            },
            error: function (jqXHR, exception) {
                JasonError("GetLangType", jqXHR, exception);
                $("#progress,#loading").fadeOut(1000);
            }
        });
    })
    $("#perPData").on('change', function () {
        perPData = $("#perPData").val();
        pgn = 1;
        GetGridData();
        $("#PageNum").val(1);
        $("#PrePage").attr("disabled", true);
        $("#progress,#loading").fadeOut(1000);
    })
    $("#Queryclean").click(function () {
        for (var i = 0; i < ConditionIndexValue; i++) {
            $("#" + QueryField[i]).val("");
        }
    })
    $("#PageNum").on('change', function () {
        if ($("#PageNum").val() > SqlTimes || $("#PageNum").val() < 1) {
            alert("超出頁數!");
        } else {
            pgn = Number($("#PageNum").val());
            GetGridData();
            pgn == 1 ? $("#PrePage").attr("disabled", true) : $("#PrePage").attr("disabled", false);
            pgn == SqlTimes ? $("#NexPage").attr("disabled", true) : $("#NexPage").attr("disabled", false);
            $("#progress,#loading").fadeOut(1000);
        }
    })
    $('#AUTODC_ITEM').prop('disabled', true);
    var SSOQ;
    $("#EQP_NO").on('change', function () {
        if ($('#AUTODC_ITEM') != undefined) {
            SSOQ = "SELECT DC_ITEM_CODE,DC_ITEM_NAME FROM BAS_DC_ITEM WHERE DC_ITEM_SID IN(SELECT BAS_DC_ITEM_SID FROM EQP_ITEM_RELATION WHERE EQP_TYPE_SID=(SELECT EQP_TYPE_SID FROM BAS_EQP_TYPE WHERE EQP_TYPE_NO=(SELECT EQP_TYPE_NO FROM EQP_MASTER WHERE EQP_NO='" + $("#EQP_NO").val() + "')))";
            $('#AUTODC_ITEM').empty();
            $('#AUTODC_ITEM').append(SelectOption(SSOQ));
            $('#AUTODC_ITEM').val('null');
            $('#AUTODC_ITEM').prop('disabled', false);
            $("#progress,#loading").fadeOut(1000);
            $("#AUTODC_ITEM").attr("multiple", "multiple")
            $('#AUTODC_ITEM').change(function () {
                console.log($(this).val());
            }).multipleSelect({
                width: '100%',
            });
            $(".ms-choice").addClass("border border-dark").addClass("rounded ")
        }

    })
    function paraSpliT(v) {
        var orgV = v.split(',');
        var HyString = "";
        for (var i = 0; i < orgV.length; i++) {
            i != 0 ? HyString += "&" : "";
            orgPara[orgV[i].split(':')[0]] = orgV[i].split(':')[1];
            HyString += orgV[i].split(':')[0] + "=Q" + orgV[i].split(':')[1] + "";
        }
        return HyString;
    }
    function replaceTD() {
        var a = 0, atob = "", b = [], g, c, checkurl, SETUPER = [];
        var G = [];
        $.each(HyperLinkContent, function (k, v) {
            TitleUPer = [];
            for (var s in TitleArray) {
                TitleUPer.push(TitleArray[s].toUpperCase())
            }
            a = $.inArray(k.toUpperCase(), TitleUPer) - 1;
            //b = $.inArray(v.split('!')[1], TitleArray) - 1;
            atob = v.split('?')[1];
            g = atob.split('&').length;
            var DataIndexSet = [], DataIndexSet2 = [];
            $.each(DataHideSet[0], function (k, v) {
                DataIndexSet.push(k.toUpperCase());
                DataIndexSet2.push(k);
            })
            //alert(DataIndexSet);
            for (var i = 0; i < g; i++) {
                b.push(atob.split('&')[i].split('=')[1]);
            }
            for (var i = 0; i < table.column(0).data().length; i++) {
                c = v;
                for (var j = 0; j < b.length; j++) {
                    if (j + 1 >= HyperLinkURL[k].split('?').length) {
                        if (DataIndexSet.indexOf(b[j].substring(1, b[j].length)) != -1)
                            key_index = DataIndexSet.indexOf(b[j].substring(1, b[j].length));

                        //b[j].substring(1, b[j].length)
                        //c = c.replace(b[j], DataHideSet[i][b[j].substring(1, b[j].length)]);
                        c = c.replace(b[j], DataHideSet[i][DataIndexSet2[key_index]]);
                    }
                    //alert(b[j]+":"+DataHideSet[i][b[j].substring(1, b[j].length)]);
                    //alert(DataHideSet[i][b[j]]);
                }
                $("#example tbody").find("tr").eq(i).find("td").eq(a).html('<a href= "' + c + '&HyperMode=True" target= "_blank" >' + $("#example tbody").find("tr").eq(i).find("td").eq(a).text() + '</a >');
            }
        })

    }
    function PagearrowState() {
        pgn == SqlTimes ? $("#NexPage").attr("disabled", true) : $("#NexPage").attr("disabled", false);
        pgn == SqlTimes && SqlTimes != 1 && pgn != 1 ? $("#PrePage").attr("disabled", false) : $("#PrePage").attr("disabled", true);
    }
    $("th").append('<img />');


    // 获取具有 "Lang" 类的<span>元素
    let backButton = document.getElementById("backButton");

    // 添加点击事件处理程序
    backButton.addEventListener("click", function () {

        GoBack(MOUDLE_TYPE,Level,MODULE_NAME,Button)
    });

})








