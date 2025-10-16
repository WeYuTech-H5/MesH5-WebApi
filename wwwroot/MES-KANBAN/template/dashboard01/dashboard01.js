let GridList; //表格json資料 A
let GridListsid = "321097983506833";

let GridListKID; //表格json資料 A 的孩子
let GridListKIDsid = "321619657173588";

let GridListB; //表格json資料 B
let GridListBsid = "311090922317202";

let GridListC; //表格json資料 C
// let GridListCsid = "310917519483319";
let GridListCsid = "363978411090234";

let doughnutA; //圖表json資料 A
// let doughnutASID = "321618901510638";
let doughnutASID = "363977341833260";

let doughnutAKID; //圖表json資料 A 中間的文字
let doughnutASIDKID = "330190397116629";

// let stackChartASID = "321981534510696";
let stackChartASID = "363977763616183";

// let MultiLineChartASID = "300535057513078";
let MultiLineChartASID = "363978968316731";

// 宣告Chart全域變數
let DrawDoughnut;
let DrawStack;
let DrawLine;

// 初始化圖表
async function fetchData() {
  let DoughnutData = await getChartData(doughnutASID);
  let DoughnutDataKid = await getGridData(doughnutASIDKID);
  let StackData = await GetChartDataOld(stackChartASID);
  let LineData = await GetChartDataOld(MultiLineChartASID);

  if (DoughnutData && DoughnutDataKid){
    InitialDoughnut(DoughnutData);
    Set_doughnutAKID(DoughnutDataKid);
  }else{
    Set_Clean()
  }

  if (StackData[0].Series.length > 0){
    InitialStack(StackData[0])
    document.getElementById("stackBarATitle").textContent = GetLangDataV2(StackData[1].ChartTitle);
  }else{
    Set_Clean()
  }

  if (LineData[0].Series.length > 0){
    InitialLine(LineData[0]);
    document.getElementById("lineMultiTitle").textContent = GetLangDataV2(LineData[1].ChartTitle);
  }else{
    Set_Clean()
  }

  // 表格
  GridList = await getGridData(GridListsid);
  GridListB = await getGridData(GridListBsid);
  GridListC = await getGridData(GridListCsid);
  Set_GridList(GridList);
  Set_GridListB(GridListB);
  Set_GridListC(GridListC);

  //最後更新資料的時間
  updateTime('timming')

  //定時更新
  setInterval(async () => RefreshData(), 30000); // 1000 毫秒等于 1 秒

}
fetchData();

// call API & 更新圖表
async function RefreshData() {
  // 僅限前景
  if (document.visibilityState === 'visible') {
    // Chart圖
    let DoughnutData = await getChartData(doughnutASID)
    let DoughnutDataKid = await getGridData(doughnutASIDKID)
    let StackData = await GetChartDataOld(stackChartASID);
    let LineData = await GetChartDataOld(MultiLineChartASID);
    if(DoughnutData && DoughnutDataKid){
      UpdateDoughnut(DoughnutData);
      Set_doughnutAKID(DoughnutDataKid);
    }
    if(StackData[0].Series.length > 0){
      UpdateStack(StackData[0]);
    }
    if(LineData[0].Series.length > 0){
      UpdateLine(LineData[0]);
    }

    // 表格
    GridList = await getGridData(GridListsid);
    GridListB = await getGridData(GridListBsid);
    GridListC = await getGridData(GridListCsid);
    Set_GridList(GridList);
    Set_GridListB(GridListB);
    Set_GridListC(GridListC);

    //最後更新資料的時間
    updateTime('timming')
  }
}

