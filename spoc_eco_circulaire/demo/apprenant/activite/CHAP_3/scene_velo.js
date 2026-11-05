// =====================================================================
// SCÈNE DU VÉLO CARGO (avec scene_velo.css)
//
// 1. Bouton « c'est parti » : la partie apparaît, le dessin se cale en haut de l'écran.
// 2. La scène de la 1re période entre : son fond et ses dessins apparaissent en fondu,
//    puis les dessins « mobile » arrivent (le vélo, de la droite).
// 3. Le vélo arrivé : la fenêtre de la mascotte s'ouvre (#pop_mascotte).
//    Rien ne réagit (survol, clic, frise) tant qu'elle n'est pas fermée.
//    À sa fermeture, la consigne apparaît en haut.
// 4. La boule de la frise choisit la période. Si la période a une autre scène,
//    l'ancienne SORT (ses dessins mobiles quittent l'écran, puis le fond s'efface),
//    puis la nouvelle ENTRE. Pendant ce temps, rien ne réagit.
// 5. Seuls les dessins qui ont une fenêtre pour la période réagissent.
//    Au survol : le titre de la fenêtre. Au clic : la fenêtre, à côté du dessin, déplaçable.
// 6. « À retenir » d'une période apparaît (en bas à droite) quand toutes ses fenêtres
//    ont été ouvertes.
// 7. Les 4 périodes vues : « continuer » en bas à droite (#pied_scene), avec la mascotte
//    au-dessus s'il reste des fenêtres pas ouvertes (#rappel_scene). « continuer » montre
//    la conclusion (#conclusion_scene) et « passer à la suite » (<body data-suite="cache">).
//
// ---------- LES SCÈNES ----------
// <div class="scene_groupe" data-etapes="production utilisation" data-delai="2000">
//   data-etapes : les périodes où la scène est affichée
//   data-delai  : temps (ms) entre l'apparition du fond et l'arrivée des dessins mobiles
//
// ---------- LES DESSINS QUI BOUGENT : class « mobile » ----------
//   data-arrivee : « droite » / « gauche » = côté de l'écran d'où il arrive (ralentit en arrivant)
//   data-sortie  : « droite » / « gauche » = côté par où il part (démarre doucement, accélère)
//   data-duree, data-duree-sortie : durées en ms
//
// ---------- LE CHARGEMENT : class « chargement » (le carton) ----------
// Quand on quitte la scène : le dessin de data-dans s'ouvre (son 2e dessin, .dessin_ouvert),
// le carton fait une courbe jusqu'à sa porte, le camion se referme, puis les mobiles partent.
//   data-dans    : l'id du dessin où il entre
//   data-porte   : où il entre, en % de ce dessin : « x y » (ex : « 10 55 »)
//   data-arc     : hauteur de la courbe, en px
//   data-recul   : de combien de px il part vers la gauche pendant qu'il monte
//   data-derriere : à quel moment du trajet (0 à 1) il passe derrière le camion
//   data-duree-chargement : durée du trajet, en ms
//
// ---------- LES VÉLOS (Rive) : autant qu'on veut, un par scène ----------
// Sur chaque <canvas class="velo_riv"> :
//   data-riv, data-animation : le fichier et l'animation des roues
//   data-avance : depuis combien de ms les roues tournent déjà quand le vélo entre dans l'écran
//                 (pendant tout le trajet, l'animation repart si elle se termine avant l'arrivée)
//   Ses proportions sont celles de son fichier Rive ; sa largeur = width du canvas.
//
// ---------- L'IMAGE, EN PX ----------
// Tout est placé en px sur une image de la taille du 1er fond, puis l'image entière
// est agrandie ou réduite d'un bloc pour tenir dans la page.
// Taille de chaque dessin : celle de son fichier SVG, sauf width dans le HTML.
// Agrandissement maximal : data-echelle-max sur .scene_cadre (1 par défaut).
//
// À charger APRÈS script.js et dessins.js, avec defer.
// Le lecteur Rive avant, dans le <head> : <script src="rive/rive.js"></script>
// =====================================================================

