//-------------上半部------------------------------------------------

//每日用電 半尖峰/離峰 ok
let ctxUseRateT1;
let darwUseRateT1;
function GetUseRateT1(Structer) {

  let tmpdata = [];
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    tmpdata.push(Structer[0].Series[0].data[i].y);
  }
  let tmpcolor = [];

  let dem = 0;
  let mole = 0;
  for (let j = 0; j < Structer[0].XCategories.length; j++) {
    switch (Structer[0].XCategories[j]) {
      case "半尖峰時間":
        tmpcolor.push('#ED9B3A');

        break;
      case "尖峰時間":
        tmpcolor.push('#BBE296');

        break;
      case "離峰時間":
        tmpcolor.push('#3EBC62');

        break;
    }
  }

  $('#TODAY_SUMMARY_KWH_TOT_PER').html(TODAY_SUMMARY_KWH_TOT_PER);


  ctxUseRateT1 = document.getElementById('boxT1');
  darwUseRateT1 = new Chart(ctxUseRateT1, {
    type: 'doughnut',
    data: {
      labels: Structer[0].XCategories,
      datasets: [{
        data: tmpdata,
        backgroundColor: tmpcolor,
        borderWidth: 0
      }]
    },
    options: {
      aspectRatio: 1,
      cutoutPercentage: 90
    }
  });
}

// 每日用電 半尖峰/離峰 update ok
function UpdateUseRateT1(Structer) {
  let tmpdata = [];
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    tmpdata.push(Structer[0].Series[0].data[i].y);
  }
  let tmpcolor = [];
  for (let j = 0; j < Structer[0].XCategories.length; j++) {
    switch (Structer[0].XCategories[j]) {
      case "半尖峰時間":
        tmpcolor.push('#ED9B3A');

        break;
      case "尖峰時間":
        tmpcolor.push('#BBE296');

        break;
      case "離峰時間":
        tmpcolor.push('#3EBC62');

        break;
    }
  }
  darwUseRateT1.data.labels = Structer[0].XCategories
  darwUseRateT1.data.datasets[0].data = tmpdata;
  darwUseRateT1.data.datasets[0].backgroundColor = tmpcolor;
  darwUseRateT1.update();
}

//每月用電 半尖峰/離峰 ok
let ctxUseRateT2;
let darwUseRateT2;
function GetUseRateT2(Structer) {

  let tmpdata = [];
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    tmpdata.push(Structer[0].Series[0].data[i].y);
  }
  let tmpcolor = [];
  for (let j = 0; j < Structer[0].XCategories.length; j++) {
    switch (Structer[0].XCategories[j]) {
      case "半尖峰時間":
        tmpcolor.push('#ED9B3A');

        break;
      case "尖峰時間":
        tmpcolor.push('#BBE296');

        break;
      case "離峰時間":
        tmpcolor.push('#3EBC62');

        break;
    }
  }

  ctxUseRateT2 = document.getElementById('boxT2');
  darwUseRateT2 = new Chart(ctxUseRateT2, {
    type: 'doughnut',
    data: {
      labels: Structer[0].XCategories,
      datasets: [{
        data: tmpdata,
        backgroundColor: tmpcolor,
        borderWidth: 0
      }]
    },
    options: {
      aspectRatio: 1,
      cutoutPercentage: 90
    }
  });

}

//每月用電 半尖峰/離峰 update ok
function UpdateUseRateT2(Structer) {
  let tmpdata = [];
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    tmpdata.push(Structer[0].Series[0].data[i].y);
  }
  let tmpcolor = [];
  for (let j = 0; j < Structer[0].XCategories.length; j++) {
    switch (Structer[0].XCategories[j]) {
      case "半尖峰時間":
        tmpcolor.push('#ED9B3A');

        break;
      case "尖峰時間":
        tmpcolor.push('#BBE296');

        break;
      case "離峰時間":
        tmpcolor.push('#3EBC62');

        break;
    }
  }
  darwUseRateT2.data.labels = Structer[0].XCategories
  darwUseRateT2.data.datasets[0].data = tmpdata;
  darwUseRateT2.data.datasets[0].backgroundColor = tmpcolor;
  darwUseRateT2.update();
}

//每15分鐘需量 SPM-21 MPA-MAIN ok-->but 資料收集異常?
let ctxUseRateT3;
let darwUseRateT3;

