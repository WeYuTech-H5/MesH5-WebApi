// 上線人數
let onlineUsers = 'N/A';
let maxUsers = 'N/A';
// $.ajax({
//   type: 'GET',
//   url: window.location.protocol+'//' + default_ip + '/' + default_Api_Name + '/api/GetCurUsersCount',
//   async: false,
//   success: function (result) {
//     onlineUsers = result.cur_users_count
//     maxUsers = result.max_users_count
//   }
// })

// // 客製化語系翻譯
// if(localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng')){
//     document.getElementById('guestMode').textContent = GetKeyWord('Guest TV Mode')
//     document.getElementById('welcomeText').textContent = GetKeyWord('Welcome back, please log in.')
//     document.getElementById('login').textContent = GetKeyWord('log in')
//     document.getElementById('showUsers').textContent =
//     `${GetKeyWord('Online Users')}: ${onlineUsers} / ${GetKeyWord('Max Users')}: ${maxUsers}`
    
//     // 顯示當前語系
//     document.getElementById('selectedLang').textContent = GetKeyWord(localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng'))

// }





const login = document.querySelector('#login');

// let ApiURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/WeyuLoginV2/';
let ApiURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/';

// let LoginURL = ApiURL+ 'Weyu_Login';
let LoginURL = ApiURL+ 'H5_Login';


//如果已經登入 則返回 index頁
if(localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo') === null&&localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey') === null&&localStorage.getItem(PROJECT_SAVE_NAME+'_BI_Refresh_TokenKey') === null){

}
else{
      //轉址
      // 指定要导航到的新URL
      let newUrl = window.location.protocol+'//'+location.hostname + (location.port ? ':' + location.port : '')+'/'+PROJECT_NAME+'/'+kanbanRoute+'/index.html'; // 替换为您想要导航的URL
      // 使用window.location.href来在同一页面内导航
      window.location.href = newUrl;
}

// 按鈕登入
login.addEventListener('click', userLogin);
// ENTER
document.getElementById('pw').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    // 如果用户按下ENTER键，执行登录
    userLogin();
  }
});
 
function userLogin(){
  // 获取输入框的ID值
  let inputId = document.getElementById('id').value;
  let inputPWD = document.getElementById('pw').value;

  //檢查是否輸入
  if (inputId === '' || inputPWD === '') {
    alert('Please enter your account and password.')
    return;
  }else{
    let body  = {
      'UID': document.querySelector('#id').value,
      'PWD': document.querySelector('#pw').value
    };

    fetch(LoginURL, {
        method: 'POST', // 请求方式是POST
        headers: {
          'Content-Type': 'application/json', // 设置请求头的Content-Type为JSON
        },
        body: JSON.stringify(body) // 将请求参数放在请求的body中，需要将对象转换为JSON字符串
      })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Network response was not ok');
      }
    })
    .then(async data => {

      if(data.result){
          // 儲存 帳號
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_accountNo', data.UserInfo[0].ACCOUNT_NO);
          // 儲存 用戶名
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_userName', data.UserInfo[0].USER_NAME);
          // 儲存 第一次的 TokenKey
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_TokenKey', data.UserCertInfo[0].TokenKey);
          // 儲存 Token有效期
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_TokenExpiry', data.UserCertInfo[0].TokenExpiry);
          // 儲存 權限資料
          // 模組
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_authCATEGORY', data.UserAuthInfo.CATEGORY.map(e=> e.CATEGORY_SID));
          // 功能
          const funSIDs = Object.values(data.UserAuthInfo.FUNCTION).flatMap((e) =>e.map((item) => item.FUN_SID));
          localStorage.setItem(PROJECT_SAVE_NAME+'_BI_authFUNCTION', funSIDs);


          // 轉址
          // 指定要导航到的新URL
          let newUrl = window.location.protocol+'//'+location.hostname + (location.port ? ':' + location.port : '')+'/'+PROJECT_NAME+'/'+kanbanRoute+'/index.html'; // 替换为您想要导航的URL
          // 使用window.location.href来在同一页面内导航
          window.location.href = newUrl;
      }
      else{
        alert('Account or password input failed.')
      }
      
    })
    .catch(error => {
      // 处理错误
      console.error('An error occurred:', error);
    });
  }
}


// 選擇語系
function SelectLang(languageCode) {
  localStorage.setItem(PROJECT_SAVE_NAME + '_v1_lng', languageCode);
  GetLang()
}


async function GetLang() {
  // 定义 GetLang API 的 URL
  let getLangURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/H5_GetLang';

  // 构建请求头
  let headers = new Headers({
      'Content-Type': 'application/json',
      LangCode : localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng'),
      TokenKey : '302e24cbGasdasdTzA1zYjVFHLfUNtqsWonT' // 不檢查過期
      // 可以添加其他必要的请求头信息
  });

  // 构建请求配置
  let requestOptions = {
      method: 'POST', // 使用 POST 请求方式
      headers: headers,
  };

  try {
      // 发送请求并等待响应
      let response = await fetch(getLangURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          let data = await response.json();
          console.log("获取翻译包数据成功:", data);
          // 在这里处理获取到的翻译包数据
          // 将数组转换为 JSON 字符串
          let jsonString = JSON.stringify(data.data);
          // 存储 JSON 字符串到 localStorage
          localStorage.setItem(PROJECT_SAVE_NAME+'_v1_langDic', jsonString);
          location.reload(); // 更新頁面
      } else {
          throw new Error('获取翻译包数据失败，状态码：' + response.status);
      }
  } catch (error) {
      console.error(error);
  }
}

//關鍵字查找
function GetKeyWord(keyword){
  try {
      let foundObject = findObjectByKeyword(keyword);

      if (foundObject) {
          return foundObject.VALUE; //console.log("找到匹配的对象:", foundObject);
      } else {
          console.log("未找到匹配的对象。"+keyword);
          return keyword;
      }
  } catch (error) {
      // 异常处理代码块
      console.error("发生异常：" + error.message);
  }
}

// 查找包含指定关键字的对象
function findObjectByKeyword(keyword) {
// 从 localStorage 中获取存储的 JSON 字符串
let storedData = localStorage.getItem(PROJECT_SAVE_NAME+'_v1_langDic');
// 解析 JSON 字符串为 JavaScript 数组
let retrievedArray = JSON.parse(storedData);

for (let i = 0; i < retrievedArray.length; i++) {
    let object = retrievedArray[i];
    if (object.KEYWORDS === keyword) {
        return object;
    }
}
return null; // 如果未找到匹配的对象，则返回 null
}


if(localStorage.getItem(PROJECT_SAVE_NAME+'_v1_lng')==null){
  localStorage.setItem(PROJECT_SAVE_NAME+'_v1_lng','en_us');
  GetLang();
}
