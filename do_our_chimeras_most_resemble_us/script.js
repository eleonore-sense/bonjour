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
const texteWasVisible = document.getElementById('texte-oeuvre')?.classList.contains('visible');

  document.querySelectorAll('.editor-mobile text').forEach(el => {
    el.style.fontSize = currentLang === "FR" ? "4em" : "5.5em";
  });

  // Fade out titre si intro déjà jouée
  if (introPlayed) {
    const ed = document.querySelector('.editor');
    const edm = document.getElementById('editor-mobile');
    if (ed) { ed.style.transition = 'opacity 0.8s ease'; ed.style.opacity = '0'; }
    if (edm) { edm.style.transition = 'opacity 0.8s ease'; edm.style.opacity = '0'; }
  }

  const els = [
    document.getElementById('titre-haut'),
    document.getElementById('about-label'),
    document.getElementById('btn-lang'),
    document.querySelector('#gauche .titre'),
    document.getElementById('btn-play'),
    document.getElementById('fullscreen'),
    document.getElementById('btn_cine_switch'),
  document.getElementById('btn_home'),
  document.getElementById('texte-oeuvre'),
  document.getElementById('info'),
  document.getElementById('list_artist'),
  document.getElementById('next_artist'),
  ];

  // Fade out
  els.forEach(el => {
    if (el) {
      setOpacity(el, '0', '0.8s');
    }
  });

  setTimeout(() => {
    function setText(id, val) {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    }

    setText("btn-lang", currentLang === "EN" ? "→fr" : "→en");

    if (isMobile()) {
      const titreHaut = document.getElementById('titre-haut');
      if (titreHaut) {
        titreHaut.innerHTML = currentLang === "FR"
          ? 'Nos Chimères sont-elles<br>Ce Qui Nous Ressemble<br>Le Mieux\u00a0?'
          : 'Do Our Chimeras<br>Most Resemble Us?';
        titreHaut.style.fontSize = currentLang === "FR" ? "3em" : "";
        titreHaut.style.lineHeight = currentLang === "FR" ? "1em" : "0.85em";
      }
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

    ["text1","text2","text3"].forEach((id, i) => {
      const el = document.getElementById(id);
      const wave = document.getElementById("wave" + (i + 1));
      const val = t.titreWave[i] ?? "";
      if (el) el.textContent = val;
      if (el) el.closest("text").style.visibility = val ? "visible" : "hidden";
      if (wave) wave.style.visibility = val ? "visible" : "hidden";
    });

    ["m-text1","m-text2","m-text3","m-text4","m-text5"].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = t.titreWaveMobile[i] ?? "";
    });

    document.querySelectorAll('.editor text').forEach(el => {
      el.style.fontSize = currentLang === "FR" ? "4.5em" : "5.4em";
    });

    const boiteAbout = document.getElementById("boite_about");
    if (boiteAbout) {
      boiteAbout.style.transition = "none";
      boiteAbout.style.width = currentLang === "FR" ? "90px" : "70px";
      setTimeout(() => { boiteAbout.style.transition = ""; }, 300);
    }

    const waveY = linesConfig[currentLang].map(l => l.y);
    document.getElementById("wave1")?.setAttribute("d", `M0 ${waveY[0]} L600 ${waveY[0]}`);
    document.getElementById("wave2")?.setAttribute("d", `M0 ${waveY[1]} L600 ${waveY[1]}`);
    document.getElementById("wave3")?.setAttribute("d", `M0 ${waveY[2]} L600 ${waveY[2]}`);

    lines = linesConfig[currentLang];

    if (isPage2 && artisteCourant) {
      const data = artistes[artisteCourant];
      if (data) {
        const texteOeuvre = document.getElementById('texte-oeuvre');
        if (texteOeuvre) {
          texteOeuvre.textContent = currentLang === "FR" && data.textFR ? data.textFR : data.text;
        }
      }
    }

    const url = new URL(window.location);
    url.searchParams.set("lang", currentLang.toLowerCase());
    window.history.replaceState({}, "", url);

    // Fade in titre si intro déjà jouée
    if (introPlayed) {
      const ed = document.querySelector('.editor');
      const edm = document.getElementById('editor-mobile');
      if (ed) { ed.style.transition = 'opacity 0.8s ease'; ed.style.opacity = '1'; }
      if (edm) { edm.style.transition = 'opacity 0.8s ease'; edm.style.opacity = '1'; }
    }


els.forEach(el => {
  if (!el) return;
  if (el.id === "titre-haut") {
    setOpacity(el, isPage2 ? '1' : '0', '0.8s');
  } else if (el.id === "btn-lang") {
    setOpacity(el, introPlayed ? '1' : '0', '0.8s');
  } else if (el.id === "texte-oeuvre") {
    setOpacity(el, isPage2 && texteWasVisible ? '1' : '0', '0.8s');
  } else if (el.id === "info") {
    setOpacity(el, isPage2 ? '1' : '0', '0.8s');
  } else if (el.id === "btn_home") {
    setOpacity(el, isPage2 ? '0.8' : '0', '0.8s');
  } else {
    setOpacity(el, '1', '0.8s');
  }
});

    if (!introPlayed) {
      introPlayed = true;
      playIntro();
    }

  }, 800);
}

