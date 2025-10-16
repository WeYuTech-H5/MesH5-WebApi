let cardpage = 1;//預設最少一頁
let tmpcount =0; //紀錄目前卡片總數

//卡片資料 
let cardsid = '317063107393683';
let carddata ;

let refreshInterval;
let carouselInterval;


//儲存卡片Chart物件
let createdCharts = []

async function fetchData() {
    try {
        carddata = await getGridData(cardsid);
        //產生卡片 html
        SetCard(carddata);

        tmpcount = carddata.Grid_Data.length; //2023-11-16 新增 
        Get_TotalPage(tmpcount); //2023-11-16 新增
        slideCarousel();//開啟可換頁功能

        //針對卡片圖表 構圖
        for(var i=0;i<carddata.Grid_Data.length;i++){
            SetChart(carddata.Grid_Data[i]);
        }


        //最後更新資料的時間
        updateTime('timming')
    } catch (error) {
        console.error("获取数据时出错：", error);
    } finally {
        hideElement("divLoading");
    }
}
fetchData();

//2023-11-17新增 補圖表更新功能
async function refreshChart(){
    if (document.visibilityState === 'visible') {
        //定時更新
        refreshInterval = setInterval(async () => {
            carddata = await getGridData(cardsid)
            for(var i=0;i<carddata.Grid_Data.length;i++){
                let data = carddata.Grid_Data[i];
                createdCharts['chart_' + data.EQP_NO].data.datasets[0].data = [data.RUN, data.IDLE, data.ERROR, data.POWEROFF]
                // 測試效果: createdCharts['chart_' + data.EQP_NO].data.datasets[0].data = [Math.random(), Math.random(), Math.random(), Math.random()]
                createdCharts['chart_' + data.EQP_NO].update()
            }
            //最後更新資料的時間
            updateTime('timming')
        }, 30000);

    }
}
refreshChart()

//產生 卡片資訊的html
function SetCard(carddata){

    try{
        let cardhtml = '';
        for(var i=0;i<carddata.Grid_Data.length;i++){ //carddata.Grid_Data.length
            
            let EQP_NO = carddata.Grid_Data[i].EQP_NO;
            let STATUS = carddata.Grid_Data[i].STATUS;
            let BGColor = carddata.Grid_Data[i].EQP_STATUS_LAYOUT_COLOR;

            

            //畫卡片資料
            let tmpcardhtml = '';
            
            if(i%8==0){
                if(i!=0){
                    tmpcardhtml += '</div>';
                }
                tmpcardhtml += '<div class="carousel-item flex flex-wrap">';
            }


            tmpcardhtml += '<div class="w-full lg:w-1/3 xl:w-1/4 ">';
            tmpcardhtml += '<div class="rounded-md relative p-2 m-2 mt-0 theCard ">';
            // 標題 start 
            tmpcardhtml += '<h3 class="text-xl flex p-1 rounded-md" style="background-color:' + BGColor + '!important">';
            tmpcardhtml += `<strong class="ml-1 w-4/5 text-left">${EQP_NO}</strong>`;
            tmpcardhtml += `<small>${STATUS}</small>`;
            tmpcardhtml += `<a href="zz_board4.html" target="_blank" class="mr-1 ml-1"><img src="../../img/comm/up-right-from-square-solid.svg" alt="new window" /></a>`;
            tmpcardhtml += '</h3>';
            // 標題 end
            tmpcardhtml += '<div class="flex wrapperUp">';
            // 扇形圖 start
            let doughnuthtml = Setdoughnuthtml(carddata.Grid_Data[i]);
            tmpcardhtml += doughnuthtml;
            // 扇形圖 end
            // 字 start
            tmpcardhtml += '<aside class="num mr-1 mt-1 lg:w-2/5" style="color:#fff;">';
            // API 內容 start
            tmpcardhtml += '<h4 class="pr-1">TOTAL_V</h4>';
            tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_V}</strong>`;
            tmpcardhtml += '<h4 class="pr-1">TOTAL_I</h4>';
            tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_I}</strong>`;
            tmpcardhtml += '<h4 class="pr-1">TOTAL_KW</h4>';
            tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_KW}</strong>`;
            tmpcardhtml += '<h4 class="pr-1">TOTAL_KWH</h4>';
            tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_KWH}</strong>`;
            // API 內容 end
            tmpcardhtml += '</aside>';
            // 字 end
            tmpcardhtml += '</div>';
           
            tmpcardhtml += '</div>';
            tmpcardhtml += '</div>';
            if(i==carddata.Grid_Data.length-1){
                tmpcardhtml += '</div>';
            }
            cardhtml += tmpcardhtml;
        }
        let targetElement = document.getElementById("carousel");
        targetElement.innerHTML = cardhtml;
    }
    catch(error) {
        console.error("获取数据时出错：", error);
    }
    

}

