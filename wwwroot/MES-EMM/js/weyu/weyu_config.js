// 控制 index 顯示數量
var indexItem = 3;

// 控制選單按鈕&圖片的名稱
var itemNames = ['BI', 'ADM', 'EMS']

var imgNames = ['BI.jpg','ADM.jpg','Production.jpg']
// 控制選單按鈕的 URL
var itemURL = [
    "zz_query/zz_production.html?MODULE_NAME=Kanban&LEVEL=L1", //"zz_query/zz_board1.html?level=1",
    "zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L1",
    "zz_query/zz_production.html?MODULE_NAME=EMS&LEVEL=L1"
]

// 是否需要 Loading 畫面 ( true開 / false關 )
var ifLoadMask = false;

// 儲存 token資訊命名開頭
var PROJECT_SAVE_NAME = 'WeyuBI'; //等同畫面 左上標題

// 網站名稱
var PROJECT_NAME = 'WYBI2025';

// api 預設 參數
var default_ip = location.hostname + (location.port ? ':' + location.port : '');

// var default_Api_Name = 'WEYU_BIAPI';
var default_Api_Name = 'DCMATE_MEMS_API';
// 舊 api 預設 參數
var default_WebSiteName = 'DCMATE_MEMS_DCMATE';

//報工 & 語系參數
var OPU_NAME = "DCMATE_MEMS_APP";

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



// 创建包含网址映射的数组
let BackurlMappings = [
    // BI
    { LV: 'L2', MODULE_NAME: 'Kanban', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=Kanban&LEVEL=L1" },
  
    //系統參數
    { LV: 'L2', MODULE_NAME: 'System_Parameters', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=System_Parameters&LEVEL=L1" },
    { LV: 'L3', MODULE_NAME: 'System_Parameters', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=System_Parameters&LEVEL=L2&TYPE=Multilingual&BUTTON=A" },
    { LV: 'L3', MODULE_NAME: 'System_Parameters', BUTTON: 'E', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=System_Parameters&LEVEL=L2&TYPE=System_Parameters&BUTTON=A" },
   
    //ADM
    { LV: 'L2', MODULE_NAME: 'ADM', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L1"},
    { LV: 'L3', MODULE_NAME: 'ADM', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L2&BUTTON=A&TYPE=COMPANY"},
    { LV: 'L3', MODULE_NAME: 'ADM', BUTTON: 'B', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L2&BUTTON=A&TYPE=ERP"},
    { LV: 'L3', MODULE_NAME: 'ADM', BUTTON: 'C', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L2&BUTTON=A&TYPE=USER"},
    { LV: 'L4', MODULE_NAME: 'ADM', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L3&BUTTON=A&TYPE=SHIFT"},
    { LV: 'L4', MODULE_NAME: 'ADM', BUTTON: 'B', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/query/grid-smart-query.html?MODULE_NAME=ADM&SID=335551651173289&LEVEL=L3&BUTTON=C&TYPE=USER_GROUP"},
    { LV: 'L4', MODULE_NAME: 'ADM', BUTTON: 'C', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/query/grid-smart-query.html?MODULE_NAME=ADM&SID=335550119320875&LEVEL=L3&BUTTON=C&TYPE=USER"},
    { LV: 'L5', MODULE_NAME: 'ADM', BUTTON: 'A', URL:  window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/zz_query/zz_production.html?LEVEL=L4&MODULE_NAME=ADM&TYPE=USER_GROUP&BUTTON=B"},

     // EMS
     { LV: 'L2', MODULE_NAME: 'EMS', BUTTON: 'A', URL: window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME +"/"+kanbanRoute+ "/zz_query/zz_production.html?MODULE_NAME=EMS&LEVEL=L1" },
     { LV: 'L3', MODULE_NAME: 'EMS', BUTTON: 'A', URL: window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME +"/"+kanbanRoute+ "/zz_query/zz_production.html?MODULE_NAME=EMS&LEVEL=L2&TYPE=PARAMETER&BUTTON=A" },
     { LV: 'L3', MODULE_NAME: 'EMS', BUTTON: 'B', URL: window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME +"/"+kanbanRoute+ "/query/grid-smart-query.html?MODULE_NAME=EMS&SID=331903774523639&LEVEL=L2&BUTTON=A" },
     { LV: 'L3', MODULE_NAME: 'EMS', BUTTON: 'C', URL: window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME +"/"+kanbanRoute+ "/zz_query/zz_production.html?MODULE_NAME=EMS&LEVEL=L2&TYPE=OPI&BUTTON=A" },
     { LV: 'L4', MODULE_NAME: 'EMS', BUTTON: 'B', URL: window.location.protocol + "//" + default_ip + "/" + PROJECT_NAME +"/"+kanbanRoute+ "/query/grid-smart-query.html?MODULE_NAME=EMS&SID=331903774523639&LEVEL=L2" },
 

    // 添加更多映射


  ];