// call API取得回傳Data
function GetChartDataOld(SID){
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

    $.ajax({
        type: 'post',
        url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Chart&DBLink=SELF',
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


// 初始化甜甜圈圖
function InitialDoughnut(Data) {
  // 標題欄位
  let doughnutATitle = document.querySelector('#doughnutATitle');
  doughnutATitle.innerHTML = GetLangDataV2(Data.title);

  // 甜甜圈色彩
  let fillBgColor = ['#fcb07d', '#4c9ef6']

  // 甜甜圈小標題
  let labels  = Data.data.labels.map(label => GetLangDataV2(label))

  // 甜甜圈資訊欄
  let ChartADATA = Data.data.datasets[0].data;
  let doughnutCanvas = document.getElementById('doughnutAChart');
  // 甜甜圈圖
  DrawDoughnut = new Chart(doughnutCanvas, {
    type: "doughnut",
    options: {
      cutout: 80
    },
    data: {
      labels: labels,
      datasets: [{
        data: ChartADATA,
        backgroundColor: fillBgColor,
        borderWidth: 1
      }],
    },
    options: {
      plugins: {
        legend: {
            display: true,
            labels: {
                color: 'white'
            }
        }
      },
      cutout: '70%',
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: 1
    },
  })
}

// 初始化堆疊圖
function InitialStack(Data) {
  console.log('Data.Series',Data.Series)
  let colorArr = []
  for(let i =0; i < Data.Series.length; i++) {
    colorArr.push(Data.Series[i].color);
  }
  var ctx = document.getElementById("stackBarA").getContext('2d');
  DrawStack = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Data.XCategories,
        
        datasets: Data.Series.map((series, index) => ({
          label: GetLangDataV2(series.tech),
          backgroundColor: colorArr[index],
          data: series.data.map(dataPoint => dataPoint.y),
        })),
      },
      options: {
        tooltips: {
          callbacks: {
            mode: "x",
          },
        },
        scales: {
          x: {
            stacked: true,
            ticks:{color: 'white'}
          },
          y: {
            stacked: true,
            suggestedMin: 0,
            suggestedMax: 100,
            beginAtZero: true,
            ticks:{color: 'white'}
          },
        },

        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
              display: true,
              labels: {
                  color: 'white'
              }
          }
        }
      },
    });

}

// 初始化Line圖
function InitialLine(Data) {
    let theTime = [];
  for (let a = 0; a < Data.XCategories.length; a++){
    let timeArr = Data.XCategories[a];
    theTime.push(timeArr)
  }

  let theYList = [];

  for (let i = 0; i < Data.Series.length; i++) {
    let firstArr = [];
  
    for (let j = 0; j < Data.Series[i].data.length; j++) {
      let yValue = Data.Series[i].data[j].y;
      firstArr.push(yValue);
    }
  
    theYList.push(firstArr);
  }
  
// Sample data for labels and datasets
const labels = theTime;
const datasets = [
  {
    label: GetLangDataV2(Data.Series[0].tech), // Custom label for the first dataset
    data: theYList[0],
    borderColor: '#2196f3',
    backgroundColor: '#2196f3',
    borderWidth: 1
  },
  {
    label: GetLangDataV2(Data.Series[1].tech), // Custom label for the second dataset
    data: theYList[1],
    borderColor: '#ff5722',
    backgroundColor: '#ff5722',
    borderWidth: 1
  },
  {
    label: GetLangDataV2(Data.Series[2].tech), // Custom label for the third dataset
    data: theYList[2],
    borderColor: '#4caf50',
    backgroundColor: '#4caf50',
    borderWidth: 1
  }
];

// Create a new Chart using the above data
var ctx = document.getElementById("lineMulti").getContext('2d');
DrawLine = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: datasets
  },
  options: {
    scales: {
      x: {ticks:{color: 'white'}},
      y: {ticks:{color: 'white'}},
    },
    plugins: {
      legend: {
          display: true,
          labels: {
              color: 'white'
          }
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 1
  },
})
}

// 更新甜甜圈
function UpdateDoughnut(Data) {
  // 甜甜圈資訊欄
  DrawDoughnut.data.datasets[0].data = Data.data.datasets[0].data;

  DrawDoughnut.update();
}

// 甜甜圈Kid
function Set_doughnutAKID(doughnutAKID){
  try {
    //大標題
    document.getElementById('doughnutAKID').innerHTML = doughnutAKID.Grid_Data[0].TOTAL_CO2E
  } catch (error) {
    console.error("获取数据时出错：", error);
  }

}

