/* =========================================================
   CONFIGURATION & CONSTANTES
   ========================================================= */

const gradientPalette = [
  { base: '#c799ff', light: '#d4b8ff' }, // violet
  { base: '#b8eaff', light: '#d1f1ff' }, // bleu
  { base: '#a3ffc3', light: '#cfffe0' }, // vert
  { base: '#ec88f6', light: '#fcdbff' }, // rose
  { base: '#ffff4e', light: '#ffffb2' }  // jaune flash
];


let lastSessionGroup = -1;

const MAX_CHARS_PER_LINE = 18;
const aboutDrawer = document.getElementById('about-drawer');

const lines = [
  { y: 100, amplitude: 16, frequency: 2 },
  { y: 170, amplitude: 13, frequency: 4 },
  { y: 240, amplitude: 12, frequency: 2.5 }
];

let glitchProgress = 0;
let isGlitching = false;
let targetProgress = 0;
let animationSpeed = 0.001;
let glitchDuration = 4;
let pauseDuration = 7;
let glitchFrequency = 20;
let nextGlitchTimeout;
let isPausing = false;
let firstKeyPress = true;
let timeoutId = null;
let lastScrollY = 0;
let isCinemaMode = false;
let artisteActuelIndex = 0;
const HOVER_ZONE_TOP_RATIO = 0.2;   // 20 %
const HOVER_ZONE_BOTTOM_RATIO = 0.7; // 70 %
let currentGradientIndex = 0;
/* =========================================================
   DONNÉES DES ARTISTES
   ========================================================= */

const artistesData = [
  { nom: 'Agnieszka Polska', image: 'img/img1.jpg' },
  { nom: 'Egor Kraft', image: 'img/img2.jpg' },
  { nom: 'Elsa Werth', image: 'img/img3.jpg' },
  { nom: 'Emmanuel Van der Auwera', image: 'img/img4.jpg' },
  { nom: 'Entangled Others', image: 'img/img5.jpg' },
  { nom: 'Ho Tzu Nyen', image: 'img/img6.jpg' },
  { nom: 'Interspecifics', image: 'img/img7.jpg' },
  { nom: 'John Menick', image: 'img/img8.jpg' },
  { nom: 'Ayoung Kim', image: 'img/img9.jpg' }
];


const originalArtistImages = artistesData.map(a => a.image);
const BAZAR_COUNT = 7;

function randomBazarPath() {
  const n = 1 + Math.floor(Math.random() * BAZAR_COUNT);
  return `img/img_bazar/img (${n}).jpg`;
}




/* =========================================================
   RÉFÉRENCES DOM
   ========================================================= */

const paths = [
  document.getElementById("wave1"),
  document.getElementById("wave2"),
  document.getElementById("wave3")
];

const textPaths = [
  document.getElementById("text1"),
  document.getElementById("text2"),
  document.getElementById("text3")
];

