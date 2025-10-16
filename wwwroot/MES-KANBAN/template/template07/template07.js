$(document).ready(()=>{
    loadSemiDoughnutA();
    loadSemiDoughnutB();
    loadRadar();
    loadCarousel()
})
//-------------------------------------------------------- 上1 扇形圖A
function loadSemiDoughnutA() {
    $('#semiDoughnutAWrapper').empty();
    $('#semiDoughnutAWrapper').append('<canvas id="semiDoughnutA"></canvas>');
    
    semiDoughnutA();
    async function semiDoughnutA() {
        let response = await fetch('./data/semiDoughnutA.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
    
        let ctx = $('#semiDoughnutA');
        new Chart(ctx,
        {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: '總良率',
                        color: 'white',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    }
                },
                responsive: true,  // 讓圖表自動適應容器大小
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                rotation: '-90',
                circumference: 180,
                cutout: '70%'
            },
            plugins: [{
                id: 'customPlugin',
                beforeDraw: function(chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    
                    ctx.restore();
                    var fontSize = (height / 80).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";
                     // 設置文字顏色
                    ctx.fillStyle = 'white';  // 修改這裡為你想要的顏色
    
                    var text = chartData.datasets[0].data[0] + '%',  // 你想顯示的文字
                        textX = Math.round((width - ctx.measureText(text).width) / 2),
                        textY = height * 0.75;
    
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
        });
    };
};

//-------------------------------------------------------- 上2 扇形圖B
function loadSemiDoughnutB() {
    $('#semiDoughnutBWrapper').empty();
    $('#semiDoughnutBWrapper').append('<canvas id="semiDoughnutB"></canvas>');
    
    semiDoughnutB();
    async function semiDoughnutB() {
        let response = await fetch('./data/semiDoughnutB.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料
    
        let ctx = $('#semiDoughnutB');
        new Chart(ctx,
        {
            type: 'doughnut',
            data: chartData,
            options: {
                plugins: {
                    title: {
                        display: true,
                        text: '總良率',
                        color: 'white',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    }
                },
                responsive: true,  // 讓圖表自動適應容器大小
                maintainAspectRatio: false,  // 允許打破寬高比的限制
                rotation: '-90',
                circumference: 180,
                cutout: '70%'
            },
            plugins: [{
                id: 'customPlugin',
                beforeDraw: function(chart) {
                    var width = chart.width,
                        height = chart.height,
                        ctx = chart.ctx;
                    
                    ctx.restore();
                    var fontSize = (height / 80).toFixed(2);
                    ctx.font = fontSize + "em sans-serif";
                    ctx.textBaseline = "middle";
                     // 設置文字顏色
                    ctx.fillStyle = 'white';  // 修改這裡為你想要的顏色
    
                    var text = chartData.datasets[0].data[0] + '%',  // 你想顯示的文字
                        textX = Math.round((width - ctx.measureText(text).width) / 2),
                        textY = height * 0.75;
    
                    ctx.fillText(text, textX, textY);
                    ctx.save();
                }
            }]
        });
    };
};

//-------------------------------------------------------- 左下 雷達圖
function loadRadar() {
    $('#radarWrapper').empty();
    $('#radarWrapper').append('<canvas id="radar"></canvas>');
    
    radar();
    async function radar() {
        let response = await fetch('./data/radar.json');  // 等待 fetch 完成
        let chartData = await response.json();  // 等待解析 JSON 資料

        var ctx = $('#radar');
        new Chart(ctx, {
            type: 'radar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: { // 在 Chart.js 4.x 中，radar 圖表使用 'r' 來定義比例尺
                        angleLines: {
                            display: false // 隱藏角度線
                        },
                        ticks: {
                            color: '#cccccc',
                            beginAtZero: true, // 從 0 開始
                            backdropColor: 'rgba(0, 0, 0, 0)' // 等同於 `showLabelBackdrop: false`
                        },
                        grid: {
                            color: 'grey' // 設定網格顏色
                        },
                        pointLabels: {
                            color: 'white', // 將數據點周圍的標籤設為白色
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: '雷達圖',
                        color: 'skyblue',
                        font: {
                            size: 20
                        }
                    },
                    legend:{
                        labels:{
                            color: 'white'
                        }
                    }
                }
            }
        });
    };
};

