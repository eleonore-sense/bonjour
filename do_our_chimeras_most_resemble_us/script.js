// ══════════════════════════════════════════════
// ── FAVICON ANIMÉ (dégradé progressif entre les couleurs du site)
// ══════════════════════════════════════════════

function initFaviconAnimation() {
  const CANVAS_SIZE = 96;   // plus grand pour laisser de la place au flou
  const RADIUS = 34;        // rayon du disque, plus grand qu'avant
  const BLUR_PX = 10;       // flou plus prononcé
  const STEPS = 10;         // nombre d'étapes entre deux couleurs
  const STEP_DURATION = 1000; // 1 étape par seconde → ~10s pour une transition complète

  const faviconCanvas = document.createElement('canvas');
  faviconCanvas.width = CANVAS_SIZE;
  faviconCanvas.height = CANVAS_SIZE;
  const ctx = faviconCanvas.getContext('2d');
  const link = document.getElementById('dynamic-favicon');
  if (!link) return;

  // interpolation douce (cosinus), comme le fondu du fond de page
  function interpolate(c1, c2, t) {
    const t2 = (1 - Math.cos(t * Math.PI)) / 2;
    const [r1, g1, b1] = c1.split(',').map(Number);
    const [r2, g2, b2] = c2.split(',').map(Number);
    return [
      Math.round(r1 + (r2 - r1) * t2),
      Math.round(g1 + (g2 - g1) * t2),
      Math.round(b1 + (b2 - b1) * t2),
    ];
  }

  function drawFavicon(rgbArray) {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.filter = `blur(${BLUR_PX}px)`;
    const center = CANVAS_SIZE / 2;
    ctx.beginPath();
    ctx.arc(center, center, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
    ctx.fill();
    link.href = faviconCanvas.toDataURL('image/png');
  }

  let colorIndex = 0;
  let step = 0;

  drawFavicon(couleurs[colorIndex].split(',').map(Number));

  setInterval(() => {
    step++;
    if (step > STEPS) {
      step = 0;
      colorIndex = (colorIndex + 1) % couleurs.length;
    }
    const nextIndex = (colorIndex + 1) % couleurs.length;
    const t = step / STEPS;
    const currentColor = interpolate(couleurs[colorIndex], couleurs[nextIndex], t);
    drawFavicon(currentColor);
  }, STEP_DURATION);
}

document.addEventListener('DOMContentLoaded', initFaviconAnimation);





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
    viewingSchedule: "dates de diffusion",    
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
    viewingSchedule: "viewing schedule",
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
    { amplitude: 16, frequency: 2   },
    { amplitude: 13, frequency: 4   },
  ],
  FR: [
    { amplitude: 16, frequency: 2   },
    { amplitude: 13, frequency: 4   },
    { amplitude: 12, frequency: 2.5 },
  ]
};

let lines = linesConfig[currentLang];


function buildTitreHaut() {
  const container = document.getElementById('titre-haut');
  if (!container) return;
  let lineDataSet;
if (isMobile() && currentLang === "FR") {
    lineDataSet = [TITRE_SVG_DATA.titreHautFRMobile[0], TITRE_SVG_DATA.titreHautFRMobile[1]];
} else if (isMobile() && currentLang === "EN") {
    lineDataSet = TITRE_SVG_DATA.titreHautENMobile; // ← 2 lignes, pas waveMobileEN
} else if (currentLang === "FR") {
    lineDataSet = [TITRE_SVG_DATA.titreHautFRDesktop]; // 1 ligne
  } else {
    lineDataSet = [TITRE_SVG_DATA.titreHautEN]; // desktop EN, 1 ligne
  }
  container.innerHTML = '';
  container.style.color = 'transparent';
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  container.appendChild(wrapper);
const containerWidth = container.clientWidth || 600;
  const useHeightScale = !isMobile();
  const targetHeightVh = currentLang === "FR" ? 9 : 10;
  const containerHeight = useHeightScale
    ? window.innerHeight * (targetHeightVh / 100)
    : null;
  const scale = useHeightScale
    ? computeSharedScale(lineDataSet, containerWidth, containerHeight)
    : computeSharedScale(lineDataSet, containerWidth);
  lineDataSet.forEach(lineData => {
    const lineDiv = document.createElement('div');
    wrapper.appendChild(lineDiv);
    buildStaticLetterLine(lineDiv, lineData, scale);
  });
}


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
    document.getElementById('calendar-label'),
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
    document.title = translations[currentLang].titre; // ← ajout : synchronise le titre d'onglet avec la langue
    document.body.classList.toggle('lang-fr', currentLang === "FR");

    buildTitreHaut();
    buildDesktopWaveLines();
    buildMobileWaveLines();

    setText("about-label", t.about);
    setText("btn_home", t.exhibitionEntrance);
    setText("btn-play", t.playVideo);
    setText("btn-restart", t.restart);
    setText("fullscreen-exit", t.exitFullscreen);
    setText("fullscreen", t.fullscreen);
    setText("calendar-label", t.viewingSchedule);

    const mobileSeeArtists = document.getElementById('mobile-see-artists');
    if (mobileSeeArtists && !mobileSeeArtists.classList.contains('open')) {
      mobileSeeArtists.textContent = currentLang === "FR" ? "artistes" : "artists";
    }
    setText("list_artist", t.artists);

    const boiteAbout = document.getElementById("boite_about");
    if (boiteAbout) {
      boiteAbout.style.transition = "none";
      boiteAbout.style.width = currentLang === "FR" ? "90px" : "70px";
      setTimeout(() => { boiteAbout.style.transition = ""; }, 300);
    }



buildAboutContent(currentLang);
    lines = linesConfig[currentLang];


if (isPage2 && artisteCourant) {
      const data = artistes[artisteCourant];
      if (data) {
        const texteOeuvre = document.getElementById('texte-oeuvre');
        if (texteOeuvre) {
          renderTexteOeuvre(data, currentLang);
          texteOeuvre.scrollTop = 0;
        }
        const texteWrapperEl = document.getElementById('texte-wrapper');
        if (texteWrapperEl) texteWrapperEl.scrollTop = 0;
        if (isMobile()) {
          const part3El = document.getElementById('part_3');
          if (part3El) part3El.scrollTop = 0;
        }
        const titreElLang = document.querySelector('#gauche .titre');
        if (titreElLang) {
          const detailsLang = currentLang === "FR" && data.detailsFR ? data.detailsFR : data.details;
          titreElLang.innerHTML = formatTitreArtiste(data.nom, data.titre, titreElLang, detailsLang);
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
      }else if (el.id === "calendar-label") {
        setOpacity(el, introPlayed && !isPage2 ? '1' : '0', '0.8s');
          } else if (el.id === "fullscreen") {
    // ne réaffiche le bouton fullscreen que s'il était réellement visible avant le changement de langue
    setOpacity(el, fullscreenVisible ? '1' : '0', '0.8s');
      } else if (el.id === "btn-play") {
        if (isMobile()) {
          setOpacity(el, introPlayed ? '1' : '0', '0.8s');
        } else {
          setOpacity(el, '1', '0.8s');
        }
      } else {
        setOpacity(el, '1', '0.8s');
      }
    });

    if (!introPlayed && !playIntroCalled) {
      introPlayed = true;
      playIntroCalled = true;
      playIntro();
    }

  }, 800);
}







// Init au chargement + clic bouton
document.addEventListener("DOMContentLoaded", () => {
  buildDesktopWaveLines();
  buildMobileWaveLines();
  buildTitreHaut();
  applyLang();
  buildAboutContent(currentLang);
  isMobile() ? initTunnelMobile() : initTunnel();
});

document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('img, video, #video-wrapper, .artiste-image, .video-hover-preview')) {
    e.preventDefault();
  }
});

document.body.addEventListener("click", (e) => {
  if (!e.target.closest("#btn-lang")) return;
  currentLang = currentLang === "EN" ? "FR" : "EN";
  applyLang();
  if (typeof carrousel !== "undefined") cachedLoopWidth = carrousel.scrollWidth / 2;
});

document.getElementById('about-content').addEventListener('click', (e) => {
  if (e.target.closest('#about-calendar-link')) {
    e.stopPropagation();
    if (isMobile()) {
      closeAbout();
      setTimeout(() => openCalendar(), 500);
    } else {
      setTimeout(() => openCalendar(), 400);
    }
  }
});


// ══════════════════════════════════════════════
// ── DONNÉES ARTISTES ──────────────────────────
// ══════════════════════════════════════════════