function GetUseRateT3(Structer) {
  let tmpdata = [];
  let tmpcolor = [];//存尖峰、半尖峰
  let tmptime = [];
  let tmptype = [];

  //區域圖  用變數
  var segments = [];
  let tmpstart = 0;
  let tmpend = 0;


  for (let i = 0; i < Structer[0].rows.length; i++) {
    tmpdata.push(Structer[0].rows[i].AUTODC_OUTPUT);
    tmptype.push(Structer[0].rows[i].TYPE);
    switch (Structer[0].rows[i].TYPE) {
      case "尖峰時間":
        //AREA CHART Start
        //開頭
        if (i == 0) {
          tmpstart = i;
        }
        else {
          //與上筆不同,要結算至上一筆
          if (Structer[0].rows[i - 1].TYPE != "尖峰時間") {
            tmpend = i + 1;
            segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
            tmpstart = Structer[0].rows[i - 1].TYPE == "尖峰時間" ? tmpstart : i;
          }
        }
        //AREA CHART End
        tmpcolor.push('#BBE296'); // 尖峰顏色
        break;
      case "半尖峰時間":
        //AREA CHART Start
        //開頭
        if (i == 0) {
          tmpstart = i;
        }
        else {
          //與上筆不同,要結算至上一筆
          if (Structer[0].rows[i - 1].TYPE != "半尖峰時間") {
            tmpend = i + 1;
            segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
            tmpstart = Structer[0].rows[i - 1].TYPE == "半尖峰時間" ? tmpstart : i;
          }
        }
        //AREA CHART End

        tmpcolor.push('#ED9B3A'); // 半尖峰顏色
        break;
      case "離峰時間":
        //AREA CHART Start
        //開頭
        if (i == 0) {
          tmpstart = i;
        }
        else {
          //與上筆不同,要結算至上一筆
          if (Structer[0].rows[i - 1].TYPE != "離峰時間") {
            tmpend = i + 1;
            segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
            tmpstart = Structer[0].rows[i - 1].TYPE == "離峰時間" ? tmpstart : i;
          }
        }
        //AREA CHART End
        tmpcolor.push('#3EBC62'); // 離峰顏色
        break;
      case "周六半尖峰":
        tmpcolor.push('#BBE296'); // 周六半尖峰顏色
        break;
    }
    //區域圖最後結尾補上
    if (i == Structer[0].rows.length - 1) {
      tmpend = i + 1;
      segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
    }
    tmptime.push(Structer[0].rows[i].REPORT_TIME);
  }

  // 動態創建數據集 - Area Chart
  var AreaDatasets = segments.map(function (segment) {
    var dataSegment = [];
    for (var i = 0; i < tmptime.length; i++) {
      if (i >= segment.start && i < segment.end) {
        dataSegment.push(tmpdata[i]);
      } else {
        dataSegment.push(null);
      }
    }
    return {
      data: dataSegment,
      backgroundColor: segment.color,
      borderColor: segment.color.replace('0.4', '1'), // 邊框顏色與填充顏色匹配
      borderWidth: 2,
      fill: true,
      pointBorderColor: 'rgba(0, 0, 0, 0.5)', // 点的边框颜色设置为黑色
      pointBorderWidth: 1.5, // 点的边框宽度
    };
  });

  ctxUseRateT3 = document.getElementById('boxT3');
  darwUseRateT3 = new Chart(ctxUseRateT3, {
    type: 'line',
    data: {
      labels: tmptime,
      datasets: AreaDatasets
      // [{
      //   data: tmpdata,
      //   backgroundColor: tmpcolor,
      //   borderWidth: 0,
      // }]
    },
    options: {
      legend: {
        display: false // This will hide the legend
      },
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            // 返回标题，可以根据需要自定义
            return tmptype[tooltipItem[0].index] + data.labels[tooltipItem[0].index];
          },
          label: function (tooltipItem, data) {
            // 返回数据点的文本，可以根据需要自定义
            return '数值: ' + tooltipItem.yLabel;
          }
        }
      },
      elements: {
        point: {
          pointStyle: 'rect', // 更改点的形状为正方形
        }
      }
    }
  });
}

