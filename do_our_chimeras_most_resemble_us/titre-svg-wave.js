// ══════════════════════════════════════════════
// TITRE-SVG-WAVE.JS
// Remplace les <textPath> par des lettres SVG
// individuelles posées sur une courbe sinusoïdale,
// avec le même comportement (amplitude/fréquence
// aléatoires, glitch périodique) que l'ancien système.
// ══════════════════════════════════════════════

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Construit une ligne de titre à partir des données SVG (paths de lettres).
 * Retourne un objet { svg, letterData, w, h } réutilisable par updateLetterLineWave().
 *
 * IMPORTANT : pour garder une taille de lettre uniforme entre lignes de
 * longueurs différentes, on NE met PAS le SVG en width:100% avec une
 * viewBox propre à la ligne (ça étire les lettres courtes). À la place,
 * on fixe une hauteur de référence commune (refCapHeight) et on calcule
 * la largeur réelle en pixels CSS à partir de cette échelle commune.
 * Le <svg> obtenu a donc sa propre largeur naturelle et reste centré
 * par le conteneur parent (text-align:center / margin:auto / flex center).
 *
 * @param {HTMLElement} container - élément DOM où injecter le <svg>
 * @param {{w:number,h:number,paths:string[]}} lineData - données d'une ligne
 * @param {{amplitude?:number, isStatic?:boolean, refCapHeight?:number, pxPerUnit?:number}} options
 */
function buildLetterLine(container, lineData, options = {}) {
  const { amplitude = 16, isStatic = false, refCapHeight = null, pxPerUnit = null } = options;
  const w = lineData.w;
  const h = lineData.h;
  const padding = isStatic ? 4 : amplitude + 6;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 ${-padding} ${w} ${h + padding * 2}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.classList.add("titre-svg-line");

  // Échelle commune : on calcule la largeur CSS réelle de ce SVG
  // à partir d'un ratio pixels-par-unité-SVG partagé entre toutes les lignes.
  // pxPerUnit doit être calculé une fois par le code appelant (cf computeSharedScale())
  // à partir de la ligne la plus "haute" (référence), puis réutilisé pour toutes.
  if (pxPerUnit) {
    const renderedWidth = w * pxPerUnit;
    const renderedHeight = (h + padding * 2) * pxPerUnit;
    svg.style.width = renderedWidth + "px";
    svg.style.height = renderedHeight + "px";
    svg.style.maxWidth = "100%"; // sécurité responsive : ne dépasse jamais le conteneur
  } else {
    // fallback ancien comportement (étirement à 100%) si pas d'échelle fournie
    svg.style.width = "100%";
    svg.style.height = "auto";
  }

  container.innerHTML = "";
  container.appendChild(svg);

  const letterData = lineData.paths.map(d => {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "titre-svg-letter");
    const p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    g.appendChild(p);
    svg.appendChild(g);

    const bbox = p.getBBox();
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return { g, p, bbox, cx, cy };
  });

  return { svg, letterData, w, h };
}

/**
 * Calcule un ratio pixels-CSS-par-unité-SVG commun à un groupe de lignes,
 * pour que toutes affichent leurs lettres à la même taille réelle.
 *
 * Stratégie : on prend la ligne la plus large EN UNITÉS SVG (= la plus
 * longue visuellement, typiquement la phrase la plus longue), on la fait
 * occuper ~100% du conteneur, et on applique CE MÊME pxPerUnit à toutes
 * les autres lignes du groupe. Comme toutes les lignes ont été exportées
 * depuis la même police/taille (même "h" en unités SVG comparable), ça
 * donne une taille de lettre identique partout — les lignes courtes
 * sont simplement moins larges, et restent centrées par le conteneur.
 *
 * @param {Array<{w:number,h:number}>} lines - toutes les lignes du groupe (même langue, même device)
 * @param {number} containerWidthPx - largeur dispo du conteneur en px
 * @returns {number} pxPerUnit
 */
function computeSharedScale(lines, containerWidthPx) {
  const widest = lines.reduce((max, l) => (l.w > max.w ? l : max), lines[0]);
  const pxPerUnit = containerWidthPx / widest.w;
  return pxPerUnit;
}

/**
 * Anime une ligne déjà construite selon une progression de vague sinusoïdale.
 * Reproduit exactement la formule de generateWavyPath() / mobileWaveLines.
 *
 * @param {*} wave - objet retourné par buildLetterLine()
 * @param {number} progress - 0 à 1, intensité de la vague
 * @param {number} amplitude
 * @param {number} frequency
 * @param {boolean} useRotation - applique une légère rotation selon la tangente
 */
function updateLetterLineWave(wave, progress, amplitude, frequency, useRotation = true) {
  const { letterData, w } = wave;
  const amp = amplitude * progress;

  letterData.forEach(({ g, cx, cy }) => {
    const t = (cx / w) * Math.PI * frequency;
    const offsetY = Math.sin(t) * amp;

    let rotation = 0;
    if (useRotation && amp !== 0) {
      const slope = amp * (Math.PI * frequency / w) * Math.cos(t);
      rotation = Math.atan(slope) * (180 / Math.PI);
    }

    g.setAttribute(
      "transform",
      `translate(${cx}, ${cy + offsetY}) rotate(${rotation}) translate(${-cx}, ${-cy})`
    );
  });
}

/**
 * Construit une ligne statique (titre-haut) : pas de vague, juste les contours figés.
 * Simple wrapper de buildLetterLine avec isStatic=true et sans transform appliqué.
 */
function buildStaticLetterLine(container, lineData, pxPerUnit = null) {
  return buildLetterLine(container, lineData, { isStatic: true, pxPerUnit });
}

// Exposition globale (le projet n'utilise pas de modules ES)
window.buildLetterLine = buildLetterLine;
window.updateLetterLineWave = updateLetterLineWave;
window.buildStaticLetterLine = buildStaticLetterLine;
window.computeSharedScale = computeSharedScale;