const artistes = {
  1: {
    nom: "Agnieszka Polska",
        bioTitre: "Agnieszka Polska (b. 1985, Poland)",
    bioTitreFr: "Agnieszka Polska (née en 1985, Pologne)",
    titre: "The Book of Flowers",
details: "2023 — HD video, 9:38 minutes",
detailsFR: "2023 — vidéo HD, 9:38 minutes",
    video: "img/agnieszka_polska.mp4",
    poster: "img/agnieszka_polska.jpg",
text: `Agnieszka Polska’s <span class="titre-oeuvre">The Book of Flowers</span> imagines an alternate world and speculative fiction in which humans and flowering plants co-evolve through deep symbiosis. Using AI-generated animation to overwrite 16mm time-lapse footage of blooming flowers, she transforms archival scientific imagery that once reshaped how the wider public perceived the movement of plants Integrating human bodies into botanical cycles, Polska’s narrative inverts gender hierarchies while highlighting ecological awareness. 
<bio>Agnieszka Polska is a visual artist, film, and theatre director based in Berlin. Her work uses computer-generated media to explore individual agency, social responsibility, and the construction of historical narratives amid rapid technological change. The central friction in her practice is between subjective experience and systems — political, informational, algorithmic — that shape and constrain it. She has exhibited at the New Museum and MoMA in New York, the Centre Pompidou in Paris, and Tate Modern in London, and has participated in the Venice, Gwangju, and Sydney biennials. In 2023, she premiered her first theatre production, The Talking Car, at the BoCA Biennale in Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>`,



textFR: `Dans <span class="titre-oeuvre">The Book of Flowers</span>, Agnieszka Polska imagine un monde alternatif, une fiction spéculative, dans laquelle les humains et les plantes à fleurs co-évoluent à travers une symbiose profonde. En utilisant une animation générée par intelligence artificielle pour réécrire des images en accéléré sur pellicule 16mm de fleurs en train d'éclore, elle transforme des images scientifiques d'archives qui ont jadis instruit la perception d'un large public quant au mouvement des plantes. En intégrant des corps humains dans les cycles botaniques, Polska inverse les hiérarchies de genre tout en mettant en lumière une narration et une construction du mythe dans une perspective écologique.

<bio>Agnieszka Polska est une artiste visuelle, réalisatrice et metteuse en scène basée à Berlin. Son travail recourt aux médias générés par ordinateur pour explorer l'agentivité individuelle, la responsabilité sociale et la construction des récits historiques dans un contexte de transformations technologiques rapides. La friction centrale de sa pratique s'articule entre l'expérience subjective et les systèmes — politiques, informationnels, algorithmiques — qui la façonnent et la contraignent. Elle a exposé au New Museum et au MoMA à New York, au Centre Pompidou à Paris et à la Tate Modern à Londres, et a participé aux biennales de Venise, Gwangju et Sydney. En 2023, elle a présenté sa première mise en scène théâtrale, The Talking Car, à la BoCA Biennale de Lisbonne.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,  },


  2: {
    nom: "Lu Yang",
    bioTitre: "Lu Yang (b. 1984, China)",
    bioTitreFr: "Lu Yang (né·e en 1984, Chine)",
    titre: "DOKU, The Creator",
    details: "2025 — video, color, sound, 61:31 minutes",
detailsFR: "2025 — vidéo, couleur, son, 61:31 minutes",
    vimeo: "1099319080",
    vimeoHash: "33b083d2e4",
    poster: "img/lu_yang.jpg",
text: `Lu Yang’s <span class="titre-oeuvre">DOKU the Creator</span> is one of their investigations featuring the digital being DOKU. Its name coined from the Japanese concept “Dokusho Dokushi” : “We are born alone, and we die alone.” The film stages DOKU as artist, agent, and actor, in a kind of initiatory journey accompanied byan introspective voiceover. Through vivid sequences partly fed with a dataset of their previous works, the artist questions their own creative path from the standpoint of their digital self, addressing art itself as a set of values at the crossroads of various belief systems. Lu Yang’s work poetically investigates the multitude inside each of us, within a quantum universe made of constantly changing aggregations, calling upon a state of “non-dual emptyness.”
<bio>Lu Yang is a multidisciplinary artist based between Shanghai and Tokyo whose practice integrates advanced digital technology, Buddhist philosophy, and speculative cultural thought. Since 2018, they have developed the shapeshifting digital being DOKU in collaboration with scientists, 3D animators, and digital technicians using motion capture technology — exploring the boundaries of consciousness, the illusory nature of identity, and the fictionality of life and death. They earned their BA and MA in New Media Art from the China Academy of Art. In 2022, they were named Artist of the Year by Deutsche Bank. Solo exhibitions include presentations at Kunsthalle Basel, Palais Populaire in Berlin, ARoS Museum in Aarhus, MOCA Cleveland, and the Ullens Center for Contemporary Art in Beijing. Their most recent video installation DOKU The Illusion premiered at Espace Louis Vuitton in Venice.
</bio>
<credits>Courtesy of the artist and Société, Berlin</credits>`,
textFR: `<span class="titre-oeuvre">DOKU the Creator</span> de Lu Yang s’inscrit dans la série d’explorations que l’artiste consacre à l’entité numérique DOKU. Son nom provient du concept japonais « Dokusho Dokushi » : « Nous naissons seuls et nous mourons seuls. » La vidéo met en scène DOKU à la fois comme artiste, agent et acteur, dans une sorte de parcours initiatique accompagné d’une voix off introspective. À travers des séquences saisissantes, nourries en partie par un ensemble de données issues de ses œuvres antérieures, l’artiste interroge son propre cheminement créatif depuis la perspective de son double numérique, abordant l’art comme un ensemble de valeurs au croisement de différents systèmes de croyance. L’œuvre de Lu Yang explore de manière poétique la multiplicité qui réside en chacun de nous, au sein d’un univers quantique fait d’agrégations en perpétuelle mutation, tout en invoquant un état de «vacuité non duelle».

<bio>Artiste pluridisciplinaire établi·e entre Shanghai et Tokyo, Lu Yang intègre à sa pratique des technologies numériques de pointe, la philosophie bouddhiste et une réflexion culturelle spéculative. Depuis 2018, iel développe l’entité numérique aux formes changeantes DOKU en collaboration avec des scientifiques, des animateurs 3D et des spécialistes du numérique utilisant la technologie de capture de mouvement. Ce projet explore les frontières de la conscience, la nature illusoire de l’identité ainsi que le caractère fictionnel de la vie et de la mort. Lu Yang est titulaire d’une licence et d’un master en art des nouveaux médias de la China Academy of Art. En 2022, iel a été désigné·e « Artist of the Year » par la Deutsche Bank. Ses expositions personnelles ont notamment été présentées à la Kunsthalle de Bâle, au Palais Populaire de Berlin, au musée ARoS d'Aarhus, au MOCA de Cleveland et au Ullens Center for Contemporary Art de Pékin. Sa plus récente installation vidéo, DOKU The Illusion, a été présentée en avant-première à l'Espace Louis Vuitton de Venise. 
</bio>
<credits>Courtesy of the artist and Société, Berlin</credits>`,  },


  3: {
    nom: "Jonas Lund",
        bioTitre: "Jonas Lund (b. 1984, Sweden)",
    bioTitreFr: "Jonas Lund (né en 1984, Suède)",
    titre: "The Future of Life",
    details: "2024 — video, 28:02 minutes",
detailsFR: "2024 — vidéo, 28:02 minutes",
    video: "img/jonas_lund.mp4",
    poster: "img/jonas_lund.jpg",
text: `Jonas Lund’s <span class="titre-oeuvre">The Future of Life</span> stages immortality as a corporate product launch, where an AI promises to “make all the right decisions” so humans can “enjoy eternity,” even as internal politics and emotion threaten the rollout. Lund’s premise is quintessentially chimeric: the oldest human aspiration (endless life) braided to the newest managerial dogma (optimization). The Future of Life is part of the The Future of series by Lund on humanity’s relationship with A, following The Future of Nothing, and The Future of Something, both from 2023. Each film is made in close collaboration with a range of different generative AI’s, highlighting the rapid changes in performance of visual credibility.

<bio>Jonas Lund is a Swedish artist whose paintings, sculptures, photographs, websites, and performances probe the power structures and mechanisms of contemporary networked society. His practice is built on a particular formal proposition: rather than depicting systems from the outside, he constructs them, building rulesets and algorithms that then generate the work. This puts authorship in an unstable position — Lund authors the conditions, but the conditions author the output — and that instability is the subject. He has applied the same logic to the art world itself, creating works that expose how taste, market value, and institutional authority are produced. His work is held in public collections including the Centre Pompidou, the Stedelijk Museum, MACBA Barcelona, and ZKM Karlsruhe. In 2025, he received the inaugural Prix Arts numériques from the Fondation Etrillard and the Académie des beaux-arts.
</bio>
<credits>Courtesy the artist</credits>`,
textFR: `Dans <span class="titre-oeuvre">The Future of Life</span>, l’artiste Jonas Lund met en scène l’immortalité comme un nouveau produit lancé par une entreprise. Une IA promet de « prendre toutes les bonnes décisions » afin que les humains puissent « profiter de l’éternité », alors même que des luttes de pouvoir internes et les émotions des personnages [VM1] menacent le déploiement du projet. Le postulat de Lund est par excellence chimérique : la plus ancienne aspiration humaine (la vie éternelle) s’entremêle avec le dogme managérial le plus récent (l’optimisation). The Future of Life fait partie de la série The Future of que Lund consacre à la relation de l’humanité à l’IA, après The Future of Nothing et The Future of Something, tous deux datant de 2023. Chaque film est réalisé en étroite collaboration avec toute une gamme d’IA génératives, mettant en évidence l’évolution rapide de leurs performances en matière de crédibilité visuelle.


<bio>Jonas Lund est un artiste suédois dont les peintures, sculptures, photographies, sites web et performances explorent les structures de pouvoir et les mécanismes de la société contemporaine en réseau. Sa pratique repose sur une proposition formelle particulière : au lieu de représenter des systèmes de l’extérieur, il les construit, en élaborant des ensembles de règles et des algorithmes qui génèrent ensuite l’œuvre. Cela place la paternité de l’œuvre dans une position instable — Lund crée les conditions, mais ce sont ces conditions qui créent le résultat — et c’est cette instabilité qui constitue le sujet. Il a appliqué cette même logique au monde de l’art lui-même, en créant des œuvres qui révèlent comment le goût, la valeur marchande et l’autorité institutionnelle sont produits. Ses œuvres font partie de collections publiques, dont celles du Centre Pompidou (Paris), du Stedelijk Museum (Amsterdam), du MACBA (Barcelone) et du ZKM (Karlsruhe). En 2025, il a été le premier lauréat du Prix Arts numériques décerné à Paris par la Fondation Etrillard et l’Académie des beaux-arts.
</bio>
<credits>Courtesy the artist</credits>`,  },


  4: {
    nom: "Egor Kraft",
        bioTitre: "Egor Kraft (b. 1986, Russia)",
    bioTitreFr: "Egor Kraft (né en 1986, Russie)",
    titre: "One and Infinite Chairs",
    details: "2023 — self-hosted and custom-trained Stable Diffusion, .ckpt-format file of a collapsed AI model, essay-film, 6:36 minutes",
detailsFR: "2023 — modèle de diffusion stable auto-hébergé et entraîné sur mesure, fichier au format .ckpt d'un modèle d'IA réduit, essai-film, 6:36 minutes",
    video: "img/egor_kraft.mp4",
    poster: "img/egor_kraft.jpg",
text: `Egor Kraft’s <span class="titre-oeuvre">One & Infinite Chairs (1&∞⑁)</span> makes the chimera visible at the level of linguistic interpretation and breakdown. Kraft describes training a text-to-image model on the prompt, “a single chair on a white background,” and then repeatedly retraining it on its own output. After several iterations, the model gradually loses its ability to produce a chair, yielding instead a para-figurative abstraction. This conceptual machine explores the symptom of recursive feedback and the projected “model collapse” of the near future — where there’s more AI generated content on the internet, and AI loses its primary referent, us. The work positions a classic philosophical query (“what is a chair?”), explored in conceptual art history by Joseph Kosuth, against the fragile ontology of AI: when representation cannibalizes itself, and the “idea” falters into a state of disarticulation.
<bio>
Egor Kraft (映治 克夫斗) is an artist based between Tokyo and Vienna with ties to London and Berlin. His research-informed practice examines the disrupted conditions of contemporary life as products of planetary-scale sociotechnical change. Where much art about technology takes its surface as subject — the screen, the interface, the platform — Kraft goes further back, into the recursive, feedback-driven processes through which technological systems rewrite their own conditions of possibility and, with them, the categories humans use to understand agency, value, and time. His work often requires new vocabulary precisely because the phenomena it addresses have outrun existing description. His multi-award-winning work has been exhibited in museums, galleries, and festivals worldwide. He lectures at European and Asian universities, publishes in the field, and speaks at international conferences.
</bio>
<credits>Courtesy the artist</credits>`,
textFR: `<span class="titre-oeuvre">One & Infinite Chairs (1&∞⑁)</span> d'Egor Kraft transpose  la chimère au niveau de l'interprétation et du délitement linguistique. Kraft décrit l'entraînement d'un modèle texte-image sur le prompt « une chaise unique sur fond blanc », puis son ré-entraînement répété sur ses propres productions. Après plusieurs itérations, le modèle perd progressivement sa capacité à produire une chaise, générant à la place une abstraction para-figurative. Cette machine conceptuelle explore le symptôme de la rétroaction récursive et « l'effondrement du modèle » projeté dans un futur proche — où le contenu généré par l'IA prolifère sur internet au point que l'IA perd son référent premier : celui que nous produisons. L'œuvre confronte une question philosophique classique (« qu'est-ce qu'une chaise ? »), explorée dans l'histoire de l'art conceptuel par Joseph Kosuth, à la fragile ontologie de l'IA : lorsque la représentation se cannibalise elle-même et que l'« idée » vacille vers un état de désarticulation.

<bio>Egor Kraft (映治 克夫斗) est un artiste basé entre Tokyo et Vienne, avec des liens à Londres et Berlin. Sa pratique, ancrée dans la recherche, examine les conditions perturbées de la vie contemporaine comme produits d'une mutation socio-technique à l'échelle planétaire. Là où bien des œuvres traitant de la technologie prennent sa surface pour sujet — l'écran, l'interface, la plateforme — Kraft remonte plus loin, vers les processus récursifs et rétroactifs par lesquels les systèmes technologiques réécrivent leurs propres conditions de possibilité et, avec elles, les catégories que les humains utilisent pour appréhender l'agentivité, la valeur et le temps. Son travail requiert souvent un vocabulaire nouveau, précisément parce que les phénomènes qu'il aborde ont dépassé les descriptions existantes. Son œuvre, récompensée par de nombreux prix, a été exposée dans des musées, galeries et festivals à travers le monde. Il enseigne dans des universités européennes et asiatiques, publie dans son domaine et intervient dans des conférences internationales.
</bio>
<credits>Courtesy the artist</credits>`,  },


  5: {
    nom: "Elsa Werth",
        bioTitre: "Elsa Werth (b. 1985, France)",
    bioTitreFr: "Elsa Werth (né en 1985, France)",
    titre: "IF / THEN",
    details: "2024 — video, color, silent, loop, 42:22 minutes. Edition of 5 + 1AP",
detailsFR: "2024 — video, couleur, muet, boucle, 42:22 minutes. Edition of 5 + 1AP",
    video: "img/elsa_werth.mp4",
    poster: "img/elsa_werth.jpg",
text: `Elsa Werth’s <span class="titre-oeuvre">If/Then</span> names a foundational grammar of computer systems, one of its primary operational logics. Declared upfront in its title, “if/then” is a conditional statement that underpins programming, policy, and predictive output of computational systems. At the core of this work is a question about the use-value of abstraction, and a gestural and critical equivalence to what arises as a result of generative AI. The silent video is an example of Werth’s broader practice—concerned with “the economy of work” and the destabilization of ordinary gestures through displacement and misuse.

<bio>
Elsa Werth is a Paris-based artist working across installation, sculpture, video, artist books, and sound. Her practice centers on the economies of labor and the ordinary gestures that sustain them. What interests her is the texture of work as it is actually lived — the repetitive, the habitual, the barely noticed — and she approaches it through operations of displacement and counter-use that make familiar actions strange without aestheticizing them. The anti-spectacular is a deliberate position: in a context that valorizes productivity and growth, her refusal of spectacle is itself a form of argument. She received the 23rd Prix de la Fondation Pernod Ricard pour l'Art Contemporain in 2022 and has exhibited at the Centre Pompidou, the West Bund Museum in Shanghai, and the National Taiwan Museum of Fine Arts, among other venues.
</bio>
<credits>Courtesy the artist and BLOOM</credits>
`,
textFR: `L’œuvre d’Elsa Werth intitulée <span class="titre-oeuvre">If/Then</span> fait référence à une grammaire fondamentale des systèmes informatiques, l’une de leurs principales logiques opérationnelles. Comme le titre l’indique d’emblée, l’expression « if/then » est une instruction conditionnelle qui sous-tend la programmation, les règles et les résultats prédictifs des systèmes informatiques. L’œuvre remet en question la valeur d’usage de l’abstraction et utilise une équivalence gestuelle et critique pour montrer ce qui émerge avec l’IA générative. Cette vidéo silencieuse illustre la pratique plus large d’Elsa Werth, qui s’intéresse à « l’économie du travail » et à la déstabilisation des gestes ordinaires par le déplacement et le détournement. 


<bio>Elsa Werth est une artiste vivant à Paris dont le travail prend la forme d’installations, de sculptures, de vidéos, de livres d’artiste et d’œuvres sonores. Sa pratique s’articule autour des économies du travail et des gestes ordinaires qui les sous-tendent. C’est la texture du travail tel qu’il est réellement vécu qui l’intéresse en particulier – ce qui est répétitif, habituel et à peine remarqué. Elle l’aborde à travers des opérations de déplacement et de contre-usage qui rendent étranges des actions familières sans pour autant les esthétiser. L’anti-spectaculaire est une position délibérée : dans un contexte qui valorise la productivité et la croissance, son refus du spectacle est en soi une forme d’argumentation. Elle a reçu le 23e Prix de la Fondation Pernod Ricard pour l’Art Contemporain en 2022 et a exposé notamment au Centre Pompidou, au West Bund Museum de Shanghai et au National Taiwan Museum of Fine Arts.
</bio>
<credits>Courtesy the artist and BLOOM</credits>`,  },


  6: {
    nom: "Emmanuel Van der Auwera",
        bioTitre: "Emmanuel Van der Auwera (b. 1982, Belgium)",
    bioTitreFr: "Emmanuel Van der Auwera (né en 1982, Belgium)",
    titre: "The Gospel",
    details: "2024 — HD video, color, sound, 17:53 minutes",
detailsFR: "2024 — vidéo HD, couleur, son, 17:53 minutes",
    video: "img/emmanuel_van_der_auwera.mp4",
    poster: "img/emmanuel_van_der_auwera.jpg",
text: `<span class="titre-oeuvre">The Gospel</span> by Emmanuel Van der Auwera explores the unstable boundary between belief, mediation, and power. Working with photogrammetry and generated images tracing contemporary technologies and their intervention into social life. Van der Auwera points to how data analysis and systems of control are produced by AI, marking a pivotal moment, “...the first time that AI selected targets without human intervention.” In this video, the “gospel” is described as a surveillance technology, displaced from the sacred into the political, where images acquire power and inform networks of control—a new faith is born in the technology itself. That faith extends to intimate relationships with AI, and contrasted with vignettes of a Chinese miner searching for rare earth minerals used in various technologies, including the GPUs that power LLMs. 
<bio>
Emmanuel Van der Auwera is a Belgian artist whose work examines the production and consumption of images within a new visual economy shaped by digital space, and the ethical weight of looking. His practice is organized around the chain that runs from raw extraction to finished image: the mines supplying rare earth minerals, the supply chains and labor regimes of device manufacturing, the platforms that distribute visual content, and the viewers who consume it without seeing any of that infrastructure. By making those connections visible, his work asks what it means to be complicit in a system of image-making whose material conditions are deliberately kept out of frame. He is a 2015 Langui Award recipient of the Young Belgian Art Prize and the first winner of the Goldwasserschenking awarded by the WIELS Contemporary Art Centre. His work has been shown at the Palais de Tokyo in Paris, Pinakothek der Moderne in Munich, and KW Institute for Contemporary Art in Berlin, among others.
</bio>
<credits>Courtesy of Harlan Levey Projects and the artist</credits>`,
textFR: `<span class="titre-oeuvre">The Gospel</span> d’Emmanuel Van der Auwera explore la frontière instable entre croyance, médiation et pouvoir. S’appuyant sur la photogrammétrie et des images générées qui retracent les technologies contemporaines et leur intervention dans la vie sociale, Van der Auwera met en lumière la manière dont l’analyse des données et les systèmes de contrôle sont produits par l’IA, marquant ainsi un tournant décisif : « …la première fois que l’IA a sélectionné des cibles sans intervention humaine. » Dans cette vidéo, l’« Évangile » est présenté comme une technologie de surveillance, déplacée du domaine du sacré vers celui du politique, où les images acquièrent un pouvoir et alimentent des réseaux de contrôle, faisant naître une nouvelle foi dans la technologie elle-même. Cette foi s'étend aux relations intimes entretenues avec l'IA et se trouve mise en contraste avec des séquences montrant un mineur chinois à la recherche de terres rares – des minerais essentiels à diverses technologies, notamment aux processeurs graphiques (GPU) qui alimentent les grands modèles de langage (LLM).  

<bio>txt en francais</bio>
<credits>Courtesy of Harlan Levey Projects and the artist</credits>
`,  },


  7: {
    nom: "Jon Rafman",
        bioTitre: "Jon Rafman (b. 1981, Montréal)",
    bioTitreFr: "Jon Rafman (né en 1981, Montréal)",
    titre: "Catastrophonics I–IV",
    details: "2025 — HD single-channel video, color, sound, 21:20 minutes",
detailsFR: "2025 — Vidéo HD monocanal, couleur, son, 21:20 minutes",
    video: "img/jon_rafman.mp4",
    poster: "img/jon_rafman.jpg",
     loop: true,
    randomStart: true,
    noTimeline: true,   
text: `Jon Rafman’s <span class="titre-oeuvre">Catastrophonics I–IV</span> turns the chimera into a broadcast program: a rapid sequence of uncanny vignettes that compile internet streams stitched together, across  impossible chasms via generative AI. The series (I, II, III and IV) is presented here in a variable sequence, but no matter where you enter the work its persistent rhythm and vertiginous scenography deepen the chaotic avalanche of various natural disasters and human made catastrophes. Rafman’s chimera is asking whether the apocalypse we imagine is now inseparable from the media systems that package, distribute and may ultimately produce it.
<bio>Jon Rafman is a Montreal-born artist whose video, animation, photography, sculpture, and installation draw on internet-sourced imagery to investigate the losses, fantasies, and alienations of life online. His practice takes seriously what others treat as subcultural noise: the online communities, image boards, memes, and virtual spaces that shape how people relate to each other and to themselves. He approaches these worlds with something closer to ethnographic care than ironic detachment, finding in them genuine registers of loneliness, desire, and grief rather than symptoms to diagnose from a safe distance. Recent solo exhibitions include Louisiana Museum of Modern Art (2025), Kunsthalle Praha, Taipei Fine Arts Museum, and Whangarei Museum of Art (all 2024), and 180 The Strand, London (2023). He has participated in the Venice and Sharjah biennials and lives and works in Los Angeles.
</bio>
<credits>Courtesy the artist and Sprüth Magers</credits>`,
textFR: `<span class="titre-oeuvre">Catastrophonics I–IV</span> de Jon Rafman transforme la chimère en un programme d’information. Une séquence rapide de vignettes d'une étrange familiarité,compile des flux internet suturés bout à bout, traversant des gouffres d’impossibilités produits par l’IA générative. La série (I, II, III et IV) est présentée ici dans un ordre variable. Mais où que l'on entre dans l'œuvre, son rythme persistant et sa scénographie vertigineuse intensifient l'avalanche chaotique de désastres naturels et de catastrophes d'origine humaine. La chimère de Rafman se demande si l'apocalypse que nous imaginons est désormais inséparable des systèmes médiatiques qui la mettent en forme et la diffusent.

<bio>Jon Rafman est un artiste originaire de Montréal dont la vidéo, l'animation, la photographie, la sculpture et l'installation puisent dans des images issues d'internet pour interroger les pertes, les fantasmes et les aliénations de la vie en ligne. Sa pratique prend au sérieux ce que d'autres traitent comme du bruit subculturel : les communautés en ligne, les imageboards, les mèmes et les espaces virtuels qui façonnent la manière dont les individus interagissent aussi bien les uns avec les autres qu’avec eux-mêmes. Il aborde ces mondes avec quelque chose qui tient davantage d'une attention ethnographique que d'un détachement ironique, y décelant de véritables registres de solitude, de désir et de deuil plutôt que des symptômes à diagnostiquer à distance. Parmi ses expositions individuelles récentes figurent le Louisiana Museum of Modern Art (2025), la Kunsthalle Praha, le Taipei Fine Arts Museum et le Whangarei Museum of Art (tous en 2024), ainsi que 180 The Strand, Londres (2023). Il a participé aux biennales de Venise et de Sharjah, et vit et travaille à Los Angeles.
</bio>
<credits>Courtesy the artist and Sprüth Magers</credits>`,  },


  8: {
    nom: "Ho Tzu Nyen",
        bioTitre: "Ho Tzu Nyen (b. 1976, Singapore)",
    bioTitreFr: "Ho Tzu Nyen (né en 1976, Singapour)",
    titre: "P for Power",
    details: "2023 — HD video, 60:07 minutes",
detailsFR: "2023 — vidéo HD, 60:07 minutes",
    videoOptions: ["img/ho_tzu_nyen_1.mp4", "img/ho_tzu_nyen_2.mp4", "img/ho_tzu_nyen_3.mp4"],
        poster: "img/ho_tzu_nyen.jpg",
text: `
Ho Tzu Nyen’s <span class="titre-oeuvre">P for Power</span> was commissioned by Bozar as part of his ongoing Critical Dictionary of Southeast Asia. This video installation unfolds as “30 real-time edited chapters,” each a Q&A between Ho and an AI chatbot attempting to define “Power.” The chatbot becomes a contemporary oracle—verbose, confident, derivative—whose authority is inseparable from its statistical nature. By staging Singaporean children as protagonists who infiltrate found footage from the internet, Ho engages an open ended question as to the many possible uses and definitions of power in the future. In the artist’s words, “Power, not as domination, but as endurance, consistency, coherence over temporal extension.” Originally fed through a live internet input, P for Power is proposed here as three generated iterations alternating through the duration of the exhibition.

<bio>Ho Tzu Nyen is a Singapore-based artist whose installations, films, and theatrical works weave together archival images, animation, and speculative narrative to investigate the plural, contested cultural identities of Southeast Asia. His ongoing Critical Dictionary of Southeast Asia forms the conceptual spine of much of his output: an open-ended, accumulative project that refuses the idea that a region so multiple in its languages, religions, and histories could be gathered under a single account. His work proceeds by layering rather than resolving — different historical sources, knowledge systems, and representational modes placed in proximity so that their contradictions remain legible. Solo exhibitions have been held at Hamburger Kunsthalle, LUMA Arles, Mudam, the Hammer Museum, and Museum of Contemporary Art Tokyo, among others. His films have screened at Cannes, Venice, and Sundance. He was appointed Artistic Director of the 2026 Gwangju Biennale.
</bio>`,
textFR: `L’œuvre <span class="titre-oeuvre">P for Power</span> de Ho Tzu Nyen a été commandée par Bozar dans le cadre de son projet en cours Critical Dictionary of Southeast Asia. Cette installation vidéo se déploie en « trente chapitres montés en temps réel », chacun prenant la forme d’un échange de questions-réponses entre l’artiste et un agent conversationnel (chatbot) tentant de définir le terme « Pouvoir ». Le chatbot devient un oracle contemporain – prolixe, sûr de lui et tributaire de données préexistantes – dont l’autorité est indissociable de sa nature statistique. En mettant en scène des enfants singapouriens comme protagonistes s’infiltrant dans des images trouvées sur Internet, Ho Tzu Nyen explore une question ouverte sur les multiples usages et définitions possibles du pouvoir dans les temps à venir. Selon l’artiste : « Le pouvoir, non pas comme domination, mais comme endurance, constance et cohérence dans la durée. » Initialement alimentée par un flux Internet en direct, l’œuvre P for Power est présentée ici sous la forme de trois itérations générées, alternant tout au long de la durée de l’exposition. 

<bio>Ho Tzu Nyen est un artiste établi à Singapour dont les installations, les films et les œuvres théâtrales entremêlent images d'archives, animation et récits spéculatifs pour explorer les identités culturelles plurielles et disputées de l'Asie du Sud-Est. Son projet en cours d'élaboration, Critical Dictionary of Southeast Asia, constitue la structure conceptuelle d'une grande partie de son travail : un projet ouvert et cumulatif qui rejette l'idée selon laquelle une région d'une telle diversité de langues, de religions et d'histoires pourrait être ramenée à un récit unique. Son travail procède par stratification plutôt que par résolution, rapprochant différentes sources historiques, systèmes de savoir et modes de représentation afin de rendre visible leurs contradictions. Il a fait l'objet d'expositions personnelles dans des institutions telles que la Hamburger Kunsthalle, LUMA Arles, le Mudam, le Hammer Museum et le Museum of Contemporary Art Tokyo. Ses films ont été projetés aux festivals de Cannes, de Venise et de Sundance. Il a été nommé directeur artistique de la Biennale de Gwangju 2026. 
</bio>`,  },


  9: {
    nom: "Sofia Crespo",
        bioTitre: "Sofia Crespo (b. 1991, Argentina)",
    bioTitreFr: "Sofia Crespo (née en 1991, Argentine)",
    titre: "Temporally Uncaptured",
    details: "2023-2024 — neural networks and digital video from scanned cyanotypes, 4:10 minutes",
detailsFR: "2023-2024 — réseaux neuronaux et vidéo numérique à partir de cyanotypes numérisés, 4:10 minutes",
    video: "img/sofia_crespo.mp4",
    poster: "img/sofia_crespo.jpg",
text: `<span class="titre-oeuvre">Temporally Uncaptured</span> by Sofia Crespo is a series of short videos inspired by the historical figure Anna Atkins and her Photographs of British Algae: Cyanotype Impressions (1843) — the first book to be photographically printed and illustrated, a landmark in the history of photography. Atkins completed her book in an era when female scientists were routinely ignored or misattributed. As a result its significance went largely unrecognized for over a century. 
Crespo's videos employ custom neural networks, small models trained by the artist, in contrast to today's large-scale generative AI, to produce a sequence of still images capturing the morphological range of a variety of organisms synthesized from historical archives, focusing on some of the earliest depictions of these creatures. The resulting videos are assembled frame-by-frame, transforming the digital images by hand via the chemical process of cyanotype, and then digitized. The work attends to the often imperceptible transitions in the life cycles of organisms, including but not limited to the microscopic, that unfold at a temporal scale invisible to the human eye.
<bio>
Sofia Crespo is an Argentine artist based in Lisbon whose practice examines the convergence of artificial intelligence and biological systems. Working independently and as part of the duo Entangled Others with Norwegian artist Feileacan Kirkbride McCormick, she investigates how organic life and artificial mechanisms simulate and evolve each other — drawing parallels between historical optical instruments and contemporary neural networks. Their work has been shown at the Victoria & Albert Museum in London and Times Square in New York, and their piece Swim entered the Buffalo AKG Art Museum's permanent collection in 2022. Crespo received the AI Newcomer Award from the German Informatics Society and has lectured at MIT and the Oxford Artificial Intelligence Society.</bio>

<credits>Courtesy the artist</credits>`,
textFR: `<span class="titre-oeuvre">Temporally Uncaptured</span> de Sofia Crespo est une série de courtes vidéos inspirées de la figure historique d'Anna Atkins et de son ouvrage Photographs of British Algae: Cyanotype Impressions (1843) — le premier livre à être imprimé et illustré par photographie, un jalon majeur dans l'histoire de la photographie. Atkins acheva son ouvrage à une époque où les femmes scientifiques étaient systématiquement ignorées ou voyaient leur travail attribué à d'autres. De ce fait, son importance passa largement inaperçue pendant plus d'un siècle.
Les vidéos de Crespo mobilisent des réseaux de neurones personnalisés, au contraire des  IA génératives actuelles à grande échelle, pour produire une séquence d'images fixes capturant l'étendue morphologique d'une variété d'organismes synthétisés à partir d'archives historiques, en se concentrant sur certaines des premières représentations de ces créatures. Les vidéos qui en résultent sont assemblées image par image, transformant les images numériques à la main via le procédé chimique du cyanotype, puis numérisées. L'œuvre prête attention aux transitions souvent imperceptibles dans les cycles de vie des organismes, y compris, sans s'y limiter, les organismes microscopiques, qui se déploient à une échelle temporelle invisible à l'œil nu.

<bio>
Sofia Crespo est une artiste argentine basée à Lisbonne dont la pratique examine la convergence de l'intelligence artificielle et des systèmes biologiques. Travaillant de manière indépendante et au sein du duo Entangled Others avec l'artiste norvégien Feileacan Kirkbride McCormick, elle explore la manière dont le vivant et les mécanismes artificiels se simulent et se transforment mutuellement — établissant des parallèles entre les instruments optiques historiques et les réseaux de neurones contemporains. Leur travail a été présenté au Victoria & Albert Museum à Londres et à Times Square à New York, et leur œuvre Swim est entrée dans la collection permanente du Buffalo AKG Art Museum en 2022. Crespo a reçu le prix AI Newcomer de la Société allemande d'informatique et a donné des conférences au MIT et à l'Oxford Artificial Intelligence Society.</bio>
<credits>Courtesy the artist</credits>`,  },
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
const boiteCalendar = document.getElementById('boite_calendar');
const calendarContent = document.getElementById('calendar-content');

/*CHANGE DATE*/
const DEBUG_DATE = '2026-09-14';
function getToday() {
  return DEBUG_DATE || new Date().toISOString().split('T')[0];
}


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
let isTransitioning = false;
let btnPlayReady = false;
let tunnelActive = false;
let vimeoFrame = null;
let vimeoPlayer = null;
let wasInCinemaModeBeforeFullscreen = false;
let playIntroCalled = false;
let calendarOpen = false;
let calendarTextTimer = null;

const schedule = [
  { date: "2026-09-14", artist: "ALL" },
  { date: "2026-09-15", artist: "ALL" },
  { date: "2026-09-16", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-09-17", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-09-18", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-09-19", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-09-20", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-09-21", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-09-22", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-09-23", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-09-24", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-09-25", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-09-26", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-09-27", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-09-28", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-09-29", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-09-30", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-01", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-02", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-03", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-04", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-10-05", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-10-06", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-10-07", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-10-08", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-09", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-10", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-11", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-12", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-13", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-10-14", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-10-15", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-10-16", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-10-17", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-18", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-19", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-20", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-21", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-22", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-10-23", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-10-24", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-10-25", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-10-26", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-27", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-28", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-29", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-30", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-31", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-01", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-02", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-03", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-11-04", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-11-05", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-11-06", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-11-07", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-11-08", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-11-09", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-10", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-11", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-12", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-11-13", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-11-14", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-11-15", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-11-16", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-11-17", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-11-18", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-19", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-20", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-21", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-11-22", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-11-23", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-11-24", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-11-25", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-11-26", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-11-27", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-28", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-29", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-30", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-12-01", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-12-02", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-12-03", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-12-04", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-12-05", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-12-06", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-12-07", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-12-08", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-12-09", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-12-10", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-12-11", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-12-12", artist: "ALL" },
  { date: "2026-12-13", artist: "ALL" },
  { date: "2026-12-14", artist: "CLOSED" },
];



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

  btnPlay.style.top   = (wrapperH / 2) + 'px';
  btnPlay.style.right = (vidW / 2) + 'px';
  btnPlay.style.transform = 'translate(50%, -50%)';

});

function showInfo3() {
  if (isMobile() && typeof showInfo3Mobile === 'function') {
    showInfo3Mobile();
    return;
  }
  document.querySelectorAll('.info3').forEach(el => {
    el.style.opacity = '';
    el.style.transition = '';
    el.classList.add('visible');
  });
  btnHome.style.opacity = '1';
  setOpacity(document.getElementById('btn_cine_switch'), '1', '1s');
  info3AlreadyShown = true;
}



function hideInfo3() {
  if (isMobile() && typeof hideInfo3Mobile === 'function') {
    hideInfo3Mobile();
    return;
  }
  document.querySelectorAll('.info3').forEach(el => {
    el.style.opacity = '';
    el.style.transition = '';
    el.classList.remove('visible');
  });
  btnHome.style.opacity = '0.8';
  setOpacity(document.getElementById('btn_cine_switch'), '0', '1s');
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



function isArtistAvailableToday(nom) {
  const today = getToday();
  const entry = schedule.find(e => e.date === today);
  if (!entry) return false;
  return entry.artist === nom || entry.artist === 'ALL';
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
    setCalendarVisible(true);
setOpacity(document.getElementById('btn-lang'), '1', '1s');
setOpacity(document.getElementById('btn_cine_switch'), '1', '1s');
    setOpacity(document.getElementById('calendar-label'), '1', '1s'); 
    fadeIn('logos-container');
    document.getElementById('artistes-container').style.pointerEvents = 'auto';
document.getElementById('mobile-see-artists')?.style.setProperty('opacity', '1');
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
  tunnelActive = true;
  cancelAnimationFrame(tunnelRaf);
  tunnelCanvas.style.pointerEvents = 'auto';
  const DURATION = 2500;
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / DURATION, 1);
    renderTunnel(t);
    if (t < 1) {
      tunnelRaf = requestAnimationFrame(step);
    } else {
      // tunnel plein, on reste actif
      if (onCovered) onCovered();
    }
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
      tunnelActive = false;
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

animateTunnel(() => {
  document.body.classList.add('cinema-mode');
});
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
    if (texteWasVisible) setOpacity(texte, '0', '0.4s');
    if (infoBtnVisible) setOpacity(infoBtn, '0', '0.4s');
    if (isMobile() && !hasStarted) {
      setOpacity(btnPlay, '0', '0.4s');
    }

    // 2. fond noir disparaît
    cinemaOverlay.classList.add('closing');
    closeTunnel();
    fullscreen.classList.remove('force-visible');

    cinemaTransitionTimer = setTimeout(() => {
      cinemaOverlay.classList.remove('active', 'closing');
      cinemaTransitionTimer = null;

      // 3. seulement maintenant on remet le mode jour
      document.body.classList.remove('cinema-mode');
      document.documentElement.style.setProperty('--p2typo', 'black');
      btnPlay.style.color = 'white';

      // 4. texte réapparaît en noir
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
      if (texteWasVisible) setOpacity(texte, '', '0.8s');
      if (infoBtnVisible) setOpacity(infoBtn, '1', '0.8s');

if (isMobile()) {
        setOpacity(btnLang, '1', '0.8s');
        if (!hasStarted) {
          btnPlay.style.transition = 'none';
          btnPlay.style.opacity = '0';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              btnPlay.style.transition = 'opacity 0.8s ease';
              btnPlay.style.opacity = '1';
            });
          });
        }
      }

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
  if (artiste.nom === "Sofia Crespo") {
    img.style.transform = "scale(0.78)";
  }
  hoverPreviews.appendChild(img);
});

let currentVisibleImg = null;
let mousoverPending = false;
let lastHoveredId = null;


let lastMouseX = 0;
let lastMouseY = 0;

const carouselTooltip = document.createElement('div');
carouselTooltip.id = 'carousel-tooltip';
document.body.appendChild(carouselTooltip);

document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  const tooltipW = carouselTooltip.offsetWidth;
  const margin = 15;
  let x = e.clientX + 18;
  if (x + tooltipW + margin > window.innerWidth) {
    x = e.clientX - tooltipW - 18;
  }
  carouselTooltip.style.left = x + 'px';
  carouselTooltip.style.top  = (e.clientY - 40) + 'px';
});

function showCarouselTooltip(nom) {
  const date = getNextDateForArtist(nom);
  if (!date) { hideCarouselTooltip(); return; }
  const today = getToday();
  const todayEntry = schedule.find(e => e.date === today);
  if (todayEntry && (todayEntry.artist === nom || todayEntry.artist === 'ALL')) {
    hideCarouselTooltip();
    return;
  }
  carouselTooltip.textContent = currentLang === 'FR'
    ? `prochaine diffusion : ${date}`
    : `next screening : ${date}`;
  carouselTooltip.classList.add('visible');
}

function hideCarouselTooltip() {
  carouselTooltip.classList.remove('visible');
}


artistesContainer.addEventListener('mouseover', (e) => {
  if (!e.target.classList.contains('artiste_accueil')) return;
  const id = e.target.dataset.artiste;

  if (!id || id === lastHoveredId) return; // ← même élément, on ignore
  const nom = artistes[id]?.nom;
if (nom) showCarouselTooltip(nom);
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
hideCarouselTooltip();
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

// ── TITRE WAVE / GLITCH — SVG lettre par lettre ──

let desktopWaveInstances = [];
let mobileWaveInstances = [];
let glitchProgress = 0;
let targetProgress = 0;
let isGlitching    = false;
let isPausing      = false;
const GLITCH_DURATION  = 4;
const PAUSE_DURATION   = 7;
const GLITCH_FREQUENCY = 20;

function buildDesktopWaveLines() {
  const container = document.getElementById('desktop-wave-lines');
  if (!container) return;
  const lineDataSet = currentLang === "EN" ? TITRE_SVG_DATA.waveDesktopEN : TITRE_SVG_DATA.waveDesktopFR;
  container.innerHTML = '';
  const containerWidth = container.clientWidth || container.parentElement.clientWidth || 600;
  const widthFactor = currentLang === "FR" ? 0.98 : 1;
  const scale = computeSharedScale(lineDataSet, containerWidth * widthFactor);
  desktopWaveInstances = lineDataSet.map((lineData, i) => {
    const lineDiv = document.createElement('div');
    container.appendChild(lineDiv);
    const cfg = lines[i] || { amplitude: 12, frequency: 2 };
    return buildLetterLine(lineDiv, lineData, { amplitude: cfg.amplitude, pxPerUnit: scale });
  });
}

function buildMobileWaveLines() {
  const container = document.getElementById('mobile-wave-lines');
  if (!container) return;
  const lineDataSet = currentLang === "EN" ? TITRE_SVG_DATA.waveMobileEN : TITRE_SVG_DATA.waveMobileFR;
  container.innerHTML = '';
  const containerWidth = container.clientWidth || container.parentElement.clientWidth || 380;
  const scale = computeSharedScale(lineDataSet, containerWidth);
  mobileWaveInstances = lineDataSet.map((lineData, i) => {
    const lineDiv = document.createElement('div');
    container.appendChild(lineDiv);
    const cfg = mobileWaveLines[i] || { amplitude: 12, frequency: 2 };
    return buildLetterLine(lineDiv, lineData, { amplitude: cfg.amplitude, pxPerUnit: scale });
  });
}

function updatePaths() {
  desktopWaveInstances.forEach((wave, i) => {
    const cfg = lines[i] || { amplitude: 12, frequency: 2 };
    updateLetterLineWave(wave, glitchProgress, cfg.amplitude, cfg.frequency, true);
  });
  mobileWaveInstances.forEach((wave, i) => {
    const cfg = mobileWaveLines[i] || { amplitude: 12, frequency: 2 };
    updateLetterLineWave(wave, glitchProgress, cfg.amplitude, cfg.frequency, true);
  });
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
setCalendarVisible(false);
  const id = e.target.dataset.artiste;
  artisteCourant = parseInt(id, 10);
  const data = artistes[id];
  btnPlayReady = false;
const next = getNextArtisteId(artisteCourant);

  document.getElementById('next_artist').textContent = `→ ${artistes[next].nom}`;
  if (!data) return;

const titreEl0 = document.querySelector('#gauche .titre');
const details0 = currentLang === "FR" && data.detailsFR ? data.detailsFR : data.details;
titreEl0.innerHTML = formatTitreArtiste(data.nom, data.titre, titreEl0, details0);
loadArtistMedia(data);

if (!isArtistAvailableToday(data.nom) && !isMobile()) {
  setTimeout(() => showNextDatesForArtist(data.nom), 3200);
}

document.getElementById('fullscreen').style.display = 'none';
btnPlay.classList.add('hidden');
btnPlay.style.pointerEvents = 'none';
btnPlay.style.opacity = '0';
renderTexteOeuvre(data, currentLang);
document.getElementById('texte-oeuvre').scrollTop = 0;
document.getElementById('texte-wrapper').scrollTop = 0;
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
  const currentData = artistes[artisteCourant];
  if (!isArtistAvailableToday(currentData.nom)) {
    btnPlay.style.opacity = '0.15';
    btnPlay.style.pointerEvents = 'none';
    btnPlay.classList.add('hidden');
  } else if (currentData?.vimeo) {
    btnPlay.style.opacity = '1';
    btnPlay.style.pointerEvents = 'auto';
  }
    btnPlayReady = true;
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
vimeoPlayer = null;
    hasStarted = false;
    video.pause();
    video.src = '';
    video.poster = '';
    video.style.opacity = '';
    video.style.transition = '';
    if (vimeoFrame) {
      vimeoFrame.src = '';
      vimeoFrame.style.opacity = '0';
      vimeoFrame.style.display = 'none';
    }
    info3AlreadyShown = false;
    btnPlay.textContent = translations[currentLang].playVideo;
    btnPlay.classList.remove('playing');
    btnPlay.classList.add('hidden');
btnPlay.style.whiteSpace = '';

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

videoWrapper.classList.remove('is-vimeo');
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
  document.getElementById('info').textContent = '+';
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
setCalendarVisible(true);
document.getElementById('about')?.classList.remove('hidden-content');
setOpacity(document.getElementById('about'), '1', '1.5s');
  document.getElementById('btn_cine_switch').style.transition = 'opacity 1.5s ease'; // ← ici
  document.getElementById('btn_cine_switch').style.opacity = '1';
document.getElementById('texte-oeuvre').scrollTop = 0;
document.getElementById('texte-wrapper').scrollTop = 0;

    }, 1200);

  });
}

document.getElementById('titre-haut').addEventListener('click', () => {
  btnHome.click();
});
// ══════════════════════════════════════════════
// ── PLAY / PAUSE VIDÉO ────────────────────────
// ══════════════════════════════════════════════


async function handlePlayPauseClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const data = artistes[artisteCourant];


  if (data?.vimeo) {
    if (hasStarted && vimeoPlayer) {
      vimeoPlayer.getPaused().then(paused => {
        if (paused) {
          vimeoPlayer.play();
        } else {
          vimeoPlayer.pause();
        }
      });
      return;
    }

    video.style.transition = 'opacity 0.8s ease';
    video.style.opacity = '0';
    btnPlay.style.opacity = '0';
    btnPlay.style.pointerEvents = 'none';

setTimeout(() => {
      video.style.display = 'none';
      vimeoFrame.style.backgroundImage = 'none';
      const hash = data.vimeoHash ? `&h=${data.vimeoHash}` : '';
const queryParams = [
        'badge=0', 'autopause=0', 'player_id=0', 'app_id=58479',
        'title=0', 'byline=0', 'portrait=0', 'color=ffffff',
        'controls=0', 'dnt=1',
        ...(isMobile() ? ['background=1'] : []),
      ].join('&');

      vimeoFrame.src = `https://player.vimeo.com/video/${data.vimeo}?${queryParams}${hash}&autoplay=1`;
      vimeoFrame.style.display = 'block';
      vimeoFrame.style.transition = 'opacity 0.8s ease';
      vimeoFrame.style.opacity = '1';
      video.style.display = 'none';
hasStarted = true;
btnPlay.style.pointerEvents = '';
if (typeof window.toggleVimeoOverlay === 'function') window.toggleVimeoOverlay();
if (typeof window.toggleVimeoOverlayDesktop === 'function') window.toggleVimeoOverlayDesktop();



      vimeoPlayer = new Vimeo.Player(vimeoFrame);

      vimeoPlayer.on('timeupdate', (data) => {
        const pct = (data.seconds / data.duration) * 100;
        timelineFill.style.width = pct + '%';
      });

vimeoPlayer.on('play', () => {
        btnPlay.textContent = 'Pause';
        btnPlay.classList.add('playing');
        btnPlay.style.opacity = '0';
        btnPlay.style.pointerEvents = 'none';
        scheduleShowFullscreenBtn();
        if (isMobile() && typeof onMobileVideoPlay === 'function') onMobileVideoPlay();
      });

      vimeoPlayer.on('pause', () => {
        btnPlay.textContent = translations[currentLang].playVideo;
        btnPlay.classList.remove('playing');
        btnPlay.style.opacity = '1';
        btnPlay.style.pointerEvents = 'auto';
        hideFullscreenBtn();
        showInfo3();
        if (isMobile() && typeof onMobileVideoPause === 'function') onMobileVideoPause();
      });

vimeoPlayer.on('ended', () => {
  btnPlay.textContent = translations[currentLang].playVideo;
  btnPlay.classList.remove('playing');
  if (isMobile() && typeof onMobileVideoPause === 'function') onMobileVideoPause();
  vimeoFrame.style.transition = 'opacity 0.8s ease';
  vimeoFrame.style.opacity = '0';
  setTimeout(() => {
    vimeoFrame.style.display = 'none';
    video.style.display = 'block';
    video.style.opacity = '1';
    positionVimeoBtn();
  }, 800);
  hasStarted = false;
  vimeoPlayer = null;
  showInfo3();
  if (typeof window.toggleVimeoOverlay === 'function') window.toggleVimeoOverlay();
  if (typeof window.toggleVimeoOverlayDesktop === 'function') window.toggleVimeoOverlayDesktop();

  // sort automatiquement du plein écran si la vidéo Vimeo se termine pendant qu'on y est
  if (isFullscreen) {
    if (isMobile() && videoWrapper.classList.contains('pseudo-fullscreen')) {
      exitPseudoFullscreenMobile();
    } else if (!isMobile() && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
});

    }, 800);
    return;
  }

if (video.paused) {
    if (!hasStarted) {
      video.style.transition = 'opacity 0.8s ease';
      video.style.opacity = '0';
      btnPlay.style.opacity = '0';
      btnPlay.style.pointerEvents = 'none';

setTimeout(async () => {
        try {
          if (data?.randomStart && video.duration) {
            await new Promise((resolve) => {
              video.addEventListener('seeked', resolve, { once: true });
              video.currentTime = Math.random() * video.duration;
            });
          }
          await video.play();
          hasStarted = true;
          fullscreenUnlocked = true;
          video.style.opacity = '1';
          btnPlay.style.pointerEvents = 'none';
          videoWrapper.style.cursor = 'none';

setTimeout(() => {
            btnPlay.style.pointerEvents = '';
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
}

btnPlay.addEventListener('click', handlePlayPauseClick);


let fullscreenShowTimer = null;

function scheduleShowFullscreenBtn() {
  clearTimeout(fullscreenShowTimer);
  fullscreenShowTimer = setTimeout(() => {
    fullscreenBtn.style.display = 'block';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fullscreenBtn.style.opacity = '1';
        fullscreenVisible = true;
      });
    });
  }, 2000);
}

function hideFullscreenBtn() {
  clearTimeout(fullscreenShowTimer);
  fullscreenBtn.style.transition = 'opacity 0.5s ease';
  fullscreenBtn.style.opacity = '0';
  fullscreenVisible = false;
}







video.addEventListener('play', () => {
  btnPlay.textContent = 'Pause';
  btnPlay.classList.add('playing');
  scheduleShowFullscreenBtn();
});

video.addEventListener('pause', () => {
  btnPlay.textContent = 'Play Video';
  btnPlay.classList.remove('playing');
  hideFullscreenBtn();

  if (hasStarted) {
    setTimeout(() => showInfo3(), 1500);
  }
});

video.addEventListener('ended', () => {
  btnPlay.textContent = 'Play Video';
  btnPlay.classList.remove('playing');
  hideFullscreenBtn();
  if (isMobile() && typeof onMobileVideoPause === 'function') onMobileVideoPause();

  // sort automatiquement du plein écran si la vidéo se termine pendant qu'on y est
  if (isFullscreen) {
    if (isMobile() && videoWrapper.classList.contains('pseudo-fullscreen')) {
      exitPseudoFullscreenMobile();
    } else if (!isMobile() && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
});

video.addEventListener('error', () => {
  console.error('video error:', video.currentSrc);
});


// ══════════════════════════════════════════════
// ── CURSEUR & BOUTONS — DISPARITION AUTO ──────
// ══════════════════════════════════════════════

function showBtn() {
    if (!btnPlayReady) return;
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

// ══════════════════════════════════════════════
// ── TAP POUR AFFICHER PLAY/PAUSE (MOBILE)
// ══════════════════════════════════════════════
let mobileBtnPlayHideTimer = null;

function showBtnMobile() {
    if (!btnPlayReady) return;
  const inPseudoFullscreen = videoWrapper.classList.contains('pseudo-fullscreen');

  btnPlay.style.opacity = '1';
  btnPlay.style.pointerEvents = 'auto';

  if (inPseudoFullscreen) {
    fullscreenExit.style.opacity = '1';
    fullscreenExit.style.pointerEvents = 'auto';
    btnRestart.style.opacity = '1';
    btnRestart.style.pointerEvents = 'auto';
  }

  clearTimeout(mobileBtnPlayHideTimer);
  mobileBtnPlayHideTimer = null;

  mobileBtnPlayHideTimer = setTimeout(() => {
    if (inPseudoFullscreen) {
      btnPlay.style.opacity = '0';
      btnPlay.style.pointerEvents = 'none';
      fullscreenExit.style.opacity = '0';
      fullscreenExit.style.pointerEvents = 'none';
      btnRestart.style.opacity = '0';
      btnRestart.style.pointerEvents = 'none';
    } else if (!video.paused || hasStarted) {
      btnPlay.style.opacity = '0';
      btnPlay.style.pointerEvents = 'none';
    }
  }, 2000);
}



if (window.innerWidth > 768) {
  videoWrapper.addEventListener('mousemove', showBtn);
  videoWrapper.addEventListener('mouseenter', showBtn);

  // overlay invisible par-dessus l'iframe Vimeo : un <iframe> capte les
  // événements souris dans son propre document, donc mousemove ne remonte
  // pas naturellement au videoWrapper parent — cet overlay relaie l'event.
  const vimeoTapOverlayDesktop = document.createElement('div');
  vimeoTapOverlayDesktop.id = 'vimeo-tap-overlay-desktop';
  videoWrapper.appendChild(vimeoTapOverlayDesktop);

  vimeoTapOverlayDesktop.addEventListener('mousemove', showBtn);
  vimeoTapOverlayDesktop.addEventListener('mouseenter', showBtn);

  vimeoTapOverlayDesktop.addEventListener('click', (e) => {
    handlePlayPauseClick(e);
  });

  function toggleVimeoOverlayDesktop() {
    const data = artistes[artisteCourant];
    vimeoTapOverlayDesktop.style.display = (data?.vimeo && hasStarted) ? 'block' : 'none';
  }
  window.toggleVimeoOverlayDesktop = toggleVimeoOverlayDesktop;
}


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
  const data = artistes[artisteCourant];
if (data?.vimeo && vimeoPlayer) {
    vimeoPlayer.getDuration().then(duration => {
      vimeoPlayer.setCurrentTime(pct * duration);
    });
  } else {
    video.currentTime = pct * video.duration;
  }
});

// ══════════════════════════════════════════════
// ── FULLSCREEN ────────────────────────────────
// ══════════════════════════════════════════════

fullscreenBtn.addEventListener('click', () => {
  const data = artistes[artisteCourant];
  wasInCinemaModeBeforeFullscreen = isCinemaMode;

  if (isMobile()) {
    if (!isFullscreen) {
      enterPseudoFullscreenMobile();
    } else {
      exitPseudoFullscreenMobile();
    }
    return;
  }

  if (!isFullscreen) {
    videoWrapper.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

fullscreenExit.addEventListener('click', () => {
  if (isMobile()) {
    exitPseudoFullscreenMobile();
  } else {
    document.exitFullscreen();
  }
});

function getPseudoFullscreenUIElements() {
  return [
    document.getElementById('titre-haut'),
    document.querySelector('#gauche .titre'),
    document.getElementById('info'),
    document.getElementById('texte-oeuvre'),
    document.getElementById('list_artist'),
    document.getElementById('next_artist'),
    document.getElementById('btn_home'),
    document.getElementById('btn-lang'),
    document.getElementById('btn_cine_switch'),
        document.getElementById('video'),
                document.getElementById('fullscreen'),
    btnPlay,
  ];
}

function enterPseudoFullscreenMobile() {
  mobileFullscreenLock = true;



  // tente de verrouiller l'orientation en portrait (option A — fonctionne selon navigateur)
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(() => {
      // silencieux si refusé — l'option B (listener orientationchange) prend le relais
    });
  }

  const videoContainer = document.getElementById('video-container');
  if (videoContainer) {
    videoContainer.style.webkitMaskImage = 'none';
    videoContainer.style.maskImage = 'none';
  }

  const titreHautEl = document.getElementById('titre-haut');
  const videoEl = document.getElementById('video');

  // cache instantanément la vidéo et le titre-haut, sans fade
  if (titreHautEl) {
    titreHautEl.style.transition = 'none';
    titreHautEl.style.opacity = '0';
  }
  if (videoEl) {
    videoEl.style.transition = 'none';
    videoEl.style.opacity = '0';
  }

  // coupe aussi la transition du bouton play/pause pendant le passage en plein écran
  btnPlay.style.transition = 'none';

  document.body.classList.add('pseudo-fullscreen-active');

  const uiElements = getPseudoFullscreenUIElements();

  // fade normal pour le reste de l'UI (mais on exclut video/titre-haut, déjà cachés)
  uiElements.forEach(el => {
    if (el === titreHautEl || el === videoEl) return;
    setOpacity(el, '0', '1s');
  });

  setTimeout(() => {
    const part3ForScroll = document.getElementById('part_3');
    if (part3ForScroll) {
      part3ForScroll.scrollTop = 0;
      part3ForScroll.style.overflow = 'hidden';
    }

    videoWrapper.classList.add('pseudo-fullscreen');
    isFullscreen = true;
    fullscreenBtn.textContent = translations[currentLang].exitFullscreen;
    timelineFull.style.display = 'block';

    fullscreenExit.style.display = 'block';
    btnRestart.style.display = 'block';

    setOpacity(fullscreenExit, '1', '1s');
    setOpacity(btnRestart, '1', '1s');

    // la vidéo réapparaît en fade, une fois le scroll déjà resetté
    if (videoEl) {
      void videoEl.offsetHeight;
      videoEl.style.transition = '';
      setOpacity(videoEl, '1', '1s');
    }

    if (typeof showBtnMobile === 'function') {
      showBtnMobile();
    }

    // restaure la transition du bouton play/pause pour la suite
    void btnPlay.offsetHeight;
    btnPlay.style.transition = '';

    // titre-haut reste caché en plein écran, on restaure juste sa transition pour plus tard
    if (titreHautEl) {
      void titreHautEl.offsetHeight;
      titreHautEl.style.transition = '';
    }

    mobileFullscreenLock = false;
  }, 1000);
}

function exitPseudoFullscreenMobile() {
    mobileFullscreenLock = true;


  // relâche le verrou d'orientation
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock();
  }

  const videoEl = document.getElementById('video');
  const uiElements = getPseudoFullscreenUIElements();
  const isPlaying = !video.paused;

  setOpacity(videoEl, '0', '0.6s');
  setOpacity(fullscreenExit, '0', '0.6s');
  setOpacity(btnRestart, '0', '0.6s');
  videoWrapper.style.transition = 'background-color 0.6s ease';
  videoWrapper.style.backgroundColor = 'transparent';

  setTimeout(() => {
    videoWrapper.classList.remove('pseudo-fullscreen');
    document.body.classList.remove('pseudo-fullscreen-active');
    videoWrapper.style.transition = '';
    videoWrapper.style.backgroundColor = '';

    const part3ForScrollExit = document.getElementById('part_3');
    if (part3ForScrollExit) {
      part3ForScrollExit.style.overflow = '';
    }

    isFullscreen = false;
    fullscreenBtn.textContent = translations[currentLang].fullscreen;
    timelineFull.style.display = 'none';
    fullscreenExit.style.display = 'none';
    btnRestart.style.display = 'none';

    positionVimeoBtn();

const infoConditionalIds = ['btn_home', 'btn_cine_switch', 'btn-lang'];

uiElements.forEach(el => {
  if (!el) return;
  if (el.id === 'fullscreen') return;
  if (el.id === 'next_artist' && isPlaying) return;

  if (el.id === 'texte-oeuvre') {
    // ne réaffiche le texte que s'il était réellement ouvert (état du +/-) avant le plein écran
    if (el.classList.contains('visible')) {
      setOpacity(el, '1', '0.6s');
    }
    return;
  }

  if (infoConditionalIds.includes(el.id) && !info3AlreadyShown) return;
  setOpacity(el, '1', '0.6s');
});
  mobileFullscreenLock = false;
  }, 600);
}



document.addEventListener('fullscreenchange', () => {
  const data = artistes[artisteCourant];

if (document.fullscreenElement) {
    isFullscreen = true;
    fullscreenBtn.textContent = translations[currentLang].exitFullscreen;
    const currentDataFs = artistes[artisteCourant];
    timelineFull.style.display = currentDataFs?.noTimeline ? 'none' : 'block';
    fullscreenExit.style.display = 'block';
    btnRestart.style.display = 'block';
    btnRestart.style.opacity = '1';

const mobileFs = isMobile();

if (data?.vimeo) {
      if (mobileFs) {
        vimeoFrame.style.width    = '100svh';
        vimeoFrame.style.height   = '100vw';
      } else {
        vimeoFrame.style.width    = '100vw';
        vimeoFrame.style.height   = 'calc(100vw * 9 / 16)';
      }
      vimeoFrame.style.position = 'absolute';
      vimeoFrame.style.top      = '50%';
      vimeoFrame.style.left     = '50%';
      vimeoFrame.style.transform = mobileFs
        ? 'translate(-50%, -50%) rotate(90deg)'
        : 'translate(-50%, -50%)';
      btnPlay.style.top       = '50%';
      btnPlay.style.left      = '50%';
      btnPlay.style.right     = 'auto';
      btnPlay.style.transform = mobileFs
        ? 'translate(-50%, -50%) rotate(90deg)'
        : 'translate(-50%, -50%)';

    } else {
      btnPlay.style.top       = '50%';
      btnPlay.style.left      = '50%';
      btnPlay.style.right     = 'auto';
      btnPlay.style.bottom    = 'auto';
      btnPlay.style.transform = mobileFs
        ? 'translate(-50%, -50%) rotate(90deg)'
        : 'translate(-50%,-50%)';

      if (mobileFs) {
        video.style.width          = '100svh';
        video.style.height         = '100vw';
        video.style.objectPosition = 'center center';
      } else {
        video.style.width          = '100vw';
        video.style.height         = '95vh';
        video.style.objectPosition = 'center center';
      }
      document.fullscreenElement.addEventListener('mousemove', showBtn);
      showBtn();
    }

} else {
    isFullscreen = false;
    fullscreenBtn.textContent = translations[currentLang].fullscreen;
    timelineFull.style.display = 'none';
    fullscreenExit.style.display = 'none';
    btnRestart.style.display = 'none';
    btnRestart.style.opacity = '0';
    btnPlay.style.left = 'auto';
if (wasInCinemaModeBeforeFullscreen) {
  cinemaOverlay.style.transition = 'none';
  cinemaOverlay.classList.remove('closing');
  cinemaOverlay.classList.add('active');
  document.body.classList.add('cinema-mode');
  document.documentElement.style.setProperty('--p2typo', 'white');
  setTimeout(() => {
    cinemaOverlay.style.transition = '';
  }, 50);
}

    if (data?.vimeo) {
      vimeoFrame.style.width    = '';
      vimeoFrame.style.height   = '';
      vimeoFrame.style.position = '';
      vimeoFrame.style.top      = '';
      vimeoFrame.style.left     = '';
            vimeoFrame.style.transform = '';
       positionVimeoBtn();
} else {
  if (window.innerWidth > 768) {
    video.style.width          = '63vw';
    video.style.height         = '80vh';
    video.style.objectPosition = 'right center';
  } else {
    video.style.width          = '';
    video.style.height         = '';
    video.style.objectPosition = '';
  }
  video.dispatchEvent(new Event('loadedmetadata'));
}
  }
});


btnRestart.addEventListener('click', () => {
  const data = artistes[artisteCourant];
 if (data?.vimeo && vimeoPlayer) {
    vimeoPlayer.setCurrentTime(0).then(() => vimeoPlayer.play());
  } else {
    video.currentTime = 0;
    video.play();
  }
  showBtn();
});


// ══════════════════════════════════════════════
// ── CLICK SUR + ───────────────────────────────
// ══════════════════════════════════════════════

document.getElementById('info').addEventListener('click', () => {
  const texte = document.getElementById('texte-oeuvre');
  const info = document.getElementById('info');
  const data = artistes[artisteCourant];
  const isAvailable = isArtistAvailableToday(data.nom);
  const showingDates = texte.dataset.mode === 'dates';
  const isVisible = texte.classList.contains('visible');

if (isVisible && !showingDates) {
    // FERMETURE du texte oeuvre
    texte.style.transition = 'opacity 0.8s ease';
    texte.style.opacity = '0';
    setTimeout(() => {
      texte.classList.remove('visible');
      texte.style.transition = '';
      texte.style.opacity = '';
      texteWrapper.classList.remove('visible');
      info.textContent = '+';
      if (!isAvailable) showNextDatesForArtist(data.nom);
    }, 420);

  } else if (showingDates || !isVisible) {
    // OUVERTURE du texte oeuvre
    texte.style.transition = 'opacity 0.4s ease';
    texte.style.opacity = '0';
    setTimeout(() => {
      renderTexteOeuvre(data, currentLang);
      texte.dataset.mode = 'text';
      texte.classList.add('visible');
      texteWrapper.classList.add('visible');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          texte.style.opacity = '1';
          info.textContent = '–';
          document.querySelector('.artiste-details')?.classList.add('visible');
          setTimeout(() => {
            texte.style.transition = '';
            texte.style.opacity = '';
          }, 450);
        });
      });
    }, 420);

    setTimeout(() => {
      // n'affiche next_artist / list_artist que si la vidéo n'est pas en train de jouer
      if (!btnPlay.classList.contains('playing')) {
        showInfo3();
      }
      setOpacity(document.getElementById('btn_cine_switch'), '1', '0.8s');
    }, 1500);
  }
});



function showNextDatesForArtist(nom) {
  if (isMobile() && !info3AlreadyShown) {
  showInfo3Mobile();
}
  const texte = document.getElementById('texte-oeuvre');
  if (!texte) return;
  texte.dataset.mode = 'dates';


  const today = getToday();
  const entries = schedule.filter(e => e.artist === nom && e.date >= today);

  if (entries.length === 0) {
    texte.innerHTML = '<div class="texte-dates">no upcoming screenings</div>';
  } else {
    const label = currentLang === 'FR' ? 'prochaines diffusions' : 'upcoming screenings';
    const dates = entries.map(e => {
      const dateObj = new Date(e.date + 'T12:00:00');
      return dateObj.toLocaleDateString(currentLang === 'FR' ? 'fr-FR' : 'en-GB', 
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }).join('<br>');
texte.innerHTML = `<div class="texte-dates"><u>${label}</u><div style="margin-top: 0.8em">${dates}</div></div>`;
  }

  texte.style.opacity = '0';
  texte.classList.add('visible');
  texteWrapper.classList.add('visible');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      texte.style.transition = 'opacity 0.4s ease';
      texte.style.opacity = '1';
      setTimeout(() => {
        texte.style.transition = '';
        texte.style.opacity = '';
      }, 450);
    });
  });

