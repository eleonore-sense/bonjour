// =====================================================================
// SCRIPT COMMUN À TOUTES LES PAGES
//
// 1. Construit la structure commune à partir de cours.js :
//    barre du haut, onglets, boutons ronds, barre des parties,
//    titres, bouton « passer à la suite », pop-up des dessins.
// 2. Active chaque composant SEULEMENT s'il est présent sur la page.
// 3. Fournit des outils aux activités (progression, bouton suite, étoile).
//
// Réglages possibles sur <body> :
//   data-chapitre="3"            → couleur de fond du chapitre (CSS)
//   data-suite="cache"           → bouton suite caché jusqu'à afficherSuite()
//   data-suite="non"             → pas de bouton suite
//   data-progression="manuelle"  → la barre rose avance avec reglerProgression()
// =====================================================================


// ---------------------------------------------------------------------
// 0. OÙ SOMMES-NOUS ?  (la page est retrouvée grâce à son nom de fichier)
// ---------------------------------------------------------------------
const fichierActuel = decodeURIComponent(location.pathname.split('/').pop());

const chapitre = COURS.chapitres.find(c => c.parties.some(p => p.lien === fichierActuel))
              || COURS.chapitres.find(c => c.numero === parseInt(document.body.dataset.chapitre, 10));
const numChapitre = chapitre ? chapitre.numero : NaN;
const parties     = chapitre ? chapitre.parties : [];

let indexPartie = parties.findIndex(p => p.lien === fichierActuel);
if (indexPartie === -1) indexPartie = parseInt(document.body.dataset.partie, 10) - 1;

const numPartie     = indexPartie + 1;
const partie        = parties[indexPartie];
const partiesFaites = new Set(PROGRESSION.partiesFaites[numChapitre] || []);

if (!partie) {
  console.error(`La page « ${fichierActuel} » n'est pas dans cours.js. Vérifie le champ lien de sa partie.`);
}

// petits outils
const sansRetourLigne = texte => texte.replace(/<br\s*\/?>/gi, ' ');
const pourAttribut    = texte => String(texte).replace(/"/g, '&quot;');

// copie mélangée d'un tableau
function melanger(tableau) {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}


// ---------------------------------------------------------------------
// 1. STRUCTURE COMMUNE
// ---------------------------------------------------------------------
construireStructure();

function construireStructure() {
  const zone = document.getElementById('droite_contenu');

  document.body.insertAdjacentHTML('afterbegin', htmlBarreHaut() + htmlOnglets() + htmlMenuGauche());

  if (zone && chapitre && partie) {
    zone.insertAdjacentHTML('afterbegin', htmlTitres());
  }

  const gauche = document.getElementById('contenu_gauche');
  const suite = lienSuivant();
  const modeSuite = document.body.dataset.suite;   // rien | 'cache' | 'non'
  if (gauche && suite && modeSuite !== 'non') {
    gauche.insertAdjacentHTML('beforeend', `
      <div class="conteneur_suite${modeSuite === 'cache' ? ' cache' : ''}">
        <a href="${suite}" class="bouton_suite">passer à la suite</a>
      </div>`);
  }

  document.body.insertAdjacentHTML('beforeend', htmlModale());

  // bandeau du bas : ajouté s'il n'est pas déjà dans la page
  if (!document.getElementById('bandeau_bas')) {
    document.body.insertAdjacentHTML('beforeend', '<footer id="bandeau_bas"></footer>');
  }

  if (partie) document.title = sansRetourLigne(partie.nom);
}

function htmlBarreHaut() {
  return `
    <div id="barre_progression">
      <div id="barre_progression_remplie"></div>
    </div>`;
}

function htmlOnglets() {
  const onglets = COURS.chapitres.map(c => {
    let etat = '';
    if (c.numero === numChapitre) etat = 'en_cours';
    else if (PROGRESSION.chapitresTermines.includes(c.numero)) etat = 'termine';

    const premierePage = c.parties[0]?.lien;
    const titre = etat && premierePage
      ? `<a href="${premierePage}">${c.titre}</a>`
      : c.titre;

    return `
      <div id="chap_${c.numero}" class="${etat}">
        <div class="numero">${c.numero}</div>
        <div class="titre_onglet">${titre}</div>
        <a class="lien_fiche_onglet" href="${c.fiches}">aller aux fiches notion du chapitre</a>
      </div>`;
  }).join('');

  return `<div id="onglet_chapitre">${onglets}</div>`;
}

function htmlMenuGauche() {
  const boutons = COURS.boutons.map(b => `
    <div class="bouton_icone_wrap">
      <a href="${b.lien}" id="${b.id}" class="bouton_icone" aria-label="${pourAttribut(b.texte)}" data-tooltip="${pourAttribut(b.texte)}">
        <img src="${b.image}" alt=""${b.hauteurImage ? ` style="height:${b.hauteurImage}"` : ''}>
      </a>
    </div>`).join('');

  const total = parties.length;
  let barre = '';

  if (total) {
    barre += '<div class="ligne_fine"></div><div class="ligne_remplie"></div><div class="point_actuel"></div>';

    // traits aux limites des parties, plus longs entre deux sections
    for (let i = 0; i <= total; i++) {
      let forme = 'trait_chapitre';
      if (i === 0 || i === total) forme = 'mini_boule';
      else if (parties[i].section !== parties[i - 1].section) forme += ' trait_section';
      barre += `<div class="${forme}" data-partie="${i}"></div>`;
    }

    parties.forEach((p, i) => {
      if (p.etoile) barre += `<div class="etoile" data-partie="${i + 1}"></div>`;
    });

    barre += '<div class="point_hover"></div><div class="label_partie"></div>';

    parties.forEach((p, i) => {
      barre += `<div class="zone_hover" data-partie="${i + 1}"${p.etoile ? ' data-etoile="true"' : ''} data-nom="${pourAttribut(p.nom)}" data-lien="${p.lien}"></div>`;
    });
  }

  return `
    <div id="gauche_menu">
      <div id="bouton_rond">${boutons}</div>
      <div id="tooltip"></div>
      ${total ? `<div id="barre_progression_chapitre" data-total-parties="${total}">${barre}</div>` : ''}
    </div>`;
}

function htmlTitres() {
  const duree = partie.duree ? `<span class="duree_chapitre">${partie.duree}</span>` : '';
  return `
    <div id="haut">
      <div id="titre_partie">Part.${chapitre.numero}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ${sansRetourLigne(chapitre.titre)}</div>
      <div id="titre_chapitre"><span>${partie.section || partie.nom}</span>${duree}</div>
    </div>`;
}

function htmlModale() {
  return `
    <div id="modal_dessin" class="modal_dessin">
      <div class="modal_dessin_contenu">
        <div class="fermer_modal"></div>
        <img class="modal_dessin_image" src="" alt="">
        <div class="modal_dessin_texte">
          <h3 class="modal_dessin_titre"></h3>
          <p class="modal_dessin_def"></p>
        </div>
      </div>
    </div>`;
}

// Partie suivante du chapitre, ou 1re partie du chapitre suivant
function lienSuivant() {
  if (!chapitre) return null;
  if (parties[numPartie]) return parties[numPartie].lien;
  const chapitreSuivant = COURS.chapitres.find(c => c.numero === numChapitre + 1);
  return chapitreSuivant?.parties[0]?.lien || null;
}


// ---------------------------------------------------------------------
// 2. COMPOSANTS
// Chacun vérifie d'abord que ses éléments existent sur la page.
// ---------------------------------------------------------------------
const zoneScroll = document.getElementById('droite_contenu');

initScroll();
initBoutonsMenu();
initLiensSource();
initNotions();
initBarreParties();
initAnimationsRive();
initDessins();
initPopMascotte();
initRappelFin();
initGraphiques();
initChoixVue();
initRecentrage();
initQCM();
initClassement();
initAfficher();
initFinActivite();

// Lance une action chaque fois qu'un élément passe la ligne des 60 % de l'écran
function surPassage(element, action) {
  new IntersectionObserver(
    entries => entries.forEach(entry => { if (entry.isIntersecting) action(); }),
    { root: zoneScroll, rootMargin: '-60% 0px -40% 0px', threshold: 0 }
  ).observe(element);
}


// ---------- Barre de progression du haut + retour en haut ----------
function initScroll() {
  const barre = document.getElementById('barre_progression_remplie');
  if (!zoneScroll || !barre) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  zoneScroll.scrollTop = 0;
  window.addEventListener('load', () => { zoneScroll.scrollTop = 0; });

  // Progression manuelle : c'est l'activité qui fait avancer la barre
  if (document.body.dataset.progression === 'manuelle') return;

  function majBarre() {
    const hauteurDefilable = zoneScroll.scrollHeight - zoneScroll.clientHeight;
    const pourcentage = hauteurDefilable > 0 ? (zoneScroll.scrollTop / hauteurDefilable) * 100 : 0;
    barre.style.width = pourcentage + '%';
  }

  zoneScroll.addEventListener('scroll', majBarre);
  window.addEventListener('resize', majBarre);
  window.addEventListener('load', majBarre);
  majBarre();
}


// ---------- Infobulle des boutons ronds ----------
function initBoutonsMenu() {
  const tooltip = document.getElementById('tooltip');
  if (!tooltip) return;

  document.querySelectorAll('.bouton_icone[data-tooltip]').forEach(bouton => {
    bouton.addEventListener('mouseenter', () => {
      tooltip.textContent = bouton.dataset.tooltip;
      tooltip.classList.add('visible');
    });
    bouton.addEventListener('mousemove', e => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top = (e.clientY + 14) + 'px';
    });
    bouton.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });
}


