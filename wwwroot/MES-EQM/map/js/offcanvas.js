$(window).scroll(function() {    
  var scroll = $(window).scrollTop();
  if (scroll <= 0)  {myFunction2()} else {myFunction()}        
})

function myFunction() {
  $('#colors').css('top','0');
}
function myFunction2() {
  $('#colors').css('top','20px');
}

$(function () {
  'use strict'

  $('[data-toggle="offcanvas"]').on('click', function () {
    $('.offcanvas-collapse').toggleClass('open')
    $('body').toggleClass('fixed')
  })
})
