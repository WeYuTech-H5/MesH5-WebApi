ChangeLang()
//URL取參數
const urlParams = new URLSearchParams(window.location.search);
const MODULE_TYPE = urlParams.get('MODULE_TYPE');
const MODULE_NAME = urlParams.get('MODULE_NAME');
const LEVEL = urlParams.get('LEVEL');
const BUTTON = urlParams.get('BUTTON');
const TYPE = urlParams.get('TYPE');

function getAdjustedToday() {
  const now = new Date();
  const hour = now.getHours();

  // 若時間 < 8 點，視為「昨天的 08:00 到今天 08:00」這一段
  if (hour < 8) {
    now.setDate(now.getDate() - 1);
  }

  // 取出年月日
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const todayDate = getAdjustedToday();


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
      $('#ProductionTitle').html(GetLangDataV2('WIP_Kanban'))
      menuItem = 2;
      menuNames =[ "WIP_Kanban","Plan_Kanban","QMM"]
      menuImgs = ['default.png','default.png','default.png']
      menuURL = [
        "WIP/L0/factory.html?MODULE_TYPE=MES-KANBAN&LEVEL=L1&SHIFT_DAY="+`${todayDate}`,
        "KANBAN-menu.html?MODULE_TYPE=MES-KANBAN&MODULE_NAME=Plan_KANBAN&LEVEL=L1&SHIFT_DAY=",
        "QMM/list.html?MODULE_TYPE=MES-KANBAN&LEVEL=L1&EQP_TYPE=FORM&SHIFT_DAY="+`${todayDate}`,
      ];
    break   
    
    case 'Plan_KANBAN':
      menuItem = 1;
      menuNames =[ "FORMING","Plan_Kanban","QMM"]
      menuImgs = ['default.png','default.png','default.png']
      menuURL = [
        
        `Plan/FORMING/forming_KANBAN.html?MODULE_TYPE=MES-KANBAN&MODULE_NAME=Plan_KANBAN&LEVEL=L1&EQP_TYPE=FORMING&SHIFT_DAY=${todayDate}`,
        
      ];
    break 
  }
}