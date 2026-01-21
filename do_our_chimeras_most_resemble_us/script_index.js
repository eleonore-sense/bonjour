/* =========================================================
   CONFIGURATION & CONSTANTES
   ========================================================= */

const gradientPalette = [
  { base: '#c799ff', light: '#d4b8ff' },
  { base: '#b8eaff', light: '#d1f1ff' },
  { base: '#a3ffc3', light: '#cfffe0' },
  { base: '#ec88f6', light: '#fcdbff' },
  { base: '#ffff4e', light: '#ffffb2' }
];

const DEST_A = "https://kadist.org/tv/";
const DEST_B = "https://www.newmedia-art.org/";

/* =========================================================
   TOOLTIP GLOBAL (suit la souris)
   ========================================================= */

let tooltipEl = null;
let tooltipVisible = false;

function initTooltip() {
  if (tooltipEl) return;

  tooltipEl = document.createElement("div");
  tooltipEl.className = "vignette-info";
  tooltipEl.style.opacity = "0";
  document.body.appendChild(tooltipEl);

  document.addEventListener("mousemove", (e) => {
    if (!tooltipVisible || !tooltipEl) return;

    // Position de base (viewport) — compatible avec position: fixed
    const pad = 16;
    const rect = tooltipEl.getBoundingClientRect();

    let x = e.clientX;
    let y = e.clientY;

    // Garde dans l'écran (optionnel mais très agréable)
    if (x + rect.width + pad > window.innerWidth) x = window.innerWidth - rect.width - pad;
    if (y + rect.height + pad > window.innerHeight) y = window.innerHeight - rect.height - pad;

    tooltipEl.style.left = x + "px";
    tooltipEl.style.top  = y + "px";
  });
}

function showTooltip(projet) {
  initTooltip();
  tooltipEl.innerHTML = `
  <div class="vignette-line">
    ${projet.artiste} &ndash; ${projet.titre}
  </div>
`;
  tooltipVisible = true;
  tooltipEl.style.opacity = "1";
}

function hideTooltip() {
  tooltipVisible = false;
  if (tooltipEl) tooltipEl.style.opacity = "0";
}

/* =========================================================
   DONNÉES DES PROJETS (54 projets = 9 artistes × 6)
   ========================================================= */