(function () {

  const scene = document.querySelector('.scene');
  if (!scene) return;

  const partie     = scene.closest('.scene_partie') || scene;
  const depart     = document.querySelector('[data-scene-depart]');
  const cadre      = scene.querySelector('.scene_cadre');
  const image      = scene.querySelector('.scene_image');
  const groupes    = [...scene.querySelectorAll('.scene_groupe')];
  const canvasRive = [...scene.querySelectorAll('.velo_riv')];
  const mascotte   = document.getElementById('pop_mascotte');
  const elements   = [...scene.querySelectorAll('.scene_element')];
  const boutons    = [...scene.querySelectorAll('.frise_etape')];
  const piste      = scene.querySelector('.frise_piste');
  const boule      = scene.querySelector('.frise_boule');
  const retenirs   = [...document.querySelectorAll('.scene_retenir')];
  const annonce    = scene.querySelector('.scene_annonce');
  const fenetres   = [...document.querySelectorAll('dialog.fenetre_scene')];
  const pied       = document.getElementById('pied_scene');
  const rappel     = document.getElementById('rappel_scene');
  const pile       = document.getElementById('pile_scene');
  const conclusion = document.getElementById('conclusion_scene');
  const zoneScroll = document.getElementById('droite_contenu');

  const etapes = boutons.map(b => b.dataset.etape);   // ['production', 'distribution', …]
  const moinsDeMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // taille de chaque canvas Rive, lue avant que Rive ne la change.
  // Sans width / height sur le canvas : la taille de l'artboard du fichier (lue au chargement)
  canvasRive.forEach(c => {
    c._tailleDuFichier = !c.hasAttribute('width');
    if (c._tailleDuFichier) return;
    c._taille = [c.width, c.height];
    c.style.aspectRatio = `${c.width} / ${c.height}`;
  });

  const vus = new Set();
  const etapesVues = new Set();
  let etapeActive = null;
  let groupeActif = null;
  let echelle = 1;
  let enTransition = false;
  let etapeDemandee = null;

  const attendre = ms => new Promise(r => setTimeout(r, moinsDeMouvement ? 0 : ms));
  const groupeDe = nom => groupes.find(g => (g.dataset.etapes || '').split(/\s+/).includes(nom)) || null;


  // =================================================================
  // 1. TAILLES : chaque dessin à sa taille réelle, sauf width dans le HTML
  // =================================================================

  const tailleFixe = el => el.dataset.tailleAuto !== 'oui' && Boolean(el.style.width);

  function tailleNaturelle(el) {
    if (!el) return null;
    if (el._taille) return el._taille;

    if (el.tagName.toLowerCase() === 'svg') {
      const vb = el.viewBox?.baseVal;
      if (vb && vb.width) return [vb.width, vb.height];
      const l = parseFloat(el.getAttribute('width'));
      const h = parseFloat(el.getAttribute('height'));
      return l && h ? [l, h] : null;
    }
    if (el.tagName.toLowerCase() === 'img') {
      return el.naturalWidth ? [el.naturalWidth, el.naturalHeight] : null;
    }
    return null;
  }

  function donnerTaille(el, taille, hauteurAussi) {
    if (!taille || tailleFixe(el)) return;
    el.dataset.tailleAuto = 'oui';
    el.style.width = taille[0] + 'px';
    if (hauteurAussi) el.style.height = taille[1] + 'px';
  }

  function appliquerTailles() {
    if (!image) return;
    donnerTaille(image, tailleNaturelle(image.querySelector('.scene_fond')), true);
    image.querySelectorAll('.scene_decor').forEach(d => donnerTaille(d, tailleNaturelle(d)));
    elements.forEach(el => donnerTaille(el, tailleNaturelle(el.querySelector('svg, img, canvas'))));

    // 2e dessin (camion ouvert) : même hauteur que le 1er, ses propres proportions,
    // calé à droite (il s'allonge par la gauche)
    image.querySelectorAll('.scene_element > .dessin_ouvert').forEach(ouvert => {
      const premier = ouvert.parentElement.querySelector('svg, img');
      const t1 = tailleNaturelle(premier);
      const t2 = tailleNaturelle(ouvert);
      const largeur = parseFloat(ouvert.parentElement.style.width);
      if (!t1 || !t2 || !largeur) return;
      const hauteur = largeur * t1[1] / t1[0];          // hauteur affichée du 1er dessin
      ouvert.style.height = hauteur + 'px';
      ouvert.style.width = (hauteur * t2[0] / t2[1]) + 'px';
    });

    ajusterImage();
  }

  if (image) {
    new MutationObserver(appliquerTailles).observe(image, { childList: true, subtree: true });
    image.querySelectorAll('img').forEach(img => img.addEventListener('load', appliquerTailles));
  }


  // =================================================================
  // 2. L'IMAGE À LA TAILLE DE LA PAGE (mise à l'échelle + centrage)
  // =================================================================

  function ajusterImage() {
    if (!cadre || !image) return;
    const largeur = image.offsetWidth;
    const hauteur = image.offsetHeight;
    if (!largeur || !cadre.clientWidth) return;

    const max = parseFloat(cadre.dataset.echelleMax) || 1;
    echelle = Math.min(max, cadre.clientWidth / largeur);

    image.style.transform = `scale(${echelle})`;
    image.style.left = ((cadre.clientWidth - largeur * echelle) / 2) + 'px';
    image.style.setProperty('--echelle', echelle);

    // le cadre englobe aussi les dessins qui dépassent en bas du fond
    // (sans les dessins qui bougent : leur place change)
    const haut = image.getBoundingClientRect().top;
    let bas = hauteur * echelle;
    image.querySelectorAll('.scene_groupe > :not(.mobile)').forEach(el => {
      if (el.getAnimations?.().length) return;
      const r = el.getBoundingClientRect();
      if (r.height) bas = Math.max(bas, r.bottom - haut);
    });
    cadre.style.height = bas + 'px';

    canvasRive.forEach(c => redessiner(c));
  }

  if (cadre && 'ResizeObserver' in window) new ResizeObserver(ajusterImage).observe(cadre);


  // =================================================================
  // 3. LE VÉLO (Rive)
  // =================================================================

  // un lecteur Rive par canvas : c._rive (le lecteur), c._charge (fichier chargé)

  canvasRive.forEach(c => {
    if (typeof rive === 'undefined') {
      console.warn('Scène : le lecteur Rive n’est pas chargé, les vélos ne rouleront pas.');
      return;
    }
    c._charge = false;
    c._enAttente = null;
    c._rive = new rive.Rive({
      src: c.dataset.riv,
      canvas: c,
      autoplay: false,
      autoBind: true,
      onLoad: () => {
        const r = c._rive;
        if (typeof appliquerPaletteRive === 'function') appliquerPaletteRive(r, c);

        // proportions (et taille, si le canvas n'en a pas) : celles de l'artboard
        const b = r.bounds;
        if (b && b.maxX - b.minX > 0) {
          const l = b.maxX - b.minX, h = b.maxY - b.minY;
          c.style.aspectRatio = `${l} / ${h}`;
          if (c._tailleDuFichier) c._taille = [l, h];
        }

        // l'animation des roues : celle de data-animation si elle existe dans le fichier,
        // sinon la première animation du fichier, sinon sa première state machine
        const anims = r.animationNames || [];
        const machines = r.stateMachineNames || [];
        if (anims.includes(c.dataset.animation)) c._anim = c.dataset.animation;
        else if (anims.length) c._anim = anims[0];
        else c._machine = machines[0];
        if (c.dataset.animation && c._anim !== c.dataset.animation) {
          console.warn(`Rive : pas d'animation « ${c.dataset.animation} » dans ${c.dataset.riv}.`,
                       'Animations du fichier :', anims, '— state machines :', machines);
        }

        // pendant le trajet, les roues ne s'arrêtent jamais : si l'animation se termine
        // avant l'arrivée, elle repart
        r.on(rive.EventType.Stop, () => {
          if (!c._enRoute) return;
          if (c._anim) { try { r.scrub(c._anim, 0); } catch { /* rien */ } r.play(c._anim); }
          else if (c._machine) r.play(c._machine);
        });

        c._charge = true;
        appliquerTailles();
        if (c._enAttente) { c._enAttente(); c._enAttente = null; }
      },
      onLoadError: e => console.error('Rive :', c.dataset.riv, e),
    });
  });

  function quandCharge(c, action) {
    if (!c?._rive) return;
    if (c._charge) action(c._rive);
    else c._enAttente = () => action(c._rive);
  }

  // le canvas Rive d'un dessin (ou rien)
  const riveDe = el => el.querySelector?.('.velo_riv') || null;

  function redessiner(c) {
    if (!c?._charge) return;
    c._rive.resizeDrawingSurfaceToCanvas();
    c._rive.drawFrame?.();
  }

  // les roues tournent, en partant de « depuis » ms dans l'animation
  function rouler(c, depuis) {
    c._enRoute = true;
    quandCharge(c, r => {
      r.resizeDrawingSurfaceToCanvas();
      if (c._anim) {
        try { r.scrub(c._anim, (depuis || 0) / 1000); } catch { /* ancienne version de Rive */ }
        r.play(c._anim);
      } else if (c._machine) {
        r.play(c._machine);
      }
    });
  }
  const arreter = c => { c._enRoute = false; quandCharge(c, r => r.pause()); };


  // =================================================================
  // 4. MOUVEMENTS : arrivée, sortie, chargement
  // =================================================================

  // distance (en px de l'image) pour qu'un dessin soit juste hors de l'écran, d'un côté
  function horsEcran(el, cote) {
    const r = el.getBoundingClientRect();
    return cote === 'gauche'
      ? -(r.right + 40) / echelle
      : (window.innerWidth - r.left + 40) / echelle;
  }

  function animer(el, images, options) {
    return new Promise(resolve => {
      if (moinsDeMouvement || !el.animate) { resolve(); return; }
      const a = el.animate(images, options);
      a.onfinish = resolve;
      a.oncancel = resolve;
    });
  }

  // arrive d'un côté de l'écran et ralentit jusqu'à sa place
  async function arriver(el) {
    const cote = el.dataset.arrivee || 'droite';
    const distance = horsEcran(el, cote);
    const duree = parseFloat(el.dataset.duree) || 1500;

    el.classList.add('en_scene');
    const c = riveDe(el);
    if (c) rouler(c, parseFloat(c.dataset.avance) || 0);

    await animer(el,
      [{ transform: `translateX(${distance}px)` }, { transform: 'translateX(0)' }],
      { duration: duree, easing: 'cubic-bezier(.25, .6, .3, 1)', fill: 'backwards' });

    if (c) arreter(c);
  }

  // part doucement, accélère, et quitte l'écran
  async function partir(el) {
    const cote = el.dataset.sortie || 'gauche';
    const distance = horsEcran(el, cote);
    const duree = parseFloat(el.dataset.dureeSortie || el.dataset.duree) || 1500;

    const c = riveDe(el);
    if (c) rouler(c, 0);   // l'animation des roues repart du début

    await animer(el,
      [{ transform: 'translateX(0)' }, { transform: `translateX(${distance}px)` }],
      { duration: duree, easing: 'cubic-bezier(.55, 0, .9, .4)', fill: 'forwards' });

    if (c) arreter(c);
    el.classList.remove('en_scene');
  }

  // le carton fait une courbe et entre par la porte du camion
  async function charger(carton) {
    const camion = document.getElementById(carton.dataset.dans);
    if (!camion) return;

    camion.classList.add('ouvert');
    await attendre(350);

    // point d'arrivée (la porte), en px de l'image, par rapport à la place du carton
    const [px, py] = (carton.dataset.porte || '10 55').split(/\s+/).map(v => parseFloat(v) / 100);
    const rc = carton.getBoundingClientRect();
    const rm = camion.getBoundingClientRect();
    const dx = (rm.left + rm.width * px - (rc.left + rc.width / 2)) / echelle;
    const dy = (rm.top + rm.height * py - (rc.top + rc.height / 2)) / echelle;
    const arc = parseFloat(carton.dataset.arc) || 250;
    const recul = parseFloat(carton.dataset.recul ?? 100);
    const duree = parseFloat(carton.dataset.dureeChargement) || 1400;
    const momentDerriere = parseFloat(carton.dataset.derriere ?? 0.5);

    // courbe en « boomerang » : part vers la gauche en montant, puis revient plonger
    // vers la porte, en passant derrière le camion
    // (le point de contrôle p1 est réglé pour que le carton recule de « recul » px au plus loin)
    const p2 = [dx * 0.25, -arc * 1.35];
    const plusAGauche = k => {
      let min = 0;
      for (let i = 1; i < 50; i++) {
        const t = i / 50, u = 1 - t;
        min = Math.min(min, 3 * u * u * t * (-recul * k) + 3 * u * t * t * p2[0] + t * t * t * dx);
      }
      return min;
    };
    let k = 1;
    while (recul > 0 && plusAGauche(k) > -recul && k < 20) k += 0.05;
    const p1 = [-recul * k, -arc];
    const point = t => {
      const u = 1 - t;
      return [
        3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * dx,
        3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * dy,
      ];
    };

    const images = [];
    const N = 24;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const [x, y] = point(t);
      images.push({
        offset: t,
        transform: `translate(${x}px, ${y}px) rotate(${-20 * Math.sin(t * Math.PI)}deg) scale(${1 - 0.3 * t})`,
        opacity: t < 0.92 ? 1 : 1 - (t - 0.92) / 0.08,
      });
    }

    // au sommet de la courbe, le carton passe derrière le camion
    carton.classList.add('en_vol');
    const passage = setTimeout(() => carton.classList.add('derriere'), duree * momentDerriere);
    await animer(carton, images, { duration: duree, easing: 'ease-in-out', fill: 'forwards' });
    clearTimeout(passage);
    carton.classList.remove('en_vol');

    await attendre(250);
    camion.classList.remove('ouvert');
    await attendre(350);
  }


  // ---------- entrée et sortie d'une scène ----------

  // remet tout à sa place (après une sortie)
  function remettre(groupe) {
    groupe.querySelectorAll('.mobile, .chargement').forEach(el => {
      el.getAnimations().forEach(a => a.cancel());
      el.classList.remove('en_scene', 'ouvert', 'derriere');
    });
  }

  async function entrer(groupe) {
    if (!groupe) return;
    remettre(groupe);
    groupe.querySelectorAll('.velo_riv').forEach(c => quandCharge(c, () => redessiner(c)));
    groupe.classList.add('visible');                       // fond + dessins immobiles, en fondu
    const mobiles = [...groupe.querySelectorAll('.mobile')];
    if (!mobiles.length) { await attendre(800); return; }

    await attendre(parseFloat(groupe.dataset.delai) || 600);
    await Promise.all(mobiles.map(arriver));
  }

  async function sortir(groupe) {
    if (!groupe) return;
    for (const carton of groupe.querySelectorAll('.chargement')) await charger(carton);
    await Promise.all([...groupe.querySelectorAll('.mobile.en_scene')].map(partir));
    groupe.classList.remove('visible');                    // le fond s'efface en fondu
    await attendre(800);
  }

  // passe à la scène d'une période (si ce n'est pas déjà la même)
  async function changerScene(nom) {
    const nouveau = groupeDe(nom);
    if (nouveau === groupeActif) return;

    enTransition = true;
    scene.classList.remove('interactif');
    fermerFenetres();

    await sortir(groupeActif);
    groupeActif = nouveau;
    await entrer(nouveau);

    enTransition = false;
    if (partie.classList.contains('consigne_visible')) scene.classList.add('interactif');

    // une autre période a été demandée pendant la transition
    if (etapeDemandee && groupeDe(etapeDemandee) !== groupeActif) changerScene(etapeDemandee);
  }


  // =================================================================
  // 5. DÉROULÉ : « c'est parti » → 1re scène → mascotte → consigne
  // =================================================================

  function lancer() {
    if (depart) depart.hidden = true;
    partie.hidden = false;
    appliquerTailles();
    canvasRive.forEach(c => quandCharge(c, () => redessiner(c)));

    requestAnimationFrame(() => requestAnimationFrame(() => calerDessin(async () => {
      choisirEtape(etapes[0], true, true);
      groupeActif = groupeDe(etapes[0]);
      enTransition = true;
      await entrer(groupeActif);
      enTransition = false;

      scene.classList.add('arrive');                        // la frise apparaît (pas encore active)
      if (mascotte) setTimeout(() => mascotte.showModal(), 1800);   // délai en ms
      else montrerConsigne();
    })));
  }

  // fait défiler pour que le DESSIN soit en haut, juste sous le bandeau :
  // la consigne bleue passe au-dessus, on la voit en remontant
  function calerDessin(surFin) {
    const cible = cadre || scene;
    if (!zoneScroll) { cible.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => surFin?.(), 700); return; }

    const bandeau = document.getElementById('haut')?.getBoundingClientRect().bottom
                 ?? zoneScroll.getBoundingClientRect().top;
    const position = zoneScroll.scrollTop + cible.getBoundingClientRect().top - bandeau - 20;

    if (typeof glisserA === 'function') glisserA(position, surFin);
    else { zoneScroll.scrollTo({ top: position, behavior: 'smooth' }); setTimeout(() => surFin?.(), 700); }
  }

  // la mascotte fermée : la consigne apparaît et tout devient actif
  function montrerConsigne() {
    partie.classList.add('consigne_visible');
    if (!enTransition) scene.classList.add('interactif');
    if (pile) pile.hidden = false;
  }

  if (mascotte) {
    mascotte.querySelectorAll('.qcm_fermer, [data-fermer]').forEach(b => b.addEventListener('click', () => mascotte.close()));
    mascotte.addEventListener('close', montrerConsigne, { once: true });
  }

  depart?.querySelector('button')?.addEventListener('click', lancer);
  if (!depart) lancer();


  // =================================================================
  // 6. LES PÉRIODES
  // =================================================================

  // « production:pop_a fin_de_vie:pop_b » → { production: 'pop_a', fin_de_vie: 'pop_b' }
  const documentsDe = el => Object.fromEntries(
    (el.dataset.documents || '').trim().split(/\s+/).filter(Boolean).map(paire => paire.split(':'))
  );

  const titreDe = id => document.getElementById(id)?.querySelector('h4')?.textContent.trim() || '';

  const docsParEtape = {};
  elements.forEach(el => {
    Object.entries(documentsDe(el)).forEach(([etape, doc]) => {
      (docsParEtape[etape] ||= new Set()).add(doc);
    });
  });
  const total = Object.values(docsParEtape).reduce((n, docs) => n + docs.size, 0);


  // sansScene : au lancement, la scène est gérée par lancer()
  function choisirEtape(nom, sansGlisser, sansScene) {
    if (!nom) return;
    const changement = nom !== etapeActive;
    etapeActive = nom;
    etapeDemandee = nom;
    const index = etapes.indexOf(nom);
    const bouton = boutons[index];
    const titre = bouton?.querySelector('.frise_titre')?.textContent || nom;

    boutons.forEach(b => b.setAttribute('aria-pressed', String(b === bouton)));
    if (!glisse) placerBoule(index, sansGlisser);
    if (boule) {
      boule.setAttribute('aria-valuenow', index + 1);
      boule.setAttribute('aria-valuetext', titre);
    }
    if (!changement) return;

    let nombre = 0;
    elements.forEach(el => {
      const doc = documentsDe(el)[nom];
      el.disabled = !doc;
      el.classList.toggle('vu', Boolean(doc) && vus.has(doc));

      const texte = doc ? titreDe(doc) : '';
      const nomSurvol = el.querySelector('.scene_nom');
      if (nomSurvol) nomSurvol.textContent = texte;
      if (texte) el.setAttribute('aria-label', texte);
      else el.removeAttribute('aria-label');

      if (doc) nombre++;
    });

    fermerFenetres();
    majRetenir();
    scene.dataset.etape = nom;

    etapesVues.add(nom);
    majFin();

    if (annonce) annonce.textContent = `${titre} : ${nombre} éléments à découvrir dans l’image.`;

    if (!sansScene && !enTransition) changerScene(nom);
  }


  // ---------- « À retenir » : quand toutes les fenêtres de la période sont ouvertes ----------

  const etapeComplete = nom => [...(docsParEtape[nom] || [])].every(d => vus.has(d));

  function majRetenir() {
    retenirs.forEach(r => {
      r.hidden = !(r.dataset.etape === etapeActive && etapeComplete(etapeActive));
    });
  }


  // ---------- fin : « continuer » après les 4 périodes ----------

  function majFin() {
    if (!pied) return;
    if (!etapes.every(e => etapesVues.has(e))) return;
    pied.hidden = false;
    if (rappel) rappel.hidden = vus.size >= total;
  }

  document.getElementById('continuer_scene')?.addEventListener('click', () => {
    fermerFenetres();
    if (pile) pile.hidden = true;
    if (conclusion) conclusion.hidden = false;
    if (typeof afficherSuite === 'function') afficherSuite();
    if (typeof marquerPartieFaite === 'function' && typeof numPartie !== 'undefined') marquerPartieFaite(numPartie);

    const cible = conclusion || document.querySelector('.conteneur_suite');
    if (cible && typeof calerEnHaut === 'function') calerEnHaut(cible);
    else cible?.scrollIntoView({ behavior: 'smooth' });
  });


  // =================================================================
  // 7. LA FRISE : la boule glisse et se pose au milieu de la période
  //    (la période change quand on lâche la boule)
  // =================================================================

  let glisse = false;

  const segments = etapes.map(nom => {
    const s = document.createElement('span');
    s.className = 'frise_segment';
    s.dataset.etape = nom;
    piste?.insertBefore(s, boule);
    return s;
  });

  const centreDe = i => segments[i] ? segments[i].offsetLeft + segments[i].offsetWidth / 2 : 0;

  function placerBoule(index, sansGlisser) {
    if (!boule || index < 0) return;
    boule.classList.toggle('sans_transition', Boolean(sansGlisser));
    boule.style.left = centreDe(index) + 'px';
    surligner(index);
  }

  // la période sous la boule : sa portion de ligne en gras, son titre visible
  function surligner(index) {
    segments.forEach((s, i) => s.classList.toggle('actif', i === index));
    boutons.forEach((b, i) => b.classList.toggle('survolee', i === index));
  }

  function indexSous(x) {
    let meilleur = 0;
    segments.forEach((s, i) => { if (x >= s.offsetLeft) meilleur = i; });
    return meilleur;
  }

  if (boule && piste) {
    boule.setAttribute('aria-valuemin', 1);
    boule.setAttribute('aria-valuemax', etapes.length);

    piste.addEventListener('pointerdown', e => {
      e.preventDefault();
      glisse = true;
      boule.classList.add('sans_transition', 'en_main');
      boule.focus({ preventScroll: true });
      piste.setPointerCapture(e.pointerId);
      let index = etapes.indexOf(etapeActive);

      const bouger = ev => {
        const r = piste.getBoundingClientRect();
        const x = Math.min(centreDe(etapes.length - 1), Math.max(centreDe(0), (ev.clientX - r.left) / (r.width / piste.offsetWidth)));
        boule.style.left = x + 'px';
        index = indexSous(x);
        surligner(index);
      };

      const lacher = () => {
        glisse = false;
        boule.classList.remove('en_main');
        piste.removeEventListener('pointermove', bouger);
        piste.removeEventListener('pointerup', lacher);
        piste.removeEventListener('pointercancel', lacher);
        choisirEtape(etapes[index]);
        placerBoule(index);                 // glisse au milieu de sa période
      };

      bouger(e);
      piste.addEventListener('pointermove', bouger);
      piste.addEventListener('pointerup', lacher);
      piste.addEventListener('pointercancel', lacher);
    });

    boule.addEventListener('keydown', e => {
      const i = etapes.indexOf(etapeActive);
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   n = Math.min(etapes.length - 1, i + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') n = Math.max(0, i - 1);
      if (e.key === 'Home') n = 0;
      if (e.key === 'End')  n = etapes.length - 1;
      if (n === null) return;
      e.preventDefault();
      choisirEtape(etapes[n]);
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => placerBoule(etapes.indexOf(etapeActive), true)).observe(piste);
    }
  }

  boutons.forEach(b => b.addEventListener('click', () => choisirEtape(b.dataset.etape)));


  // =================================================================
  // 8. LES FENÊTRES : à côté du dessin, déplaçables
  // =================================================================

  const MARGE = 16;

  function fermerFenetres(sauf) {
    fenetres.forEach(f => { if (f !== sauf && f.open) f.close(); });
  }

  function placerFenetre(fenetre, el) {
    const r = el.getBoundingClientRect();
    const l = fenetre.offsetWidth;
    const h = fenetre.offsetHeight;
    const haut = (document.getElementById('haut')?.getBoundingClientRect().bottom || 0) + MARGE;
    const bas = window.innerHeight - (document.getElementById('bandeau_bas')?.offsetHeight || 0) - MARGE;

    let x;
    if (r.right + MARGE + l <= window.innerWidth - MARGE) x = r.right + MARGE;
    else if (r.left - MARGE - l >= MARGE)                  x = r.left - MARGE - l;
    else                                                   x = (window.innerWidth - l) / 2;

    let y = r.top + r.height / 2 - h / 2;
    y = Math.max(haut, Math.min(y, bas - h));

    fenetre.style.left = Math.max(MARGE, x) + 'px';
    fenetre.style.top = Math.max(MARGE, y) + 'px';
  }

  function rendreGrappable(fenetre) {
    fenetre.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button, a, summary, input, textarea')) return;
      if (e.offsetX > fenetre.clientWidth) return;

      const x0 = e.clientX - fenetre.offsetLeft;
      const y0 = e.clientY - fenetre.offsetTop;
      fenetre.setPointerCapture(e.pointerId);
      fenetre.classList.add('deplacement');

      const bouger = ev => {
        fenetre.style.left = Math.min(window.innerWidth - 60, Math.max(60 - fenetre.offsetWidth, ev.clientX - x0)) + 'px';
        fenetre.style.top = Math.min(window.innerHeight - 40, Math.max(0, ev.clientY - y0)) + 'px';
      };
      const lacher = () => {
        fenetre.classList.remove('deplacement');
        fenetre.removeEventListener('pointermove', bouger);
        fenetre.removeEventListener('pointerup', lacher);
        fenetre.removeEventListener('pointercancel', lacher);
      };
      fenetre.addEventListener('pointermove', bouger);
      fenetre.addEventListener('pointerup', lacher);
      fenetre.addEventListener('pointercancel', lacher);
    });
  }

  fenetres.forEach(fenetre => {
    fenetre.tabIndex = -1;
    fenetre.querySelector('.qcm_fermer')?.addEventListener('click', () => fenetre.close());
    rendreGrappable(fenetre);
    fenetre.addEventListener('close', () => fenetre._dessin?.focus({ preventScroll: true }));
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermerFenetres(); });
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('dialog.fenetre_scene, .scene_element')) return;
    fermerFenetres();
  });


  // ---------- clic sur un dessin ----------

  elements.forEach(el => {
    el.setAttribute('aria-haspopup', 'dialog');

    el.addEventListener('click', () => {
      if (enTransition) return;
      const id = documentsDe(el)[etapeActive];
      const fenetre = id && document.getElementById(id);
      if (!fenetre) return;

      fermerFenetres(fenetre);
      fenetre._dessin = el;
      if (!fenetre.open) fenetre.show();
      fenetre.scrollTop = 0;
      placerFenetre(fenetre, el);
      fenetre.focus({ preventScroll: true });

      vus.add(id);
      el.classList.add('vu');
      majRetenir();
      majFin();
    });
  });

})();