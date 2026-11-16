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
// 6. « À retenir » d'une période (dialog.fenetre_retenir) s'ouvre quand on la quitte
//    après avoir ouvert toutes ses fenêtres ; son bouton lance la suite.
// 7. Au moins une fenêtre ouverte dans chaque période : « continuer » en bas à droite (#pied_scene), avec la mascotte
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
//   data-arrets  : moments où il s'arrête pendant son trajet, en ms : « 1250-2140 3480-4160 »
//                  (pour l'arrivée ET la sortie ; il avance à petits coups entre les arrêts)
//   data-courbe  : avec data-arrets, la courbe de chaque poussée
//                  (par défaut très lent → rapide → très lent, très marqué)
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
//   data-boucle : durée de l'animation Rive, en ms. Avec lui, les roues suivent exactement
//                 le temps du déplacement (et ses data-arrets), en boucle.
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
  const retenirs   = [...document.querySelectorAll('dialog.fenetre_retenir')];
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
  let rappelDepart = false;   // on quitte une période pas finie (jusqu'à l'arrivée de la nouvelle scène)
  let rappelRetour = false;   // on est revenu sur une période pas finie

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

  const COURBE_POUSSEE = 'cubic-bezier(.85, 0, .15, 1)';   // très lent → rapide → très lent

  // les images d'un trajet de « de » à « a » (en px), avec des arrêts (data-arrets).
  // Le trajet est réparti entre les moments où il avance ; chaque poussée démarre et finit
  // doucement (data-courbe). Sans arrêts : un seul mouvement, avec la courbe « courbe ».
  function trajet(el, de, a, duree, courbe) {
    const arrets = (el.dataset.arrets || '').trim().split(/\s+/).filter(Boolean)
      .map(t => t.split('-').map(Number))
      .filter(([d, f]) => f > d && d >= 0 && f <= duree)
      .sort((x, y) => x[0] - y[0]);
    if (!arrets.length) {
      return { images: [{ transform: `translateX(${de}px)` }, { transform: `translateX(${a}px)` }], easing: courbe };
    }

    // les moments où il avance : [début, fin] en ms
    const avances = [];
    let t = 0;
    arrets.forEach(([d, f]) => { if (d > t) avances.push([t, d]); t = Math.max(t, f); });
    if (t < duree) avances.push([t, duree]);
    const tempsAvance = avances.reduce((somme, [d, f]) => somme + f - d, 0);

    const images = [];
    let x = de;
    let fait = 0;
    const poussee = el.dataset.courbe || COURBE_POUSSEE;
    avances.forEach(([d, f]) => {
      images.push({ offset: d / duree, transform: `translateX(${x}px)`, easing: poussee });
      fait += f - d;
      x = de + (a - de) * fait / tempsAvance;
      // fin de la poussée : il reste là jusqu'à la suivante
      images.push({ offset: f / duree, transform: `translateX(${x}px)` });
    });
    if (images[0].offset > 0) images.unshift({ offset: 0, transform: `translateX(${de}px)` });
    if (images.at(-1).offset < 1) images.push({ offset: 1, transform: `translateX(${a}px)` });
    return { images, easing: 'linear' };
  }

  // quandLance(animation) : appelé dès que le mouvement démarre
  function animer(el, images, options, quandLance) {
    return new Promise(resolve => {
      if (moinsDeMouvement || !el.animate) { resolve(); return; }
      const a = el.animate(images, options);
      a.onfinish = resolve;
      a.oncancel = resolve;
      quandLance?.(a);
    });
  }

  // ---------- roues calées sur le déplacement (data-boucle sur le canvas) ----------
  // L'animation Rive ne joue plus seule : à chaque image, elle est mise au même temps
  // que le déplacement (modulo data-boucle = durée de l'animation Rive, en ms).
  // Les arrêts du vélo (data-arrets) tombent donc toujours pile avec ceux des roues.

  function caler(c, mouvement) {
    const boucle = parseFloat(c.dataset.boucle);
    c._cale = mouvement;
    quandCharge(c, r => {
      if (!c._anim) return;
      r.resizeDrawingSurfaceToCanvas();
      try { r.play(c._anim); r.pause(c._anim); } catch { /* rien */ }   // prépare l'animation
      const image = () => {
        if (c._cale !== mouvement) return;
        const t = Math.max(0, mouvement.currentTime || 0);
        try { r.scrub(c._anim, (t % boucle) / 1000); } catch { /* ancienne version de Rive */ }
        r.drawFrame?.();
        if (mouvement.playState === 'running') requestAnimationFrame(image);
      };
      image();
    });
  }
  const decaler = c => { c._cale = null; };

  // les roues d'un dessin pendant son mouvement : calées (data-boucle) ou libres
  function rouesPendant(el, depuis) {
    const c = riveDe(el);
    if (!c) return { c: null, quandLance: null };
    if (c.dataset.boucle) return { c, quandLance: a => caler(c, a) };
    rouler(c, depuis);
    return { c, quandLance: null };
  }

  // arrive d'un côté de l'écran et ralentit jusqu'à sa place
  async function arriver(el) {
    const cote = el.dataset.arrivee || 'droite';
    const distance = horsEcran(el, cote);
    const duree = parseFloat(el.dataset.duree) || 1500;

    el.classList.add('en_scene');
    const c = riveDe(el);
    const roues = rouesPendant(el, parseFloat(c?.dataset.avance) || 0);

    const t = trajet(el, distance, 0, duree, 'cubic-bezier(.25, .6, .3, 1)');
    await animer(el, t.images, { duration: duree, easing: t.easing, fill: 'backwards' }, roues.quandLance);

    if (c) { decaler(c); arreter(c); }
  }

  // part doucement, accélère, et quitte l'écran
  async function partir(el) {
    const cote = el.dataset.sortie || 'gauche';
    const distance = horsEcran(el, cote);
    const duree = parseFloat(el.dataset.dureeSortie || el.dataset.duree) || 1500;

    const c = riveDe(el);
    const roues = rouesPendant(el, 0);   // l'animation des roues repart du début

    const t = trajet(el, 0, distance, duree, 'cubic-bezier(.55, 0, .9, .4)');
    await animer(el, t.images, { duration: duree, easing: t.easing, fill: 'forwards' }, roues.quandLance);

    if (c) { decaler(c); arreter(c); }
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
  async function changerScene(nom, revenue) {
    const nouveau = groupeDe(nom);
    if (nouveau === groupeActif) { rappelDepart = false; rappelRetour = revenue; majRappel(); return; }

    enTransition = true;
    scene.classList.remove('interactif');
    fermerFenetres();

    await sortir(groupeActif);
    rappelDepart = false;          // la nouvelle scène apparaît : la mascotte s'en va
    majRappel();
    groupeActif = nouveau;
    await entrer(nouveau);

    enTransition = false;
    rappelRetour = Boolean(revenue);   // retour sur une période pas finie : elle revient
    majRappel();
    if (partie.classList.contains('consigne_visible')) scene.classList.add('interactif');

    // une autre période a été demandée pendant la transition
    if (etapeDemandee && groupeDe(etapeDemandee) !== groupeActif) changerScene(etapeDemandee, rappelRetour);
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
  // la consigne bleue passe au-dessus, hors de l'écran (on la voit en remontant)
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

    // déjà vue avant : la mascotte reviendra s'il y reste des fenêtres à ouvrir
    const revenue = etapesVues.has(nom);
    rappelRetour = false;

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
    scene.dataset.etape = nom;

    etapesVues.add(nom);
    majFin();

    if (annonce) annonce.textContent = `${titre} : ${nombre} éléments à découvrir dans l’image.`;

    if (!sansScene && !enTransition) changerScene(nom, revenue);
    else { rappelRetour = revenue; majRappel(); }
  }


  // ---------- « À retenir » : une fenêtre, quand on quitte une période entièrement vue ----------
  // (en changeant de période sur la frise, ou avec « continuer »). Une seule fois par période.
  // Le bouton « c'est compris ! » ferme la fenêtre et lance la suite.
  // Avec data-tout-vu sur le dialog : il s'ouvre dès que toutes les fenêtres de la période
  // ont été ouvertes puis refermées ; en le fermant, « continuer » apparaît en bas à droite.

  const etapeComplete = nom => [...(docsParEtape[nom] || [])].every(d => vus.has(d));
  const retenirsVus = new Set();

  function avecRetenir(suite) {
    const fenetre = retenirs.find(r => r.dataset.etape === etapeActive);
    if (!fenetre || retenirsVus.has(etapeActive) || !etapeComplete(etapeActive)) { suite(); return; }

    retenirsVus.add(etapeActive);
    fermerFenetres();
    fenetre.addEventListener('close', suite, { once: true });   // bouton, ou Échap
    fenetre.showModal();
  }

  retenirs.forEach(f => {
    f.querySelector('[data-suite-retenir]')?.addEventListener('click', () => f.close());
  });

  // appelé à chaque fenêtre refermée
  function retenirToutVu() {
    const fenetre = retenirs.find(r => r.dataset.etape === etapeActive);
    if (!fenetre?.hasAttribute('data-tout-vu') || retenirsVus.has(etapeActive)) return;
    if (!etapeComplete(etapeActive)) return;
    setTimeout(() => {
      // toujours sur cette période, et plus rien d'ouvert ?
      if (fenetre.dataset.etape !== etapeActive || retenirsVus.has(etapeActive)) return;
      if (fenetre.open || fenetres.some(f => f.open)) return;
      retenirsVus.add(etapeActive);
      fenetre.addEventListener('close', () => majFin(), { once: true });
      fenetre.showModal();
    }, moinsDeMouvement ? 0 : 500);
  }

  // une période demandée par l'élève : d'abord l'« à retenir » de celle qu'il quitte
  function demanderEtape(nom) {
    if (!nom || nom === etapeActive) { choisirEtape(nom); return; }
    // on quitte une période pas finie : la mascotte apparaît pendant que la scène sort
    if (etapeActive && !etapeComplete(etapeActive)) { rappelDepart = true; majRappel(); }
    avecRetenir(() => choisirEtape(nom));
  }


  // ---------- fin : « continuer » après les 4 périodes ----------

  // « continuer » : quand au moins une fenêtre de chaque période a été ouverte
  const unDeChaque = () => etapes.every(e => [...(docsParEtape[e] || [])].some(d => vus.has(d)));

  function majFin() {
    if (!pied) return;
    if (!unDeChaque()) return;
    pied.hidden = false;
    majRappel();
  }

  // ---------- la barre rose du haut (<body data-progression="manuelle">) ----------
  // chaque fenêtre ouverte la fait avancer, jusqu'à BARRE_FENETRES % ; la conclusion la remplit
  const BARRE_FENETRES = 90;

  function avancerBarre() {
    if (typeof reglerProgression === 'function' && total) {
      reglerProgression((vus.size / total) * BARRE_FENETRES, 100);
    }
  }
  avancerBarre();

  // ---------- la mascotte « tu n'as pas encore tout découvert » (#rappel_scene) ----------
  // - quand on quitte une période pas finie, jusqu'à l'apparition de la nouvelle scène
  // - quand on revient sur une période pas finie, jusqu'à ce qu'elle soit finie
  // - à côté de « continuer », tant qu'il reste des fenêtres pas ouvertes

  function majRappel() {
    if (!rappel) return;
    const fin = pied && !pied.hidden && vus.size < total;
    const retour = rappelRetour && !enTransition && !etapeComplete(etapeActive);
    rappel.hidden = !(rappelDepart || retour || fin);
  }

  document.getElementById('continuer_scene')?.addEventListener('click', () => avecRetenir(() => {
    fermerFenetres();
    if (pile) pile.hidden = true;
    if (conclusion) conclusion.hidden = false;
    if (typeof afficherSuite === 'function') afficherSuite();
    if (typeof reglerProgression === 'function') reglerProgression(100, 100);
    if (typeof marquerPartieFaite === 'function' && typeof numPartie !== 'undefined') marquerPartieFaite(numPartie);

    const cible = conclusion || document.querySelector('.conteneur_suite');
    if (!cible) return;
    // après l'apparition de la conclusion et du bouton « passer à la suite »
    requestAnimationFrame(() => {
      laisserPlace(cible, MARGE_CONCLUSION);
      if (typeof calerEnHaut === 'function') calerEnHaut(cible, null, MARGE_CONCLUSION);
      else cible.scrollIntoView({ behavior: 'smooth' });
    });
  }));

  // espace (en px) entre le bandeau du haut et la conclusion, une fois le scroll fini
  const MARGE_CONCLUSION = 50;

  // ajoute de la place en bas de la page s'il n'y en a pas assez
  // pour que « cible » puisse monter tout en haut, sous le bandeau
  function laisserPlace(cible, marge = 0) {
    if (!zoneScroll) return;
    const bandeau = document.getElementById('haut')?.offsetHeight || 0;
    const position = zoneScroll.scrollTop + cible.getBoundingClientRect().top - zoneScroll.getBoundingClientRect().top;
    const voulu = position - bandeau - 15 - marge;                 // le même calcul que calerEnHaut
    const manque = voulu - (zoneScroll.scrollHeight - zoneScroll.clientHeight);
    if (manque <= 0) return;

    let espace = document.getElementById('espace_conclusion');
    if (!espace) {
      espace = document.createElement('div');
      espace.id = 'espace_conclusion';
      espace.setAttribute('aria-hidden', 'true');
      zoneScroll.appendChild(espace);
    }
    espace.style.height = (espace.offsetHeight + manque) + 'px';
  }


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
        demanderEtape(etapes[index]);
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
      demanderEtape(etapes[n]);
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => placerBoule(etapes.indexOf(etapeActive), true)).observe(piste);
    }
  }

  boutons.forEach(b => b.addEventListener('click', () => demanderEtape(b.dataset.etape)));


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

    // en haut, juste sous le bandeau (plus haut si la fenêtre est très grande)
    const y = Math.max(MARGE, Math.min(haut, bas - h));

    fenetre.style.left = Math.max(MARGE, x) + 'px';
    fenetre.style.top = Math.max(MARGE, y) + 'px';
  }

  function rendreGrappable(fenetre) {
    fenetre.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button, a, summary, input, textarea, .bulle_mascotte')) return;
      if (e.offsetX > fenetre.clientWidth) return;

      const x0 = e.clientX - fenetre.offsetLeft;
      const y0 = e.clientY - fenetre.offsetTop;
      fenetre.setPointerCapture(e.pointerId);
      fenetre.classList.add('deplacement');

      const bouger = ev => {
        fenetre.style.left = Math.min(window.innerWidth - 60, Math.max(60 - fenetre.offsetWidth, ev.clientX - x0)) + 'px';
        fenetre.style.top = Math.min(window.innerHeight - 40, Math.max(0, ev.clientY - y0)) + 'px';
        placerBulle(fenetre);   // la bulle suit la fenêtre
        placerFermer(fenetre);  // le rond rouge aussi
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

  // ---------- le rond rouge : toujours dans le coin haut droit de la fenêtre ----------
  // (position: fixed, recalé quand la fenêtre s'ouvre, bouge ou que l'écran change de taille ;
  //  distance au bord : --fermer_haut / --fermer_droite dans le CSS, 8px par défaut)

  function placerFermer(fenetre) {
    const b = fenetre._fermer;
    if (!b) return;
    const r = fenetre.getBoundingClientRect();
    const style = getComputedStyle(fenetre);
    const haut = parseFloat(style.getPropertyValue('--fermer_haut')) || 8;
    const droite = parseFloat(style.getPropertyValue('--fermer_droite')) || 8;
    b.style.top = (r.top + haut) + 'px';
    b.style.left = (r.right - droite - b.offsetWidth) + 'px';
  }

  // ---------- bulle de la mascotte : 3 s après l'ouverture de sa fenêtre ----------
  // accrochée au coin bas droit de la fenêtre (ou bas gauche s'il n'y a pas la place)

  const DELAI_BULLE = 3000;   // en ms

  function placerBulle(fenetre) {
    const bulle = fenetre._bulle;
    if (!bulle || bulle.hidden) return;
    const r = fenetre.getBoundingClientRect();
    const l = bulle.offsetWidth;
    const h = bulle.offsetHeight;

    let x = r.right - 40;
    if (x + l > window.innerWidth - MARGE) x = r.left - l + 40;
    let y = r.bottom - 30;
    const bas = window.innerHeight - (document.getElementById('bandeau_bas')?.offsetHeight || 0) - MARGE;
    y = Math.min(y, bas - h);

    bulle.style.left = Math.max(MARGE, x) + 'px';
    bulle.style.top = Math.max(MARGE, y) + 'px';
  }

  function programmerBulle(fenetre) {
    const bulle = fenetre._bulle;
    if (!bulle) return;
    clearTimeout(fenetre._minuteurBulle);
    bulle.hidden = true;
    fenetre._minuteurBulle = setTimeout(() => {
      if (!fenetre.open) return;
      bulle.hidden = false;
      placerBulle(fenetre);
    }, moinsDeMouvement ? 0 : DELAI_BULLE);
  }

  function cacherBulle(fenetre) {
    clearTimeout(fenetre._minuteurBulle);
    if (fenetre._bulle) fenetre._bulle.hidden = true;
  }

  // ---------- « en apprendre plus » ----------
  // Dans le HTML de la fenêtre :
  //   <div class="fenetre_plus"><div class="fenetre_plus_interieur"> … </div></div>
  //   <button type="button" class="bouton_plus" aria-expanded="false">en apprendre plus</button>
  // Le bloc est fermé au départ et se déroule au clic sur le bouton.

  function preparerPlus(fenetre) {
    const plus = fenetre.querySelector('.fenetre_plus');
    const bouton = fenetre.querySelector('.bouton_plus');
    if (!plus || !bouton) return;

    plus.inert = true;   // fermé : son contenu n'est pas atteignable au clavier
    bouton.addEventListener('click', () => deroulerPlus(fenetre, !plus.classList.contains('ouvert')));
    fenetre._plus = { plus, bouton, texte: bouton.textContent };   // texte d'origine du bouton
  }

  function deroulerPlus(fenetre, ouvrir) {
    const p = fenetre._plus;
    if (!p) return;
    p.plus.classList.toggle('ouvert', ouvrir);
    p.plus.inert = !ouvrir;
    p.bouton.setAttribute('aria-expanded', String(ouvrir));
    p.bouton.textContent = ouvrir ? 'voir moins' : p.texte;

    // bulle data-apres-bouton : 3 s après le déroulé, cachée quand on replie
    if (fenetre._bulle?.hasAttribute('data-apres-bouton')) {
      if (ouvrir) programmerBulle(fenetre);
      else cacherBulle(fenetre);
    }
  }

  fenetres.forEach(fenetre => {
    fenetre.tabIndex = -1;
    preparerPlus(fenetre);

    // le rond rouge de la fenêtre (pas celui de la bulle)
    fenetre._fermer = fenetre.querySelector(':scope > .qcm_fermer');
    fenetre._fermer?.addEventListener('click', () => fenetre.close());
    rendreGrappable(fenetre);

    fenetre._bulle = fenetre.querySelector('.bulle_mascotte');
    if (fenetre._bulle) {
      fenetre._bulle.hidden = true;
      fenetre._bulle.querySelector('.qcm_fermer')?.addEventListener('click', () => cacherBulle(fenetre));
    }

    fenetre.addEventListener('close', () => {
      cacherBulle(fenetre);
      deroulerPlus(fenetre, false);   // à la prochaine ouverture, la fenêtre est de nouveau courte
      fenetre._dessin?.focus({ preventScroll: true });
      retenirToutVu();
    });
  });

  window.addEventListener('resize', () => fenetres.forEach(f => { if (f.open) { placerBulle(f); placerFermer(f); } }));

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
      const dejaOuverte = fenetre.open;
      if (!dejaOuverte) fenetre.show();
      fenetre.scrollTop = 0;
      placerFenetre(fenetre, el);
      placerFermer(fenetre);
      // bulle 3 s après l'ouverture (sauf celles qui attendent le bouton)
      if (!dejaOuverte && !fenetre._bulle?.hasAttribute('data-apres-bouton')) programmerBulle(fenetre);
      fenetre.focus({ preventScroll: true });

      vus.add(id);
      el.classList.add('vu');
      avancerBarre();
      majFin();
      majRappel();
    });
  });

})();