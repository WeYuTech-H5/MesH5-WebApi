


// ---------------------------------------------------
var CustomHTMLSid1='342448877350078';
var CustomHTMLData1;
var CustomHTMLSid2='343559564223206';
var CustomHTMLData2;
var CustomHTMLSid3='343559668080812';
var CustomHTMLData3;
var CustomHTMLSid4='343646750816732';
var CustomHTMLData4;

async function fetchData() {
  // CustomHTMLData1 = await getGridData(CustomHTMLSid1);
  // CustomHTMLData2 = await getGridData(CustomHTMLSid2);
  // CustomHTMLData3 = await getGridData(CustomHTMLSid3);
  // CustomHTMLData4 = await getGridData(CustomHTMLSid4);

  // 假資料
  CustomHTMLData1 = await (await fetch('./data/CustomHTMLData1.json')).json()
  CustomHTMLData2 = await (await fetch('./data/CustomHTMLData2.json')).json()
  CustomHTMLData3 = await (await fetch('./data/CustomHTMLData3.json')).json()
  CustomHTMLData4 = await (await fetch('./data/CustomHTMLData4.json')).json()
 
  for(let item of CustomHTMLData1.Grid_Data){
    $("#Capacity").html(item.MAX_CAPACITY);
    $("#Planned_Qty").html(item.PLANNED_QTY);
    $("#Use_Rate").html(item.USE_RATE + '%');
    $("#All_Machine").html(item.TOTAL_EQP);
    $("#Active_Machine").html(item.ACHEIVE_EQP);
  }
  //右上
  for(let item of CustomHTMLData2.Grid_Data){
    // $("#Run_Rate").html(Math.round((item.RUN_EQP/(item.RUN_EQP+item.IDLE_EQP+item.POWEROFF_EQP))*100)+"%");
    $("#Run_Rate").html(item.RUN_EQP+"%");
    $("#Run").html(item.RUN_EQP+"%");
    $("#Idle").html(item.IDLE_EQP+"%");
    $("#PowerOff").html(item.POWEROFF_EQP+"%");
  }
  //左下
  let tableHTML_L = ''
  for(let item of CustomHTMLData3.Grid_Data){
    tableHTML_L += `
      <tr>
        <td>${item.EQP_NAME}</td>
        <td>${item.STATUS}</td>
        <td>${item.WO_CNT_WAIT}</td>
        <td>${item.WO_CNT_IN_PROCESS}</td>
        <td>${item.WO_CNT_OUT}</td>
        <td>${item.PRODUCED_RATE}%</td>
      </tr>
    `
  }
  $('#TopProduction tbody').html(tableHTML_L)
  //右下
  let tableHTML_R = ''
  for(let item of CustomHTMLData4.Grid_Data){
    tableHTML_R += `
      <tr>
        <td>${item.EQP_NAME}</td>
        <td>${item.REPORT_IN_TIME}</td>
        <td>${item.PART_NO}</td>
        <td>${item.PART_SPEC}</td>
      </tr>
    `
  }
  $('#InProgress tbody').html(tableHTML_R)


  //圓餅圖
  var useRateData = [CustomHTMLData1.Grid_Data[0]['PLANNED_QTY'], CustomHTMLData1.Grid_Data[0]['MAX_CAPACITY']-CustomHTMLData1.Grid_Data[0]['PLANNED_QTY']]
  var ctxUseRate = document.getElementById('useRate');
  new Chart(ctxUseRate, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: useRateData,
        backgroundColor: ['#BBE296', '#E5E5E5'],
        borderWidth: 1
      }]
    },
    options: {
        cutout: 50,
    }
  });
  var DowntimeCausesData = [CustomHTMLData2.Grid_Data[0]['RUN_EQP'], CustomHTMLData2.Grid_Data[0]['IDLE_EQP'], CustomHTMLData2.Grid_Data[0]['POWEROFF_EQP']]
  var ctxDowntimeCauses = document.getElementById('downtimeCauses');
  new Chart(ctxDowntimeCauses, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: DowntimeCausesData,
        backgroundColor: ['#BBE296', 'orange', '#E5E5E5'],
        borderWidth: 1
      }]
    },
    options: {
      cutout: 50,
    }
  });

  updateTime('timming')

}

fetchData()



async function getGridData(SID) {
  // 定义 GetGrid API 的 URL
  let getGridURL = window.location.protocol+'//'+default_ip+'/'+default_Api_Name+'/api/GetGrid';

  // 定义要传递的参数对象
  let params = {
      SID: SID,
      // TokenKey: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_TokenKey')
      // TokenKey: '302e24cbG8xfcHU/Z/vTzA1zYjVFHLfUNtqsWonT'
      TokenKey: 'WEYU54226552'

  };

  // 定义查詢条件参数对象
  let conditions = {
      // 每個SID 要塞的條件皆不同,塞錯會掛
      // Field: ["INSPECT_BIG_ITEM_CODE", "INSPECT_DATE"],
      // Oper: ["like", "between"],
      // Value: ["WEEK", "2021-12-06 00:00:00~2021-12-07 00:00:00"]
  };

  // 构建请求头
  let headers = new Headers({
      'Content-Type': 'application/json',
      'SID': params.SID,
      'TokenKey': params.TokenKey
      // 可以添加其他必要的请求头信息
  });

  // 构建请求体
  let requestBody = JSON.stringify(conditions);

  // 构建请求配置
  let requestOptions = {
      method: 'POST', // 将请求方法设置为 "POST"
      headers: headers,
      body: requestBody // 将条件参数放入请求体
  };

  try {
      // 发送请求并等待响应
      let response = await fetch(getGridURL, requestOptions);

      if (response.ok) {
          // 解析响应为 JSON
          let data = await response.json();
          // console.log("获取Grid数据成功:", data);
          if(data.result){
              return data;
          }
          else{
              // Set_Clean();
          }
      } else {
           throw new Error('获取Grid数据失败，状态码：' + response.status);
          
      }
  } catch (error) {
      console.error(error);
  }
}
async function updateTime(ElementID){
  let getTimeData = await getGridData('252236119093442');
  let lastUpdateTime = new Date(getTimeData.Grid_Data[0].TIMESPAN)
  let year = lastUpdateTime.getFullYear();
  let month = lastUpdateTime.getMonth()+1;
  let date = lastUpdateTime.getDate();
  let hour = lastUpdateTime.getHours();
  let minute = lastUpdateTime.getMinutes();
  document.getElementById(ElementID).textContent = (` ${date}/${month}/${year} ${hour}:${minute < 10 ? '0' : ''}${minute} `)
}