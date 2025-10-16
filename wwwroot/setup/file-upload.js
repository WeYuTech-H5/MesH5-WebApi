

    var Request = {};
    var getUrlParameter = function getUrlParameter() {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
        var par = {};
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            par[sParameterName[0]] = sParameterName[1]
        }
        return par;
    };
    Request = getUrlParameter();
    var PROJECT_TYPE = Request["PROJECT_TYPE"] || ""; // PROJECT類型  (PRJ、QC ... etc) 後臺存取 資料夾位置  如: UploadFiles\PRJ
    var PROJECT_CODE_SID = Request["PROJECT_CODE_SID"]  || ""; // 屬於哪一個類型 (By專案來說 就要給 專案名 的SID ; 人來說 給人的名 SID)  *避免改名  如 MINTECH 改成 MINTECH2
    var MSID = Request["MSID"]  || ""; //智能查詢之該筆資料sid   (用於顯示底下 曾上傳檔案的 資訊)
    var FILE_LINK_SID = Request["FILE_LINK_SID"]  || ""; //智能查詢之該筆資料sid   (用於顯示底下 曾上傳檔案的 資訊)
    var MODEL_NAME = Request["MODEL_NAME"];
    //backUrl參數
    var LEVEL = Request["LEVEL"] || null;
    var MODULE_NAME = Request["MODULE_NAME"] || null;
    var BUTTON = Request["BUTTON"] || null;
    // 使用decodeURIComponent()来解码特殊字符
    MODEL_NAME = decodeURIComponent(MODEL_NAME);

    function LoadTextValue(){

      //取得時間區間
      //先創建一個Date實體
      var time = new Date();
    
      //獲取當前時間(取得的值為一個毫秒数值)
      
      year = time.getFullYear();
      // month = time.getMonth() + 1;
      month = (time.getMonth() + 1) < 10 ? '0'+(time.getMonth() + 1) : (time.getMonth() + 1);
      
      // date = time.getDate();
      date = time.getDate()  < 10 ? '0'+time.getDate() : time.getDate();
  
      // hour = time.getHours();
      hour = time.getHours()  < 10 ? '0'+time.getHours()  : time.getHours() ;
  
      // minute = time.getMinutes();
      minute = time.getMinutes() < 10 ? '0'+time.getMinutes() : time.getMinutes();
  
      // second = time.getSeconds();
      second = time.getSeconds() <10 ? '0'+time.getSeconds() : time.getSeconds();
  
  
      $('#suffix').val(year+month+date+hour+minute+second);
      $('#prefix').val('');//公版不用前贅詞


  
  }
  
  LoadTextValue();





// 2023-05-02 多筆上傳
let fileUploader = document.querySelector('[data-target="file-uploader"]');
fileUploader.addEventListener("change", handleFileUpload);

var fileData = [];
async function handleFileUpload(e) {
  fileData = [];

  try {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (containsForbiddenCharacters(file.name)) {
        alert("檔案名稱包含禁止字符：%、# 或 + ：" + file.name);
        continue; // 跳过该文件
      }
      fileData.push(file);
    }
 
    $('#messageFile').html('暫存檔案名稱：' + fileData.map(file => file.name).join(', '));
   
  } catch (error) {
    alert(error);
    console.log("Catch Error: ", error);
  } finally {
    e.target.value = '';  // 重置文件输入框
  }
}


