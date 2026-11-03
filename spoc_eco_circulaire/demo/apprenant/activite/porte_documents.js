// =====================================================================
// PORTE-DOCUMENTS : les réponses de l'étudiant, sur toutes les pages de l'activité D
//
// - Un logo dossier en haut à droite. Il apparaît au 1er clic sur « continuer » sous la roue,
//   puis reste visible sur toutes les pages de l'activité.
// - Au clic : une fenêtre (même allure que les documents), déplaçable, qui ne bloque pas la page.
//   Elle contient l'analyse 360° (7 réponses) et les 2 enjeux à creuser.
// - Une réponse jugée « à approfondir » par Andréa porte une pastille orange et,
//   sur la page de la mission 1, un bouton « revenir à cette étape ».
//   Sur les autres pages, la fenêtre est en lecture seule : les boutons « revenir à cette étape »
//   et le lien « revoir ma mission 1 » ramènent sur la page de la mission 1, directement
//   à la roue (rubrique à approfondir) ou aux enjeux, avec les réponses déjà remises en place
//   (adresse chap3_IV_1.html?reprendre=Clients, ou ?reprendre=enjeux).
// - La mascotte parle deux fois :
//   1. au 1er clic sur « continuer » sous la roue : pop-up vert au centre, avec le dessin du porte-documents ;
//      quand on le ferme (rond rouge, clic ailleurs ou Échap), le dossier s'envole jusqu'à sa place,
//      en haut à droite, puis la suite (le bilan d'Andréa) s'affiche ;
//   2. quand les enjeux y sont rangés : petite bulle verte à côté du logo, pendant 10 secondes.
//
// Les réponses sont gardées dans le navigateur (localStorage, clé « athentech_porte_documents »).
// À charger sur chaque page de l'activité, avec defer, après mentor.js s'il y en a un :
//   <link rel="stylesheet" href="activite/porte_documents.css">
//   <script src="activite/porte_documents.js" defer></script>
// =====================================================================