//每15分鐘需量 SPM-21 MPA-MAIN update ok-->but 資料收集異常?
function UpdateUseRateT3(Structer) {

  let tmpdata = [];
  let tmpcolor = [];//存尖峰、半尖峰
  let tmptime = [];
  let tmptype = [];

  //區域圖  用變數
  var segments = [];
  let tmpstart = 0;
  let tmpend = 0;


  for (let i = 0; i < Structer[0].rows.length; i++) {
    tmpdata.push(Structer[0].rows[i].AUTODC_OUTPUT);
    tmptype.push(Structer[0].rows[i].TYPE);
    switch (Structer[0].rows[i].TYPE) {
      case "尖峰時間":
        //AREA CHART Start
        //開頭
        if (i == 0) {
          tmpstart = i;
        }
        else {
          //與上筆不同,要結算至上一筆
          if (Structer[0].rows[i - 1].TYPE != "尖峰時間") {
            tmpend = i + 1;
            segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
            tmpstart = Structer[0].rows[i - 1].TYPE == "尖峰時間" ? tmpstart : i;
          }
        }
        //AREA CHART End
        tmpcolor.push('#BBE296'); // 尖峰顏色
        break;
      case "半尖峰時間":
        //AREA CHART Start
        //開頭
        if (i == 0) {
          tmpstart = i;
        }
        else {
          //與上筆不同,要結算至上一筆
          if (Structer[0].rows[i - 1].TYPE != "半尖峰時間") {
            tmpend = i + 1;
            segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
            tmpstart = Structer[0].rows[i - 1].TYPE == "半尖峰時間" ? tmpstart : i;
          }
        }
        //AREA CHART End
        tmpcolor.push('#ED9B3A'); // 半尖峰顏色
        break;
      case "離峰時間":
        //AREA CHART Start
        //開頭
        if (i == 0) {
          tmpstart = i;
        }
        else {
          //與上筆不同,要結算至上一筆
          if (Structer[0].rows[i - 1].TYPE != "離峰時間") {
            tmpend = i + 1;
            segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
            tmpstart = Structer[0].rows[i - 1].TYPE == "離峰時間" ? tmpstart : i;
          }
        }
        //AREA CHART End
        tmpcolor.push('#3EBC62'); // 離峰顏色
        break;
      case "周六半尖峰":
        tmpcolor.push('#BBE296'); // 周六半尖峰顏色
        break;
    }
    //區域圖最後結尾補上
    if (i == Structer[0].rows.length - 1) {
      tmpend = i + 1;
      segments.push({ start: tmpstart, end: tmpend, color: GetColor(Structer[0].rows[i - 1].TYPE) });
    }
    tmptime.push(Structer[0].rows[i].REPORT_TIME);
  }

  // 動態創建數據集 - Area Chart
  let UpdateAreaDatasets = segments.map(function (segment) {
    let UpdatedataSegment = [];
    for (var i = 0; i < tmptime.length; i++) {
      if (i >= segment.start && i < segment.end) {
        UpdatedataSegment.push(tmpdata[i]);
      } else {
        UpdatedataSegment.push(null);
      }
    }
    return {
      data: UpdatedataSegment,
      backgroundColor: segment.color,
      borderColor: segment.color.replace('0.4', '1'), // 邊框顏色與填充顏色匹配
      borderWidth: 2,
      fill: true,
      pointBorderColor: 'rgba(0, 0, 0, 0.5)', // 点的边框颜色设置为黑色
      pointBorderWidth: 1.5, // 点的边框宽度
    };
  });


  // 更新回调函数 --區域圖
  darwUseRateT3.options.tooltips.callbacks.title = function (tooltipItem, data) {
    return tmptype[tooltipItem[0].index] + data.labels[tooltipItem[0].index];
  };
  darwUseRateT3.options.tooltips.callbacks.label = function (tooltipItem, data) {
    return '数值: ' + tooltipItem.yLabel;
  };

  darwUseRateT3.data.labels = tmptime
  darwUseRateT3.data.datasets = UpdateAreaDatasets;
  // darwUseRateT3.data.datasets[0].backgroundColor = tmpcolor;
  darwUseRateT3.update();

}

//--------------------------------------------------------------------
function GetColor(TYPE) {
  switch (TYPE) {
    case "離峰時間":
      // lastcolor = '#3EBC62';
      lastcolor = 'rgba(62, 188, 98, 0.5)';
      break;
    case "半尖峰時間": //這個跟尖峰顏色對調
      // lastcolor = '#ED9B3A';
      lastcolor = 'rgba(237, 155, 58, 0.5)';
      break;
    case "尖峰時間"://這個跟半尖峰顏色對調
      // lastcolor = '#BBE296';
      lastcolor = 'rgba(187, 226, 150, 0.5)';
      break;
  }
  return lastcolor;
}
//-----------------------下半部---------------------------------------

