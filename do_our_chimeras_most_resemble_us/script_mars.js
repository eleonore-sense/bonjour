// ═══════════════════════════════════════════
// LANGUE
// ═══════════════════════════════════════════

const translations = {
  FR: {
    titre: "Nos Chimères Sont-Elles Ce Qui Nous Ressemble Le Mieux\u00a0?",
    titreWave: ["Nos Chimères Sont-elles", "Ce Qui Nous Ressemble", "Le Mieux\u00a0?"],
    titreWaveMobile: ["Nos chimères", "Sont-Elles", "Ce Qui Nous", "Ressemble", "Le Mieux\u00a0?"],
    about: "à propos",
    exitCinema: "quitter la vue cinéma",
    exhibitionEntrance: "entrée de l'exposition",
    playVideo: "Lire la vidéo",
    restart: "recommencer",
    exitFullscreen: "quitter le plein écran",
    fullscreen: "plein écran",
    artists: "artistes",
  },
  EN: {
    titre: "Do Our Chimeras Most Resemble Us?",
    titreWave: ["Do Our Chimeras", "Most Resemble Us?", ""],
    titreWaveMobile: ["Do Our", "Chimeras", "Most", "Resemble", "Us?"],
    about: "about",
    exitCinema: "exit cinema view",
    exhibitionEntrance: "exhibition entrance",
    playVideo: "Play Video",
    restart: "restart",
    exitFullscreen: "exit fullscreen",
    fullscreen: "fullscreen",
    artists: "artists",
  }
};

// Détection langue : URL > navigateur > EN par défaut
const params = new URLSearchParams(window.location.search);
const urlLang = params.get("lang");
let currentLang;
if (urlLang) {
  currentLang = urlLang === "fr" ? "FR" : "EN";
} else if (navigator.language.startsWith("fr")) {
  currentLang = "FR";
} else {
  currentLang = "EN";
}

const linesConfig = {
  EN: [
    { y: 80,  amplitude: 16, frequency: 2   },
    { y: 160, amplitude: 13, frequency: 4   },
    { y: 240, amplitude: 12, frequency: 2.5 },
  ],
  FR: [
    { y: 60,  amplitude: 16, frequency: 2   },
    { y: 130, amplitude: 13, frequency: 4   },
    { y: 200, amplitude: 12, frequency: 2.5 },
  ]
};

let lines = linesConfig[currentLang];

function applyLang() {
  const t = translations[currentLang];
  const part3 = document.getElementById('part_3');
  const isPage2 = part3.classList.contains('visible');
  document.querySelectorAll('.editor-mobile text').forEach(el => {
  el.style.fontSize = currentLang === "FR" ? "4em" : "5.5em";
});

  const els = [
    document.querySelector('.editor'),
        document.getElementById('editor-mobile'),
    document.getElementById('titre-haut'),
    document.getElementById('about-label'),
    document.getElementById('btn-lang'),
    document.getElementById('artistes-container'),
    document.querySelector('#gauche .titre'),
    document.getElementById('btn-play'),
    document.getElementById('fullscreen'),
  ];

  // Fade out
  els.forEach(el => {
    if (el) {
      el.style.transition = "opacity 0.8s ease";
      el.style.opacity = "0";
    }
  });

  setTimeout(() => {

    function setText(id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    // Boutons et textes UI
    setText("btn-lang", currentLang === "EN" ? "→fr" : "→en");
if (isMobile()) {
  const titreHaut = document.getElementById('titre-haut');
  if (titreHaut) {
    titreHaut.innerHTML = currentLang === "FR" 
      ? 'Nos Chimères sont-elles<br>Ce Qui Nous Ressemble<br>Le Mieux\u00a0?' 
      : 'Do Our Chimeras<br>Most Resemble Us?';
    titreHaut.style.fontSize = currentLang === "FR" ? "3em" : "";
      titreHaut.style.lineHeight = currentLang === "FR" ? "1em" : "0.85em";}
} else {
  setText("titre-haut", t.titre);
}
    setText("about-label", t.about);
    setText("btn_home", t.exhibitionEntrance);
    setText("btn-play", t.playVideo);
    setText("btn-restart", t.restart);
    setText("fullscreen-exit", t.exitFullscreen);
    setText("fullscreen", t.fullscreen);
    const mobileSeeArtists = document.getElementById('mobile-see-artists');
if (mobileSeeArtists && !mobileSeeArtists.classList.contains('open')) {
  mobileSeeArtists.textContent = currentLang === "FR" ? "artistes" : "artists";
}
    setText("list_artist", t.artists);

    // Titre wave desktop
    ["text1","text2","text3"].forEach((id, i) => {
      const el = document.getElementById(id);
      const wave = document.getElementById("wave" + (i + 1));
      const val = t.titreWave[i] ?? "";
      if (el) el.textContent = val;
      if (el) el.closest("text").style.visibility = val ? "visible" : "hidden";
      if (wave) wave.style.visibility = val ? "visible" : "hidden";
    });

    // Titre wave mobile
    ["m-text1","m-text2","m-text3","m-text4","m-text5"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t.titreWaveMobile[i] ?? "";
    });

    // Taille typo selon langue
    document.querySelectorAll('.editor text').forEach(el => {
      el.style.fontSize = currentLang === "FR" ? "4.5em" : "5.4em";
    });

    // Largeur boite about sans transition
    const boiteAbout = document.getElementById("boite_about");
    if (boiteAbout) {
      boiteAbout.style.transition = "none";
      boiteAbout.style.width = currentLang === "FR" ? "90px" : "70px";
      setTimeout(() => { boiteAbout.style.transition = ""; }, 300);
    }

    // Repositionner les paths SVG
    const waveY = linesConfig[currentLang].map(l => l.y);
    document.getElementById("wave1")?.setAttribute("d", `M0 ${waveY[0]} L600 ${waveY[0]}`);
    document.getElementById("wave2")?.setAttribute("d", `M0 ${waveY[1]} L600 ${waveY[1]}`);
    document.getElementById("wave3")?.setAttribute("d", `M0 ${waveY[2]} L600 ${waveY[2]}`);

    // Mise à jour positions waves pour l'animation
    lines = linesConfig[currentLang];

    // Si on est en page 2, mettre à jour le texte de l'artiste
    if (isPage2 && artisteCourant) {
      const data = artistes[artisteCourant];
      if (data) {
        const texteOeuvre = document.getElementById('texte-oeuvre');
        if (texteOeuvre) {
          texteOeuvre.textContent = currentLang === "FR" && data.textFR ? data.textFR : data.text;
        }
      }
    }

    // URL sans rechargement
    const url = new URL(window.location);
    url.searchParams.set("lang", currentLang.toLowerCase());
    window.history.replaceState({}, "", url);

    // Fade in
    els.forEach(el => {
      if (el) {
        el.style.transition = "opacity 0.8s ease";
        if (el.id === "titre-haut") {
          el.style.opacity = isPage2 ? "1" : "0";
        } else {
          el.style.opacity = "1";
        }
      }
    });

  }, 800);
}
// Init au chargement + clic bouton
document.addEventListener("DOMContentLoaded", () => {
  applyLang();
  const btnLang = document.getElementById("btn-lang");
  if (btnLang) {
    btnLang.addEventListener("click", () => {
      currentLang = currentLang === "EN" ? "FR" : "EN";
      applyLang();
    });
  }
});