(function () {

  const CLE = 'athentech_porte_documents';
  const PAGE_MISSION_1 = 'chap3_IV_1.html';
  const DUREE_VOL = 700;           // durée du vol du dossier jusqu'à sa place (ms)
  const DUREE_BULLE = 10000;       // la bulle « j'ai rempli… » disparaît après 10 secondes

  const TEXTES = {
    apparition: 'Hey !! Ici tu peux retrouver tes réponses, ça pourrait te servir pour la suite de ta mission !',
    enjeux: 'J’ai rempli ton porte-documents !',
  };

  // l'ordre des rubriques dans le porte-documents (le même que la roue)
  const RUBRIQUES = [
    'Stratégie de l’entreprise', 'Clients', 'Concurrents', 'Réglementations',
    'Marges de manœuvre', 'Impacts environnementaux', 'Enjeux sociaux',
  ];

  // le logo, en SVG dans la page : dossier vert, feuille couleur de fond (couleurs dans porte_documents.css)
  const LOGO = `
    <svg class="pd_logo" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path class="pd_trait pd_dossier" d="M9 51 V14 Q9 12 11 12 H23 Q24 12 25 13 L29 17 H51 Q53 17 53 19 V27"/>
      <path class="pd_trait pd_feuille" d="M14 51 V21 H48 V27"/>
      <path class="pd_trait pd_dossier" d="M9 51 L15.5 30 Q16 29 17 29 H30 L34 26 H56 Q57.5 26 57 27.5 L50 50 Q49.6 51 48.5 51 Z"/>
    </svg>`;


  // ---------- Mémoire (dans le navigateur) ----------

  function lire() {
    try {
      return JSON.parse(localStorage.getItem(CLE)) || {};
    } catch {
      return {};
    }
  }

  let donnees = Object.assign({ roue: {}, enjeux: null, visible: false, vu: false }, lire());

  function enregistrer() {
    try { localStorage.setItem(CLE, JSON.stringify(donnees)); } catch { /* stockage indisponible */ }
  }


  // ---------- Construction : logo, pop-up de la mascotte, fenêtre ----------

  // la roue de l'analyse 360° : seulement sur la page de la mission 1
  // (on la reconnaît à ses cases de saisie, pour ne pas la confondre avec un autre schéma en rond)
  const roue = document.querySelector('#partie_roue .roue');
  const surMission1 = Boolean(roue && roue.querySelector('.rubrique textarea'));

  const bouton = document.createElement('button');
  bouton.type = 'button';
  bouton.className = 'pd_bouton';
  bouton.hidden = true;
  bouton.setAttribute('aria-expanded', 'false');
  bouton.setAttribute('aria-controls', 'porte_documents');
  bouton.setAttribute('aria-label', 'ouvrir le porte-documents');
  bouton.innerHTML = LOGO;

  // pop-up de la mascotte, au centre : texte + grand dessin du porte-documents
  const annonce = document.createElement('div');
  annonce.className = 'pd_annonce';
  annonce.setAttribute('role', 'status');
  annonce.hidden = true;
  annonce.innerHTML = `
    <button type="button" class="qcm_fermer pd_quitter" aria-label="fermer"></button>
    <!-- DESSIN DE LA MASCOTTE : remplacer ce <div> par une <img class="rappel_mascotte_dessin" …> -->
    <div class="rappel_mascotte_dessin emplacement_illustration" aria-hidden="true">mascotte</div>
    <div class="pd_annonce_texte">
      <p></p>
      <div class="pd_annonce_dossier">${LOGO}</div>
    </div>`;

  const fenetre = document.createElement('dialog');
  fenetre.className = 'fenetre_document pd_fenetre';
  fenetre.id = 'porte_documents';
  fenetre.setAttribute('aria-labelledby', 'titre_porte_documents');
  fenetre.innerHTML = `
    <button type="button" class="qcm_fermer" aria-label="fermer le porte-documents"></button>
    <h4 id="titre_porte_documents">Porte-documents</h4>
    ${surMission1 ? '' : '<p class="pd_lien_mission1"><a class="source">revoir ma mission&nbsp;1</a></p>'}
    <h5 class="souligne_fin">Mon analyse 360°</h5>
    <ul class="pd_liste" id="pd_roue"></ul>
    <div id="pd_enjeux" hidden>
      <h5 class="souligne_fin">Mes 2 enjeux à creuser</h5>
      <div id="pd_enjeux_liste"></div>
    </div>`;

  // petite bulle de la mascotte, à côté du logo (« J'ai rempli ton porte-documents ! »)
  const bulle = document.createElement('div');
  bulle.className = 'pd_bulle';
  bulle.setAttribute('role', 'status');
  bulle.hidden = true;
  bulle.innerHTML = `
    <!-- DESSIN DE LA MASCOTTE : remplacer ce <div> par une <img class="rappel_mascotte_dessin" …> -->
    <div class="rappel_mascotte_dessin emplacement_illustration" aria-hidden="true">mascotte</div>
    <p></p>`;

  document.body.append(bouton, annonce, bulle, fenetre);


  // ---------- Contenu de la fenêtre ----------

  const listeRoue = fenetre.querySelector('#pd_roue');
  const blocEnjeux = fenetre.querySelector('#pd_enjeux');
  const zoneEnjeux = fenetre.querySelector('#pd_enjeux_liste');

  function element(balise, classe, texte) {
    const el = document.createElement(balise);
    if (classe) el.className = classe;
    if (texte !== undefined) el.textContent = texte;
    return el;
  }

  // adresse de la mission 1, ouverte directement sur une étape : un nom de rubrique, « enjeux » ou « roue »
  const adresseReprise = cible => `${PAGE_MISSION_1}?reprendre=${encodeURIComponent(cible)}`;

  // où renvoie « revoir ma mission 1 » : la 1re rubrique à approfondir, sinon les enjeux à approfondir, sinon la roue
  function cibleMission1() {
    const rubrique = RUBRIQUES.find(nom => donnees.roue[nom]?.avis === 'a_approfondir');
    if (rubrique) return rubrique;
    if (donnees.enjeux && !donnees.enjeux.valides) return 'enjeux';
    return 'roue';
  }

  // pastille « à approfondir », avec « revenir à cette étape » :
  // un bouton sur la page de la mission 1, un lien vers elle sur les autres pages
  function marqueAApprofondir(cible) {
    const marque = element('span', 'pd_a_approfondir', 'à approfondir');
    let lien;
    if (surMission1) {
      lien = element('button', 'pd_revenir', 'revenir à cette étape');
      lien.type = 'button';
      lien.addEventListener('click', () => (cible === 'enjeux' ? revenirEnjeux() : revenirRubrique(cible)));
    } else {
      lien = element('a', 'pd_revenir', 'revenir à cette étape');
      lien.href = adresseReprise(cible);
    }
    marque.append(lien);
    return marque;
  }

  function afficher() {
    listeRoue.replaceChildren();
    RUBRIQUES.forEach(nom => {
      const r = donnees.roue[nom] || {};
      const li = element('li');
      li.append(element('span', 'pd_nom', nom));
      li.append(r.texte ? element('span', 'pd_reponse', r.texte) : element('span', 'pd_reponse pd_vide', 'pas encore de réponse'));
      if (r.avis === 'a_approfondir') li.append(marqueAApprofondir(nom));
      listeRoue.append(li);
    });

    // « Mes 2 enjeux à creuser » n'apparaît qu'une fois les enjeux rangés
    zoneEnjeux.replaceChildren();
    const e = donnees.enjeux;
    blocEnjeux.hidden = !(e && e.liste && e.liste.length);
    const lienMission1 = fenetre.querySelector('.pd_lien_mission1 a');
    if (lienMission1) lienMission1.href = adresseReprise(cibleMission1());
    if (blocEnjeux.hidden) return;
    const liste = element('ul', 'pd_liste');
    e.liste.forEach(texte => {
      const li = element('li');
      li.append(element('span', 'pd_reponse', texte));
      liste.append(li);
    });
    zoneEnjeux.append(liste);
    if (!e.valides) zoneEnjeux.append(marqueAApprofondir('enjeux'));
  }


  // ---------- Ouvrir, fermer, déplacer ----------

  function ouvrir() {
    afficher();
    fenetre.show();                       // show() et pas showModal() : la page reste utilisable
    bouton.setAttribute('aria-expanded', 'true');
    cacherBulle();
  }

  function fermer() {
    fenetre.close();
  }

  fenetre.addEventListener('close', () => bouton.setAttribute('aria-expanded', 'false'));
  bouton.addEventListener('click', () => (fenetre.open ? fermer() : ouvrir()));
  fenetre.querySelector('.qcm_fermer').addEventListener('click', fermer);
  fenetre.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); fermer(); bouton.focus(); }
  });

  // on attrape la fenêtre partout, sauf sur le texte, les liens et les boutons
  const PAS_POUR_DEPLACER = 'button, a, h4, h5, .pd_nom, .pd_reponse, .pd_a_approfondir, p';

  fenetre.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest(PAS_POUR_DEPLACER)) return;
    e.preventDefault();
    const depart = fenetre.getBoundingClientRect();
    const dx = e.clientX - depart.left;
    const dy = e.clientY - depart.top;
    fenetre.classList.add('pd_deplacement');
    fenetre.setPointerCapture(e.pointerId);

    function bouger(ev) {
      const x = Math.min(Math.max(ev.clientX - dx, 0), window.innerWidth - 60);
      const y = Math.min(Math.max(ev.clientY - dy, 0), window.innerHeight - 40);
      fenetre.style.left = `${x}px`;
      fenetre.style.top = `${y}px`;
      fenetre.style.right = 'auto';
    }
    function lacher() {
      fenetre.classList.remove('pd_deplacement');
      fenetre.removeEventListener('pointermove', bouger);
      fenetre.removeEventListener('pointerup', lacher);
      fenetre.removeEventListener('pointercancel', lacher);
    }
    fenetre.addEventListener('pointermove', bouger);
    fenetre.addEventListener('pointerup', lacher);
    fenetre.addEventListener('pointercancel', lacher);
  });


  // ---------- La mascotte : pop-up au centre, puis le dossier s'envole à sa place ----------

  let annonceOuverte = false;
  let apresAnnonce = null;         // ce qui doit se passer une fois le dossier arrivé à sa place

  function direMascotte(texte) {
    annonce.querySelector('p').textContent = texte;
    annonce.classList.remove('pd_annonce_depart');
    annonce.hidden = false;
    annonceOuverte = true;
    annonce.querySelector('.pd_quitter').focus({ preventScroll: true });
  }

  function fermerAnnonce() {
    if (!annonceOuverte) return;
    annonceOuverte = false;

    const dessin = annonce.querySelector('.pd_annonce_dossier svg');
    const depart = dessin.getBoundingClientRect();
    bouton.hidden = false;
    bouton.classList.add('pd_en_attente');            // le logo est là, mais invisible pendant le vol
    const arrivee = bouton.querySelector('svg').getBoundingClientRect();

    const finir = () => {
      annonce.hidden = true;
      bouton.classList.remove('pd_en_attente');
      const suite = apresAnnonce;
      apresAnnonce = null;
      if (suite) suite();
    };

    const sansAnimation = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (sansAnimation || !depart.width || !dessin.animate) return finir();

    // une copie du dossier vole du centre jusqu'au logo ; le reste du pop-up s'efface
    const copie = dessin.cloneNode(true);
    copie.classList.add('pd_vol');
    Object.assign(copie.style, {
      left: `${depart.left}px`, top: `${depart.top}px`,
      width: `${depart.width}px`, height: `${depart.height}px`,
    });
    document.body.append(copie);
    annonce.classList.add('pd_annonce_depart');

    const dx = arrivee.left - depart.left;
    const dy = arrivee.top - depart.top;
    const echelle = arrivee.width / depart.width;
    copie.animate(
      [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${echelle})` }],
      { duration: DUREE_VOL, easing: 'cubic-bezier(.5, 0, .3, 1)', fill: 'forwards' }
    ).finished.then(() => { copie.remove(); finir(); });
  }

  annonce.querySelector('.pd_quitter').addEventListener('click', fermerAnnonce);

  // un clic ailleurs ferme aussi le pop-up
  document.addEventListener('pointerdown', e => {
    if (annonceOuverte && !annonce.contains(e.target)) fermerAnnonce();
  });

  document.addEventListener('keydown', e => {
    if (annonceOuverte && e.key === 'Escape') fermerAnnonce();
  });


  // ---------- La petite bulle à côté du logo ----------

  let minuteurBulle;

  function direBulle(texte) {
    bulle.querySelector('p').textContent = texte;
    bulle.hidden = false;
    clearTimeout(minuteurBulle);
    minuteurBulle = setTimeout(cacherBulle, DUREE_BULLE);
  }

  function cacherBulle() {
    clearTimeout(minuteurBulle);
    bulle.hidden = true;
  }

  bulle.addEventListener('click', cacherBulle);


  // ---------- Montrer le logo ----------

  // 1re fois : la mascotte présente le porte-documents, et le logo arrive à sa place en fin de vol
  function montrerLogo(avecMascotte) {
    if (!donnees.visible) {
      donnees.visible = true;
      enregistrer();
    }
    if (avecMascotte && !donnees.vu) {
      donnees.vu = true;
      enregistrer();
      direMascotte(TEXTES.apparition);
    } else if (!annonceOuverte) {
      bouton.hidden = false;
    }
  }

  // déjà apparu (sur cette page ou une autre) : il est là dès l'ouverture de la page
  if (donnees.visible) bouton.hidden = false;


  // ---------- Page de la mission 1 : on suit la roue et Andréa ----------

  if (surMission1) {
    const rubriques = [...roue.querySelectorAll('.rubrique')];
    const nomDe = r => r.querySelector('.rubrique_bouton').textContent.trim();

    function noter(r) {
      const nom = nomDe(r);
      const texte = r.querySelector('textarea')?.value.trim() || '';
      donnees.roue[nom] = { texte, avis: r.dataset.avis || donnees.roue[nom]?.avis || null };
      if (!texte) delete donnees.roue[nom];
      enregistrer();
      if (fenetre.open) afficher();
    }

    // chaque réponse est enregistrée à chaque frappe
    rubriques.forEach(r => {
      r.querySelector('textarea')?.addEventListener('input', () => noter(r));
    });

    // 1er clic sur « continuer » sous la roue : d'abord la mascotte et le porte-documents,
    // puis, une fois le dossier à sa place, la suite normale (le bilan d'Andréa)
    const continuer = document.getElementById('bouton_continuer_roue');
    continuer?.addEventListener('click', e => {
      if (donnees.vu) return;
      e.stopImmediatePropagation();
      apresAnnonce = () => continuer.click();
      montrerLogo(true);
    }, true);

    // l'avis d'Andréa (ok / a_approfondir) est posé sur la rubrique par mentor.js
    new MutationObserver(changements => {
      changements.forEach(c => noter(c.target));
    }).observe(roue, { subtree: true, attributes: true, attributeFilter: ['data-avis'] });

    // les 2 enjeux, envoyés par mentor.js quand Andréa les valide ou quand l'étudiant passe quand même
    document.addEventListener('mentor:enjeux', e => {
      const { liste, valides } = e.detail || {};
      if (!liste || !liste.length) return;
      donnees.enjeux = { liste, valides: Boolean(valides) };
      enregistrer();
      if (fenetre.open) afficher();
      if (!donnees.visible) { donnees.visible = true; enregistrer(); }
      if (!annonceOuverte) bouton.hidden = false;
      direBulle(TEXTES.enjeux);
    });
  }

  // ---------- Retour depuis une autre page : ?reprendre=… ----------
  // On saute la lecture des documents, on remet les réponses dans la roue et les avis d'Andréa,
  // puis on ouvre directement la rubrique à approfondir, ou la question des enjeux.

  const cible = new URLSearchParams(location.search).get('reprendre');
  if (surMission1 && cible) {
    // l'adresse redevient normale : un rechargement ne refera pas la reprise
    history.replaceState(null, '', location.pathname + location.hash);

    const montrer = id => {
      const partie = document.getElementById(id);
      if (partie) partie.hidden = false;
      document.querySelector(`button[data-montrer="${id}"]`)?.setAttribute('aria-expanded', 'true');
    };
    montrer('partie_documents');
    montrer('partie_roue');
    document.querySelectorAll('.miniature[data-document]').forEach(m => m.classList.add('lue'));

    // les réponses reviennent dans les cases (la note à côté de chaque rubrique se met à jour)
    const avis = {};
    roue.querySelectorAll('.rubrique').forEach(r => {
      const nom = r.querySelector('.rubrique_bouton').textContent.trim();
      const memo = donnees.roue[nom];
      const champ = r.querySelector('textarea');
      if (!memo || !champ) return;
      champ.value = memo.texte;
      r.dataset.envoye = memo.texte;            // Entrée ne renverra pas la même réponse à Andréa
      champ.dispatchEvent(new Event('input', { bubbles: true }));
      if (memo.avis) avis[nom] = memo.avis;
    });

    if (typeof window.mentorReprendre === 'function') {
      window.mentorReprendre({ avis, enjeux: donnees.enjeux, cible });
    }
  }


  // « revenir à cette étape »
  function revenirRubrique(nom) {
    fermer();
    if (typeof window.mentorRevenirRubrique === 'function') window.mentorRevenirRubrique(nom);
  }

  function revenirEnjeux() {
    fermer();
    if (typeof window.mentorRevenirEnjeux === 'function') window.mentorRevenirEnjeux();
  }

})();