// Init au chargement + clic bouton
document.addEventListener("DOMContentLoaded", () => {
  applyLang();
  initTunnel();
  const btnLang = document.getElementById("btn-lang");
  if (btnLang) {
    btnLang.addEventListener("click", () => {
      currentLang = currentLang === "EN" ? "FR" : "EN";
      applyLang();
      cachedLoopWidth = carrousel.scrollWidth / 2;

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
  }
};

const vignettePositions = [
  { x: "20%", y: "30%" }, // slot 1
  { x: "65%", y: "15%" }, // slot 2
  { x: "10%", y: "50%" }, // slot 3
  { x: "45%", y: "42%" }, // slot 4
  { x: "20%", y: "70%" }, // slot 5
  { x: "80%", y: "70%" }, // slot 6
  { x: "5%",  y: "20%" }, // slot 7
  { x: "78%", y: "5%"  }, // slot 8
  { x: "70%", y: "40%" }, // slot 9
  { x: "30%", y: "60%" }, // slot 10
];

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
let fullscreenVisible = false;


function setOpacity(el, val, duration = '0.8s') {
  if (!el) return;
  el.style.transition = `opacity ${duration} ease, text-shadow 0.3s ease, color 1s ease, filter 0.3s ease`;
  el.style.opacity = val;
}


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
        el.style.opacity = '';      // ← reset inline pour laisser le CSS prendre le relais
    el.style.transition = ''; 
    el.classList.add('visible');
  });
  btnHome.style.opacity = '1';
  info3AlreadyShown = true;
}