// 更新Stack圖
function UpdateStack(Data) {
  let colorArr = []
    for(let i =0; i < Data.Series.length; i++) {
      colorArr.push(Data.Series[i].color);
    }

  DrawStack.data.labels = Data.XCategories;
  DrawStack.data.datasets = Data.Series.map((series, index) => ({
    label: GetLangDataV2(series.tech),
    backgroundColor: colorArr[index],
    data: series.data.map(dataPoint => dataPoint.y),
  }))

  DrawStack.update();
}

// 更新Line圖
function UpdateLine(Data) {
  let theTime = [];
  for (let a = 0; a < Data.XCategories.length; a++){
    let timeArr = Data.XCategories[a];
    theTime.push(timeArr)
  }

  let theYList = [];

  for (let i = 0; i < Data.Series.length; i++) {
    let firstArr = [];
    for (let j = 0; j < Data.Series[i].data.length; j++) {
      let yValue = Data.Series[i].data[j].y;
      firstArr.push(yValue);
    }
    theYList.push(firstArr);
  }

  DrawLine.data.labels = theTime;
  DrawLine.data.datasets = [
    {
      label: GetLangDataV2(Data.Series[0].tech), // Custom label for the first dataset
      data: theYList[0],
      borderColor: '#2196f3',
      backgroundColor: '#2196f3',
      borderWidth: 1
    },
    {
      label: GetLangDataV2(Data.Series[1].tech), // Custom label for the second dataset
      data: theYList[1],
      borderColor: '#ff5722',
      backgroundColor: '#ff5722',
      borderWidth: 1
    },
    {
      label: GetLangDataV2(Data.Series[2].tech), // Custom label for the third dataset
      data: theYList[2],
      borderColor: '#4caf50',
      backgroundColor: '#4caf50',
      borderWidth: 1
    }
  ];

  DrawLine.update();
}

// 表格A
function Set_GridList(GridList){
  try{
      let gridAData = GridList;
      let titles = [];
      let valuesV = [];
      let valuesI = [];
      let valuesKW = [];
      let valuesKWH = [];
    
      for (let i = 0; i < gridAData.Grid_Data.length; i++) {
        titles.push(gridAData.Grid_Data[i].GROUP_NAME);
        valuesV.push(gridAData.Grid_Data[i].V);
        valuesI.push(gridAData.Grid_Data[i].I);
        valuesKW.push(gridAData.Grid_Data[i].KW);
        valuesKWH.push(gridAData.Grid_Data[i].KWH);
      }
    
      const T = ["V", "I", "KW", "KWH"];
    
      let gridData = titles.map((title, index) => ({
        title: title,
        T: T,
        C: [valuesV[index], valuesI[index], valuesKW[index], valuesKWH[index]]
      }));
    
      function generateGrid(title, T, C) {
        return `
          <div class="text-sky-300 flex justify-between flex-wrap flex-row w-1/2 mb-2">
            <h2 class="w-full text-center border-sky-500 bg-blue-800 m-1 pt-1 pb-1">${GetLangDataV2(title)}</h2>
            ${T.map((t, index) => `
              <div class="w-1/3 pl-1">${t}</div>
              <div class="w-2/3 pr-1 text-end">${C[index]}</div>
            `).join('')}
          </div>
        `;
      }
    
      let gridHtml = gridData.map(item => generateGrid(item.title, item.T, item.C)).join('');
    
      let gridContainer = document.getElementById('gridAContainer');
    
      gridContainer.innerHTML = `
          ${gridHtml}
      `;
  }  catch (error) {
      console.error("获取数据时出错：", error);
    }
  
}

