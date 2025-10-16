// 動態產生選單的相對路徑
function generateMenuPath(relativePath) {
    const currentPath = window.location.pathname
    const basePath = currentPath.substring(0, currentPath.indexOf('/card/') + 6)
    return basePath + relativePath
}

// 動態產生圖片路徑
function generateImagePath(relativePath) {
    const currentPath = window.location.pathname
    const basePath = currentPath.substring(0, currentPath.lastIndexOf('/kanban/') + 1)
    return basePath + relativePath
}

// 動態產生側邊欄選單的 HTML
function loadSidebarMenu() {
    // const sidebarHTML = `
    // <div class="offcanvas offcanvas-start" 
    //     tabindex="-1" 
    //     id="offcanvasExample" 
    //     aria-labelledby="offcanvasExampleLabel">
    //     <div class="offcanvas-header">
    //         <h2 class="offcanvas-title fw-bold" id="offcanvasExampleLabel">EMS RWD</h2>
    //         <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    //     </div>
    //     <div class="offcanvas-body">
    //         <ul class="list-group custom-menu">
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/weyu/electric.svg')}" alt="electric">
    //                 <a href="${generateMenuPath('functionList.html')}" class="Lang">Electricity</a>
    //             </li>
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/comm/earth-asia-solid.svg')}" alt="air flow">
    //                 <a href="${generateMenuPath('air_meter/air_card.html?LEVEL=L1')}" class="Lang">Air Flow</a>
    //             </li>
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/comm/earth-asia-solid.svg')}" alt="nitrogen flow">
    //                 <a href="${generateMenuPath('air_meter/nitrogen_card.html?LEVEL=L1')}" class="Lang">Nitrogen Flow</a>
    //             </li>
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/comm/drop-svgrepo-com.svg')}" alt="city water">
    //                 <a href="${generateMenuPath('water_meter/Tap_water_card.html?LEVEL=L1')}" class="Lang">City Water</a>
    //             </li>
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/comm/drop-svgrepo-com.svg')}" alt="wastewater">
    //                 <a href="${generateMenuPath('water_meter/Waste_water_card.html?LEVEL=L1')}" class="Lang">Wastewater</a>
    //             </li>
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/zz/user-gear-solid.svg')}" alt="user_maintain">
    //                 <a href="${generateMenuPath('setup/master-maintain-em.html?MODULE_NAME=USER_MAINTAIN&SID=304100717100290&LEVEL=L2')}" class="Lang">User Maintain</a>
    //             </li>
    //             <li class="list-group-item">
    //                 <img src="${generateImagePath('img/zz/user-gear-solid.svg')}" alt="user_maintain">
    //                 <a href="${generateMenuPath('setup/master-detail-v2.html?MODULE_NAME=GROUP_MAINTAIN&SID=148115013850673&LEVEL=L2')}" class="Lang">Group User Setup</a>
    //             </li>
    //         </ul>
    //     </div>
    // </div>
    // `
    const sidebarHTML = `
    <div class="offcanvas offcanvas-start" 
        tabindex="-1" 
        id="offcanvasExample" 
        aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
            <h2 class="offcanvas-title fw-bold" id="offcanvasExampleLabel">EMS RWD</h2>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <ul class="list-group custom-menu">
                <li class="list-group-item">
                    <img src="${generateImagePath('img/weyu/electric.svg')}" alt="electric">
                    <a href="${generateMenuPath('functionList.html')}" class="Lang">Electricity</a>
                </li>
            </ul>
        </div>
    </div>
    `

//     <li class="list-group-item">
//     <img src="${generateImagePath('img/zz/user-gear-solid.svg')}" alt="user_maintain">
//     <a href="${generateMenuPath('setup/master-maintain-em.html?MODULE_NAME=USER_MAINTAIN&SID=304100717100290&LEVEL=L2')}" class="Lang">User Maintain</a>
// </li>
// <li class="list-group-item">
//     <img src="${generateImagePath('img/zz/user-gear-solid.svg')}" alt="user_maintain">
//     <a href="${generateMenuPath('setup/master-detail-v2.html?MODULE_NAME=GROUP_MAINTAIN&SID=148115013850673&LEVEL=L2')}" class="Lang">Group User Setup</a>
// </li>

    // 將產生的選單 HTML 插入到頁面中指定的位置
    document.body.insertAdjacentHTML('beforeend', sidebarHTML)
}

// 載入側邊欄選單
document.addEventListener('DOMContentLoaded', loadSidebarMenu)

