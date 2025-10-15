// 儲存 token資訊命名開頭
var PROJECT_SAVE_NAME = 'MESH5-WEBAPI-20250228V2'; //等同畫面 左上標題

// 網站名稱
var PROJECT_NAME = 'MESH5-WEBAPI-20250228V2';
var kanbanRoute = "wwwroot"; //api底下 看板路徑(資料夾名稱)


// api 預設 參數
var default_ip = location.hostname + (location.port ? ':' + location.port : '');

var default_Api_Name = 'MESH5-WEBAPI-20250228V2';
// 舊 api 預設 參數
var default_WebSiteName = 'DCMATEV4';

// api轉址預設 路徑
var weyu_login_url = "/"+default_Api_Name+"/wwwroot/login.html";

//预设语系
var default_lng = localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng')  || "en_us";
var ClientName = PROJECT_SAVE_NAME+"_v1"//必須命名
var ClientVer = "1.0.0"
//網頁SERVER模式(自動偵測API的網址)
var WebServerMode = false;


//單語系
var LongType = 'GetDic4APPOneLan';//
//雙語系
// var LongType = 'GetDic4APP';