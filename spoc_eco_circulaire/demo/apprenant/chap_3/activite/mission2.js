// =====================================================================
// MISSION 2 : ANALYSER LE SMARTPHONE AVANT DE LE TRANSFORMER
// Comportements propres à la page activite_d_mission2.html.
// À charger après script.js et activite_smartphone.js, avec defer.
//
//   1. Andréa en pop-up         messages écrits à l'avance (<template>), sans IA
//   2. Analyse 1                remettre les 6 étapes du cycle de vie dans l'ordre
//                               → « vérifier » → bravo, ou Andréa corrige
//   3. Le cycle en rond         les étapes glissent de leur case jusqu'au cercle,
//                               puis les flèches apparaissent
//   4. Le graphique             au survol des étapes, les barres de l'empreinte carbone
//                               se dessinent une à une, à droite du cercle
//   5. QCM de l'ACV             « Quel enseignement principal ? » : Andréa répond en pop-up
//                               (textes écrits à l'avance, pas d'IA)
//   6. Conversation IA          commun (relais, signaux, file d'attente)
//   7. Composants               pop-up, IA
//   8. Parcours utilisateur     petite fenêtre, IA à chaque étape
//   9. Livrable : choix de la problématique dans le pop-up d'Andréa (pas d'IA)
//
// Signaux invisibles écrits par l'IA (retirés avant affichage) :
//   [VALIDE: composants]               composants validés
//   [EVAL: Étape = ok|a_approfondir]   avis sur une étape du parcours
//   [RESUME: Climat : … | Ressources : …]  ce qui a été validé, rangé dans le porte-documents
//   [HUMEUR: neutre|content|decu]      le visage d'Andréa
//   [DOC: recyclage]                   lien vers un PDF du site (DOCUMENTS), sous son message
//   [TEXTE: Étape = …]                 version finale → la case se remplit
// =====================================================================

