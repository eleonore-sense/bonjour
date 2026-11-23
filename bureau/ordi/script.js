function ajuster_ecran(){
  var largeur = Math.min(900, window.innerHeight * 0.65 * 1.6);
  var zoom = largeur / 1440;
  $(".cadre_site").css("width", largeur);
  $(".ecran_site").css({ "width": largeur, "height": 900 * zoom });
  $(".ecran_site iframe").css("transform", "scale(" + zoom + ")");
}

$(window).on("resize", ajuster_ecran);


$(document).ready(function(){

  $(".declencheur").dblclick(function(){
$(".pop_up").css("display", "none");
$(".vers_projet").css("display", "none");
  });

  $("#declencheur_dauphin").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_dauphin").css("opacity", "0.4");
  });

  $("#declencheur_dauphin").dblclick(function(){
$("#pop_up_dauphin").css("display", "block");
  });

  $("#fermer_dauphin").click(function(){
$("#pop_up_dauphin").css("display", "none");
$("#declencheur_dauphin").css("opacity", "0");
  });



  $("#declencheur_case_game").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_case_game").css("opacity", "0.4");
  });

  $("#declencheur_case_game").dblclick(function(){
$("#pop_up_case_game").css("display", "block");
  });

  $("#fermer_case_game").click(function(){
$("#pop_up_case_game").css("display", "none");
$("#declencheur_case_game").css("opacity", "0");
  });



  $("#declencheur_genre").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_genre").css("opacity", "0.4");
  });

  $("#declencheur_genre").dblclick(function(){
$("#pop_up_genre").css("display", "block");
  $("#vers_genre").css("display", "block"); 
  });

  $("#fermer_genre").click(function(){
$("#pop_up_genre").css("display", "none");
$("#declencheur_genre").css("opacity", "0");
  $("#vers_genre").css("display", "none"); 
  });







  $("#declencheur_encrypteur").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_encrypteur").css("opacity", "0.4");
  });

  $("#declencheur_encrypteur").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_encrypteur").css("display", "block");
  });

  $("#fermer_encrypteur").click(function(){
$("#pop_up_encrypteur").css("display", "none");
$("#declencheur_encrypteur").css("opacity", "0");
  });





  $("#declencheur_messagerie").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_messagerie").css("opacity", "0.4");
  });

  $("#declencheur_messagerie").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_messagerie").css("display", "block");
$("#vers_messagerie").css("display", "block");
  });

  $("#fermer_messagerie").click(function(){
$("#pop_up_messagerie").css("display", "none");
$("#declencheur_messagerie").css("opacity", "0");
$("#vers_messagerie").css("display", "none");
  });





  $("#declencheur_dans_les_brumes").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_dans_les_brumes").css("opacity", "0.4");
  });

  $("#declencheur_dans_les_brumes").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_dans_les_brumes").css("display", "block");
  $("#vers_brume").css("display", "block");
});

  $("#fermer_dans_les_brumes").click(function(){
$("#pop_up_dans_les_brumes").css("display", "none");
$("#declencheur_dans_les_brumes").css("opacity", "0");
  $("#vers_brume").css("display", "none");
});



  $("#declencheur_chimere").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_chimere").css("opacity", "0.4");
  });

  $("#declencheur_chimere").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_chimere").css("display", "block");
$("#vers_chimere").css("display", "block");
$("#img_chimere")[0].play();
  });

  $("#fermer_chimere").click(function(){
$("#pop_up_chimere").css("display", "none");
$("#declencheur_chimere").css("opacity", "0");
  $("#vers_chimere").css("display", "none");
$("#img_chimere")[0].pause();
});




  $("#declencheur_electro_magneto_cool").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_electro_magneto_cool").css("opacity", "0.4");
  });

  $("#declencheur_electro_magneto_cool").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_electro_magneto_cool").css("display", "block");
