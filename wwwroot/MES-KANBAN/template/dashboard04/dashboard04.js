//卡片資料
let cardsid = "317063107393683";
let carddata;

//線形圖資料
let linechartsid = "317123122760583";
let linechart;

async function fetchData() {
  try {
    carddata = await getGridData(cardsid);
    //產生卡片 html
    SetCard(carddata);

    //針對卡片圖表 構圖
    for (var i = 0; i < carddata.Grid_Data.length; i++) {
      SetChart(carddata.Grid_Data[i]);
    }
  } catch (error) {
    console.error("获取数据时出错：", error);
  }
}

fetchData();

//產生 卡片資訊的html
function SetCard(carddata) {
  try {
    let cardhtml = "";
    for (var i = 0; i < carddata.Grid_Data.length; i++) {
      //carddata.Grid_Data.length

      let EQP_NO = carddata.Grid_Data[i].EQP_NO;
      let STATUS = carddata.Grid_Data[i].STATUS;
      let BGColor = carddata.Grid_Data[i].EQP_STATUS_LAYOUT_COLOR;

      //畫卡片資料
      let tmpcardhtml = "";

      // if(i==0){
      //     tmpcardhtml += '<div class="carousel-item">';
      // }

      if (i % 8 == 0) {
        tmpcardhtml += "</div>";
        tmpcardhtml += '<div class="carousel-item flex flex-wrap w-full">';
      }

      tmpcardhtml += '<div class="md:w-full lg:w-1/4">';
      tmpcardhtml +=
        '<div class="rounded-md relative p-2 m-2 mt-0 bg-blue-950 ">';
      // 標題 start
      tmpcardhtml +=
        '<h3 class="text-xl flex rounded-md justify-between w-full" style="background-color:' +
        BGColor +
        '!important">';
      tmpcardhtml += `<strong class="ml-1">${EQP_NO}</strong>`;
      tmpcardhtml += `<small class="mr-1">${STATUS}</small>`;
      tmpcardhtml += "</h3>";
      // 標題 end
      tmpcardhtml += '<div class="flex wrapperUp">';
      // 扇形圖 start
      let doughnuthtml = Setdoughnuthtml(carddata.Grid_Data[i]);
      tmpcardhtml += doughnuthtml;
      // 扇形圖 end
      // 字 start
      tmpcardhtml += '<aside class="num mr-1 mt-1 lg:w-2/5">';
      // API 內容 start
      tmpcardhtml += '<h4 class="">TOTAL_V</h4>';
      tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_V}</strong>`;
      tmpcardhtml += "<h4>TOTAL_I</h4>";
      tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_I}</strong>`;
      tmpcardhtml += "<h4>TOTAL_KW</h4>";
      tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_KW}</strong>`;
      tmpcardhtml += "<h4>TOTAL_KWH</h4>";
      tmpcardhtml += `<strong class="weight-bold ">${carddata.Grid_Data[i].TOTAL_KWH}</strong>`;
      // API 內容 end
      tmpcardhtml += "</aside>";
      // 字 end
      tmpcardhtml += "</div>";
      // 線形圖 start
      let linehtml = SetLinehtml(
        EQP_NO,
        carddata.Grid_Data[i].STATUS_CHANGE_TIME
      );
      tmpcardhtml += linehtml;
      // 線形圖 end
      tmpcardhtml += "</div>";
      tmpcardhtml += "</div>";
      if (i == carddata.Grid_Data.length - 1) {
        tmpcardhtml += "</div>";
      }
      cardhtml += tmpcardhtml;
    }
    let targetElement = document.getElementById("carousel");
    targetElement.innerHTML = cardhtml;
  } catch (error) {
    console.error("获取数据时出错：", error);
  }
}

//產生 卡片資訊的html - 扇形圖細項
function Setdoughnuthtml(data) {
  //id命名 class + chart類型+ 機台
  //子id 以主id 架構下, 流水號abc編下去 類推
  let tmpid = "div" + "doughnut" + data.EQP_NO;
  let tmpid2 = "div" + "doughnut" + data.EQP_NO + "a";

  let html = "";
  html += '<div class="flex-grow relative">';
  html += `<div id="${tmpid}" class="percentage absolute top-[7rem] w-full weight-bold text-center text-xl">${data.OEE}<small>%</small></div>`;
  html += `<canvas id="${tmpid2}" class="m-auto pieCanvas"></canvas>`;
  html += "</div>";

  return html;
}

//產生 卡片資訊的html - 線形圖細項
function SetLinehtml(EQP_NO, STATUS_CHANGE_TIME) {
  let date = new Date(STATUS_CHANGE_TIME);

  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");
  let hours = date.getHours().toString().padStart(2, "0");
  let minutes = date.getMinutes().toString().padStart(2, "0");
  let seconds = date.getSeconds().toString().padStart(2, "0");

  let formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  //id命名 class + chart類型+ 機台
  //子id 以主id 架構下, 流水號編下去 類推
  let tmpid = "canvas" + "Line" + EQP_NO;
  let tmpid2 = "canvas" + "Line" + EQP_NO + "a";
  let html = "";
  html += `<canvas id="${tmpid}" width="50" height="15"></canvas>`;
  html += `<p class="text-slate-400" id="${tmpid2}">Data Time: ${formattedTime}</p>`;
  return html;
}

//針對圖形 產生圖檔
function SetChart(data) {
  //畫扇形圖
  Setdoughnut(
    data,
    data.RUN_COLOR,
    data.IDLE_COLOR,
    data.ERROR_COLOR,
    data.POWEROFF_COLOR
  );
  //畫線形圖
  SetLine(data.EQP_NO);
}

function Setdoughnut(data, RUN_COLOR, IDLE_COLOR, ERROR_COLOR, POWEROFF_COLOR) {
  // 命名規則 : class + chart類型+ 機台
  // 子id 以主id 架構下, 流水號abc編下去 類推
  // 範例機台為 TEST
  // 即 id 為 divdoughnutTEST = 中間字的id
  // divdoughnutTESTa = 扇形圖id(canvas)

  let tmpcanvasid = "divdoughnut" + data.EQP_NO + "a";
  let percentageERROR = data.ERROR;
  let percentageIDLE = data.IDLE;
  let percentagePOWEROFF = data.POWEROFF;
  let percentageRUN = data.RUN;

  let ctx = document.getElementById(tmpcanvasid);
  let dashboardChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["RUN", "IDLE", "ERROR", "POWER_OFF"],
      datasets: [
        {
          data: [
            percentageRUN,
            percentageIDLE,
            percentageERROR,
            percentagePOWEROFF,
          ],
          backgroundColor: [RUN_COLOR, IDLE_COLOR, ERROR_COLOR, POWEROFF_COLOR],
          borderWidth: 0,
        },
      ],
    },
    options: {
      rotation: "-90",
      circumference: 180,
      plugins: {
        legend: {
          display: false,
        },
        tooltips: {
          enabled: false,
        },
      },
      cutout: "90%",
    },
  });
}

function SetLine(EQP_NO) {
  //取得線形圖 API 資料

  let linedata = GetLineChartData(EQP_NO);
  console.log("Line Data:" + linedata);

  // 命名規則 : class + chart類型+ 機台
  // 子id 以主id 架構下, 流水號abc編下去 類推
  // 範例機台為 TEST
  // 即 id 為 divdoughnutTEST = 中間字的id
  // divdoughnutTESTa = 扇形圖id(canvas)

  let tmpcanvasid = "canvas" + "Line" + EQP_NO;
  let dataArr = [];
  for (let i = 0; i < linedata.Series.length; i++) {
    for (let j = 0; j < linedata.Series[i].data.length; j++) {
      let dataArrOrgin = linedata.Series[0].data[j].y;
      dataArr.push(dataArrOrgin);
    }
  }

  let ctxLine = document.getElementById(tmpcanvasid).getContext("2d");
  // Data for the line chart
  let data = {
    labels: linedata.XCategories,
    datasets: [
      {
        label: "",
        data: dataArr,
        borderColor: "#00ff62",
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  // Chart options
  let options = {
    plugins: {
      legend: {
        display: false,
      },
      scales: {
        y: {
          min: 0,
        },
      },
    },
  };

  let lineChart = new Chart(ctxLine, {
    type: "line", // Use a line chart
    data: data,
    options: options,
  });
}

//舊api chart 呼叫 線形圖
function GetLineChartData(EQP_NO) {
  let Sid = linechartsid;
  let Structer;
  let Data;

  $.ajax({
    type: "GET",
    url:
      "http://" +
      default_ip +
      "/" +
      default_WebSiteName +
      "/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID=" +
      Sid,
    async: false,
    success: function (msg) {
      var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, '"'));
      jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(
        /<+/g,
        "#lt"
      );
      jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(
        /<+/g,
        "#lt"
      );
      Structer = jsonObj;
    },
  });

  Structer.MasterSql = Structer.MasterSql.replace("EQP_NO", EQP_NO);

  $.ajax({
    type: "post",
    url:
      "http://" +
      default_ip +
      "/" +
      default_WebSiteName +
      "/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Chart&DBLink=SELF",
    data: {
      Charts: JSON.stringify(Structer.Charts),
      SQL: Structer.MasterSql,
      AddedSQL: Structer.AddedSql,
      Conds: JSON.stringify(Structer.Conditions),
      GridFieldType: JSON.stringify(Structer.GridFieldType),
      SID: +Sid,
      rows: 100,
    },
    async: false,
    success: function (msg) {
      Data = jQuery.parseJSON(
        msg.replace(/\~/g, '"').replace(/name/gi, "tech")
      );
    },
  });

  return Data;
}

const carousel = document.getElementById("carousel");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const pagination = document.getElementById("pagination");

let currentIndex = 0;

function showSlide(index) {
  carousel.style.transform = `translateX(-${index * 100}%)`;
}

prevButton.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    showSlide(currentIndex);
    pagination.innerText = currentIndex + 1
  }
});

nextButton.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex > 3) {
    // 根據需要調整幻燈片的數量
    currentIndex = 0; // 重置為第一頁
  }
  showSlide(currentIndex);
  pagination.innerText = currentIndex + 1
});
