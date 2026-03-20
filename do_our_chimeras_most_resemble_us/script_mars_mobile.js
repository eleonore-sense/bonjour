/* ══════════════════════════════════════════════
   SCRIPT_MARS_MOBILE.JS
   ══════════════════════════════════════════════ */


// ══════════════════════════════════════════════
// ── WAVE MOBILE
// ══════════════════════════════════════════════

const mobileWavePaths = [
  document.getElementById('m-wave1'),
  document.getElementById('m-wave2'),
  document.getElementById('m-wave3'),
  document.getElementById('m-wave4'),
  document.getElementById('m-wave5'),
];

const mobileWaveLines = [
  { amplitude: 16, frequency: 2   },
  { amplitude: 13, frequency: 4   },
  { amplitude: 12, frequency: 2.5 },
  { amplitude: 15, frequency: 3   },
  { amplitude: 10, frequency: 2   },
];

const mobileVbW = 283.13;
const mobileVbH = [33.46, 37.07, 32.36, 41.53, 33.76];

function generateMobileWavyPath(index, progress) {
  const { amplitude, frequency } = mobileWaveLines[index];
  const vbH = mobileVbH[index];
  const midY = vbH / 2;
  const amp = amplitude * progress;

  let d = `M0 ${midY}`;
  for (let i = 1; i <= 60; i++) {
    const x = (i / 60) * mobileVbW;
    const offset = Math.sin((i / 60) * Math.PI * frequency) * amp;
    d += ` L${x} ${midY + offset}`;
  }
  return d;
}

function updateMobileWavePaths() {
  mobileWavePaths.forEach((p, i) => {
    if (p) p.setAttribute('d', generateMobileWavyPath(i, glitchProgress));
  });
}

// NOTE : ajouter dans updatePaths() de script_mars.js :
//   if (typeof updateMobileWavePaths === 'function') updateMobileWavePaths();


// ══════════════════════════════════════════════
// ── UTILS
// ══════════════════════════════════════════════

function isMobile() {
  return window.innerWidth <= 768;
}


// ══════════════════════════════════════════════
// ── LISTE ARTISTES MOBILE
// ══════════════════════════════════════════════

function initMobileArtistsList() {
  if (!isMobile()) return;

  const btnSee = document.createElement('button');
  btnSee.id = 'mobile-see-artists';
  btnSee.textContent = 'artists';
  document.body.appendChild(btnSee);

  const list = document.createElement('div');
  list.id = 'mobile-artists-list';

  Object.entries(artistes).forEach(([id, data]) => {
    const item = document.createElement('span');
    item.className = 'mobile-artist-item';
    item.dataset.artiste = id;
    item.textContent = data.nom;
    list.appendChild(item);
  });

  document.body.appendChild(list);

  btnSee.addEventListener('click', () => {
    // toggle : si liste visible → fermer
    if (list.classList.contains('visible')) {
      closeMobileList();
      return;
    }

    // ouvrir
    list.classList.add('visible');
    document.getElementById('editor-mobile')?.classList.add('appearing');
    document.getElementById('editor-mobile')?.style.setProperty('opacity', '0');
    document.getElementById('logos-container')?.style.setProperty('opacity', '0');
    document.getElementById('about')?.style.setProperty('opacity', '0');
    document.getElementById('titre-haut')?.style.setProperty('opacity', '1');
    document.documentElement.style.setProperty('--p2typo', 'black');

    btnSee.textContent = 'close artists list';
    btnSee.style.fontSize = '1em';

    updateMobileActiveItem();
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.mobile-artist-item');
    if (!item) return;
    const id = parseInt(item.dataset.artiste, 10);
    if (!id) return;
    closeMobileList();
    openArtisteMobile(id);
  });
}

function closeMobileList() {
  const list   = document.getElementById('mobile-artists-list');
  const btnSee = document.getElementById('mobile-see-artists');

  if (list) list.classList.remove('visible');

  document.getElementById('editor-mobile')?.classList.add('appearing');
  document.getElementById('editor-mobile')?.style.setProperty('opacity', '1');
  document.getElementById('logos-container')?.style.setProperty('opacity', '1');
  document.getElementById('about')?.style.setProperty('opacity', '1');
  document.getElementById('titre-haut')?.style.setProperty('opacity', '0');
  document.documentElement.style.setProperty('--p2typo', 'white');

  if (btnSee) {
    btnSee.textContent = 'artists';
    btnSee.style.fontSize = '';
  }
}

function updateMobileActiveItem() {
  const list = document.getElementById('mobile-artists-list');
  if (!list) return;
  list.querySelectorAll('.mobile-artist-item').forEach(el => {
    const id = parseInt(el.dataset.artiste, 10);
    el.classList.toggle('active', id === artisteCourant);
  });
}


