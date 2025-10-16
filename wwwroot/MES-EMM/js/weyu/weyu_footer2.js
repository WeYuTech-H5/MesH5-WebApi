
// const footer = document.getElementById('footer');
// const footerString = `
// <div class="flex item-top justify-center w-full opacity-80 p-2 text-white backdrop-blur-2xl">
// <div class="opacity-50">
//   <img src="./img/weyu/brand-footer.svg" alt="logo" class="h-[22px]"  />
// </div>
// <div id="copyrightStatus" class="ml-2 opacity-50">
//   Copr. 2023 WeYu Technology Co., Ltd. All Rights Reserved.
// </div>
// </div>
// `; 
// footer.innerHTML = footerString;

const footer = document.getElementById('footer');
const currentURL = window.location.href;
const pageName = "brand-footer.svg";

// 計算 URL 中的斜杠數量來確定當前路徑深度
const pathDepth = currentURL.split('/').length - 5; 

let imagePathPrefix = "";

switch(pathDepth) {
  case 1:
    imagePathPrefix = "../";
    break;
  case 2:
    imagePathPrefix = "../../";
    break;
  case 3:
    imagePathPrefix = "../../../";
    break;
  default:
    imagePathPrefix = "./";
    break;
}

const footerString = `
<div class="d-flex item-top justify-content-center w-full opacity-80 p-2 text-white backdrop-blur-2xl">
  <div class="opacity-50">
    <img src="${imagePathPrefix}img/weyu/${pageName}" alt="logo" class="footer-logo"  />
  </div>
  <div id="copyrightStatus" class="ml-2 opacity-50">
    Corp. 2023 WeYu Technology Co., Ltd. All Rights Reserved.
  </div>
</div>
`;

footer.innerHTML = footerString;