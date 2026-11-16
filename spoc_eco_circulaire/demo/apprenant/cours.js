// =====================================================================
// DONNÉES DU COURS
// Tout ce qui décrit le cours est ici : une modification s'applique
// automatiquement à toutes les pages.
// =====================================================================

const COURS = {

  // ---------------------------------------------------------------
  // Boutons ronds du menu de gauche
  // hauteurImage : optionnel, si le picto doit être plus petit
  // ---------------------------------------------------------------
  boutons: [
    { id: 'retour',       texte: "retour à l'accueil", lien: 'accueil.html', image: 'dessin/picto/maison.svg' },
    { id: 'fiche_notion', texte: 'fiches notions',     lien: '#', image: 'dessin/picto/notion.svg', hauteurImage: '28px' },
    { id: 'glossaire',    texte: 'glossaire',          lien: '#', image: 'dessin/picto/loupe.svg',  hauteurImage: '28px' },
  ],

  // ---------------------------------------------------------------
  // Les 6 étapes de la démarche d'éco-conception (chapitre 3, III)
  // pour le mini schéma en haut à droite des pages des étapes
  // (dans la page : <body data-etape="B">, ou data-etape="E F" pour deux étapes)
  // ---------------------------------------------------------------
  etapesDemarche: [
    { lettre: 'A', nom: 'avant-projet et cadrage',   dessin: 'dessin/chap_3/III/1/cadrer.svg' },
    { lettre: 'B', nom: 'analyser',                  dessin: 'dessin/chap_3/III/1/analyser.svg' },
    { lettre: 'C', nom: 'imaginer',                  dessin: 'dessin/chap_3/III/1/imaginer.svg' },
    { lettre: 'D', nom: 'sélectionner',              dessin: 'dessin/chap_3/III/1/selectionner.svg' },
    { lettre: 'E', nom: 'réaliser',                  dessin: 'dessin/chap_3/III/1/realiser.svg' },
    { lettre: 'F', nom: 'communiquer et capitaliser', dessin: 'dessin/chap_3/III/1/communiquer.svg' },
  ],
  // ---------------------------------------------------------------
  // Chapitres (onglets de gauche) et leurs parties (barre verticale)
  //   titre   : <br> autorisé pour couper la ligne dans l'onglet
  //   fiches  : lien vers les fiches notion du chapitre
  //   parties : une ligne par page du chapitre, dans l'ordre
  //     nom    : titre affiché en haut de la page et au survol de la barre
  //     duree  : durée affichée à droite du titre (laisser '' pour rien)
  //     lien   : fichier de la page
  //     etoile : true si la partie contient une activité
  // ---------------------------------------------------------------
  chapitres: [
    { numero: 1, titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 2, titre: 'titre du chapitre', fiches: '#', parties: [] },
    {
      numero: 3,
      titre: 'concevoir autrement<br>les produits et services',
      fiches: '#',
      parties: [
        // I.
        { section: "Qu'est-ce que l'éco-conception ?", nom: "Définitions et grands principes", duree: '10 min', lien: 'chap_3/chap3_I_1.html' },
        { section: "Qu'est-ce que l'éco-conception ?", nom: "Les réglementations liées à l'éco-conception", duree: '5min', lien: 'chap_3/chap3_I_2.html' },
        { section: "Qu'est-ce que l'éco-conception ?", nom: "Activité: les niveaux d'éco-conception", duree: '15 min', lien: 'chap_3/chap3_I_3.html', etoile: true },
        // II.
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Des éco-solutions à chaque étape du cycle de vie", duree: '20 min', lien: 'chap_3/chap3_II_1.html' },
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Activité: les éco-solutions et la roue de Brezet", duree: '', lien: 'chap_3/chap3_II_2.html', etoile: true },
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Les outils de l'éco-conception", duree: '', lien: 'chap_3/chap3_II_3.html' },
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Activité: à chaque situation son outil", duree: '', lien: 'chap_3/chap3_II_4.html', etoile: true },
        // III.
        // III.
        { section: "Appliquer une démarche d'éco-conception", nom: "Les étapes d'une démarche d'éco-conception", duree: '15 min',
          pages: ['chap_3/chap3_III_1.html', 'chap_3/chap3_III_2.html', 'chap_3/chap3_III_3.html', 'chap_3/chap3_III_4.html', 'chap_3/chap3_III_5.html' , 'chap_3/chap3_III_5.html'] },
        { section: "Appliquer une démarche d'éco-conception", nom: "Témoignage: mettre en place une démarche", duree: '', lien: 'chap_3/chap3_III_7.html' },
        // IV.
   
        { section: "Appliquer une démarche d'éco-conception", nom: "Activité: cas d'étude d'un smartphone", duree: '30 min', etoile: true,
          pages: ['chap_3/chap3_IV_1.html', 'chap_3/chap3_IV_2.html', 'chap_3/chap3_IV_3.html', 'chap_3/chap3_IV_4.html'] },
            { section: "Conclusion", nom: "Conclusion", duree: '', lien: 'chap_3/chap3_IV.html' },      ],
    },
    { numero: 4,  titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 5,  titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 6,  titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 7,  titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 8,  titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 9,  titre: 'titre du chapitre', fiches: '#', parties: [] },
    { numero: 10, titre: 'titre du chapitre', fiches: '#', parties: [] },
  ],
};


// =====================================================================
// PROGRESSION DE L'ÉTUDIANT·E
// FICTIF pour l'instant — demain, lu depuis le SCORM
// =====================================================================
const PROGRESSION = {
  chapitresTermines: [1, 2],   // onglets rouges + accessibles
  partiesFaites: {             // étoiles pleines, par chapitre
    3: [],
  },
};
