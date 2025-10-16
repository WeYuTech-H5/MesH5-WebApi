LoadMask();
function LoadMask() {

    var boarddiv = "";


    boarddiv += '<div id="divLoading" class="overlay"  style="visibility:hidden">';
    boarddiv += '<div class="loader">';
    boarddiv += '';
    boarddiv += '</div>';
    boarddiv += '</div>';
    document.querySelector("body").innerHTML += boarddiv;
  
    ShowElement("divLoading");
  

    $(document).ajaxStart(function () {
        focusID = $("input:focus").attr('id');
        ShowElement("divLoading");
    });

    $(document).ajaxComplete(function () {
      
        hideElement("divLoading");
    });

    //超過一分鐘一定關閉遮罩
    setTimeout(function () {
        hideElement("divLoading");
    }, 60000);

}


function hideElement(id) {
    document.getElementById(id).style.visibility = 'hidden ';
    document.getElementById(id).hidden = true;
}

function ShowElement(id) {
    document.getElementById(id).style.visibility = 'visible ';
    document.getElementById(id).hidden = false;
}