//-------------------------------------------------------- 右下 輪播表格
async function loadCarousel(){
    let gridDataList = await Promise.all([
        fetch('./data/fakeTableDataA01.json').then(response => response.json()),
        fetch('./data/fakeTableDataA02.json').then(response => response.json())
        // 實際應用可換成公版API
        // getGridData('361531161090242').then(data => data.Grid_Data),
        // getGridData('361531234726885').then(data => data.Grid_Data)
    ]);

    // 建構輪播頁的內容
    let htmlContent = `
        <div class="carousel-item active">
            ${generateTable(gridDataList[0])}
        </div>
        <div class="carousel-item">
            ${generateTable(gridDataList[1])}
        </div>
    `;

    // 將輪播頁內容插入網頁
    $("#carouselExampleIndicators .carousel-inner").html(htmlContent)

    // 添加點擊事件 -> 導航欄變色
    toggleCarouselNav()

    // 添加點擊事件 -> 自動輪播開關
    const carouselElement = document.querySelector('#carouselExampleIndicators');
    const carousel = new bootstrap.Carousel(carouselElement, {
        interval: 2000 // 設定自動播放間隔（例如 2 秒）
    });
    $("#toggleTouch").on("click", function() {
        toggleAutoplay(carousel);
        $(this).blur();
    });
    
    function generateTable(gridData) {
        if (gridData.length === 0) return '<p>沒有數據可顯示</p>'; // 如果沒有數據，顯示提示信息
    
        // 提取欄位名（假設所有行都有相同的鍵）
        const columns = Object.keys(gridData[0]);
    
        // 生成表頭
        const headerRow = columns.map(column => `<th scope="col">${column}</th>`).join('');
    
        // 生成表格行
        const tableRows = gridData.map(row => `
            <tr>
                ${columns.map(column => {
                    // 根據狀態獲取對應的 CSS 類別（如果需要）
                    const statusClass = column === "狀態" ? getStatusClass(row[column]) : '';
                    return `<td class="${statusClass}">${row[column]}</td>`;
                }).join('')}
            </tr>
        `).join('');
    
        // 返回完整的表格 HTML
        return `
            <table class="table table-dark table-hover table-striped fw-bold">
                <thead>
                    <tr>
                        ${headerRow}
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;
    }

    function getStatusClass(status) {
        // 根據狀態改變字體顏色
        switch (status) {
            case '運行':
                return 'text-success';
            case '待機':
                return 'text-warning';
            case '故障':
                return 'text-danger';
            default:
                return '';
        }
    }

    function toggleCarouselNav(){
        $('.carousel-item').each(function(index) {
            const element = this;
    
            // 定義 MutationObserver 的回調函數
            const observer = new MutationObserver(function() {
                if($(element).hasClass('active')||$(element).hasClass('carousel-item-next')){
                    // 移除所有按鈕的 active 樣式
                    $('.slider-nav div').removeClass('active');
                    // 添加 active 樣式到當前選中的按鈕
                    $(`.slider-nav div:nth-child(${index+1})`).addClass('active');
                }
            });
        
            // 設置監聽目標元素及其屬性
            observer.observe(element, {
                attributes: true, // 監聽屬性變化
                attributeFilter: ['class'] // 只監聽 class 屬性變化
            });
        });
    
        // 若手動點擊則馬上變更顏色
        $('.slider-nav div').click(function () {
            // 移除所有按鈕的 active 樣式
            $('.slider-nav div').removeClass('active');
            // 添加 active 樣式到當前選中的按鈕
            $(this).addClass('active');
        });
    }
    
    function toggleAutoplay(carousel) {
        if (carousel._config.ride) {
            carousel._config.ride = false;  // 暫停自動播放
        } else {
            carousel._config.ride = true;  // 開啟自動播放
        }
    }
}
