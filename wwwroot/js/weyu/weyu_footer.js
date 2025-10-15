
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
const pageName = "brand-footer.svg"; // 您的图像文件名

// 获取当前页面的路径深度
const pathDepth = currentURL.split('/').length - 4; // 根据实际情况可能需要调整

// 构建图像路径前缀
let imagePathPrefix = "";

switch(pathDepth){

  case 2:
    imagePathPrefix = "./";
    break;
  case 3:
    imagePathPrefix = "../";
    break;
  case 4:
    imagePathPrefix = "../../";
    break;
  case 5:
    imagePathPrefix = "../../../";
    break;
  default:
    imagePathPrefix = "../";
    break;
}

const footerString = `
<div class="flex item-top justify-center w-full opacity-80 p-2 text-white backdrop-blur-2xl">
  <div class="opacity-50">
    <img src="${imagePathPrefix}img/weyu/${pageName}" alt="logo" class="h-[22px]"  />
  </div>
  <div id="copyrightStatus" class="ml-2 opacity-50">
    Corp. 2024 WeYu Technology Co., Ltd. All Rights Reserved.
  </div>
</div>
`;

footer.innerHTML = footerString;