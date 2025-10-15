let eqpListSID = '349540422190761' // EQP綁定中WO
let eqpList;

const urlParams = new URLSearchParams(window.location.search);
const DEPT_NO = urlParams.get('DEPT_NO');
$("#DEPARTMENT").text(DEPT_NO)
//返回紐
$('#backButton').click(function () {
  window.location.href = window.location.protocol + '//' + default_ip + '/' + PROJECT_NAME + "/" + kanbanRoute + '/MES-WIP/setup/wip-query.html?SID=347301502426686&MODULE_TYPE=MES-WIP&MODULE_NAME=WIP_OPI&LEVEL=L2&BUTTON=A&DEPT_NO=' + DEPT_NO
})



$(document).ready(async function () {
  await initChartConfig();
  eqpList = (await getGridData(eqpListSID)).Grid_Data.filter((e) => e.EQP_TYPE === DEPT_NO && !e.WO);
  $("#progress,#loading").fadeOut(600) //API請求結束後關閉Loading frame

 
});