$("#vers_electro_magneto_cool").css("display", "block");
ajuster_ecran();
  });
  $("#fermer_electro_magneto_cool").click(function(){
$("#pop_up_electro_magneto_cool").css("display", "none");
$("#declencheur_electro_magneto_cool").css("opacity", "0");
$("#vers_electro_magneto_cool").css("display", "none");
  });




  $("#declencheur_ele").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_ele").css("opacity", "0.4");
  });

  $("#declencheur_ele").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_ele").css("display", "block");
  });

  $("#fermer_ele").click(function(){
$("#pop_up_ele").css("display", "none");
$("#declencheur_ele").css("opacity", "0");
  });



  $("#declencheur_poubelle").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_poubelle").css("opacity", "0.4");
  });

  var bureau = 0;

  function changer_bureau(){
bureau++;
if (bureau > 2) { bureau = 0; }
$("#fond").removeClass("bureau2 bureau3");
$(".objet").css("display", "none");
$("#declencheur_poubelle").css("opacity", "0");
if (bureau == 1) {
$("#fond").addClass("bureau2");
$(".objet2").css("display", "block");
$("#range_bureau").css("display", "block");
$("#changer_bureau").text("→ changer de bureau");
}
if (bureau == 2) {
$("#fond").addClass("bureau3");
$(".objet3").css("display", "block");
$("#changer_bureau").text("→ retour au bureau principal");
}
if (bureau == 0) {
$("#range_bureau").css("display", "none");
}
  }

  $("#declencheur_poubelle").dblclick(function(){
$(".pop_up").css("display", "none");
changer_bureau();
  });

  $("#changer_bureau").click(function(){
changer_bureau();
  });








  $("#declencheur_ensorceleuse").mouseover(function(){
$("#img_ensorceleuse").css("display", "block");
  });

  $("#declencheur_ensorceleuse").mouseleave(function(){
$("#img_ensorceleuse").css("display", "none");
  });



  

$( "#go_to_fleur" ).on( "click", function() {
$("#case_game_tete").css("display", "none");
$("#case_game_fleur").css("display", "block");
} );



$( "#go_to_fleche" ).on( "click", function() {
$("#case_game_fleur").css("display", "none");
$("#case_game_fleche").css("display", "block");
} );

$( "#go_to_voiture" ).on( "click", function() {
$("#case_game_fleche").css("display", "none");
$("#case_game_voiture").css("display", "block");
} );


$( "#go_to_chien" ).on( "click", function() {
$("#case_game_voiture").css("display", "none");
$("#case_game_chien").css("display", "block");
} );

$( "#go_to_s" ).on( "click", function() {
$("#case_game_chien").css("display", "none");
$("#case_game_s").css("display", "block");
} );

});



  $( function() {
    $( ".objet, #filtre1, #filtre2" ).draggable({
      stack: ".objet",
      start: function(event, ui) {
        var tout = document.getElementById("tout");
        $(this).data("depart", [event.pageX, event.pageY, parseFloat($(this).css("left")), parseFloat($(this).css("top")), tout.getBoundingClientRect().width / tout.offsetWidth]);
      },
      drag: function(event, ui) {
        var d = $(this).data("depart");
        ui.position.left = d[2] + (event.pageX - d[0]) / d[4];
        ui.position.top = d[3] + (event.pageY - d[1]) / d[4];
        if ($(this).hasClass("objet")) {
                    var a = this.getBoundingClientRect();
          var b = document.getElementById("declencheur_poubelle").getBoundingClientRect();
          if (a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom) {
            $("#declencheur_poubelle").css("opacity", "0.4");
          } else {
            $("#declencheur_poubelle").css("opacity", "0");
          }
          var zone = document.getElementById("zone_objets");
          ui.position.left = Math.min(Math.max(ui.position.left, zone.offsetLeft), zone.offsetLeft + zone.offsetWidth - this.offsetWidth);
          ui.position.top = Math.min(Math.max(ui.position.top, zone.offsetTop), zone.offsetTop + zone.offsetHeight - this.offsetHeight);
        }
      },
      stop: function(event, ui) {
        var a = this.getBoundingClientRect();
        var b = document.getElementById("declencheur_poubelle").getBoundingClientRect();
        if ($(this).hasClass("objet") && a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom) {
          $(this).hide();
                    $("#declencheur_poubelle").css("opacity", "0");
        }
      }
    });
  } );