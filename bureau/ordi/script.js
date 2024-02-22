$(document).ready(function(){
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
  $("#vers_brume").css("display", "none");  });





  $("#declencheur_diploramax").click(function(){
$(".declencheur").css("opacity", "0");
$("#declencheur_diploramax").css("opacity", "0.4");
  });

  $("#declencheur_diploramax").dblclick(function(){
$(".pop_up").css("display", "none");
$("#pop_up_diploramax").css("display", "block");
$("#vers_diploramax").css("display", "block");
  });

  $("#fermer_diploramax").click(function(){
$("#pop_up_diploramax").css("display", "none");
$("#declencheur_diploramax").css("opacity", "0");
  $("#vers_diploramax").css("display", "none");
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
    $( "#filtre1" ).draggable();
  } );

    $( function() {
    $( "#filtre2" ).draggable();
  } );