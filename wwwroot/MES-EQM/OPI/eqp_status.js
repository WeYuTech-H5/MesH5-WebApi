// 設定 SID 代碼與變數
// let eqpListSID = '384017965166099'; //EQP_MASTER
let eqpListSID = '387548513503528'
let eqpStatusListSID = '383391507950148';//EQP_STATUS 
let reasonCodeSid = '383398766463542';
let eqpnoSID = '238522969613728';

let eqpList;
let eqpStatusList;
let reasonCodeList;
let eqpnoList;


const urlParams = new URLSearchParams(window.location.search);
const MODULE_TYPE = urlParams.get('MODULE_TYPE');
const MODULE_NAME = urlParams.get('MODULE_NAME');
const LEVEL = urlParams.get('LEVEL');
const BUTTON = urlParams.get('BUTTON');
const TYPE = urlParams.get('TYPE');

// 添加点击事件处理程序
let backButton = document.getElementById("backButton");
backButton.addEventListener("click", function () {
  GoBack(MODULE_TYPE, LEVEL, MODULE_NAME, BUTTON);
});

// 頁面載入後初始化
$(document).ready(async function () {
  eqpList = (await getGridData(eqpListSID)).Grid_Data;
  eqpStatusList = (await getGridData(eqpStatusListSID)).Grid_Data;
  reasonCodeList = (await getGridData(reasonCodeSid)).Grid_Data;
  eqpnoList = (await getGridData(eqpnoSID)).Grid_Data;
  $("#progress,#loading").fadeOut(600); // 隱藏載入動畫

  // 設定下拉選單行為
  $("#EQP_NO").click(() => {
    displayOptions($("#EQP_NO"), eqpnoList);
    $("#woMaintainLink").hide();
  });

  $("#EQP_STATUS").click(() => {
    displayOptions($("#EQP_STATUS"), eqpStatusList);
    $("#woMaintainLink").hide();
  });

  $("#REASON_CODE").click(() => {
    displayOptions($("#REASON_CODE"), reasonCodeList);
    $("#woMaintainLink").hide();
  });

  const table = SetGrid(eqpList);


  if (table.rows().count() < 5) {
    $('.dataTables_scrollBody').css('height', 'auto');
  }
});

// 顯示下拉選項的函式
function displayOptions(inputBtn, data) {
  let options = formatOptionObj();
  let html = '';

  for (let opt of options) {
    // 判斷條件，只對 EQP_STATUS 生效
    let btnClass = "btn btn-outline-secondary";
    if (inputBtn.attr('id') === "EQP_STATUS" && opt.title === "Run") {
      btnClass += " btn-run";
    } else if (inputBtn.attr('id') === "EQP_STATUS" && opt.title === "Idle") {
      btnClass += " btn-idle"; // Bootstrap 綠色按鈕
    } else if (inputBtn.attr('id') === "EQP_STATUS" && opt.title === "PowerOff") {
      btnClass += " btn-poweroff"; // Bootstrap 綠色按鈕
    }

    html += `
    <button class="option-item ${btnClass}" data-title="${opt.title}" data-description="${opt.description}" data-value="${opt.value}">
      ${opt.title}<br><span>${opt.description}</span>
    </button>`;
  }

  $(".option-content").html(html);
  $("#keyword").val('');
  $("#optionModal").modal('show');

  // 選擇事件
  $(".option-item").click(function () {
    if (inputBtn.attr('id') === 'EQP_NO') {
      $("#EQPNAME").text($(this).data("description"));
    }
    inputBtn.text($(this).data("title"));
    inputBtn.data('value', $(this).data("value"));
    inputBtn.trigger('change');
    $("#optionModal").modal('hide');
  });

  // 搜尋功能
  $("#keyword").on('keyup', function () {
    const filter = $(this).val().toUpperCase();
    $('.option-item').each(function () {
      $(this).toggle($(this).text().toUpperCase().includes(filter));
    });
  });

  // 格式化下拉選項
  function formatOptionObj() {
    switch (inputBtn.attr('id')) {
      case "EQP_NO":
        return data.map(e => ({ title: e.EQP_NO, description: e.EQP_NAME, value: e.EQP_SID }));
      case "EQP_STATUS":
        return data.map(e => ({ title: e.EQP_STATUS_CODE, description: e.EQP_STATUS_NAME, value: e.EQP_STATUS_CODE }));
      case "REASON_CODE":
        return data.map(e => ({ title: e.REASON_CODE, description: e.REASON_NAME, value: e.REASON_CODE }));
    }
  }
}