function hideInfo3() {
  document.querySelectorAll('.info3').forEach(el => {
        el.style.opacity = '';      // ← reset inline pour laisser le CSS prendre le relais
    el.style.transition = ''; 
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
// ── INTRO ANIMATION
// ══════════════════════════════════════════════

let introPlayed = false;

function playIntro() {

  Object.values(artistes).forEach(a => {
    const img = new Image();
    img.src = a.poster;
  });


  const allIds = Object.keys(artistes).map(Number);
  const shuffled = allIds.sort(() => Math.random() - 0.5);
  const count = Math.random() < 0.5 ? 3 : 4;
  const picks = shuffled.slice(0, count);

  // 0s — vignettes apparaissent en cascade
  picks.forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(`img-artiste-${id}`);
      el?.classList.add('visible', 'intro-blur');
    }, i * 400);
  });

  // 2s — titre wave apparaît
  setTimeout(() => {
    const ed = document.querySelector('.editor');
    const edm = document.getElementById('editor-mobile');
    if (ed) { ed.style.transition = 'opacity 3s ease'; ed.style.opacity = '1'; }
    if (edm) { edm.style.transition = 'opacity 3s ease'; edm.style.opacity = '1'; }
  }, 1500);

  // 8s — vignettes disparaissent
  setTimeout(() => {
    picks.forEach(id => {
      const el = document.getElementById(`img-artiste-${id}`);
      el?.classList.remove('visible', 'intro-blur');
      el?.classList.add('leave-blur');
      setTimeout(() => {
        el?.classList.remove('leave-blur');
      }, 1500);
    });
  }, 3500);

  // 5.8s — carrousel + UI arrivent
  setTimeout(() => {
    const fadeIn = (id) => {
      const el = document.getElementById(id);
      if (el) { el.style.transition = 'opacity 1s ease'; el.style.opacity = '1'; }
    };
    fadeIn('artistes-container');
    document.getElementById('boite_about')?.classList.add('visible');
setOpacity(document.getElementById('btn-lang'), '1', '1s');
setOpacity(document.getElementById('btn_cine_switch'), '1', '1s');
    fadeIn('logos-container');
    document.getElementById('artistes-container').style.pointerEvents = 'auto';
  }, 4500);
}
// ══════════════════════════════════════════════
// ── TUNNEL WEBGL ──────────────────────────────
// ══════════════════════════════════════════════

let tunnelCanvas, gl, tunnelRaf;
let uRes, uProgress, uOpacity, uSoftness;

function initTunnel() {
  tunnelCanvas = document.getElementById('cinema-tunnel');
  tunnelCanvas.width  = window.innerWidth;
  tunnelCanvas.height = window.innerHeight;

  gl = tunnelCanvas.getContext('webgl') || tunnelCanvas.getContext('experimental-webgl');

  const vsSource = `
    attribute vec2 aPos;
    void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
  `;

  const fsSource = `
    precision highp float;
    uniform vec2  uResolution;
    uniform float uProgress;
    uniform float uOpacity;
    uniform float uSoftness;

    float easeInOut(float t) {
      return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t+2.0, 3.0)/2.0;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      vec2 p  = (uv - 0.5) * 2.0;
float aspect = (uResolution.x / uResolution.y) * 0.65;

      float e      = easeInOut(uProgress);
      float shapeT = pow(e, 2.0);
      float ratio  = mix(1.1, aspect*0.85, shapeT);
      float size   = e * 1.5;

      vec2 q = vec2(p.x / ratio, p.y) / size;

      float expo = mix(2.0, 6.0, shapeT);
      float dist = pow(pow(abs(q.x), expo) + pow(abs(q.y), expo), 1.0 / expo);
      float alpha = 1.0 - smoothstep(1.0 - uSoftness, 1.0, dist);

      gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * uOpacity);
    }
  `;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER,   vsSource));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1,  -1,1,
     1,-1,  1, 1,  -1,1
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  uRes      = gl.getUniformLocation(prog, 'uResolution');
  uProgress = gl.getUniformLocation(prog, 'uProgress');
  uOpacity  = gl.getUniformLocation(prog, 'uOpacity');
  uSoftness = gl.getUniformLocation(prog, 'uSoftness');

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  renderTunnel(0);
}

window.addEventListener('resize', () => {
  if (!tunnelCanvas) return;
  tunnelCanvas.width  = window.innerWidth;
  tunnelCanvas.height = window.innerHeight;
  gl.viewport(0, 0, tunnelCanvas.width, tunnelCanvas.height);
});

function easeInOutTunnel(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}

