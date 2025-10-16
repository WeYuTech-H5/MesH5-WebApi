//Common Function
var Tokenkey;
var INPUT_FORM_NAME = ClientName + "_" + ClientVer + "_" + location.href.split("/").slice(-1);
var jsonLot;
var jsonUser;
var jsonEQP;
var jsonReason;
var jsonMold;
var checkData = false;

var bTextBoxDoubleClick = false;
var q;

var EnumConnectResult = { Connect: 0, Fail: 1, NoConnect: 2 };
function SetConnectResult(ConnectResult) {
    localStorageSetItem("ConnectResult", ConnectResult);
}

function GetConnectResult() {
    if (localStorageGetItem("ConnectResult") == null || localStorageGetItem("ConnectResult") == "") {
        localStorageSetItem("ConnectResult", EnumConnectResult.NoConnect)
    }
    return localStorageGetItem("ConnectResult");
}

function call_login() {

    document.addEventListener("volumeupbutton", onVolumeUpKeyDown, false);

    document.addEventListener("volumedownbutton", onVolumeDownKeyDown, false);

    window.addEventListener('native.keyboardshow', function (e) {
        if (!bTextBoxDoubleClick) {
            cordova.plugins.Keyboard.close();

            setTimeout(function () {
                cordova.plugins.Keyboard.close();
            }, 50);
        }
    });


    window.addEventListener("focus", function (e) {
        var p;
        e = e || window.event;
        p = e.target;
        //20200325 fixed type=text
        if (p.nodeName == "INPUT" && p.type == "text") {
            p.name = p.id;
            q = p;
        }
    }, true);


    setTimeout(function () {
        Tokenkey = "";
        GetConfig();
        DebugLog(loginurl);
        GetTokenkey(false);       
    }, 200);
}

function onVolumeUpKeyDown() {
    try {
        if (!bTextBoxDoubleClick) {
            bTextBoxDoubleClick = true;
            cordova.plugins.Keyboard.show();
        } else {
            bTextBoxDoubleClick = false;
            setTimeout(function () {
                cordova.plugins.Keyboard.close();
            }, 50);
        }

    }
    catch (errorMessage) {
        DebugLogAndAlert("onVolumeUpKeyDown:" + errorMessage);
    }
}

function onVolumeDownKeyDown() {
    try {
        openScanner();
    }
    catch (errorMessage) {
        DebugLogAndAlert("onVolumeDownKeyDown:" + errorMessage);
    }
}

function openScanner() {
    var scanOption =
        {
            preferFrontCamera: false, //預設是否使用前鏡頭，iOS、Android皆可用
            showFlipCameraButton: true, //是否顯示、後鏡頭切換按鈕，iOS、Android皆可用
            showTorchButton: true, //是否顯示閃光燈開關按，iOS、Android皆可用
            torchOn: true, //預設是否開啟閃光燈，只限Android
            saveHistory: true, //是否儲存掃描結果，只限Android
            prompt: "Place a barcode inside the scan area", //在掃描時，在相機照相區域要顯示的訊息，只限Android
            resultDisplayDuration: 500, //掃描成功後，多久要將結果顯示在div_result區域，只限Android，單位毫秒
            formats: "all", //可參考文章中的Barcod Type資訊
            orientation: "portrait", //掃描的方向，只限Android (portrait│landscape) (直立│橫放)
            disableAnimations: true, //iOS(手上沒有IOS手機，無法測試)
            disableSuccessBeep: false //掃描成功後，是否發出完成音，iOS、Android皆可用
        };

    cordova.plugins.barcodeScanner.scan(funScanSuccess, funScanFail, scanOption);
}
function funScanSuccess(result) {

    //$("#lblpn").text(result.text);

    $("input:focus").val(result.text);
    var e = jQuery.Event("keypress");//模拟一个键盘事件
    e.keyCode = 13;//keyCode=13是回车
    $("input:focus").trigger(e);

}

function funScanFail(error) {
    DebugLogAndAlert("Scanning failed: " + error);
}


function SetDefaultSelectLang()
{
    SetSelectLang('#selectlang')
}