//尖峰 --OK
let ctxUseRate;
let darwUseRate;
function GetUseRate(Structer) {

  let tmpdata = [];
  let tmp;
  tmp = Structer[0].Series[0].data[0].y;
  tmpdata.push(tmp);
  tmpdata.push((100 - tmp));
  tmp = tmp.toFixed(2);
  $('#Peak').html(tmp + '%');


  ctxUseRate = document.getElementById('boxA');
  darwUseRate = new Chart(ctxUseRate, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: tmpdata,
        backgroundColor: ['#BBE296', '#eee'],
        borderWidth: 0
      }]
    },
    options: {
      cutoutPercentage: 70,
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      tooltips: {
        enabled: false
      }
    }
  });
}

//尖峰 update --OK
function UpdateUseRate(Structer) {

  let tmpdata = [];
  let tmp;
  tmp = Structer[0].Series[0].data[0].y;
  tmpdata.push(tmp);
  tmpdata.push((100 - tmp));
  tmp = tmp.toFixed(2);
  $('#Peak').html(tmp + '%');

  darwUseRate.data.datasets[0].data = tmpdata;
  darwUseRate.update();

}

//半尖峰 --OK
let ctxUseRateB;
let darwUseRateB;
function GetUseRateB(Structer) {

  let tmpdata = [];
  let tmp;
  tmp = Structer[0].Series[0].data[0].y;
  tmpdata.push(tmp);
  tmpdata.push((100 - tmp));

  tmp = tmp.toFixed(2);

  $('#Semi-Peak').html(tmp + '%');

  ctxUseRateB = document.getElementById('boxB');
  darwUseRateB = new Chart(ctxUseRateB, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: tmpdata,
        backgroundColor: ['#ED9B3A', '#eeeeee'],
        borderWidth: 0
      }]
    },
    options: {
      cutoutPercentage: 70,
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      tooltips: {
        enabled: false
      }
    }
  });
}

//半尖峰 update --OK
function UpdateUseRateB(Structer) {

  let tmpdata = [];
  let tmp;
  tmp = Structer[0].Series[0].data[0].y;
  tmpdata.push(tmp);
  tmpdata.push((100 - tmp));
  tmp = tmp.toFixed(2);

  $('#Semi-Peak').html(tmp + '%');

  darwUseRateB.data.datasets[0].data = tmpdata;
  darwUseRateB.update();
}

//離峰 OK
let ctxUseRateD;
let darwUseRateD;

function GetUseRateD(Structer) {

  let tmpdata = [];
  let tmp;
  tmp = Structer[0].Series[0].data[0].y;
  tmpdata.push(tmp);
  tmpdata.push((100 - tmp));
  tmp = tmp.toFixed(2);
  $('#Off-Peak').html(tmp + '%');
  ctxUseRateD = document.getElementById('boxD');
  darwUseRateD = new Chart(ctxUseRateD, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: tmpdata,
        backgroundColor: ['#3EBC62', '#eeeeee'],
        borderWidth: 0
      }]
    },
    options: {
      cutoutPercentage: 70,
      rotation: 1 * Math.PI,
      circumference: 1 * Math.PI,
      tooltips: {
        enabled: false
      }
    }
  });
}

//離峰 update --OK
function UpdateUseRateD(Structer) {
  let tmpdata = [];
  let tmp;
  tmp = Structer[0].Series[0].data[0].y;
  tmpdata.push(tmp);
  tmpdata.push((100 - tmp));
  tmp = tmp.toFixed(2);
  $('#Off-Peak').html(tmp + '%');
  darwUseRateD.data.datasets[0].data = tmpdata;
  darwUseRateD.update();
}