// ---------- Les sources s'ouvrent dans un nouvel onglet ----------
function initLiensSource() {
  document.querySelectorAll('a.source').forEach(lien => {
    lien.target = '_blank';
    lien.rel = 'noopener';
  });
}


// ---------- Mots à définir → boîte de définition à droite ----------
// La boîte s'ouvre au survol du mot (ou quand on y arrive au clavier) et reste affichée.
// On peut l'attraper et la déplacer. Elle se ferme avec son rond rouge,
// avec la touche Échap, ou quand on survole un autre mot.
// Peut être appelée plusieurs fois (ex : après un ajout de contenu) :
// un mot ou une boîte déjà préparés ne le sont pas une deuxième fois.
function initNotions() {
  const conteneur = document.getElementById('contenu_chapitre');
  if (!conteneur) return;

  document.querySelectorAll('.mot_notion[data-cible]').forEach(mot => {
    if (mot.dataset.relie) return;

    const boite = document.getElementById(mot.dataset.cible);
    if (!boite) return;

    mot.dataset.relie = 'oui';
    mot.tabIndex = 0;                                   // atteignable au clavier
    mot.setAttribute('aria-describedby', boite.id);    // le lecteur d'écran lit la définition

    preparerBoite(boite);

    function ouvrir() {
      if (boite.classList.contains('visible')) return;  // déjà ouverte : on ne la déplace pas

      document.querySelectorAll('.boite_notion.visible').forEach(b => b.classList.remove('visible'));

      const rectMot = mot.getBoundingClientRect();
      const rectConteneur = conteneur.getBoundingClientRect();
      boite.style.top = (rectMot.top - rectConteneur.top) + 'px';
      boite.style.translate = '';                       // revient à côté du mot
      boite.classList.add('visible');
    }

    mot.addEventListener('mouseenter', ouvrir);
    mot.addEventListener('focus', ouvrir);

    // preventDefault : un mot placé dans une réponse de QCM ne coche pas la case
    mot.addEventListener('click', e => {
      e.preventDefault();
      ouvrir();
    });
  });

  // Échap ferme la définition ouverte (une seule écoute pour toute la page)
  if (!document.body.dataset.echapNotions) {
    document.body.dataset.echapNotions = 'oui';
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.boite_notion.visible').forEach(b => b.classList.remove('visible'));
      }
    });
  }
}

// rond rouge pour fermer + boîte déplaçable
function preparerBoite(boite) {
  if (boite.dataset.prete) return;
  boite.dataset.prete = 'oui';

  const fermer = document.createElement('button');
  fermer.type = 'button';
  fermer.className = 'qcm_fermer';
  fermer.setAttribute('aria-label', 'fermer la définition');
  fermer.addEventListener('click', () => boite.classList.remove('visible'));
  boite.prepend(fermer);

  rendreDeplacable(boite);
}


// ---------- Barre verticale des parties du chapitre ----------
function initBarreParties() {
  const conteneur = document.getElementById('barre_progression_chapitre');
  if (!conteneur) return;

  const total = parseInt(conteneur.dataset.totalParties, 10);
  const ligneRemplie = conteneur.querySelector('.ligne_remplie');
  const pointActuel = conteneur.querySelector('.point_actuel');
  const pointHover = conteneur.querySelector('.point_hover');
  const labelPartie = conteneur.querySelector('.label_partie');

  // Traits et boules aux limites des parties : 0, 1, 2… jusqu'à total
  conteneur.querySelectorAll('.trait_chapitre, .mini_boule').forEach(el => {
    el.style.top = (el.dataset.partie / total) * 100 + '%';
  });

  // Étoiles au centre de leur partie, pleines si la partie est faite
  conteneur.querySelectorAll('.etoile').forEach(el => {
    const p = parseInt(el.dataset.partie, 10);
    el.style.top = ((p - 0.5) / total) * 100 + '%';
    el.classList.toggle('fait', partiesFaites.has(p));
  });

  // Segments épais des parties faites qui se suivent, ex : {6,7} → [[5,7]]
  calculerSegments(partiesFaites).forEach(([debut, fin]) => {
    const topDebut = (debut / total) * 100 + '%';
    const topFin = (fin / total) * 100 + '%';

    const segment = document.createElement('div');
    segment.className = 'segment_fait';
    segment.style.top = topDebut;
    segment.style.height = ((fin - debut) / total) * 100 + '%';
    conteneur.appendChild(segment);

    [topDebut, topFin].forEach(top => {
      const point = document.createElement('div');
      point.className = 'point_segment';
      point.style.top = top;
      conteneur.appendChild(point);
    });
  });

  // Position de lecture : milieu de la partie en cours
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const pourcentage = ((numPartie - 0.5) / total) * 100 + '%';
    ligneRemplie.style.height = pourcentage;
    pointActuel.style.top = pourcentage;
  }));

  // Survol : point rose + nom de la partie, cliquable si la partie est faite
  let delaiSurvol = null;

  function cacherSurvol() {
    clearTimeout(delaiSurvol);
    pointHover.classList.remove('visible');
    pointHover.style.opacity = '0';
    labelPartie.style.opacity = '0';
  }

  conteneur.querySelectorAll('.zone_hover').forEach(zone => {
    const p = parseInt(zone.dataset.partie, 10);
    const position = ((p - 0.5) / total) * 100 + '%';

    zone.style.top = ((p - 1) / total) * 100 + '%';
    zone.style.height = (1 / total) * 100 + '%';

    zone.addEventListener('mouseenter', () => {
      const fait = partiesFaites.has(p);
      const estEtoile = zone.dataset.etoile === 'true';

      cacherSurvol();

      delaiSurvol = setTimeout(() => {
        pointHover.classList.toggle('forme_etoile', estEtoile);
        pointHover.style.top = position;
        pointHover.classList.add('visible');

        labelPartie.textContent = zone.dataset.nom;
        labelPartie.style.top = position;
        labelPartie.classList.toggle('fait', fait);
        labelPartie.onclick = fait ? () => { window.location.href = zone.dataset.lien; } : null;

        requestAnimationFrame(() => requestAnimationFrame(() => {
          pointHover.style.opacity = '1';
          labelPartie.style.opacity = '1';
        }));
      }, 200);
    });

    zone.addEventListener('mouseleave', cacherSurvol);
  });
}

