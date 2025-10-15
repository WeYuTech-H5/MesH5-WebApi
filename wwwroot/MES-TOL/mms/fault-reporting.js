$(document).ready(function () {
	const urlParams = new URLSearchParams(window.location.search);

  const MODULE_TYPE = urlParams.get('MODULE_TYPE');
	const MODULE_NAME = urlParams.get('MODULE_NAME');
	const LEVEL = urlParams.get('LEVEL');
	const BUTTON = urlParams.get('BUTTON');
	const TYPE = urlParams.get('TYPE');

	$("#backButton").click(()=>GoBack(MODULE_TYPE,LEVEL,MODULE_NAME,BUTTON))


  // 當選擇廠區時，啟用機台選項
  $("#factory").change(function () {
    if ($(this).val()) {
      $("#machine").prop("disabled", false);
    } else {
      $("#machine").prop("disabled", true).val("");
      $("#category, #reason, #description").prop("disabled", true).val("");
      $("#submitBtn").prop("disabled", true);
    }
  });

  // 當選擇機台時，啟用故障分類選項
  $("#machine").change(function () {
    if ($(this).val()) {
      $("#category").prop("disabled", false);
      $("#priority").prop("disabled", false);
    } else {
      $("#category").prop("disabled", true).val("");
      $("#reason, #description, #priority").prop("disabled", true).val("");
      $("#submitBtn").prop("disabled", true);
    }
  });

  // 當選擇故障分類時，啟用故障原因選項
  $("#category").change(function () {
    if ($(this).val()) {
      $("#reason").prop("disabled", false);
    } else {
      $("#reason").prop("disabled", true).val("");
      $("#description").prop("disabled", true).val("");
      $("#submitBtn").prop("disabled", true);
    }
  });

  // 當選擇故障原因時，啟用故障描述選項
  $("#reason").change(function () {
    if ($(this).val()) {
      $("#description").prop("disabled", false);
      $("#submitBtn").prop("disabled", false); // 啟用提交按鈕
    } else {
      $("#description").prop("disabled", true).val("");
      $("#submitBtn").prop("disabled", true);
    }
  });

  // 清除按鈕的點擊事件
  $("#resetBtn").click(function () {
    $("#reportForm")[0].reset();
    $("#machine, #priority, #category, #reason, #description, #submitBtn").prop("disabled",true);
    $("#priority").val("中"); // 重置優先序為"中"
  });

  // 提交表單
  $("#submitBtn").click(async function () {
    await customAlertSuccess("表單已提交!");
    $("#reportForm")[0].reset();
    $("#machine, #priority, #category, #reason, #description, #submitBtn").prop("disabled",true);
    $("#priority").val("中"); // 重置優先序為"中"
  });
});
