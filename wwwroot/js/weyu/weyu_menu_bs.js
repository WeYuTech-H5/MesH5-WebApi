// 讀取 MOUDLE_NAME 開始
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
var MOUDLE_NAME = Request["MOUDLE_NAME"] || null;

// 讀取 MOUDLE_NAME 結束

let listString =''

const menuList = document.getElementById('menuList');

//Get Menu API
async function Get_Menu(){

  // 定义 GetMenu API 的 URL
  var getMenuURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetMenuMoudle';

  // 构建请求头
  var headers = new Headers({
      'Content-Type': 'application/json',
      'UID': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo'),
      'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey'),
      'MOUDLE_NAME': MOUDLE_NAME
  });

  // 构建请求配置
  var requestOptions = {
      method: 'GET',
      headers: headers,
  };

  // 发送请求
  try {
    // 发送请求并等待响应
    var response = await fetch(getMenuURL, requestOptions);

    if (response.ok) {
        // 解析响应为 JSON
        var data = await response.json();
        // console.log(data.sidebar_tabs);
        if (data.result) {
            Menudata = data.sidebar_tabs;

            for (let i=0; i < Menudata[0].children.length; i++){
                for (let j=0; j < Menudata[0].children[i].children.length; j++){
                    listString += '<li class="menu-item">'
                    listString += '<a href="">' + Menudata[0].children[i].children[j].label+ '</a>'
                    listString += '</li>'
                }

            }

            menuList.innerHTML = listString;

        } else {
        }
    } else {
        throw new Error('获取菜单失败，状态码：' + response.status);
    }
} catch (error) {
    console.error(error);
}

// JavaScript to toggle submenu visibility on click
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
    // Toggle the 'active' class on the clicked menu item
    menuItem.classList.toggle('active');
    });
});

}

Get_Menu();



const toggleButton = document.getElementById('toggleButton');
const closeButton = document.getElementById('closeButton');
const navbar = document.getElementById('navbar');

toggleButton.addEventListener('click', () => {
    navbar.classList.remove('hidden-navbar');
});

closeButton.addEventListener('click', () => {
    navbar.classList.add('hidden-navbar');
});