if (isMobile()) {
  setTimeout(() => {
    const part3El = document.getElementById('part_3');
    const texteEl = document.getElementById('texte-oeuvre');
    if (part3El && texteEl) {
      const start = part3El.scrollTop;
const target = texteEl.getBoundingClientRect().top + part3El.scrollTop - 100;
      const duration = 1200;
      const startTime = performance.now();

      function ease(t) {
        return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
      }

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        part3El.scrollTop = start + (target - start) * ease(progress);
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }
  }, 300);
}

setTimeout(() => {
  showInfo3();
  setOpacity(document.getElementById('btn_cine_switch'), '1', '0.8s');
    setOpacity(document.getElementById('info'), '1', '0.8s');
}, 800);


}


// ══════════════════════════════════════════════
// ── NEXT ARTIST ───────────────────────────────
// ══════════════════════════════════════════════

document.getElementById('next_artist').addEventListener('click', () => {
  if (isTransitioning) return;
  const next = getNextArtisteId(artisteCourant);
  artisteCourant = next;
  transitionToArtist(next);
});

function transitionToArtist(id) {
  const data = artistes[id];
  if (!data) return;
  const titre = document.querySelector('#gauche .titre');
  const texte = document.getElementById('texte-oeuvre');
   const titreHaut = document.getElementById('titre-haut');
  const infoBtn = document.getElementById('info');
  const texteVisible = texte.classList.contains('visible');
  isTransitioning = true;
  btnPlayReady = false;
if (!isArtistAvailableToday(data.nom)) {
  texte.classList.remove('visible');
  texteWrapper.classList.remove('visible');
}
  // — SORTIE
[video, titre, infoBtn, texte].forEach(el => {
  el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
});
texte.classList.remove('visible');
texteWrapper.classList.remove('visible');
btnPlay.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
btnPlay.style.opacity = '0';

setTimeout(() => {
    // — RESET contenu
const detailsT = currentLang === "FR" && data.detailsFR ? data.detailsFR : data.details;
titre.innerHTML = formatTitreArtiste(data.nom, data.titre, titre, detailsT);

loadArtistMedia(data);

    texte.scrollTop = 0;
    const texteWrapperEl = document.getElementById('texte-wrapper');
    if (texteWrapperEl) texteWrapperEl.scrollTop = 0;

    if (isMobile()) {
      const part3El = document.getElementById('part_3');
      if (part3El) part3El.scrollTop = 0;
      if (typeof recalcTitreHeight === 'function') recalcTitreHeight();
      if (typeof window.updateBottomMaskMobile === 'function') window.updateBottomMaskMobile();
    }


    hasStarted = false;
    vimeoPlayer = null;
    btnPlay.textContent = translations[currentLang].playVideo;
    btnPlay.classList.remove('playing');
    btnPlay.style.pointerEvents = '';

infoBtn.textContent = '+';
if (!info3AlreadyShown) { texte.classList.remove('visible'); texteWrapper.classList.remove('visible'); }
    if (!info3AlreadyShown) hideInfo3();
    if (info3AlreadyShown) showInfo3();

fullscreenBtn.style.display = 'none';
    fullscreenBtn.style.opacity = '0';
    fullscreenVisible = false;



    const next2 = getNextArtisteId(id);
    document.getElementById('next_artist').textContent = `→ ${artistes[next2].nom}`;

    // — ENTRÉE : invisible d'abord
    [video, titre, infoBtn, btnPlay].forEach(el => {
      el.style.transition = 'none';
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
    });
if (texteVisible && isArtistAvailableToday(data.nom)) {
  texte.style.transition = 'none';
  texte.style.opacity = '0';
  texte.style.transform = 'translateY(12px)';
}

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
[video, titre, infoBtn].forEach(el => {
  el.style.transition = 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
});

        // nettoyage
        setTimeout(() => {
          video.style.transition = '';
          video.style.opacity = '';
          video.style.transform = '';
          texte.style.transition = '';
          texte.style.opacity = '';
          texte.style.transform = '';
          infoBtn.style.transition = '';
          infoBtn.style.opacity = '';
          infoBtn.style.transform = '';
          titre.style.transition = '';
          titre.style.transform = '';
btnPlay.style.transition = '';
btnPlay.style.transform = '';
btnPlay.style.opacity = '0';
btnPlay.style.top = '';
btnPlay.style.right = '';
btnPlay.style.left = '';

const currentData = artistes[artisteCourant];
if (currentData?.vimeo || currentData?.youtube) {
  setTimeout(() => positionVimeoBtn(), 100);
}
          titreHaut.style.transition = '';
          titreHaut.style.transform = '';    
document.getElementById('texte-oeuvre').scrollTop = 0;
document.getElementById('texte-wrapper').scrollTop = 0;       


          video.dispatchEvent(new Event('loadedmetadata'));

setTimeout(() => {
  btnPlay.style.transition = 'opacity 0.6s ease';
  const currentData = artistes[artisteCourant];
  if (!isArtistAvailableToday(currentData.nom)) {
    btnPlay.classList.add('hidden');
    btnPlay.style.opacity = '0';
    btnPlay.style.pointerEvents = 'none';
      if (isMobile()) showInfo3Mobile();
      else showInfo3();
      showNextDatesForArtist(currentData.nom);
  } else {
    btnPlay.classList.remove('hidden');
    btnPlay.style.opacity = '1';
    btnPlay.style.pointerEvents = 'auto';
    
  }
  btnPlayReady = true;
  setTimeout(() => {
    btnPlay.style.transition = '';
          isTransitioning = false;
  }, 650);
}, 100);
        }, 1500);
      });
    });
}, isMobile() ? 400 : 850);
}

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
  cinemaOverlay.classList.remove('active', 'closing');
  if (tunnelActive) {
    closeTunnel();
  } else {
    renderTunnel(0, 0);
  }
}