const input = document.getElementById("hiddenInput");
const nomArtisteMenu = document.getElementById('nom_artiste_menu');
const titreHaut = document.getElementById('titre-haut');
const gradientOverlay = document.getElementById('gradient-overlay');
const gradientInitial = document.getElementById('gradient-initial');
const editor = document.querySelector('.editor');
const artistesContainer = document.getElementById('artistes-container');
const logosContainer = document.querySelector('[style*="top: 15px"]');
const topRightPart2 = document.getElementById('top_right_part2');
const btnReturn = document.getElementById('btn_return');
const btnIndexPart2 = document.getElementById('btn_index');
const initialWordCount = input.value.trim().split(/\s+/).length;


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
  return text.split(' ').map(word => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* =========================================================
   GESTION DU TEXTE
   ========================================================= */

function updateTitreHaut() {
  const fullText = input.value.trim();
  titreHaut.textContent = capitalizeWords(fullText);
}

function updateCursorPosition() {
  const cursor = document.getElementById('cursor');

  let lastLineIndex = -1;
  for (let i = textPaths.length - 1; i >= 0; i--) {
    if (textPaths[i].textContent.trim() !== '') {
      lastLineIndex = i;
      break;
    }
  }

  if (lastLineIndex === -1) {
    cursor.style.display = 'block';
    cursor.setAttribute('x', 300);
    cursor.setAttribute('y', lines[0].y - 50);
    return;
  }

  cursor.style.display = 'block';
  const textPath = textPaths[lastLineIndex];
  const n = textPath.getNumberOfChars();

  if (n > 0) {
    try {
      const bbox = textPath.getEndPositionOfChar(n - 1);
      cursor.setAttribute('x', bbox.x + 8);
      cursor.setAttribute('y', bbox.y - 50);
    } catch (e) {
      const yPos = lines[lastLineIndex] ? lines[lastLineIndex].y : (80 + lastLineIndex * 70);
      cursor.setAttribute('x', 300);
      cursor.setAttribute('y', yPos - 50);
    }
  }
}


function updateText() {
  const words = input.value.split(' ');
  const svg = document.getElementById('main-svg');
  
  // Fonction pour calculer combien de lignes avec une taille de typo donnée
  function calculateNeededLines(fontSize) {
    const charsPerLine = Math.floor(MAX_CHARS_PER_LINE * (5.4 / fontSize));
    
    let tempLine = '';
    let lines = 0;
    
    words.forEach((word) => {
      if (tempLine === '') {
        tempLine = word;
      } else if ((tempLine + ' ' + word).length <= charsPerLine) {
        tempLine += ' ' + word;
      } else {
        lines++;
        tempLine = word;
      }
    });
    if (tempLine) lines++;
    return { lines, charsPerLine };
  }
  
  // Trouve la bonne taille de typo pour tenir en 4 lignes
  const maxLines = 4;
  let currentFontSize = 5.4;
  let result = calculateNeededLines(currentFontSize);
  
  // Si ça dépasse 4 lignes, on rétrécit la typo
  while (result.lines > maxLines && currentFontSize > 2.0) {
    currentFontSize -= 0.1;
    result = calculateNeededLines(currentFontSize);
  }
  
  // ⬅️ CALCULE L'INTERLIGNAGE en fonction de la taille de typo
  // Quand typo = 5.4 → interligne = 70px
  // Quand typo = 3.0 → interligne = 50px (par exemple)
  let interligne = 70;
  if (currentFontSize < 4.5) {
    // Réduit l'interligne proportionnellement
    interligne = Math.max(50, 70 * (currentFontSize / 5.4));
  }
  
  // Applique la taille de police
  const textElements = svg.querySelectorAll('text');
  textElements.forEach(text => {
    text.style.fontSize = `${currentFontSize}em`;
  });
  
  // ⬅️ AJUSTE les positions des lignes existantes si nécessaire
  if (textPaths.length >= 3) {
    paths[0].setAttribute('d', `M0 100 L600 100`);
    paths[1].setAttribute('d', `M0 ${100 + interligne} L600 ${100 + interligne}`);
    paths[2].setAttribute('d', `M0 ${100 + interligne * 2} L600 ${100 + interligne * 2}`);
    
    lines[1].y = 100 + interligne;
    lines[2].y = 100 + interligne * 2;
  }
  
  // Crée la 4e ligne si elle n'existe pas encore
  if (textPaths.length < 4) {
    const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newPath.setAttribute('id', 'wave4');
    newPath.setAttribute('d', `M0 ${100 + interligne * 3} L600 ${100 + interligne * 3}`);
    svg.insertBefore(newPath, document.getElementById('cursor'));
    paths.push(newPath);
    
    const newText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const newTextPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
    newTextPath.setAttribute('id', 'text4');
    newTextPath.setAttribute('href', '#wave4');
    newTextPath.setAttribute('startOffset', '50%');
    newText.appendChild(newTextPath);
    svg.insertBefore(newText, document.getElementById('cursor'));
    textPaths.push(newTextPath);
    
    lines.push({ y: 100 + interligne * 3, amplitude: 16, frequency: 2 });
  } else {
    // ⬅️ Met à jour la position de la 4e ligne
    paths[3].setAttribute('d', `M0 ${100 + interligne * 3} L600 ${100 + interligne * 3}`);
    lines[3].y = 100 + interligne * 3;
  }
  
  // ⬅️ AJUSTE LA VIEWBOX pour recentrer verticalement
  let yOffset = 0;
  let viewHeight = 320;



  if (result.lines === 4) {
    yOffset = 30;
    viewHeight = 400;
  }
  
  svg.setAttribute('viewBox', `0 ${yOffset} 600 ${viewHeight}`);
  
  // Efface tout le texte
  textPaths.forEach(tp => tp.textContent = '');
  
  // Remplit les lignes avec le texte (max 4 lignes)
  let lineIndex = 0;
  let currentLine = '';
  
  words.forEach((word) => {
    if (currentLine === '') {
      currentLine = word;
    } else {
      if ((currentLine + ' ' + word).length <= result.charsPerLine) {
        currentLine += ' ' + word;
      } else {
        if (lineIndex < 4) {
          textPaths[lineIndex].textContent = capitalizeWords(currentLine);
        }
        lineIndex++;
        currentLine = word;
      }
    }
  });
  
  if (lineIndex < 4 && currentLine) {
    textPaths[lineIndex].textContent = capitalizeWords(currentLine);
  }
  
  requestAnimationFrame(updateCursorPosition);
}


function typeWriterEffect() {
  const originalText = "Do our chimeras most resemble us?";
  input.value = "";
  let i = 0;
  
  const cursor = document.getElementById('cursor');
  cursor.style.display = 'none';
  
  const typeInterval = setInterval(() => {
    if (i < originalText.length) {
      input.value += originalText[i];
      updateText();
      i++;
      
      if (i === 1) {
        cursor.style.display = 'block';
      }
    } else {
      clearInterval(typeInterval);
      input.value = input.value + ' ';
      updateText();
    
      showEditHint();
      saveStateToLocalStorage();
    }
  }, 80);
}

/* =========================================================
   ANIMATIONS GLITCH
   ========================================================= */

function generateWavyPath(lineConfig, progress) {
  const { y, amplitude, frequency } = lineConfig;
  const amp = amplitude * progress;
  
  if (progress === 0) {
    return `M0 ${y} L600 ${y}`;
  }
  
  let path = `M0 ${y}`;
  const steps = 60;
  
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * 600;
    const offset = Math.sin((i / steps) * Math.PI * frequency) * amp;
    path += ` L${x} ${y + offset}`;
  }
  
  return path;
}

