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
//   6. Les composants           question ouverte, discutée avec l'IA dans le pop-up d'Andréa
//
// Signaux invisibles écrits par l'IA (retirés avant affichage) :
//   [VALIDE: composants]               la réponse sur les composants est validée
//   [HUMEUR: neutre|content|decu]      le visage d'Andréa
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

  function fermerAndrea() {
    if (!panneau || panneau.hidden) return;
    panneau.hidden = true;                  // fondu de sortie (mentor.css)
    const suite = apresAndrea;
    apresAndrea = null;
    if (suite) suite();
  }

  if (panneau) {
    boutonSuivant?.addEventListener('click', fermerAndrea);
    // Échap ferme un pop-up de message, comme le bouton (pas une discussion en cours)
    panneau.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panneau.dataset.etape === 'message') fermerAndrea();
    });
    // le pop-up change de taille (dessin chargé, fenêtre redimensionnée) : on le recentre
    new ResizeObserver(() => { if (!panneau.hidden) placerAuCentre(); }).observe(panneau);
    window.addEventListener('resize', () => { if (!panneau.hidden) placerAuCentre(); });
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
  // 6. LES COMPOSANTS : DISCUSSION AVEC L'IA
  // Le pop-up d'Andréa pose la question (<template id="texte_composants">) ;
  // l'élève répond dans la zone de texte, l'IA (agent de la mission 2) réagit.
  // Quand l'IA écrit [VALIDE: composants], « continuer » remplace la zone de texte.
  // Après 3 réponses non validées, la mascotte propose de passer quand même.
  // =====================================================================

  // en local (lancer_test.bat) : le relais de ton ordinateur ; en ligne : Supabase
  const ADRESSE_RELAIS = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'api/mentor'
    : 'https://dhssndnqurrpidyxatwj.supabase.co/functions/v1/mentor';
  const MISSION = 2;                      // le relais choisit l'agent de la mission 2
  const LONGUEUR_MAX = 2000;
  const REPONSES_AVANT_PASSER = 3;      // la mascotte propose de passer après 3 réponses non validées
  const CLE_ENJEUX = 'athentech_enjeux';  // laissé par la mission 1
  const CLE_MISSION2 = 'athentech_mission2';

  const sceneFil    = panneau?.querySelector('.mentor_scene_fil');
  const etat        = panneau?.querySelector('.mentor_etat');
  const saisie      = panneau?.querySelector('.mentor_saisie');
  const champ       = saisie?.querySelector('textarea');
  const envoi       = saisie?.querySelector('button[type="submit"]');
  const rappelPasser = document.getElementById('rappel_passer');
  const passerEtape  = document.getElementById('passer_etape');

  let conversationId = null;             // la même conversation pour toute la mission 2
  let enCours = false;
  let composantsValides = false;
  const reponsesComposants = [];

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

  // une bulle dans le pop-up (l'élève, Andréa, ou un message d'erreur)
  function ajouterMessage(qui, texte) {
    const bulle = document.createElement('div');
    bulle.className = `mentor_message mentor_message_${qui}`;

    const auteur = document.createElement('span');
    auteur.className = 'visuellement_cache';
    auteur.textContent = qui === 'eleve' ? 'Toi : ' : qui === 'mentor' ? 'Andréa : ' : 'Information : ';

    const p = document.createElement('p');
    p.className = 'mentor_texte';
    p.textContent = texte;

    bulle.append(auteur, p);
    sceneFil.appendChild(bulle);
    sceneFil.scrollTop = sceneFil.scrollHeight;   // le dernier message reste visible
  }

  function attente(active) {
    enCours = active;
    envoi.disabled = active;
    sceneFil.setAttribute('aria-busy', String(active));
    etat.textContent = active ? 'Andréa écrit…' : '';
  }

  // Retire les signaux de l'IA et les applique
  function lireSignaux(texte) {
    texte = texte.replace(/\[\s*VALIDE\s*:\s*([a-zéè_ ]+?)\s*\]/gi, (_, quoi) => {
      if (quoi.trim().toLowerCase() === 'composants') validerComposants();
      return '';
    });
    texte = texte.replace(/\[\s*HUMEUR\s*:\s*([a-zéè_]+)\s*\]/gi, (_, humeur) => {
      panneau.dataset.humeur = humeur.toLowerCase();
      return '';
    });
    // tout autre signal oublié par l'IA n'est pas montré à l'élève
    texte = texte.replace(/\[\s*(EVAL|VALIDE|HUMEUR)[^\]]*\]/gi, '');
    return texte.replace(/\n{3,}/g, '\n\n').trim();
  }

  function validerComposants() {
    composantsValides = true;
    panneau.classList.add('valide');       // la zone de texte disparaît (activite/mission2.css)
    boutonSuivant.textContent = 'continuer';
    boutonSuivant.hidden = false;
    if (rappelPasser) rappelPasser.hidden = true;
  }

  // le contexte, envoyé une seule fois au début de la conversation
  function contexte() {
    const lignes = [`[Contexte : QCM « quel enseignement principal ? » : choix successifs ${choixAcv.join(', ') || 'B'}.]`];
    try {
      const m1 = JSON.parse(localStorage.getItem(CLE_ENJEUX) || 'null');
      if (m1 && Array.isArray(m1.reponses) && m1.reponses.length) {
        lignes.push(`[Contexte : enjeux retenus en mission 1 (${m1.valides ? 'validés' : 'non validés'}) : ${m1.reponses.join(' / ')}]`);
      }
    } catch { /* rien de la mission 1 : tant pis */ }
    return lignes.join('\n') + '\n';
  }

  async function envoyer(texte) {
    attente(true);
    try {
      const corps = { message: texte.slice(0, LONGUEUR_MAX), conversation_id: conversationId, mission: MISSION };
      const reponse = await fetch(ADRESSE_RELAIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corps),
      });
      const donnees = await reponse.json().catch(() => ({}));
      if (!reponse.ok || !donnees.reponse) throw new Error(donnees.erreur || 'Andréa ne répond pas.');

      conversationId = donnees.conversation_id || conversationId;
      const propre = lireSignaux(donnees.reponse);
      if (propre) ajouterMessage('mentor', propre);

    } catch (erreur) {
      ajouterMessage('erreur', `${erreur.message} Ton message n’est pas parti : réécris-le dans un instant.`);
      reponsesComposants.pop();            // cette réponse ne compte pas
    } finally {
      attente(false);
      // après 3 réponses non validées, la mascotte propose de passer
      if (!composantsValides && reponsesComposants.length >= REPONSES_AVANT_PASSER && rappelPasser) {
        rappelPasser.hidden = false;
      }
      if (!composantsValides) champ.focus({ preventScroll: true });
    }
  }

  saisie?.addEventListener('submit', e => {
    e.preventDefault();
    const texte = champ.value.trim();
    if (!texte || enCours || panneau.dataset.etape !== 'discussion') return;
    champ.value = '';

    reponsesComposants.push(texte);
    ajouterMessage('eleve', texte);
    const debut = conversationId ? '' : contexte();
    envoyer(`${debut}[Étape : composants de l'ACV]\n[Réponse à la question « Au sein de l'étape de production, quels composants ressortent particulièrement ? »]\n${texte}`);
  });

  // Entrée envoie ; Maj + Entrée passe à la ligne
  champ?.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    saisie.requestSubmit();
  });

  // « continuer » (après validation) ou « continuer » de la mascotte : on passe au parcours
  passerEtape?.addEventListener('click', () => {
    if (rappelPasser) rappelPasser.hidden = true;
    fermerAndrea();
  });

  // Fin de la question des composants : on garde les réponses, puis le parcours utilisateur apparaît
  function versParcours() {
    try {
      localStorage.setItem(CLE_MISSION2, JSON.stringify({
        qcm_acv: choixAcv,
        composants: { reponses: reponsesComposants, valides: composantsValides },
        date: new Date().toISOString(),
      }));
    } catch { /* stockage indisponible : l'activité continue */ }

    const parcours = document.getElementById('partie_parcours');
    if (!parcours) return;
    parcours.hidden = false;
    requestAnimationFrame(() => {
      const consigne = document.getElementById('consigne_parcours');
      if (typeof calerEnHaut === 'function') calerEnHaut(consigne);
      else consigne.scrollIntoView({ behavior: 'smooth' });
      consigne.tabIndex = -1;
      consigne.focus({ preventScroll: true });
    });
  }

})();