// 送出按鈕事件
$('#submit-btn').click(async function () {
  let EQP_SID = $("#EQP_NO").data('value');
  let EQP_STATUS_CODE = $("#EQP_STATUS").data('value');
  let REASON_CODE = $("#REASON_CODE").data('value');

  if (!EQP_SID) {
    alert('Please select an equipment!');
    return;
  }
  if (!EQP_STATUS_CODE) {
    alert('Please select a status!');
    return;
  }
  if (!REASON_CODE) {
    alert('Please select a reason code!');
    return;
  }

  await submit();

  async function submit() {
    const getGridURL = `${window.location.protocol}//${default_ip}/${default_Api_Name}/api/EQPStatusChange`;

    const josnBody = {
      EQP_SID,
      EQP_STATUS_CODE,
      InputUser: username,
      INPUT_FROM_NAME: 'EQP_STATUS.html',
      REASON_CODE: REASON_CODE || "",
      ATTR01: "", ATTR02: "", ATTR03: "", ATTR04: "", ATTR05: "",
      UPDATE_EQP_MASTER: true,
      COMMENT: ""
    };

    try {
      const response = await fetch(getGridURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TokenKey': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_TokenKey')
        },
        body: JSON.stringify(josnBody)
      });

      const data = await response.json();
      if (response.ok && data.result) {
        alert('Change success!');

        $("#EQP_NO").text('select equipment').data('value', '');
        $("#EQP_STATUS").text('select status').data('value', '');
        $("#REASON_CODE").text('select reason code').data('value', '');

        eqpList = (await getGridData(eqpListSID)).Grid_Data;
        SetGrid(eqpList); // ✅ 重新初始化並套用格式邏輯
      } else {
        alert(data.Msg || 'Error!');
      }
    } catch (error) {
      alert('Error!');
    }
  }
});


// 初始化 DataTable
// 自訂排序邏輯：讓 "NOT CHANGE" 排在最後
$.fn.dataTable.ext.type.order['custom-datetime-pre'] = function (d) {
  if (d === 'NOT CHANGE') return -Infinity;
  return new Date(d).getTime() || -Infinity;
};
function SetGrid(griddata) {
  try {
    const dataSet = griddata.map(e => ({
      EQP_NO: e?.EQP_NO,
      STATUS: e?.STATUS,
      EQP_STATUS_NAME: e?.EQP_STATUS_NAME,
      REASON_CODE: e?.REASON_CODE,
      REASON_NAME: e?.REASON_NAME,
      CHANGE_TIME: e?.CHANGE_TIME
        ? e?.CHANGE_TIME.replace('T', ' ').split('.')[0] // 只取秒之前
        : "NOT CHANGE"
    }));

    console.log(dataSet)

    const table = $("#eqp-status-table").DataTable({
      data: dataSet,
      columns: [
        { title: "EQP_NO", data: "EQP_NO" },
        {
          title: "EQP Status Code(name)", data: "STATUS",
          render: function (data, type, row) {
            return `${row.STATUS ?? ''} (${row.EQP_STATUS_NAME ?? ''})`;
          }
        },

        {
          title: "Reason Code(name)", data: "REASON_NAME",
          render: function (data, type, row) {
            if (row.REASON_CODE === 'NOT CHANGE') {
              return row.REASON_CODE
            }

            return row.REASON_CODE + " (" + row.REASON_NAME + ")"
          }

        },
        { title: "CHANGE_TIME", data: "CHANGE_TIME" }
      ],
      columnDefs: [
        {
          targets: 3,
          type: 'custom-datetime'
        }
      ],
      order: [[0, 'asc']],
      destroy: true,
      stateSave: false,
      autoWidth: false,
      dom: 'rtp',
      paging: true,
      pageLength: 10,
      scrollX: true,
      scrollY: "1000px",
      createdRow: function (row, data, dataIndex) {
        if (data.STATUS === 'PowerOff') {
          $(row).css('background-color', '#f8d7da');
        } else if (data.STATUS === 'Idle') {
          $(row).css('background-color', '#fff3cd');
        } else if (data.STATUS === 'Run') {
          $(row).css('background-color', '#d4edda');
        } else {
          $(row).css('background-color', '#ffffff'); // 白色
        }
      }
    });

    return table;
  } catch (error) {
    console.error("資料表錯誤：", error);
  }
}

// function SetGrid(griddata) {
//   try {
//     const dataSet = griddata.map(e => ({
//       EQP_NO: e.EQP_NO,
//       NOW_STSTUS: e.NOW_STSTUS,
//       CHANGE_STATUS: e.CHANGE_STATUS,
//       REASON_NAME: e.REASON_NAME,
//       CHANGE_TIME: e.CHANGE_TIME
//         ? e.CHANGE_TIME.replace('T', ' ')  // 將 T 換成空格
//         : "NOT CHANGE"
//     }));



//     const table = $("#eqp-status-table").DataTable({
//       data: dataSet,
//       columns: [
//         { title: "EQP_NO", data: "EQP_NO" },
//         { title: "NOW_STSTUS", data: "NOW_STSTUS" },
//         { title: "EQP Status Code", data: "CHANGE_STATUS" },
//         { title: "Reason Code(name)", data: "REASON_NAME" },
//         { title: "CHANGE_TIME", data: "CHANGE_TIME" }
//       ],
//       columnDefs: [
//         {
//           targets: 4,
//           type: 'custom-datetime'
//         }
//       ],
//       order: [[4, 'desc']],
//       destroy: true,
//       stateSave: false,
//       autoWidth: false,
//       dom: 'rtp',
//       paging: true,
//       pageLength: 10,
//       scrollX: true,
//       scrollY: "1000px",
//       createdRow: function (row, data, dataIndex) {
//         if (data.NOW_STSTUS === 'PowerOff') {
//           $(row).css('background-color', '#f8d7da');
//         } else if (data.NOW_STSTUS === 'Idle') {
//           $(row).css('background-color', '#fff3cd');
//         } else if (data.NOW_STSTUS === 'Run') {
//           $(row).css('background-color', '#d4edda');
//         }
//       }
//     });

//     return table;
//   } catch (error) {
//     console.error("資料表錯誤：", error);
//   }
// }
