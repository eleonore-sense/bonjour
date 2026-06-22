/* ══════════════════════════════════════════════
   SCRIPT_MARS_MOBILE.JS
   ══════════════════════════════════════════════ */

console.log('script_mobile.js démarre, currentLang =', typeof currentLang !== 'undefined' ? currentLang : 'PAS ENCORE DEFINI');
// ══════════════════════════════════════════════
// ── WAVE MOBILE
// ══════════════════════════════════════════════

const mobileWaveLines = [
  { amplitude: 16, frequency: 2   },
  { amplitude: 13, frequency: 4   },
  { amplitude: 12, frequency: 2.5 },
  { amplitude: 15, frequency: 3   },
  { amplitude: 10, frequency: 2   },
];


// ══════════════════════════════════════════════
// ── UTILS
// ══════════════════════════════════════════════

function isMobile() {
  return window.innerWidth <= 768;
}


// ══════════════════════════════════════════════
// ── LISTE ARTISTES MOBILE
// ══════════════════════════════════════════════

function setTransitionFor(ids, duration) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.transition = `opacity ${duration} ease`;
  });
}


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
setTransitionFor(['editor-mobile', 'logos-container', 'btn-lang', 'about'], '1s');

void document.body.offsetHeight;
list.classList.add('visible');
    document.body.classList.add('artists-list-open'); 

    const editorMobile = document.getElementById('editor-mobile');
    editorMobile?.classList.add('appearing');
    editorMobile?.style.setProperty('opacity', '0');

    document.getElementById('logos-container')?.style.setProperty('opacity', '0');
    document.getElementById('btn-lang')?.style.setProperty('opacity', '0');
    document.getElementById('about')?.style.setProperty('opacity', '0');
    document.documentElement.style.setProperty('--p2typo', 'black');

setTimeout(() => {
  setTransitionFor(['titre-haut'], '1.2s');
  document.getElementById('titre-haut')?.style.setProperty('opacity', '1');
}, 500);


    btnSee.textContent = 'close artists list';
    btnSee.style.fontSize = '1em';

    updateMobileActiveItem();
  });

  list.addEventListener('click', (e) => {
    const item = e.target.closest('.mobile-artist-item');
    if (!item) return;

    const id = parseInt(item.dataset.artiste, 10);
    if (!id) return;

    closeMobileListOnly();
    openArtisteMobile(id);
  });
}


function closeMobileListOnly() {
  const list = document.getElementById('mobile-artists-list');
  const btnSee = document.getElementById('mobile-see-artists');

  setTransitionFor(['titre-haut'], '1s');

  void document.body.offsetHeight;
  list?.classList.remove('visible');
  document.body.classList.remove('artists-list-open'); 
  document.getElementById('titre-haut')?.style.setProperty('opacity', '0');

  if (btnSee) {
    btnSee.textContent = 'artists';
    btnSee.style.fontSize = '';
  }
}

