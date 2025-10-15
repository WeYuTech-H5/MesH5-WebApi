$(document).ready(async function() {
    // ============================== 專案卡片數據 ==============================
    const projectList = [
        {
            "title": "生產戰情室-1",
            "category": "mes",
            "image": "dashboard16.jpg",
            "description": "實時監控全廠生產數據",
            "keywords": ["OEE", "戰情室","生產數據", "實時監控","交互設計"],
            "link": "../dashboard16/dashboard16.html"
        },
        {
          "title": "生產戰情室-2",
          "category": "mes",
          "image": "dashboard16_type2.jpg",
          "description": "實時監控全廠生產數據",
          "keywords": ["OEE", "戰情室","生產數據", "實時監控","交互設計"],
          "link": "../dashboard16_type2/dashboard16.html"
        },
        {
          "title": "EMS看板",
          "category": "ems",
          "image": "dashboard15.jpg",
          "description": "支持能耗管理與實時監控",
          "keywords": ["EMS", "用電量", "實時監控"],
          "link": "../dashboard15/dashboard15.html"
        },
        {
          "title": "戰情看板",
          "category": "overview",
          "image": "dashboard10.jpg",
          "description": "聚焦生產全局與關鍵指標",
          "keywords": ["戰情室", "數據展示", "關鍵指標"],
          "link": "../dashboard10/dashboard10.html"
        },
        {
            "title": "ESG看板",
            "category": "overview",
            "image": "dashboard01.jpg",
            "description": "集中展示環保數據和績效",
            "keywords": ["ESG", "環保管理", "數據展示", "實時監控"],
            "link": "../dashboard01/dashboard01.html"
        },
        {
            "title": "卡片式機台概覽-1",
            "category": "overview",
            "image": "dashboard02.jpg",
            "description": "適合快速瀏覽機台狀態",
            "keywords": ["機台狀態", "卡片設計", "輪播效果"],
            "link": "../dashboard02/dashboard02.html"
        },
        {
            "title": "卡片式機台概覽-2",
            "category": "overview",
            "image": "dashboard03.jpg",
            "description": "專注於詳細機台數據展示",
            "keywords": ["機台產量", "卡片設計", "輪播效果"],
            "link": "../dashboard03/dashboard03.html"
        },
        {
            "title": "卡片式機台概覽-3",
            "category": "overview",
            "image": "dashboard04.jpg",
            "description": "進一步強化數據可視化",
            "keywords": ["數據展示", "機台狀態", "卡片設計", "輪播效果"],
            "link": "../dashboard04/dashboard04.html"
        },
        // {
        //     "title": "EMS看板-1",
        //     "category": "ems",
        //     "image": "dashboard05.jpg",
        //     "description": "支持能耗管理與實時監控",
        //     "keywords": ["EMS", "用電量", "實時監控"],
        //     "link": "../dashboard05/dashboard05.html"
        // },
        {
            "title": "EMS看板-2",
            "category": "ems",
            "image": "dashboard06.jpg",
            "description": "專注於用電量監控與分析",
            "keywords": ["用電量", "實時監控", "交互設計"],
            "link": "../dashboard06/dashboard06.html"
        },
        {
            "title": "IoT生產看板",
            "category": "mes",
            "image": "dashboard07.jpg",
            "description": "提供設備效能與生產效率的即時監控",
            "keywords": ["IoT", "OEE", "效率提升", "實時監控", "歷史記錄"],
            "link": "../dashboard07/dashboard07.html?EQP_TYPE=DC&SHIFT_DAY=2024-11-07"
        },
        {
            "title": "機台詳情頁",
            "category": "mes",
            "image": "dashboard08.jpg",
            "description": "便於查看設備運行狀態與歷史記錄",
            "keywords": ["IoT","設備詳情", "實時監控", "歷史記錄", "OEE"],
            "link": "../dashboard08/dashboard08.html?EQP_TYPE=DC&EQP_NO=DC-01&SHIFT_DAY=2024-11-07"
        },
        {
            "title": "EMS看板-3",
            "category": "ems",
            "image": "dashboard09.jpg",
            "description": "提供更細緻的數據分析與可視化",
            "keywords": ["EMS", "數據展示", "用電量"],
            "link": "../dashboard09/dashboard09.html"
        },

        {
            "title": "EMS看板-4",
            "category": "ems",
            "image": "dashboard11.jpg",
            "description": "整合資源數據以提升效率",
            "keywords": ["EMS","用電量", "效率提升", "環保管理"],
            "link": "../dashboard11/dashboard11.html"
        },
        {
            "title": "水資源看板",
            "category": "ems",
            "image": "dashboard12.jpg",
            "description": "集中展示工廠水資源使用狀況",
            "keywords": ["ESG", "水資源", "環保管理", "數據展示", "輪播效果"],
            "link": "../dashboard12/dashboard12.html"
        },
        {
            "title": "在製品管理看板",
            "category": "wip",
            "image": "dashboard13.jpg",
            "description": "支持生產排程與進度跟蹤",
            "keywords": ["排程管理", "進度跟蹤", "PM"],
            "link": "../dashboard13/dashboard13.html"
        },
        // {
        //     "title": "EMS看板-5",
        //     "category": "ems",
        //     "image": "dashboard14.jpg",
        //     "description": "支持能耗管理與實時監控",
        //     "keywords": ["EMS", "用電量", "實時監控"],
        //     "link": "../dashboard14/dashboard14.html"
        // },

        {
            "title": "生產戰情室",
            "category": "mes",
            "image": "template01.jpg",
            "description": "三欄式排版，適用於即時監控生產數據",
            "keywords": ["生產數據", "實時監控"],
            "link": "../template01/template01.html"
        },
        // {
        //     "title": "生產戰情室-2",
        //     "category": "mes",
        //     "image": "template02.jpg",
        //     "description": "兩欄式排版，簡潔且專注核心數據展示",
        //     "keywords": ["數據展示"],
        //     "link": "../template02/template02.html"
        // },
        // {
        //     "title": "生產戰情室-3",
        //     "category": "mes",
        //     "image": "template03.jpg",
        //     "description": "三兩欄式排版，適合多類型數據組合展示",
        //     "keywords": ["數據展示"],
        //     "link": "../template03/template03.html"
        // },
        // {
        //     "title": "生產戰情室-4",
        //     "category": "mes",
        //     "image": "template04.jpg",
        //     "description": "兩欄式排版-2，更強調數據清晰度",
        //     "keywords": ["數據展示"],
        //     "link": "../template04/template04.html"
        // },
        {
            "title": "排版範例-1",
            "category": "template",
            "image": "template05.jpg",
            "description": "一二四欄式排版，提供多樣化視覺布局",
            "keywords": ["多欄式設計", "視覺化"],
            "link": "../template05/template05.html"
        },
        {
            "title": "排版範例-2",
            "category": "template",
            "image": "template06.jpg",
            "description": "一三一欄式排版，適合專業數據展示需求",
            "keywords": ["數據展示", "視覺化", "多欄式設計"],
            "link": "../template06/template06.html"
        },
        {
            "title": "排版範例-3",
            "category": "template",
            "image": "template07.jpg",
            "description": "四二欄式排版，強調重點與細節的並重",
            "keywords": ["視覺化", "數據展示", "重點內容", "輪播效果"],
            "link": "../template07/template07.html"
        },
        {
            "title": "排版範例-4",
            "category": "template",
            "image": "template08.jpg",
            "description": "兩欄式排版，簡潔直觀，適合數據重點展示",
            "keywords": ["數據展示", "簡潔瀏覽", "重點內容"],
            "link": "../template08/template08.html"
        },
        {
            "title": "機台狀態列表",
            "category": "mes",
            "image": "template09.jpg",
            "description": "兩欄式排版，簡潔直觀，適合數據重點展示",
            "keywords": ["卡片設計","實時監控","機台狀態"],
            "link": "../template09/template09.html"
        },
        // {
        //     "title": "圖表總覽",
        //     "category": "module",
        //     "image": "chart-Demo.jpg",
        //     "description": "圖表類型一覽，提供多種chart範例",
        //     "keywords": ["視覺化", "圖表展示"],
        //     "link": "../chart-demo/chart-demo.html"
        // },
        {
            "title": "查詢卡片",
            "category": "module",
            "image": "query-card.jpg",
            "description": "視覺化查詢卡片展示功能",
            "keywords": ["視覺化", "數據分析", "交互設計"],
            "link": "../query-card/query-card.html"
        },
        {
            "title": "機況一覽",
            "category": "overview",
            "image": "dashboard18.jpg",
            "description": "列表式機況一覽",
            "keywords": ["卡片設計", "實時監控", "機台狀態"],
            "link": "../dashboard18/dashboard18.html"
        },
        {
            "title": "機況運行生產狀況",
            "category": "overview",
            "image": "dashboard17.jpg",
            "description": "查看當前機況生產量、運行狀況",
            "keywords": ["卡片設計", "實時監控", "機台狀態"],
            "link": "../dashboard17/dashboard17.html"
        }
    ]
    // ============================== 全局變量 ==============================
    let currentFilters = {
        category: 'all', // 當前篩選的類別
        keywords: new Set() // 當前篩選的關鍵字
    };

    // ============================== 函數區 ==============================

    /**
     * 獲取所有唯一的關鍵字，並按字母順序排序
     * @returns {Array} 排序後的關鍵字列表
     */
    function getAllKeywords() {
        const keywordsSet = new Set();
        projectList.forEach(project => {
            project.keywords.forEach(keyword => keywordsSet.add(keyword));
        });
        return Array.from(keywordsSet).sort();
    }

    /**
     * 渲染關鍵字篩選按鈕
     */
    function renderKeywordsFilter() {
        const keywordsContainer = $('#keywords-filter');
        getAllKeywords().forEach(keyword => {
            keywordsContainer.append(`
                <span class="keywords-tag" data-keyword="${keyword}">${keyword}</span>
            `);
        });
    }

    /**
     * 渲染專案卡片
     * @param {Array} projectsToRender - 要渲染的專案列表
     */
    function renderProjects(projectsToRender) {
        const container = $('#portfolio-container');
        container.empty();

        // 顯示或隱藏 "無結果" 消息
        if (projectsToRender.length === 0) {
            $('#no-results').removeClass('d-none');
        } else {
            $('#no-results').addClass('d-none');
        }

        // 渲染專案卡片
        projectsToRender.forEach(project => {
            const keywordsHtml = project.keywords
                .map(keyword => `<span class="keywords-tag" data-keyword="${keyword}">${keyword}</span>`)
                .join('');

            const projectHtml = `
                <div class="col-md-6 col-lg-4 portfolio-item" data-category="${project.category}">
                    <div class="card h-100 shadow-sm">
                        <a href="${project.link}" target="_blank">
                            <img src="../../img/weyu/${project.image}" class="card-img-top card-image" alt="${project.title}">
                        </a>
                        <div class="card-body">
                            <h5 class="card-title">${project.title}</h5>
                            <p class="card-text">${project.description}</p>
                            <div class="keyword-container">
                                ${keywordsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.append(projectHtml);
        });
        
    }

    /**
     * 根據當前篩選條件篩選專案
     */
    function filterProjects() {
        let filteredProjects = projectList;

        // 類別篩選
        if (currentFilters.category !== 'all') {
            filteredProjects = filteredProjects.filter(project =>
                project.category === currentFilters.category
            );
        }

        // 關鍵字篩選
        if (currentFilters.keywords.size > 0) {
            filteredProjects = filteredProjects.filter(project =>
                Array.from(currentFilters.keywords).every(keyword =>
                    project.keywords.includes(keyword)
                )
            );
        }

        renderProjects(filteredProjects);
    }

    // ============================== 初始化 ==============================

    renderKeywordsFilter(); // 渲染關鍵字篩選按鈕
    renderProjects(projectList); // 初始渲染所有專案

    // ============================== 事件監聽 ==============================

    // 類別篩選按鈕點擊事件
    $('.filter-button[data-type="category"]').click(function () {
        // 切換 "active" 狀態
        $('.filter-button[data-type="category"]').removeClass('active');
        $(this).addClass('active');

        // 更新當前篩選條件並重新篩選
        currentFilters.category = $(this).data('filter');
        filterProjects();
    });

    // 關鍵字篩選標籤點擊事件
    $('#keywords-filter .keywords-tag').on('click',function() {
        const keyword = $(this).data('keyword');
        $(this).toggleClass('active'); // 切換 "active" 樣式

        // 更新關鍵字篩選條件
        if ($(this).hasClass('active')) {
            currentFilters.keywords.add(keyword);
        } else {
            currentFilters.keywords.delete(keyword);
        }

        filterProjects(); // 根據新篩選條件更新結果
    })
});