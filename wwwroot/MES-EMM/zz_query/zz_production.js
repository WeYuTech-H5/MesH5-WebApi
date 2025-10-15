ChangeLang()
//返回功能
var Request = {}
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

var LEVEL = Request["LEVEL"] || null;
var MODULE_NAME = Request["MODULE_NAME"] || null;
var BUTTON = Request["BUTTON"] || null;
var EQP_NO = Request["EQP_NO"] || null; //EQP_MAINTAIN 用
var MOLD_NO = Request["MOLD_NO"] || null; //EQP_MAINTAIN 用
var CUSTOMER_COMPLAINTS_SID = Request["CUSTOMER_COMPLAINTS_SID"] || null; //CUSTOMER_COMPLAINTS 用
var TYPE = Request["TYPE"] || null; //判斷是否為查詢畫面
var TABLE_NAME = Request["TABLE_NAME"] || null; //判斷是否為查詢畫面

let backButton = document.getElementById("backButton");

// 添加点击事件处理程序
backButton.addEventListener("click", function() {

    GoBack(LEVEL,MODULE_NAME,BUTTON);
});




let productionItem = 1;

let productionNames = [];

let productionImgs = [];

let productionURL = [];

init(MODULE_NAME,TYPE)


let itemList = document.querySelector('#itemList');
  
let wrapperStart =
  `<div class="defaultBox grow">
  <div class="m-4">
  <a href="`;
  let wrapperMiddle = 
  `"><img src="../img/weyu/`;
  let wrapperEnd = 
  `" alt="item" class="mb-2" />
    <h2 class="text-md text-sky-300 text-center">`;

// Initialize the HTML content
let htmlContent = '';

  for (var i = 0; i < productionItem; i++) {
    htmlContent += wrapperStart + productionURL[i] + wrapperMiddle + productionImgs[i] + wrapperEnd + GetLangDataV2(productionNames[i]) + `</h2>
    </a>
    </div>
    </div>`;
  }

itemList.innerHTML = htmlContent;