function closeMobileList() {
  closeMobileListOnly();

  setTimeout(() => {
    setTransitionFor(['editor-mobile', 'logos-container', 'btn-lang', 'about'], '1.5s');
    const editorMobile = document.getElementById('editor-mobile');
    editorMobile?.classList.add('appearing');
    editorMobile?.style.setProperty('opacity', '1');
    document.getElementById('logos-container')?.style.setProperty('opacity', '1');
    document.getElementById('btn-lang')?.style.setProperty('opacity', '1');
    document.getElementById('about')?.style.setProperty('opacity', '1');
  }, 700);
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
    btnPlay.classList.remove('hidden');
    btnPlay.style.transition = 'none';
    btnPlay.style.opacity = '0';
    btnPlay.style.pointerEvents = 'none';

const titreEl = document.querySelector('#gauche .titre');
const detailsM1 = currentLang === "FR" && data.detailsFR ? data.detailsFR : data.details;
titreEl.innerHTML = formatTitreArtiste(data.nom, data.titre, titreEl, detailsM1);
    recalcTitreHeight();
    document.body.classList.add('part3-active');
loadArtistMedia(data);
    const fullscreenBtnMobile = document.getElementById('fullscreen');
    if (fullscreenBtnMobile) {
      fullscreenBtnMobile.style.opacity = '0';
      fullscreenBtnMobile.style.pointerEvents = 'none';
    }
    document.getElementById('texte-oeuvre').textContent = data.text;
    document.getElementById('texte-oeuvre').classList.remove('visible');
    if (!info3AlreadyShown) hideInfo3Mobile();
    editor.classList.add('hidden-content');
    document.getElementById('editor-mobile')?.classList.add('hidden-content');
    artistesContainer.classList.add('hidden-content');
    logosContainer.classList.add('hidden-content');
    about.classList.add('hidden-content');
    const btnSee = document.getElementById('mobile-see-artists');
    if (btnSee) btnSee.classList.add('hidden-content');
    if (mobileSlideshowTimer) clearTimeout(mobileSlideshowTimer);
    document.getElementById('mobile-bg-1')?.classList.remove('visible');
    document.getElementById('mobile-bg-2')?.classList.remove('visible');
    enterCinemaFromHomeMobile();
    document.getElementById('btn-lang').classList.add('nav_link');
    const next = getNextArtisteId(id);
    document.getElementById('next_artist').textContent = `→ ${artistes[next].nom}`;
setTimeout(() => {
      part3.classList.add('visible');
      initMobileScrollMask();
      if (typeof recalcTopButtonsHeight === 'function') recalcTopButtonsHeight();
      setTimeout(() => { part3.classList.add('part3-video-visible'); }, 600);
      setTimeout(() => { 
        part3.classList.add('part3-info1-visible'); 
        setOpacity(document.getElementById('info'), '1', '1s');
        const btnHomeEl = document.getElementById('btn_home');
        btnHomeEl.style.pointerEvents = 'auto';
      }, 1200);
      setTimeout(() => {
        part3.classList.add('part3-info2-visible');
        btnPlay.style.transition = '';
        btnPlay.style.opacity = '1';
        btnPlay.style.pointerEvents = 'auto';
      }, 3000);
    }, 1000);
  } else {
    video.style.transition = 'opacity 0.5s ease';
    video.style.opacity = '0';
    if (window.recalcTitreStartY) window.recalcTitreStartY();
    titre.style.transition = 'opacity 0.5s ease';
    titre.style.opacity = '0';
    setTimeout(() => {
const titreEl2 = document.querySelector('#gauche .titre');
const detailsM2 = currentLang === "FR" && data.detailsFR ? data.detailsFR : data.details;
titreEl2.innerHTML = formatTitreArtiste(data.nom, data.titre, titreEl2, detailsM2);
loadArtistMedia(data);
      document.getElementById('texte-oeuvre').textContent = data.text;
      hasStarted = false;
      btnPlay.textContent = 'Play Video';
      btnPlay.classList.remove('playing');
      if (!info3AlreadyShown) hideInfo3Mobile();
      if (info3AlreadyShown) showInfo3Mobile();
      const next = getNextArtisteId(id);
      document.getElementById('next_artist').textContent = `→ ${artistes[next].nom}`;
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

  document.body.classList.remove('part3-active');
  document.body.classList.remove('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'black');

  const btnSee     = document.getElementById('mobile-see-artists');
  const editorMob  = document.getElementById('editor-mobile');
  const logosCont  = document.getElementById('logos-container');

  if (btnSee)    btnSee.classList.remove('hidden-content');
  if (editorMob) {
    editorMob.classList.remove('hidden-content');
    editorMob.style.opacity = '1';
  }
  if (logosCont) logosCont.style.opacity = '1';

  // Reset texte-oeuvre et bouton info
  const texteOeuvreEl = document.getElementById('texte-oeuvre');
  const infoBtnEl = document.getElementById('info');
  if (texteOeuvreEl) {
    texteOeuvreEl.classList.remove('visible');
    texteOeuvreEl.style.opacity = '';
  }
  if (infoBtnEl) infoBtnEl.textContent = '+';

  // Reset bouton play — sinon il garde son état de la session précédente
  btnPlay.style.opacity = '';
  btnPlay.style.pointerEvents = '';
  document.getElementById('part_3')?.classList.remove('part3-info2-visible');

  document.getElementById('btn-lang').classList.remove('nav_link');
  mobileSlideshowIndex = 0;
  initMobileSlideshow();
});



// ══════════════════════════════════════════════
// ── SLIDESHOW BACKGROUND MOBILE
// ══════════════════════════════════════════════

let mobileSlideshowIndex = 0;
let mobileSlideshowActive = 1;
let mobileSlideshowTimer = null;

const artisteIds = Object.keys(artistes).map(Number).sort(() => Math.random() - 0.5);


function initMobileSlideshow() {
  if (!isMobile()) return;

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

function recalcTitreHeight() {
  const part3 = document.getElementById('part_3');
  const titreEl = document.querySelector('#gauche .titre');
  const infoEl  = document.getElementById('info');
  if (!part3 || !titreEl || !infoEl) return;

  const titreH = titreEl.offsetHeight;
  const infoH  = infoEl.offsetHeight;

  part3.style.setProperty('--titre-h', titreH + 'px');
  part3.style.setProperty('--titre-total-h', (titreH + infoH) + 'px');
}


function recalcTopButtonsHeight() {
  if (!isMobile()) return;
  const topButtons = document.getElementById('top-right-buttons');
  const droite = document.getElementById('droite');
  if (!topButtons || !droite) return;

  const rect = topButtons.getBoundingClientRect();
  const safeBottom = rect.bottom + 16; // 16px de marge de sécurité

  // on ne descend jamais en dessous de 22vh (comportement d'origine sur grand écran)
  const minPadding = window.innerHeight * 0.22;
  const finalPadding = Math.max(minPadding, safeBottom);

  droite.style.paddingTop = finalPadding + 'px';
}




function initMobileScrollMask() {
  if (!isMobile()) return;

  const part3 = document.getElementById('part_3');
  if (!part3) return;

  const titreEl = document.querySelector('#gauche .titre');
  recalcTitreHeight();

  let lastScrollY = 0;

  function calcSeuilScroll() {
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const emPx = 0.6 * remPx;
    const vh22 = window.innerHeight * 0.22;
    return vh22 + emPx;
  }

  let seuilScrollDynamic = calcSeuilScroll();

  // ── CACHE des valeurs coûteuses ──
  const texteOeuvre = document.getElementById('texte-oeuvre');
  let cachedTexteHeight = texteOeuvre ? texteOeuvre.offsetHeight : 0;
  let cachedRectTop = texteOeuvre ? texteOeuvre.getBoundingClientRect().top : 0;

function updateTexteMask() {
  if (!texteOeuvre) return;

  const scrollY = part3.scrollTop;
  const h = window.innerHeight;
  
  // MASK HAUT
  const seuilScroll = seuilScrollDynamic + 160;
  const hidden = Math.max(0, scrollY - seuilScroll);
  const fadeEnd = hidden + h * 0.05;

  // MASK BAS — identique à avant, inchangé
  const fadeHeightPx = 100;
  const hiddenZonePx = 40;
  const rect = texteOeuvre.getBoundingClientRect();
  const bottomStartPx = (window.innerHeight - hiddenZonePx - fadeHeightPx) - rect.top;
  const bottomEndPx   = (window.innerHeight - hiddenZonePx) - rect.top;
  const q1Px = bottomStartPx + (bottomEndPx - bottomStartPx) * 0.5;
  const q2Px = bottomStartPx + (bottomEndPx - bottomStartPx) * 0.75;
  const q3Px = bottomStartPx + (bottomEndPx - bottomStartPx) * 0.9;

  const texteHeight = texteOeuvre.offsetHeight;
  const toPercent = (px) => Math.max(0, Math.min(100, (px / texteHeight) * 100));

  const bottomStartPct = toPercent(bottomStartPx);
  const bottomQ1Pct    = toPercent(q1Px);
  const bottomQ2Pct    = toPercent(q2Px);
  const bottomQ3Pct    = toPercent(q3Px);
  const bottomEndPct   = toPercent(bottomEndPx);

  texteOeuvre.style.webkitMaskImage = `linear-gradient(to bottom,
    transparent 0px,
    transparent ${hidden}px,
    black ${fadeEnd}px,
    black ${bottomStartPct}%,
    rgba(0,0,0,0.9) ${bottomQ1Pct}%,
    rgba(0,0,0,0.55) ${bottomQ2Pct}%,
    rgba(0,0,0,0.18) ${bottomQ3Pct}%,
    transparent ${bottomEndPct}%
  )`;
  texteOeuvre.style.maskImage = texteOeuvre.style.webkitMaskImage;
}
  updateTexteMask();

  let scrollRafPending = false;

  part3.addEventListener('scroll', () => {
    if (!info3AlreadyShown) {
      part3.scrollTop = 0;
      return;
    }

    if (scrollRafPending) return;
    scrollRafPending = true;

    requestAnimationFrame(() => {
      scrollRafPending = false;
      const scrollY = part3.scrollTop;

      updateTexteMask();

      const videoContainer = document.getElementById('video-container');
      if (!videoContainer) return;

      const videoH = videoContainer.offsetHeight;
      const videoProgress = Math.min(scrollY / videoH, 1);
      const maskStop = Math.round((1 - videoProgress) * 100);
      videoContainer.style.webkitMaskImage =
        `linear-gradient(to top, black 12%, black ${maskStop}%, transparent ${maskStop + 20}%)`;
      videoContainer.style.maskImage =
        `linear-gradient(to top, black 12%, black ${maskStop}%, transparent ${maskStop + 20}%)`;

      const btnLang = document.getElementById('btn-lang');
      const btnHome = document.getElementById('btn_home');
      const btnCine = document.getElementById('btn_cine_switch');

      if (scrollY > lastScrollY) {
        setOpacity(btnLang, '0.75', '0.4s');
        setOpacity(btnHome, '0.75', '0.4s');
        setOpacity(btnCine, '0.75', '0.4s');
      } else {
        setOpacity(btnLang, '1', '0.4s');
        setOpacity(btnHome, '1', '0.4s');
        setOpacity(btnCine, '1', '0.4s');
      }
      lastScrollY = scrollY;
    });
  });

  window.recalcTitreStartY = () => {
    if (titreEl) titreStartY = titreEl.getBoundingClientRect().top + part3.scrollTop;
  };
}


function getMobileBgLayer(n) {
  return document.getElementById(`mobile-bg-${n}`);
}


function getFarPosition(prevX, prevY, minDist = 35, margin = 5) {
  const vw = window.innerWidth / 100;
  const vh = window.innerHeight / 100;
  const maxRange = 55 - margin;
  let x, y;
  do {
    x = margin + Math.random() * (maxRange - margin);
    y = margin + Math.random() * (maxRange - margin);
  } while (Math.hypot((x - prevX) * vw, (y - prevY) * vh) < minDist * vw);
  return { x, y };
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


const prevX = parseFloat(currentLayer.style.left) || 0;
const prevY = parseFloat(currentLayer.style.top) || 0;
const { x: randX, y: randY } = getFarPosition(prevX, prevY);

nextLayer.style.left = randX + 'vw';
nextLayer.style.top  = randY + 'vh';
void nextLayer.offsetHeight; // force reflow
  nextLayer.classList.add('visible');
  setTimeout(() => {
    currentLayer.classList.remove('visible');
  }, 700);

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

const btnFs = document.getElementById('fullscreen');

function onMobileVideoPlay() {
  if (!btnFs) return;
  document.getElementById('next_artist')?.classList.remove('visible');
  document.getElementById('list_artist')?.classList.remove('visible');

  setTimeout(() => {
    if (videoWrapper.classList.contains('pseudo-fullscreen')) return;

    btnFs.style.position = 'fixed';
    btnFs.style.bottom = '0px';
    btnFs.style.left = '50%';
    btnFs.style.right = 'auto';
    btnFs.style.transform = 'translateX(-50%)';
    btnFs.style.display = 'block';
    btnFs.style.opacity = '1';
    btnFs.style.pointerEvents = 'auto';
  }, 2000);
}

function onMobileVideoPause() {
  if (!btnFs) return;
  btnFs.style.opacity = '0';
  btnFs.style.pointerEvents = 'none';
  document.getElementById('next_artist')?.classList.add('visible');
  document.getElementById('list_artist')?.classList.add('visible');
}

if (isMobile() && btnFs) {
  video.addEventListener('play', onMobileVideoPlay);
  video.addEventListener('pause', onMobileVideoPause);
}


// ══════════════════════════════════════════════
// ── TAP POUR AFFICHER PLAY/PAUSE (MOBILE)
// ══════════════════════════════════════════════



if (isMobile()) {
  video.addEventListener('click', (e) => {
    if (e.target.closest('#btn-play')) return;
    if (!hasStarted) {
      handlePlayPauseClick(e);
      return;
    }
    showBtnMobile();
  });

  // Overlay tactile pour Vimeo (l'iframe bloque la propagation du clic)
  const vimeoTapOverlay = document.createElement('div');
  vimeoTapOverlay.id = 'vimeo-tap-overlay';
  vimeoTapOverlay.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 5;
    display: none;
  `;
  videoWrapper.appendChild(vimeoTapOverlay);

  vimeoTapOverlay.addEventListener('click', () => {
    showBtnMobile();
    vimeoTapOverlay.style.pointerEvents = 'none';
    setTimeout(() => {
      vimeoTapOverlay.style.pointerEvents = 'auto';
    }, 300);
  });

  function toggleVimeoOverlay() {
    const data = artistes[artisteCourant];
    vimeoTapOverlay.style.display = (data?.vimeo && hasStarted) ? 'block' : 'none';
  }
  window.toggleVimeoOverlay = toggleVimeoOverlay;
}

// ══════════════════════════════════════════════
// ── ENTRER MODE CINE MOBILE
// ══════════════════════════════════════════════

function enterCinemaFromHomeMobile() {
  const titreHaut = document.getElementById('titre-haut');
  const titreGauche = document.querySelector('#gauche .titre');

  titreHaut.style.transition = 'opacity 0.5s ease';
  titreGauche.style.transition = 'opacity 0.5s ease';
  titreHaut.style.opacity = '0';
  titreGauche.style.opacity = '0';
  void titreHaut.offsetHeight;

  clearCinemaTimer();
  stopCarousel();
  isCinemaMode = true;
  cinemaIntroPlayed = true;

  animateTunnel();

  btnPlay.style.color = 'black';
  document.getElementById('btn_home').style.opacity = '0';
  document.getElementById('btn_home').style.pointerEvents = 'none';

setTimeout(() => {
  document.body.classList.add('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'white');
  requestAnimationFrame(() => {
    titreHaut.style.transition = 'opacity 0.7s ease';
    titreGauche.style.transition = 'opacity 0.7s ease';

    void titreHaut.offsetHeight;
    titreHaut.style.opacity = '1';
    titreGauche.style.opacity = '1';
  });
}, 2500);
}


function initTunnelMobile() {
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
      float aspect = max(uResolution.x / uResolution.y, uResolution.y / uResolution.x) * 0.65;

      float e      = easeInOut(uProgress);
      float shapeT = pow(e, 2.0);
      float ratio  = mix(1.1, aspect*0.85, shapeT);
      float size   = e * 2.0;

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




// ══════════════════════════════════════════════
// ── GERER BOUTON MODE CINE
// ══════════════════════════════════════════════


function showInfo3Mobile() {
  const inPseudoFullscreen = videoWrapper.classList.contains('pseudo-fullscreen');

  document.querySelectorAll('.info3').forEach(el => {
    el.classList.add('visible');
  });

  if (!inPseudoFullscreen) {
    btnHome.style.opacity = '1';
    setOpacity(document.getElementById('btn_cine_switch'), '1', '1s');
    document.getElementById('btn-lang').style.opacity = '1';

    // après une sortie du pseudo-fullscreen pendant la lecture, next_artist
    // était resté caché : on le fait réapparaître si le panneau info est ouvert
    const texteOeuvre = document.getElementById('texte-oeuvre');
    if (texteOeuvre && texteOeuvre.classList.contains('visible')) {
      setOpacity(document.getElementById('next_artist'), '1', '0.6s');
    }
  }

  info3AlreadyShown = true;
}

function hideInfo3Mobile() {
  document.querySelectorAll('.info3').forEach(el => {
    el.classList.remove('visible');
  });
  btnHome.style.opacity = '0.8';
  setOpacity(document.getElementById('btn_cine_switch'), '0', '1s');
  document.getElementById('btn-lang').style.opacity = '0';
}



// ══════════════════════════════════════════════
// ── INIT
// ══════════════════════════════════════════════

initMobileArtistsList();
setTimeout(() => {
  initMobileSlideshow();
}, 700);

setTimeout(() => {
  if (typeof recalcTopButtonsHeight === 'function') recalcTopButtonsHeight();
}, 700);