function calculerSegments(ensemble) {
  const tries = [...ensemble].sort((a, b) => a - b);
  const segments = [];
  let debut = null;
  let precedent = null;

  tries.forEach(p => {
    if (debut === null) {
      debut = p;
    } else if (p !== precedent + 1) {
      segments.push([debut - 1, precedent]);
      debut = p;
    }
    precedent = p;
  });
  if (debut !== null) segments.push([debut - 1, precedent]);

  return segments;
}


// ---------- Couleurs de couleurs.css dans les animations Rive ----------
// Dans l'éditeur Rive, une propriété de couleur du View Model qui porte le nom
// d'une couleur de la palette (bleu, rose, vert_citron…) prend la valeur
// de la variable CSS du même nom (--bleu, --rose, --vert_citron…).
// Les propriétés de nombre epaisseur, epaisseur_fine et epaisseur_forte prennent
// --dessin_epaisseur, --dessin_epaisseur_fine et --dessin_epaisseur_forte,
// multipliées par data-echelle-trait sur le <canvas> (1 si absent).
function appliquerPaletteRive(r, canvas) {
  const vmi = r.viewModelInstance;
  if (!vmi) return;

  const styles  = getComputedStyle(document.documentElement);
  const echelle = parseFloat(canvas.dataset.echelleTrait) || 1;
  const EPAISSEURS = {
    epaisseur:       '--dessin_epaisseur',
    epaisseur_fine:  '--dessin_epaisseur_fine',
    epaisseur_forte: '--dessin_epaisseur_forte',
  };

  vmi.properties.forEach(({ name, type }) => {
    if (type === 'color') {
      const rgb = couleurEnRgb(styles.getPropertyValue('--' + name));
      if (rgb) vmi.color(name).rgb(...rgb);
      else console.warn('Rive : pas de couleur --' + name + ' dans couleurs.css');
    } else if (type === 'number' && EPAISSEURS[name]) {
      const valeur = parseFloat(styles.getPropertyValue(EPAISSEURS[name]));
      if (!isNaN(valeur)) vmi.number(name).value = valeur * echelle;
    }
  });
}

// "#6eadf0" ou "#abc" → [110, 173, 240]
function couleurEnRgb(texte) {
  let hex = texte.trim().replace('#', '');
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
}


// ---------- Animations Rive ----------
// Tout <canvas class="anim_riv"> placé dans un .media_exemple est pris en charge.
// La 1re animation de la page se joue au chargement et au retour en haut,
// les suivantes à chaque passage de la ligne des 60 %.
function initAnimationsRive() {
  if (typeof rive === 'undefined') return;

  // le moteur de Rive est dans le dossier rive/, pas sur internet
  rive.RuntimeLoader.setWasmUrl('rive/rive.wasm');
  rive.RuntimeLoader.wasmFallbackURL = 'rive/rive_fallback.wasm';

  const groupes = [];

  document.querySelectorAll('.media_exemple').forEach(media => {
    const instances = [];

    media.querySelectorAll('canvas.anim_riv').forEach(canvas => {
      const largeurBase = canvas.width;
      const hauteurBase = canvas.height;
      canvas.style.aspectRatio = `${largeurBase} / ${hauteurBase}`;

      const ratio = window.devicePixelRatio || 1;
      canvas.width = largeurBase * ratio;
      canvas.height = hauteurBase * ratio;

      const r = new rive.Rive({
        src: canvas.dataset.riv,
        canvas: canvas,
        autoplay: false,
        stateMachine: canvas.dataset.machine,
        animations: canvas.dataset.anim,
        autoBind: true,                     // relie le View Model de l'animation
        onLoad: () => {
          r.resizeDrawingSurfaceToCanvas();
          appliquerPaletteRive(r, canvas);  // couleurs et traits de couleurs.css
        },
        onLoadError: e => console.error('Rive :', canvas.dataset.riv, e),
      });

      // fin de l'animation : pause
      // (avec data-depart, on fait un tour complet et on s'arrête au point de départ)
      r.on(rive.EventType.Loop, () => {
        const depart = parseFloat(canvas.dataset.depart) || 0;
        if (depart > 0 && !r.tourFini) {
          r.tourFini = true;
          setTimeout(() => r.pause(), depart * 1000);
        } else if (depart === 0) {
          r.pause();
        }
      });

      instances.push(r);
    });

    if (instances.length) groupes.push({ media, instances });
  });

  if (!groupes.length) return;

  function jouer(instances) {
    instances.forEach(r => {
      const c = r.canvas;
      r.reset({
        autoBind: true,
        animations: c.dataset.anim,
        stateMachines: c.dataset.machine,
      });
      appliquerPaletteRive(r, c);               // remet les couleurs de couleurs.css
      r.tourFini = false;
      // data-depart="1.133" : l'animation commence à 1,133 s au lieu du début
      const depart = parseFloat(c.dataset.depart);
      if (c.dataset.anim && depart > 0) r.scrub(c.dataset.anim, depart);
      // data-decalage="400" : départ retardé de 400 ms
      const decalage = parseFloat(c.dataset.decalage) || 0;
      setTimeout(() => r.play(), decalage);
    });
  }

  // 1re animation : une fois la page chargée, puis à chaque retour tout en haut
  const lancerPremiere = () => setTimeout(() => jouer(groupes[0].instances), 400);
  if (document.readyState === 'complete') lancerPremiere();
  else window.addEventListener('load', lancerPremiere);

  let dejaEnHaut = true;
  zoneScroll.addEventListener('scroll', () => {
    if (zoneScroll.scrollTop === 0) {
      if (!dejaEnHaut) jouer(groupes[0].instances);
      dejaEnHaut = true;
    } else {
      dejaEnHaut = false;
    }
  });

  // Les suivantes : au passage de la ligne des 60 %
  groupes.slice(1).forEach(groupe => surPassage(groupe.media, () => jouer(groupe.instances)));
}


// ---------- Dessins (galerie + schémas) : infobulle et pop-up ----------
function initDessins() {
  const modal = document.getElementById('modal_dessin');
  const items = document.querySelectorAll('.item_dessin');
  if (!modal || !items.length) return;

  const modalTitre = modal.querySelector('.modal_dessin_titre');
  const modalDef = modal.querySelector('.modal_dessin_def');

  items.forEach(item => {
    const nom = item.dataset.nom;
    const def = item.dataset.def;
    // l'<img> a peut-être déjà été remplacée par le SVG : on gère les deux cas
    const dessin = item.querySelector('img, svg.dessin');
    const srcDessin = dessin?.getAttribute('src') || dessin?.dataset.src;
    const imageActeur = item.dataset.imageModal;

    // Infobulle : texte seul, ou dessin + titre + texte pour les acteurs
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip_dessin';

    if (imageActeur) {
      tooltip.classList.add('tooltip_acteur');

      const imgActeur = document.createElement('img');
      imgActeur.className = 'tooltip_acteur_image';
      imgActeur.src = imageActeur;
      imgActeur.alt = '';

      const texte = document.createElement('div');
      texte.className = 'tooltip_acteur_texte';
      const titre = document.createElement('h3');
      titre.textContent = nom;
      const p = document.createElement('p');
      p.textContent = def;
      texte.append(titre, p);

      tooltip.append(imgActeur, texte);
    } else {
      tooltip.textContent = def;
    }
    item.appendChild(tooltip);

    // Pop-up au clic : une nouvelle image, passée à dessins.js pour ses couleurs
    item.addEventListener('click', () => {
      const nouvelle = document.createElement('img');
      nouvelle.className = 'modal_dessin_image';
      nouvelle.alt = '';
      nouvelle.src = imageActeur || srcDessin;
      modal.querySelector('.modal_dessin_image').replaceWith(nouvelle);
      window.insererDessin?.(nouvelle);

      modalTitre.textContent = nom;
      modalDef.textContent = def;
      modal.classList.toggle('modal_acteur', !!imageActeur);
      modal.classList.add('visible');
    });
  });

  modal.querySelector('.fermer_modal').addEventListener('click', () => {
    modal.classList.remove('visible');
  });

  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('visible');
  });

  // Échap ferme la pop-up
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.classList.remove('visible');
  });
}