function updatePaths() {
  paths.forEach((path, i) => {
    const d = generateWavyPath(lines[i], glitchProgress);
    path.setAttribute('d', d);
  });
}

function animate() {
  if (isPausing) {
    requestAnimationFrame(animate);
    return;
  }
  
  const diff = targetProgress - glitchProgress;
  const easedSpeed = animationSpeed * (1 + Math.abs(diff) * 0.5);
  
  glitchProgress += diff * easedSpeed;
  
  if (Math.abs(diff) < 0.001) {
    glitchProgress = targetProgress;
    if (!isGlitching && glitchProgress === 0) {
      return;
    }
  }
  
  updatePaths();
  requestAnimationFrame(animate);
}

function glitch() {
  isGlitching = true;
  isPausing = false;
  targetProgress = 1;
  animate();
  
  setTimeout(() => {
    isPausing = true;
    
    setTimeout(() => {
      isPausing = false;
      targetProgress = 0;
      isGlitching = false;
      animate();
    }, pauseDuration * 1000);
    
  }, glitchDuration * 1000);
}

function randomGlitch() {
  glitch();
  const randomDelay = (glitchFrequency + Math.random() * 10) * 1000;
  nextGlitchTimeout = setTimeout(randomGlitch, randomDelay);
}

/* =========================================================
   MODE CINÉMA
   ========================================================= */

function exitCinemaMode() {
  if (isCinemaMode) {
    const cinemaOverlay = document.getElementById('cinema-overlay');
    const btnCine = document.getElementById('btn_cine');
    
    btnCine.textContent = 'cinema view';
    document.body.classList.remove('cinema-mode');
    
    setTimeout(() => {
      cinemaOverlay.classList.remove('active');
    }, 200);
    
    isCinemaMode = false;
  }
}

/* =========================================================
   INITIALISATION AU CHARGEMENT
   ========================================================= */

window.addEventListener('load', () => {
  window.scrollTo(0, 0);
   // localStorage.removeItem('exhibitionState');

  editor.classList.remove('hidden-content');
  artistesContainer.classList.remove('hidden-content');
  showLogosAndAbout();
const chosenIndex = Math.floor(Math.random() * gradientPalette.length); // ⬅️ CRÉÉ L'INDEX
currentGradientIndex = chosenIndex; // ⬅️ SAUVEGARDE L'INDEX
const chosen = gradientPalette[chosenIndex];
  gradientInitial.style.background = `
    linear-gradient(
      to top,
      ${chosen.base} 0%,
      ${chosen.light} 20%,
      rgba(255,255,255,0.55) 45%,
      rgba(255,255,255,0.20) 60%,
      transparent 100%
    )`;

  const overlayBase = mixWithWhite(chosen.base, 0.55);
  const overlayLight = mixWithWhite(chosen.light, 0.65);

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

const hint = document.getElementById('edit-hint');
if (hint) hint.style.opacity = '0';
hintReady = false;
const rules = document.getElementById('rules-overlay');
const artistHint = document.getElementById('artist-hint');

if (hint || rules) {

  // ─────────────────────────────
  // 1) COULEUR TEXTE DU HINT (lisible)
  // ─────────────────────────────
  let hintColor = chosen.base;


  if (chosen.base === '#ffff4e') {
    hintColor = 'black';        // jaune → texte noir
  } else if (chosen.base === '#a3ffc3') {
    hintColor = '#01e68c';      // vert foncé
  } else if (chosen.base === '#b8eaff') {
    hintColor = '#6fb7ff';      // bleu foncé
  }

  if (hint) {
    hint.style.color = hintColor;
  }

  // ─────────────────────────────
  // 2) COULEUR DU GLOW RULES (base PURE)
  // ─────────────────────────────
  if (rules) {
    rules.style.textShadow = buildGlowShadow(chosen.base);
  }

    if (artistHint) {
    artistHint.style.color = hintColor;
  }
}

  
  setTimeout(typeWriterEffect, 200);
});