function SetSelectLang(selectid)
{
    var lng = localStorageGetItem("lng");
    if (lng == null || lng.length == 0) { return; }
    $(selectid).val(lng);
   // $('#' + selectid).change();
}

var jsonLang;
function ChangeLang() {
    DebugLog("ChangeLang start");
    lngDic = localStorageGetItem("langDic");
    if (lngDic == null || lngDic.length == 0 || lngDic == "{}") {
        DebugLog("ChangeLang:no langDic data");
        jsonLang = null;
        return;
    }
    DebugLog("lngDic:" + lngDic.length);
    jsonLang = $.parseJSON(lngDic);
    if (jsonLang == null || jsonLang.length == 0) { 
        DebugLog("jsonLang:no jsonLang data");
        return;
    }
    
    //舊版語系資料CALL法
    // $('.Lang').each(function (i, val) {
    //     var sHtml = $(this).html();
    //     //DebugLog(sHtml);
    //     if (jsonLang.hasOwnProperty(sHtml.toUpperCase())) {
    //         // DebugLog($(this).text());
    //         // DebugLog(jsonLang[$(this).text().toUpperCase()]);
    //         sHtml = sHtml.toString().replace($(this).text(), jsonLang[$(this).text().toUpperCase()]);
    //         $(this).html(sHtml);
    //     }
    // });

    //2023-11-30 新版BI架構 之 語系替換方式
    $('.Lang').each(function (i, val) {
        var sHtml = $(this).html();
        //DebugLog(sHtml);
        if (jsonLang.findIndex(item => item.KEYWORDS.toUpperCase() === sHtml.toUpperCase()) !== -1) {
            // DebugLog($(this).text());
            // DebugLog(jsonLang[$(this).text().toUpperCase()]);
            var foundIndex = jsonLang.findIndex(item => item.KEYWORDS.toUpperCase() === sHtml.toUpperCase());
            var foundValue = jsonLang[foundIndex].VALUE;
            sHtml = sHtml.toString().replace($(this).text(), foundValue);
            $(this).html(sHtml);
        }
    });

    $('input').each(function (index, value) {
        if ($(this).attr('placeholder') == undefined) { return; }
        $(this).attr("placeholder", jsonLang[$(this).attr('placeholder').toUpperCase()]);
    });
    DebugLog("ChangeLang end");
}

function GetLangData(key) {
    
    if (jsonLang == null || jsonLang.length == 0) { 
        DebugLog("key:" + key + " GetLangData: 0");
        return key; 
    }
    DebugLog("key:" + key + " GetLangData:" + jsonLang);

    var txt = jsonLang[key.toUpperCase()];
    //DebugLog(txt);
    if (txt == "" || typeof txt ==='undefined') {
        txt = key;
    }
    return txt;
}

//新Webapi json格式
function GetLangDataV2(key){
    if (jsonLang == null || jsonLang.length == 0) { 
        DebugLog("key:" + key + " GetLangData: 0");
        return key; 
    }
    DebugLog("key:" + key + " GetLangData:" + jsonLang);

    // 使用 Array.find 查找匹配的对象
    // var txtObject = jsonLang.find(item => item.KEYWORDS.includes(key.toUpperCase()));
    var txtObject = jsonLang.find(item => item.KEYWORDS.toUpperCase() === key.toUpperCase());
    
    // 如果找到匹配的对象，获取其 VALUE 属性
    var txt = txtObject ? txtObject.VALUE : '';

    //DebugLog(txt);
    if (txt == "" || typeof txt ==='undefined') {
        txt = key;
    }
    return txt;
}


function SetCurrentLng(lng) {
    localStorageSetItem("lng", lng);
}

function UIChangeLng(lng) {
    GetLngDic(lng);
    SetCurrentLng(lng);
    location.reload();
}
var lng = "";
var lngDic = "";
function GetLngDicInit(lng) {
    lngDic = localStorageGetItem("langDic");
    if (lngDic == null || lngDic.length == 0 || lngDic == "{}") {
        DebugLog("First Get LngDic ");
        GetLngDic(lng);
    }
}

