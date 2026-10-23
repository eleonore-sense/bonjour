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
    // Échap ferme le pop-up, comme le bouton
    panneau.addEventListener('keydown', e => { if (e.key === 'Escape') fermerAndrea(); });
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

  const DUREE_CERCLE = 900;   // durée du glissement vers le cercle, en millisecondes

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

    // 3. chaque étape part de son ancienne place et glisse jusqu'au cercle
    cartes.forEach((carte, i) => {
      const a = avant.get(carte);
      const b = carte.getBoundingClientRect();
      carte.animate(
        [{ translate: `${a.left - b.left}px ${a.top - b.top}px` }, { translate: '0 0' }],
        { duration: DUREE_CERCLE, easing: 'ease-in-out', delay: i * 60, fill: 'backwards' }
      );
    });

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

})();