// ══════════════════════════════════════════════
// ── ABOUT PANEL ───────────────────────────────
// ══════════════════════════════════════════════

const boiteAbout = document.getElementById('boite_about');
const aboutPanel = document.getElementById('about-panel');

let aboutOpen = false;
let aboutTextTimer = null;

function handleAboutScroll() {
  const scrollY = document.getElementById('about-content').scrollTop;
  const label = document.getElementById('about-label');
  label.style.transition = 'none';
  const opacity = Math.max(0.2, 1 - scrollY / 50);
  label.style.opacity = opacity;
}

function openAbout() {
  document.getElementById('about-content').scrollTop = 0;
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
  document.getElementById('about-content').addEventListener('scroll', handleAboutScroll);
}

function closeAbout() {
  if (!aboutOpen) return;
  aboutOpen = false;
  clearTimeout(aboutTextTimer);
  boiteAbout.classList.remove('show-text');
  boiteAbout.classList.remove('open');
  boiteAbout.style.width = currentLang === "FR" ? "90px" : "70px";
  document.getElementById('about-close-mobile')?.style.setProperty('opacity', '0');
  document.getElementById('about-close-mobile')?.style.setProperty('pointer-events', 'none');
  document.getElementById('about-content').removeEventListener('scroll', handleAboutScroll);
  document.getElementById('about-content').scrollTop = 0;
  const label = document.getElementById('about-label');
  label.style.transition = 'opacity 0.5s ease';
  label.style.opacity = '1';
}
boiteAbout.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isMobile() && aboutOpen) return;
  if (aboutOpen) {
    closeAbout();
  } else {
    openAbout();
  }
});

