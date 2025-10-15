ChangeLang()
let authKeys = localStorage.getItem(PROJECT_SAVE_NAME + '_BI_authFUNCTION').split(",")

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


function getShiftDay(date = new Date()) {
  const shiftStartHour = 8; // 班別起始時間為早上8點

  // 建立當天早上8點的時間點
  const shiftStart = new Date(date);
  shiftStart.setHours(shiftStartHour, 0, 0, 0);

  // 如果當前時間比當天早上8點早，就屬於前一天的班別
  if (date < shiftStart) {
    // 退回一天
    shiftStart.setDate(shiftStart.getDate() - 1);
  }

  // 回傳 YYYY-MM-DD 格式
  return shiftStart.toISOString().split('T')[0];
}

// 使用範例
const SHIFT_DAY = getShiftDay();


let menuItem = 0;

let menuKeys = []

let menuNames = [];

let menuImgs = [];

let menuURL = [];

init() //決定選單

// 開始插入選單元素
let htmlContent = '';

for (var i = 0; i < menuItem; i++) {
  if (menuKeys.length == 0 || !menuKeys[i] || authKeys.includes(menuKeys[i])) {
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
}

document.querySelector('#itemList').innerHTML = htmlContent;


function init() {
  switch (MODULE_NAME) {
    case null:
      $('#ProductionTitle').html(GetLangDataV2('WIP'))
      menuItem = 4;
      menuKeys = ["", "", ""]
      menuNames = ["Basic_Information", "WIP_PLAN", "WIP_QUERY", "WIP_OPI"]
      menuImgs = ['default.png', 'default.png', 'default.png', 'default.png']
      menuURL = [
        "WIP-menu.html?MODULE_TYPE=MES-WIP&MODULE_NAME=Basic_Information&LEVEL=L1",
        "WIP-menu.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_PLAN&LEVEL=L1",
        "WIP-menu.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L1",
        "WIP-menu.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L1",
      ];
      break
    case 'WIP_PLAN':
      $('#ProductionTitle').html(GetLangDataV2('WIP_PLAN'))
      menuItem = 3;
      menuNames = ['FORMING','HEATING','CUTTING']
      menuImgs = ['default.png','default.png','default.png']
      menuURL = [
        "../setup/master-maintain-main.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_PLAN&LEVEL=L2&BUTTON=A&SID=384878600846838&ODF=SCHEDULE_DATE DESC",
        "../setup/master-maintain-main.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_PLAN&LEVEL=L2&BUTTON=A&SID=388315282956655&ODF=SCHEDULE_DATE DESC",
        "../setup/master-maintain-main.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_PLAN&LEVEL=L2&BUTTON=A&SID=388316389780078&ODF=SCHEDULE_DATE DESC",
      ];
      break
    case 'Basic_Information':
      $('#ProductionTitle').html(GetLangDataV2('Basic_Information'))
      menuItem = 5;
      menuNames = ['REASON', 'WO', 'ITEM_NO', 'ITEM_CATEGORY','OPERATION']
      menuImgs = ['default.png', 'default.png', 'default.png', 'default.png', 'default.png']
      menuURL = [
        "../setup/master-maintain.html?SID=336998799916033&MODULE_TYPE=MES-WIP&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",
        "../setup/master-maintain.html?SID=102783947126051&MODULE_TYPE=MES-WIP&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A&ODF=WO DESC",
        "../setup/master-maintain.html?SID=366573101658669&MODULE_TYPE=MES-WIP&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A&ODF=PART_NO DESC",
        "../setup/master-maintain.html?SID=387642920210444&MODULE_TYPE=MES-WIP&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A&ODF=PN_CATEGORY_NO DESC",
        "../setup/master-maintain.html?SID=385898273676563&MODULE_TYPE=MES-WIP&MODULE_NAME=Basic_Information&LEVEL=L2&BUTTON=A",      
      ];
      break
    case 'WIP_QUERY':
      if (BUTTON === null) {
        $('#ProductionTitle').html(GetLangDataV2('WIP_QUERY'))
        menuItem = 2;
        menuNames = ['FORMING', 'HEATING']
        menuImgs = ['default.png', 'default.png']
        menuURL = [
          "WIP-menu.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L2&BUTTON=FORMING",
          "WIP-menu.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L2&BUTTON=HEATING",

        ];
      } else if (BUTTON === "HEATING") {
        $('#ProductionTitle').html(GetLangDataV2('HEATING'))
        menuItem = 2;
        menuNames = ['HEATING Check-Out Hist', 'HEATING_NG']
        menuImgs = ['default.png', 'default.png']
        menuURL = [
          "../query/grid-smart-query.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L3&BUTTON=HEATING&SID=380644636720705&ODF=CREATE_TIME DESC",
          "../query/grid-smart-query.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L3&BUTTON=HEATING&SID=380656886050246",
        ];
      } else if (BUTTON === "FORMING") {
        $('#ProductionTitle').html(GetLangDataV2('FORMING'))
        menuItem = 1;
        menuNames = ['FORMING_NG Hist', 'FORMING Check-Out Hist']
        menuImgs = ['default.png', 'default.png']
        menuURL = [
          "../query/grid-smart-query.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L3&BUTTON=FORMING&SID=380647399390000&ODF=CREATE_TIME DESC",
          "../query/grid-smart-query.html?MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_QUERY&LEVEL=L3&BUTTON=FORMING&SID=380656910326393",
        ];
      }

      break
    case 'WIP_OPI':
      $('#ProductionTitle').html(GetLangDataV2('MASTER'))
      menuItem = 2;
      menuNames = ['FORMING_OPI', 'HEATING_OPI']
      menuImgs = ['default.png', 'default.png']
      menuURL = [
        'setup/wip-query_schedule.html?SID=386440715240108&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&OPERATION=FORMING&SHIFT_DAY=' + SHIFT_DAY,
        'setup/wip-query_schedule.html?SID=386440715240108&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&OPERATION=HEATING&SHIFT_DAY=' + SHIFT_DAY,


      ];
      break
      // case "QC": //機台維護
      if (TYPE === null) {
        $('#ProductionTitle').html(GetLangDataV2('Master_Maintenance'));
        menuItem = 3;
        menuNames = ['QC OPI', 'Report Query', 'QC Parameter'];
        menuImgs = ["default.png", "default.png", "default.png"]
        menuURL = [
          `WIP-menu.html?MODULE_TYPE=AIOT&MODULE_NAME=QC&LEVEL=L2&BUTTON=A&TYPE=OPI`,
          `WIP-menu.html?MODULE_TYPE=AIOT&MODULE_NAME=QC&LEVEL=L2&BUTTON=A&TYPE=QUERY`,
          `WIP-menu.html?MODULE_TYPE=AIOT&MODULE_NAME=QC&LEVEL=L2&BUTTON=A&TYPE=PARAMETER`
        ];
      } else if (TYPE === 'OPI') {
        $('#ProductionTitle').html(GetLangDataV2('QUERY'));
        menuItem = 1;
        menuNames = ['Regular Inspection'];
        menuImgs = ["default.png"]
        menuURL = [
          "setup/inspection.html?SID=337688858300323&LEVEL=L3&MODULE_TYPE=AIOT&MODULE_NAME=QC&BUTTON=A&ODF=ORDER_NAME DESC",
        ];
      } else if (TYPE === 'QUERY') {
        $('#ProductionTitle').html(GetLangDataV2('WIP_OPI'));
        menuItem = 2;
        menuNames = ['Daily Report', 'Detail Query'];
        menuImgs = ["default.png", "default.png"]
        menuURL = [
          `../query/grid-smart-query.html?MODULE_TYPE=AIOT&MODULE_NAME=QC&SID=353163959260376&LEVEL=L3&BUTTON=B`,
          `../query/grid-smart-query.html?MODULE_TYPE=AIOT&MODULE_NAME=QC&SID=352807802633911&LEVEL=L3&BUTTON=B`
        ];
      } else if (TYPE === 'PARAMETER') {
        $('#ProductionTitle').html(GetLangDataV2('QC Parameter'));
        menuItem = 1;
        menuNames = ['Inspection Plan'];
        menuImgs = ["default.png", "default.png", "default.png", "default.png", "default.png"]
        menuURL = [
          'setup/inspection.html?SID=337362726450711&LEVEL=L3&MODULE_TYPE=AIOT&MODULE_NAME=QC&BUTTON=C&TYPE=HOURLY',
        ];
      }
      break;
  }
}