function renderTunnel(progress, opacityOverride) {
  gl.viewport(0, 0, tunnelCanvas.width, tunnelCanvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(uRes, tunnelCanvas.width, tunnelCanvas.height);
  gl.uniform1f(uProgress, progress);
  gl.uniform1f(uOpacity, opacityOverride !== undefined ? opacityOverride : easeInOutTunnel(Math.min(progress / 0.8, 1)));
  gl.uniform1f(uSoftness, 0.28);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


function animateTunnel(onCovered) {
  cancelAnimationFrame(tunnelRaf);
  tunnelCanvas.style.pointerEvents = 'auto';
  const DURATION = 2500;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / DURATION, 1);
    renderTunnel(t);
    if (t < 1) tunnelRaf = requestAnimationFrame(step);
    else if (onCovered) onCovered();
  }
  tunnelRaf = requestAnimationFrame(step);
}

function closeTunnel(onDone) {
  cancelAnimationFrame(tunnelRaf);
  const DURATION = 1200;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / DURATION, 1);
    // juste fade out de l'opacité, forme reste en place
    renderTunnel(1, 1 - easeInOutTunnel(t));
    if (t < 1) tunnelRaf = requestAnimationFrame(step);
    else {
      tunnelCanvas.style.pointerEvents = 'none';
      renderTunnel(0, 0);
      if (onDone) onDone();
    }
  }
  tunnelRaf = requestAnimationFrame(step);
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
  stopCarousel(); 
  isCinemaMode = true;
  cinemaIntroPlayed = true;

animateTunnel();

  document.body.classList.add('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'white');
  btnPlay.style.color = 'black';
  document.getElementById('btn_home').style.opacity = '0';
  document.getElementById('btn_home').style.pointerEvents = 'none';
}

/* toggle interne après l'intro : plus de tunnel rejoué */
function setCinemaMode(enabled) {
  clearCinemaTimer();
  isCinemaMode = enabled;

  const titreHaut     = document.getElementById('titre-haut');
  const gaucheTitre   = document.querySelector('#gauche .titre');
  const btnHome       = document.getElementById('btn_home');
  const btnLang       = document.getElementById('btn-lang');
  const btnCine       = document.getElementById('btn_cine_switch');
  const listArtist    = document.getElementById('list_artist');
  const nextArtist    = document.getElementById('next_artist');
  const fullscreen    = document.getElementById('fullscreen');
  const texte         = document.getElementById('texte-oeuvre');
const infoBtn = document.getElementById('info');
  // éléments toujours visibles
  const alwaysVisible = [titreHaut, gaucheTitre, btnHome, btnLang, btnCine, listArtist, nextArtist, infoBtn];
  // éléments conditionnels — on mémorise leur état avant
const fullscreenWasVisible = fullscreenVisible;
  const texteWasVisible      = texte && texte.classList.contains('visible');
const infoBtnVisible       = infoBtn && artisteCourant !== null; // ← ici

if (enabled) {
    cinemaOverlay.classList.remove('closing');
    cinemaOverlay.style.transition = 'opacity 0.8s ease-out, box-shadow 0.8s ease-out';
    cinemaOverlay.classList.add('active');

    setTimeout(() => {
      alwaysVisible.forEach(el => {
        if (!el) return;
        setOpacity(el, '0', '0.6s');
      });
if (fullscreenWasVisible) {
  setOpacity(fullscreen, '0', '0.6s');
}
      if (texteWasVisible)      setOpacity(texte, '0', '0.6s');
      btnPlay.style.transition = 'opacity 0.6s ease';
      btnPlay.style.opacity = '0';

      setTimeout(() => {
        document.body.classList.add('cinema-mode');
        document.documentElement.style.setProperty('--p2typo', 'white');
        btnPlay.style.color = 'black';

        alwaysVisible.forEach(el => {
          if (!el) return;
          if (el === infoBtn) return;
          setOpacity(el, '1', '0.6s');
        });
if (fullscreenWasVisible) {
  fullscreen.style.transition = 'opacity 0.6s ease';
  fullscreen.style.opacity = '1';
}
        if (texteWasVisible)      setOpacity(texte, '1', '0.6s');
        btnPlay.style.opacity = hasStarted ? '0' : '1';
       if (infoBtnVisible) setOpacity(infoBtn, '1', '0.6s'); 
      }, 600);
    }, 400);
} else {
    // 1. texte fade out
   alwaysVisible.forEach(el => {
  if (!el) return;
  if (el === infoBtn) return;
  setOpacity(el, '0', '0.4s');
});
if (fullscreenWasVisible) setOpacity(fullscreen, '0', '0.8s');
if (texteWasVisible)      setOpacity(texte, '0', '0.4s');
if (infoBtnVisible) setOpacity(infoBtn, '0', '0.4s');

    // 2. noir disparaît
    document.body.classList.remove('cinema-mode');
    document.documentElement.style.setProperty('--p2typo', 'black');
    btnPlay.style.color = 'white';
    cinemaOverlay.classList.add('closing');
  fullscreen.classList.remove('force-visible');
    cinemaTransitionTimer = setTimeout(() => {
      cinemaOverlay.classList.remove('active', 'closing');
      cinemaTransitionTimer = null;

      // 3. texte réapparaît en noir
alwaysVisible.forEach(el => {
  if (!el) return;
  if (el === infoBtn) return;
  if (el === titreHaut || el === gaucheTitre || el === btnHome || el === btnCine) {
    setOpacity(el, '1', '0.8s');
  } else {
    setOpacity(el, '', '0.8s');
  }
});
if (fullscreenWasVisible) {
  fullscreen.style.transition = 'opacity 0.8s ease';
  fullscreen.style.opacity = '1';
}
if (texteWasVisible)      setOpacity(texte, '', '0.8s');
      if (infoBtnVisible) setOpacity(infoBtn, '1', '0.8s');

    }, 1200);
  }
}
// ══════════════════════════════════════════════
// ── IMAGES VIGNETTES AU SURVOL ────────────────
// ══════════════════════════════════════════════