function GetLngDic(lng) {
    DebugLog(lng);
    ip = ip== "" ? default_ip : ip;
    WebSiteName = WebSiteName== "" ? default_WebSiteName : WebSiteName;

    $.ajax({
        type: 'POST',
        async: false,
        url: window.location.protocol + "//" + ip + "/" + WebSiteName + '/Handler/LangHandle.ashx',
        data: {
             // ActionMode: 'GetDic4APP', //雙語系
            // ActionMode: 'GetDic4APPOneLan',//單語系
            ActionMode: LongType,
            LNG: lng
        },
        success: function (msg) {
            DebugLog(msg);
            lngDic = msg;
            localStorageSetItem("langDic", msg);
            SetConnectResult(EnumConnectResult.Connect);
        },
        error: function () {
            SetConnectResult(EnumConnectResult.Fail);
            DebugLogAndAlert("GetLngDic Connect Fail!!");
         //   window.location.assign("index.html");
        }
    });
}

function GetTokenkey(async) {
    Tokenkey = "";
    GetConfig();
    DebugLog(loginurl);
    $.ajax({
        type: 'GET',
        async: async,
        url: loginurl,
        data: {
            username: InputID,
            password: InputPwd,
            CLIENT_VER: ClientVer
        },
        success: function (response) {
            var json = $.parseJSON(response);
            DebugLog(json);
            var responsetime = json.responsetime;
            var result = json.result;
            if (result == true) {
                SetConnectResult(EnumConnectResult.Connect);
            }
            else {
                SetConnectResult(EnumConnectResult.Fail);
            }
            var sessionid = json.SessionID;
            Tokenkey = json.TokenKey;
            if (result) {
                DebugLog("登入成功!! Tokenkey:" + Tokenkey)
            }
            else {
                DebugLogAndAlert("Connect Fail !!");
               // window.location.assign("../index.html");
            }

        },
        error: function () {
            SetConnectResult(EnumConnectResult.Fail);
            DebugLogAndAlert("GetTokenkey Connect Fail!!");
          //  window.location.assign("../index.html");
        }
    })
}

function JasonError(jqXHR, exception) {
    JasonError("", jqXHR, exception);
}

function DebugLog(msg) {
    // console.log(msg);
}

function DebugLogAndAlert(msg) {
    DebugLog(msg);
    alert(msg);
}

function DebugLogAndAlertFocusClear(msg, id) {
    DebugLog(msg);
    alert(msg);
    //$("#" + id).focus().val(""); 20190415 修正改成setTimeout focus
    setTimeout(function () { $("#" + id).focus().val(""); }, 200);
}