function buildGlowShadow(color) {
  return `
    0px 0px 11px ${color},
    0px 0px 13px ${color},
    0px 0px 13px ${color},
    0px 0px 13px ${color},
    0px 0px 13px ${color},
    0px 0px 11px ${color},
    0px 0px 13px ${color},
    0px 0px 13px ${color},
    0px 0px 13px ${color}
  `;
}


/* =========================================================
   GESTION DU SCROLL
   ========================================================= */

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const triggerPoint = window.innerHeight / 2;

  const goingDown = scrollY > lastScrollY;
  const goingUp = scrollY < lastScrollY;

  const part3 = document.getElementById('part_3');
  const part3Visible = part3.classList.contains('visible');

  // Si on est en part 3 et qu'on remonte => retour part 2
  if (goingUp && part3Visible && scrollY >= window.innerHeight) {
    part3.classList.remove('visible');
    nomArtisteMenu.classList.remove('hidden');
    window.scrollTo({ top: window.innerHeight, behavior: 'auto' });
    lastScrollY = scrollY;
    return;
  }

  // PART 2 (en bas)
  if (scrollY > triggerPoint) {
    if (!hasStartedEditing) {showAll9Artists(); 
    restoreOriginalArtistImages();}
    else showOnly6Artists();

    titreHaut.classList.remove('fast-hide');

    if (goingDown && scrollY < window.innerHeight) {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }

    requestAnimationFrame(() => {
      gradientOverlay.classList.add('full');
      nomArtisteMenu.classList.add('visible');
    });

    gradientInitial.classList.add('hidden');
    editor.classList.add('hidden-content');
    artistesContainer.classList.add('hidden-content');

    // Cache la liste des 6
    const artistesListe = document.getElementById('artistes-liste');
    artistesListe.style.opacity = '0';
    artistesListe.style.pointerEvents = 'none';
artistesListe.classList.remove('delay-show')// important (sinon délai dans d'autres cas)

hideLogosAndAbout();

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateTitreHaut();
      titreHaut.classList.add('visible');
      topRightPart2.classList.add('visible');
    }, 1500);
  }

  // PART 1 (en haut)
  else {
    part3.classList.remove('visible');
    nomArtisteMenu.classList.remove('hidden');

    titreHaut.classList.add('fast-hide');
    titreHaut.classList.remove('visible');
    topRightPart2.classList.remove('visible');

    if (timeoutId) clearTimeout(timeoutId);

    gradientOverlay.classList.remove('full');
    gradientInitial.classList.remove('hidden');
    editor.classList.remove('hidden-content');
    focusEditable();
showLogosAndAbout();
    nomArtisteMenu.classList.remove('visible');

    // Gestion listes artistes en Part 1
    const artistesListe = document.getElementById('artistes-liste');

    if (hasStartedEditing) {
      artistesContainer.classList.add('hidden-content');

      // ✅ on veut la faire réapparaitre avec délai
      artistesListe.classList.add('delay-show');
      artistesListe.style.opacity = '1';
      artistesListe.style.pointerEvents = 'auto';
    } else {
      artistesContainer.classList.remove('hidden-content');

      // au cas où
      artistesListe.style.opacity = '0';
      artistesListe.style.pointerEvents = 'none';
      artistesListe.classList.remove('delay-show');
    }
  }

  lastScrollY = scrollY;
});
/* =========================================================
   ÉVÉNEMENTS INPUT
   ========================================================= */

let hasStartedEditing = false;
let hasFirstEnter = false;