function containsForbiddenCharacters(fileName) {
  // 使用正则表达式检查文件名是否包含 %、# 或 +（半角或全角）
  const forbiddenCharactersRegex = /[%％#+＃＋]/;
  return forbiddenCharactersRegex.test(fileName);
}



function Upload(){

  if(typeof(fileData)=='undefined'){
      $('#message').html('尚未上傳檔案')
  }
  else{
      // 第二個資料物件
      var data2 = {
        prefix: $('#prefix').val(),
        suffix: $('#suffix').val(),
        userName : localStorage.getItem(PROJECT_NAME+'_userName'),
        MODEL_NAME: MODEL_NAME,
        MASTER_SID : MSID, //哪個智能查詢來的 
        FILE_LINK_SID : FILE_LINK_SID, //綁定哪一筆資料 做了 檔案上傳
        PROJECT_TYPE : PROJECT_TYPE,
        PROJECT_CODE_SID : PROJECT_CODE_SID
      };

      var formData = new FormData();

        formData.append('data2', JSON.stringify(data2));

        for (let i = 0; i < fileData.length; i++) {
        let file = fileData[i];
        formData.append('file[]', file, file.name);
        }

      $.ajax({
        url: window.location.protocol+'//localhost/DCMATEV4/UploadFiles/UploadFileHandler.ashx',
        contentType: false,
        async: false,
        type: "POST",
        cache: false,
        processData: false,
        data: formData,
        headers: {
          'ActionMode': 'Upload', // 以自定义标头名和值的方式添加标头
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $('#message').html("FAIL: " + errorThrown)
          // alert("FAIL: " + errorThrown);
        },
        success: function (data, textStatus, jqXHR) {
          //var response = JSON.parse(data);
          var response = data;
          if (response.status === 'success') {
            $('#message').html(response.message)
              //alert(response.message);
          } else {
            //alert("FAIL: " + response.message);
            $('#message').html("FAIL: " + response.message)

          }
      }

      })

      LoadTextValue();

      //Reset
      $('#messageFile').html('暫存檔案名稱：')
      fileData = new FormData();

      LoadImgData();//刷新link
  }

}

function LoadImgData(){

  var sid = "335551827690052";
  var Structer;
  var data;

  $.ajax({
    type: 'GET',
    url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportHandlerV3.ashx?DataType=QueryReport&SID='+sid,
    async: false,
    success: function (msg) {
    var jsonObj = jQuery.parseJSON(msg.replace(/\~/g, "\""));
                    jsonObj.MasterSql = jsonObj.MasterSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    jsonObj.AddedSql = jsonObj.AddedSql.replace(/>+/g, "#bt").replace(/<+/g, "#lt");
                    Structer = jsonObj
    }
  });
  // Structer.MasterSql = Structer.MasterSql.replace('{CON}',"DETAIL_SID='"+FILE_LINK_SID+"' AND {CON}");

    $.ajax({
    type: 'post',
    url:window.location.protocol+'//' + default_ip + '/' + default_WebSiteName + '/QueryAndReport/QueryReportDataHandler4FullScreen.ASHX?DataType=Grid&DBLink=SELF',
    data: {Charts: JSON.stringify(Structer.Charts),SQL: Structer.MasterSql,AddedSQL:Structer.AddedSql, Conds:  JSON.stringify(Structer.Conditions), GridFieldType: JSON.stringify(Structer.GridFieldType) ,
    SID:+sid,rows:100},
    async: false,
    success: function (msg) {
        msg = TransSpecialChar(msg);

    var jsonObj = jQuery.parseJSON(msg);
        data = jsonObj;
    }
  });

var tmphtml = "";

  if(data.rows.length>0){

      for(var i=0;i<data.rows.length;i++){

        tmphtml +='<tr>';
        tmphtml += '<td class="zztd"><a href="'+data.rows[i].WEB_FILE_PATH+'" target="_blank">'+data.rows[i].FILE_NAME+'</a></td>';
        tmphtml += '<td class="zztd">' +data.rows[i].CREATE_USER+'</td>';
        tmphtml += '<td class="zztd">' +data.rows[i].CREATE_TIME+'</td>';
        tmphtml += '</tr>';

      }

  }
  else{

  tmphtml =  '<td colspan="3" style="text-align: center;">No Data</td>'

  }
  
  $('#body1').html(tmphtml);

}

LoadImgData();

let backButton = document.getElementById("backButton");

// 添加点击事件处理程序
backButton.addEventListener("click", function() {

    GoBack(LEVEL,MODULE_NAME,BUTTON);
});