document.addEventListener('click', (e) => {
  if (isMobile()) return;
  if (e.target.closest('#about-calendar-link')) return;
  if (!boiteAbout.contains(e.target)) {
    closeAbout();
  }
});

document.getElementById('about-close-mobile')?.addEventListener('click', (e) => {
  e.stopPropagation();
  closeAbout();
});


// ══════════════════════════════
// ── CALENDAR PANEL
// ══════════════════════════════

function openCalendar() {
  if (calendarOpen) return;
  calendarOpen = true;
    document.body.classList.add('calendar-open-cursor');  
  const nav = document.getElementById('calendar-artists-nav');
  if (nav) nav.style.pointerEvents = 'auto';
    clearTimeout(calendarTextTimer);
  buildCalendarContent();
  boiteCalendar.classList.add('open');
  const btnClose = document.getElementById('calendar-close-mobile');
  if (btnClose) {
    btnClose.style.opacity = '1';
    btnClose.style.pointerEvents = 'auto';
  }


const btnSee = document.getElementById('mobile-see-artists');
if (btnSee && isMobile()) {
  btnSee.style.opacity = '0.2';
  btnSee.style.pointerEvents = 'none';
}


  boiteCalendar.classList.remove('show-text');



  calendarTextTimer = setTimeout(() => {
    boiteCalendar.classList.add('show-text');
    setTimeout(() => {
      const todayEl = calendarContent.querySelector('.today');
      if (todayEl) scrollToToday();
    }, 100);
  }, 850);
}

