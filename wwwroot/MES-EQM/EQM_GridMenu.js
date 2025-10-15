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
      $('#ProductionTitle').html(GetLangDataV2('EQM'))
      menuItem = 3;
      menuNames = ['Basic_Information', 'EQM_QUERY', 'EQM_STATUS_CHANGE']
      menuImgs = ['default.png', 'default.png', 'default.png']
      menuURL = [
        "EQM_GridMenu.html?MODULE_TYPE=MES-EQM&MODULE_NAME=Basic_Information&LEVEL=L1",
        "EQM_GridMenu.html?MODULE_TYPE=MES-EQM&MODULE_NAME=EQM_QUERY&LEVEL=L1",
        "OPI/eqp_status.html?MODULE_TYPE=MES-EQM&LEVEL=L1"
      ];
      break
    case 'Basic_Information':
      $('#ProductionTitle').html(GetLangDataV2('Basic_Information'))
      menuItem = 3;
      menuNames = ['EQP_MASTER', 'EQP_STATUS','OPERATION_EQP']
      menuImgs = ['default.png', 'default.png','default.png']
      menuURL = [
        "../setup/master-maintain.html?SID=102785271380810&MODULE_TYPE=MES-EQM&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=108162161773646&MODULE_TYPE=MES-EQM&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=387648315300900&MODULE_TYPE=MES-EQM&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",
      ];
      break
    case 'EQM_QUERY':
      $('#ProductionTitle').html(GetLangDataV2('EQM_QUERY'))
      menuItem = 1;
      menuNames = ['EQP_STATUS_CHANGE_HIST Reporting']
      menuImgs = ['default.png']
      menuURL = [
        "../query/grid-smart-query.html?SID=383414702496625&MODULE_TYPE=MES-EQM&MODULE_NAME=EQM_QUERY&LEVEL=L2&BUTTON=A&ODF=FROM_EQP_STATUS_TIME DESC",
      ];
      break
  }
}