input.addEventListener("keydown", (e) => {
  if (firstKeyPress && e.key === "Backspace") {
    e.preventDefault();
    input.value = input.value.slice(0, -2);
    updateText();
    firstKeyPress = false;
    return;
  }
  if (firstKeyPress) firstKeyPress = false;

if (e.key === "Enter") {
  e.preventDefault();

  const text = input.value.trim();
  const words = text.split(/\s+/).filter(Boolean);

  const totalWords = words.length;
  const addedWords = totalWords - initialWordCount;

  // ❌ BLOQUÉ SI :
if (totalWords < 8 || addedWords < 3) {
  showRulesOverlay();
  return;
}

  const liste = document.getElementById('artistes-liste');

  // Premier Enter → affiche la liste
  if (!artistesListeVisible) {
    artistesListeVisible = true;

    liste.classList.remove('delay-show');
    liste.style.opacity = '1';
    liste.style.pointerEvents = 'auto';

    updateArtistesListe();
    return;
  }

  // Enters suivants → groupe suivant
  groupeActuel = (groupeActuel + 1) % artistesGroupes.length;
  updateArtistesListe();

  liste.style.opacity = '1';
  liste.style.pointerEvents = 'auto';
      saveStateToLocalStorage();
}

});

input.addEventListener("input", () => {

  // ─────────────────────────────
  // PREMIÈRE FRAPPE = NOUVELLE SESSION D'ÉDITION
  // ─────────────────────────────
  if (!hasStartedEditing) {
    hasStartedEditing = true;

    hideArtistesNoms();
    initialHoverZone = false;

    // logique groupes : 1A → 2A → 3A …
    lastSessionGroup = (lastSessionGroup + 1) % artistesGroupes.length;
    groupeActuel = lastSessionGroup;

    // reset état liste
    artistesListeVisible = false;
    hasFirstEnter = false;

    // CSS uniquement
    document.body.classList.add('has-started-editing');
    applyBazarToFirst6Artists();
  }

  // ─────────────────────────────
  // TAPER CACHE TOUJOURS LA LISTE
  // ─────────────────────────────
  const artistesListe = document.getElementById('artistes-liste');
  artistesListe.style.opacity = '0';
  artistesListe.style.pointerEvents = 'none';
  artistesListe.classList.remove('delay-show');

  // ─────────────────────────────
  // GESTION DU HINT
  // ─────────────────────────────
  isTyping = true;

  const hint = document.getElementById('edit-hint');
  if (hint) hint.style.opacity = '0';

  if (typingTimeout) clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    isTyping = false;
    if (hintReady && editor.matches(':hover')) {
      hint.style.opacity = '1';
    }
  }, 3000);

  // ─────────────────────────────
  // MAJ DU TEXTE SVG
  // ─────────────────────────────
  updateText();
   saveStateToLocalStorage();
})

/* =========================================================
   CLICS ARTISTES ACCUEIL (PARTIE 1)
   ========================================================= */

document.querySelectorAll('.artiste_accueil').forEach(artist => {
  artist.addEventListener('click', () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

    requestAnimationFrame(() => {
      gradientOverlay.classList.add('full');
      nomArtisteMenu.classList.add('visible');
    });

    gradientInitial.classList.add('hidden');
    editor.classList.add('hidden-content');
    artistesContainer.classList.add('hidden-content');
hideLogosAndAbout();

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      updateTitreHaut();
      titreHaut.classList.add('visible');
      topRightPart2.classList.add('visible');
    }, 1500);
  });
});

/* =========================================================
   HOVER IMAGES ARTISTES
   ========================================================= */

document.querySelectorAll('.artiste_menu').forEach((artiste, index) => {
  const img = document.getElementById(`img-artiste-${index + 1}`);
  artiste.addEventListener('mouseenter', () => img.classList.add('visible'));
  artiste.addEventListener('mouseleave', () => img.classList.remove('visible'));
});

/* =========================================================
   CLICS ARTISTES MENU (PARTIE 2 → PARTIE 3)
   ========================================================= */

document.querySelectorAll('.artiste_menu').forEach((artiste, index) => {
  artiste.addEventListener('click', () => {
        if (hasStartedEditing && index < 6) {
      const url = getArtistUrl(index); // TU METTRAS TES URLS
      window.open(url, '_blank');
      return; // ⛔ empêche TOUT le reste (donc pas de Part 3)
    }


    artisteActuelIndex = index;
    
    nomArtisteMenu.classList.add('hidden');
    
    document.querySelectorAll('.artiste-image').forEach(img => {
      img.classList.remove('visible');
    });
    
    setTimeout(() => {
      const artiste = artistesData[artisteActuelIndex];
      
      document.querySelector('#gauche .titre').textContent = artiste.nom + ' - Project Title';
      document.getElementById('video').src = artiste.image;
      
      document.getElementById('part_3').classList.add('visible');
    }, 500);
  });
});