function closeCalendar() {
  if (!calendarOpen) return;
  calendarOpen = false;
    document.body.classList.remove('calendar-open-cursor'); 
  clearTimeout(calendarTextTimer);
  resetCalendarHighlight();
  boiteCalendar.classList.remove('show-text', 'open');

  if (isMobile()) {
    const btnClose = document.getElementById('calendar-close-mobile');
    if (btnClose) {
      btnClose.style.opacity = '0';
      btnClose.style.pointerEvents = 'none';
    }
  }

  const btnSee = document.getElementById('mobile-see-artists');
  if (btnSee && isMobile()) {
    btnSee.style.opacity = '1';
    btnSee.style.pointerEvents = 'auto';
  }

  const nav = document.getElementById('calendar-artists-nav');
  if (nav) nav.style.pointerEvents = 'none';
}  // ← cette accolade manquait

document.getElementById('calendar-label').addEventListener('click', e => {
  e.stopPropagation();
  calendarOpen ? closeCalendar() : openCalendar();
});

document.addEventListener('click', () => {
  if (calendarOpen) closeCalendar();
});


// visible comme le boite_about — déclenché depuis playIntro()
// ajouter dans playIntro() au même moment que boite_about :
// boiteCalendar?.classList.add('visible');

function getNextDateForArtist(nom) {
  const today = getToday();
  const entry = schedule.find(e => e.artist === nom && e.date >= today);
  if (!entry) return null;
  const dateObj = new Date(entry.date + 'T12:00:00');
  return dateObj.toLocaleDateString(currentLang === 'FR' ? 'fr-FR' : 'en-GB', 
    { weekday: 'long', day: 'numeric', month: 'long' });
}



