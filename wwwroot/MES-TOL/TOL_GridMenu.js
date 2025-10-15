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
backButton.addEventListener("click", function () {
  GoBack(MODULE_TYPE, LEVEL, MODULE_NAME, BUTTON);
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
  switch (MODULE_NAME) {
    case null:
      $('#ProductionTitle').html(GetLangDataV2('TOL'))
      menuItem = 1;
      menuNames = ['Basic Information']
      menuImgs = ['default.png']
      menuURL = [
        "TOL_GridMenu.html?MODULE_TYPE=MES-TOL&MODULE_NAME=Basic Information&LEVEL=L1",
      ];
      break
    case 'Basic Information':
      $('#ProductionTitle').html(GetLangDataV2('Basic Information'))
      menuItem = 4;
      menuNames = ['TOL_MASTER', 'TOL_MASTER_DETAILS', 'TOL_MATERIAL_TYPE', 'OPERATION_TOL']
      menuImgs = ['default.png', 'default.png', 'default.png', 'default.png']
      menuURL = [
        "../setup/master-maintain.html?SID=385216822886230&MODULE_TYPE=MES-TOL&MODULE_NAME=Basic Information&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=385218746086112&MODULE_TYPE=MES-TOL&MODULE_NAME=Basic Information&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=385892653813546&MODULE_TYPE=MES-TOL&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=385898768680272&MODULE_TYPE=MES-TOL&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",
        
      ];
      break
  }
}