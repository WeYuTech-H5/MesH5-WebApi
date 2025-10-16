//卡片資料
let cardsid = '333132145463307';
let carddata ;
let statussid = '333819905503336';
let statusdata;
let alarmsid = '334065072776958';
let alarmdata;
let createdCharts = []

let refreshInterval;
let carouselInterval;


async function fetchData() {
    try {
        carddata = await getGridData(cardsid);
        statusdata = await getGridData(statussid);
        alarmdata = await getGridData(alarmsid);

        

        //產生卡片 html
        SetCard(carddata);

        tmpcount = carddata.Grid_Data.length; //2023-11-16 新增
        Get_TotalPage(tmpcount); //2023-11-16 新增
        slideCarousel();//開啟可換頁功能

        //畫圖
        for(var i=0;i<carddata.Grid_Data.length;i++){
            SetChart(carddata.Grid_Data[i].EQP_NO+"_"+i,carddata.Grid_Data[i].EQP_NO);
        }

        //產生table
        GetTable()



        //最後更新資料的時間
        updateTime('timming')


    } catch (error) {
      console.error("获取数据时出错：", error);
    }
}
fetchData();

async function refreshData() {
    if (document.visibilityState === 'visible'){
        try {
            //定時更新
            refreshInterval = setInterval(async () => {
                carddata = await getGridData(cardsid);
                statusdata = await getGridData(statussid);
                alarmdata = await getGridData(alarmsid);
                //畫圖
                for(var i=0;i<carddata.Grid_Data.length;i++){
                    UpdateChart(carddata.Grid_Data[i].EQP_NO+"_"+i,carddata.Grid_Data[i].EQP_NO);
                }
        
                //產生table
                GetTable()
        
                //最後更新資料的時間
                updateTime('timming')
    
            }, 30000);
            
        } catch (error) {
          console.error("获取数据时出错：", error);
        }
    }
}
refreshData()
//產生 卡片資訊的html
function SetCard(carddata){

    try{
        let cardhtml = '';
        for(var i=0;i<carddata.Grid_Data.length;i++){ //carddata.Grid_Data.length
            
            let EQP_NO = carddata.Grid_Data[i].EQP_NO;
            let STATUS = carddata.Grid_Data[i].STATUS;
            let BGColor = carddata.Grid_Data[i].EQP_STATUS_LAYOUT_COLOR;

            let chartId = EQP_NO+"_"+i;
            //畫卡片資料
            let tmpcardhtml = '';
            
            if(i%8==0){
                if(i!=0){
                    tmpcardhtml += '</div>';
                }
                tmpcardhtml += '<div class="carousel-item flex flex-wrap">';
            }


            tmpcardhtml += '<div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 ">';
            tmpcardhtml += '<div class="rounded-md relative p-2 m-2 mt-0 theCard ">';
            // 標題 start 
            tmpcardhtml += '<h3 class="text-xl flex p-1 rounded-md" style="background-color:' + BGColor + '!important">';
            tmpcardhtml += `<strong class="ml-1 w-4/5 text-left">${EQP_NO}</strong>`;
            tmpcardhtml += `<small class="grow mr-1 text-end">${STATUS}</small>`;
            tmpcardhtml += '</h3>';
            // 標題 end
            tmpcardhtml += '<div class="wrapperUp text-white">';
                // 表格 start
                //外層 start
                tmpcardhtml += `<div class="lg:flex w-full justify-between">`;
                    //內層 start
                    tmpcardhtml += `<h4 class="flex title lg:w-1/2 justify-between lg:mr-1"><strong class="weight-bold text-start">${GetLangDataV2('Vacuum degree')}</strong>` + `<span class="text-end">${carddata.Grid_Data[i].VACUUM}</span></h4>`;

                    tmpcardhtml += `<h4 class="flex title grow justify-between"><strong class="weight-bold ">PV / SV</strong>` + `<span class="text-end">${carddata.Grid_Data[i].H_PV}`+ ` / ` + `${carddata.Grid_Data[i].H_SV}` + `</span></h4>`;
                    //內層 end
                tmpcardhtml += `</div>`;
                //外層 end


                //外層 start
                tmpcardhtml += `<div class="lg:flex w-full justify-between">`;
                //內層 start
                    tmpcardhtml += `<h4 class="flex title lg:w-1/2 justify-between lg:mr-1"><strong class="weight-bold text-start">${GetLangDataV2('Furnace Pressure')}</strong>` + `<span class="text-end">${carddata.Grid_Data[i].FP}</span></h4>`;

                    tmpcardhtml += `<h4 class="flex title grow justify-between"><strong class="weight-bold ">PV / SV</strong>` + `<span class="text-end">${carddata.Grid_Data[i].L_PV}`+ ` / ` + `${carddata.Grid_Data[i].L_SV}</span>` + `</h4>`;
                    //內層 end
                tmpcardhtml += `</div>`;
                //外層 end


                tmpcardhtml += `<canvas id="${chartId}" width="300" height="50"></canvas>`;


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

        console.log('Latest 5 Alarm')
        console.log('翻譯過的:',GetLangDataV2('Latest 5 Alarm'))

        
    }
    catch(error) {
        console.error("获取数据时出错：", error);
    }
    

}

async function SetChart(id,EQP_NO){

    //用舊的Chart api取資料
    //333452140693845
    let tmpdata = GetChartDataOld('333452140693845',EQP_NO)

    let ydata = [];
    for(var i=0;i<tmpdata[0].Series[0].data.length;i++){
        ydata.push(tmpdata[0].Series[0].data[i].y);
    }


    let ctx = document.getElementById(id);
    createdCharts[id] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: tmpdata[0].XCategories,
        datasets: [{
          label: '',
          data: ydata,
          backgroundColor: [
            '#03bcf4'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                display: false
            },
            y: {
                ticks: {
                    color: 'white'
                }
            }
        }
      }
    });

}