const hoverPreviews = document.getElementById("hover-previews");

artistesIds.forEach((id, index) => {
  const artiste = artistes[id];
  const img = document.createElement("img");
  img.src        = artiste.poster;
  img.className  = "artiste-image";
  img.id         = `img-artiste-${id}`;
  img.alt        = artiste.nom;
  img.style.left = vignettePositions[index].x;
  img.style.top  = vignettePositions[index].y;
  hoverPreviews.appendChild(img);
});

let currentVisibleImg = null;
let mousoverPending = false;
let lastHoveredId = null;

artistesContainer.addEventListener('mouseover', (e) => {
  if (!e.target.classList.contains('artiste_accueil')) return;
  const id = e.target.dataset.artiste;
  if (!id || id === lastHoveredId) return; // ← même élément, on ignore

  lastHoveredId = id;

  if (mousoverPending) return; // ← un rAF est déjà en attente
  mousoverPending = true;

  requestAnimationFrame(() => {
    mousoverPending = false;
    const next = document.getElementById(`img-artiste-${lastHoveredId}`);
    if (next === currentVisibleImg) return;
    if (currentVisibleImg) currentVisibleImg.classList.remove('visible');
    next?.classList.add('visible');
    currentVisibleImg = next;
  });
});

artistesContainer.addEventListener('mouseleave', () => {
  lastHoveredId = null;
  if (currentVisibleImg) currentVisibleImg.classList.remove('visible');
  currentVisibleImg = null;
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

chargerLogo('logo/logo_pompidou.svg', document.getElementById('logo-pompidou'), 'https://www.centrepompidou.fr/fr/');
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

let cachedLoopWidth = 0;

function getCarouselLoopWidth() {
  if (!cachedLoopWidth) {
    cachedLoopWidth = carrousel.scrollWidth / 2;
  }
  return cachedLoopWidth;
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
  requestAnimationFrame(() => {
    nudgeCarousel(-e.deltaY * 0.8);
  });
}, { passive: false });

// recalcul propre si la fenêtre change de taille
window.addEventListener('resize', () => {
  cachedLoopWidth = carrousel.scrollWidth / 2;
  normalizeCarouselOffset();
  renderCarousel();
});
// ══════════════════════════════════════════════
// ── OUVERTURE PART 3 (clic sur un artiste) ────
// ══════════════════════════════════════════════

artistesContainer.addEventListener('click', (e) => {
  if (!e.target.classList.contains('artiste_accueil')) return;


setOpacity(document.getElementById('btn-lang'), '0', '0.6s');
  document.querySelector('#gauche .titre').style.opacity = '0'; 
document.getElementById('btn_home').style.opacity = '0';
document.getElementById('btn_home').style.pointerEvents = 'none';

  const id = e.target.dataset.artiste;
  artisteCourant = parseInt(id, 10);
  const data = artistes[id];
const next = getNextArtisteId(artisteCourant);

  document.getElementById('next_artist').textContent = `→ ${artistes[next].nom}`;
  if (!data) return;

document.querySelector('#gauche .titre').innerHTML = `<span class="artiste-nom">${data.nom}</span> — <span class="artiste-titre">${data.titre}</span>`;
  video.src    = data.video;
  video.poster = data.poster;
  video.load();
btnPlay.classList.add('hidden');
btnPlay.style.pointerEvents = 'none';
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
    setOpacity(document.getElementById('titre-haut'), '1', '1.5s');
setOpacity(document.getElementById('btn-lang'), '1', '1.5s');
setOpacity(document.getElementById('btn_home'), '0.8', '1.5s');
setOpacity(document.querySelector('#gauche .titre'), '1', '1.5s');
setOpacity(document.getElementById('info'), '1', '1.5s');

  document.getElementById('btn_home').style.pointerEvents = 'auto';
  part3.classList.add('part3-info1-visible');

}, 1000);

    setTimeout(() => {
      part3.classList.add('part3-video-visible');
    }, 600);


    setTimeout(() => {
      part3.classList.add('part3-info2-visible');
        btnPlay.classList.remove('hidden');
    }, 3000);

  }, 1000);
});