function JasonError(functionname, jqXHR, exception) {
    var msg = "";
    if (jqXHR.status === 0) {
        msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status == 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status == 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    if (functionname == "") {
        //  DebugLog(msg);
        // alert(msg);
        //  throw new Error(msg);
    }
    else {
        msg = "[" + functionname + "]" + " " + msg;
        // alert("[" + functionname + "]" + " " + msg);
        //DebugLog("[" + functionname + "]" + " " + msg);
    }

    DebugLog(msg);
    // alert(msg);
    throw new Error(msg);
}

function ExecuteSql(sql) {
    DebugLog(sql);
    var jdata = "";
    jdata = JSON.stringify({ SQL: sql });
    SQLS = "{rows:[" + jdata + "]}";
    var jsondata = JSON.stringify
        ({
            ActionMode: 'EXCUTE_SQL',
            SQLS: SQLS
        });
    $.ajax({
        method: 'POST',
        contentType: 'json',
        url: wipurl,
        async: false,
        headers: {
            TokenKey: Tokenkey,
            INPUT_FORM_NAME: INPUT_FORM_NAME,
            CLIENT_VER: ClientVer
        },
        data: jsondata,
        success: function (msg) {
            DebugLog(msg);
            var jsonResult = $.parseJSON(msg);
        },
        statusCode: {
            403: function (response) {
                DebugLogAndAlert(response);
            }
        }
    })
}
function GetRootUrl(htmlfilename) {
    return location.protocol + "//" + location.hostname + "/" + location.pathname.split("/").slice(1)[0] + "/" + htmlfilename
}

function ClickToReturnMenuWIP() {
    setTimeoutAssignUrl(menu_wip_path);
}

function ClickToReturnMenuWIPLite() {
    setTimeoutAssignUrl(menu_wip_lite_path);
}

function ClickToReturnMenuEQP() {
    setTimeoutAssignUrl(menu_eqp_path);
}

function ClickToReturnMenuUSER() {
    setTimeoutAssignUrl(menu_user_path);
}

function setTimeoutAssignUrl(url) {
    setTimeout(function () {
        window.location.assign(url);
    }, 500);
}


function FormFinishMode(module) {
    if (form_finish_return_mode == "CLEAR") {
        clearAlldata();
    }
    else {
        if (module == "WIP") {
            ClickToReturnMenuWIP();
        }
        else if (module == "WIPLITE") {
            ClickToReturnMenuWIPLite();
        }
        else if (module == "EQP") {
            ClickToReturnMenuEQP();
        }
    }
}

function ShowMarkDiv() {


    //$('body').prepend('<div data-role="popup" id="myPopup" data-overlay-theme="b" data-dismissible="false">　Waiting......　</div>');
    $('#myPopup').popup('open');
    //setTimeout("$('#myPopup').popup('close')", 3000);
}

function CloseMarkDiv() {
    $('#myPopup').popup('close');
}

//API IP
var ip = '';
//登入API SiteName 
var WebSiteName = '';

var loginurl = "";
//WIP API URL
var wipurl = "";
var eqpwipurl = "";

function SetConfg(ip, WebSiteName) {
    localStorageSetItem("ip", ip);
    localStorageSetItem("WebSiteName", WebSiteName);
}

function GetConfig() {
    //  localStorage.clear();
    lng = localStorageGetItem("lng");
    if (lng == null || lng.length == 0) {
        lng = default_lng;
    }
    localStorageSetItem("lng", lng);
    lngDic = localStorageGetItem("langDic");
    if (lngDic == null || lngDic.length == 0) {
        lngDic = "{}";
    }

    if (CheckCodovaExist() == true) {
        //APP 使用設定的IP
        ip = localStorageGetItem('ip');//ip = window.localStorage.getItem('ip');
    }
    else {
        if (WebServerMode == true) {
            //網頁預設是網址的IP
            ip = location.hostname + (location.port ? ':' + location.port : '');//window.localStorage.getItem('ip');     
            DebugLog("web:" + ip);
        }
        else {
            ip = localStorageGetItem('ip');
        }
    }
    if (ip == null || ip.length == 0) {
        ip = default_ip;
        localStorageSetItem("ip", default_ip);
    }
    WebSiteName = localStorageGetItem("WebSiteName");//WebSiteName = localStorage.getItem("WebSiteName");
    if (WebSiteName == null || WebSiteName.length == 0) {
        WebSiteName = default_WebSiteName;
        localStorageSetItem("WebSiteName", default_WebSiteName);
    }
    loginurl = window.location.protocol + "//" + ip + "/" + WebSiteName + '/Handler/UserHandler.ashx';
    wipurl = window.location.protocol + "//" + ip + "/" + WebSiteName + '/Handler/WIPHandler.ashx';
    eqpwipurl = window.location.protocol + "//" + ip + "/" + WebSiteName + '/Handler/EQPHandler.ashx';
}

function ShowMenu() {
    var Module = ModuleList.split(';');
    $('.ModuleMenu').hide();
    if (Module.length > 0) {
        for (var i = 0; i < Module.length; i++) {
            $("#" + Module[i]).show();
        }
    }
}

function GetLangType() {
    $.ajax({
        type: 'POST',
        url: window.location.protocol + "//" + ip + '/' + WebSiteName + '/Handler/OptionsHandler.ashx?type=&SQL=select LANG_CODE,LANG_NAME from SEC_LANG_TYPE order by seq ',
        async: false,
        success: function (msg) {
            var resultJson = JSON.parse(msg);
            $("#lng").html("");
            var options = "";
            for (i = 0; i < resultJson.length; i++) {
                options += "<option value=\"" + resultJson[i].value + "\">" + resultJson[i].text + "</option>";
            }
            $("#lng").html(options);
            $("#lng").val(lng);
           // $("#lng").selectmenu('refresh', true);
        },
        error: function (jqXHR, exception) {
            JasonError("GetLangType", jqXHR, exception);
        }
    });
}



var cordovaObjExist = false;
function CheckCodovaExist() {
    try {
        if (typeof cordova == 'undefined') {
            cordovaObjExist = false;
        }
        else {
            cordovaObjExist = true;
        }
    } catch (e) { }
    return cordovaObjExist;
}

function localStorageSetItem(key, data) {
    localStorage.setItem(ClientName + "_" + key, data);
}

function localStorageGetItem(key) {
    return localStorage.getItem(ClientName + "_" + key);
}

function ClientLangType() {
    var LangType = localStorageGetItem("lng");
    if (LangType == "" || LangType.length == 0) {
        LangType = default_lng;
    }
    return LangType;
}



String.Format = function () {
    var s = arguments[0];
    if (s == null) return "";
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = getStringFormatPlaceHolderRegEx(i);
        s = s.replace(reg, (arguments[i + 1] == null ? "" : arguments[i + 1]));
    }
    return cleanStringFormatResult(s);
}

