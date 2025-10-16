ChangeLang()
//URL取參數
const urlParams = new URLSearchParams(window.location.search);
const MODULE_TYPE = urlParams.get('MODULE_TYPE');
const MODULE_NAME = urlParams.get('MODULE_NAME');
const LEVEL = urlParams.get('LEVEL');
const BUTTON = urlParams.get('BUTTON');
const TYPE = urlParams.get('TYPE');

// 添加点击事件处理程序
let backButton = document.getElementById("backButton");
backButton.addEventListener("click", function() {
    GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON);
});

let menuItem = 0;

let menuNames = [];

let menuImgs = [];

let menuURL = [];

init() //決定選單

// 開始插入選單元素
let htmlContent = '';

for (var i = 0; i < menuItem; i++) {
  htmlContent += `
    <div class="defaultBox grow">
      <div class="m-4">
        <a href="${menuURL[i]}"><img src="../img/weyu/${menuImgs[i]}" alt="item" class="mb-2">
          <h2 class="text-md text-sky-300 text-center">${GetLangDataV2(menuNames[i])}</h2>
        </a>
      </div>
    </div>
  `
}

document.querySelector('#itemList').innerHTML = htmlContent;


function init() {
  switch(MODULE_NAME){
    case null:
      $('#ProductionTitle').html(GetLangDataV2('ADM'))
      menuItem = 3;
      menuNames =['Smart master','User Authorization','Layout']
      menuImgs = ['default.png','default.png','default.png']
      menuURL = [
        "ADM_GridMenu.html?MODULE_TYPE=MES-ADM&MODULE_NAME=SMART_MASTER&LEVEL=L1",
        "ADM_GridMenu.html?MODULE_TYPE=MES-ADM&MODULE_NAME=USER_AUTHZ&LEVEL=L1",
        "../setup/master-maintain.html?SID=369761779674442&MODULE_TYPE=MES-ADM&LEVEL=L1",
      ];
    break;
    case 'USER_AUTHZ':
      $('#ProductionTitle').html(GetLangDataV2('USER_AUTHZ'))
      menuItem = 4;
      menuNames =['Group Maintain','Group Funciton Relation','User Maintain','User Group Relation']
      menuImgs = ['default.png','default.png','default.png','default.png']
      menuURL = [
        "../setup/master-maintain.html?SID=50603545907267&MODULE_TYPE=MES-ADM&MODULE_NAME=USER_AUTHZ&LEVEL=L2&BUTTON=A",
        "../setup/master-detail.html?SID=148122421380739&MODULE_TYPE=MES-ADM&MODULE_NAME=USER_AUTHZ&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=350732070140433&MODULE_TYPE=MES-ADM&MODULE_NAME=USER_AUTHZ&LEVEL=L2&BUTTON=A",
        "../setup/master-detail.html?SID=197803630100659&MODULE_TYPE=MES-ADM&MODULE_NAME=USER_AUTHZ&LEVEL=L2&BUTTON=A",
      ];
    break;
    case 'SMART_MASTER':
      $('#ProductionTitle').html(GetLangDataV2('SMART_MASTER'))
      menuItem = 1;
      menuNames =['Main file maintenance setting']
      menuImgs = ['default.png']
      menuURL = [
        "../setup/master-maintain.html?SID=367252115657308&MODULE_TYPE=MES-ADM&MODULE_NAME=SMART_MASTER&LEVEL=L2&BUTTON=A",
      ];
    break;
  }
}