/* =========================================================
   BOUTONS NAVIGATION
   ========================================================= */

btnReturn.addEventListener('click', () => {
  document.getElementById('part_3').classList.remove('visible');
  exitCinemaMode();
  nomArtisteMenu.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

titreHaut.addEventListener('click', () => {
  document.getElementById('part_3').classList.remove('visible');
  exitCinemaMode();
  nomArtisteMenu.classList.remove('hidden');
  vientDeListe = false; 
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

btnIndexPart2.addEventListener('click', () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
});

document.getElementById('btn_close').addEventListener('click', () => {
  document.getElementById('part_3').classList.remove('visible');
  exitCinemaMode();
  setTimeout(() => {
    nomArtisteMenu.classList.remove('hidden');
  }, 1500);
});

document.getElementById('btn_next').addEventListener('click', () => {
  artisteActuelIndex = (artisteActuelIndex + 1) % artistesData.length;
  
  const artiste = artistesData[artisteActuelIndex];
  
  document.querySelector('#gauche .titre').textContent = artiste.nom + ' - Project Title';
  document.getElementById('video').src = artiste.image;
});

/* =========================================================
   BOUTON MODE CINÉMA
   ========================================================= */

document.getElementById('btn_cine').addEventListener('click', () => {
  const cinemaOverlay = document.getElementById('cinema-overlay');
  const btnCine = document.getElementById('btn_cine');
  
  if (!isCinemaMode) {
    cinemaOverlay.classList.add('active');
    btnCine.textContent = 'exit cinema view';    
    setTimeout(() => {
      document.body.classList.add('cinema-mode');
    }, 1500);
    
    setTimeout(() => {
      isCinemaMode = true;
    }, 2000);
    
  } else {
    btnCine.textContent = 'cinema view';
    document.body.classList.remove('cinema-mode');
    
    setTimeout(() => {
      cinemaOverlay.classList.remove('active');
    }, 200);
    
    setTimeout(() => {
      isCinemaMode = false;
    }, 2200);
  }
});

/* =========================================================
   INITIALISATION FINALE
   ========================================================= */

input.focus();
input.setSelectionRange(input.value.length, input.value.length);
setTimeout(randomGlitch, 5000);


/* =========================================================
   SUIVI SOURIS - HINT D'ÉDITION
   ========================================================= */

let hintReady = false;
let isTyping = false;
let typingTimeout = null;
let initialHoverZone = true; // ⬅️ NOUVEAU

// Suivi de la souris
document.addEventListener('mousemove', (e) => {
  const hint = document.getElementById('edit-hint');
  if (hint) {
    hint.style.left = (e.clientX + 15) + 'px';
    hint.style.top = (e.clientY + 15) + 'px';
  }
});

// Hover sur l'éditeur avec vérification de zone
editor.addEventListener('mouseenter', (e) => {
  const hint = document.getElementById('edit-hint');
if (!hintReady || isTyping) return;

  const rect = editor.getBoundingClientRect();
  const ratioY = (e.clientY - rect.top) / rect.height;

  if (!initialHoverZone || 
      (ratioY >= HOVER_ZONE_TOP_RATIO && ratioY <= HOVER_ZONE_BOTTOM_RATIO)) {
    hint.style.opacity = '1';
  }
});


editor.addEventListener('mousemove', (e) => {
  const hint = document.getElementById('edit-hint');
  if (!hintReady || isTyping) return;
  if (!initialHoverZone) return;

  const rect = editor.getBoundingClientRect();
  const ratioY = (e.clientY - rect.top) / rect.height;

  hint.style.opacity =
    (ratioY >= HOVER_ZONE_TOP_RATIO && ratioY <= HOVER_ZONE_BOTTOM_RATIO)
      ? '1'
      : '0';
});

editor.addEventListener('mouseleave', () => {
  const hint = document.getElementById('edit-hint');
  if (hint) {
    hint.style.opacity = '0';
  }
});

// Active le hint quand le texte est fini de taper
function showEditHint() {
  hintReady = true;
}



/* =========================================================
   MENU ARTISTE 6 LIEN KADIST ET POMPIDOU
   ========================================================= */


const artistHint = document.getElementById('artist-hint');

document.addEventListener('mousemove', (e) => {
  if (!artistHint) return;
  artistHint.style.left = (e.clientX + 15) + 'px';
  artistHint.style.top  = (e.clientY + 15) + 'px';
});



function getArtistHoverText(index) {
  return (index % 2 === 0)
    ? "découvrir l'œuvre dans la collection de Kadist"
    : "découvrir l'œuvre dans la collection du Centre Pompidou";
}

document.querySelectorAll('.artiste_menu').forEach((node, index) => {

  node.addEventListener('mouseenter', () => {
    if (!hasStartedEditing || index >= 6) return;

    artistHint.textContent = getArtistHoverText(index);
    artistHint.classList.add('visible');
  });

  node.addEventListener('mouseleave', () => {
    if (artistHint) artistHint.classList.remove('visible');
  });

});


function getArtistUrl(index) {
  // ⬇️ À REMPLACER PAR TES VRAIES URLS
  return (index % 2 === 0)
    ? "https://kadist.org/tv/"
    : "https://www.newmedia-art.org/";
}






/* =========================================================
   DONNÉES DES ARTISTES PAR GROUPE
   ========================================================= */

const artistesGroupes = [
  // Groupe 1
  ['Artiste 1A', 'Artiste 1B', 'Artiste 1C', 'Artiste 1D', 'Artiste 1E', 'Artiste 1F'],
  // Groupe 2
  ['Artiste 2A', 'Artiste 2B', 'Artiste 2C', 'Artiste 2D', 'Artiste 2E', 'Artiste 2F'],
  // Groupe 3
  ['Artiste 3A', 'Artiste 3B', 'Artiste 3C', 'Artiste 3D', 'Artiste 3E', 'Artiste 3F'],
  // Ajoute autant de groupes que tu veux
];

let groupeActuel = 0;
let artistesListeVisible = false;
let vientDeListe = false;

/* =========================================================
   GESTION LISTE D'ARTISTES
   ========================================================= */

function updateArtistesListe() {
  const liste = document.getElementById('artistes-liste');
  const items = liste.querySelectorAll('.artiste-liste-item');
  
  if (groupeActuel >= artistesGroupes.length) {
    groupeActuel = 0;
  }
  
  const groupe = artistesGroupes[groupeActuel];
  
  items.forEach((item, index) => {
    if (index < groupe.length) {
      item.textContent = groupe[index];
      item.style.visibility = 'visible';
    } else {
      item.textContent = '';
      item.style.visibility = 'hidden';
    }
  });

  saveStateToLocalStorage();


}

function showArtistesListe() {
  const liste = document.getElementById('artistes-liste');
  if (!artistesListeVisible) {
    artistesListeVisible = true;
    updateArtistesListe();

    liste.classList.remove('delay-show'); 
    liste.style.opacity = '1';
    liste.style.pointerEvents = 'auto';
  }
}
function hideArtistesNoms() {
  artistesContainer.style.opacity = '0';
  artistesContainer.style.pointerEvents = 'none';
}



/* =========================================================
   FONCTION POUR METTRE À JOUR LE MENU PART 2
   ========================================================= */

function updateMenuPart2WithCurrentGroup() {
  const menuItems = document.querySelectorAll('.artiste_menu .artiste_text');
  
  if (groupeActuel >= artistesGroupes.length) {
    groupeActuel = 0;
  }
  
  const groupe = artistesGroupes[groupeActuel];
  
  // Met à jour les items du menu avec le groupe actuel
  menuItems.forEach((item, index) => {
    if (index < groupe.length) {
      if (typeof groupe[index] === 'string') {
        item.textContent = groupe[index];
      } else {
        item.textContent = groupe[index].nom;
      }
    }
  });
}



/* =========================================================
   GESTION LISTE D'ARTISTES - CLICS
   ========================================================= */

// Attends que le DOM soit chargé pour ajouter les événements
setTimeout(() => {
  const listeItems = document.querySelectorAll('.artiste-liste-item');
  
  listeItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      updateMenuPart2WithCurrentGroup();
          vientDeListe = true; 
      // Scroll vers la partie 2
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

        showOnly6Artists();


      requestAnimationFrame(() => {
        gradientOverlay.classList.add('full');
        nomArtisteMenu.classList.add('visible');
      });

      gradientInitial.classList.add('hidden');
      editor.classList.add('hidden-content');
      artistesContainer.classList.add('hidden-content');
hideLogosAndAbout();      
      // Cache la liste des artistes IMMÉDIATEMENT
      const artistesListe = document.getElementById('artistes-liste');
      artistesListe.style.opacity = '0';
      artistesListe.style.pointerEvents = 'none';
      artistesListeVisible = false; // Marque comme non visible

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateTitreHaut();
        titreHaut.classList.add('visible');
        topRightPart2.classList.add('visible');
      }, 1500);
    });
  });
}, 1000);
/* =========================================================
   FONCTION POUR GÉRER 6 OU 9 ARTISTES
   ========================================================= */