// 表格 B
function Set_GridListB(GridListB){
    try{
      let gridBData = GridListB;
      //大標題
      document.getElementById('gridBTitle').innerHTML = GetLangDataV2(GridListB.Grid_Schema[0].GRID_CAPTION)
      //小標題
      var TITLES = Object.keys( GridListB.Grid_Data[0] );

      // 內文
      var TYPE = [];
      var CO2E_COUNT = [];
      var REPORT_DATE = [];
      
      // 重複推內文
      for (var i = 0; i < gridBData.Grid_Data.length; i++) {
        TYPE.push(gridBData.Grid_Data[i].TYPE);
        CO2E_COUNT.push(gridBData.Grid_Data[i].CO2E_COUNT);
        REPORT_DATE.push(gridBData.Grid_Data[i].REPORT_DATE);
      }
  
      // 內文表格化
      function generateTable() {
        var gridBList = '';
      
        for (var i = 0; i <  gridBData.Grid_Data.length; i++) {
          gridBList += `
            <div class="flex w-full">
              <div class="w-3/5 break-words pt-2 pb-2">${TYPE[i]}</div>
              <div class="w-1/5 break-words pt-2 pb-2 text-end">${CO2E_COUNT[i]}</div>
              <div class="w-1/5 break-words pt-2 pb-2 text-end">${REPORT_DATE[i]}</div>
            </div>
          `;
        }
        
        //小標題
        let griBlistTitle = 
        `
        <div class="table-head flex bg-blue-800 pt-1 pb-1 mb-1 pr-5">
          <div class="w-3/5 break-words"><strong>${GetLangDataV2(TITLES[0])}</strong></div>
          <div class="w-1/5 break-words text-end"><strong>${GetLangDataV2(TITLES[2])}</strong></div>
          <div class="w-1/5 break-words text-end"><strong>${GetLangDataV2(TITLES[1])}</strong></div>
        </div>
        `
        let gridBAll =  griBlistTitle + `<div class="tbody w-full pr-3" style="height:41vh; overflow-y: scroll">` + gridBList + `</div>`;
        return gridBAll;
      }
  
      var gridBContainer = document.getElementById('gridBContainer');
      gridBContainer.innerHTML = generateTable();
  
    } catch (error) {
      console.error("获取数据时出错：", error);
    }
    
}

// 表格 C
function Set_GridListC(GridListC){
    try{
      let gridCData = GridListC;
      
      //大標題
      document.getElementById('gridCTitle').innerHTML = GetLangDataV2(GridListC.Grid_Schema[0].GRID_CAPTION)
      //小標題
      var TITLES = Object.keys( GridListC.Grid_Data[0] );

      let COLUMN_NAME = [];
      let POWER_COUNT = [];
      let POWER_MONEY = [];

      // Extract data from JSON
      for (let i = 0; i < gridCData.Grid_Data.length; i++) {
        COLUMN_NAME.push(gridCData.Grid_Data[i].COLUMN_NAME);
        POWER_COUNT.push(gridCData.Grid_Data[i].POWER_COUNT);
        POWER_MONEY.push(gridCData.Grid_Data[i].POWER_MONEY);
      }
      
  
      // Generate HTML for the table
      function generateTable() {
          let gridCList = '';
      
        for (let i = 0; i <  gridCData.Grid_Data.length; i++) {
          gridCList += `
            <div class="table-body flex text-sky-200">
              <div class="w-3/5 break-words">${COLUMN_NAME[i]}</div>
              <div class="w-1/5 break-words text-end lg:text-center">${POWER_COUNT[i]}</div>
              <div class="w-1/5 break-words text-end">${POWER_MONEY[i]}</div>
            </div>
          `;
        }
        //小標題
        let columnName = TITLES[0];
        let columnNameWithoutUnderscores = columnName.replace(/_/g, ' ');

        let columnNameB = TITLES[1];
        let columnNameWithoutUnderscoresB = columnNameB.replace(/_/g, ' ');

        let columnNameC = TITLES[2];
        let columnNameWithoutUnderscoresC = columnNameC.replace(/_/g, ' ');
        
        let gridCListTitle = 
        `
        <div class="table-head flex bg-blue-800 text-sky-200" style="height:3em">
          <div class="w-3/5 self-center break-words" ><strong>${GetLangDataV2(columnNameWithoutUnderscores)}</strong></div>
          <div class="grow break-words text-end"><strong>${GetLangDataV2(columnNameWithoutUnderscoresB)}</strong></div>
          <div class="grow pl-1 break-words text-end"><strong>${GetLangDataV2(columnNameWithoutUnderscoresC)}</strong></div>
        </div>
        `
        let gridCAll =  gridCListTitle+ gridCList;
        return gridCAll;
      }
  
      let gridCContainer = document.getElementById('gridCContainer');
      gridCContainer.innerHTML = generateTable();
    } catch (error) {
      console.error("获取数据时出错：", error);
    }
    
}

