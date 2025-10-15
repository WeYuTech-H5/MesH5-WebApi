// document.addEventListener('DOMContentLoaded', function() {
//     // 獲取包含 data-default-menu 屬性的元素
//     const asideElement = document.querySelector('.aside')
    
//     // 獲取 data-default-menu 屬性的值
//     const menuType = asideElement ? asideElement.getAttribute('data-default-menu') : 'today'
    
//     // 顯示對應的選單
//     showMenu(menuType)
// })


// 初始化檢查函數
function initializeMenu() {
    if (typeof GetLangDataV2 === 'function' && jsonLang) {
        const asideElement = document.querySelector('.aside')
        const menuType = asideElement ? asideElement.getAttribute('data-default-menu') : 'today'
        showMenu(menuType)
    } else {
        console.error('Language loaded failed... restarting')
        setTimeout(initializeMenu, 100) // 100 毫秒後重試
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeMenu() // 當頁面加載完成時，執行初始化
})

// 選單
function showMenu(menuType){
    const subMenu = document.getElementById('submenu')

    // 清空選單
    subMenu.innerHTML = ''
    let menuItems = []

    // 選單的看板主題 (例如每日 = daily)
    switch(menuType) {
        case 'today':
            menuItems = [
                { name: `${GetLangDataV2('YUANYANG')}`, link: 'functionList.html?LEVLE=L1?LIST=ALL' },
                // { name: `${GetLangDataV2('Non-EMS1')}`, link: 'Fab1.html?LEVEL=L1' },
                // { name: `${GetLangDataV2('EMS')}`, link: 'Fab2.html?LEVEL=L1' },
                // { name: `${GetLangDataV2('Non-EMS2')}`, link: 'Fab3.html?LEVEL=L1' },
                // { name: `${GetLangDataV2('E-Kanban')}`, link: '../EMS-Ekanban.html?LEVLE=L1'}
            ];
            break;
        case 'daily':
            menuItems = [
                { name: `${GetLangDataV2('Daily Factory Usage')}`, link: 'All_query.html?LEVEL=L1' },
                { name: `${GetLangDataV2('Meter Daily Usage')}`, link: 'Daily_EM_query.html?LEVEL=L1' }
            ];
            break;
        case 'details':
            menuItems = [
                { name: `${GetLangDataV2('Meter History')}`, link: 'FifteenMinute_query.html?LEVEL=L1' }
            ];
            break;
        case 'iot':
            menuItems = [
                { name: `${GetLangDataV2('IoT Power Usage Query')}`, link: 'IOT_EM_query.html?LEVEL=L1'},
                { name: `${GetLangDataV2('IoT Power Usage Chart')}`, link: 'IOT_EM_Chart.html?LEVEL=L1'}
            ]
            break
        case 'maintenance':
            menuItems = [
                { name: `${GetLangDataV2('Meter Usage Maintenance')}`, link: 'setup/master-maintain-em.html?MODULE_NAME=EM_MAINTAIN&SID=353681744946113&LEVEL=L3' },
                { name: `${GetLangDataV2('Contract Conpacity Maintenance')}`, link: 'setup/master-maintain-em.html?MODULE_NAME=EM_MAINTAIN&SID=358797717580850&LEVEL=L3' },
                // { name: `${GetLangDataV2('EMS Daily Maintenance')}`, link: 'setup/master-maintain-ems-daily-input.html?MODULE_NAME=EM_MAINTAIN&SID=356877309223539&LEVEL=L3' },
            ];
            break;
    }

    // 產生html標籤元素
    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = item.name;
        li.appendChild(a);
        subMenu.appendChild(li);
    })

    // 更新當前選單類型
    subMenu.setAttribute('data-menu-type', menuType)
    subMenu.classList.add('show')
}

// 動態更新選單的函數
function updateMenuType(newMenuType) {
    const asideElement = document.querySelector('.aside')
    if (asideElement) {
        // 更新 data-default-menu 屬性
        asideElement.setAttribute('data-default-menu', newMenuType)
        
        // 更新選單顯示
        showMenu(newMenuType)
    }
}