function init(MODULE_NAME,TYPE) {
  
  switch(MODULE_NAME){

    case "Kanban":
      if(TYPE===null){
        $('#ProductionTitle').html(GetLangDataV2('Kanban mgt.'));
          productionItem = 4;
          productionNames = [ 'Taiwan Power Company', 'Electricity Meter', 'Electricity Meter Today', 'GEMTEK ALL Factory kW'];
          productionImgs = [  'EMS.png', 'FunctionList.png','ems_total.jpg', 'default.png']
          productionURL = [
            `../kanban/Taipower.html?LEVEL=L1`,
            `../kanban/card/functionList.html?LEVEL=L1`,
            "../kanban/EMS-Ekanban.html?level=1",
            '../kanban/EMS-Ekanban-kW.html?LEVEL=L1'
          ];
      }
      else{

      }
      break;
   
      
    case "System_Parameters":
      $('#ProductionTitle').html(GetLangDataV2('System Parameters'));
      if(TYPE===null){
        productionItem = 2;
        productionNames = ['Multilingual', 'System_Parameters'];
        productionImgs = ["default.png", "default.png"]
        productionURL = [
          "zz_production.html?MODULE_NAME=System_Parameters&LEVEL=L2&TYPE=Multilingual&BUTTON=A",
          "zz_production.html?MODULE_NAME=System_Parameters&LEVEL=L2&TYPE=System_Parameters&BUTTON=A"
        ];
      }
      else if(TYPE=="Multilingual"){
        productionItem = 3;
        productionNames = ['Language', 'Keyword', 'Keyword Mapping'];
        productionImgs = ["default.png", "default.png", "default.png"]
        productionURL = [
          "../setup/language.html?MODULE_NAME=System_Parameters&SID=338122266356238&LEVEL=L3&BUTTON=A",
          "../setup/language.html?MODULE_NAME=System_Parameters&SID=324404286486575&LEVEL=L3&BUTTON=A",
          "../setup/language.html?MODULE_NAME=System_Parameters&SID=324404734723914&LEVEL=L3&BUTTON=A",
        ];

      }
      else if(TYPE=="System_Parameters"){
        productionItem = 1;
        productionNames = ['MIS PassWord Reset'];
        productionImgs = ["default.png"]
        productionURL = [
          "../setup/reset-password.html?MODULE_NAME=System_Parameters&LEVEL=L3&BUTTON=E"
        ];
      }

    break;
    case "ADM":
      if(TYPE===null){
          $('#ProductionTitle').html(GetLangDataV2('ADM'))
          productionItem = 3;
          productionNames = ["Company", "ERP", "User" ];
          productionImgs = ['default.png','default.png','default.png']
          productionURL = [
            "../zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L2&BUTTON=A&TYPE=COMPANY",
            "../zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L2&BUTTON=A&TYPE=ERP",
            "../zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L2&BUTTON=A&TYPE=USER",
          ];
      }
      else if(TYPE === "COMPANY"){
        $('#ProductionTitle').html(GetLangDataV2('Company'));
        productionItem = 4;
        productionNames = ['Corporate Data', 'Factory','Department','Shift'];
        productionImgs = ["default.png", "default.png", "default.png", "default.png"]
        productionURL = [
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=146460074290502&LEVEL=L3&BUTTON=A",
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=146466785876807&LEVEL=L3&BUTTON=A",
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=147066513616260&LEVEL=L3&BUTTON=A",
          "../zz_query/zz_production.html?MODULE_NAME=ADM&LEVEL=L3&BUTTON=A&TYPE=SHIFT",

        ];
      }
      else if(TYPE === "ERP"){
        $('#ProductionTitle').html(GetLangDataV2('ERP'));
        productionItem = 4;
        productionNames = ['WO', 'PartNo', 'BOM', 'Customer'];
        productionImgs = ["default.png", "default.png", "default.png", "default.png"]
        productionURL = [
          // "../setup/master-maintain.html?MODULE_NAME=ADM&SID=102783947126051&LEVEL=L3&BUTTON=B",
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=338657545913047&LEVEL=L3&BUTTON=B",
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=338124786156593&LEVEL=L3&BUTTON=B",
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=338120968880954&LEVEL=L3&BUTTON=B",
          "../setup/master-maintain.html?MODULE_NAME=ADM&SID=161420429773553&LEVEL=L3&BUTTON=B",
        ];
      }
      else if(TYPE === 'USER'){
        $('#ProductionTitle').html(GetLangDataV2('User'))
          productionItem = 3;
          productionNames = ['User', "Group", "Certify"];
          productionImgs = ['default.png','default.png','default.png']
          productionURL = [
            `../query/grid-smart-query.html?MODULE_NAME=ADM&SID=335550119320875&LEVEL=L3&BUTTON=C&TYPE=USER`,
            `../query/grid-smart-query.html?MODULE_NAME=ADM&SID=335551651173289&LEVEL=L3&BUTTON=C&TYPE=USER_GROUP`,
            ``
          ];
        }
        else if(TYPE === "SHIFT"){
          $('#ProductionTitle').html(GetLangDataV2('Shift MGT.'));
          productionItem = 2;
          productionNames = ['Maintain','Parameter'];
          productionImgs = ["default.png", "default.png"]
          productionURL = [
            "../setup/master-maintain.html?MODULE_NAME=ADM&SID=155318169646027&LEVEL=L4&BUTTON=A",
            "../setup/master-maintain.html?MODULE_NAME=ADM&SID=146566405013079&LEVEL=L4&BUTTON=A",
          ];
        }
      else if(TYPE === 'USER_GROUP'){
        $('#ProductionTitle').html(GetLangDataV2('Group History'));
        productionItem = 3;
        productionNames = ['Group Maintain HIST','Group User Setup HIST','Group Function HIST'];
        productionImgs = ["default.png","default.png","default.png"]
        productionURL = [
          `../query/grid-smart-query.html?MODULE_NAME=ADM&SID=335553655436024&LEVEL=L5&BUTTON=A`,
          `../query/grid-smart-query.html?MODULE_NAME=ADM&SID=335554378650980&LEVEL=L5&BUTTON=A`,
          `../query/grid-smart-query.html?MODULE_NAME=ADM&SID=335554569500601&LEVEL=L5&BUTTON=A`
        ];
      }
    break;
    case "EMS": //EMS
      if (TYPE === null) {
        $('#ProductionTitle').html(GetLangDataV2('EMS'))
        productionItem = 2;
        productionNames = ['OPI', 'Query'];
        productionImgs = ['default.png', 'default.png']
        productionURL = [
          "../zz_query/zz_production.html?MODULE_NAME=EMS&LEVEL=L2&TYPE=ADM&BUTTON=A",
          "../zz_query/zz_production.html?MODULE_NAME=EMS&LEVEL=L2&TYPE=QUERY&BUTTON=A",
        ];
      } 
      else if (TYPE === "QUERY") {
        $('#ProductionTitle').html(GetLangDataV2('Equipment Query'));
        productionItem = 3;
        productionNames = ['Status Change History', 'Maintain History', 'OEE'];
        productionImgs = ["default.png", "default.png", "default.png"]
        productionURL = [
          `../query/grid-smart-query.html?MODULE_NAME=EQP_MAINTAIN&SID=333738231483431&LEVEL=L4&BUTTON=B`,
          `../query/grid-smart-query.html?MODULE_NAME=EQP_MAINTAIN&SID=333813350873180&LEVEL=L4&BUTTON=B&ODF=CREATE_TIME%20DESC`,
          `../query/grid-smart-query.html?MODULE_NAME=EQP_MAINTAIN&SID=335700521686972&LEVEL=L4&BUTTON=B&ODF=CREATE_TIME%20DESC`
        ];
      }
      break;
  }
}