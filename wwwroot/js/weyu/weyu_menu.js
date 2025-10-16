let listString =''

const menuList = document.getElementById('menuList');

//Get Menu API
async function Get_Menu(){

  // 定义 GetMenu API 的 URL
  var getMenuURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetMenu';

  // 构建请求头
  var headers = new Headers({
      'Content-Type': 'application/json',
      'UID': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo'),
      'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
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

            listString =  '<ul class="menu relative p-4 space-y-4">';
            //寫死部分 - 僅一層
            listString += '<li class="menu-item"><a href="../index.html" class="text-white hover:text-gray-300">Operations Dashboard</a></li>'

            for(var i=0;i<Menudata.length;i++){
                //第一層
                listString +='<li class="menu-item">'
                listString +='<span class="flex w-full justify-between">'
                listString += Menudata[i].label+'<img src="../img/comm/icons/treeArrow.svg" alt="open submenu" />'
                listString +='</span>'
                listString +='<ul class="submenu  border-blue-800 flex-col">'
                
                for(var j=0;j<Menudata[i].children.length;j++){
                        //第二層
                        listString +='<li class="submenuChild">'
                        listString +=    Menudata[i].children[j].label;
                        listString +=    '<ul class="  border-blue-700 ">'
                    for(var k=0;k<Menudata[i].children[j].children.length;k++){
                        //第三層
                        listString +=    '<li><a href="'+Menudata[i].children[j].children[k].link+'">'+Menudata[i].children[j].children[k].label+'</a></li>'
                    }
                        //第二層結尾
                        listString +='</ul>'
                        listString +='</li>'
                    
                }
                //第一層結尾
                listString +='</ul>'
                listString +='</li>'

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
