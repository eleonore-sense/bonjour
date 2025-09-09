var message = new Array();
message[0] = ""
var reps = 2;
var speed = 2000;
var p = message.length;
var T = "";
var C = 0;
var mC = 0;
var s = 0;
var sT = null;
if (reps < 1) reps = 1;
function doIt() {
T = message[mC];
A();
}
function A() {
s++;
if (s > 8) { s = 1;}
if (s == 1) { document.title = '↗↗↗↗↗↗↗ ceci ↗↗↗↗↗↗'; }
if (s == 2) { document.title = '⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢⇢'; }
if (s == 3) { document.title = '↝↝↝↝↝ est un site ↝↝↝↝↝'; }
if (s == 4) { document.title = '⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝⇝'; }
if (s == 5) { document.title = '↠↠↠ pour alex ↠↠↠'; }
if (s == 6) { document.title = '↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯↯'; }
if (s == 7) { document.title = '↬ de élé ↫'; }

if (s == 8) { document.title = '☺⇼☻⇼☺⇼☻⇼☺⇼☻⇼☺⇼☻⇼☺⇼☻⇼☺'; }if (C < (8 * reps)) {
sT = setTimeout("A()", speed);
C++;
}
else {
C = 0;
s = 0;
mC++;
if(mC > p - 1) mC = 0;
sT = null;
doIt();
   }
}
doIt();







 $( window ).on( "load", function() {

});







function bouton_go(){
$("#fond_blanc").css("display", "none");
$("#pop_up_accueil").css("display", "none");  
}



var startDateTime = new Date(2024, 1, 16, 11, 0, 0, 0); // YYYY (M-1) D H m s (start time and date from DB)
var startStamp = startDateTime.getTime();

var newDate = new Date();
var newStamp = newDate.getTime();

var timer;

function updateClock() {
  newDate = new Date();
  newStamp = newDate.getTime();
  var diff = Math.round((newStamp - startStamp) / 1000);

var year = (newDate.getYear()) - 94;
  
   var v = Math.floor(diff / (30.4167 * 24 * 60 * 60));
  diff = diff - (v * 30.4167 * 24 * 60 * 60)
  
  var d = Math.floor(diff / (24 * 60 * 60));
  diff = diff - (d * 24 * 60 * 60);
  
  var h = Math.floor(diff / (60 * 60));
  diff = diff - (h * 60 * 60);
  
  var m = Math.floor(diff / (60));
 
  diff = diff - (m * 60);
  var s = Math.round(diff);

  document.getElementById("time-elapsed").innerHTML = " Joyeux " + year + " ans, " + v + " mois, " +d + " jours, " + h + " heures, " + m + " minutes et " + s + " secondes d'anniversaire!";
}

setInterval(updateClock, 1000);