// ══════════════════════════════════════════════
// ── DONNÉES ARTISTES ──────────────────────────
// ══════════════════════════════════════════════

const artistes = {
  1: {
    nom: "Agnieszka Polska",
    titre: "The Book of Flowers",
    video: "img/agnieszka_polska.mp4",
    poster: "img/agnieszka_polska.jpg",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "20%", y: "30%"
  },
  2: {
    nom: "Lu Yang",
    titre: "DOKU, The Creator",
    video: "img/lu_yang.mp4",
    poster: "img/lu_yang.jpg",
    text: `Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "60%", y: "15%"
  },
  3: {
    nom: "Jonas Lund",
    titre: "The Future of Life",
    video: "img/jonas_lund.mp4",
    poster: "img/jonas_lund.jpg",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.
Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "10%", y: "50%"
  },
  4: {
    nom: "Egor Kraft",
    titre: "One and Infinite Chairs",
    video: "img/egor_kraft.mp4",
    poster: "img/egor_kraft.jpg",
    text: `Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "40%", y: "40%"
  },
  5: {
    nom: "Elsa Werth",
    titre: "IF / THEN",
    video: "img/elsa_werth.mp4",
    poster: "img/elsa_werth.jpg",
    text: `Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "20%", y: "70%"
  },
  6: {
    nom: "Emmanuel Van der Auwera",
    titre: "The Gospel",
    video: "img/emmanuel_van_der_auwera.mp4",
    poster: "img/emmanuel_van_der_auwera.jpg",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "80%", y: "70%"
  },
  7: {
    nom: "Jon Rafman",
    titre: "Catastrophonics I–IV",
    video: "img/jon_rafman.mp4",
    poster: "img/jon_rafman.jpg",
    text: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "5%", y: "20%"
  },
  8: {
    nom: "Ho Tzu Nyen",
    titre: "P for Power",
    video: "img/ho_tzu_nyen.mp4",
    poster: "img/ho_tzu_nyen.jpg",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "60%", y: "10%"
  },
  9: {
    nom: "John Menick",
    titre: "Telharmonium",
    video: "img/john_menick.mp4",
    poster: "img/john_menick.jpg",
    text: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "70%", y: "40%"
  },
  10: {
    nom: "Ayoung Kim",
    titre: "AI Mother Plot",
    video: "img/ayoung_kim.mp4",
    poster: "img/ayoung_kim.jpg",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    textFR: `txt fr Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
Suspendisse potenti. Vivamus euismod, nisl vel consectetur interdum, 
nisl nisi aliquam nunc, vitae facilisis purus massa nec libero.

Curabitur vel augue non neque tristique tincidunt. 
Sed ut perspiciatis unde omnis iste natus error sit voluptatem.`,
    x: "30%", y: "60%"
  }
};


// Ordre aléatoire des artistes
const artistesIds = Object.keys(artistes).map(Number);
for (let i = artistesIds.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [artistesIds[i], artistesIds[j]] = [artistesIds[j], artistesIds[i]];
}


function getNextArtisteId(currentId) {
  const idx = artistesIds.indexOf(currentId);
  return artistesIds[(idx + 1) % artistesIds.length];
}

// Randomiser le carrousel
document.addEventListener('DOMContentLoaded', () => {
  const carrouselEl = document.getElementById('carrousel');
  if (carrouselEl) {
    carrouselEl.innerHTML = '';
    [artistesIds, artistesIds].forEach(ids => {
      ids.forEach(id => {
        const span = document.createElement('span');
        span.className = 'artiste_accueil';
        span.dataset.artiste = id;
        span.textContent = artistes[id].nom;
        carrouselEl.appendChild(span);

        const sep = document.createElement('span');
        sep.style.marginTop = '20px';
        sep.textContent = '—';
        carrouselEl.appendChild(sep);
      });
    });
  }
});
// ══════════════════════════════════════════════
// ── ÉLÉMENTS DOM ──────────────────────────────
// ══════════════════════════════════════════════

const editor            = document.getElementById('editor');
const artistesContainer = document.getElementById('artistes-container');
const logosContainer    = document.querySelector('div[style*="top:15px"]');
const cinemaOverlay     = document.getElementById('cinema-overlay');
const about             = document.getElementById('about');
const video             = document.getElementById('video');
const btnHome           = document.getElementById('btn_home');
const switchCine        = document.getElementById('btn_cine_switch');
const btnPlay           = document.getElementById('btn-play');
const videoWrapper      = document.getElementById('video-wrapper');
const fullscreenBtn     = document.getElementById('fullscreen');
const fullscreenExit    = document.getElementById('fullscreen-exit');
const timelineFull      = document.getElementById('timeline-fullscreen');
const timelineFill      = document.getElementById('timeline-fullscreen-fill');
const btnRestart        = document.getElementById('btn-restart');
const texteWrapper      = document.getElementById('texte-wrapper');
const videoHoverPreview1 = document.getElementById('video-hover-preview-1');
const videoHoverPreview2 = document.getElementById('video-hover-preview-2');

let isCinemaMode = false;
let isFullscreen = false;
let hideTimer;
let hasStarted   = false;
let artisteCourant = null;
let info3AlreadyShown = false;
let fullscreenUnlocked = false;
let cinemaTransitionTimer = null;
let wasVideoPlayingBeforeHover = false;
let hoveredArtistId = null;
let activePreviewLayer = 1;

// ══════════════════════════════════════════════
// ── HELPERS GÉNÉRAUX ──────────────────────────
// ══════════════════════════════════════════════

video.addEventListener('loadedmetadata', () => {
  const ratio = video.videoWidth / video.videoHeight;
  const wrapperW = window.innerWidth * 0.63;
  const wrapperH = window.innerHeight * 0.8;
  const wrapperRatio = wrapperW / wrapperH;

  let vidW, vidH;
  if (ratio > wrapperRatio) {
    vidW = wrapperW;
    vidH = vidW / ratio;
  } else {
    vidH = wrapperH;
    vidW = vidH * ratio;
  }

  btnPlay.style.top   = (vidH / 2) + 'px';
  btnPlay.style.right = (vidW / 2) + 'px';
  btnPlay.style.transform = 'translate(50%, -50%)';
});

function showInfo3() {
  document.querySelectorAll('.info3').forEach(el => {
    el.classList.add('visible');
  });
  btnHome.style.opacity = '1';
  info3AlreadyShown = true;
}

function hideInfo3() {
  document.querySelectorAll('.info3').forEach(el => {
    el.classList.remove('visible');
  });
  btnHome.style.opacity = '0.8';
}


function getActivePreviewEl() {
  return activePreviewLayer === 1 ? videoHoverPreview1 : videoHoverPreview2;
}

function getInactivePreviewEl() {
  return activePreviewLayer === 1 ? videoHoverPreview2 : videoHoverPreview1;
}

function swapPreviewLayer() {
  activePreviewLayer = activePreviewLayer === 1 ? 2 : 1;
}


// ══════════════════════════════════════════════
// ── MODE CINE ────────────────
// ══════════════════════════════════════════════




function clearCinemaTimer() {
  if (cinemaTransitionTimer) {
    clearTimeout(cinemaTransitionTimer);
    cinemaTransitionTimer = null;
  }
}

/* entrée depuis l'accueil : on garde le tunnel d'origine */
function enterCinemaFromHome() {
  clearCinemaTimer();

  isCinemaMode = true;
  cinemaIntroPlayed = true;

  cinemaOverlay.classList.remove('closing');
  cinemaOverlay.classList.remove('active');

  /* force le navigateur à reprendre l'état initial du tunnel */
  void cinemaOverlay.offsetWidth;

  cinemaOverlay.classList.add('active');

  document.body.classList.add('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'white');
  btnPlay.style.color = 'black';
}

/* toggle interne après l'intro : plus de tunnel rejoué */
function setCinemaMode(enabled) {
  clearCinemaTimer();

  isCinemaMode = enabled;

  if (enabled) {
    document.body.classList.add('cinema-mode');
    document.documentElement.style.setProperty('--p2typo', 'white');
    btnPlay.style.color = 'black';

    cinemaOverlay.classList.remove('closing');

    if (!cinemaIntroPlayed) {
      cinemaOverlay.classList.remove('active');
      void cinemaOverlay.offsetWidth;
      cinemaOverlay.classList.add('active');
      cinemaIntroPlayed = true;
    } else {
      /* on remet le noir sans relancer le tunnel */
      cinemaOverlay.style.transition = 'opacity 1.5s ease-out, box-shadow 1.5s ease-out';
      cinemaOverlay.classList.add('active');
    }

} else {
  document.body.classList.remove('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'black');
  btnPlay.style.color = 'white';

  cinemaOverlay.classList.add('closing');

  cinemaTransitionTimer = setTimeout(() => {
    cinemaOverlay.classList.remove('active', 'closing');
    cinemaTransitionTimer = null;
  }, 1500);
}
}

function exitCinemaMode() {
  clearCinemaTimer();

  isCinemaMode = false;
  cinemaIntroPlayed = false;

  document.body.classList.remove('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'black');
  btnPlay.style.color = 'white';

  cinemaOverlay.classList.add('closing');

  cinemaTransitionTimer = setTimeout(() => {
    cinemaOverlay.classList.remove('active', 'closing');
    cinemaTransitionTimer = null;
  }, 1500);
}

// ══════════════════════════════════════════════
// ── IMAGES VIGNETTES AU SURVOL ────────────────
// ══════════════════════════════════════════════

const hoverPreviews = document.getElementById("hover-previews");

Object.entries(artistes).forEach(([id, artiste]) => {
  const img = document.createElement("img");
  img.src        = artiste.poster;
  img.className  = "artiste-image";
  img.id         = `img-artiste-${id}`;
  img.alt        = artiste.nom;
  img.style.left = artiste.x;
  img.style.top  = artiste.y;
  hoverPreviews.appendChild(img);
});

artistesContainer.addEventListener('mouseover', (e) => {
  if (!e.target.classList.contains('artiste_accueil')) return;
  const id = e.target.dataset.artiste;
  if (!id) return;
  document.querySelectorAll('.artiste-image').forEach(i => i.classList.remove('visible'));
  document.getElementById(`img-artiste-${id}`)?.classList.add('visible');
});

artistesContainer.addEventListener('mouseleave', () => {
  document.querySelectorAll('.artiste-image').forEach(i => i.classList.remove('visible'));
});


// ══════════════════════════════════════════════
// ── LOGOS SVG ─────────────────────────────────
// ══════════════════════════════════════════════

async function chargerLogo(src, selector, href) {
  const res = await fetch(src);
  const txt = await res.text();
  const parser = new DOMParser();
  const svg = parser.parseFromString(txt, 'image/svg+xml').querySelector('svg');
  svg.style.height = selector.dataset.h || '30px';
  svg.style.width  = 'auto';
  svg.style.color  = 'var(--typo)';
  const lien = document.createElement('a');
  lien.href   = href;
  lien.target = '_blank';
  lien.appendChild(svg);
  selector.replaceWith(lien);
}

chargerLogo('logo/logo_pompidou.svg', document.getElementById('logo-pompidou'), 'https://www.newmedia-art.org/');
chargerLogo('logo/logo_kadist.svg',   document.getElementById('logo-kadist'),   'https://kadist.org');


// ══════════════════════════════════════════════
// ── FOND COULEUR ANIMÉ ────────────────────────
// ══════════════════════════════════════════════

const couleurs = [
  '201, 174, 255',
  '184, 234, 255',
  '163, 255, 195',
  '255, 255, 97',
  '236, 136, 246',
];

let indexCouleur = Math.floor(Math.random() * couleurs.length);

function interpolerRGB(c1, c2, t) {
  const [r1, g1, b1] = c1.split(',').map(Number);
  const [r2, g2, b2] = c2.split(',').map(Number);
  return `${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)}`;
}

let startTransition = null;
const DUREE = 60000;
const PAUSE = 30000;

function animerCouleur(timestamp) {
  if (!startTransition) startTransition = timestamp;
  const t = Math.min((timestamp - startTransition) / DUREE, 1);
  const cible = (indexCouleur + 1) % couleurs.length;
  document.documentElement.style.setProperty('--couleur', interpolerRGB(couleurs[indexCouleur], couleurs[cible], t));

  if (t < 1) {
    requestAnimationFrame(animerCouleur);
  } else {
    indexCouleur = cible;
    setTimeout(() => {
      startTransition = null;
      requestAnimationFrame(animerCouleur);
    }, PAUSE);
  }
}

document.documentElement.style.setProperty('--couleur', couleurs[indexCouleur]);
setTimeout(() => requestAnimationFrame(animerCouleur), PAUSE);


// ══════════════════════════════════════════════
// ── TITRE WAVE / GLITCH ───────────────────────
// ══════════════════════════════════════════════

const paths = [
  document.getElementById('wave1'),
  document.getElementById('wave2'),
  document.getElementById('wave3'),
];


let glitchProgress = 0;
let targetProgress = 0;
let isGlitching    = false;
let isPausing      = false;
const GLITCH_DURATION  = 4;
const PAUSE_DURATION   = 7;
const GLITCH_FREQUENCY = 20;

function generateWavyPath({ y, amplitude, frequency }, progress) {
  const amp = amplitude * progress;
  if (progress === 0) return `M0 ${y} L600 ${y}`;

  let d = `M0 ${y}`;
  for (let i = 1; i <= 60; i++) {
    const x = (i / 60) * 600;
    const offset = Math.sin((i / 60) * Math.PI * frequency) * amp;
    d += ` L${x} ${y + offset}`;
  }
  return d;
}

function updatePaths() {
  paths.forEach((p, i) => {
    if (p) p.setAttribute('d', generateWavyPath(lines[i], glitchProgress));
  });

    if (typeof updateMobileWavePaths === 'function') updateMobileWavePaths();
    
}

function animateWave() {
  if (isPausing) {
    requestAnimationFrame(animateWave);
    return;
  }

  const diff = targetProgress - glitchProgress;
  glitchProgress += diff * (0.001 * (1 + Math.abs(diff) * 0.5));

  if (Math.abs(diff) < 0.001) {
    glitchProgress = targetProgress;
    if (!isGlitching && glitchProgress === 0) return;
  }

  updatePaths();
  requestAnimationFrame(animateWave);
}

function glitch() {
  isGlitching = true;
  isPausing = false;
  targetProgress = 1;
  animateWave();

  setTimeout(() => {
    isPausing = true;
    setTimeout(() => {
      isPausing = false;
      targetProgress = 0;
      isGlitching = false;
      animateWave();
    }, PAUSE_DURATION * 1000);
  }, GLITCH_DURATION * 1000);
}

function scheduleGlitch() {
  glitch();
  setTimeout(scheduleGlitch, (GLITCH_FREQUENCY + Math.random() * 10) * 1000);
}

setTimeout(scheduleGlitch, 5000);

// ══════════════════════════════════════════════
// ── CARROUSEL : AUTO + SCROLL MOLETTE ─────────
// ══════════════════════════════════════════════

const carrousel = document.getElementById('carrousel');

let carouselOffset = 0;
let carouselVelocity = -0.35; // vitesse auto vers la gauche
let carouselHovered = false;
let carouselRaf = null;

function getCarouselLoopWidth() {
  return carrousel.scrollWidth / 2;
}

function normalizeCarouselOffset() {
  const loopWidth = getCarouselLoopWidth();

  if (!loopWidth) return;

  while (carouselOffset <= -loopWidth) {
    carouselOffset += loopWidth;
  }

  while (carouselOffset > 0) {
    carouselOffset -= loopWidth;
  }
}

function renderCarousel() {
  carrousel.style.transform = `translateX(${carouselOffset}px)`;
}

function animateCarousel() {
  carouselOffset += carouselVelocity;
  normalizeCarouselOffset();
  renderCarousel();
  carouselRaf = requestAnimationFrame(animateCarousel);
}

function startCarousel() {
  if (carouselRaf) return;
  carouselRaf = requestAnimationFrame(animateCarousel);
}

function stopCarousel() {
  if (!carouselRaf) return;
  cancelAnimationFrame(carouselRaf);
  carouselRaf = null;
}

function nudgeCarousel(delta) {
  carouselOffset += delta;
  normalizeCarouselOffset();
  renderCarousel();
}

// démarrage
renderCarousel();
startCarousel();

// état hover
artistesContainer.addEventListener('mouseenter', () => {
  carouselHovered = true;
});

artistesContainer.addEventListener('mouseleave', () => {
  carouselHovered = false;
});

// scroll molette sur le carrousel
artistesContainer.addEventListener('wheel', (e) => {
  if (!carouselHovered) return;

  e.preventDefault();

  // scroll vers le bas = avance vers la gauche
  nudgeCarousel(-e.deltaY * 0.8);
}, { passive: false });

// recalcul propre si la fenêtre change de taille
window.addEventListener('resize', () => {
  normalizeCarouselOffset();
  renderCarousel();
});

// ══════════════════════════════════════════════
// ── OUVERTURE PART 3 (clic sur un artiste) ────
// ══════════════════════════════════════════════

artistesContainer.addEventListener('click', (e) => {
  if (!e.target.classList.contains('artiste_accueil')) return;

  const id = e.target.dataset.artiste;
  artisteCourant = parseInt(id, 10);
  const data = artistes[id];
const next = getNextArtisteId(artisteCourant);

  document.getElementById('next_artist').textContent = `${artistes[next].nom}`;
  if (!data) return;

  document.querySelector('#gauche .titre').textContent = `${data.nom} — ${data.titre}`;
  video.src    = data.video;
  video.poster = data.poster;
  video.load();

document.getElementById('texte-oeuvre').textContent = currentLang === "FR" && data.textFR ? data.textFR : data.text;
  document.getElementById('texte-oeuvre').classList.remove('visible');

  if (!info3AlreadyShown) hideInfo3();

  editor.classList.add('hidden-content');
  artistesContainer.classList.add('hidden-content');
  logosContainer.classList.add('hidden-content');
  about.classList.add('hidden-content');

enterCinemaFromHome();
document.getElementById('btn-lang').classList.add('nav_link');
  const part3 = document.getElementById('part_3');

  setTimeout(() => {
    part3.classList.add('visible');

    setTimeout(() => {
      document.getElementById('titre-haut').style.opacity = '1';
    }, 50);

    setTimeout(() => {
      part3.classList.add('part3-video-visible');
    }, 600);

    setTimeout(() => {
      part3.classList.add('part3-info1-visible');
    }, 1200);

    setTimeout(() => {
      part3.classList.add('part3-info2-visible');
      btnPlay.style.opacity = '1';
      btnPlay.style.pointerEvents = 'auto';
    }, 3000);

  }, 1000);
});


// ══════════════════════════════════════════════
// ── FERMETURE PART 3 (bouton home) ────────────
// ══════════════════════════════════════════════

if (btnHome) {
  btnHome.addEventListener('click', () => {
    const part3 = document.getElementById('part_3');

    hasStarted = false;
    video.pause();
    video.src = '';
    video.poster = '';
    info3AlreadyShown = false;
    btnPlay.textContent = 'Play Video';
    btnPlay.classList.remove('playing');

    ['visible', 'part3-video-visible', 'part3-info1-visible', 'part3-info2-visible', 'part3-info3-visible']
      .forEach(c => part3.classList.remove(c));

    hideInfo3();

    document.getElementById('titre-haut').style.opacity = '0';
    btnPlay.style.opacity = '0';
    btnPlay.style.pointerEvents = 'none';
    fullscreenBtn.style.opacity = '0';
    fullscreenBtn.style.display = 'none';
    btnRestart.style.opacity = '0';

    if (isFullscreen) {
      document.exitFullscreen();
      isFullscreen = false;
    }
document.getElementById('btn_home').style.opacity = "0";
document.getElementById('btn_home').style.pointerEvents = "none";
    exitCinemaMode();
document.getElementById('btn-lang').classList.remove('nav_link');
    setTimeout(() => {
      editor.classList.remove('hidden-content');
      artistesContainer.classList.remove('hidden-content');
      logosContainer.classList.remove('hidden-content');
      about.classList.remove('hidden-content');
    }, 600);
  });
}


// ══════════════════════════════════════════════
// ── PLAY / PAUSE VIDÉO ────────────────────────
// ══════════════════════════════════════════════

btnPlay.addEventListener('click', async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (video.paused) {
    if (!hasStarted) {
      video.style.transition = 'opacity 0.8s ease';
      video.style.opacity = '0';
      btnPlay.style.opacity = '0';
      btnPlay.style.pointerEvents = 'none';

      setTimeout(async () => {
        try {
          await video.play();
          hasStarted = true;
          fullscreenUnlocked = true;
          video.style.opacity = '1';
          btnPlay.style.pointerEvents = 'none';
          videoWrapper.style.cursor = 'none';

          setTimeout(() => {
            btnPlay.style.pointerEvents = '';
            fullscreenBtn.style.display = 'block';
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                fullscreenBtn.style.opacity = '1';
              });
            });
          }, 2000);

        } catch (err) {
          console.error("Erreur lecture vidéo :", err);
          video.style.opacity = '1';
        }
      }, 800);

    } else {
      video.play();
    }

  } else {
    video.pause();
  }
});

video.addEventListener('play', () => {
  btnPlay.textContent = 'Pause';
  btnPlay.classList.add('playing');
});

video.addEventListener('pause', () => {
  btnPlay.textContent = 'Play Video';
  btnPlay.classList.remove('playing');

  if (hasStarted) {
    setTimeout(() => showInfo3(), 1500);
  }
});

video.addEventListener('ended', () => {
  btnPlay.textContent = 'Play Video';
  btnPlay.classList.remove('playing');
});

video.addEventListener('error', () => {
  console.error('video error:', video.currentSrc);
});


// ══════════════════════════════════════════════
// ── CURSEUR & BOUTONS — DISPARITION AUTO ──────
// ══════════════════════════════════════════════

function showBtn() {
  btnPlay.style.opacity = '1';
  btnPlay.style.pointerEvents = 'auto';
  videoWrapper.style.cursor = 'default';

  if (document.fullscreenElement) {
    document.fullscreenElement.style.cursor = 'default';
    timelineFull.style.opacity = '1';
    fullscreenExit.style.opacity = '1';
    btnRestart.style.display = 'block';
    btnRestart.style.opacity = '1';
  }

  clearTimeout(hideTimer);

  hideTimer = setTimeout(() => {
    if (!video.paused || hasStarted) {
      btnPlay.style.opacity = '0';
      btnPlay.style.pointerEvents = 'none';
      videoWrapper.style.cursor = 'none';

      if (document.fullscreenElement) {
        document.fullscreenElement.style.cursor = 'none';
        timelineFull.style.opacity = '0';
        fullscreenExit.style.opacity = '0';
        btnRestart.style.opacity = '0';
      }
    }
  }, 2000);
}

videoWrapper.addEventListener('mousemove', showBtn);
videoWrapper.addEventListener('mouseenter', showBtn);
videoWrapper.addEventListener('mouseleave', () => {
  clearTimeout(hideTimer);

  if (!video.paused || hasStarted) {
    btnPlay.style.opacity = '0';
    btnPlay.style.pointerEvents = 'none';
  }

  if (document.fullscreenElement) {
    btnRestart.style.opacity = '0';
    fullscreenExit.style.opacity = '0';
    timelineFull.style.opacity = '0';
  }

  videoWrapper.style.cursor = 'default';
});


// ══════════════════════════════════════════════
// ── TIMELINE ──────────────────────────────────
// ══════════════════════════════════════════════

video.addEventListener('timeupdate', () => {
  const pct = (video.currentTime / video.duration) * 100;
  timelineFill.style.width = pct + '%';
});

timelineFull.addEventListener('click', (e) => {
  const rect = timelineFull.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  video.currentTime = pct * video.duration;
});


// ══════════════════════════════════════════════
// ── FULLSCREEN ────────────────────────────────
// ══════════════════════════════════════════════

fullscreenBtn.addEventListener('click', () => {
  if (!isFullscreen) {
    videoWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

fullscreenExit.addEventListener('click', () => {
  document.exitFullscreen();
});

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    isFullscreen = true;
    fullscreenBtn.textContent = 'exit fullscreen';
    timelineFull.style.display = 'block';
    fullscreenExit.style.display = 'block';
    btnRestart.style.display = 'block';
    btnRestart.style.opacity = '1';

    btnPlay.style.top = '50%';
    btnPlay.style.left = '50%';
    btnPlay.style.right = 'auto';
    btnPlay.style.bottom = 'auto';
    btnPlay.style.transform = 'translate(-50%,-50%)';

    video.style.width = '100vw';
    video.style.height = '95vh';
    video.style.objectPosition = 'center center';

    document.fullscreenElement.addEventListener('mousemove', showBtn);
    showBtn();

  } else {
    isFullscreen = false;
    fullscreenBtn.textContent = 'fullscreen';
    timelineFull.style.display = 'none';
    fullscreenExit.style.display = 'none';
    btnRestart.style.display = 'none';
    btnRestart.style.opacity = '0';

    btnPlay.style.left = 'auto';
    video.style.width = '63vw';
    video.style.height = '80vh';
    video.style.objectPosition = 'right top';
    video.dispatchEvent(new Event('loadedmetadata'));
  }
});

btnRestart.addEventListener('click', () => {
  video.currentTime = 0;
  video.play();
  showBtn();
});


// ══════════════════════════════════════════════
// ── CLICK SUR + ───────────────────────────────
// ══════════════════════════════════════════════

document.getElementById('info').addEventListener('click', () => {
  const texte = document.getElementById('texte-oeuvre');
  const info = document.getElementById('info');

  texte.classList.toggle('visible');
  info.textContent = texte.classList.contains('visible') ? '–' : '+';
  texteWrapper.classList.toggle('visible', texte.classList.contains('visible'));

  if (texte.classList.contains('visible')) {
    setTimeout(() => showInfo3(), 1500);
  }
});


// ══════════════════════════════════════════════
// ── NEXT ARTIST ───────────────────────────────
// ══════════════════════════════════════════════

document.getElementById('next_artist').addEventListener('click', () => {
  const next = getNextArtisteId(artisteCourant);
  artisteCourant = next;
  const data = artistes[next];

  video.style.transition = 'opacity 0.5s ease';
  video.style.opacity = '0';

  btnPlay.style.transition = 'opacity 0.5s ease';
  btnPlay.style.opacity = '0';

  const titre = document.querySelector('#gauche .titre');
  titre.style.transition = 'opacity 0.5s ease';
  titre.style.opacity = '0';

  const texte = document.getElementById('texte-oeuvre');
  const infoBtn = document.getElementById('info');

  if (texte.classList.contains('visible')) {
    texte.style.transition = 'opacity 0.5s ease';
    texte.style.opacity = '0';
      texte.scrollTop = 0; 
  }

  setTimeout(() => {
    document.querySelector('#gauche .titre').textContent = `${data.nom} — ${data.titre}`;
    video.src = data.video;
    video.poster = data.poster;
    video.load();

texte.textContent = currentLang === "FR" && data.textFR ? data.textFR : data.text;
    if (!info3AlreadyShown) {
      texte.classList.remove('visible');
      infoBtn.textContent = '+';
    }

    hasStarted = false;
    btnPlay.textContent = 'Play Video';
    btnPlay.classList.remove('playing');

    if (!info3AlreadyShown) hideInfo3();
    if (info3AlreadyShown) showInfo3();

    if (fullscreenUnlocked) {
      fullscreenBtn.style.display = 'block';
      fullscreenBtn.style.opacity = '1';
    } else {
      fullscreenBtn.style.display = 'none';
      fullscreenBtn.style.opacity = '0';
    }

    const next2 = getNextArtisteId(next);
    document.getElementById('next_artist').textContent = `${artistes[next2].nom}`;

    video.style.transition = 'opacity 0.8s ease';
    video.style.opacity = '1';

    titre.style.transition = 'opacity 0.8s ease';
    titre.style.opacity = '1';

    if (!fullscreenUnlocked) {
      btnPlay.style.transition = 'opacity 0.8s ease';
      btnPlay.style.opacity = '1';
    }

    if (texte.classList.contains('visible')) {
      texte.style.transition = 'opacity 0.8s ease';
      texte.style.opacity = '1';
    }
  }, 500);
});


// ══════════════════════════════════════════════
// ── CINEMA VIEW ───────────────────────────────
// ══════════════════════════════════════════════

switchCine.addEventListener('click', () => {
  setCinemaMode(!isCinemaMode);
});



// ══════════════════════════════════════════════
// ── ABOUT PANEL ───────────────────────────────
// ══════════════════════════════════════════════

const boiteAbout = document.getElementById('boite_about');
const aboutPanel = document.getElementById('about-panel');

let aboutOpen = false;
let aboutTextTimer = null;

function openAbout() {
  if (aboutOpen) return;
  aboutOpen = true;
  boiteAbout.style.width = "";
  clearTimeout(aboutTextTimer);

  boiteAbout.classList.add('open');
  boiteAbout.classList.remove('show-text');

  aboutTextTimer = setTimeout(() => {
    boiteAbout.classList.add('show-text');
  }, 850);

  document.getElementById('about-close-mobile')?.style.setProperty('opacity', '1');
document.getElementById('about-close-mobile')?.style.setProperty('pointer-events', 'auto');


}

function closeAbout() {
  if (!aboutOpen) return;
  aboutOpen = false;

  clearTimeout(aboutTextTimer);

  boiteAbout.classList.remove('show-text');
  boiteAbout.classList.remove('open');
   boiteAbout.style.width = currentLang === "FR" ? "90px" : "70px"; // ← ajoute ça
  document.getElementById('about-close-mobile')?.style.setProperty('opacity', '0');
document.getElementById('about-close-mobile')?.style.setProperty('pointer-events', 'none');
document.getElementById('about-content').scrollTop = 0;
}

boiteAbout.addEventListener('click', (e) => {
  e.stopPropagation();

  if (aboutOpen) {
    closeAbout();
  } else {
    openAbout();
  }
});

document.addEventListener('click', (e) => {
  if (!boiteAbout.contains(e.target)) {
    closeAbout();
  }
});

// ══════════════════════════════════════════════
// ── CURATED ARTISTS LIST
// ══════════════════════════════════════════════

// Créer la liste dans le DOM
const part3 = document.getElementById('part_3');
const artistsList = document.createElement('div');
artistsList.id = 'artists-list';

artistesIds.forEach(id => {
  const item = document.createElement('span');
  item.className = 'artist-list-item info1';
  item.dataset.artiste = id;
  item.textContent = artistes[id].nom;
  artistsList.appendChild(item);
});

part3.appendChild(artistsList);

const listArtistBtn = document.getElementById('list_artist');
const gauche = document.getElementById('gauche');
const nextArtistBtn = document.getElementById('next_artist');

let artistsListCloseTimer = null;
let previewHideTimer = null;
let previewShowTimer = null;
let underlineBackTimer = null;

let currentHoveredArtistId = null;
let pendingHoveredArtistId = null;
let videoWasPlayingBeforePreview = false;

// état visuel : seul le hover est souligné
function updateArtistsHoverState() {
  artistsList.querySelectorAll('.artist-list-item').forEach(el => {
    const id = parseInt(el.dataset.artiste, 10);

    el.classList.toggle('hovered', id === currentHoveredArtistId);
    el.classList.toggle('active', currentHoveredArtistId === null && id === artisteCourant);
  });
}


function openArtistsList() {
  clearTimeout(artistsListCloseTimer);
  gauche.classList.add('wiped');
  artistsList.classList.add('visible');
}
function closeArtistsList() {
  clearTimeout(artistsListCloseTimer);
  clearTimeout(previewHideTimer);
  clearTimeout(previewShowTimer);
  clearTimeout(underlineBackTimer);

  pendingHoveredArtistId = null;
  currentHoveredArtistId = null;

  const previewA = videoHoverPreview1;
  const previewB = videoHoverPreview2;

  previewA.classList.remove('visible');
  previewB.classList.remove('visible');
  video.classList.remove('is-preview-hidden');

  fullscreenBtn.classList.remove('is-hidden-during-preview');
  nextArtistBtn.classList.remove('is-hidden-during-preview');

  btnPlay.style.pointerEvents = '';

  if (hasStarted) {
    btnPlay.style.opacity = '1';
  }

  previewHideTimer = setTimeout(() => {
    if (!previewA.classList.contains('visible')) {
      previewA.src = '';
      previewA.alt = '';
    }

    if (!previewB.classList.contains('visible')) {
      previewB.src = '';
      previewB.alt = '';
    }
  }, 450);

  underlineBackTimer = setTimeout(() => {
    updateArtistsHoverState();
  }, 200);

  gauche.classList.remove('wiped');
  artistsList.classList.remove('visible');
}

function showArtistHoverPreview(id) {

  clearTimeout(previewHideTimer);

  const data = artistes[id];
  if (!data) return;

  const currentVisible = getActivePreviewEl();
  const nextPreview = getInactivePreviewEl();

  currentHoveredArtistId = id;
  pendingHoveredArtistId = id;

  updateArtistsHoverState();

  video.pause();
  video.classList.add('is-preview-hidden');

  btnPlay.style.opacity = '0';
  btnPlay.style.pointerEvents = 'none';

  fullscreenBtn.classList.add('is-hidden-during-preview');
  nextArtistBtn.classList.add('is-hidden-during-preview');

  // si une image est déjà visible
  if (currentVisible.classList.contains('visible')) {

    currentVisible.classList.add('fading-out');
    currentVisible.classList.remove('visible');

    setTimeout(() => {

      currentVisible.classList.remove('fading-out');

      nextPreview.src = data.poster;
      nextPreview.alt = data.nom;

      void nextPreview.offsetWidth;

      nextPreview.classList.add('visible');

      swapPreviewLayer();

    }, 120); // durée disparition

  } else {

    nextPreview.src = data.poster;
    nextPreview.alt = data.nom;

    void nextPreview.offsetWidth;

    nextPreview.classList.add('visible');

    swapPreviewLayer();
  }
}



function hideArtistHoverPreview() {
  clearTimeout(previewHideTimer);

  previewHideTimer = setTimeout(() => {
    currentHoveredArtistId = null;
    pendingHoveredArtistId = null;

    updateArtistsHoverState();

    const currentVisible = getActivePreviewEl();
    currentVisible.classList.remove('visible');

    video.classList.remove('is-preview-hidden');

    fullscreenBtn.classList.remove('is-hidden-during-preview');
    nextArtistBtn.classList.remove('is-hidden-during-preview');

    btnPlay.style.pointerEvents = '';

    setTimeout(() => {
      if (!currentVisible.classList.contains('visible')) {
        currentVisible.src = '';
        currentVisible.alt = '';
      }
    }, 1000);
  }, 1000);
}

// ouverture uniquement au hover sur "curated artists"
listArtistBtn.addEventListener('mouseenter', () => {
  openArtistsList();
});

// fermeture si la souris dépasse 20vw depuis la gauche
// ou 80vh depuis le bas
document.addEventListener('mousemove', (e) => {
  if (!artistsList.classList.contains('visible')) return;

  const limiteX = window.innerWidth * 0.20;
  const limiteY = window.innerHeight * 0.80;
  const distanceFromBottom = window.innerHeight - e.clientY;

  if (e.clientX <= limiteX && distanceFromBottom <= limiteY) {
    clearTimeout(artistsListCloseTimer);
  } else {
    clearTimeout(artistsListCloseTimer);
    artistsListCloseTimer = setTimeout(() => {
      closeArtistsList();
    }, 80);
  }
});

// hover preview par nom
artistsList.addEventListener('mouseover', (e) => {
  const item = e.target.closest('.artist-list-item');
  if (!item) return;

  clearTimeout(previewHideTimer);

  const id = parseInt(item.dataset.artiste, 10);
  if (!id) return;

  showArtistHoverPreview(id);
});

artistsList.addEventListener('mouseout', (e) => {
  const item = e.target.closest('.artist-list-item');
  if (!item) return;

  const nextTarget = e.relatedTarget?.closest('.artist-list-item');

  // si on va directement vers un autre nom, on ne reset rien
  if (nextTarget) return;

  hideArtistHoverPreview();
});

artistsList.addEventListener('mouseleave', () => {
  hideArtistHoverPreview();
});

// clic sur un artiste de la liste → charger son œuvre
artistsList.addEventListener('click', (e) => {
  const item = e.target.closest('.artist-list-item');
  if (!item) return;

  clearTimeout(previewHideTimer);
  hideArtistHoverPreview();

  const id = parseInt(item.dataset.artiste, 10);
  if (!id) return;

  if (id === artisteCourant) {
    closeArtistsList();
    return;
  }

  artisteCourant = id;
  const data = artistes[id];

  video.style.transition = 'opacity 0.5s ease';
  video.style.opacity = '0';

  btnPlay.style.transition = 'opacity 0.5s ease';
  btnPlay.style.opacity = '0';

  const titre = document.querySelector('#gauche .titre');
  titre.style.transition = 'opacity 0.5s ease';
  titre.style.opacity = '0';

  const texte = document.getElementById('texte-oeuvre');
  const infoBtn = document.getElementById('info');

  if (texte.classList.contains('visible')) {
    texte.style.transition = 'opacity 0.5s ease';
    texte.style.opacity = '0';
  }

  setTimeout(() => {
    document.querySelector('#gauche .titre').textContent = `${data.nom} — ${data.titre}`;
    video.src = data.video;
    video.poster = data.poster;
    video.load();

texte.textContent = currentLang === "FR" && data.textFR ? data.textFR : data.text;
    if (!info3AlreadyShown) {
      texte.classList.remove('visible');
      infoBtn.textContent = '+';
      texteWrapper.classList.remove('visible');
    }

    hasStarted = false;
    btnPlay.textContent = 'Play Video';
    btnPlay.classList.remove('playing');

    if (!info3AlreadyShown) hideInfo3();
    if (info3AlreadyShown) showInfo3();

    if (fullscreenUnlocked) {
      fullscreenBtn.style.display = 'block';
      fullscreenBtn.style.opacity = '1';
    } else {
      fullscreenBtn.style.display = 'none';
      fullscreenBtn.style.opacity = '0';
    }

const next2 = getNextArtisteId(id);
    nextArtistBtn.textContent = `${artistes[next2].nom}`;

    video.style.transition = 'opacity 0.8s ease';
    video.style.opacity = '1';

    titre.style.transition = 'opacity 0.8s ease';
    titre.style.opacity = '1';

    if (!fullscreenUnlocked) {
      btnPlay.style.transition = 'opacity 0.8s ease';
      btnPlay.style.opacity = '1';
    }

    if (texte.classList.contains('visible')) {
      texte.style.transition = 'opacity 0.8s ease';
      texte.style.opacity = '1';
    }

    closeArtistsList();
  }, 500);
});