// ---------- Pop-up mascotte ----------
// Sans data-declencheur : s'ouvre 1 s après l'arrivée sur la page.
// (data-declencheur : s'ouvre au premier scroll où l'élément est entièrement visible)
// Placée sous le titre, un peu à droite (centrée sur petit écran).
// Se ferme au rond rouge, avec Échap et au clic en dehors.
function initPopMascotte() {
  // seulement la pop-up de class pop_mascotte (d'autres pages ont un #pop_mascotte géré par leur propre script)
  const pop = document.querySelector('dialog.pop_mascotte');
  if (!pop) return;

  function placer() {
    const haut  = document.getElementById('haut');
    const titre = document.getElementById('titre_chapitre');
    if (!haut || !titre || window.innerWidth <= 700) {
      pop.classList.remove('placee');
      pop.style.top = pop.style.left = '';
      return;
    }
    pop.classList.add('placee');
    pop.style.top  = (haut.getBoundingClientRect().bottom + 25) + 'px';
    pop.style.left = (titre.getBoundingClientRect().left + 120) + 'px';
  }

  function ouvrir() {
    placer();
    pop.showModal();
  }

  pop.querySelector('.fermer_modal')?.addEventListener('click', () => pop.close());

  pop.addEventListener('click', e => {
    const r = pop.getBoundingClientRect();
    const dedans = e.clientX >= r.left && e.clientX <= r.right
                && e.clientY >= r.top  && e.clientY <= r.bottom;
    if (!dedans) pop.close();
  });

  window.addEventListener('resize', () => { if (pop.open) placer(); });

  const declencheur = pop.dataset.declencheur && document.querySelector(pop.dataset.declencheur);

  if (declencheur && zoneScroll) {
    // une seule fois, au premier scroll où l'élément est entièrement visible
    function verifier() {
      const r = declencheur.getBoundingClientRect();
      const z = zoneScroll.getBoundingClientRect();
      if (r.top >= z.top && r.bottom <= z.bottom) {
        zoneScroll.removeEventListener('scroll', verifier);
        ouvrir();
      }
    }
    zoneScroll.addEventListener('scroll', verifier);
  } else {
    setTimeout(ouvrir, 1000);
  }
}


// ---------- Encadré mascotte en fin de page ----------
// Apparaît une seule fois, quand le bouton « passer à la suite » arrive à l'écran.
function initRappelFin() {
  const rappel = document.getElementById('rappel_fin');
  const bouton = document.querySelector('.bouton_suite');
  if (!rappel || !bouton || !zoneScroll) return;

  const observateur = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      rappel.hidden = false;
      observateur.disconnect();
    }
  }, { root: zoneScroll, threshold: 0.5 });

  observateur.observe(bouton);
}


// ---------- Graphiques en barres + boutons produit A / B ----------
function initGraphiques() {
  document.querySelectorAll('.graphique').forEach(graph => {
    const max = parseFloat(graph.dataset.max) || 10;
    const barres = [];
    const noms = [];
    let produitActif = 'a';

    const zone = document.createElement('div');
    zone.className = 'graph_zone';
    const ligneNoms = document.createElement('div');
    ligneNoms.className = 'graph_noms';

    graph.querySelectorAll('.graph_donnee').forEach(donnee => {
      const groupe = document.createElement('div');
      groupe.className = 'graph_groupe';

      const barre = document.createElement('div');
      barre.className = 'graph_barre';
      barre.dataset.a = (parseFloat(donnee.dataset.a) / max) * 100 + '%';
      barre.dataset.b = (parseFloat(donnee.dataset.b) / max) * 100 + '%';
      groupe.appendChild(barre);
      zone.appendChild(groupe);
      barres.push(barre);

      const nom = document.createElement('div');
      nom.textContent = donnee.dataset.nom;
      ligneNoms.appendChild(nom);
      noms.push(nom);

      donnee.remove();
    });

    graph.append(zone, ligneNoms);

    const cache = () => graph.classList.contains('vue_cachee');

    // décalage entre deux barres (et deux légendes), en secondes
    function decaler(pas) {
      barres.forEach((b, i) => b.style.transitionDelay = i * pas + 's');
      noms.forEach((n, i) => n.style.transitionDelay = i * pas + 's');
    }

    function afficherProduit(produit) {
      produitActif = produit;
      if (cache()) return;
      barres.forEach(b => b.style.height = b.dataset[produit]);
    }

    function monter() {
      graph.classList.remove('descente', 'noms_caches');
      decaler(0.12);
      requestAnimationFrame(() => afficherProduit(produitActif));
    }

    function descendre() {
      graph.classList.add('descente', 'noms_caches');
      decaler(0.05);
      barres.forEach(b => b.style.height = '0');
    }

    // remise à zéro puis montée des barres
    function jouer() {
      if (cache()) return;
      graph.classList.add('reset');
      barres.forEach(b => b.style.height = '0');
      void graph.offsetHeight;
      graph.classList.remove('reset');
      monter();
    }

    decaler(0.12);

    const boutons = document.querySelectorAll(`.choix_produit[data-graph~="${graph.id}"] .bouton_produit`);
    boutons.forEach(bouton => {
      bouton.addEventListener('click', () => {
        boutons.forEach(b => b.classList.toggle('actif', b === bouton));
        afficherProduit(bouton.dataset.produit);
      });
    });

    graph.addEventListener('affichee', monter);
    graph.addEventListener('masquee', descendre);
    surPassage(graph, jouer);
  });
}


// ---------- Changement de vue d'un graphique ----------
function initChoixVue() {
  document.querySelectorAll('.choix_vue').forEach(groupe => {
    const boutons = [...groupe.querySelectorAll('.bouton_vue')];
    let enCours = false;

    boutons.forEach(bouton => {
      bouton.addEventListener('click', () => {
        const ancienBouton = boutons.find(b => b.classList.contains('actif'));
        if (enCours || bouton === ancienBouton) return;
        enCours = true;

        boutons.forEach(b => {
          b.classList.toggle('actif', b === bouton);
          b.setAttribute('aria-pressed', b === bouton);
        });

        const ancien = document.getElementById(ancienBouton.dataset.vue);
        const nouveau = document.getElementById(bouton.dataset.vue);

        // l'ancien descend, puis le nouveau monte
        ancien.dispatchEvent(new Event('masquee'));
        setTimeout(() => {
          ancien.classList.add('vue_cachee');
          nouveau.classList.remove('vue_cachee');
          nouveau.dispatchEvent(new Event('affichee'));
          enCours = false;
        }, 700);
      });
    });
  });
}


