// 如果要檢查此頁是否登入
if (localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo') === null&&localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey') === null&&localStorage.getItem(PROJECT_SAVE_NAME+'_BI_Refresh_TokenKey') === null) {
  // 值不存在
  Set_Clean();  
  
  } else {
    var username = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo');
    console.log('登入者:'+username);
  }







