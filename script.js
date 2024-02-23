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
    };

function quitter_magie(){
$("#photo").css("background-image", "none");
    };





function tel(){
$("#photo").css("background-image", "url(bureau/tel.png)");
    };

function quitter_tel(){
$("#photo").css("background-image", "none");
    };




function lampe(){
$("#photo").css("background-image", "url(bureau/lampe.jpg)");
    };

function quitter_lampe(){
$("#photo").css("background-image", "none");
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