// ---------- Défilement par étapes ----------
// <div data-recentrer data-premiere-etape="#id"> :
// chaque geste de scroll vers le bas fait glisser la page vers l'étape suivante.
//   1re étape : l'élément de data-premiere-etape, calé tout en haut sous le bandeau
//   ensuite   : dans un QCM, chaque ligne de blocs, centrée
// Vers le haut, le défilement reste normal.
// L'étape suivante est toujours calculée depuis la position réelle de la page :
// pas de décalage si on a bougé avec la barre de défilement ou un clic.
// Une fois la dernière étape atteinte (ou la correction lancée), le scroll redevient libre.
function initRecentrage() {
  if (!zoneScroll) return;

  document.querySelectorAll('[data-recentrer]').forEach(cible => {
    let actif = true;
    let dernierGeste = 0;

    const premiere = cible.dataset.premiereEtape
      ? document.querySelector(cible.dataset.premiereEtape)
      : null;

    // data-etapes-avant="#a #b" : éléments centrés à l'écran avant la 1re étape
    const avant = (cible.dataset.etapesAvant || '')
      .split(/\s+/).filter(Boolean)
      .map(sel => document.querySelector(sel)).filter(Boolean)
      .map(el => [el]);

    // les lignes de blocs du QCM (relues à chaque fois : le tirage a pu en retirer)
    function lignesBlocs() {
      const lignes = [];
      cible.querySelectorAll('.qcm_bloc').forEach(b => {
        const ligne = lignes.find(l => Math.abs(l[0].offsetTop - b.offsetTop) < 5);
        if (ligne) ligne.push(b);
        else lignes.push([b]);
      });
      return lignes;
    }

    // étapes : les éléments « avant », centrés, puis la consigne calée en haut
    // (qui montre aussi la 1re ligne), puis les lignes suivantes, centrées
    function etapes() {
      const lignes = lignesBlocs();
      if (!lignes.length) return [...avant, ...(premiere ? [premiere] : [[cible]])];
      return [...avant, ...(premiere ? [premiere, ...lignes.slice(1)] : lignes)];
    }

    // position de défilement où l'étape est bien placée (sans dépasser le bas de page)
    function positionDe(etape) {
      const hauteurBandeau = document.getElementById('haut')?.offsetHeight || 0;
      const rectZone = zoneScroll.getBoundingClientRect();
      const maximum = zoneScroll.scrollHeight - zoneScroll.clientHeight;
      let position;

      if (Array.isArray(etape)) {
        // une ligne de blocs : centrée
        const rect = rectDe(etape);
        const hauteurVisible = zoneScroll.clientHeight - hauteurBandeau;
        const marge = Math.max(20, (hauteurVisible - rect.height) / 2);
        position = zoneScroll.scrollTop + (rect.top - rectZone.top) - hauteurBandeau - marge;
      } else {
        // une consigne : tout en haut, sous le bandeau
        const rect = etape.getBoundingClientRect();
        position = zoneScroll.scrollTop + (rect.top - rectZone.top) - hauteurBandeau - 15;
      }

      return Math.min(maximum, Math.max(0, position));
    }

    function allerA(liste, i) {
      glisserA(positionDe(liste[i]), () => {
        // dernière étape atteinte : scroll libre (après l'inertie du trackpad)
        if (i === liste.length - 1) setTimeout(() => { actif = false; }, 300);
      });
    }

    // la première étape située plus bas que la position actuelle
    function avancer() {
      const liste = etapes();
      const ici = zoneScroll.scrollTop;
      const i = liste.findIndex(etape => positionDe(etape) > ici + 10);

      if (i === -1) {
        actif = false;   // plus rien en dessous : scroll libre
        return;
      }
      allerA(liste, i);
    }

    function enService() {
      if (cible.closest('.cache')) return false;          // partie cachée : on ne fait rien
      if (cible.classList.contains('corrige')) actif = false;
      return actif;
    }

    // molette / trackpad : seulement vers le bas, un geste = une étape
    zoneScroll.addEventListener('wheel', e => {
      if (!enService() || e.deltaY <= 0) return;   // vers le haut : défilement normal
      e.preventDefault();

      const maintenant = performance.now();
      const nouveauGeste = maintenant - dernierGeste > 250;
      dernierGeste = maintenant;

      if (nouveauGeste && !glissementEnCours) avancer();
    }, { passive: false });

    // clavier : flèche bas, page suivante, espace
    window.addEventListener('keydown', e => {
      if (!enService() || e.target.closest('input, button, textarea')) return;

      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        if (!glissementEnCours) avancer();
      }
    });

    // clic dans une ligne qui n'est pas bien placée : on y va
    // (un clic dans la ligne 1 garde la consigne en haut)
    cible.addEventListener('click', e => {
      if (!enService()) return;

      const bloc = e.target.closest('.qcm_bloc');
      if (!bloc) return;

      const liste = etapes();
      const i = lignesBlocs().findIndex(l => l.includes(bloc));
      if (i === -1 || !liste[i]) return;

      if (Math.abs(positionDe(liste[i]) - zoneScroll.scrollTop) > 10) allerA(liste, i);
    });
  });
}