function highlightCalendarArtist(nom) {
  calendarContent.querySelectorAll('.calendar-entry').forEach(el => {
    const isMatch = el.dataset.artistName === nom || el.dataset.artistName === 'ALL';
    if (isMatch) {
      el.classList.remove('collapsed');
el.style.opacity = '1';
      const artistSpan = el.querySelector('.calendar-artist');
      const dateSpan = el.querySelector('.calendar-date');
if (artistSpan) {
  artistSpan.style.opacity = (el.dataset.artistName === 'ALL' || isMobile()) ? '1' : '0';
  artistSpan.style.transition = 'opacity 0.3s ease';
}
      if (dateSpan) {
        dateSpan.style.opacity = '1';
        dateSpan.style.transition = 'opacity 0.3s ease';
      }
    } else {
      el.classList.add('collapsed');
    }
  });
}

function resetCalendarHighlight() {
  calendarContent.querySelectorAll('.calendar-entry').forEach(el => {
    el.classList.remove('collapsed');
    el.style.opacity = '1';
    const dateSpan = el.querySelector('.calendar-date');
    if (dateSpan) {
      dateSpan.style.opacity = '0.6';
      dateSpan.style.transition = 'opacity 0.3s ease';
    }
    const artistSpan = el.querySelector('.calendar-artist');
    if (artistSpan) {
      artistSpan.style.opacity = '0';
      artistSpan.style.transition = 'none';
    }
  });

  setTimeout(() => {
    // vérifie qu'on n'est plus en hover d'aucun nom
    const anyHovered = document.querySelector('.calendar-nav-artist:hover');
    if (!anyHovered) {
      calendarContent.querySelectorAll('.calendar-entry').forEach(el => {
        const artistSpan = el.querySelector('.calendar-artist');
        if (artistSpan) {
          artistSpan.style.transition = 'opacity 0.4s ease';
          artistSpan.style.opacity = '1';
        }
      });
    }
  }, 450);
}

function getOrdinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

function buildCalendarContent() {
  const today = getToday();
  calendarContent.innerHTML = '';

  const nav = document.getElementById('calendar-artists-nav');
  nav.innerHTML = '';
  const artistNames = [...new Set(schedule
    .filter(e => e.artist !== 'ALL' && e.artist !== 'CLOSED')
    .map(e => e.artist))];

  artistNames.forEach((nom, index) => {
    if (index === 4) {
      const br = document.createElement('div');
      br.style.width = '100%';
      nav.appendChild(br);
    }
    const span = document.createElement('span');
    span.className = 'calendar-nav-artist';
    span.textContent = nom;
    span.addEventListener('mouseenter', () => {
      highlightCalendarArtist(nom);
      nav.querySelectorAll('.calendar-nav-artist').forEach(el => {
        el.style.opacity = el.textContent === nom ? '1' : '0.15';
      });
    });
    span.addEventListener('mouseleave', () => {
      resetCalendarHighlight();
      nav.querySelectorAll('.calendar-nav-artist').forEach(el => {
        el.style.opacity = '';
      });
    });
    nav.appendChild(span);
  });

  schedule.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'calendar-entry' + (entry.date === today ? ' today' : '');
    div.dataset.artistName = entry.artist;

    const dateObj = new Date(entry.date + 'T12:00:00');
    const dateStr = currentLang === 'FR'
      ? dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let artistText;
    if (entry.artist === 'ALL') {
      artistText = currentLang === 'FR' ? 'tous les artistes' : 'all artists';
    } else if (entry.artist === 'CLOSED') {
      artistText = currentLang === 'FR' ? 'fermé' : 'closed';
    } else {
      artistText = entry.work
        ? `${entry.artist} — <em>${entry.work}</em>`
        : entry.artist;
    }

// Dans buildCalendarContent(), remplacer la ligne div.innerHTML par :
const dateSpan = document.createElement('span');
dateSpan.className = 'calendar-date';
dateSpan.textContent = dateStr;

const artistSpan = document.createElement('span');
artistSpan.className = 'calendar-artist';


artistSpan.innerHTML = artistText;
if (isMobile() && entry.artist !== 'ALL' && entry.artist !== 'CLOSED') {
  artistSpan.style.cursor = 'pointer';
  artistSpan.addEventListener('click', (e) => {
    e.stopPropagation();
    const isFiltered = calendarContent.querySelector('.calendar-entry.collapsed');
    if (isFiltered) {
      resetCalendarHighlight();
    } else {
      highlightCalendarArtist(entry.artist);
    }
  });
}

if (isMobile() && entry.artist === 'ALL') {
  artistSpan.style.cursor = 'pointer';
  artistSpan.addEventListener('click', (e) => {
    e.stopPropagation();
    resetCalendarHighlight();
  });
}

div.appendChild(dateSpan);
div.appendChild(artistSpan);



calendarContent.appendChild(div);

  });

  setTimeout(() => {
    const todayEl = calendarContent.querySelector('.today');
    if (todayEl) todayEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, 900);
}




function scrollToToday() {
  const todayEl = calendarContent.querySelector('.today');
  if (!todayEl) return;

  const start = calendarContent.scrollTop;
  const target = todayEl.offsetTop;
  const duration = 600; // ← change cette valeur en ms
  const startTime = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
  }

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    calendarContent.scrollTop = start + (target - start) * easeInOutCubic(progress);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}


function setCalendarVisible(visible) {
  if (visible) {
    boiteCalendar.classList.add('visible');
    boiteCalendar.classList.remove('hidden-in-part3');
    boiteCalendar.style.pointerEvents = 'auto';
    setOpacity(boiteCalendar, '1', '1.5s');
  } else {
    boiteCalendar.classList.remove('visible');
    boiteCalendar.classList.add('hidden-in-part3');
    boiteCalendar.style.pointerEvents = 'none';
    setOpacity(boiteCalendar, '0', '0.6s');
  }
}


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
  if (isTransitioning) return;
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
  transitionToArtist(id);
  setTimeout(() => closeArtistsList(), 100);
});




function renderTexteOeuvre(data, lang) {
  const el = document.getElementById('texte-oeuvre');
  if (!el) return;
  const raw = (lang === "FR" && data.textFR) ? data.textFR : data.text;
  
  const creditsMatch = raw.match(/<credits>([\s\S]*?)<\/credits>/);
  const bioMatch = raw.match(/<bio>([\s\S]*?)<\/bio>/);
  const mainText = raw
    .replace(/<credits>[\s\S]*?<\/credits>/, '')
    .replace(/<bio>[\s\S]*?<\/bio>/, '')
    .trim();
  
  const creditsText = creditsMatch ? creditsMatch[1].trim() : '';
  const bioText = bioMatch ? bioMatch[1].trim() : '';

  let html = '';

  // 1. TEXTE PRINCIPAL en premier
  html += `<div class="texte-main">${mainText.replace(/\n/g, '<br>')}</div>`;

  // 2. BIO ensuite
  if (bioText) {
    const titreBio = (lang === "FR" && data.bioTitreFr) ? data.bioTitreFr : (data.bioTitre || data.nom);

    // sépare le nom de la partie entre parenthèses pour ne pas la mettre en gras
    const parenMatch = titreBio.match(/^(.*?)(\s*\(.*\))\s*$/);
    const titreBioHtml = parenMatch
      ? `${parenMatch[1]}<span class="bio-parenthese">${parenMatch[2]}</span>`
      : titreBio;
    html += `<div class="texte-bio"><span class="bio-nom">${titreBioHtml}</span><div class="bio-text">${bioText.replace(/\n/g, '<br>')}</div></div>`;
  }

  // 3. CREDITS en dernier
  if (creditsText) {
    const creditsLines = creditsText.split('\n').map(line => {
const colonIdx = line.indexOf(':');
if (colonIdx > 0) {
  const label = line.substring(0, colonIdx);
  const value = line.substring(colonIdx + 1);
  return `<strong>${label}:</strong>${value}`;
}
      return line;
    }).join('<br>');
    html += `<div class="texte-credits">${creditsLines}</div>`;
  }
  
  el.innerHTML = html;
  el.scrollTop = 0; 
  el.dataset.mode = 'text';
}








// ══════════════════════════════════════════════
// ── VIMEO PLAYER ──────────────────────────────
// ══════════════════════════════════════════════

function loadArtistMedia(data) {
  const videoEl  = document.getElementById('video');
  const wrapper  = document.getElementById('video-wrapper');
  vimeoFrame = document.getElementById('vimeo-frame');




  if (data.vimeo) {
    if (!vimeoFrame) {
      vimeoFrame = document.createElement('iframe');
      vimeoFrame.id = 'vimeo-frame';
      vimeoFrame.allow = 'autoplay; fullscreen; picture-in-picture';
      vimeoFrame.allowFullscreen = true;
      wrapper.appendChild(vimeoFrame);
    }

    // Pas de src ici — on attend le clic Play
    vimeoFrame.src = '';
    vimeoFrame.style.display = 'block';
    vimeoFrame.style.opacity = '0';
    videoEl.style.display = 'block';
    videoEl.src   = '';
videoEl.poster = data.poster;
    wrapper.classList.add('is-vimeo');
    positionVimeoBtn();

} else {
    // Vidéo native MP4
    if (vimeoFrame) {
      vimeoFrame.src           = '';
      vimeoFrame.style.display = 'none';
    }
        wrapper.classList.remove('is-vimeo'); 
    videoEl.style.display = 'block';
    const chosenSrc = (data.videoOptions && data.videoOptions.length)
      ? data.videoOptions[Math.floor(Math.random() * data.videoOptions.length)]
      : data.video;
    videoEl.src            = chosenSrc;
    videoEl.poster         = data.poster;
    videoEl.loop           = !!data.loop;
    videoEl.load();
  }
}


function positionVimeoBtn() {
  if (window.innerWidth <= 768) {
    btnPlay.style.top = '';
    btnPlay.style.right = '';
    btnPlay.style.left = '';
    btnPlay.style.transform = '';
    btnPlay.style.whiteSpace = '';
    return;
  }

  const wrapperW = window.innerWidth * 0.63;
  const wrapperH = window.innerHeight * 0.8;
  const wrapperRatio = wrapperW / wrapperH;
  const ratio = 16 / 9;

  let vidW, vidH;
  if (ratio > wrapperRatio) {
    vidW = wrapperW;
    vidH = vidW / ratio;
  } else {
    vidH = wrapperH;
    vidW = vidH * ratio;
  }

  btnPlay.style.top       = (vidH / 2) + 'px';
  btnPlay.style.right     = (vidW / 2) + 'px';
  btnPlay.style.left      = 'auto';
  btnPlay.style.transform = 'translate(50%, -50%)';
  btnPlay.style.whiteSpace = 'nowrap';
}






function formatTitreArtiste(nom, titre, containerEl, details) {
  const style = 'style="white-space:normal;word-break:break-word;"';
  const detailsHtml = details
    ? `<span class="artiste-details visible" ${style}>${details}</span>`
    : '';

  if (!isMobile() || !containerEl) {
    return `<span class="artiste-nom">${nom}</span> — <span class="artiste-titre">${titre}</span>${detailsHtml}`;
  }

  const maxWidth = containerEl.clientWidth || window.innerWidth;

  const testEl = document.createElement('span');
  testEl.style.visibility = 'hidden';
  testEl.style.position = 'absolute';
  testEl.style.whiteSpace = 'nowrap';
  testEl.style.font = getComputedStyle(containerEl).font;
  testEl.textContent = `${nom} — ${titre}`;
  document.body.appendChild(testEl);

  const fullWidth = testEl.offsetWidth;
  document.body.removeChild(testEl);

  if (fullWidth > maxWidth) {
    return `<span class="artiste-nom">${nom}</span><br>— <span class="artiste-titre">${titre}</span>${detailsHtml}`;
  }
  return `<span class="artiste-nom">${nom}</span> — <span class="artiste-titre">${titre}</span>${detailsHtml}`;
}







// ══════════════════════════════════════════════
// ── MISE EN PAGE CREDIT ───────────────────────
// ══════════════════════════════════════════════




const creditsData = {
  FR: {
    uiux: "graphisme et programmation web",
    pompidou: "Centre Pompidou<br>Musée national d'art moderne – service des Nouveaux Médias",
    kadist: "Kadist",
    roles: [
      { role: "Conservatrice en chef, service des collections nouveaux médias", names: "Marcella Lista" },
      { role: "Attaché·es de conservation", names: "Nicolas Ballet, Marie Vicet" },
      { role: "Direction des Systèmes d'Information et de Télécommunications", names: "Philippe Benaïche, Elise Imhaus-Jurie, Christophe Andres" },
      { role: "Directrice de la communication et du numérique", names: "Geneviève Paire" },
      { role: "Directeur adjoint de la communication et du numérique", names: "Paul Mourey" },
      { role: "Services communication et presse", names: "Dorothée Mireux, Vanina Frasseto, Claire Galibert" },
      { role: "Remerciements", names: "Agnès de Cayeux, Faustine Fraysse, Bruno Gonthier, Alexandre Michaan" },
    ],
    kadistRoles: [
      { role: "Commissaire", names: "Joseph del Pesco" },
      { role: "Directrice des opérations globales", names: "Anne Becker" },
      { role: "Responsable des programmes", names: "Anna Ezequel" },
      { role: "Communication et presse", names: "Caroline Arce Ross, Alexia Demars" },
      { role: "Direction de la communication", names: "Caroline Arce Ross" },
      { role: "Remerciements", names: "Marie Martraire, Sandra Terdjman, Brice Terdjman, Vincent Worms" },
    ],
  },
  EN: {
    uiux: "graphic design and web programming",
    pompidou: "Centre Pompidou<br>Musée national d'art moderne – service des Nouveaux Médias",
    kadist: "Kadist",
    roles: [
      { role: "Head of service, curator", names: "Marcella Lista" },
      { role: "Assistant curators", names: "Nicolas Ballet, Marie Vicet" },
      { role: "Information Systems and Telecommunication Department", names: "Philippe Benaïche, Elise Imhaus-Jurie, Christophe Andres" },
      { role: "Head of Communication and Digital Department", names: "Geneviève Paire" },
      { role: "Deputy Director of Communication and Digital Department", names: "Paul Mourey" },
      { role: "Communications and Press Units", names: "Dorothée Mireux, Vanina Frasseto, Claire Galibert" },
      { role: "Acknowledgements", names: "Agnès de Cayeux, Faustine Fraysse, Bruno Gonthier, Alexandre Michaan" },
    ],
    kadistRoles: [
      { role: "Curator", names: "Joseph del Pesco" },
      { role: "Director of Global Operations", names: "Anne Becker" },
      { role: "Program Manager", names: "Anna Ezequel" },
      { role: "Communications and Press", names: "Caroline Arce Ross, Alexia Demars" },      
      { role: "Communications Director", names: "Caroline Arce Ross" },
      { role: "Acknowledgements", names: "Marie Martraire, Sandra Terdjman, Brice Terdjman, Vincent Worms" },
    ],
  }
};

