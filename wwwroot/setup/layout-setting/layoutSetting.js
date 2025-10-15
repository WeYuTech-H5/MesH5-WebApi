import { LayoutObject } from "./LayoutObject.js";

window.objectCollection = []

// URL取參
let currentURL = new URL(window.location.href);
let URLparams = new URLSearchParams(currentURL.search);
let action = URLparams.get('action').toLowerCase();
let SID = URLparams.get('SID');
$("#actionType").text(action === "edit" ? "編輯" : "新增")

let MODULE_TYPE = URLparams.get('MODULE_TYPE');
let LEVEL = URLparams.get('LEVEL');
let MODULE_NAME = URLparams.get('MODULE_NAME');
let BUTTON = URLparams.get('BUTTON');
$("#backButton").click(()=>GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON))

$(document).ready(async function () {
  $('#fileInput').on('change', function (event) {
    const file = event.target.files[0];

    if (file) {
      // 將圖片顯示在預覽區域
      const reader = new FileReader();
      reader.onload = function (e) {

        $('#imagePreview').find('.bg-img').replaceWith(
          `<img src="${e.target.result}" class="w-100 h-auto bg-img">`
        );
      };
      reader.readAsDataURL(file);

      // 保存檔案
      window.imgFile = file
    }
    else {
      if (window.imgFile) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(window.imgFile);
        fileInput.files = dataTransfer.files;
        console.log('重新設定為先前選擇的檔案');
      }
    }


  });

  $('#addObject').on('click',createObject)
  $('#submitButton').on('click',()=>{
    action === 'add'
      ? saveLayout()
      : action === 'edit'
      ? editLayout()
      : null
  })

  if(action === "edit"){
    loadLayout()
    $("#deleteButton").removeClass('d-none')
    $("#deleteButton").click(()=>deleteLayout())
  }
});

function createObject() {
  objectCollection.push(new LayoutObject({
    containerId: "#imagePreview",
    objectName: "object",
    width: 120,
    height: 60,
    xAxis: 0,
    yAxis: 0,
    zIndex: 0,
    opacity: 1,
    relationTable: "",
    mappingItems: [],
    canEdit:true
  }))
}

function saveLayout() {
  const data = {
    LOGIN_USER: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo'),
    BACKGROUND_IMAGE: document.querySelector("#fileInput").files[0],
    REFRESH_TIME: "60",
    LAYOUT_SID: SID,
    LAYOUT_CODE: $("#layoutCode").val(),
    LAYOUT_NAME: $("#layoutName").val(),
    ADD_LIST: objectCollection.map(object => object.toData())
  };

  const formData = jsonToFormData(data)
  console.log(formData)

  // 顯示 Loading 畫面
  Swal.fire({
    title: '資料上傳中',
    text: '請稍候...',
    allowOutsideClick: false, // 禁止點擊背景關閉
    showConfirmButton: false, // 隱藏確認按鈕
    didOpen: () => {
      Swal.showLoading(); // 顯示 Loading 動畫
    }
  });
  fetch(`${window.location.protocol}//${default_ip}/${default_Api_Name}/api/ADD_LAYOUT`, {
    method: 'POST',
    headers: {
      'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`),
    },
    body: formData
  })
    .then(response => response.json())
    .then(result => {
      console.log(result)
      // 成功回應後，關閉 Loading 並顯示結果
      Swal.close(); // 關閉載入視窗
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '資料已新增！'
      }).then(()=>{
        window.location.href = window.location.origin + window.location.pathname + `?action=edit&SID=${result.LAYOUT_SID}`;
      });
  
      console.log('Success:', result);
    })
    .catch(error => {
      // 請求失敗時，關閉 Loading 並顯示錯誤訊息
      Swal.close(); // 關閉載入視窗
      Swal.fire({
        icon: 'error',
        title: '發生錯誤',
        text: '無法新增資料，請稍後再試。',
      });
  
      console.error('Error:', error);
    });
}