// ══════════════════════════════════════════════
// ── OUVERTURE ARTISTE MOBILE
// ══════════════════════════════════════════════

function openArtisteMobile(id) {
  const data = artistes[id];
  if (!data) return;

  artisteCourant = id;
  const part3 = document.getElementById('part_3');
  const isPart3Visible = part3.classList.contains('visible');

  if (!isPart3Visible) {
    document.querySelector('#gauche .titre').textContent = `${data.nom} — ${data.titre}`;
    video.src    = data.video;
    video.poster = data.poster;
    video.load();

document.getElementById('texte-oeuvre').textContent = data.text;
    document.getElementById('texte-oeuvre').classList.remove('visible');

    if (!info3AlreadyShown) hideInfo3();

    editor.classList.add('hidden-content');
    document.getElementById('editor-mobile')?.classList.add('hidden-content');
    artistesContainer.classList.add('hidden-content');
    logosContainer.classList.add('hidden-content');
    about.classList.add('hidden-content');

    const btnSee = document.getElementById('mobile-see-artists');
    if (btnSee) btnSee.classList.add('hidden-content');

    // Stopper le slideshow
    if (mobileSlideshowTimer) clearTimeout(mobileSlideshowTimer);
document.getElementById('mobile-bg-1')?.classList.remove('visible');
document.getElementById('mobile-bg-2')?.classList.remove('visible');
    enterCinemaFromHome();
document.getElementById('btn-lang').classList.add('nav_link');
const next = getNextArtisteId(id);
    document.getElementById('next_artist').textContent = `> ${artistes[next].nom}`;

    setTimeout(() => {
      part3.classList.add('visible');
      setTimeout(() => { document.getElementById('titre-haut').style.opacity = '1'; }, 50);
      setTimeout(() => { part3.classList.add('part3-video-visible'); }, 600);
      setTimeout(() => { part3.classList.add('part3-info1-visible'); }, 1200);
      setTimeout(() => {
        part3.classList.add('part3-info2-visible');
        btnPlay.style.opacity = '1';
        btnPlay.style.pointerEvents = 'auto';
      }, 3000);
    }, 1000);

  } else {
    video.style.transition = 'opacity 0.5s ease';
    video.style.opacity = '0';
    const titre = document.querySelector('#gauche .titre');
    titre.style.transition = 'opacity 0.5s ease';
    titre.style.opacity = '0';

    setTimeout(() => {
document.querySelector('#gauche .titre').innerHTML = `<span class="artiste-nom">${data.nom}</span> — <span class="artiste-titre">${data.titre}</span>`;
      video.src = data.video;
      video.poster = data.poster;
      video.load();
      document.getElementById('texte-oeuvre').textContent = data.text;

      hasStarted = false;
      btnPlay.textContent = 'Play Video';
      btnPlay.classList.remove('playing');

      if (!info3AlreadyShown) hideInfo3();
      if (info3AlreadyShown) showInfo3();

const next = getNextArtisteId(id);
      document.getElementById('next_artist').textContent = `${artistes[next].nom}`;

      video.style.transition = 'opacity 0.8s ease';
      video.style.opacity = '1';
      titre.style.transition = 'opacity 0.8s ease';
      titre.style.opacity = '1';

      if (!fullscreenUnlocked) btnPlay.style.opacity = '1';
    }, 500);
  }
}


// ══════════════════════════════════════════════
// ── RETOUR ACCUEIL MOBILE
// ══════════════════════════════════════════════

btnHome.addEventListener('click', () => {
  if (!isMobile()) return;

  const btnSee     = document.getElementById('mobile-see-artists');
  const editorMob  = document.getElementById('editor-mobile');
  const logosCont  = document.getElementById('logos-container');

  if (btnSee)    btnSee.classList.remove('hidden-content');
  if (editorMob) editorMob.classList.remove('hidden-content');
  if (logosCont) logosCont.style.opacity = '1';

  // Relancer le slideshow
  document.getElementById('btn-lang').classList.remove('nav_link');
  mobileSlideshowIndex = 0;
  initMobileSlideshow();
});


// ══════════════════════════════════════════════
// ── TITRE HAUT MOBILE (2 lignes)
// ══════════════════════════════════════════════

if (isMobile()) {
if (currentLang === 'FR') {
  document.getElementById('titre-haut').innerHTML = 'Nos Chimères sont-Elles <br>Ce Qui Nous Ressemble<br>Le Mieux\u00a0?';
  document.getElementById('titre-haut').style.fontSize = '2.8em';
} else {
  document.getElementById('titre-haut').innerHTML = 'Do Our Chimeras<br>Most Resemble Us?';
  document.getElementById('titre-haut').style.fontSize = '';
}}


