// =====================================================================
// SCRIPT DU CHAPITRE 3
// Ce qui ne sert qu'au chapitre 3. À charger APRÈS script.js
// (il utilise COURS, zoneScroll, versRacine…) et AVANT dessins.js
// (le mini schéma doit être dans la page avant que ses dessins soient insérés en SVG).
//
// Dans le <head> des pages de chap_3/ :
//   <script src="../cours.js" defer></script>
//   <script src="../script.js" defer></script>
//   <script src="script/chap3.js" defer></script>
//   <script src="../dessins.js" defer></script>
// =====================================================================

initMiniEtapes();
initFrises();
initCentrageSchemas();


// ---------- Mini schéma des étapes (en haut à droite) ----------
// <body data-etape="B"> : le mini schéma des 6 étapes (cours.js : etapesDemarche) apparaît en haut à droite,
// l'étape B mise en avant et son nom au centre. data-etape="E F" : deux étapes à la fois.
// <body data-mini-apres="#schema_etapes"> : il n'apparaît qu'une fois cet élément dépassé en faisant défiler la page
// (et disparaît si on remonte jusqu'à lui).
// Simple repère : rien n'est cliquable. Masqué sur petit écran (CSS).
function initMiniEtapes() {
  const lettres = (document.body.dataset.etape || '').split(/\s+/).filter(Boolean);
  const etapes  = COURS.etapesDemarche;
  const gauche  = document.getElementById('contenu_gauche');
  if (!lettres.length || !etapes || !gauche) return;

  // places des 6 dessins sur le cercle (en %), dans l'ordre A → F
  const PLACES = [[50, 14], [81.2, 32], [81.2, 68], [50, 86], [18.8, 68], [18.8, 32]];
  const estEnCours = e => lettres.includes(e.lettre);

  const dessins = etapes.map((e, i) => `
      <div class="mini_etape${estEnCours(e) ? ' en_cours' : ''}" style="left:${PLACES[i][0]}%; top:${PLACES[i][1]}%;">
        <img src="${versRacine(e.dessin)}" alt="">
        <span class="mini_nom" aria-hidden="true">${e.lettre}. ${e.nom}</span>
      </div>`).join('');

  const centre = etapes.filter(estEnCours).map(e => `${e.lettre}. ${e.nom}`).join('<br>');
  const liste  = etapes.map(e => `<li>${e.lettre}. ${e.nom}${estEnCours(e) ? ' (étape en cours)' : ''}</li>`).join('');

  // dans #contenu_gauche : dessins.js y insère les SVG (couleurs de couleurs.css)
  gauche.insertAdjacentHTML('afterbegin', `
    <aside class="mini_etapes" aria-label="Où en es-tu dans la démarche d’éco-conception ?">
      <svg class="mini_fleches" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <marker id="pointe_mini" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M0 0 L10 5 L0 10 z"/>
          </marker>
        </defs>
        <path d="M64.1 16.9 A36 36 0 0 1 71.7 21.2" marker-end="url(#pointe_mini)"/>
        <path d="M85.7 45.6 A36 36 0 0 1 85.7 54.4" marker-end="url(#pointe_mini)"/>
        <path d="M71.7 78.8 A36 36 0 0 1 64.1 83.1" marker-end="url(#pointe_mini)"/>
        <path d="M35.9 83.1 A36 36 0 0 1 28.3 78.8" marker-end="url(#pointe_mini)"/>
        <path d="M14.3 54.4 A36 36 0 0 1 14.3 45.6" marker-end="url(#pointe_mini)"/>
        <path d="M28.3 21.2 A36 36 0 0 1 35.9 16.9" marker-end="url(#pointe_mini)"/>
      </svg>
      ${dessins}
      <p class="mini_centre" aria-hidden="true">${centre}</p>
      <ul class="visuellement_cache">${liste}</ul>
    </aside>`);

  const mini = gauche.querySelector('.mini_etapes');
  const des  = document.body.dataset.miniDes && document.querySelector(document.body.dataset.miniDes);

  // sans data-mini-des : visible tout de suite
  if (!des || !zoneScroll) {
    mini.classList.add('visible');
    return;
  }

  // avec data-mini-des : visible dès que l'élément passe la ligne des 60 % de l'écran (comme les autres apparitions)
  function verifier() {
    const zone  = zoneScroll.getBoundingClientRect();
    const ligne = zone.top + zone.height * 0.6;
    mini.classList.toggle('visible', des.getBoundingClientRect().top < ligne);
  }
  zoneScroll.addEventListener('scroll', verifier);
  window.addEventListener('resize', verifier);
  verifier();
}