function formatNames(names) {
  const parts = names.split(', ');
  if (parts.length === 1) return names;
  return parts.map((name, i) => 
    i < parts.length - 1 
      ? `<span class="credit-name">${name},</span> ` 
      : `<span class="credit-name">${name}</span>`
  ).join('');
}



function buildAboutContent(lang) {
  const el = document.getElementById('about-content');
  if (!el) return;

  if (lang === "FR") {
    el.innerHTML = `
      <p>Pour conclure une collaboration de plusieurs années explorant les intersections entre la création artistique et l'intelligence artificielle générative, le Centre Pompidou et KADIST présentent une exposition en ligne d'œuvres vidéo.</p>

      <p>Cette exposition en ligne propose une sélection de vidéos selon un <span id="about-calendar-link">calendrier</span> rotatif, avec deux temps forts collectifs à l'occasion du lancement et de la clôture.</p>

      <p>Dans Les Misérables (1862), Victor Hugo médite sur les paradoxes de la nature humaine, suggérant que « Nos chimères sont ce qui nous ressemble le mieux ». Créature mythologique, la chimère est un être composite, assemblé à partir de désirs, de peurs, de fantasmes et de contradictions. Selon Hugo, elles incarnent la vie intérieure de l'humanité dans la société moderne, tout ce que nous projetons, refoulons ou ne parvenons pas tout à fait à nommer.</p>

      <p>Pour cette exposition, la chimère est ranimée alors que nous tentons de comprendre la présence des grands modèles de langage et des systèmes d'IA générative, ces hybrides monstrueux assemblés à partir de milliards de traces humaines, d'archives fragmentées et de motifs prismatiques. Comme la bête antique composée de corps incompatibles, ces systèmes fusionnent des fragments pour créer quelque chose qui nous persuade de sa cohérence, de sa présence. Ils parlent avec nos mots, recomposent nos histoires, imitent nos émotions — et ce faisant, soulèvent une possibilité troublante : ce qui semble synthétisé pourrait bien être un reflet saisissant de nous-mêmes.</p>

      <p>Les œuvres réunies ici forment un bestiaire contemporain composé d'une sélection d'images synthétiques, plutôt que de créatures mythiques. Ici, les monstres sont procéduraux — nés de jeux de données, d'accumulations, d'images engendrant d'autres images. Si tout ce qui figure dans ces œuvres n'est pas généré, une grande partie de ce qui circule à l'écran émerge des vastes archives de la culture visuelle, recomposées par des systèmes formés à partir de notre imagination collective. Elles nous ressemblent parce qu'elles sont composées d'images faites par nous, pour nous.</p>

      <p>Nos utopies et nos cauchemars ont toujours été chimériques — des composites de l'état d'esprit du présent, évoquant tout ce que nous pourrions un jour imaginer, mais que nous ne pouvons encore visualiser. Ce que font ces systèmes, c'est rendre le texte et l'image des composantes fluides d'un régime de données sans origine ni référent précis. Dans L'Iliade, la chimère est décrite comme « une chose d'une fabrication immortelle, non humaine, lion devant, serpent derrière, chèvre au milieu ». Ce qui frappe, c'est la grammaire de la bête : c'est une conjonction, une syntaxe élargie. Il y a un « et-et » là où il devrait y avoir un « ou ». Les systèmes génératifs partagent cette logique. Plutôt que de choisir entre des références, entre des styles, les grands modèles de langage produisent une image qui est à la fois lion, serpent et chèvre, combinant ce qui, selon les lois naturelles, devrait rester distinct. Le résultat réel ressemble davantage à un palimpseste : de nombreux textes et images à la fois, aucun n'étant tout à fait lisible. Pourtant, ils émergent de l'abîme mythique de l'oracle pour s'imposer dans un présent immaculé, en haute résolution.</p>

      <p>La chimère est une créature native d'Internet, où le mythe viral l'emporte sur le fait brut, où les rumeurs se transforment en consensus et où la copie modifiée est plus largement vue que l'original. En ce sens, en tant qu'allégorie, elle a anticipé les propriétés du numérique — une créature de circulation, de recombinaison de l'image qui s'éloigne tellement de sa source qu'elle devient mutante. Les grands modèles de langage et leurs divers agents et interfaces sont soumis aux mêmes forces d'accumulation et de diffusion de masse. C'est dans cet espace natif — Internet, à la fois environnement principal de nombreuses pratiques artistiques aujourd'hui et vaste substrat à partir duquel la plupart des systèmes d'IA sont formés et alimentés — que cette exposition s'inscrit. Présenter des œuvres en images animées en ligne, c'est les voir dans le contexte des divers flux et courants qui y sont omniprésents, tout en s'en distinguant, reliées par un cadre institutionnel aux engagements discursifs et critiques de l'art contemporain.</p>

      <div id="about-links">
        <a href="https://kadist.org" target="_blank">kadist.org</a>
        <a href="https://www.newmedia-art.org" target="_blank">newmedia-art.org</a>
      </div>

      <div id="credits-section"></div>
    `;
  } else {
    el.innerHTML = `
      <p>Concluding a multi-year collaboration exploring the intersections between artistic creation and generative artificial intelligence, the Centre Pompidou and KADIST present an online exhibition of video artworks.</p>

      <p>This online exhibition presents a selection of videos on a rotating <span id="about-calendar-link">schedule</span>, with two moments of collective focus at the beginning and end. See the 'Viewing Schedule' link to the left for details.</p>

      <p>In Les Misérables (1862), Victor Hugo reflects on the paradoxes of human nature, suggesting that, "Nos chimères sont ce qui nous ressemble le mieux" — our chimeras are what most resemble us. A mythological beast, the chimera is a composite creature stitched together from desire, fear, fantasy, and contradiction. In Hugo's view, they represent the inner life of humanity and the effects of modern society—everything we project, suppress, and cannot quite name. For this exhibition, the chimera is revived as we attempt to understand the presence of large language models and generative AI systems as monstrous hybrids assembled from billions of human traces, spliced archives, and prismatic patterns. Like the ancient beast composed of incompatible bodies, these systems fuse fragments into something that persuades us of its coherence, its presence. They speak with our words, recombine our histories, mimic our affect — and in doing so, raise a disquieting possibility: what appears synthesized may in fact be a vivid reflection of ourselves.</p>

      <p>The works gathered here form a contemporary bestiary, but rather than mythical creatures, a selection of synthetic images. Here, the monsters are procedural — born of datasets, of accumulation, of images begetting images. While not all of what's included in these works is generated, much of what circulates on the screen emerges from the vast archive of visual culture, recombined by systems trained on our collective imagination. It resembles us because it is composed of images made by us, for us.</p>

      <p>Our utopias and our nightmares have always been chimaeric — composites of the present mindset, conjuring everything we might one day imagine but cannot yet visualize. LLMs and AI systems render text and image as fluid components of a data-regime without a specific origin or referent. In The Iliad, the chimera is rendered as a "thing of immortal make, not human, lion in front, serpent behind, goat in the middle." What is striking is the grammar of the beast: it is a conjunction, an expanded syntax. There's "and-and" where there should be an "or." Generative systems share this logic. Rather than deliberate between references, between styles, LLMs produce an image that is lion-and-serpent-and-goat, combining what should by natural law remain discrete. The actual result is something closer to palimpsest: many texts and images at once, none of them quite legible. And they emerge from the mythic abyss of the black box into the pristine, high-resolution present.</p>

      <p>The chimera is a native creature of the internet, where the viral myth overwhelms plain fact, where rumors mutate into consensus and the modified copy is more widely seen than the original. It functions as an allegory, anticipating the properties of the digital — a creature of circulation, of recombination, of the image that travels so far from its source that it becomes a mutant. LLMs and their various agents and interfaces are subject to the same forces of accumulation and mass distribution. It is within this native space — the internet as both the primary environment for many art practices today and the vast substrate from which most AI systems are trained and sustained — that this exhibition situates itself. To present moving image works online is to see them in the context of the various streams and currents pervasive here, yet also to allow them to stand apart, linked by institutional context to the discursive and critical commitments of contemporary art.</p>

      <div id="about-links">
        <a href="https://kadist.org" target="_blank">kadist.org</a>
        <a href="https://www.newmedia-art.org" target="_blank">newmedia-art.org</a>
      </div>

      <div id="credits-section"></div>
    `;
  }

  buildCredits(lang);
}





function buildCredits(lang) {
  const el = document.getElementById('credits-section');
  if (!el) return;
  const d = creditsData[lang];

  let html = `
    <div class="credit-titre p_titre">${lang === 'FR' ? 'Crédits' : 'Credits'}</div>
    <div class="credit-institution">${d.pompidou}</div>
  `;

  d.roles.forEach(item => {
    html += `
      <div class="credit-block">
        <span class="credit-role">${item.role} :</span><span class="credit-names">${formatNames(item.names)}</span>
      </div>
    `;
  });

  html += `<div class="credit-institution">${d.kadist}</div>`;

  d.kadistRoles.forEach(item => {
    html += `
      <div class="credit-block">
        <span class="credit-role">${item.role} :</span><span class="credit-names">${formatNames(item.names)}</span>
      </div>
    `;
  });

  html += `<div class="credit-spacer"></div>`;

  html += `
    <div class="credit-block">
      <span class="credit-role">${lang === 'FR' ? 'Graphisme et développement web' : 'Graphism and web development'} :</span><span class="credit-names"><a href="https://eleonore-sense.github.io/bonjour/" target="_blank">Eléonore Sense</a></span>
    </div>
    <div class="credit-block">
      <span class="credit-role">${lang === 'FR' ? 'Typographie de titrage' : 'Display typeface'} :</span><span class="credit-names">Lagarto ${lang === 'FR' ? 'de' : 'by'} <a href="https://www.sudtipos.com/font/lagarto" target="_blank">Sudtipos</a></span>
    </div>
    <div class="credit-block">
      <span class="credit-role">${lang === 'FR' ? 'Typographie de labeur' : 'Body typeface'} :</span><span class="credit-names">${lang === 'FR' ? `Abordage de <a href="https://www.eugéniebidaut.eu/" target="_blank">Eugénie Bidaut</a> d'après <a href="https://velvetyne.fr/degheest/fr.html" target="_blank">Ange Degheest</a>.` : `Typography by <a href="https://www.eugéniebidaut.eu/" target="_blank">Eugénie Bidaut</a>, based on the work of <a href="https://velvetyne.fr/degheest/fr.html" target="_blank">Ange Degheest</a>.`}</span>
    </div>
  `;

  el.innerHTML = html;
}


function formatNames(names) {
  const parts = names.split(', ');
  if (parts.length === 1) return names;
  return parts.map((name, i) => 
    i < parts.length - 1 
      ? `<span class="credit-name">${name},</span> ` 
      : `<span class="credit-name">${name}</span>`
  ).join('');
}


// ══════════════════════════════════════════════
// ── GLITCH DU TITRE D'ONGLET (lettres indépendantes)
// ══════════════════════════════════════════════

const glitchMap = {
  'e': 'ε', 'E': 'Σ',
  'a': 'α', 'A': 'Λ',
  'o': '⁕', 'O': '⊙',
  'i': 'ι', 'I': 'Ι',
  's': 'ϟ', 'S': 'Ϟ',
  't': 'τ', 'T': 'Τ',
  'c': 'ϲ', 'C': 'Ϲ',
  'd': 'δ', 'D': 'Δ',
  'r': 'Я', 'R': '℞',
  'u': 'υ', 'U': '∪',
  'l': '⎸', 'L': '└',
  'm': 'ϻ', 'M': 'Ϻ',
};

let titleChars = [];
let activeGlitches = {}; // { index: timeoutId }
let glitchLoopTimer = null;

function applyTitleFromChars() {
  document.title = titleChars.join('');
}

function resetTitleGlitchSystem() {
  // stoppe tous les timers de retour à la normale en cours
  Object.values(activeGlitches).forEach(t => clearTimeout(t));
  activeGlitches = {};
  clearTimeout(glitchLoopTimer);

  titleChars = translations[currentLang].titre.split('');
  applyTitleFromChars();

  scheduleNextGlitch();
}

function triggerOneGlitch() {
  const glitchableIndexes = [];
  titleChars.forEach((ch, i) => {
    if (glitchMap[ch] && !activeGlitches[i]) glitchableIndexes.push(i);
  });
  if (glitchableIndexes.length === 0) return;

  const idx = glitchableIndexes[Math.floor(Math.random() * glitchableIndexes.length)];
  const originalChar = titleChars[idx];

  titleChars[idx] = glitchMap[originalChar];
  applyTitleFromChars();

  activeGlitches[idx] = setTimeout(() => {
    titleChars[idx] = originalChar;
    delete activeGlitches[idx];
    applyTitleFromChars();
  }, 45000); // reste glitchée 45s
}

function scheduleNextGlitch() {
  const delay = 10000 + Math.random() * 10000; // prochaine lettre glitchée dans 10 à 20s
  glitchLoopTimer = setTimeout(() => {
    triggerOneGlitch();
    scheduleNextGlitch();
  }, delay);
}

resetTitleGlitchSystem();