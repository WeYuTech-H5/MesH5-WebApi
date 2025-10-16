jQuery(function($){
    $(document).ajaxSend(function() {
      $("#progress,#loading").fadeIn(100);
    });
          
    
      $.ajax({
        type: 'GET',
        success: function(data){
        }
      }).done(function() {
        setTimeout(function(){
          $('body').removeClass("scoll_dis"); //loading結束後 關閉(鎖定滾動條)
          $("#progress,#loading").fadeOut(600); //loading結束後 隱藏(loading畫面)
        },500);
      });
    });	