// ══════════════════════════════════════════════
// ── SLIDESHOW BACKGROUND MOBILE
// ══════════════════════════════════════════════

let mobileSlideshowIndex = 0;
let mobileSlideshowActive = 1;
let mobileSlideshowTimer = null;

const artisteIds = Object.keys(artistes).map(Number).sort(() => Math.random() - 0.5);
function initMobileSlideshow() {
  if (!isMobile()) return;

  // Créer les calques seulement s'ils n'existent pas encore
  if (!document.getElementById('mobile-bg-1')) {
    const layerA = document.createElement('img');
    layerA.id = 'mobile-bg-1';
    layerA.className = 'mobile-bg-layer';
    document.body.appendChild(layerA);

    const layerB = document.createElement('img');
    layerB.id = 'mobile-bg-2';
    layerB.className = 'mobile-bg-layer';
    document.body.appendChild(layerB);
  }

  showNextMobileSlide();
}

function getMobileBgLayer(n) {
  return document.getElementById(`mobile-bg-${n}`);
}

function showNextMobileSlide() {
  const id = artisteIds[mobileSlideshowIndex % artisteIds.length];
  const data = artistes[id];
  if (!data) return;

  const next         = mobileSlideshowActive === 1 ? 2 : 1;
  const nextLayer    = getMobileBgLayer(next);
  const currentLayer = getMobileBgLayer(mobileSlideshowActive);

  if (!nextLayer || !currentLayer) return;

  nextLayer.src = data.poster;
  nextLayer.dataset.artiste = id;


const randX = Math.random() * 55; // 0% à 55% pour éviter débordement
const randY = Math.random() * 55;
nextLayer.style.left = randX + 'vw';
nextLayer.style.top  = randY + 'vh';
  nextLayer.classList.add('visible');
  setTimeout(() => {
    currentLayer.classList.remove('visible');
  }, 400);

  updateMobileListHighlight(id);

  mobileSlideshowActive = next;
  mobileSlideshowIndex++;

  mobileSlideshowTimer = setTimeout(showNextMobileSlide, 3000);
}

function updateMobileListHighlight(activeId) {
  const list = document.getElementById('mobile-artists-list');
  if (!list) return;

  list.querySelectorAll('.mobile-artist-item').forEach(el => {
    const id = parseInt(el.dataset.artiste, 10);
    el.classList.toggle('bg-highlighted', id === activeId);
  });
}


// ══════════════════════════════════════════════
// ── FULLSCREEN MOBILE
// ══════════════════════════════════════════════

if (isMobile()) {
  const btnFs = document.getElementById('fullscreen');
  if (btnFs) {
    video.addEventListener('play', () => {
      setTimeout(() => {
        btnFs.style.position = 'fixed';
        btnFs.style.bottom = '16px';
        btnFs.style.left = '20px';
        btnFs.style.right = 'auto';
        btnFs.style.transform = 'none';
        btnFs.style.display = 'block';
        btnFs.style.opacity = '1';
        btnFs.style.pointerEvents = 'auto';
      }, 2000);
    });

    video.addEventListener('pause', () => {
      btnFs.style.opacity = '0';
      btnFs.style.pointerEvents = 'none';
    });
  }
}

// ══════════════════════════════════════════════
// ── SCROLL MASK VIDÉO
// ══════════════════════════════════════════════

function initMobileScrollMask() {
  if (!isMobile()) return;

  const part3 = document.getElementById('part_3');
  if (!part3) return;

  part3.addEventListener('scroll', () => {
    const scrollY = part3.scrollTop;
    const videoContainer = document.getElementById('video-container');
    if (!videoContainer) return;

    const videoH = videoContainer.offsetHeight;

    // progress : 0 = pas scrollé, 1 = vidéo complètement masquée
    const progress = Math.min(scrollY / videoH, 1);

    // masque qui monte par le bas
    const maskStop = Math.round((1 - progress) * 100);
    videoContainer.style.webkitMaskImage = 
      `linear-gradient(to top, black 0%, black ${maskStop}%, transparent ${maskStop + 5}%)`;
    videoContainer.style.maskImage = 
      `linear-gradient(to top, black 0%, black ${maskStop}%, transparent ${maskStop + 5}%)`;
  });
}

initMobileScrollMask();



// ══════════════════════════════════════════════
// ── INIT
// ══════════════════════════════════════════════

initMobileArtistsList();
initMobileSlideshow();