// ══════════════════════════════════════════════
// ── FERMETURE PART 3 (bouton home) ────────────
// ══════════════════════════════════════════════

if (btnHome) {
  btnHome.addEventListener('click', () => {
    const part3 = document.getElementById('part_3');

    // 1. Reset état
    hasStarted = false;
    video.pause();
    video.src = '';
    video.poster = '';
    info3AlreadyShown = false;
    btnPlay.textContent = translations[currentLang].playVideo;
    btnPlay.classList.remove('playing');
    btnPlay.classList.add('hidden');

    // 2. Tout disparaît en 0.6s
document.getElementById('droite').style.transition = 'opacity 0.6s ease';
document.getElementById('droite').style.opacity = '0';
document.getElementById('gauche').style.transition = 'opacity 0.6s ease';
document.getElementById('gauche').style.opacity = '0';
  document.querySelector('#gauche .titre').style.transition = 'none'; // ← ici
  document.querySelector('#gauche .titre').style.opacity = '0';    
    document.getElementById('texte-oeuvre').style.transition = 'none'; // ← ici
  document.getElementById('texte-oeuvre').style.opacity = '0';   
setOpacity(document.getElementById('btn_home'), '0', '0.6s');
setOpacity(document.getElementById('btn-lang'), '0', '0.6s');
setOpacity(document.getElementById('titre-haut'), '0', '0.6s');
setOpacity(document.getElementById('btn_cine_switch'), '0', '0.6s');    

    if (isFullscreen) {
      document.exitFullscreen();
      isFullscreen = false;
    }

    // 3. Après 0.6s — reset part3 + fond noir se dissipe en 1s
setTimeout(() => {
  // 1. classes d'abord
  ['visible', 'part3-video-visible', 'part3-info1-visible', 'part3-info2-visible', 'part3-info3-visible']
    .forEach(c => part3.classList.remove(c));
  hideInfo3();
  
  // 2. puis reset inline
  document.getElementById('droite').style.transition = '';
  document.getElementById('droite').style.opacity = '';
  document.getElementById('gauche').style.transition = '';
  document.getElementById('gauche').style.opacity = '';
    document.getElementById('info').style.transition = 'none';
  document.getElementById('info').style.opacity = '0';

  // 3. reste
  fullscreenBtn.style.opacity = '0';
  fullscreenBtn.style.display = 'none';
  fullscreenVisible = false;  
  btnRestart.style.opacity = '0';
  document.getElementById('btn-lang').classList.remove('nav_link');
  document.getElementById('btn_home').style.transition = 'none';
  document.getElementById('btn_home').style.opacity = '0';
  document.getElementById('btn_home').style.pointerEvents = 'none';
  document.getElementById('btn_cine_switch').style.transition = 'opacity 0.6s ease';
document.getElementById('btn_cine_switch').style.opacity = '0';
  exitCinemaMode();
}, 600);

    // 4. Après 0.6s + 1s — réapparition page 1
    setTimeout(() => {
      editor.classList.remove('hidden-content');
      artistesContainer.classList.remove('hidden-content');
      logosContainer.classList.remove('hidden-content');
      about.classList.remove('hidden-content');
      startCarousel();
setOpacity(document.getElementById('btn-lang'), '1', '1.5s');
setOpacity(document.getElementById('btn_cine_switch'), '1', '1.5s');

  document.getElementById('btn_cine_switch').style.transition = 'opacity 1.5s ease'; // ← ici
  document.getElementById('btn_cine_switch').style.opacity = '1';    
    }, 1200);

  });
}