//本日累積用電 --OK
let ctxUseRateE;
let darwUseRateE;
function GetUseRateE(Structer) {

  let tmpdata = [];
  let tmptotal = 0;
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    // tmpdata.push(Structer[0].Series[0].data[i].y);
    tmptotal += Structer[0].Series[0].data[i].y;
  }
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    let result = Structer[0].Series[0].data[i].y / tmptotal;
    tmpdata.push((parseFloat(result.toFixed(1)) * 100));
  }
  let tmpcolor = [];
  for (let j = 0; j < Structer[0].XCategories.length; j++) {
    switch (Structer[0].XCategories[j]) {
      case "半尖峰時間":
        tmpcolor.push('#ED9B3A');

        break;
      case "尖峰時間":
        tmpcolor.push('#BBE296');

        break;
      case "離峰時間":
        tmpcolor.push('#3EBC62');

        break;
    }
  } 3
  tmpcolor.push('#BBE296');
  ctxUseRateE = document.getElementById('boxE');
  darwUseRateE = new Chart(ctxUseRateE, {
    type: 'doughnut',
    data: {
      labels: Structer[0].XCategories,
      datasets: [{
        data: tmpdata,
        backgroundColor: tmpcolor,
        borderWidth: 0
      }]
    },
    options: {
      aspectRatio: 1,
      cutoutPercentage: 50
    }
  });
}

//本日累積用電 update --OK
function UpdateUseRateE(Structer) {
  let tmpdata = [];
  let tmptotal = 0;
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    // tmpdata.push(Structer[0].Series[0].data[i].y);
    tmptotal += Structer[0].Series[0].data[i].y;
  }
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    let result = Structer[0].Series[0].data[i].y / tmptotal;
    tmpdata.push((parseFloat(result.toFixed(1)) * 100));
  }
  let tmpcolor = [];
  for (let j = 0; j < Structer[0].XCategories.length; j++) {
    switch (Structer[0].XCategories[j]) {
      case "半尖峰時間":
        tmpcolor.push('#ED9B3A');

        break;
      case "尖峰時間":
        tmpcolor.push('#BBE296');

        break;
      case "離峰時間":
        tmpcolor.push('#3EBC62');

        break;
    }
  }
  tmpcolor.push('transparent');
  darwUseRateE.data.labels = Structer[0].XCategories
  darwUseRateE.data.datasets[0].data = tmpdata;
  darwUseRateE.data.datasets[0].backgroundColor = tmpcolor;

  darwUseRateE.update();
}

//近期用電度數
let ctxUseRateF;
let darwUseRateF;