const projetsData = [
  { artiste: 'Lien Artiste 1', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=1' },
  { artiste: 'Lien Artiste 1', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=2' },
  { artiste: 'Lien Artiste 1', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=3' },
  { artiste: 'Lien Artiste 1', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=4' },
  { artiste: 'Lien Artiste 1', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=5' },
  { artiste: 'Lien Artiste 1', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=6' },

  { artiste: 'Lien Artiste 2', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=7' },
  { artiste: 'Lien Artiste 2', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=8' },
  { artiste: 'Lien Artiste 2', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=9' },
  { artiste: 'Lien Artiste 2', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=10' },
  { artiste: 'Lien Artiste 2', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=11' },
  { artiste: 'Lien Artiste 2', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=12' },

  { artiste: 'Lien Artiste 3', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=13' },
  { artiste: 'Lien Artiste 3', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=14' },
  { artiste: 'Lien Artiste 3', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=15' },
  { artiste: 'Lien Artiste 3', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=16' },
  { artiste: 'Lien Artiste 3', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=17' },
  { artiste: 'Lien Artiste 3', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=18' },

  { artiste: 'Lien Artiste 4', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=19' },
  { artiste: 'Lien Artiste 4', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=20' },
  { artiste: 'Lien Artiste 4', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=21' },
  { artiste: 'Lien Artiste 4', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=22' },
  { artiste: 'Lien Artiste 4', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=23' },
  { artiste: 'Lien Artiste 4', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=24' },

  { artiste: 'Lien Artiste 5', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=25' },
  { artiste: 'Lien Artiste 5', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=26' },
  { artiste: 'Lien Artiste 5', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=27' },
  { artiste: 'Lien Artiste 5', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=28' },
  { artiste: 'Lien Artiste 5', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=29' },
  { artiste: 'Lien Artiste 5', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=30' },

  { artiste: 'Lien Artiste 6', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=31' },
  { artiste: 'Lien Artiste 6', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=32' },
  { artiste: 'Lien Artiste 6', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=33' },
  { artiste: 'Lien Artiste 6', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=34' },
  { artiste: 'Lien Artiste 6', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=35' },
  { artiste: 'Lien Artiste 6', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=36' },

  { artiste: 'Lien Artiste 7', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=37' },
  { artiste: 'Lien Artiste 7', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=38' },
  { artiste: 'Lien Artiste 7', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=39' },
  { artiste: 'Lien Artiste 7', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=40' },
  { artiste: 'Lien Artiste 7', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=41' },
  { artiste: 'Lien Artiste 7', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=42' },

  { artiste: 'Lien Artiste 8', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=43' },
  { artiste: 'Lien Artiste 8', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=44' },
  { artiste: 'Lien Artiste 8', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=45' },
  { artiste: 'Lien Artiste 8', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=46' },
  { artiste: 'Lien Artiste 8', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=47' },
  { artiste: 'Lien Artiste 8', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=48' },

  { artiste: 'Lien Artiste 9', titre: 'Titre projet', image: 'https://picsum.photos/300/200?random=49' },
  { artiste: 'Lien Artiste 9', titre: 'Titre projet', image: 'https://picsum.photos/200/300?random=50' },
  { artiste: 'Lien Artiste 9', titre: 'Titre projet', image: 'https://picsum.photos/250/250?random=51' },
  { artiste: 'Lien Artiste 9', titre: 'Titre projet', image: 'https://picsum.photos/350/200?random=52' },
  { artiste: 'Lien Artiste 9', titre: 'Titre projet', image: 'https://picsum.photos/200/280?random=53' },
  { artiste: 'Lien Artiste 9', titre: 'Titre projet', image: 'https://picsum.photos/280/200?random=54' }
];

/* =========================================================
   FONCTIONS UTILITAIRES
   ========================================================= */

function mixWithWhite(hex, amount) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const mr = Math.round(r + (255 - r) * amount);
  const mg = Math.round(g + (255 - g) * amount);
  const mb = Math.round(b + (255 - b) * amount);
  return `rgb(${mr}, ${mg}, ${mb})`;
}

function capitalizeWords(text) {
  return text
    .split(' ')
    .map(word => (word.length ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
}

/* =========================================================
   CRÉATION DES VIGNETTES AVEC ANTI-COLLISION
   ========================================================= */

function createVignettes(projets) {
  const container = document.getElementById('vignettes-container');
  container.innerHTML = '';

  const vignetteWidth = 170;
  const vignetteHeight = 170;
  const minGap = 30;
  const positions = [];

  function isColliding(newPos) {
    for (let pos of positions) {
      const dx = Math.abs(newPos.left - pos.left);
      const dy = Math.abs(newPos.top - pos.top);
      if (dx < vignetteWidth + minGap && dy < vignetteHeight + minGap) return true;
    }
    return false;
  }

  function findFreePosition(attempts = 100) {
    const viewportWidth = window.innerWidth;
    const margin = 50;

    for (let i = 0; i < attempts; i++) {
      const pos = {
        left: margin + Math.random() * (viewportWidth - vignetteWidth - margin * 2),
        top: margin + Math.random() * 3000
      };
      if (!isColliding(pos)) return pos;
    }

    return {
      left: margin + Math.random() * (viewportWidth - vignetteWidth - margin * 2),
      top: positions.length
        ? Math.max(...positions.map(p => p.top)) + vignetteHeight + minGap
        : margin
    };
  }

  projets.forEach((projet, index) => {
    const pos = findFreePosition();
    positions.push(pos);

const vignette = document.createElement('a');
vignette.className = 'vignette';

// 50/50
vignette.href = (Math.random() < 0.5) ? DEST_A : DEST_B;

// options utiles
vignette.target = "_blank";
vignette.rel = "noopener noreferrer";
vignette.style.display = "block";
    vignette.style.left = `${pos.left}px`;
    vignette.style.top = `${pos.top}px`;

    const img = document.createElement('img');
    img.src = projet.image;
    img.alt = projet.titre;

    vignette.appendChild(img);
    container.appendChild(vignette);

    // Tooltip global
    vignette.addEventListener("mouseenter", () => showTooltip(projet));
    vignette.addEventListener("mouseleave", () => hideTooltip());

    setTimeout(() => vignette.classList.add('visible'), index * 30);
  });

  const maxTop = positions.length ? Math.max(...positions.map(p => p.top)) : 0;
  container.style.height = `${maxTop + vignetteHeight + 100}px`;
}

/* =========================================================
   GESTION DU CURSEUR TITRE
   ========================================================= */

function placeCaretAtEnd(el) {
  el.focus();
  if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function updateCursorPosition() {
  const cursor = document.getElementById('cursor-titre');
  const titre = document.getElementById('titre-haut');

  if (!cursor || !titre) return;

  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0).cloneRange();
    range.collapse(false);

    const rect = range.getBoundingClientRect();
    if (rect.left !== 0 || rect.top !== 0) {
      cursor.style.left = (rect.left + 15) + 'px';
      cursor.style.top = (rect.top + 10) + 'px';
      cursor.style.opacity = '1';
      return;
    }
  }

  const text = titre.textContent || '';
  const measureSpan = document.createElement('span');
  measureSpan.style.cssText = `
    font-family: Lagarto;
    font-size: 4.5em;
    position: absolute;
    visibility: hidden;
    white-space: pre-wrap;
    max-width: ${titre.offsetWidth}px;
  `;
  measureSpan.textContent = text;
  document.body.appendChild(measureSpan);

  const spanRect = measureSpan.getBoundingClientRect();
  const titreRect = titre.getBoundingClientRect();

  cursor.style.left = (titreRect.left + (spanRect.width % titre.offsetWidth) + 8) + 'px';
  cursor.style.top =
    (titreRect.top +
      (Math.floor(spanRect.width / titre.offsetWidth) * spanRect.height / Math.ceil(spanRect.width / titre.offsetWidth)) -
      10) + 'px';
  cursor.style.opacity = '1';

  document.body.removeChild(measureSpan);
}

/* =========================================================
   CHARGEMENT DES DONNÉES DEPUIS LOCALSTORAGE
   ========================================================= */

window.addEventListener('load', () => {
  initTooltip(); // safe, crée le tooltip global

  const savedState = localStorage.getItem('exhibitionState');
  const titreHautEl = document.getElementById('titre-haut');

  if (!titreHautEl) return;

  if (savedState) {
    const state = JSON.parse(savedState);

    // 1) titre
    titreHautEl.textContent = capitalizeWords(state.titreTexte || "");
    titreHautEl.classList.add('visible');

    // 2) gradient
    const chosen = gradientPalette[state.gradientIndex ?? 0] || gradientPalette[0];
    const overlayBase = mixWithWhite(chosen.base, 0.55);
    const overlayLight = mixWithWhite(chosen.light, 0.65);

    const gradientOverlay = document.getElementById('gradient-overlay');
    if (gradientOverlay) {
      gradientOverlay.style.background = `
        linear-gradient(
          to bottom,
          transparent 0%,
          ${overlayLight} 5%,
          ${overlayBase} 10%,
          ${overlayBase} 90%,
          ${overlayLight} 95%,
          transparent 100%
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255,255,255,0.015) 0px,
          rgba(255,255,255,0.015) 1px,
          rgba(0,0,0,0.015) 2px
        )`;
      gradientOverlay.classList.add('full');
    }

    // 3) projets
    const projetsAffiches = state.hasStartedEditing ? projetsData.slice(0, 36) : projetsData;
    createVignettes(projetsAffiches);

    setTimeout(() => {
      placeCaretAtEnd(titreHautEl);
      updateCursorPosition();
    }, 2000);
  } else {
    // état par défaut
    titreHautEl.textContent = "No saved data";
    titreHautEl.classList.add('visible');

    const chosen = gradientPalette[0];
    const overlayBase = mixWithWhite(chosen.base, 0.55);
    const overlayLight = mixWithWhite(chosen.light, 0.65);

    const gradientOverlay = document.getElementById('gradient-overlay');
    if (gradientOverlay) {
      gradientOverlay.style.background = `
        linear-gradient(
          to bottom,
          transparent 0%,
          ${overlayLight} 5%,
          ${overlayBase} 10%,
          ${overlayBase} 90%,
          ${overlayLight} 95%,
          transparent 100%
        ),
        repeating-linear-gradient(
          90deg,
          rgba(255,255,255,0.015) 0px,
          rgba(255,255,255,0.015) 1px,
          rgba(0,0,0,0.015) 2px
        )`;
      gradientOverlay.classList.add('full');
    }

    createVignettes(projetsData);

    setTimeout(() => {
      updateCursorPosition();
      titreHautEl.focus();
    }, 2000);
  }
});

/* =========================================================
   TITRE ÉDITABLE - ÉVÉNÉMENTS
   ========================================================= */

const titreHaut = document.getElementById('titre-haut');

if (titreHaut) {
  titreHaut.addEventListener('input', () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const cursorPosition = range.startOffset;

    const text = titreHaut.textContent || "";
    const capitalizedText = capitalizeWords(text);

    if (text !== capitalizedText) {
      titreHaut.textContent = capitalizedText;

      const newRange = document.createRange();
      const textNode = titreHaut.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        const newPosition = Math.min(cursorPosition, capitalizedText.length);
        newRange.setStart(textNode, newPosition);
        newRange.setEnd(textNode, newPosition);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }

    updateCursorPosition();

    const savedState = localStorage.getItem('exhibitionState');
    if (savedState) {
      const state = JSON.parse(savedState);
      state.titreTexte = (titreHaut.textContent || "").trim();
      localStorage.setItem('exhibitionState', JSON.stringify(state));
    }
  });

  titreHaut.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const savedState = localStorage.getItem('exhibitionState');
      if (savedState) {
        const state = JSON.parse(savedState);
        state.titreTexte = (titreHaut.textContent || "").trim();
        localStorage.setItem('exhibitionState', JSON.stringify(state));

        const projetsAffiches = state.hasStartedEditing ? projetsData.slice(0, 36) : projetsData;
        createVignettes(projetsAffiches);
      }
    }
  });

  titreHaut.addEventListener('click', updateCursorPosition);

  titreHaut.addEventListener('focus', () => {
    placeCaretAtEnd(titreHaut);
    updateCursorPosition();
  });

  titreHaut.addEventListener('blur', () => {
    const cursor = document.getElementById('cursor-titre');
    if (cursor) cursor.style.opacity = '0';
  });
}