document.getElementById('titre-haut').addEventListener('click', () => {
  btnHome.click();
});
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
                fullscreenVisible = true;
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
  texte.style.transition = '';
  texte.style.opacity = ''; 
  info.textContent = texte.classList.contains('visible') ? '–' : '+';
  texteWrapper.classList.toggle('visible', texte.classList.contains('visible'));

  if (texte.classList.contains('visible')) {
    setTimeout(() => {
      showInfo3();
      setOpacity(document.getElementById('btn_cine_switch'), '1', '0.8s');
    }, 1500);
  } else {
    setOpacity(document.getElementById('btn_cine_switch'), '0', '0.8s');
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
document.querySelector('#gauche .titre').style.transition = 'none';
document.querySelector('#gauche .titre').style.opacity = '0';
document.querySelector('#gauche .titre').innerHTML = `<span class="artiste-nom">${data.nom}</span> — <span class="artiste-titre">${data.titre}</span>`;
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
fullscreenVisible = true;
    } else {
      fullscreenBtn.style.display = 'none';
      fullscreenBtn.style.opacity = '0';
      fullscreenVisible = false;
    }

    const next2 = getNextArtisteId(next);
    document.getElementById('next_artist').textContent = `→ ${artistes[next2].nom}`;

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


function exitCinemaMode() {
  clearCinemaTimer();
  isCinemaMode = false;
  cinemaIntroPlayed = false;
  document.body.classList.remove('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'black');
  btnPlay.style.color = 'white';
closeTunnel();
}


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
boiteAbout.style.width = currentLang === "FR" ? "90px" : "70px";
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    boiteAbout.style.width = "";
  });
});
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
document.querySelector('#gauche .titre').innerHTML = `<span class="artiste-nom">${data.nom}</span> — <span class="artiste-titre">${data.titre}</span>`;
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
      fullscreenVisible = true;
    } else {
      fullscreenBtn.style.display = 'none';
      fullscreenBtn.style.opacity = '0';
      fullscreenVisible = false;
    }

const next2 = getNextArtisteId(id);
    nextArtistBtn.textContent = `→ ${artistes[next2].nom}`;

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