function showOnly6Artists() {
  const menuItems = document.querySelectorAll('.artiste_menu');
  
  // Cache les 3 derniers (index 6, 7, 8)
  menuItems.forEach((item, index) => {
    if (index >= 6) {
      item.style.display = 'none';
    } else {
      item.style.display = 'block';
    }
  });
}

function showAll9Artists() {
  const menuItems = document.querySelectorAll('.artiste_menu');
  
  // Affiche tous les artistes
  menuItems.forEach((item) => {
    item.style.display = 'block';
  });
}


function focusEditable() {
  // petit délai pour laisser les classes/transitions se poser
  requestAnimationFrame(() => {
    input.focus();
    const len = input.value.length;
    try { input.setSelectionRange(len, len); } catch (e) {}
  });
}




let rulesOverlayTimeout = null;

function showRulesOverlay() {
  const overlay = document.getElementById('rules-overlay');
  if (!overlay) return;

  // reset pour relancer transition même si déjà visible
  overlay.classList.remove('visible');
  void overlay.offsetWidth; // force reflow

  overlay.classList.add('visible');

  if (rulesOverlayTimeout) clearTimeout(rulesOverlayTimeout);
  rulesOverlayTimeout = setTimeout(() => {
    overlay.classList.remove('visible');
  }, 4000);
}