// ---------- QCM avec correction à lire ----------
// <div class="qcm" data-texte-correction="…" data-texte-suite="…"
//      data-suite-cible="#partie_2" data-partie-actuelle="#partie_1"
//      data-tirage="4"
//      data-notion="un changement de modèle d’affaire" data-notion-cible="modele_affaire"
//      data-progression-debut="0" data-progression-reponses="20" data-progression-fin="50">
//   <div class="qcm_bloc" data-niveau="2" data-scenario="lessive">
//     scénario + options + <div class="qcm_correction">…
//   options : <input type="checkbox" data-juste> (bonne réponse)
//             <input type="checkbox" data-neutre> (ni vraie ni fausse)
//
// data-tirage="4" : seulement 4 blocs tirés au hasard, avec au moins un bloc
//                   de chaque data-niveau (sans data-tirage : tous les blocs)
// data-notion     : ce texte devient un mot notion (boîte data-notion-cible)
//                   dans la 1re question restante qui le contient
// data-aide="#aide_correction" (+ data-aide-delai="5000", en ms) : bulle de la mascotte
//                   (dans le HTML, avec hidden) montrée si, ce temps après le clic sur
//                   « correction », aucune correction n'a encore été ouverte
//
// 1. l'élève coche (cases bleues) : la barre va de progression-debut à progression-reponses
// 2. bouton « voir la correction » : vert = bonne réponse cochée,
//    rouge = mauvaise réponse cochée, rose = bonne réponse oubliée
//    (les réponses data-neutre restent hachurées). Une erreur a une case ronde.
//    Sous chaque question, un bouton « voir la correction » (data-texte-bouton-correction)
//    s'agrandit et devient la boîte de correction. La barre va jusqu'à progression-fin.
// 3. quand toutes les corrections ont été lues, le même bouton devient
//    actif : il affiche la partie suivante de l'activité (data-suite-cible),
//    ou, s'il n'y en a pas, remplit l'étoile et passe à la page suivante
function initQCM() {
  document.querySelectorAll('.qcm').forEach(qcm => {
    tirerBlocs(qcm);
    lierNotion(qcm);

    const blocs = [...qcm.querySelectorAll('.qcm_bloc')];
    const lus = new Set();
    const progressionDebut    = parseFloat(qcm.dataset.progressionDebut || 0);
    const progressionReponses = parseFloat(qcm.dataset.progressionReponses ?? progressionDebut);
    const progressionFin      = parseFloat(qcm.dataset.progressionFin || 100);
    let etape = 'reponse';   // 'reponse' → 'correction' → 'fini'

    // Bloc fixe en bas à droite : légende (après correction) + bouton
    const pied = document.createElement('div');
    pied.className = 'qcm_pied';
    pied.innerHTML = '<button class="qcm_verifier" type="button"></button>';
    document.body.appendChild(pied);
    const bouton = pied.querySelector('.qcm_verifier');
    bouton.textContent = qcm.dataset.texteCorrection || 'voir la correction';

    // Légende fixe, au-dessus du bouton mais derrière les blocs du QCM
    const legende = document.createElement('div');
    legende.className = 'qcm_legende';
    legende.innerHTML = `
      <span class="juste">bonne réponse cochée</span>
      <span class="erreur">mauvaise réponse cochée</span>
      <span class="oubli">bonne réponse oubliée</span>
      <span class="neutre">ni vraie ni fausse</span>`;
    document.body.appendChild(legende);

    // Bouton caché tant que la partie du QCM n'est pas affichée
    const partieQcm = qcm.closest('.partie_activite');
    if (partieQcm && partieQcm.classList.contains('cache')) {
      pied.style.display = 'none';
      partieQcm.addEventListener('affichee', () => { pied.style.display = ''; }, { once: true });
    }

    // Encadré mascotte « regarde toutes les corrections » (data-rappel),
    // affiché après data-rappel-apres corrections lues (0 par défaut : dès la correction)
    const rappel = qcm.dataset.rappel && document.querySelector(qcm.dataset.rappel);
    const rappelApres = parseInt(qcm.dataset.rappelApres, 10) || 0;

    // Bulle « passe ta souris sur… » (data-aide), si aucune correction n'est ouverte à temps
    const aide = qcm.dataset.aide && document.querySelector(qcm.dataset.aide);
    const aideDelai = parseInt(qcm.dataset.aideDelai, 10) || 5000;
    const cacherAide = () => { if (aide) aide.hidden = true; };
    aide?.querySelector('.qcm_fermer')?.addEventListener('click', cacherAide);

    // Pendant les réponses : la barre avance à chaque question à laquelle on a répondu
    qcm.addEventListener('change', () => {
      if (etape !== 'reponse') return;
      const repondus = blocs.filter(b => b.querySelector('.qcm_option input:checked')).length;
      reglerProgression(progressionDebut + (repondus / blocs.length) * (progressionReponses - progressionDebut), 100);
    });

    function lire(bloc) {
      if (etape !== 'correction' || lus.has(bloc)) return;
      lus.add(bloc);
      bloc.classList.add('lu');
      cacherAide();
      reglerProgression(progressionReponses + (lus.size / blocs.length) * (progressionFin - progressionReponses), 100);
      if (rappel) rappel.hidden = !(lus.size >= rappelApres && lus.size < blocs.length);
      if (lus.size === blocs.length) {
        bouton.disabled = false;
        bouton.title = '';
      }
    }

    bouton.addEventListener('click', () => {
      // → afficher la correction
      if (etape === 'reponse') {
        etape = 'correction';
        reglerProgression(progressionReponses, 100);
        qcm.classList.add('corrige');
        legende.classList.add('visible');

        if (rappel && rappelApres === 0) rappel.hidden = false;

        if (aide) {
          setTimeout(() => {
            if (etape === 'correction' && lus.size === 0) aide.hidden = false;
          }, aideDelai);
        }

        // Les définitions passent derrière les corrections, et ne s'ouvriront plus qu'au clic sur le mot
        document.body.classList.add('notions_au_clic');
        document.querySelectorAll('.mot_notion.epingle').forEach(m => m.classList.remove('epingle'));
        document.querySelectorAll('.boite_notion').forEach(b => b.classList.add('arriere_plan'));

        qcm.querySelectorAll('.qcm_option input').forEach(c => {
          c.disabled = true;
          const option = c.closest('.qcm_option');
          const juste = c.hasAttribute('data-juste');
          const neutre = c.hasAttribute('data-neutre');

          if (neutre) option.classList.add('neutre');
          else if (juste && c.checked) option.classList.add('juste');
          else if (juste) option.classList.add('oubli');
          else if (c.checked) option.classList.add('erreur');
        });

        qcm.dispatchEvent(new Event('corrige'));

        bouton.textContent = qcm.dataset.texteSuite || 'continuer';
        bouton.disabled = true;
        bouton.title = 'ouvre la correction de chaque scénario pour continuer';
        return;
      }

      // → passer à la suite de l'activité
      if (etape === 'correction') {
        etape = 'fini';
        rappel?.remove();
        aide?.remove();

        // les définitions disparaissent
        document.querySelectorAll('.boite_notion').forEach(b => b.classList.remove('visible', 'arriere_plan'));

        const cible = qcm.dataset.suiteCible && document.querySelector(qcm.dataset.suiteCible);
        if (cible) {
          // la partie suivante remplace la partie actuelle, sa consigne calée en haut
          pied.remove();
          legende.remove();
          document.querySelector(qcm.dataset.partieActuelle)?.classList.add('cache');
          afficherPartie(cible);
        } else {
          // fin de l'activité : étoile remplie, puis page suivante du cours
          marquerPartieFaite(numPartie);
          const lien = lienSuivant();
          if (lien) window.location.href = lien;
        }
      }
    });

    // Corrections : sous chaque question, un bouton « voir la correction » qui
    // s'agrandit et devient la boîte de correction (et se replie de la même façon).
    // Au clavier : Tab pour l'atteindre, Entrée / Espace pour ouvrir, Échap pour refermer.
    const texteBouton = qcm.dataset.texteBoutonCorrection || 'voir la correction';

    function deplier(bloc, ouvrir) {
      const zone = bloc._correction;
      if (!zone) return;
      zone.classList.toggle('ouverte', ouvrir);
      bloc.classList.toggle('ouverte', ouvrir);
      zone.bouton.setAttribute('aria-expanded', String(ouvrir));
      if (ouvrir) zone.bouton.setAttribute('aria-label', 'fermer la correction');
      else zone.bouton.removeAttribute('aria-label');
      zone.contenu.inert = !ouvrir;
      if (ouvrir) lire(bloc);
    }

    blocs.forEach((bloc, i) => {
      const correction = bloc.querySelector('.qcm_correction');
      if (!correction) return;

      // en tête de la boîte : la ou les bonnes réponses, écrites d'après les cases data-juste
      const justes = [...bloc.querySelectorAll('.qcm_option input[data-juste]')]
        .map(c => c.closest('.qcm_option').textContent.trim());
      if (justes.length) {
        const tete = document.createElement('div');
        tete.className = 'correction_justes';
        const liste = document.createElement('ul');
        justes.forEach(texte => {
          const li = document.createElement('li');
          li.textContent = texte;
          liste.appendChild(li);
        });
        tete.appendChild(liste);
        correction.prepend(tete);
      }

      // le dessin du scénario recopié dans la boîte
      const dessin = bloc.querySelector('.qcm_scenario img');
      if (dessin) {
        const copie = dessin.cloneNode();
        copie.className = 'qcm_correction_dessin';
        copie.alt = '';
        correction.prepend(copie);
      }

      // la boîte qui se déplie : <div class="correction_depliable">
      //   <button class="correction_bouton"> + <div class="correction_contenu"> (la correction)
      const zone = document.createElement('div');
      zone.className = 'correction_depliable';
      zone.hidden = true;                                   // visible seulement après « correction »

      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.className = 'correction_bouton';
      bouton.setAttribute('aria-expanded', 'false');
      const texte = document.createElement('span');
      texte.className = 'correction_bouton_texte';
      texte.textContent = texteBouton;
      bouton.appendChild(texte);

      const contenu = document.createElement('div');
      contenu.className = 'correction_contenu';
      contenu.id = correction.id || `correction_${i + 1}`;
      contenu.inert = true;
      bouton.setAttribute('aria-controls', contenu.id);

      correction.replaceWith(zone);
      correction.removeAttribute('id');
      contenu.appendChild(correction);
      zone.append(bouton, contenu);

      zone.bouton = bouton;
      zone.contenu = contenu;
      bloc._correction = zone;

      bouton.addEventListener('click', () => deplier(bloc, !zone.classList.contains('ouverte')));
      zone.addEventListener('keydown', e => {
        if (e.key === 'Escape' && zone.classList.contains('ouverte')) {
          e.preventDefault();
          deplier(bloc, false);
          bouton.focus();
        }
      });
    });

    // à la correction : les boutons apparaissent, et chaque réponse dit ce qu'elle est
    // (pour les lecteurs d'écran ; à l'écran, la couleur ET la forme de la case)
    const motsResultat = {
      juste: 'bonne réponse',
      erreur: 'erreur',
      oubli: 'bonne réponse oubliée',
      neutre: 'ni vraie ni fausse'
    };
    qcm.addEventListener('corrige', () => {
      blocs.forEach(bloc => { if (bloc._correction) bloc._correction.hidden = false; });
      qcm.querySelectorAll('.qcm_option').forEach(option => {
        const type = Object.keys(motsResultat).find(t => option.classList.contains(t));
        if (!type) return;
        const mot = document.createElement('span');
        mot.className = 'visuellement_cache';
        mot.textContent = ` (${motsResultat[type]})`;
        option.appendChild(mot);
      });
    });
  });
}

