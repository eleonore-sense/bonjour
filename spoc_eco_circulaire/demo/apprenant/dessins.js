// =====================================================================
// DESSINS SVG EN LIGNE
//
// Remplace chaque <img src="….svg"> du contenu par le SVG lui-même,
// pour que couleurs.css puisse régler les couleurs et les traits.
// Les fichiers restent dans le dossier dessin/, rien à copier dans le HTML.
//
// À charger APRÈS script.js, avec defer :
//   <script src="dessins.js" defer></script>
// (le QCM copie les dessins dans les corrections : il faut les copies aussi)
//
// Ne fonctionne qu'avec un serveur, pas en ouvrant la page en file://.
// Les .riv ne sont pas concernés : ce sont des <canvas>.
// =====================================================================

(function () {

  const ZONE      = '#contenu_gauche';
  const SELECTEUR = 'img[src$=".svg" i]';

  const fichiers = new Map();      // un seul téléchargement par fichier
  const traites  = new WeakSet();  // une image n'est traitée qu'une fois
  let compteur   = 0;


  // ---------- Téléchargement ----------

  function charger(url) {
    if (!fichiers.has(url)) {
      fichiers.set(url, fetch(url).then(reponse => {
        if (!reponse.ok) throw new Error(reponse.status);
        return reponse.text();
      }));
    }
    return fichiers.get(url);
  }


  // ---------- Remplacement d'une image ----------

  async function remplacer(img) {
    if (traites.has(img)) return;
    traites.add(img);

    const src = img.getAttribute('src');
    let texte;

    try {
      texte = await charger(img.src);
    } catch (e) {
      console.warn('Dessin non chargé :', src, e);
      return;
    }

    if (!img.isConnected) return;

    const svg = new DOMParser().parseFromString(texte, 'image/svg+xml').documentElement;

    if (svg.nodeName.toLowerCase() !== 'svg') {
      console.warn('SVG illisible :', src);
      return;
    }

    const id = 'dessin_' + (++compteur);

    ajouterViewBox(svg);
    isolerIdentifiants(svg, id);
    isolerStyles(svg, id);

    // on reprend ce que portait l'<img>
    svg.classList.add('dessin', ...img.classList);
    if (img.id) svg.id = img.id;
    svg.dataset.src = src;
    svg.dataset.dessin = id;
    if (img.style.cssText) svg.style.cssText = img.style.cssText;

    // accessibilité : même règle que l'attribut alt
    if (img.alt) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', img.alt);
    } else {
      svg.setAttribute('aria-hidden', 'true');
    }
    svg.setAttribute('focusable', 'false');

    img.replaceWith(document.importNode(svg, true));
  }


  // ---------- Outils ----------

  // sans viewBox, le dessin ne se redimensionne pas : on la crée à partir de width / height
  function ajouterViewBox(svg) {
    if (svg.hasAttribute('viewBox')) return;

    const largeur = parseFloat(svg.getAttribute('width'));
    const hauteur = parseFloat(svg.getAttribute('height'));

    if (largeur && hauteur) svg.setAttribute('viewBox', `0 0 ${largeur} ${hauteur}`);
  }

  // deux dessins sur la même page peuvent avoir les mêmes id (dégradés, masques…) :
  // on les rend uniques
  function isolerIdentifiants(svg, prefixe) {
    const correspondance = new Map();

    svg.querySelectorAll('[id]').forEach(el => {
      const nouveau = prefixe + '_' + el.id;
      correspondance.set(el.id, nouveau);
      el.id = nouveau;
    });

    if (!correspondance.size) return;

    const corriger = valeur => valeur
      .replace(/url\(\s*['"]?#([^)'"\s]+)['"]?\s*\)/g, (tout, ancien) =>
        correspondance.has(ancien) ? `url(#${correspondance.get(ancien)})` : tout)
      .replace(/^#(.+)$/, (tout, ancien) =>
        correspondance.has(ancien) ? '#' + correspondance.get(ancien) : tout);

    [svg, ...svg.querySelectorAll('*')].forEach(el => {
      [...el.attributes].forEach(attr => {
        if (attr.value.includes('#')) attr.value = corriger(attr.value);
      });
    });

    svg.querySelectorAll('style').forEach(style => {
      style.textContent = corriger(style.textContent);
    });
  }

  // le <style> d'un SVG s'appliquerait à toute la page une fois inséré :
  // on le limite à son propre dessin
  function isolerStyles(svg, id) {
    svg.querySelectorAll('style').forEach(style => {
      style.textContent = `svg[data-dessin="${id}"] { ${style.textContent} }`;
    });
  }


  // ---------- Lancement ----------

  const zone = document.querySelector(ZONE);
  if (!zone) return;

  zone.querySelectorAll(SELECTEUR).forEach(remplacer);

  // images ajoutées plus tard (corrections, infobulles…)
  new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(noeud => {
        if (noeud.nodeType !== 1) return;
        if (noeud.matches(SELECTEUR)) remplacer(noeud);
        noeud.querySelectorAll(SELECTEUR).forEach(remplacer);
      });
    });
  }).observe(zone, { childList: true, subtree: true });

})();