/* =========================================================
   CHANGEMENT DES VIGNETTES
   ========================================================= */

function applyBazarToFirst6Artists() {
  for (let i = 0; i < 6; i++) {
    const p = randomBazarPath();
    artistesData[i].image = p;

    const imgEl = document.getElementById(`img-artiste-${i + 1}`);
    if (imgEl) imgEl.src = p;
  }
}



function restoreOriginalArtistImages() {
  artistesData.forEach((a, i) => {
    a.image = originalArtistImages[i];
    const imgEl = document.getElementById(`img-artiste-${i + 1}`);
    if (imgEl) imgEl.src = a.image;
  });
}


/* =========================================================
   RESTART — PART 1 & PART 2
   ========================================================= */

function handleRestart() {
  window.location.reload();
}

// PART 1 — page d’accueil
const btnRestartPart1 = document.getElementById('btn_restart_part1');
if (btnRestartPart1) {
  btnRestartPart1.addEventListener('click', handleRestart);
}

// PART 2 — menu
const btnRestartPart2 = document.getElementById('btn_restart');
if (btnRestartPart2) {
  btnRestartPart2.addEventListener('click', handleRestart);
}




/* =========================================================
   SAUVEGARDE LOCALSTORAGE
   ========================================================= */

function saveStateToLocalStorage() {
  const state = {
    titreTexte: input.value.trim(),
    gradientIndex: currentGradientIndex,
    groupeActuel: groupeActuel,
    hasStartedEditing: hasStartedEditing
  };
  localStorage.setItem('exhibitionState', JSON.stringify(state));
}



/* =========================================================
   ABOUT : micro-mouvement au hover (optionnel)
   ========================================================= */
(() => {
  const widget = document.getElementById('about-widget');
  if (!widget) return;

  let raf = null;
  let targetY = 0;
  let currentY = 0;

  function animate() {
    currentY += (targetY - currentY) * 0.12;
    widget.style.transform = `translateY(-50%) translateX(-6px) translateY(${currentY}px)`;
    raf = requestAnimationFrame(animate);
  }

  widget.addEventListener('mouseenter', () => {
    // démarre l’anim seulement quand on hover
    if (!raf) raf = requestAnimationFrame(animate);
  });

  widget.addEventListener('mousemove', (e) => {
    const rect = widget.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const dy = e.clientY - centerY;

    // limite le mouvement (±14px)
    targetY = Math.max(-14, Math.min(14, dy * 0.15));
  });

  widget.addEventListener('mouseleave', () => {
    targetY = 0;
    // stop après retour au centre
    setTimeout(() => {
      cancelAnimationFrame(raf);
      raf = null;
      currentY = 0;
      widget.style.transform = `translateY(-50%)`;
    }, 250);
  });
})();


function hideLogosAndAbout() {
  logosContainer.classList.add('hidden-content');

aboutDrawer.classList.add('is-hidden');

}

function showLogosAndAbout() {
  logosContainer.classList.remove('hidden-content');

aboutDrawer.classList.remove('is-hidden');

}
