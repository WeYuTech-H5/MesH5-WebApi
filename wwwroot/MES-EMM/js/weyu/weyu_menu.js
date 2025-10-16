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

// `
// <li class="menu-item">
//   <a href="" class="hover:text-gray-300">
//     <img src="img/zz/home.svg" alt="" class="imgcls"> 首頁
//   </a>
// </li>
// `

// listString += `
// <ul class="menu relative p-4 space-y-4">
//     <li class="menu-item">
//       <a href="kanban/card/functionList.html?LEVEL=L1" class="hover:text-gray-300">
//         <img src="img/zz/elect-active.svg" alt="" class="imgcls">
//         <span class='Lang'>Electricity</span>
//       </a>
//     </li>
//     <li class="menu-item">
//       <a href="kanban/card/air_meter/air_card.html?LEVEL=L1" class="hover:text-gray-300">
//         <img src="img/zz/info-active.svg" alt="" class="imgcls">
//         <span class='Lang'>Air Flow</span>
//       </a>
//     </li>
//     <li class="menu-item">
//       <a href="kanban/card/air_meter/nitrogen_card.html?LEVEL=L1" class="hover:text-gray-300">
//         <img src="img/zz/percent-active.svg" alt="" class="imgcls">
//         <span class='Lang'>Nitrogen Flow</span>
//       </a>
//     </li>
//     <li class="menu-item">
//       <a href="kanban/card/water_meter/Tap_water_card.html?LEVEL=L1" class="hover:text-gray-300">
//         <img src="img/comm/drop-svgrepo-com.svg" alt="" class="imgcls">
//         <span class='Lang'>City Water</span>
//       </a>
//     </li>
//     <li class="menu-item">
//       <a href="kanban/card/water_meter/Waste_water_card.html?LEVEL=L1" class="hover:text-gray-300">
//         <img src="img/comm/drop-svgrepo-com.svg" alt="" class="imgcls"> 
//         <span class='Lang'>Wastewater</span>  
//       </a>
//     </li>
//     <li class="menu-item">
//       <a href="kanban/card/setup/master-maintain-em.html?MODULE_NAME=USER_MAINTAIN&SID=304100717100290&LEVEL=L2" class="hover:text-gray-300">
//         <img src="img/zz/user-gear-solid.svg" alt="" class="imgcls"> 
//         <span class='Lang'>User Maintain</span>  
//       </a>
//     </li>
//     <li class="menu-item">
//       <a href="kanban/card/setup/master-detail-v2.html?MODULE_NAME=GROUP_MAINTAIN&SID=148115013850673&LEVEL=L2" class="hover:text-gray-300">
//         <img src="img/zz/user-gear-solid.svg" alt="" class="imgcls"> 
//         <span class='Lang'>Group User Setup</span>  
//       </a>
//     </li>
//   </ul>
// `;

listString += `
<ul class="menu relative p-4 space-y-4">
    <li class="menu-item">
      <a href="kanban/card/functionList.html?LEVEL=L1" class="hover:text-gray-300">
        <img src="img/zz/elect-active.svg" alt="" class="imgcls">
        <span class='Lang'>Electricity</span>
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
