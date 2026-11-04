// =====================================================================
// SCÈNE DU VÉLO CARGO (avec scene_velo.css)
//
// 1. Bouton « c'est parti » : la partie de la scène apparaît, calée en haut de l'écran.
// 2. Le paysage apparaît en fondu, puis le vélo (Rive) arrive de la droite de l'écran
//    et s'arrête à sa place (--x / --y dans le HTML).
// 3. Une fois le vélo arrivé : les zones cliquables (pastilles roses) et la frise.
// 4. La boule de la frise choisit l'étape du cycle de vie (1 à 4) :
//    seules les zones de cette étape sont cliquables.
// 5. Quand toutes les fenêtres ont été ouvertes : « passer à la suite »
//    (si <body data-suite="cache">).
//
// À charger APRÈS script.js et dessins.js, avec defer.
// Le lecteur Rive doit être chargé avant, dans le <head> :
//   <script src="https://unpkg.com/@rive-app/canvas@2.7.0"></script>
//
// Sur le <canvas class="velo_riv"> :
//   data-riv       : le fichier .riv
//   data-animation : l'animation des roues (ici « roule »)
//   data-duree     : durée du trajet, en ms (par défaut 2800)
//
// Sur chaque zone cliquable :
//   data-documents="production:pop_a fin_de_vie:pop_b"
//   → pour chaque étape où la zone est cliquable, l'id de la fenêtre à ouvrir.
// =====================================================================