// ---------- Frise à étapes (ex. analyse d'usage) ----------
// <div class="frise_usage"> : des .frise_scene (dessin + phrase), des .frise_segment (les étapes)
// et un <input type="range" class="frise_curseur">.
// On fait glisser la boule, on clique une étape, ou on utilise les flèches du clavier :
// le dessin et la phrase de l'étape apparaissent, son intervalle passe en gras.
function initFrises() {
  document.querySelectorAll('.frise_usage').forEach(frise => {
    const curseur  = frise.querySelector('.frise_curseur');
    const scenes   = [...frise.querySelectorAll('.frise_scene')];
    const segments = [...frise.querySelectorAll('.frise_segment')];
    if (!curseur || !segments.length) return;

    curseur.min = 1;
    curseur.max = segments.length;

    function afficher(n) {
      curseur.value = n;
      scenes.forEach((s, i) => s.classList.toggle('visible', i === n - 1));
      segments.forEach((s, i) => {
        s.classList.toggle('choisi', i === n - 1);
        s.setAttribute('aria-pressed', String(i === n - 1));
      });
      curseur.setAttribute('aria-valuetext', segments[n - 1].textContent.trim());
    }

    curseur.addEventListener('input', () => afficher(parseInt(curseur.value, 10)));
    segments.forEach((s, i) => s.addEventListener('click', () => afficher(i + 1)));

    afficher(parseInt(curseur.value, 10) || 1);
  });
}


// ---------- Centrage à l'écran, une seule fois ----------
// Schémas circulaires (étapes, 360°, cycle de vie) : au 1er survol d'un de leurs dessins.
// Frise d'usage : à la 1re interaction (clic, glisser, clavier) ;
//   data-centrer-avec="#titre_usage" : on centre le titre ET la frise ensemble.
// La page défile doucement pour mettre le tout au milieu de l'écran (sous le bandeau du titre),
// ou le cale en haut s'il est plus grand que l'écran. Ensuite, plus rien ne bouge.
function initCentrageSchemas() {
  if (!zoneScroll) return;

  const DELAI = 300;   // attente avant de bouger (ms)
  const DUREE = 900;   // durée du défilement (ms)

  // défilement doux, à vitesse réglable (ralentit au début et à la fin)
  function defiler(ecart) {
    const depart = zoneScroll.scrollTop;
    const debut  = performance.now();
    function pas(maintenant) {
      const t = Math.min((maintenant - debut) / DUREE, 1);
      const doux = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      zoneScroll.scrollTop = depart + ecart * doux;
      if (t < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  // centre l'ensemble formé par ces éléments dans la partie visible de l'écran
  function centrer(elements) {
    setTimeout(() => {
      const zone   = zoneScroll.getBoundingClientRect();
      const hautVu = zone.top + (document.getElementById('haut')?.offsetHeight || 0);
      const rects  = elements.map(el => el.getBoundingClientRect());
      const haut   = Math.min(...rects.map(r => r.top));
      const bas    = Math.max(...rects.map(r => r.bottom));
      const ecart  = (bas - haut) > (zone.bottom - hautVu)
        ? haut - hautVu - 15                                   // trop grand : calé en haut
        : (haut + bas) / 2 - (hautVu + zone.bottom) / 2;       // sinon : centré
      if (Math.abs(ecart) > 30) defiler(ecart);
    }, DELAI);
  }

  // schémas circulaires : au 1er survol d'un dessin
  document.querySelectorAll('#contenu_gauche :is(.schema_etapes, .schema_360, .schema_acv, .schema_pistes)').forEach(schema => {    function surDessin(e) {
      if (!e.target.closest('.etape_cycle')) return;
      schema.removeEventListener('mouseover', surDessin);
      centrer([schema]);
    }
    schema.addEventListener('mouseover', surDessin);
  });

  // frise d'usage : à la 1re interaction, avec son titre (data-centrer-avec)
  document.querySelectorAll('#contenu_gauche .frise_usage').forEach(frise => {
    const avec = frise.dataset.centrerAvec && document.querySelector(frise.dataset.centrerAvec);
    let fait = false;
    function lancer() {
      if (fait) return;
      fait = true;
      centrer(avec ? [avec, frise] : [frise]);
    }
    frise.addEventListener('pointerdown', lancer);
    frise.addEventListener('focusin', lancer);
  });
}