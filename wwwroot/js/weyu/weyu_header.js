// 設置語系
let langue = GetShowLngText();
let langueStatus = document.getElementById('langueStatus');
let langueString = `
<button type="button" class=" text-sky-200 ml-auto" style="padding: 10px">` +
  langue +
`</button>`
; 
langueStatus.innerHTML = langueString;
// 設置使用者
let account = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_userName');
let accountStatus = document.getElementById('accountStatus');
let accountString = `
<button type="button" class=" text-sky-200 ml-auto" style="padding: 10px">` +
  account +
`</button>`
; 
accountStatus.innerHTML = accountString;


// 設置登出鍵
let logoutStatus = document.getElementById('logout');
let logoutString =
`<button class=" text-sky-200 ml-auto" style="padding: 10px">LOG OUT</button>`
logoutStatus.innerHTML = logoutString;
// 登出功能
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('#logout').addEventListener("click", function() {
    Set_Clean();
  });
});