function GetUseRateF(Structer) {

  let tmpKWH_TOT = [];
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    tmpKWH_TOT.push(Structer[0].Series[0].data[i].y);
  }

  let tmpPEAK = [];
  for (let i = 0; i < Structer[0].Series[1].data.length; i++) {
    tmpPEAK.push(Structer[0].Series[1].data[i].y);
  }

  let tmpSEMI_PEAK = [];
  for (let i = 0; i < Structer[0].Series[2].data.length; i++) {
    tmpSEMI_PEAK.push(Structer[0].Series[2].data[i].y);
  }

  // let tmpSAT_SEMI_PEAK = [];
  // for(let i=0;i<Structer[0].Series[3].data.length;i++){
  //   tmpSAT_SEMI_PEAK.push(Structer[0].Series[3].data[i].y);
  // }

  let tmpOFF_PEAK = [];
  for (let i = 0; i < Structer[0].Series[3].data.length; i++) {
    tmpOFF_PEAK.push(Structer[0].Series[3].data[i].y);
  }

  ctxUseRateF = document.getElementById('boxF');
  darwUseRateF = new Chart(ctxUseRateF, {
    type: 'bar',
    data: {
      labels: Structer[0].XCategories,
      datasets: [
        {
          label: '合計度數',
          data: tmpKWH_TOT,
          type: 'line',
          borderColor: '#0076c1',
          fill: false,
          borderWidth: 2,
          pointBackgroundColor: '#FF0000',
        },
        {
          label: '尖峰',
          data: tmpPEAK,
          backgroundColor: '#ed1919',
          borderWidth: 0
        },
        {
          label: '半尖峰',
          data: tmpSEMI_PEAK,
          backgroundColor: '#ED9B3A',
          borderWidth: 0
        },
        {
          label: '離峰',
          data: tmpOFF_PEAK,
          backgroundColor: '#3EBC62',
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,

      showAllTooltips: true,
      scales: {

        plugins: {
          datalabels: {
            color: 'white',
            font: {
              weight: 'bold'
            },
            formatter: function (value, context) {
              return Math.round(value) + '%';
            }
          }
        }
      }
      // Tooltips: {
      //   backgroundColor: 'rgba(0,0,0,.5)',
      //   displayColors: true,
      //   yAlign: 'center',
      //   xAlign: 'center',
      //   callbacks: {
      //     //  title: function() {}
      //   }
      // },
    }
  });
}

//近期用電度數 update
function UpdateUseRateF(Structer) {

  let tmpKWH_TOT = [];
  for (let i = 0; i < Structer[0].Series[0].data.length; i++) {
    tmpKWH_TOT.push(Structer[0].Series[0].data[i].y);
  }

  let tmpPEAK = [];
  for (let i = 0; i < Structer[0].Series[1].data.length; i++) {
    tmpPEAK.push(Structer[0].Series[1].data[i].y);
  }

  let tmpSEMI_PEAK = [];
  for (let i = 0; i < Structer[0].Series[2].data.length; i++) {
    tmpSEMI_PEAK.push(Structer[0].Series[2].data[i].y);
  }

  // let tmpSAT_SEMI_PEAK = [];
  // for(let i=0;i<Structer[0].Series[3].data.length;i++){
  //   tmpSAT_SEMI_PEAK.push(Structer[0].Series[3].data[i].y);
  // }

  let tmpOFF_PEAK = [];
  for (let i = 0; i < Structer[0].Series[3].data.length; i++) {
    tmpOFF_PEAK.push(Structer[0].Series[3].data[i].y);
  }

  darwUseRateF.data.datasets[0].data = tmpKWH_TOT;
  darwUseRateF.data.datasets[1].data = tmpPEAK;
  darwUseRateF.data.datasets[2].data = tmpSEMI_PEAK;
  darwUseRateF.data.datasets[3].data = tmpOFF_PEAK;

  darwUseRateF.update();
}

//-------------------------------------------------------------------

//-----------------------純字串--------------------------------------
//-----------------------上半----------------------------------------
let TODAY_MAX_KWH_TOT_TIME;
let TODAY_MAX_KWH_TOT;
let MONTH_MAX_KWH_TOT_TIME;
let MONTH_MAX_KWH_TOT;
//-----------------------下半----------------------------------------
let Peak;
let Semi_Peak;
let Sat_Semi_Peak;
let Off_Peak;
let TODAY_SUMMARY_KWH_TOT;
let TODAY_SUMMARY_KWH_TOT_PER;// 公式 : 離峰+半尖峰 / 該日總用電

function GetElectricityData(Structer) {



  TODAY_MAX_KWH_TOT_TIME = Structer[0].rows[0].TODAY_MAX_KWH_TOT_TIME;
  TODAY_MAX_KWH_TOT = Structer[0].rows[0].TODAY_MAX_KWH_TOT;
  MONTH_MAX_KWH_TOT_TIME = Structer[0].rows[0].MONTH_MAX_KWH_TOT_TIME;
  MONTH_MAX_KWH_TOT = Structer[0].rows[0].MONTH_MAX_KWH_TOT;


  TODAY_SUMMARY_KWH_TOT = Structer[0].rows[0].TODAY_SUMMARY_KWH_TOT;
  TODAY_SUMMARY_KWH_TOT_PER = Structer[0].rows[0].TODAY_SUMMARY_KWH_TOT_PER;// 公式 : 離峰+半尖峰 / 該日總用電

  //調整字串
  // TODAY_MAX_KWH_TOT_TIME = TODAY_MAX_KWH_TOT_TIME.replace(' ',' </br>');
  // MONTH_MAX_KWH_TOT_TIME = MONTH_MAX_KWH_TOT_TIME.replace(' ',' </br>');


  $('#TODAY_MAX_KWH_TOT_TIME').html(TODAY_MAX_KWH_TOT_TIME + '<span id="TODAY_MAX_KWH_TOT">N/A KW</span>當日最高用電 kWh');
  $('#TODAY_MAX_KWH_TOT').html(TODAY_MAX_KWH_TOT);
  $('#MONTH_MAX_KWH_TOT_TIME').html(MONTH_MAX_KWH_TOT_TIME + '<span id="MONTH_MAX_KWH_TOT">N/A KW</span>當月最高用電 kWh');
  $('#MONTH_MAX_KWH_TOT').html(MONTH_MAX_KWH_TOT);


  // $('#TODAY_SUMMARY_KWH_TOT').html(TODAY_SUMMARY_KWH_TOT);
  $('#TODAY_SUMMARY_KWH_TOT_PER').html(TODAY_SUMMARY_KWH_TOT_PER);

  $('#title_KWH_TOT').html("本日累積用電:" + TODAY_SUMMARY_KWH_TOT + " KWh");

}
//--------------------------------------------------------------------

//----------------------Refresh--------------------------------------

//定時10sec 更新
setInterval(async () => RefreshData(), 300 * 1000); // 10秒

//更新圖表資料
async function RefreshData() {
  //前景更新
  if (document.visibilityState === 'visible') {
    //文字類更新
    let ElectricityData = GetGridDataOld('349550706833528');
    GetElectricityData(ElectricityData);
    //上半部圖表更新
    let UseRateT1 = GetChartDataOld('349544550420430');
    UpdateUseRateT1(UseRateT1);
    let UseRateT2 = GetChartDataOld('349545375680098');
    UpdateUseRateT2(UseRateT2);
    let UseRateT3 = GetGridDataOld('349547186630029');
    UpdateUseRateT3(UseRateT3);
    //下半部圖表更新
    let UseRate = GetChartDataOld('349547445066572');
    UpdateUseRate(UseRate);
    let UseRateB = GetChartDataOld('349548559220785');
    UpdateUseRateB(UseRateB);
    // let UseRateC = GetChartDataOld('349548676093795');
    // UpdateUseRateC(UseRateC);
    let UseRateD = GetChartDataOld('349548783913149');
    UpdateUseRateD(UseRateD);
    let UseRateE = GetChartDataOld('349548911060636');
    UpdateUseRateE(UseRateE);
    let UseRateF = GetChartDataOld('349549505646229');
    UpdateUseRateF(UseRateF);

    updateTime('349612922773159');

  }
}

// 畫面初始化 資料
async function LoadData() {
  let ElectricityData = GetGridDataOld('349550706833528');
  GetElectricityData(ElectricityData);
  //上半部圖表更新
  let UseRateT1 = GetChartDataOld('349544550420430');
  GetUseRateT1(UseRateT1);
  let UseRateT2 = GetChartDataOld('349545375680098');
  GetUseRateT2(UseRateT2);
  let UseRateT3 = GetGridDataOld('349547186630029');
  GetUseRateT3(UseRateT3);
  //下半部圖表更新
  let UseRate = GetChartDataOld('349547445066572');
  GetUseRate(UseRate);
  let UseRateB = GetChartDataOld('349548559220785');
  GetUseRateB(UseRateB);
  // let UseRateC = GetChartDataOld('349548676093795');
  // GetUseRateC(UseRateC);
  let UseRateD = GetChartDataOld('349548783913149');
  GetUseRateD(UseRateD);
  let UseRateE = GetChartDataOld('349548911060636');
  GetUseRateE(UseRateE);
  let UseRateF = GetChartDataOld('349549505646229');
  GetUseRateF(UseRateF);

  updateTime('349612922773159');
}

LoadData();

//------------------------------刷新DB時間-------------------------
function updateTime(SID) {

  let Structer = GetGridDataOld(SID);
  let now = new Date(Structer[0].rows[0].TIMESPAN);
  let hours = String(now.getHours()).padStart(2, '0');
  let minutes = String(now.getMinutes()).padStart(2, '0');
  let seconds = String(now.getSeconds()).padStart(2, '0');
  let timeString = `${hours}:${minutes}:${seconds}`;
  document.getElementById('time').textContent = timeString;
}

//----------------------------共用function---------------------------

function GetChartDataOld(SID) {
  try {
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

    return [Data, Structer]
  }
  catch {
    return null
  }

}


function GetGridDataOld(SID) {
  try {
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
      url: window.location.protocol + '//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
      data: {
        Charts: JSON.stringify(Structer.Charts),
        SQL: Structer.MasterSql,
        AddedSQL: Structer.AddedSql,
        Conds: JSON.stringify(Structer.Conditions),
        GridFieldType: JSON.stringify(Structer.GridFieldType),
        SID: +Sid,
        rows: 1000
      },
      async: false,
      success: function (msg) {
        Data = jQuery.parseJSON(msg.replace(/\~/g, "\"").replace(/name/gi, 'tech'));
      }
    });

    return [Data, Structer]
  }
  catch {
    return null
  }

}