    $( window ).on( "load", function() {
    if (sessionStorage.getItem("bonjour") == "slt") {
$("#fond_blanc").css("display", "none");
$("#pop_up_accueil").css("display", "none");
    }else{
$("#fond_blanc").css("display", "block");
$("#pop_up_accueil").css("display", "block");
}});







function bouton_go(){
$("#fond_blanc").css("display", "none");
$("#pop_up_accueil").css("display", "none");  
sessionStorage.setItem("bonjour", "slt");  
}



    function gateau(){
$("#photo").css("background-image", "url(bureau/cookie.png)");
    };

function quitter_gateau(){
$("#photo").css("background-image", "none");
    };




function ordi(){
$("#photo").css("background-image", "url(bureau/ordi.png)");
    };

function quitter_ordi(){
$("#photo").css("background-image", "none");
    };




function magie(){
$("#photo").css("background-image", "url(bureau/magie.png)");
$("#photo").css("margin-left", "-1.5px");
    };

function quitter_magie(){
$("#photo").css("background-image", "none");
$("#photo").css("margin-left", "0px");
    };


function aquarium(){
$("#photo").css("background-image", "url(bureau/aquarium.png)");
$("#photo").css("margin-top", "-1px");
$("#photo").css("margin-left", "-1.5px");
    };

function quitter_aquarium(){
$("#photo").css("background-image", "none");
$("#photo").css("margin-top", "0px");
$("#photo").css("margin-left", "0px");
    };



function tel(){
$("#photo").css("background-image", "url(bureau/tel.png)");
    };

function quitter_tel(){
$("#photo").css("background-image", "none");
    };




function lampe(){
$("#photo").css("background-image", "url(bureau/lampe_lave.png)");
  $("#filtre_nuit").addClass("allume");  };

function quitter_lampe(){
$("#photo").css("background-image", "none");
  $("#filtre_nuit").removeClass("allume");
    };



function tissage(){
$("#photo").css("background-image", "url(bureau/tissage.png)");
    };

function quitter_tissage(){
$("#photo").css("background-image", "none");
    };



function modem(){
$("#photo").css("background-image", "url(bureau/modem.png)");
    };

function quitter_modem(){
$("#photo").css("background-image", "none");
    };



function plante(){
$("#photo").css("background-image", "url(bureau/arbre.png)");
    };

function quitter_plante(){
$("#photo").css("background-image", "none");
    };



function radio(){
$("#photo").css("background-image", "url(bureau/radio.gif)");
    };

function quitter_radio(){
$("#photo").css("background-image", "none");
    };


function livre(){
$("#photo").css("background-image", "url(bureau/livre.png)");
    };

function quitter_livre(){
$("#photo").css("background-image", "none");
    };




function bougie(){
$("#photo").css("background-image", "url(bureau/bougie.png)");
    };

function quitter_bougie(){
$("#photo").css("background-image", "none");
    };



function journal(){
$("#visuel_journal").css("background-image", "url(bureau/journal_ouvert.png)");
    };

function quitter_journal(){
$("#visuel_journal").css("background-image", "url(bureau/journal.png)");
    };



function cle(){
$("#visuel_cle").css("background-image", "url(bureau/cle_prise.png)");
    };

function quitter_cle(){
$("#visuel_cle").css("background-image", "url(bureau/cle.png)");
    };



var pause_heure = false;

function reveil(){
  pause_heure = true;
  $('#heure').text('<3  <3');
}

function quitter_reveil(){
  pause_heure = false;
  maj_heure();
}

function maj_heure(){
  if (pause_heure) return;

  var d = new Date();
  var h = String(d.getHours()).padStart(2, '0');
  var m = String(d.getMinutes()).padStart(2, '0');
  var deux_points = d.getSeconds() % 2 ? '  ' : ' ';
  $('#heure').text(h + deux_points + m);
}

$(function () {
  maj_heure();
  setInterval(maj_heure, 1000);
});