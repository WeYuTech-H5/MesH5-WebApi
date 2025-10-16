let listString =''

const menuList = document.getElementById('menuList');

//Get Menu API
async function Get_Menu(){

    $('#menu_name').html(PROJECT_SAVE_NAME);


//     listString += `
//   <ul class="menu relative p-4 space-y-4">
//     <li class="menu-item">
//       <a href="" class="text-white hover:text-gray-300">
//         <img src="img/zz/home.svg" alt="" class="imgcls"> 首頁
//       </a>
//     </li>
//     <li class="menu-item">
//       <details>
//         <summary class="text-white hover:text-gray-300">
//           <img src="img/zz/elect-active.svg" alt="" class="imgcls"> 電力
//         </summary>
//         <ul class="submenu pl-4 space-y-2">
//           <li class="submenu-item">
//             <img src="img/zz/elect-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">E-台電</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/elect-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">E-Kanban</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/elect-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">電力監測</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/elect-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">用電資訊</a>
//           </li>
//         </ul>
//       </details>
//     </li>
//     <li class="menu-item">
//       <details>
//         <summary class="text-white hover:text-gray-300">
//           <img src="img/zz/info-active.svg" alt="" class="imgcls"> 氣體
//         </summary>
//         <ul class="submenu pl-4 space-y-2">
//           <li class="submenu-item">
//             <img src="img/zz/info-active.svg" alt="" class="imgcls">
//             <a href="../EPower/query.html" class="text-white hover:text-gray-300">氣體細項1</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/info-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">氣體細項2</a>
//           </li>
//         </ul>
//       </details>
//     </li>
//     <li class="menu-item">
//       <details>
//         <summary class="text-white hover:text-gray-300">
//           <img src="img/zz/percent-active.svg" alt="" class="imgcls"> 冰水
//         </summary>
//         <ul class="submenu pl-4 space-y-2">
//           <li class="submenu-item">
//             <img src="img/zz/percent-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">冰水細項1</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/percent-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">冰水細項2</a>
//           </li>
//         </ul>
//       </details>
//     </li>
//     <li class="menu-item">
//       <details>
//         <summary class="text-white hover:text-gray-300">
//           <img src="img/zz/setting-active.svg" alt="" class="imgcls"> 燃料
//         </summary>
//         <ul class="submenu pl-4 space-y-2">
//           <li class="submenu-item">
//             <img src="img/zz/setting-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">燃料細項1</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/setting-active.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">燃料細項2</a>
//           </li>
//         </ul>
//       </details>
//     </li>
//     <li class="menu-item">
//       <details>
//         <summary class="text-white hover:text-gray-300">
//           <img src="img/zz/status.svg" alt="" class="imgcls"> 水資源
//         </summary>
//         <ul class="submenu pl-4 space-y-2">
//           <li class="submenu-item">
//             <img src="img/zz/status.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">水資源細項1</a>
//           </li>
//           <li class="submenu-item">
//             <img src="img/zz/status.svg" alt="" class="imgcls">
//             <a href="" class="text-white hover:text-gray-300">水資源細項2</a>
//           </li>
//         </ul>
//       </details>
//     </li>
//     <li class="menu-item">
//       <a href="" class="text-white hover:text-gray-300">
//         <img src="img/zz/logout.svg" alt="" class="imgcls"> 登出
//       </a>
//     </li>
//   </ul>
// `;

listString += `
<ul class="menu relative p-4 space-y-4">
    <li class="menu-item">
      <a href="" class="hover:text-gray-300">
        <img src="img/zz/home.svg" alt="" class="imgcls"> 首頁
      </a>
    </li>
    <li class="menu-item">
      <a href="http://10.41.60.230/GEMTEK_BI_TEST/kanban/card/functionList.html?LEVEL=L1" class="hover:text-gray-300">
        <img src="img/zz/elect-active.svg" alt="" class="imgcls"> 電力
      </a>
    </li>
    <li class="menu-item">
      <a href="" class="hover:text-gray-300">
        <img src="img/zz/info-active.svg" alt="" class="imgcls"> 氣體
      </a>
    </li>
    <li class="menu-item">
      <a href="" class="hover:text-gray-300">
        <img src="img/zz/percent-active.svg" alt="" class="imgcls"> 冰水
      </a>
    </li>
    <li class="menu-item">
      <a href="" class="hover:text-gray-300">
        <img src="img/zz/setting-active.svg" alt="" class="imgcls"> 燃料
      </a>
    </li>
    <li class="menu-item">
      <a href="" class="hover:text-gray-300">
        <img src="img/comm/drop-svgrepo-com" alt="" class="imgcls"> 水資源
      </a>
    </li>
  </ul>
`;

  
        menuList.innerHTML = listString;

}

// JavaScript to toggle submenu visibility on click
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach((menuItem) => {
    menuItem.addEventListener('click', () => {
    // Toggle the 'active' class on the clicked menu item
    menuItem.classList.toggle('active');
    });
});



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
