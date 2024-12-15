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
if (s == 1) { document.title = '↗↗↗↗↗↗↗ joyeux↗↗↗↗↗↗'; }
if (s == 2) { document.title = '⇢🤶⇢🤶⇢🤶⇢🤶⇢🤶⇢🤶⇢🤶⇢🤶'; }
if (s == 3) { document.title = '↝↝↝↝↝ noël ↝↝↝↝↝'; }
if (s == 4) { document.title = '⇝🎄⇝🎄⇝🎄⇝🎄⇝🎄⇝🎄⇝🎄⇝🎄'; }
if (s == 5) { document.title = '↠↠↠ jeune ↠↠↠'; }
if (s == 6) { document.title = '↯🫶↯🫶↯🫶↯🫶↯🫶↯🫶↯🫶↯🫶↯🫶'; }
if (s == 7) { document.title = '↬ ami·e ↫'; }

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