(function () {

  // =====================================================================
  // 1. ANDRÉA EN POP-UP
  // andreaDit('id_du_template', 'texte du bouton', action à lancer à la fermeture)
  // Le <template> peut porter data-humeur="content" ou "decu" : le visage change.
  // =====================================================================

  const panneau     = document.getElementById('mentor_ia');
  const scene       = panneau?.querySelector('.mentor_scene');
  const sceneTexte  = panneau?.querySelector('.mentor_scene_texte');
  const boutonSuivant = panneau?.querySelector('[data-choix="suivant"]');
  let apresAndrea   = null;

  // la fenêtre est en bas à droite par défaut : on la décale jusqu'au centre de l'écran
  function placerAuCentre() {
    panneau.classList.add('sans_transition');
    panneau.style.transform = '';
    const r = panneau.getBoundingClientRect();
    const marge = 16;
    const x = Math.min(Math.max(window.innerWidth / 2 - r.width / 2, marge), window.innerWidth - r.width - marge);
    const y = Math.min(Math.max(window.innerHeight / 2 - r.height / 2, marge), window.innerHeight - r.height - marge);
    panneau.style.transform = `translate(${x - r.left}px, ${y - r.top}px)`;
    void panneau.offsetHeight;
    panneau.classList.remove('sans_transition');
  }

  function andreaDit(idTemplate, texteBouton, ensuite) {
    const modele = document.getElementById(idTemplate);
    if (!panneau || !modele) {          // pas de fenêtre ou pas de texte : on passe directement à la suite
      if (ensuite) ensuite();
      return;
    }
    sceneTexte.replaceChildren(modele.content.cloneNode(true));
    sceneFil?.replaceChildren();            // pop-up : seulement le message
    panneau.dataset.humeur = modele.dataset.humeur || 'neutre';
    panneau.dataset.etape = 'message';
    boutonSuivant.textContent = texteBouton;
    boutonSuivant.hidden = false;
    apresAndrea = ensuite || null;

    panneau.hidden = false;
    panneau.classList.add('popup');
    panneau.classList.remove('reduit');
    placerAuCentre();
    scene.focus({ preventScroll: true });   // les lecteurs d'écran lisent le message
  }

  let choixProblematiqueOuvert = false;    // pop-up du choix de la problématique (section 9)

  function fermerAndrea() {
    if (!panneau || panneau.hidden) return;
    panneau.hidden = true;                  // fondu de sortie (mentor.css)
    panneau.classList.remove('popup_large');
    const suite = apresAndrea;
    apresAndrea = null;
    if (suite) suite();
  }

  if (panneau) {
    boutonSuivant?.addEventListener('click', fermerAndrea);
    // Échap ferme un pop-up de message, comme le bouton (pas une discussion en cours)
    panneau.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panneau.dataset.etape === 'message' && !choixProblematiqueOuvert) fermerAndrea();
    });
    // le pop-up change de taille (dessin chargé, fenêtre redimensionnée) : on le recentre
    // seulement en pop-up (la petite fenêtre reste en bas à droite)
    const recentrer = () => { if (!panneau.hidden && panneau.classList.contains('popup')) placerAuCentre(); };
    new ResizeObserver(recentrer).observe(panneau);
    window.addEventListener('resize', recentrer);
  }


  // =====================================================================
  // 2. ANALYSE 1 : REMETTRE LE CYCLE DE VIE DANS L'ORDRE
  // On glisse une étape dans une case, ou on clique l'étape puis la case.
  // Au clavier : Tab jusqu'à l'étape, Entrée ; Tab jusqu'à la case, Entrée.
  // Une étape posée sur une case occupée échange sa place avec l'autre.
  // =====================================================================

  const jeu = document.getElementById('cycle_jeu');
  if (!jeu) return;

  const reserve    = jeu.querySelector('.cycle_reserve');
  const cartes     = [...jeu.querySelectorAll('.carte_cycle')];
  const depots     = [...jeu.querySelectorAll('.cycle_depot')];
  const piedCycle  = document.getElementById('pied_cycle');
  const boutonCycle = document.getElementById('bouton_cycle');
  const annonceCycle = document.getElementById('annonce_cycle');

  let mode = 'jeu';          // 'jeu' → 'corrige' → 'rond'
  let choisie = null;        // étape sélectionnée au clic ou au clavier
  let ignorerClic = false;   // après un glisser, le clic qui suit ne compte pas

  const nomDe = carte => carte.textContent.trim();
  const annoncer = texte => { if (annonceCycle) annonceCycle.textContent = texte; };
  const placeLibre = () => [...reserve.children].find(li => !li.querySelector('.carte_cycle'));

  cartes.forEach(c => c.setAttribute('aria-pressed', 'false'));

  function choisir(carte) {
    choisie = carte;
    cartes.forEach(c => c.setAttribute('aria-pressed', String(c === carte)));
    jeu.classList.toggle('carte_choisie', !!carte);
    if (carte) annoncer(`Étape « ${nomDe(carte)} » sélectionnée. Choisis sa case.`);
  }

  // Pose une étape dans une case (ou la remet dans la réserve)
  function deposer(carte, cible) {
    if (cible === reserve) cible = placeLibre();
    if (!cible) return;

    const origine = carte.parentElement;
    const occupant = cible.querySelector('.carte_cycle');

    if (occupant !== carte) {
      if (occupant) origine.appendChild(occupant);   // échange des deux étapes
      cible.appendChild(carte);
    }
    choisir(null);
    mettreAJour();

    const position = cible.dataset.position;
    annoncer(position
      ? `« ${nomDe(carte)} » placée dans la case ${position}.`
      : `« ${nomDe(carte)} » remise dans la liste.`);
    carte.focus({ preventScroll: true });
  }

  // Après chaque déplacement : nom des cases pour les lecteurs d'écran, bouton « vérifier »
  function mettreAJour() {
    depots.forEach(d => {
      const carte = d.querySelector('.carte_cycle');
      d.setAttribute('aria-label', `case ${d.dataset.position} : ${carte ? nomDe(carte) : 'vide'}`);
    });

    const placees = depots.filter(d => d.querySelector('.carte_cycle')).length;
    const toutPlace = placees === depots.length;
    if (piedCycle && mode === 'jeu') {
      if (toutPlace && piedCycle.hidden) annoncer('Toutes les étapes sont placées. Le bouton « vérifier » est disponible en bas de l’écran.');
      piedCycle.hidden = !toutPlace;
    }
  }

  // la case (ou la place de la réserve) sous la souris, en ignorant l'étape qu'on tient
  function cibleSous(x, y, tenue) {
    for (const el of document.elementsFromPoint(x, y)) {
      if (tenue.contains(el)) continue;
      const cible = el.closest('#cycle_jeu .cycle_depot, #cycle_jeu .cycle_reserve li');
      if (cible) return cible;
      if (el === reserve) return reserve;
    }
    return null;
  }

  function marquerSurvol(cible) {
    depots.forEach(d => d.classList.toggle('survol', d === cible));
  }


  // ---------- Glisser à la souris (ou au doigt) ----------

  cartes.forEach(carte => {

    carte.addEventListener('pointerdown', e => {
      if (mode !== 'jeu' || e.button !== 0) return;
      const departX = e.clientX;
      const departY = e.clientY;
      let glisse = false;
      carte.setPointerCapture(e.pointerId);

      function bouger(ev) {
        const dx = ev.clientX - departX;
        const dy = ev.clientY - departY;
        if (!glisse && Math.hypot(dx, dy) < 6) return;   // petit mouvement : c'est un clic
        glisse = true;
        carte.classList.add('en_main');
        carte.style.translate = `${dx}px ${dy}px`;
        marquerSurvol(cibleSous(ev.clientX, ev.clientY, carte));
      }

      function lacher(ev) {
        carte.removeEventListener('pointermove', bouger);
        carte.removeEventListener('pointerup', lacher);
        carte.removeEventListener('pointercancel', lacher);
        carte.classList.remove('en_main');
        carte.style.translate = '';
        marquerSurvol(null);
        if (!glisse) return;

        ignorerClic = true;
        setTimeout(() => { ignorerClic = false; }, 0);
        const cible = cibleSous(ev.clientX, ev.clientY, carte);
        if (cible) deposer(carte, cible);
      }

      carte.addEventListener('pointermove', bouger);
      carte.addEventListener('pointerup', lacher);
      carte.addEventListener('pointercancel', lacher);
    });


    // ---------- Clic (ou Entrée / Espace) sur une étape ----------

    carte.addEventListener('click', () => {
      if (ignorerClic || mode !== 'jeu') return;

      // une autre étape est déjà choisie et on clique une étape posée : elles échangent leur place
      if (choisie && choisie !== carte) {
        deposer(choisie, carte.parentElement);
        return;
      }
      choisir(choisie === carte ? null : carte);
    });
  });


  // ---------- Clic (ou Entrée / Espace) sur une case ou sur la réserve ----------

  depots.forEach(depot => {
    depot.addEventListener('click', e => {
      if (mode === 'jeu' && choisie && !e.target.closest('.carte_cycle')) deposer(choisie, depot);
    });
    depot.addEventListener('keydown', e => {
      if (mode !== 'jeu' || !choisie || e.target !== depot) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        deposer(choisie, depot);
      }
    });
  });

  reserve.addEventListener('click', e => {
    if (mode === 'jeu' && choisie && !e.target.closest('.carte_cycle')) deposer(choisie, reserve);
  });

  // Échap : on lâche l'étape choisie
  jeu.addEventListener('keydown', e => {
    if (e.key === 'Escape' && choisie) choisir(null);
  });


  // ---------- « vérifier » ----------

  boutonCycle?.addEventListener('click', () => {

    // 1er clic : on vérifie l'ordre
    if (mode === 'jeu') {
      choisir(null);
      piedCycle.hidden = true;
      const toutJuste = depots.every(d => d.querySelector('.carte_cycle')?.dataset.ordre === d.dataset.position);

      if (toutJuste) {
        mode = 'corrige';
        jeu.classList.add('corrige');
        cartes.forEach(c => c.classList.add('juste'));
        andreaDit('texte_cycle_bravo', 'c’est parti !', formerCercle);
      } else {
        andreaDit('texte_cycle_correction', 'voir les corrections', corriger);
      }
      return;
    }

    // après les corrections : « passer à l'analyse »
    if (mode === 'corrige') formerCercle();
  });

  // Andréa remet chaque étape à sa place ; les étapes déplacées passent en orange
  function corriger() {
    mode = 'corrige';
    jeu.classList.add('corrige');

    const avant = new Map(cartes.map(c => [c, c.getBoundingClientRect()]));

    depots.forEach(depot => {
      const bonne = cartes.find(c => c.dataset.ordre === depot.dataset.position);
      bonne.classList.add(depot.querySelector('.carte_cycle') === bonne ? 'juste' : 'corrigee');
    });
    depots.forEach(depot => {
      depot.appendChild(cartes.find(c => c.dataset.ordre === depot.dataset.position));
    });
    mettreAJour();

    // les étapes glissent de leur ancienne place vers la bonne
    cartes.forEach(carte => {
      const a = avant.get(carte);
      const b = carte.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (!dx && !dy) return;
      carte.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }],
        { duration: 700, easing: 'ease-in-out' }
      );
    });

    annoncer('Andréa a remis les étapes dans le bon ordre. Les étapes en orange ont été déplacées.');
    boutonCycle.textContent = 'passer à l’analyse';
    piedCycle.hidden = false;
    boutonCycle.focus({ preventScroll: true });
  }


  // =====================================================================
  // 3. LE CYCLE EN ROND
  // Les étapes ne disparaissent pas : elles glissent depuis leur case jusqu'à
  // leur place sur le cercle, puis les flèches apparaissent en fond (activite/mission2.css).
  // Les cases ne bougent pas dans la page : c'est la même liste, dans le bon ordre,
  // seulement présentée en rond (les lecteurs d'écran la lisent toujours de 1 à 6).
  // =====================================================================

  const DUREE_CERCLE = 900;      // durée du glissement vers le cercle, en millisecondes
  const DUREE_MISE_EN_PLACE = 1900;   // les étapes, les flèches et le dessin du centre sont en place
  let cercleEnPlace = false;          // avant, le survol des étapes ne fait rien

  function formerCercle() {
    if (mode === 'rond') return;
    mode = 'rond';
    piedCycle.hidden = true;
    choisir(null);

    // 1. on note où sont les étapes maintenant
    const avant = new Map(cartes.map(c => [c, c.getBoundingClientRect()]));

    // 2. le jeu devient un cercle ; les couleurs de la correction s'effacent
    cartes.forEach(c => {
      c.classList.remove('juste', 'corrigee');
      c.removeAttribute('aria-pressed');
    });
    jeu.classList.add('en_rond');
    document.getElementById('cycle_zone')?.classList.add('en_rond');
    const graph = document.getElementById('graph_carbone');
    if (graph) graph.hidden = false;      // le graphique, encore vide, apparaît à droite du cercle

    // 3. chaque étape part de son ancienne place et glisse jusqu'au cercle
    cartes.forEach((carte, i) => {
      const a = avant.get(carte);
      const b = carte.getBoundingClientRect();
      carte.animate(
        [{ translate: `${a.left - b.left}px ${a.top - b.top}px` }, { translate: '0 0' }],
        { duration: DUREE_CERCLE, easing: 'ease-in-out', delay: i * 60, fill: 'backwards' }
      );
    });

    // on attend que tout le cercle soit en place avant de pouvoir choisir une étape
    setTimeout(() => { cercleEnPlace = true; }, DUREE_MISE_EN_PLACE);

    // 4. la consigne bleue change de texte (les deux textes sont dans le HTML)
    const consigne = document.getElementById('consigne_cycle');
    consigne?.querySelector('.consigne_jeu')?.setAttribute('hidden', '');
    consigne?.querySelector('.consigne_rond')?.removeAttribute('hidden');
    consigne?.classList.add('consigne_changee');     // petit fondu (activite/mission2.css)

    annoncer('Le cycle de vie du Basic-phone® est reconstitué. ' + (consigne?.querySelector('.consigne_rond')?.textContent.trim() || ''));

    // 5. la page glisse pour montrer la nouvelle consigne en haut, et le cercle dessous
    requestAnimationFrame(() => {
      if (consigne && typeof calerEnHaut === 'function') calerEnHaut(consigne);
      else consigne?.scrollIntoView({ behavior: 'smooth' });
    });
  }


  // =====================================================================
  // 4. LE GRAPHIQUE SE DESSINE AU SURVOL DU CYCLE
  // Au survol d'une étape (ou au clavier, ou au clic sur tablette) :
  //   - son texte s'affiche au-dessus du graphique (<template id="bulle_…">) ;
  //   - sa barre pousse, si elle n'est pas encore là
  //     (les 3 étapes de production révèlent la même barre « Production »).
  // Quand les 4 barres sont là, le bouton « voir l'analyse environnementale… » apparaît.
  // =====================================================================

  const info        = document.getElementById('graph_info');
  const lignes      = [...document.querySelectorAll('#graph_carbone tr[data-acv]')];
  const revelees    = new Set();          // barres déjà dessinées
  const BARRES_AVANT_RAPPEL = 2;          // la mascotte rappelle de tout survoler après 2 barres
  const rappelBulles = document.getElementById('rappel_bulles');
  const piedBulles   = document.getElementById('pied_bulles');

  function montrerEtape(carte) {
    const acv = carte.dataset.acv;

    // le texte de l'étape, au-dessus du graphique
    const modele = document.getElementById('bulle_' + acv);
    if (info && modele) {
      const titre = document.createElement('p');
      titre.className = 'graph_info_titre';
      titre.textContent = nomDe(carte);
      info.replaceChildren(titre, modele.content.cloneNode(true));
    }

    revelees.add(acv);

    // l'étape choisie et sa barre passent en rouge ; les 3 étapes de la production
    // passent en rouge ensemble. Les étapes dont la barre est déjà dessinée restent en orange.
    cartes.forEach(c => {
      c.classList.toggle('actif', c.dataset.acv === acv);
      c.classList.toggle('revelee', revelees.has(c.dataset.acv));
    });
    lignes.forEach(tr => {
      const ici = tr.dataset.acv === acv;
      tr.classList.toggle('actif', ici);
      if (ici) tr.classList.add('revelee');     // la barre pousse la première fois
    });
    verifierGraphique();
  }

  function verifierGraphique() {
    if (!piedBulles || piedBulles.dataset.montre) return;
    if (revelees.size < lignes.length) {
      if (rappelBulles && revelees.size >= BARRES_AVANT_RAPPEL) rappelBulles.hidden = false;
      return;
    }
    if (rappelBulles) rappelBulles.hidden = true;
    piedBulles.hidden = false;
    piedBulles.dataset.montre = 'oui';    // il ne réapparaît plus une fois utilisé
    annoncer('Le graphique est complet. Le bouton « voir l’analyse environnementale de la production » est disponible en bas de l’écran.');
  }

  cartes.forEach(carte => {
    const montrer = () => { if (mode === 'rond' && cercleEnPlace) montrerEtape(carte); };
    carte.addEventListener('mouseenter', montrer);
    carte.addEventListener('focus', montrer);
    carte.addEventListener('click', montrer);
  });


  // =====================================================================
  // 5. QUESTION « QUEL ENSEIGNEMENT PRINCIPAL ? »
  // Comme « Que fais-tu maintenant ? » en mission 1 : pas d'IA.
  // Andréa répond en pop-up avec le texte prévu pour le choix (<template id="texte_retour_acv_A|B|C">).
  //   A ou C : « revoir mon choix » → l'élève peut choisir à nouveau
  //   B      : « continuer » → la question des composants, avec l'IA
  // =====================================================================

  const questionAcv = document.getElementById('question_acv');
  const retourAcv   = document.getElementById('retour_acv');
  const choixAcv    = [];                 // les choix successifs de l'élève (A, C, B…)

  questionAcv?.addEventListener('submit', e => {
    e.preventDefault();
    const choix = questionAcv.querySelector('input[name="q_acv"]:checked');

    if (!choix) {
      retourAcv.textContent = 'Choisis une réponse avant de valider.';
      retourAcv.hidden = false;
      return;
    }
    retourAcv.hidden = true;
    choixAcv.push(choix.value);

    if (choix.value === 'B') {
      // bonne réponse : la question est terminée
      questionAcv.querySelectorAll('input, button').forEach(el => { el.disabled = true; });
      andreaDit('texte_retour_acv_B', 'continuer', lancerComposants);
    } else {
      andreaDit(`texte_retour_acv_${choix.value}`, 'revoir mon choix', () => choix.focus({ preventScroll: true }));
    }
  });


  // =====================================================================
  // 6. CONVERSATION AVEC L'IA (commun : composants, parcours)
  // =====================================================================

  // relais : local (lancer_test.bat) ou Supabase
  const ADRESSE_RELAIS = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'api/mentor'
    : 'https://dhssndnqurrpidyxatwj.supabase.co/functions/v1/mentor';
  const MISSION = 2;
  const LONGUEUR_MAX = 2000;
  const ESSAIS_RELAIS = 3;              // relais en erreur : 3 essais (5 s, puis 10 s d'attente)
  const ECART_MIN = 2500;               // Mistral gratuit : au moins 2,5 s entre deux messages
  const REPONSES_AVANT_PASSER = 2;      // mascotte : 2 essais non validés (comme la mission 1)
  const CLE_ENJEUX = 'athentech_enjeux';
  const CLE_MISSION2 = 'athentech_mission2';

  // PDF du site, ouverts dans un nouvel onglet ([DOC: recyclage])
  const DOCUMENTS = {
    recyclage: { titre: 'Focus : le recyclage des téléphones portables (PDF)', adresse: 'documents/recyclage_telephones_portables.pdf' },
  };

  // mémoire : memoire.js, sinon navigateur seul
  const memoire = window.Memoire || {
    lire(cle) { try { return JSON.parse(localStorage.getItem(cle)); } catch { return null; } },
    ecrire(cle, valeur) { try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* indisponible */ } },
  };

  // ajoute ou remplace une partie des réponses de la mission 2
  function sauverMission2(partie) {
    memoire.ecrire(CLE_MISSION2, Object.assign({}, memoire.lire(CLE_MISSION2) || {}, partie, { date: new Date().toISOString() }));
  }

  const fil         = panneau?.querySelector('.mentor_fil');          // petite fenêtre
  const sceneFil    = panneau?.querySelector('.mentor_scene_fil');    // pop-up
  const etat        = panneau?.querySelector('.mentor_etat');
  const saisie      = panneau?.querySelector('.mentor_saisie');
  const champ       = saisie?.querySelector('textarea');
  const envoi       = saisie?.querySelector('button[type="submit"]');

  let conversationId = null;            // une conversation pour toute la mission 2
  let fileEnvois = Promise.resolve();   // messages envoyés un par un, dans l'ordre
  let enCours = 0;
  let dernierEnvoi = 0;

  const normaliser = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[«»"“”]/g, '').replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

  // texte d'Andréa : **mot** ou __mot__ → en gras ; titres et astérisques seuls retirés
  function ecrireTexte(element, texte) {
    element.replaceChildren();
    String(texte).replace(/^\s*#{1,6}\s+/gm, '').split(/(\*\*[^*\n]+?\*\*|__[^_\n]+?__)/g).forEach(morceau => {
      if (!morceau) return;
      if (/^(\*\*|__)[\s\S]+(\*\*|__)$/.test(morceau)) {
        const gras = document.createElement('strong');
        gras.textContent = morceau.slice(2, -2);
        element.append(gras);
      } else {
        element.append(morceau.replace(/\*\*/g, ''));
      }
    });
  }

  // bulle : dans le pop-up ou dans la petite fenêtre
  function ajouterMessage(qui, texte, etiquette, docs = []) {
    const cible = panneau.classList.contains('popup') ? sceneFil : fil;
    const bulle = document.createElement('div');
    bulle.className = `mentor_message mentor_message_${qui}`;

    const auteur = document.createElement('span');
    auteur.className = 'visuellement_cache';
    auteur.textContent = qui === 'eleve' ? 'Toi : ' : qui === 'mentor' ? 'Andréa : ' : 'Information : ';
    bulle.append(auteur);

    if (etiquette) {
      const e = document.createElement('span');
      e.className = 'mentor_etiquette';
      e.textContent = etiquette;
      bulle.append(e);
    }

    const p = document.createElement('p');
    p.className = 'mentor_texte';
    if (qui === 'mentor') ecrireTexte(p, texte);
    else p.textContent = texte;
    bulle.append(p);

    // liens vers les documents
    docs.map(d => DOCUMENTS[d]).filter(Boolean).forEach(d => {
      const lien = document.createElement('a');
      lien.className = 'mentor_document';
      lien.href = d.adresse;
      lien.target = '_blank';
      lien.rel = 'noopener';
      lien.textContent = d.titre;
      const cache = document.createElement('span');
      cache.className = 'visuellement_cache';
      cache.textContent = ' (nouvel onglet)';
      lien.append(cache);
      bulle.append(lien);
    });

    cible.appendChild(bulle);
    cible.scrollTop = cible.scrollHeight;
  }

  function attente(active) {
    enCours += active ? 1 : -1;
    const occupe = enCours > 0;
    envoi.disabled = occupe;
    etat.textContent = occupe ? 'Andréa écrit…' : '';
  }

  // visage d'Andréa : seulement quand son message s'affiche
  const changerHumeur = h => { if (h && panneau) panneau.dataset.humeur = h; };

  // signaux de l'IA : lus et retirés du texte
  function lireSignaux(brut) {
    const evals = [];
    let valide = null;
    let resume = '';
    let humeur = null;
    const docs = [];
    const textes = [];
    let texte = brut;
    texte = texte.replace(/\[\s*VALIDE\s*:\s*([^\]]+?)\s*\]/gi, (_, quoi) => { valide = normaliser(quoi); return ''; });
    texte = texte.replace(/\[\s*RESUME\s*:\s*([^\]]+)\]/gi, (_, r) => { resume = r.trim(); return ''; });
    texte = texte.replace(/\[\s*EVAL\s*:\s*([^=\]]+?)\s*=\s*(ok|a_approfondir)\s*\]/gi, (_, nom, avis) => {
      evals.push({ nom: nom.trim(), avis: avis.toLowerCase() });
      return '';
    });
    texte = texte.replace(/\[\s*HUMEUR\s*:\s*([a-zéè_]+)\s*\]/gi, (_, h) => { humeur = h.toLowerCase(); return ''; });
    texte = texte.replace(/\[\s*TEXTE\s*:\s*([^=\]]+?)\s*=\s*([^\]]+)\]/gi, (_, nom, t) => { textes.push({ nom: nom.trim(), texte: t.trim() }); return ''; });
    texte = texte.replace(/\[\s*DOC\s*:\s*([a-z_]+)\s*\]/gi, (_, d) => { docs.push(d.toLowerCase()); return ''; });
    texte = texte.replace(/\[\s*(EVAL|VALIDE|HUMEUR|RESUME|DOC|TEXTE)[^\]]*\]/gi, '');   // signal mal écrit : caché
    // gras Markdown (**mot**) : gardé, affiché en gras par ecrireTexte
    return { texte: texte.replace(/\n{3,}/g, '\n\n').trim(), evals, valide, resume, humeur, docs, textes };
  }

  // envoi au relais (file d'attente) → { ok, texte, evals, valide, resume } ou { ok: false, erreur }
  function envoyer(message) {
    const tache = fileEnvois.then(async () => {
      attente(true);
      let derniereErreur = 'Andréa ne répond pas.';
      try {
        // Mistral occupé : nouvel essai automatique
        for (let essai = 0; essai < ESSAIS_RELAIS; essai++) {
          if (essai) await new Promise(ok => setTimeout(ok, 5000 * essai));
          const attendre = dernierEnvoi + ECART_MIN - Date.now();   // messages espacés
          if (attendre > 0) await new Promise(ok => setTimeout(ok, attendre));
          dernierEnvoi = Date.now();
          try {
            const reponse = await fetch(ADRESSE_RELAIS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: message.slice(0, LONGUEUR_MAX), conversation_id: conversationId, mission: MISSION }),
            });
            const donnees = await reponse.json().catch(() => ({}));
            if (reponse.ok && donnees.reponse) {
              conversationId = donnees.conversation_id || conversationId;
              return { ok: true, ...lireSignaux(donnees.reponse) };
            }
            derniereErreur = donnees.erreur || derniereErreur;
            if (reponse.status < 500) break;     // message refusé : inutile de réessayer
          } catch (erreur) {
            derniereErreur = erreur.message;
          }
        }
        return { ok: false, erreur: derniereErreur };
      } finally {
        attente(false);
      }
    });
    fileEnvois = tache.catch(() => {});
    return tache;
  }

  // contexte : 1er message seulement
  function contexte() {
    const lignes = [`[Contexte : QCM « quel enseignement principal ? » : choix successifs ${choixAcv.join(', ') || 'B'}.]`];
    const m1 = memoire.lire(CLE_ENJEUX);
    if (m1 && Array.isArray(m1.reponses) && m1.reponses.length) {
      lignes.push(`[Contexte : enjeux retenus en mission 1 (${m1.valides ? 'validés' : 'non validés'}) : ${m1.reponses.join(' / ')}]`);
    }
    return lignes.join('\n') + '\n';
  }
  const debutMessage = () => (conversationId ? '' : contexte());

  // version finale d'Andréa → case remplie, petit flash
  function remplirCase(zone, texte) {
    if (!zone || !texte) return;
    zone.value = texte;
    zone.classList.remove('mise_a_jour');
    void zone.offsetWidth;
    zone.classList.add('mise_a_jour');
  }

  // saisie dans la fenêtre : composants (pop-up) ou parcours (petite fenêtre)
  saisie?.addEventListener('submit', e => {
    e.preventDefault();
    const texte = champ.value.trim();
    if (!texte) return;
    if (panneau.dataset.etape === 'discussion') { champ.value = ''; repondreComposants(texte); }
    else if (panneau.dataset.etape === 'parcours') { champ.value = ''; repondreParcours(texte); }
  });

  // Entrée envoie ; Maj + Entrée : nouvelle ligne
  champ?.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    saisie.requestSubmit();
  });


  // =====================================================================
  // 7. COMPOSANTS (pop-up, IA)
  // [VALIDE: composants] → « continuer » ; [RESUME: …] → porte-documents
  // 2 essais non validés → mascotte « continuer » → porte-documents (bulle)
  // =====================================================================

  const rappelPasser = document.getElementById('rappel_passer');
  const passerEtape  = document.getElementById('passer_etape');

  let composantsValides = false;
  let resumeComposants = '';
  const reponsesComposants = [];
  let essaisComposants = 0;                // erreurs du relais comprises : jamais bloqué

  function lancerComposants() {
    if (!panneau) return versParcours();
    const modele = document.getElementById('texte_composants');
    sceneTexte.replaceChildren(modele.content.cloneNode(true));
    sceneFil.replaceChildren();
    panneau.dataset.humeur = modele.dataset.humeur || 'neutre';
    panneau.dataset.etape = 'discussion';
    panneau.classList.remove('valide');
    boutonSuivant.hidden = true;
    apresAndrea = versParcours;

    panneau.hidden = false;
    panneau.classList.add('popup');
    placerAuCentre();
    champ.focus({ preventScroll: true });
  }

  async function repondreComposants(texte) {
    essaisComposants++;
    reponsesComposants.push(texte);
    ajouterMessage('eleve', texte);
    const r = await envoyer(`${debutMessage()}[Étape : composants de l'ACV]\n[Réponse à la question « Au sein de l'étape de production, quels composants ressortent particulièrement ? »]\n${texte}`);

    if (!r.ok) {
      ajouterMessage('erreur', `${r.erreur} Ton message n’est pas parti : réécris-le dans un instant.`);
      reponsesComposants.pop();
    } else {
      if (r.resume) resumeComposants = r.resume;
      changerHumeur(r.humeur);
      if (r.texte) ajouterMessage('mentor', r.texte);
      if (r.valide === 'composants') validerComposants();
    }
    if (!composantsValides && essaisComposants >= REPONSES_AVANT_PASSER && rappelPasser) rappelPasser.hidden = false;
    if (!composantsValides) champ.focus({ preventScroll: true });
  }

  function validerComposants() {
    composantsValides = true;
    panneau.classList.add('valide');       // zone de texte → « continuer »
    boutonSuivant.textContent = 'continuer';
    boutonSuivant.hidden = false;
    if (rappelPasser) rappelPasser.hidden = true;
  }

  passerEtape?.addEventListener('click', () => {
    if (rappelPasser) rappelPasser.hidden = true;
    fermerAndrea();
  });

  // fin des composants : mémoire, porte-documents, parcours
  function versParcours() {
    sauverMission2({
      qcm_acv: choixAcv,
      composants: { reponses: reponsesComposants, valides: composantsValides, resume: resumeComposants },
    });

    document.dispatchEvent(new CustomEvent('mentor:composants', {
      detail: {
        liste: reponsesComposants,
        valides: composantsValides,
        resume: composantsValides ? resumeComposants : '',
      },
    }));

    const parcours = document.getElementById('partie_parcours');
    if (!parcours) return;
    parcours.hidden = false;
    requestAnimationFrame(() => {
      const titre = document.getElementById('consigne_parcours');
      if (typeof calerEnHaut === 'function') calerEnHaut(titre);
      else titre.scrollIntoView({ behavior: 'smooth' });
      titre.tabIndex = -1;
      titre.focus({ preventScroll: true });
    });
  }


  // =====================================================================
  // 8. PARCOURS UTILISATEUR (petite fenêtre, IA)
  // Entrée ou « soumettre à Andréa » → IA → petite fenêtre :
  // ok : encouragement (numéro vert citron) ; a_approfondir : une question (orange).
  // L'élève peut répondre ou continuer.
  // Mascotte : 2 étapes remplies → rappel ; 7 → « continuer ».
  // =====================================================================

  const etapesParcours = [...document.querySelectorAll('.parcours_etape')];
  const rappelParcours = document.getElementById('rappel_parcours');
  const piedParcours   = document.getElementById('pied_parcours');
  const annonceParcours = document.getElementById('annonce_parcours');
  const ETAPES_AVANT_RAPPEL = 2;
  let basDuSchemaVu = false;              // mascotte : seulement après avoir vu la dernière étape
  let parcoursFini = false;               // « continuer » cliqué : plus de bouton ni de mascotte
  let etapeEnDiscussion = null;           // dernière étape envoyée : la réponse dans la fenêtre la concerne

  const nomEtape   = li => li.dataset.etape;
  const caseDe     = li => li.querySelector('textarea');
  const estRemplie = li => caseDe(li).value.trim() !== '';
  const etapeNommee = nom => etapesParcours.find(li => normaliser(nomEtape(li)) === normaliser(nom));

  // petite fenêtre : parcours
  function ouvrirFenetre(etape = 'parcours') {
    if (!panneau) return false;
    if (!panneau.hidden && panneau.classList.contains('popup')) return false;   // pop-up en cours
    if (panneau.dataset.etape !== etape) { fil.replaceChildren(); panneau.hidden = true; }   // nouvelle partie : fenêtre vide
    panneau.dataset.etape = etape;
    panneau.classList.remove('popup', 'valide', 'reduit');
    panneau.style.transform = '';
    boutonSuivant.hidden = true;
    if (panneau.hidden) {
      fil.replaceChildren();               // fenêtre vide au départ
      panneau.dataset.humeur = 'neutre';
      panneau.hidden = false;
    }
    document.body.classList.add('mentor_visible');
    return true;
  }

  function fermerFenetre() {
    if (!panneau || panneau.dataset.etape !== 'parcours') return;
    panneau.hidden = true;
    document.body.classList.remove('mentor_visible');
  }

  function appliquerAvis(evals) {
    evals.forEach(({ nom, avis }) => {
      const li = etapeNommee(nom);
      if (li) li.dataset.avis = avis;
    });
  }

  function sauverParcours() {
    const parcours = {};
    etapesParcours.forEach(li => {
      const texte = caseDe(li).value.trim();
      if (texte) parcours[nomEtape(li)] = { texte, avis: li.dataset.avis || null };
    });
    sauverMission2({ parcours });
  }

  function verifierParcours() {
    if (!piedParcours || parcoursFini) return;
    const remplies = etapesParcours.filter(estRemplie).length;
    const tout = remplies === etapesParcours.length;
    if (tout && piedParcours.hidden && annonceParcours) {
      annonceParcours.textContent = 'Toutes les étapes sont remplies. Le bouton « continuer » est disponible en bas de l’écran.';
    }
    piedParcours.hidden = !tout;
    if (rappelParcours) rappelParcours.hidden = tout || !basDuSchemaVu || remplies < ETAPES_AVANT_RAPPEL;
  }

  // dernière étape visible à l'écran → la mascotte peut apparaître
  const derniere = etapesParcours[etapesParcours.length - 1];
  if (derniere) {
    new IntersectionObserver(entrees => {
      if (entrees.some(e => e.isIntersecting)) { basDuSchemaVu = true; verifierParcours(); }
    }, { root: document.getElementById('droite_contenu'), threshold: 0.6 }).observe(derniere);
  }

  // une étape validée avec Entrée
  // hauteur des cases = tout le texte visible (exemples de la prof compris)
  function ajusterHauteur(zone) {
    if (!zone.offsetWidth) return;
    zone.style.height = 'auto';
    zone.style.height = `${zone.scrollHeight + 2}px`;
  }
  const largeurs = new WeakMap();
  const hauteurAuto = new ResizeObserver(entrees => entrees.forEach(({ target }) => {
    const l = target.offsetWidth;
    if (largeurs.get(target) === l) return;          // seulement si la largeur change
    largeurs.set(target, l);
    ajusterHauteur(target);
  }));

  // « soumettre à Andréa » : texte écrit et pas encore envoyé
  function majSoumettre(li) {
    const b = li.querySelector('.soumettre_andrea');
    const texte = caseDe(li).value.trim();
    if (b) b.hidden = !texte || texte === li.dataset.envoye;
  }

  async function envoyerEtape(li) {
    const texte = caseDe(li).value.trim();
    if (!texte || texte === li.dataset.envoye) return;
    li.dataset.envoye = texte;
    majSoumettre(li);
    sauverParcours();

    const nom = nomEtape(li);
    const remplies = etapesParcours.filter(estRemplie).length;
    const restantes = etapesParcours.filter(x => !estRemplie(x)).map(nomEtape);
    let message = `${debutMessage()}[Étape : parcours utilisateur]\n[Étape du parcours « ${nom} » (${remplies}/7 remplies)]\n${texte}`;
    message += restantes.length ? `\n[Étapes encore à remplir : ${restantes.join(', ')}.]` : '\n[Toutes les étapes du parcours sont remplies.]';

    li.classList.add('en_lecture');          // Andréa lit
    etapeEnDiscussion = li;
    // la fenêtre s'ouvre tout de suite (« Andréa écrit… »)
    const fenetreOuverte = !parcoursFini && ouvrirFenetre();
    if (fenetreOuverte) ajouterMessage('eleve', texte, nom);
    const r = await envoyer(message);
    li.classList.remove('en_lecture');
    if (!r.ok) {
      delete li.dataset.envoye;
      majSoumettre(li);
      if (fenetreOuverte && !parcoursFini && ouvrirFenetre()) ajouterMessage('erreur', `${r.erreur} Valide à nouveau l’étape « ${nom} » avec Entrée dans un instant.`);
      return;
    }
    appliquerAvis(r.evals);
    r.textes.forEach(({ nom: n, texte: t }) => {
      const cible = etapeNommee(n) || li;
      remplirCase(caseDe(cible), t);
      cible.dataset.envoye = t;
      majSoumettre(cible);
    });
    sauverParcours();

    // Andréa répond toujours : encouragement, ou une question
    if (r.texte && !parcoursFini && ouvrirFenetre()) {
      changerHumeur(r.humeur);
      if (!fenetreOuverte) ajouterMessage('eleve', texte, nom);
      ajouterMessage('mentor', r.texte, null, r.docs);
    }
  }

  // réponse écrite dans la petite fenêtre
  async function repondreParcours(texte) {
    ajouterMessage('eleve', texte);
    const li = etapeEnDiscussion;
    const contexte = li
      ? `[Réponse à ta remarque sur l'étape du parcours « ${nomEtape(li)} »]\n[Texte actuel de la case : ${caseDe(li).value.trim()}]\n`
      : '';
    const r = await envoyer(`${debutMessage()}[Étape : parcours utilisateur]\n${contexte}${texte}`);
    if (!r.ok) {
      ajouterMessage('erreur', `${r.erreur} Ton message n’est pas parti : réécris-le dans un instant.`);
      return;
    }
    const avisAvant = li?.dataset.avis;
    appliquerAvis(r.evals);
    let caseRemplie = false;
    r.textes.forEach(({ nom, texte: t }) => {
      const cible = etapeNommee(nom) || li;
      if (!cible) return;
      remplirCase(caseDe(cible), t);
      cible.dataset.envoye = t;
      majSoumettre(cible);
      if (cible === li) caseRemplie = true;
    });
    // validée sans [TEXTE] : sa précision s'ajoute à la case
    if (li && !caseRemplie && avisAvant === 'a_approfondir' && li.dataset.avis === 'ok') {
      const avant = caseDe(li).value.trim();
      if (!normaliser(avant).includes(normaliser(texte))) {
        const fin = /[.!?…]$/.test(avant) ? '' : '.';
        const ajout = texte.charAt(0).toUpperCase() + texte.slice(1);
        const t = avant ? `${avant}${fin} ${ajout}` : ajout;
        remplirCase(caseDe(li), t);
        li.dataset.envoye = t;
        majSoumettre(li);
      }
    }
    verifierParcours();
    sauverParcours();
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte, null, r.docs);
    champ.focus({ preventScroll: true });
  }

  etapesParcours.forEach((li, i) => {
    const zone = caseDe(li);
    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'qcm_verifier soumettre_andrea';
    bouton.textContent = 'soumettre à Andréa';
    bouton.hidden = true;
    zone.after(bouton);
    bouton.addEventListener('click', () => envoyerEtape(li));

    // exemple de la prof (bleu) : déjà « envoyé », redevient texte de l'élève dès qu'il le modifie
    if (zone.classList.contains('exemple_prof')) {
      li.dataset.envoye = zone.value.trim();
      zone.addEventListener('input', () => zone.classList.remove('exemple_prof'), { once: true });
    }

    zone.addEventListener('input', () => { verifierParcours(); majSoumettre(li); ajusterHauteur(zone); });
    hauteurAuto.observe(zone);              // case affichée ou élargie : hauteur du texte

    // Entrée : envoi + étape suivante ; Maj + Entrée : nouvelle ligne
    zone.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      envoyerEtape(li);
      const suivante = etapesParcours.slice(i + 1).find(x => !estRemplie(x));
      if (suivante) caseDe(suivante).focus();
    });
  });

  // « continuer » : fenêtre fermée → Andréa (pop-up) : choix de la problématique
  piedParcours?.querySelector('button')?.addEventListener('click', () => {
    sauverParcours();
    fermerFenetre();
    if (rappelParcours) rappelParcours.hidden = true;
    piedParcours.hidden = true;
    parcoursFini = true;
    choisirProblematique();
  });


  // =====================================================================
  // 9. LIVRABLE : CHOIX DE LA PROBLÉMATIQUE (pop-up, pas d'IA)
  // texte_livrable : question + 3 choix → « valider mon choix »
  // → texte_fin : Andréa sourit, rappelle le choix → « c'est parti ! » → mission 3
  // =====================================================================

  function choisirProblematique() {
    andreaDit('texte_livrable', 'valider mon choix', null);
    panneau.classList.add('popup_large');  // les 3 choix sur une ligne
    choixProblematiqueOuvert = true;       // pop-up de message, mais Échap ne le ferme pas
  }

  function versMission3() {
    if (typeof afficherSuite === 'function') afficherSuite();
    const lien = document.querySelector('.conteneur_suite a');
    if (lien) lien.click();
    else if (document.body.dataset.pageSuivante) location.href = document.body.dataset.pageSuivante;
  }

  // « valider mon choix » : avant le clic normal (fermerAndrea)
  boutonSuivant?.addEventListener('click', e => {
    if (!choixProblematiqueOuvert) return;
    e.stopImmediatePropagation();
    const coche = sceneTexte.querySelector('input[name="q_problematique"]:checked');
    const erreur = sceneTexte.querySelector('.choix_erreur');
    if (!coche) {
      if (erreur) erreur.hidden = false;
      sceneTexte.querySelector('input[name="q_problematique"]')?.focus();
      return;
    }
    const intitule = coche.closest('label').textContent.replace(/\s+/g, ' ').trim();
    sauverMission2({ problematique: { choix: coche.value, intitule, date: new Date().toISOString() } });
    choixProblematiqueOuvert = false;

    andreaDit('texte_fin', 'c’est parti !', versMission3);
    const place = sceneTexte.querySelector('.choix_problematique');
    if (place) place.textContent = intitule.charAt(0).toLowerCase() + intitule.slice(1);
  }, { capture: true });

})();