async function UpdateChart(id,EQP_NO){
    let tmpdata = GetChartDataOld('333452140693845',EQP_NO);
    let ydata = [];
    for(var i=0;i<tmpdata[0].Series[0].data.length;i++){
        ydata.push(tmpdata[0].Series[0].data[i].y);
    }
    createdCharts[id].data.labels = tmpdata[0].XCategories;
    createdCharts[id].data.datasets[0].data = ydata;

}

// call API取得回傳Data
function GetChartDataOld(SID,EQP_NO){
    try{
      let Sid = SID;
      let Structer;
      let Data;
      
      $.ajax({
          type: 'GET',
          url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=' + Sid,
          async: false,
          success: function (msg) {
              var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
              jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
              jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
              Structer = jsonObj
          }
      });
  
      Structer.MasterSql = Structer.MasterSql.replace('EQP_NO',EQP_NO);

      $.ajax({
          type: 'post',
          url: window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Chart&DBLink=SELF',
          data: {
              Charts: JSON.stringify(Structer.Charts),
              SQL: Structer.MasterSql,
              AddedSQL: Structer.AddedSql,
              Conds: JSON.stringify(Structer.Conditions),
              GridFieldType: JSON.stringify(Structer.GridFieldType),
              SID: +Sid,
              rows: 100
          },
          async: false,
          success: function (msg) {
              Data = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi, 'tech'));
          }
      });
  
      return [Data,Structer]
    }
    catch{
      return null
    }
  
  }

function GetTable(){
    //表格1: 最新5筆機況更改
    //標題
    let table1Title = GetLangDataV2(statusdata.Report_Schema[0]["QR_NAME"])
    let nameList1 = Object.keys(statusdata.Grid_Data[0])
    let fieldName1 = `
        <tr class="bg-gray-900">
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList1[3])}</th>
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList1[2])}</th>
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList1[0])}</th>
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList1[1])}</th>
        </tr>
    `
    //內容
    let fieldContent1 = ''
    for(var i=0;i<5;i++){
        fieldContent1 += `
            <tr class="bg-gray-800">
                <td class="border border-gray-400 px-4 py-2">${statusdata.Grid_Data[i].SID}</td>
                <td class="border border-gray-400 px-4 py-2">${statusdata.Grid_Data[i].STATUS_CHANGE_TIME}</td>
                <td class="border border-gray-400 px-4 py-2">${statusdata.Grid_Data[i].EQP_NO}</td>
                <td class="border border-gray-400 px-4 py-2">${statusdata.Grid_Data[i].STATUS}</td>
            </tr>
        `
    }

    document.getElementById('table1Title').textContent = table1Title
    document.getElementById('fieldName1').innerHTML = fieldName1
    document.getElementById('fieldContent1').innerHTML = fieldContent1

    //表格2: 最新5筆警示
    //標題
    let table2Title = GetLangDataV2(alarmdata.Report_Schema[0]["QR_NAME"])
    let nameList2 = Object.keys(alarmdata.Grid_Data[0])
    let fieldName2 = `
        <tr class="bg-gray-900">
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList2[0])}</th>
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList2[1])}</th>
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList2[2])}</th>
            <th class="border border-gray-400 px-4 py-2 text-left">${GetLangDataV2(nameList2[3])}</th>
        </tr>
    `
    //內容
    let fieldContent2 = ''
    for(var i=0;i<5;i++){
        fieldContent2 += `
            <tr class="bg-gray-800">
                <td class="border border-gray-400 px-4 py-2">${alarmdata.Grid_Data[i].SID}</td>
                <td class="border border-gray-400 px-4 py-2">${alarmdata.Grid_Data[i].STATUS_CHANGE_TIME}</td>
                <td class="border border-gray-400 px-4 py-2">${alarmdata.Grid_Data[i].EQP_NO}</td>
                <td class="border border-gray-400 px-4 py-2">${alarmdata.Grid_Data[i].ALARM}</td>
            </tr>
        `
    }

    document.getElementById('table2Title').textContent = table2Title
    document.getElementById('fieldName2').innerHTML = fieldName2
    document.getElementById('fieldContent2').innerHTML = fieldContent2
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
    const intervalTime = 15000; // 每15秒輪播一次（根據需要調整）
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
               refreshData();
               console.log("Carousel Update on");
           } else {
               clearInterval(refreshInterval)
               console.log("Carousel Update off");
           }
}