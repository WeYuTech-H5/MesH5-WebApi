// 取得 grid API
async function getGridData(SID) {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/H5_GetGrid';
  
    // 定义要传递的参数对象
    let params = {
        SID: SID
        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };
  
    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛
        // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
        // Oper: ["like", "between"],
        // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
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

// 取得 grid API (資料表涵式)
async function getFunctionGridData(SID,conditions) {
    // 定义 GetGrid API 的 URL
    let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/H5_GetFunctionGrid';
  
    // 定义要传递的参数对象
    let params = {
        SID: SID,
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
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
// 取得 Chart API
async function getChartData(SID) {
    // 定义 GetGrid API 的 URL
    let getChartURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetChart';

    // 定义要传递的参数对象
    let params = {
        SID: SID,
        TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')

        // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
    };

    // 定义查詢条件参数对象
    let conditions = {
        // 每個SID 要塞的條件皆不同,塞錯會掛 , 沒有條件就不用塞
        // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
        // Oper: ["like", "between"],
        // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
    };

    // 构建请求头
    let headers = new Headers({
        'Content-Type': 'application/json',
        'SID': params.SID,
        'TokenKey': params.TokenKey
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
        let response = await fetch(getChartURL, requestOptions);

        if (response.ok) {
            // 解析响应为 JSON
            let data = await response.json();
            // console.log("获取chart数据成功:", data);
            if(data.result){
                return data;
            }
            else{
                Set_Clean();
            }
        } else {
            throw new Error('获取chart数据失败，状态码：' + response.status);
        }
    } catch (error) {
        console.error(error);
    }
}

//取得語系關鍵字
//let value = GetKeyWord('ALM_ACCOUNT'); //使用範例
//console.log(value);
//關鍵字查找
function GetKeyWord(keyword){
    try {
        var foundObject = findObjectByKeyword(keyword);

        if (foundObject) {
            return foundObject.VALUE; //console.log("找到匹配的对象:", foundObject);
        } else {
            console.log("未找到匹配的对象。"+keyword);
        }
    } catch (error) {
        // 异常处理代码块
        console.error("发生异常：" + error.message);
    }
}

// 查找包含指定关键字的对象
function findObjectByKeyword(keyword) {
  // 从 localStorage 中获取存储的 JSON 字符串
  var storedData = localStorage.getItem(PROJECT_SAVE_NAME+'_v1_langDic');
  // 解析 JSON 字符串为 JavaScript 数组
  var retrievedArray = JSON.parse(storedData);

  for (var i = 0; i < retrievedArray.length; i++) {
      var object = retrievedArray[i];
      if (object.KEYWORDS === keyword) {
          return object;
      }
  }
  return null; // 如果未找到匹配的对象，则返回 null
}

//取得翻譯 API *第一次登入後決定語系
async function GetLang() {
  // 定义 GetLang API 的 URL
  var getLangURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/H5_GetLang';

  // 构建请求头
  var headers = new Headers({
      'Content-Type': 'application/json',
      LangCode : localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng'),
      TokenKey : localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // 可以添加其他必要的请求头信息
  });

  // 构建请求配置
  var requestOptions = {
      method: 'POST', // 使用 POST 请求方式
      headers: headers,
  };

  try {
      // 发送请求并等待响应
      var response = await fetch(getLangURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          var data = await response.json();
        //   console.log("获取翻译包数据成功:", data);
          // 在这里处理获取到的翻译包数据
          // 将数组转换为 JSON 字符串
          var jsonString = JSON.stringify(data.data);
          // 存储 JSON 字符串到 localStorage
          localStorage.setItem(PROJECT_SAVE_NAME+'_v1_langDic', jsonString);

      } else {
          throw new Error('获取翻译包数据失败，状态码：' + response.status);
      }
  } catch (error) {
      console.error(error);
  }
}

// 调用函数以获取翻译包数据
GetLang();

//過濾 特殊字元
function TransSpecialChar(str){
  if(str!=undefined && str!= "" && str !='null'){
      str = str.replaceAll(/\t/g," "); //TAB
      str = str.replaceAll(/ /g," "); //半形空白
      str = str.replaceAll(/　/g," "); //全形空白
  }
  return str;
}



//只要撈資料的 AJAX回傳 false 就要 清空 導回登入頁
function Set_Clean(){
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_TokenKey');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_accountNo');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_userName');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_authCATEGORY');
  localStorage.removeItem(PROJECT_SAVE_NAME+'_BI_authFUNCTION');
  // 失敗後導回 登入頁
  window.location.href = window.location.protocol+'//'+location.hostname + (location.port ? ':' + location.port : '')+'/'+PROJECT_NAME+'/'+kanbanRoute+'/login.html';

}
function GetShowLngText(){

    switch (localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng')){

      case "en_us":
        return "English";
        break;
      case "zh_CHT":
        return "正體中文";
        break;
      case "zh_CHS":
        return "簡體中文";
        break;
      default:
        return "N/A";
        break;

    }

}


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

// QC客製用連結
// key = 計畫SID 和 value = Back的Url
var QCBackUrl = [
    { key: '339952188840318', value: window.location.protocol+"//"+default_ip+"/"+kanbanRoute+"/"+PROJECT_NAME+"/"+kanbanRoute+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=339952188840318&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '340629801423508', value: window.location.protocol+"//"+default_ip+"/"+kanbanRoute+"/"+PROJECT_NAME+"/"+kanbanRoute+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=340629801423508&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '339939455610574', value: window.location.protocol+"//"+default_ip+"/"+kanbanRoute+"/"+PROJECT_NAME+"/"+kanbanRoute+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=339939455610574&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '341063226356399', value: window.location.protocol+"//"+default_ip+"/"+kanbanRoute+"/"+PROJECT_NAME+"/"+kanbanRoute+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=341063226356399&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' },
    { key: '341159099113860', value: window.location.protocol+"//"+default_ip+"/"+kanbanRoute+"/"+PROJECT_NAME+"/"+kanbanRoute+'/query/grid-smart-query.html?SID=337710329736303&QC_INSPECTION_PLAN_SID=341159099113860&LEVEL=L4&MODULE_NAME=QC&BUTTON=B' }
  
];


async function GoBack(MOUDLE_TYPE,Level,MOUDLE_NAME,Button){
    // 若無參數則返回模組選單
    if(!MOUDLE_TYPE){
        window.location.href = `/${PROJECT_NAME}/${kanbanRoute}/index.html`
    }

    let backUrlData;

    try {
        //取得對應模組的 url 設定檔
        let response = await fetch(`/${PROJECT_NAME}/${kanbanRoute}/${MOUDLE_TYPE}/backUrl.json?_t=${Date.now()}`);
        backUrlData = await response.json();
        //跳轉網址
        window.location.href = GetUrl(Level,MOUDLE_NAME,Button);
    } catch (error) {
        console.error('Error fetching JSON:', error);  // 處理錯誤
    }
    
    function GetUrl(Level,MOUDLE_NAME,Button){
        for (var i = 0; i < backUrlData.length; i++) {
            var mapping = backUrlData[i];
            // 如果為第一層
            if (
                mapping.LV === Level &&
                Level === 'L1'
            ) {
                return window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/" + mapping.URL;
            }
            // other
            if (
                mapping.LV === Level &&
                mapping.MODULE_NAME === MOUDLE_NAME &&
                mapping.BUTTON === Button
            ) {
                return window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/" + mapping.URL;
            }
        }
        //若未找到符合資料 返回首頁
        return window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME + '/'+kanbanRoute+'/index.html'
    }
}

function GetZZUrl(key) {
    let tmpurl=window.location.protocol+"//"+default_ip+"/"+PROJECT_NAME+"/"+kanbanRoute+"/query/grid-smart-query.html?MODULE_NAME=QC&SID=337703789526626&LEVEL=L3&BUTTON=B";
    for (var i = 0; i < QCBackUrl.length; i++) {
        if (QCBackUrl[i].key === key) {
            return QCBackUrl[i].value;
        }
    }
    // 如果找不到對應的 key，預設值返回QC查詢的L1位置
    return tmpurl;
}

//最後更新資料時間
async function updateTime(ElementID){
    let getTimeData = await getGridData('252236119093442');
    let lastUpdateTime = new Date(getTimeData.Grid_Data[0].TIMESPAN)
    let hour = lastUpdateTime.getHours();
    let minute = lastUpdateTime.getMinutes();
    document.getElementById(ElementID).textContent = (`${hour}:${minute < 10 ? '0' : ''}${minute}`)
}




var now = new Date();
var VersionTime = now.getFullYear().toString()
    + String(now.getMonth() + 1).padStart(2, '0')
    + String(now.getDate()).padStart(2, '0')
    + String(now.getHours()).padStart(2, '0')
    + String(now.getMinutes()).padStart(2, '0')
    + String(now.getSeconds()).padStart(2, '0');