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
    { id: 'retour',       texte: "retour à l'accueil", lien: '#', image: 'dessin/picto/maison.svg' },
    { id: 'fiche_notion', texte: 'fiches notions',     lien: '#', image: 'dessin/picto/notion.svg', hauteurImage: '28px' },
    { id: 'glossaire',    texte: 'glossaire',          lien: '#', image: 'dessin/picto/loupe.svg',  hauteurImage: '28px' },
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
        { section: "Qu'est-ce que l'éco-conception ?", nom: "Définitions et grands principes", duree: '10 min', lien: 'chap3_I-4.html' },
        { section: "Qu'est-ce que l'éco-conception ?", nom: "Les réglementations liées à l'éco-conception", duree: '', lien: 'chap3_I-4.html' },
        { section: "Qu'est-ce que l'éco-conception ?", nom: "Activité: les niveaux d'éco-conception", duree: '10 min', lien: 'chap3_I-4.html', etoile: true },
        // II.
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Éco-solutions et leviers par étape du cycle de vie", duree: '', lien: 'chap3_II-1.html' },
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Activité: les éco-solutions et la roue de Brezet", duree: '', lien: 'chap3_II-2.html', etoile: true },
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Les outils de l'éco-conception", duree: '', lien: 'chap3_II-3.html' },
        { section: "Éco-solutions et outils de l'éco-conception", nom: "Activité: sac plastique ou sac en coton ?", duree: '', lien: 'chap3_II-4.html', etoile: true },
        // III.
        { section: "Appliquer une démarche d'éco-conception", nom: "Les étapes d'une démarche d'éco-conception", duree: '', lien: 'chap3_III-1.html' },
        { section: "Appliquer une démarche d'éco-conception", nom: "Exemple : le cola Saclay", duree: '', lien: 'chap3_III-2.html' },
        { section: "Appliquer une démarche d'éco-conception", nom: "Témoignage: mettre en place une démarche", duree: '', lien: 'chap3_III-3.html' },
        { section: "Appliquer une démarche d'éco-conception", nom: "Activité: cas d'étude d'un smartphone", duree: '', lien: 'chap3_III-4.html', etoile: true },
        // IV.
        { section: "Conclusion", nom: "Conclusion", duree: '', lien: 'chap3_IV.html' },
      ],
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