String.prototype.Format = function () {
    var txt = this.toString();
    for (var i = 0; i < arguments.length; i++) {
        var exp = getStringFormatPlaceHolderRegEx(i);
        txt = txt.replace(exp, (arguments[i] == null ? "" : arguments[i]));
    }
    return cleanStringFormatResult(txt);
}

function getStringFormatPlaceHolderRegEx(placeHolderIndex) {
    return new RegExp('({)?\\{' + placeHolderIndex + '\\}(?!})', 'gm')
}

function cleanStringFormatResult(txt) {
    if (txt == null) return "";
    return txt.replace(getStringFormatPlaceHolderRegEx("\\d+"), "");
}

// 客製confirm、alert彈出窗
// 參考: https://sweetalert2.github.io/#
// 1.載入js、css
function loadSweetAlert2(){
    let script = document.createElement('script');
    script.src = `../../js/comm/sweetalert2.min.js`;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    let link = document.createElement('link');
    link.href = `../../css/comm/sweetalert2.min.css`;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    document.head.appendChild(link);
}
loadSweetAlert2()

// 2.confirm確認窗
// 用法 替換原 confirm() => await customConfirm() 
function customConfirm(confirmMsg){
    return new Promise((resolve) => {
        Swal.fire({
            title: confirmMsg,
            showCancelButton: true,
            confirmButtonText: "確認",
            cancelButtonText: `返回`
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true)
            }else{
                resolve(false)
            }
        });
    });
}

// 2.confirm確認窗
// 用法 替換原 confirm() => await customConfirm()
function customConfirm(confirmMsg){
    let len = confirmMsg.length
    let width;
    if (len > 32) {
        width = "48em";
    } else {
        width = "32em";
    }

    return new Promise((resolve) => {
        Swal.fire({
            title: confirmMsg,
            showCancelButton: true,
            confirmButtonText: "YES",
            cancelButtonText: "NO",
            confirmButtonColor: "#004aa5",
            width: width
        }).then((result) => {
            if (result.isConfirmed) {
                resolve(true)
            }else{
                resolve(false)
            }
        });
    });
}

// 2.alert提示窗
// 用法 替換原 alert() => await customAlertSuccess()
// 若不需要等待用戶按下OK 則不用加"await"
function customAlertSuccess(alertMsg){
    return new Promise((resolve) => {
        Swal.fire({
            text: alertMsg,
            icon: "success",
            confirmButtonColor: "#004aa5"
        }).then(() => {
            resolve(true)
        });
    })
}
function customAlertError(alertMsg){
    return new Promise((resolve) => {
        Swal.fire({
            text: alertMsg,
            icon: "error",
            confirmButtonColor: "#004aa5"
        }).then(() => {
            resolve(true)
        });
    })

}
function customAlertWarning(alertMsg){
    return new Promise((resolve) => {
        Swal.fire({
            text: alertMsg,
            icon: "warning",
            confirmButtonColor: "#004aa5"
        }).then(() => {
            resolve(true)
        });
    })
}