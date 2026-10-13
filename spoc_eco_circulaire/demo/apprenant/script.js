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
initGraphiques();
initRecentrage();
initQCM();
initClassement();

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


// ---------- Mots notion → boîte de définition à droite ----------
function initNotions() {
  const conteneur = document.getElementById('contenu_chapitre');
  if (!conteneur) return;

  document.querySelectorAll('.mot_notion[data-cible]').forEach(mot => {
    const boite = document.getElementById(mot.dataset.cible);
    if (!boite) return;

    function placer() {
      const rectMot = mot.getBoundingClientRect();
      const rectConteneur = conteneur.getBoundingClientRect();
      boite.style.top = (rectMot.top - rectConteneur.top) + 'px';
    }

    // Survol : seulement si la page n'est pas passée en mode « notions au clic »
    mot.addEventListener('mouseenter', () => {
      if (document.body.classList.contains('notions_au_clic')) return;
      placer();
      boite.classList.add('visible');
    });

    mot.addEventListener('mouseleave', () => {
      if (!mot.classList.contains('epingle')) boite.classList.remove('visible');
    });

    // preventDefault : un mot notion placé dans une réponse de QCM ne coche pas la case
    mot.addEventListener('click', e => {
      e.preventDefault();
      mot.classList.toggle('epingle');
      placer();
      boite.classList.toggle('visible', mot.classList.contains('epingle'));
    });
  });
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
  conteneur.querySelectorAll('.zone_hover').forEach(zone => {
    const p = parseInt(zone.dataset.partie, 10);
    const position = ((p - 0.5) / total) * 100 + '%';

    zone.style.top = ((p - 1) / total) * 100 + '%';
    zone.style.height = (1 / total) * 100 + '%';

    zone.addEventListener('mouseenter', () => {
      const fait = partiesFaites.has(p);
      const estEtoile = zone.dataset.etoile === 'true';

      pointHover.style.opacity = '0';
      labelPartie.style.opacity = '0';

      setTimeout(() => {
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

    zone.addEventListener('mouseleave', () => {
      pointHover.classList.remove('visible');
      pointHover.style.opacity = '0';
      labelPartie.style.opacity = '0';
    });
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


// ---------- Animations Rive ----------
// Tout <canvas class="anim_riv"> placé dans un .media_exemple est pris en charge.
// La 1re animation de la page se joue au chargement et au retour en haut,
// les suivantes à chaque passage de la ligne des 60 %.
function initAnimationsRive() {
  if (typeof rive === 'undefined') return;

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
        stateMachines: canvas.dataset.machine,
        onLoad: () => r.resizeDrawingSurfaceToCanvas(),
        onLoadError: e => console.error('Rive :', canvas.dataset.riv, e),
      });

      r.on(rive.EventType.Loop, () => r.pause());
      instances.push(r);
    });

    if (instances.length) groupes.push({ media, instances });
  });

  if (!groupes.length) return;

  function jouer(instances) {
    instances.forEach(r => {
      r.reset();
      r.play();
    });
  }

  // 1re animation : au chargement + à chaque retour tout en haut
  setTimeout(() => jouer(groupes[0].instances), 1000);
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

  const modalImage = modal.querySelector('.modal_dessin_image');
  const modalTitre = modal.querySelector('.modal_dessin_titre');
  const modalDef = modal.querySelector('.modal_dessin_def');

  items.forEach(item => {
    const nom = item.dataset.nom;
    const def = item.dataset.def;
    const img = item.querySelector('img');
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

    // Pop-up au clic
    item.addEventListener('click', () => {
      modalImage.src = imageActeur || img.src;
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
}


// ---------- Graphiques en barres + boutons produit A / B ----------
function initGraphiques() {
  document.querySelectorAll('.graphique').forEach(graph => {
    const max = parseFloat(graph.dataset.max) || 10;
    const barres = [];
    let produitActif = 'a';

    const zone = document.createElement('div');
    zone.className = 'graph_zone';
    const noms = document.createElement('div');
    noms.className = 'graph_noms';

    graph.querySelectorAll('.graph_donnee').forEach((donnee, i) => {
      const groupe = document.createElement('div');
      groupe.className = 'graph_groupe';

      const barre = document.createElement('div');
      barre.className = 'graph_barre';
      barre.dataset.a = (parseFloat(donnee.dataset.a) / max) * 100 + '%';
      barre.dataset.b = (parseFloat(donnee.dataset.b) / max) * 100 + '%';
      barre.style.transitionDelay = i * 0.12 + 's';
      groupe.appendChild(barre);
      barres.push(barre);
      zone.appendChild(groupe);

      const nom = document.createElement('div');
      nom.textContent = donnee.dataset.nom;
      noms.appendChild(nom);

      donnee.remove();
    });

    graph.append(zone, noms);

    function afficherProduit(produit) {
      produitActif = produit;
      barres.forEach(b => b.style.height = b.dataset[produit]);
    }

    // Remise à zéro puis montée des barres
    function jouer() {
      graph.classList.add('reset');
      barres.forEach(b => b.style.height = '0');
      void graph.offsetHeight;
      graph.classList.remove('reset');
      requestAnimationFrame(() => afficherProduit(produitActif));
    }

    const boutons = document.querySelectorAll(`.choix_produit[data-graph="${graph.id}"] .bouton_produit`);
    boutons.forEach(bouton => {
      bouton.addEventListener('click', () => {
        boutons.forEach(b => b.classList.toggle('actif', b === bouton));
        afficherProduit(bouton.dataset.produit);
      });
    });

    surPassage(graph, jouer);
  });
}


// ---------- Défilement par étapes ----------
// <div data-recentrer data-premiere-etape="#id"> :
// chaque geste de scroll vers le bas fait glisser la page vers l'étape suivante.
//   1re étape : l'élément de data-premiere-etape, calé tout en haut sous le bandeau
//   ensuite   : dans un QCM, chaque ligne de blocs, centrée
// Une fois la dernière étape atteinte (ou la correction lancée), le scroll redevient libre.
function initRecentrage() {
  if (!zoneScroll) return;

  document.querySelectorAll('[data-recentrer]').forEach(cible => {
    let index = -1;          // -1 = tout en haut de la page
    let actif = true;
    let dernierGeste = 0;

    const premiere = cible.dataset.premiereEtape
      ? document.querySelector(cible.dataset.premiereEtape)
      : null;

    // les lignes de blocs du QCM
    function lignesBlocs() {
      const lignes = [];
      cible.querySelectorAll('.qcm_bloc').forEach(b => {
        const ligne = lignes.find(l => Math.abs(l[0].offsetTop - b.offsetTop) < 5);
        if (ligne) ligne.push(b);
        else lignes.push([b]);
      });
      return lignes;
    }

    // étapes : la consigne calée en haut (qui montre aussi la 1re ligne),
    // puis les lignes suivantes, centrées
    function etapes() {
      const lignes = lignesBlocs();
      if (!lignes.length) return premiere ? [premiere] : [[cible]];
      return premiere ? [premiere, ...lignes.slice(1)] : lignes;
    }

    function allerA(i) {
      const liste = etapes();
      if (i >= liste.length) return;
      index = i;
      if (i < 0) {
        glisserA(0);
        return;
      }

      const etape = liste[i];
      const fin = () => {
        // dernière étape atteinte : scroll libre (après l'inertie du trackpad)
        if (index === liste.length - 1) setTimeout(() => { actif = false; }, 300);
      };

      if (Array.isArray(etape)) centrerSur(rectDe(etape), fin);   // une ligne de blocs : centrée
      else calerEnHaut(etape, fin);                               // une consigne : tout en haut
    }

    function enService() {
      if (cible.closest('.cache')) return false;          // partie cachée : on ne fait rien
      if (cible.classList.contains('corrige')) actif = false;
      return actif;
    }

    // un geste = une série d'événements molette ; on ne compte que le début de chaque geste
    zoneScroll.addEventListener('wheel', e => {
      if (!enService()) return;
      e.preventDefault();
      const maintenant = performance.now();
      const nouveauGeste = maintenant - dernierGeste > 250;
      dernierGeste = maintenant;
      if (!nouveauGeste || glissementEnCours) return;
      if (e.deltaY > 0) allerA(index + 1);
      else if (index >= 0) allerA(index - 1);
    }, { passive: false });

    window.addEventListener('keydown', e => {
      if (!enService() || e.target.closest('input, button, textarea')) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault();
        allerA(index + 1);
      } else if (['ArrowUp', 'PageUp'].includes(e.key) && index >= 0) {
        e.preventDefault();
        allerA(index - 1);
      }
    });

    // clic dans une ligne qui n'est pas encore centrée : on la centre
    // clic dans une ligne : on y va (un clic dans la ligne 1 garde la consigne en haut)
    cible.addEventListener('click', e => {
      if (!enService()) return;
      const bloc = e.target.closest('.qcm_bloc');
      if (!bloc) return;
      const i = lignesBlocs().findIndex(l => l.includes(bloc));
      if (i !== -1 && i !== index) allerA(i);
    });
  });
}



// ---------- QCM avec correction à lire ----------
// <div class="qcm" data-texte-correction="…" data-texte-suite="…"
//      data-suite-cible="#partie_2" data-progression-fin="50">
//   <div class="qcm_bloc"> scénario + options + <div class="qcm_correction">…
//   options : <input type="checkbox" data-juste> (bonne réponse)
//             <input type="checkbox" data-neutre> (ni vraie ni fausse)
//
// 1. l'élève coche (cases bleues)
// 2. bouton « voir la correction » : vert = bonne réponse cochée,
//    rouge = mauvaise réponse cochée, rose = bonne réponse oubliée
//    (les réponses data-neutre restent sans couleur). Chaque bloc montre sa correction
//    au survol, et la garde au clic.
// 3. quand toutes les corrections ont été lues, le même bouton devient
//    actif : il affiche la partie suivante de l'activité (data-suite-cible),
//    ou, s'il n'y en a pas, remplit l'étoile et passe à la page suivante
function initQCM() {
  document.querySelectorAll('.qcm').forEach(qcm => {
    const blocs = [...qcm.querySelectorAll('.qcm_bloc')];
    const lus = new Set();
    const progressionFin = parseFloat(qcm.dataset.progressionFin || 100);
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

    function lire(bloc) {
      if (etape !== 'correction' || lus.has(bloc)) return;
      lus.add(bloc);
      bloc.classList.add('lu');
      reglerProgression((lus.size / blocs.length) * progressionFin, 100);
      if (lus.size === blocs.length) {
        bouton.disabled = false;
        bouton.title = '';
      }
    }

    bouton.addEventListener('click', () => {
      // → afficher la correction
      if (etape === 'reponse') {
        etape = 'correction';
        qcm.classList.add('corrige');
        legende.classList.add('visible');
             // Les définitions se ferment et ne s'ouvriront plus qu'au clic sur le mot
        document.body.classList.add('notions_au_clic');
        document.querySelectorAll('.mot_notion.epingle').forEach(m => m.classList.remove('epingle'));
        document.querySelectorAll('.boite_notion.visible').forEach(b => b.classList.remove('visible'));   

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

        bouton.textContent = qcm.dataset.texteSuite || 'continuer';
        bouton.disabled = true;
        bouton.title = 'lis la correction de chaque scénario pour continuer';
        return;
      }

      // → passer à la suite de l'activité
      if (etape === 'correction') {
        etape = 'fini';
        const cible = qcm.dataset.suiteCible && document.querySelector(qcm.dataset.suiteCible);
        if (cible) {
          // la partie suivante remplace la partie actuelle
          pied.remove();
          legende.remove();
          document.querySelector(qcm.dataset.partieActuelle)?.classList.add('cache');
          cible.classList.remove('cache');
          cible.dispatchEvent(new Event('affichee'));
          zoneScroll.scrollTop = 0;
        } else {
          // fin de l'activité : étoile remplie, puis page suivante du cours
          marquerPartieFaite(numPartie);
          const lien = lienSuivant();
          if (lien) window.location.href = lien;
        }
      }
    });

    // Encadrés de correction : dessin du scénario, rond rouge pour fermer, déplaçables
    let premierPlan = 50;

    function ouvrir(bloc) {
      const correction = bloc.querySelector('.qcm_correction');
      bloc.classList.add('ouverte');
      correction.style.zIndex = ++premierPlan;
      lire(bloc);
      centrerSur(correction.getBoundingClientRect());
    }

    blocs.forEach(bloc => {
      const correction = bloc.querySelector('.qcm_correction');
      if (!correction) return;

      // on recopie le dessin du scénario dans l'encadré
      const dessin = bloc.querySelector('.qcm_scenario img');
      if (dessin) {
        const copie = dessin.cloneNode();
        copie.className = 'qcm_correction_dessin';
        correction.prepend(copie);
      }

      // rond rouge pour fermer
      const fermer = document.createElement('button');
      fermer.type = 'button';
      fermer.className = 'qcm_fermer';
      fermer.setAttribute('aria-label', 'fermer la correction');
      correction.prepend(fermer);
      fermer.addEventListener('click', e => {
        e.stopPropagation();
        bloc.classList.remove('ouverte');
      });

      // 1re fois : s'ouvre au survol (vrai mouvement de souris, pas pendant un glissement)
      bloc.addEventListener('mousemove', () => {
        if (etape === 'correction' && !lus.has(bloc) && !glissementEnCours) ouvrir(bloc);
      });
      bloc.addEventListener('click', e => {
        if (etape === 'reponse' || e.target.closest('.mot_notion, .qcm_correction')) return;
        ouvrir(bloc);
      });

      // l'encadré passe devant quand on l'attrape
      correction.addEventListener('pointerdown', () => { correction.style.zIndex = ++premierPlan; });      rendreDeplacable(correction);
    });
  });
}




// ---------- Classement par glisser-déposer ----------
// <div class="classement" data-texte-correction="…" data-texte-suite="…" data-progression-debut="50">
//   .depot.reserve         : les .carte à classer (data-niveau = bon niveau)
//   .niveau > .depot[data-niveau] : les zones où déposer
//   .classement_correction : texte de correction
// On attrape une carte à la souris, ou on clique la carte puis le niveau.
// « voir la correction » s'active quand toutes les cartes sont placées,
// puis « passer à la suite » remplit l'étoile et passe à la page suivante.
function initClassement() {
  document.querySelectorAll('.classement').forEach(classement => {
    const cartes = [...classement.querySelectorAll('.carte')];
    const zones = [...classement.querySelectorAll('.niveau, .reserve')];
    const correction = classement.querySelector('.classement_correction');
    const debut = parseFloat(classement.dataset.progressionDebut || 0);
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

    const partie = classement.closest('.partie_activite');
    if (partie && partie.classList.contains('cache')) {
      pied.style.display = 'none';
      partie.addEventListener('affichee', () => { pied.style.display = ''; }, { once: true });
    }
    // zone (niveau ou réserve) → l'endroit où poser la carte
    const depotDe = zone => zone.classList.contains('depot') ? zone : zone.querySelector('.depot');

    function zoneSous(x, y) {
      return document.elementsFromPoint(x, y).find(el => zones.includes(el)) || null;
    }

    function marquerSurvol(zone) {
      zones.forEach(z => z.classList.toggle('survol', z === zone));
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
      reglerProgression(debut + (placees / cartes.length) * (100 - debut), 100);
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
        classement.classList.add('corrige');
        choisie = null;

        cartes.forEach(carte => {
          carte.classList.remove('choisie');
          const juste = carte.closest('.depot').dataset.niveau === carte.dataset.niveau;
          carte.classList.add(juste ? 'juste' : 'erreur');
          if (!juste) {
            const note = document.createElement('span');
            note.className = 'carte_correction';
            note.textContent = `→ niveau ${carte.dataset.niveau}`;
            carte.appendChild(note);
          }
        });

        if (correction) {
          correction.classList.add('ouverte');
          centrerSur(correction.getBoundingClientRect());
        }

        bouton.textContent = classement.dataset.texteSuite || 'passer à la suite';
        return;
      }

      // → fin de l'activité : étoile remplie, page suivante
      if (etape === 'correction') {
        etape = 'fini';
        marquerPartieFaite(numPartie);
        const lien = lienSuivant();
        if (lien) window.location.href = lien;
      }
    });
  });
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



// Rend un élément déplaçable à la souris (sauf quand on clique sur un de ses boutons)
function rendreDeplacable(el) {
  let x = 0;
  let y = 0;

  el.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    const departX = e.clientX - x;
    const departY = e.clientY - y;
    el.setPointerCapture(e.pointerId);
    el.classList.add('deplacement');

    function bouger(ev) {
      x = ev.clientX - departX;
      y = ev.clientY - departY;
      el.style.translate = `${x}px ${y}px`;
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
function calerEnHaut(element, surFin) {
  const hauteurBandeau = document.getElementById('haut')?.offsetHeight || 0;
  const rectZone = zoneScroll.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  glisserA(zoneScroll.scrollTop + (rect.top - rectZone.top) - hauteurBandeau - 15, surFin);
}


// Rectangle qui englobe plusieurs éléments (ex : une ligne de blocs)
function rectDe(elements) {
  const rects = elements.map(el => el.getBoundingClientRect());
  const top = Math.min(...rects.map(r => r.top));
  const bottom = Math.max(...rects.map(r => r.bottom));
  return { top, height: bottom - top };
}