// Tirage au sort des blocs d'un QCM (data-tirage="4") :
// d'abord un bloc au hasard par niveau, puis on complète au hasard.
// Les blocs non tirés sont retirés de la page ; les autres gardent leur ordre.
function tirerBlocs(qcm) {
  const nombre = parseInt(qcm.dataset.tirage, 10);
  const tous = [...qcm.querySelectorAll('.qcm_bloc')];
  if (!nombre || nombre >= tous.length) return;

  const unParNiveau = new Map();
  melanger(tous).forEach(bloc => {
    const niveau = bloc.dataset.niveau || '';
    if (!unParNiveau.has(niveau)) unParNiveau.set(niveau, bloc);
  });

  let gardes = melanger([...unParNiveau.values()]).slice(0, nombre);
  const reste = melanger(tous.filter(b => !gardes.includes(b)));
  gardes = gardes.concat(reste.slice(0, nombre - gardes.length));

  tous.forEach(bloc => { if (!gardes.includes(bloc)) bloc.remove(); });

  // dessin à droite pour les blocs de la colonne de droite
  qcm.querySelectorAll('.qcm_bloc').forEach((bloc, i) => {
    bloc.classList.toggle('image_droite', i % 2 === 1);
  });
}


// Transforme le texte de data-notion en mot notion, dans la 1re question qui le contient
function lierNotion(qcm) {
  const texte = qcm.dataset.notion;
  const cibleId = qcm.dataset.notionCible;
  if (!texte || !cibleId) return;

  for (const option of qcm.querySelectorAll('.qcm_option span')) {
    const marcheur = document.createTreeWalker(option, NodeFilter.SHOW_TEXT);
    let noeud;
    while ((noeud = marcheur.nextNode())) {
      const i = noeud.textContent.indexOf(texte);
      if (i === -1) continue;

      const milieu = noeud.splitText(i);
      milieu.splitText(texte.length);
      const mot = document.createElement('span');
      mot.className = 'mot_notion';
      mot.dataset.cible = cibleId;
      milieu.replaceWith(mot);
      mot.appendChild(milieu);

      initNotions();   // relie ce nouveau mot à sa boîte
      return;
    }
  }
}


// ---------- Classement par glisser-déposer ----------
// <div class="classement" data-texte-correction="…" data-texte-suite="…"
//      data-progression-debut="50" data-progression-placement="90">
//   .depot.reserve         : les .carte à classer (data-niveau = bon niveau)
//   .niveau > .depot[data-niveau] : les zones où déposer
//   .classement_correction : texte de correction
// Une carte avec data-scenario="lessive" n'est gardée que si le QCM de la page
// a tiré le bloc data-scenario="lessive" (les cartes sans data-scenario restent).
// On attrape une carte à la souris, ou on clique la carte puis le niveau.
// La barre va de progression-debut à progression-placement au fil des cartes posées,
// puis à 100 % quand la correction s'affiche.
// « voir la correction » s'active quand toutes les cartes sont placées,
// puis « passer à la suite » remplit l'étoile et passe à la page suivante.
function initClassement() {
  // scénarios gardés par le tirage du QCM
  const scenariosQcm = new Set(
    [...document.querySelectorAll('.qcm_bloc[data-scenario]')].map(b => b.dataset.scenario)
  );

  document.querySelectorAll('.classement').forEach(classement => {
    if (scenariosQcm.size) {
      // cartes et paragraphes de correction des scénarios non tirés
      classement.querySelectorAll('.carte[data-scenario], .classement_correction [data-scenario]').forEach(el => {
        if (!scenariosQcm.has(el.dataset.scenario)) el.remove();
      });
    }

    const cartes = [...classement.querySelectorAll('.carte')];
    const zones = [...classement.querySelectorAll('.niveau, .reserve')];
    const correction = classement.querySelector('.classement_correction');
    const debut = parseFloat(classement.dataset.progressionDebut || 0);
    const placement = parseFloat(classement.dataset.progressionPlacement || 100);
    let etape = 'reponse';   // 'reponse' → 'correction' → 'fini'
    let choisie = null;

    // Bouton fixe, caché tant que la partie n'est pas affichée
    const pied = document.createElement('div');
    pied.className = 'qcm_pied';
    pied.innerHTML = '<button class="qcm_verifier" type="button" disabled></button>';
    document.body.appendChild(pied);
    const bouton = pied.querySelector('button');
    bouton.textContent = classement.dataset.texteCorrection || 'voir la correction';
    bouton.title = 'place toutes les cartes pour voir la correction';

    const partieActivite = classement.closest('.partie_activite');
    if (partieActivite && partieActivite.classList.contains('cache')) {
      pied.style.display = 'none';
      partieActivite.addEventListener('affichee', () => { pied.style.display = ''; }, { once: true });
    }

    // zone (niveau ou réserve) → l'endroit où poser la carte
    const depotDe = zone => zone.classList.contains('depot') ? zone : zone.querySelector('.depot');

    function zoneSous(x, y) {
      return document.elementsFromPoint(x, y).find(el => zones.includes(el)) || null;
    }

    function marquerSurvol(zone) {
      zones.forEach(z => z.classList.toggle('survol', z === zone));
    }

    // Quand on attrape une carte de la réserve, la page glisse pour que le schéma
    // soit juste sous le bandeau (la consigne bleue passe au-dessus).
    // Seulement si la réserve est fixée à l'écran : sinon la carte bougerait avec la page.
    function amenerSchema(carte) {
      const reserve = carte.closest('.reserve');
      if (!reserve || getComputedStyle(reserve).position !== 'fixed') return;

      const hauteurBandeau = document.getElementById('haut')?.offsetHeight || 0;
      const ecart = classement.getBoundingClientRect().top
                  - zoneScroll.getBoundingClientRect().top - hauteurBandeau - 15;
      if (Math.abs(ecart) > 10) calerEnHaut(classement);
    }

    function choisir(carte) {
      choisie = (choisie === carte) ? null : carte;
      cartes.forEach(c => c.classList.toggle('choisie', c === choisie));
    }

    function deposer(carte, zone) {
      depotDe(zone).appendChild(carte);
      choisie = null;
      cartes.forEach(c => c.classList.remove('choisie'));

      const placees = cartes.filter(c => c.closest('.depot').dataset.niveau).length;
      reglerProgression(debut + (placees / cartes.length) * (placement - debut), 100);
      bouton.disabled = placees < cartes.length;
      bouton.title = bouton.disabled ? 'place toutes les cartes pour voir la correction' : '';
    }

    // Glisser-déposer à la souris (ou au doigt)
    cartes.forEach(carte => {
      carte.tabIndex = 0;

      carte.addEventListener('pointerdown', e => {
        if (etape !== 'reponse') return;
        e.preventDefault();
        const departX = e.clientX;
        const departY = e.clientY;
        let glisse = false;
        carte.setPointerCapture(e.pointerId);

        function bouger(ev) {
          const dx = ev.clientX - departX;
          const dy = ev.clientY - departY;
          if (!glisse && Math.hypot(dx, dy) < 5) return;
          if (!glisse) amenerSchema(carte);   // 1er mouvement : le schéma vient sous le bandeau
          glisse = true;
          carte.classList.add('en_main');
          carte.style.translate = `${dx}px ${dy}px`;
          marquerSurvol(zoneSous(ev.clientX, ev.clientY));
        }

        function lacher(ev) {
          carte.removeEventListener('pointermove', bouger);
          carte.removeEventListener('pointerup', lacher);
          carte.removeEventListener('pointercancel', lacher);
          carte.classList.remove('en_main');
          carte.style.translate = '';
          marquerSurvol(null);

          if (!glisse) {            // simple clic : on choisit la carte
            choisir(carte);
            return;
          }
          const zone = zoneSous(ev.clientX, ev.clientY);
          if (zone) deposer(carte, zone);
        }

        carte.addEventListener('pointermove', bouger);
        carte.addEventListener('pointerup', lacher);
        carte.addEventListener('pointercancel', lacher);
      });

      carte.addEventListener('keydown', e => {
        if (etape === 'reponse' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          choisir(carte);
        }
      });
    });

    // Clic sur un niveau (ou la réserve) après avoir choisi une carte
    zones.forEach(zone => {
      zone.tabIndex = 0;
      zone.addEventListener('click', e => {
        if (etape === 'reponse' && choisie && !e.target.closest('.carte')) deposer(choisie, zone);
      });
      zone.addEventListener('keydown', e => {
        if (etape === 'reponse' && choisie && e.target === zone && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          deposer(choisie, zone);
        }
      });
    });

    // Boîte de correction : rond rouge pour fermer, déplaçable
    if (correction) {
      const fermer = document.createElement('button');
      fermer.type = 'button';
      fermer.className = 'qcm_fermer';
      fermer.setAttribute('aria-label', 'fermer la correction');
      correction.prepend(fermer);
      fermer.addEventListener('click', () => correction.classList.remove('ouverte'));
      rendreDeplacable(correction);
    }

    bouton.addEventListener('click', () => {
      // → correction
      if (etape === 'reponse') {
        etape = 'correction';
        reglerProgression(100, 100);
        classement.classList.add('corrige');
        choisie = null;

        cartes.forEach(carte => {
          carte.classList.remove('choisie');
          const juste = carte.closest('.depot').dataset.niveau === carte.dataset.niveau;
          carte.classList.add(juste ? 'juste' : 'erreur');
          // le bon niveau s'ajoute dans l'étiquette de la carte
          if (!juste) carte.querySelector('span')?.append(` → niveau ${carte.dataset.niveau}`);
        });

        if (correction) {
          correction.classList.add('ouverte');
          centrerSur(correction.getBoundingClientRect());
        }

        bouton.textContent = classement.dataset.texteSuite || 'passer à la suite';
        return;
      }

      if (etape === 'correction') {
        etape = 'fini';
        const cible = classement.dataset.suiteCible && document.querySelector(classement.dataset.suiteCible);

        if (cible) {
          // → la suite apparaît sous le classement (ex : « à retenir »)
          pied.remove();
          correction?.classList.remove('ouverte');
          cible.classList.remove('cache');
          cible.dispatchEvent(new Event('affichee'));
          requestAnimationFrame(() => centrerSur(cible.getBoundingClientRect()));
        } else {
          // → fin de l'activité : étoile remplie, page suivante
          terminerActivite();
        }
      }
    });
  });
}


