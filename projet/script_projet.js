
     ///////////////////////POSITION FLECHE//////////////////////////////////

$(function() {
 
  $('#gauche').mousemove(function(e) {
    var width = $("#visuel").width()*0.82;
    var height = ($("#visuel").height())*0.18;
    var x = (event.pageX)-width;
    var y = event.pageY-height;



      $('#precedent').css('top', y+'px');
    $('#precedent').css('left', x+'px');
  

});
});


     ///////////////////////POSITION FLECHE//////////////////////////////////


$(function() { 
  $('#droite').mousemove(function(e) {
    var width = ($("#visuel").width())*1.3;
    var height = ($("#visuel").height())*0.22;
    var x = e.pageX-width;
    var y = e.pageY-height;



      $('#suivant').css('top', y+'px');
      $('#suivant').css('bottom', 'auto');

    $('#suivant').css('left', x+'px');
  

});
});