//產生 卡片資訊的html - 扇形圖細項
function Setdoughnuthtml(data){
    //id命名 class + chart類型+ 機台
    //子id 以主id 架構下, 流水號abc編下去 類推
    let tmpid = 'div'+'doughnut'+data.EQP_NO;
    let tmpid2 = 'div'+'doughnut'+data.EQP_NO+'a';

    let html = '';
    html += '<div class="flex-grow relative" style="height: 180px">';
    html += `<div id="${tmpid}" class="percentage absolute top-[6rem] weight-bold text-xl" style="font-size:2rem; text-align:center; width: 100%; color: #fff;">${data.OEE}<small>%</small></div>`;
    html += `<canvas id="${tmpid2}" class="m-auto" width="180" height="180"></canvas>`;
    html += '</div>';
    
    return html;
}


//針對圖形 產生圖檔
function SetChart(data){
    //畫扇形圖
    Setdoughnut(data,data.RUN_COLOR,data.IDLE_COLOR,data.ERROR_COLOR,data.POWEROFF_COLOR);
    
}

function Setdoughnut(data,RUN_COLOR,IDLE_COLOR,ERROR_COLOR,POWEROFF_COLOR){
    // 命名規則 : class + chart類型+ 機台
    // 子id 以主id 架構下, 流水號abc編下去 類推
    // 範例機台為 TEST
    // 即 id 為 divdoughnutTEST = 中間字的id
    // divdoughnutTESTa = 扇形圖id(canvas)

    let tmpcanvasid =  'divdoughnut' + data.EQP_NO+'a';
    let percentageERROR = data.ERROR
    let percentageIDLE = data.IDLE
    let percentagePOWEROFF = data.POWEROFF
    let percentageRUN = data.RUN


    let ctx = document.getElementById(tmpcanvasid);
    createdCharts['chart_' + data.EQP_NO] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['RUN', 'IDLE', 'ERROR', 'POWER_OFF'],
            datasets: [{
                data: [percentageRUN, percentageIDLE, percentageERROR, percentagePOWEROFF ],
                backgroundColor: [ RUN_COLOR, IDLE_COLOR, ERROR_COLOR, POWEROFF_COLOR],
                borderWidth: 0
            }]

        },
        options: {
            rotation: '-90',
            circumference: 180,
            plugins: {
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: false
                },
            },
            cutout: '90%'
        }
    });
    

}


//2023-11-16新增 補輪播功能

//算共有幾頁
function Get_TotalPage(tmpcount){
    cardpage = Math.floor(tmpcount / 8);
    if(cardpage%8!=0){
        cardpage++;
    }
}

// 2023-11-16新增 輪播功能
function slideCarousel() {
    // 輪播事件
    let carousel = document.getElementById('carousel');
    let prevButton = document.getElementById('prev');
    let nextButton = document.getElementById('next');
    let currentIndex = 0;
    let totalSlides = cardpage; // 根據實際的幻燈片數量進行更新

    function showSlide(index) {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    // 2023-11-16新增 輪播按鈕事件
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
        $('#pagination').html(currentIndex + 1);
    });

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
        $('#pagination').html(currentIndex + 1);
    });

    // 2023-11-16新增 定期輪播功能
    const intervalTime = 5000; // 每5秒輪播一次（根據需要調整）
    carouselInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
        $('#pagination').html(currentIndex + 1);
    }, intervalTime);

}


// 2023-11-29新增 輪播開關
function toggleCarousel(){
    var carouselCheckbox = document.getElementById("carouselSwitchPlay");
           if (carouselCheckbox.checked) {
               slideCarousel();
               console.log("Carousel switched on");
           } else {
               clearInterval(carouselInterval)
               console.log("Carousel switched off");
           }
}

// 2023-12-11新增 更新資料開關
function toggleUpdate(){
   var refreshCheckbox = document.getElementById("carouselSwitchUpdate");
          if (refreshCheckbox.checked) {
                refreshChart();
              console.log("Carousel Update on");
          } else {
              clearInterval(refreshInterval)
              console.log("Carousel Update off");
          }
}