(function () {

  const scene = document.querySelector('.scene');
  if (!scene) return;

  const partie   = scene.closest('.scene_partie') || scene;
  const depart   = document.querySelector('[data-scene-depart]');
  const canvas   = scene.querySelector('.velo_riv');
  const elements = [...scene.querySelectorAll('.scene_element')];
  const curseur  = scene.querySelector('.frise_curseur');
  const boutons  = [...scene.querySelectorAll('.frise_etape')];
  const retenirs = [...document.querySelectorAll('.scene_retenir')];
  const annonce  = scene.querySelector('.scene_annonce');

  const etapes = boutons.map(b => b.dataset.etape);   // ['production', 'distribution', …]
  const moinsDeMouvement = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vus = new Set();
  let etapeActive = null;


  // =================================================================
  // FENÊTRES : rond rouge, ou clic à côté, pour fermer
  // =================================================================

  document.querySelectorAll('dialog.fenetre_scene').forEach(fenetre => {
    fenetre.querySelector('.qcm_fermer')?.addEventListener('click', () => fenetre.close());

    fenetre.addEventListener('click', e => {
      if (e.target !== fenetre) return;
      const r = fenetre.getBoundingClientRect();
      const dehors = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (dehors) fenetre.close();
    });
  });


  // =================================================================
  // LE VÉLO (Rive)
  // =================================================================

  let velo = null;

  // Le fichier est chargé tout de suite, mais la scène est cachée (taille 0) :
  // la surface de dessin est réglée au moment où le vélo part (preparerVelo).
  let veloCharge = false;
  let enAttente = null;   // ce qu'il faut faire dès que le fichier est chargé

  if (canvas && typeof rive !== 'undefined') {
    velo = new rive.Rive({
      src: canvas.dataset.riv,
      canvas: canvas,
      autoplay: false,
      animations: canvas.dataset.animation || undefined,
      onLoad: () => {
        veloCharge = true;
        if (enAttente) { enAttente(); enAttente = null; }
      },
      onLoadError: e => console.error('Rive :', canvas.dataset.riv, e),
    });
  } else if (canvas) {
    console.warn('Scène : le lecteur Rive n’est pas chargé, le vélo ne roulera pas.');
  }

  function quandCharge(action) {
    if (!velo) return;
    if (veloCharge) action();
    else enAttente = action;
  }

  // la scène est visible : on règle la netteté du dessin sur sa vraie taille
  function preparerVelo() {
    quandCharge(() => {
      velo.resizeDrawingSurfaceToCanvas();
      velo.drawFrame?.();
    });
  }

  const rouler  = () => quandCharge(() => { velo.resizeDrawingSurfaceToCanvas(); velo.play(canvas.dataset.animation || undefined); });
  const arreter = () => quandCharge(() => velo.pause());


  // ---------- arrivée du vélo depuis la droite de l'écran ----------

  function faireArriverVelo(surFin) {
    scene.classList.add('velo_parti');

    if (!canvas || moinsDeMouvement || !canvas.animate) {
      surFin();
      return;
    }

    // distance jusqu'au bord droit de l'écran, + un peu pour partir de dehors
    const rect = canvas.getBoundingClientRect();
    const distance = window.innerWidth - rect.left + 40;

    rouler();
    const trajet = canvas.animate(
      [{ transform: `translateX(${distance}px)` }, { transform: 'translateX(0)' }],
      { duration: parseInt(canvas.dataset.duree, 10) || 2800, easing: 'cubic-bezier(.25, .6, .3, 1)', fill: 'backwards' }
    );
    trajet.onfinish = () => {
      arreter();
      surFin();
    };
  }


  // =================================================================
  // DÉROULÉ : « c'est parti » → fond → vélo → zones + frise
  // =================================================================

  function lancer() {
    if (depart) depart.hidden = true;
    partie.hidden = false;
    preparerVelo();

    const suite = () => {
      scene.classList.add('visible');                 // le paysage apparaît
      setTimeout(() => faireArriverVelo(() => {
        scene.classList.add('arrive');                // zones + frise
        choisirEtape(etapes[0]);
      }), moinsDeMouvement ? 0 : 600);
    };

    // la partie se cale en haut de l'écran (outil de script.js), puis la scène démarre
    if (typeof calerEnHaut === 'function') calerEnHaut(partie, suite);
    else { partie.scrollIntoView({ behavior: 'smooth' }); setTimeout(suite, 700); }
  }

  depart?.querySelector('button')?.addEventListener('click', lancer);
  if (!depart) lancer();


  // =================================================================
  // ÉTAPES DU CYCLE DE VIE
  // =================================================================

  // « production:pop_a fin_de_vie:pop_b » → { production: 'pop_a', fin_de_vie: 'pop_b' }
  const documentsDe = el => Object.fromEntries(
    (el.dataset.documents || '').trim().split(/\s+/).filter(Boolean).map(paire => paire.split(':'))
  );

  const docsParEtape = {};
  elements.forEach(el => {
    Object.entries(documentsDe(el)).forEach(([etape, doc]) => {
      (docsParEtape[etape] ||= new Set()).add(doc);
    });
  });
  const total = Object.values(docsParEtape).reduce((n, docs) => n + docs.size, 0);


  // ---------- compteurs « 1/3 » sous la frise ----------

  function majCompteurs() {
    boutons.forEach(bouton => {
      const docs = [...(docsParEtape[bouton.dataset.etape] || [])];
      const lus = docs.filter(d => vus.has(d)).length;
      const compteur = bouton.querySelector('.scene_compteur');
      if (compteur) compteur.textContent = `${lus}/${docs.length}`;
      bouton.classList.toggle('complet', docs.length > 0 && lus === docs.length);
    });
  }


  // ---------- choisir une étape ----------

  function choisirEtape(nom) {
    etapeActive = nom;
    const index = etapes.indexOf(nom);
    const bouton = boutons[index];
    const titre = bouton?.querySelector('.frise_titre')?.textContent || nom;

    if (curseur) {
      curseur.value = index + 1;
      curseur.setAttribute('aria-valuetext', titre);
    }
    boutons.forEach(b => b.setAttribute('aria-pressed', String(b === bouton)));

    let nombre = 0;
    elements.forEach(el => {
      const doc = documentsDe(el)[nom];
      el.disabled = !doc;
      el.classList.toggle('vu', Boolean(doc) && vus.has(doc));
      if (doc) nombre++;
    });

    retenirs.forEach(r => { r.hidden = r.dataset.etape !== nom; });
    scene.dataset.etape = nom;

    if (annonce) annonce.textContent = `${titre} : ${nombre} éléments à découvrir dans l’image.`;
  }


  // ---------- la frise : crans + boule + noms cliquables ----------

  if (curseur) {
    curseur.min = 1;
    curseur.max = etapes.length;
    curseur.step = 1;

    // un petit trait vertical à chaque cran
    const piste = curseur.closest('.frise_piste');
    etapes.forEach((_, i) => {
      const cran = document.createElement('span');
      cran.className = 'frise_cran';
      cran.style.left = (etapes.length > 1 ? (i / (etapes.length - 1)) * 100 : 50) + '%';
      piste?.prepend(cran);
    });

    curseur.addEventListener('input', () => {
      const nom = etapes[parseInt(curseur.value, 10) - 1];
      if (nom && nom !== etapeActive) choisirEtape(nom);
    });
  }

  boutons.forEach(b => b.addEventListener('click', () => choisirEtape(b.dataset.etape)));


  // =================================================================
  // OUVRIR LA FENÊTRE D'UNE ZONE
  // =================================================================

  elements.forEach(el => {
    el.setAttribute('aria-haspopup', 'dialog');

    el.addEventListener('click', () => {
      const id = documentsDe(el)[etapeActive];
      const fenetre = id && document.getElementById(id);
      if (!fenetre) {
        console.warn('Scène : pas de fenêtre pour', el, 'à l’étape', etapeActive);
        return;
      }

      fenetre.showModal();
      fenetre.scrollTop = 0;

      vus.add(id);
      el.classList.add('vu');
      majCompteurs();

      if (vus.size === total && typeof afficherSuite === 'function') afficherSuite();
    });
  });

  majCompteurs();

})();