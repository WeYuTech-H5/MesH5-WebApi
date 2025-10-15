ChangeLang()
let authKeys = localStorage.getItem(PROJECT_SAVE_NAME+'_BI_authCATEGORY').split(",")



// 控制 index 顯示數量
let indexItem = 5;
// 控制選單按鈕的權限key值(=對應功能的SID) 若無需控管權限則空白
let itemKeys = ["","","","",""]
// let itemKeys = ["","","","",""]
// 控制選單按鈕&圖片的名稱
let itemNames = ["MES-ADM","MES-WIP","MES-EQM","MES-KANBAN","MES-TOL","MES-QMM","MES-EMM","MES-MMM","MES-UMM"]
let imgNames = ["ADM.jpg","ESG.jpg","equipment.jpg","production.jpg","QC.jpg","QC.jpg","QC.jpg","QC.jpg","QC.jpg"]

// 控制選單按鈕的 URL
let itemURL = [
    "MES-ADM/ADM_GridMenu.html",
    "MES-WIP/WIP-menu.html",
    "MES-EQM/EQM_GridMenu.html",
    "MES-KANBAN/KANBAN-menu.html",
    "MES-TOL/TOL_GridMenu.html",
    "",
]

// 開始插入選單元素
let htmlContent = "";

for (let i = 0; i < indexItem; i++) {
  // 判斷權限 是否使用者是否有對應的key值
  if(!itemKeys[i]|| authKeys.includes(itemKeys[i])){
    htmlContent += `
      <div class="defaultBox grow">
        <div class="m-4">
          <a href="${itemURL[i]}"><img src="img/weyu/${imgNames[i]}" alt="item" class="mb-2">
            <h2 class="text-md text-sky-300 text-center">${GetLangDataV2(itemNames[i])}</h2>
          </a>
        </div>
      </div>
    `
  }
}

document.querySelector("#itemList").innerHTML = htmlContent;