// ---------- Bouton qui affiche une partie cachée ----------
// <button data-afficher="#partie_1"> : la partie apparaît, le bouton disparaît,
// et la consigne de la partie se cale en haut de l'écran.
function initAfficher() {
  document.querySelectorAll('[data-afficher]').forEach(bouton => {
    bouton.addEventListener('click', () => {
      const cible = document.querySelector(bouton.dataset.afficher);
      if (!cible) return;
      (bouton.closest('.conteneur_depart') || bouton).remove();
      afficherPartie(cible);
    });
  });
}

// Affiche une partie cachée et cale sa consigne (ou la partie) en haut de l'écran
function afficherPartie(cible) {
  cible.classList.remove('cache');
  cible.dispatchEvent(new Event('affichee'));
  const haut = cible.querySelector('.consigne') || cible;
  requestAnimationFrame(() => {
    // la partie apparaît en glissant de bas en haut : on tient compte de ce décalage
    const t = getComputedStyle(cible).transform;
    const decalage = t && t !== 'none' ? new DOMMatrix(t).m42 : 0;
    calerEnHaut(haut, null, decalage + 10);
  });
}


// ---------- Bouton de fin d'activité ----------
// <button data-fin-activite> : remplit l'étoile et passe à la page suivante
function initFinActivite() {
  document.querySelectorAll('[data-fin-activite]').forEach(bouton => {
    bouton.addEventListener('click', terminerActivite);
  });
}

function terminerActivite() {
  marquerPartieFaite(numPartie);
  const lien = lienSuivant();
  if (lien) window.location.href = lien;
}


// ---------------------------------------------------------------------
// 3. OUTILS POUR LES ACTIVITÉS
// ---------------------------------------------------------------------

// Fait apparaître le bouton « passer à la suite »
function afficherSuite() {
  document.querySelector('.conteneur_suite')?.classList.remove('cache');
}

// Fait avancer la barre rose du haut, ex : reglerProgression(2, 4) → 50 %
function reglerProgression(fait, total) {
  const barre = document.getElementById('barre_progression_remplie');
  if (barre) barre.style.width = (fait / total) * 100 + '%';
}

// Remplit l'étoile d'une partie dans la barre verticale
function marquerPartieFaite(p) {
  partiesFaites.add(p);
  document.querySelector(`#barre_progression_chapitre .etoile[data-partie="${p}"]`)?.classList.add('fait');
  // demain : enregistrer aussi la progression dans le SCORM
}

// Rend un élément déplaçable à la souris (sauf quand on clique sur un de ses boutons).
// La position de départ est relue à chaque prise : si l'élément a été remis à sa place
// entre-temps, il ne saute pas.
function rendreDeplacable(el) {
  el.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    e.preventDefault();

    const [x0 = 0, y0 = 0] = (el.style.translate || '0px 0px').split(' ').map(v => parseFloat(v) || 0);
    const departX = e.clientX - x0;
    const departY = e.clientY - y0;

    el.setPointerCapture(e.pointerId);
    el.classList.add('deplacement');

    function bouger(ev) {
      el.style.translate = `${ev.clientX - departX}px ${ev.clientY - departY}px`;
    }

    function lacher() {
      el.classList.remove('deplacement');
      el.removeEventListener('pointermove', bouger);
      el.removeEventListener('pointerup', lacher);
      el.removeEventListener('pointercancel', lacher);
    }

    el.addEventListener('pointermove', bouger);
    el.addEventListener('pointerup', lacher);
    el.addEventListener('pointercancel', lacher);
  });
}

// Fait glisser la zone de contenu jusqu'à une position, en douceur
var glissementEnCours = false;

function glisserA(arrivee, surFin) {
  const depart = zoneScroll.scrollTop;
  const maximum = zoneScroll.scrollHeight - zoneScroll.clientHeight;
  arrivee = Math.min(maximum, Math.max(0, arrivee));

  const duree = 700;
  const debut = performance.now();
  glissementEnCours = true;

  function pas(maintenant) {
    const t = Math.min(1, (maintenant - debut) / duree);
    const douceur = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    zoneScroll.scrollTop = depart + (arrivee - depart) * douceur;
    if (t < 1) {
      requestAnimationFrame(pas);
    } else {
      glissementEnCours = false;
      if (surFin) surFin();
    }
  }
  requestAnimationFrame(pas);
}

// Centre un rectangle à l'écran (sous le bandeau), ou le cale en haut s'il est trop grand
function centrerSur(rect, surFin) {
  const hauteurBandeau = document.getElementById('haut')?.offsetHeight || 0;
  const rectZone = zoneScroll.getBoundingClientRect();
  const hauteurVisible = zoneScroll.clientHeight - hauteurBandeau;
  const marge = Math.max(20, (hauteurVisible - rect.height) / 2);
  glisserA(zoneScroll.scrollTop + (rect.top - rectZone.top) - hauteurBandeau - marge, surFin);
}

// Cale un élément tout en haut, juste sous le bandeau
// (marge : espace en plus au-dessus de l'élément, en px)
function calerEnHaut(element, surFin, marge = 0) {
  const hauteurBandeau = document.getElementById('haut')?.offsetHeight || 0;
  const rectZone = zoneScroll.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  glisserA(zoneScroll.scrollTop + (rect.top - rectZone.top) - hauteurBandeau - 15 - marge, surFin);
}

// Rectangle qui englobe plusieurs éléments (ex : une ligne de blocs)
function rectDe(elements) {
  const rects = elements.map(el => el.getBoundingClientRect());
  const top = Math.min(...rects.map(r => r.top));
  const bottom = Math.max(...rects.map(r => r.bottom));
  return { top, height: bottom - top };
}