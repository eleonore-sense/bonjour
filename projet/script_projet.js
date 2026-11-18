
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




     ///////////////////CHARGEMENT VIDEO////////////////////////////





var x = 0;
function afficher(){
  var fichier = 'img/' + image[x];
  var video = document.getElementById('video');
  var img = document.getElementById('image_projet');

  if (!img) {
    $('#photo').css('background-image', 'url("' + fichier + '")');
    return;
  }

  var sans = (typeof sans_cadre !== 'undefined') && sans_cadre.indexOf(image[x]) !== -1;
  var sans_b = (typeof sans_bandeau !== 'undefined') && sans_bandeau.indexOf(image[x]) !== -1;
  $('#cadre').toggleClass('sans_cadre', sans);
  $('#cadre').toggleClass('sans_bandeau', sans_b);

  if (fichier.endsWith('.mp4')) {
    img.style.display = 'none';
    img.removeAttribute('src');
    video.src = fichier;
    video.style.display = 'block';
    video.play();
  } else {
    video.pause();
    video.removeAttribute('src');
    video.style.display = 'none';
    img.src = fichier;
    img.style.display = 'block';
  }
}

function next_img(){
  if (x < image.length-1){ x = x+1; } else { x = 0; }
  afficher();
}

function prev_img(){
  if (x >= 1){ x = x-1; } else { x = image.length-1; }
  afficher();
}

$(function () {
  if (typeof image !== 'undefined') afficher();
});