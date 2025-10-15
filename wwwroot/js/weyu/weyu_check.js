// 如果要檢查此頁是否登入
const tokenExpiry = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenExpiry');

if (localStorage.getItem(PROJECT_SAVE_NAME + '_BI_accountNo') === null
  || !tokenExpiry
  || new Date() > new Date(tokenExpiry)) {
  // 帳號不存在 或 沒有 tokenExpiry 或 token 已過期
  Set_Clean();
} else {
  var username = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_accountNo');
  console.log('登入者:' + username);
}

// 定時檢查token是否在有效期
setInterval(() => {
  
  checkTokenExpiry()
}, 60 * 1000)

function checkTokenExpiry() {
  let now = new Date()
  let tokenExpiry = new Date(localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenExpiry'));
  let isOvertime = now > tokenExpiry

  // 若超過有效期 強制登出
  if (isOvertime || !localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')) Set_Clean()
}

$(document).ajaxComplete(function (event, xhr, settings) {
    try {
        // 假設後端回傳 JSON 裡有 newToken
        const response = JSON.parse(xhr.responseText);
        console.log(response)
        if (response.TokenInfo) {

            localStorage.setItem(PROJECT_SAVE_NAME + '_BI_TokenExpiry', response.TokenInfo[0].TokenExpiry);
            $('#tokenExpiry').text('登入有效期:' + localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenExpiry'));
        }
    } catch (e) {
        // response 不是 JSON 的話就忽略
    }
});