function editLayout() {
  const objectData = objectCollection.map(object => object.toData())
  const editData = objectData.filter(obj => obj.enable)
  const deleteData = objectData.filter(obj => !obj.enable && obj.DETAIL_LAYOUT_SID).map(obj => obj.DETAIL_LAYOUT_SID)
  const data = {
    LOGIN_USER: localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo'),
    BACKGROUND_IMAGE: document.querySelector("#fileInput").files[0],
    REFRESH_TIME: "60",
    LAYOUT_SID: SID,
    LAYOUT_CODE: $("#layoutCode").val(),
    LAYOUT_NAME: $("#layoutName").val(),
    EDIT_LIST: editData,
    DELETE_LIST: deleteData
  };
  console.log(data)

  const formData = jsonToFormData(data)
  console.log(formData)

  // 顯示 Loading 畫面
  Swal.fire({
    title: '資料上傳中',
    text: '請稍候...',
    allowOutsideClick: false, // 禁止點擊背景關閉
    showConfirmButton: false, // 隱藏確認按鈕
    didOpen: () => {
      Swal.showLoading(); // 顯示 Loading 動畫
    }
  });
  fetch(`${window.location.protocol}//${default_ip}/${default_Api_Name}/api/EDIT_LAYOUT`, {
    method: 'PUT',
    headers: {
      'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`),
    },
    body: formData
  })
    .then(response => response.json())
    .then(result => {
      console.log(result)
      // 成功回應後，關閉 Loading 並顯示結果
      Swal.close(); // 關閉載入視窗
      Swal.fire({
        icon: 'success',
        title: '成功',
        text: '資料已更新！'
      });
  
      console.log('Success:', result);
    })
    .catch(error => {
      // 請求失敗時，關閉 Loading 並顯示錯誤訊息
      Swal.close(); // 關閉載入視窗
      Swal.fire({
        icon: 'error',
        title: '發生錯誤',
        text: '無法更新資料，請稍後再試。',
      });
  
      console.error('Error:', error);
    });
}

function jsonToFormData(data) {
  const formData = new FormData();

  // 递归加入数据
  function appendFormData(formData, key, value) {
    if (key === 'BACKGROUND_IMAGE' && !value){
      // 如果沒有選擇圖片 則不進行任何動作
      console.log('未選擇圖片')
    } else if (value instanceof File) {
      // 如果值是 File 类型，直接加入 FormData
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      // 如果值是数组，递归处理
      value.forEach((item, index) => {
        appendFormData(formData, `${key}[${index}]`, item);
      });
    } else if (typeof value === "object" && value !== null) {
      // 如果值是对象，递归处理
      Object.keys(value).forEach(subKey => {
        appendFormData(formData, `${key}[${subKey}]`, value[subKey]);
      });
    } else {
      // 其他情况直接加入 FormData
      formData.append(key, value);
    }
  }

  // 将数据加入 FormData
  Object.keys(data).forEach(key => {
    appendFormData(formData, key, data[key]);
  });

  // 验证 FormData 的内容（可选）
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  return formData;
}


function loadLayout(){
  fetch(`${window.location.protocol}//${default_ip}/${default_Api_Name}/api/QUERY_LAYOUT?LOGIN_USER=${localStorage.getItem(PROJECT_SAVE_NAME+'_BI_accountNo')}&LAYOUT_SID=${SID}`, {
    method: 'GET',
    headers: {
      'TokenKey': localStorage.getItem(`${PROJECT_SAVE_NAME}_BI_TokenKey`),
    },
  })
    .then(response => response.json())
    .then(data => {
      // Master資訊
      const filePath = data.BACKGROUND_IMAGE;
      const relativePath = filePath.replace(/^C:\\inetpub\\wwwroot\\/, "").replace(/\\/g, "/");
      const imgUrl = `${window.location.protocol}//${default_ip}/${relativePath}`
      $('#imagePreview').html(`<img src="${imgUrl}" class="w-100 h-auto bg-img">`);
      $("#LAYOUT_SID").val(data.LAYOUT_SID)
      $("#layoutCode").val(data.LAYOUT_CODE)
      $("#layoutName").val(data.LAYOUT_NAME)

      // Object資訊
      data.ADD_LIST.forEach((object)=>{
        const objProps = {
          sid:object.DETAIL_LAYOUT_SID,
          containerId: "#imagePreview",
          objectName: object.OBJECT_NAME,
          width: object.WIDTH,
          height: object.HIGH,
          xAxis: object.X,
          yAxis: object.Y,
          zIndex: object.ZINDEX,
          opacity: object.OPACITY,
          relationTable: object.TABLE_NAME,
          mappingItems: object.ITEM_LIST.map((item)=>{
            // Item資訊
            return {
              sid: item.SID,
              label: item.ITEM,
              field: item.VALUE,
              condition: item.QUERY,
            }
          }),
          canEdit:true
        }
        objectCollection.push(new LayoutObject(objProps))
      })
    })
    .catch(error => {
      console.error('Error:', error);
    });


}

async function deleteLayout(){
  const yes = await customConfirm("確定要刪除layout資料嗎?")
  if(yes){
    fetch(`${window.location.protocol}//${default_ip}/${default_Api_Name}/api/DELETE_LAYOUT`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'SID': SID,
        'LOGIN_USER': localStorage.getItem(PROJECT_SAVE_NAME + '_BI_accountNo')
      }),
    })
      .then(response => response.json())
      .then(async(data) => {
        console.log('Success:', data);
        await customAlertSuccess("Layout已刪除")
        window.location.href = window.location.origin + window.location.pathname + "?action=add";
      })
      .catch(async(error) => {
        customAlertError(error)
        console.error('Error:', error);
      });
  }
}