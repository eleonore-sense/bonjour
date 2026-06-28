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



    buildCredits(currentLang); 
    lines = linesConfig[currentLang];


if (isPage2 && artisteCourant) {
      const data = artistes[artisteCourant];
      if (data) {
        const texteOeuvre = document.getElementById('texte-oeuvre');
        if (texteOeuvre) {
          renderTexteOeuvre(data, currentLang);
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
    buildCredits(currentLang); 
  isMobile() ? initTunnelMobile() : initTunnel();
});

document.body.addEventListener("click", (e) => {
  if (!e.target.closest("#btn-lang")) return;
  currentLang = currentLang === "EN" ? "FR" : "EN";
  applyLang();
  if (typeof carrousel !== "undefined") cachedLoopWidth = carrousel.scrollWidth / 2;
});
// ══════════════════════════════════════════════
// ── DONNÉES ARTISTES ──────────────────────────
// ══════════════════════════════════════════════

const artistes = {
  1: {
    nom: "Agnieszka Polska",
    bioTitre: "Agnieszka Polska (b. 1985, Lublin, Poland)",
    titre: "The Book of Flowers",
details: "2023 — HD video, 9:38 minutes",
detailsFR: "2023 — vidéo HD, 9:38 minutes",
    video: "img/agnieszka_polska.mp4",
    poster: "img/agnieszka_polska.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
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
    bioTitre: "Agnieszka Polska (b. 1985, Lublin, Poland)",
    titre: "DOKU, The Creator",
    details: "2025 — video, color, sound, 59:52 minutes",
detailsFR: "2025 — vidéo, couleur, son, 59:52 minutes",
    vimeo: "1099319080",
    vimeoHash: "33b083d2e4",
    poster: "img/lu_yang.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  3: {
    nom: "Jonas Lund",
    titre: "The Future of Life",
    details: "2024 — video, 28:02 minutes",
detailsFR: "2024 — vidéo, 28:02 minutes",
    video: "img/jonas_lund.mp4",
    poster: "img/jonas_lund.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  4: {
    nom: "Egor Kraft",
    titre: "One and Infinite Chairs",
    details: "2023 — self-hosted and custom-trained Stable Diffusion, .ckpt-format file of a collapsed AI model, essay-film, 6:36 minutes",
detailsFR: "2023 — modèle de diffusion stable auto-hébergé et entraîné sur mesure, fichier au format .ckpt d'un modèle d'IA réduit, essai-film, 6:36 minutes",
    video: "img/egor_kraft.mp4",
    poster: "img/egor_kraft.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  5: {
    nom: "Elsa Werth",
    titre: "IF / THEN",
    details: "2024 — video, color, silent, loop, 42:22 minutes. Edition of 5 + 1AP",
detailsFR: "2024 — video, color, silent, loop, 42:22 minutes. Edition of 5 + 1AP",
    video: "img/elsa_werth.mp4",
    poster: "img/elsa_werth.jpg",
text: `This video explores the relationship between technology, particularly Artificial Intelligence, and the production of goods.
AI-generated futuristic objects related to work appear to be bound by conditional relationships.
However, these connections lack clear logic, resulting in ambiguous links between various shapes and unexpected functionalities.
The video invites viewers to contemplate the implications of AI-driven decision-making processes on consumption and human labor in contemporary society.

In this project, I also explore the common perception of dematerialized AI. The futuristic AI-generated objects raises the question of the materiality/immateriality of data, whose energy-intensive storage relies on the quantifiable exploitation of non-renewable energies and resources (water, rare earths, oil, and coal).
 
<bio>
Elsa Werth is a Paris-based artist working across installation, sculpture, video, artist books, and sound. Her practice centers on the economies of labor and the ordinary gestures that sustain them. What interests her is the texture of work as it is actually lived — the repetitive, the habitual, the barely noticed — and she approaches it through operations of displacement and counter-use that make familiar actions strange without aestheticizing them. The anti-spectacular is a deliberate position: in a context that valorizes productivity and growth, her refusal of spectacle is itself a form of argument. She received the 23rd Prix de la Fondation Pernod Ricard pour l'Art Contemporain in 2022 and has exhibited at the Centre Pompidou, the West Bund Museum in Shanghai, and the National Taiwan Museum of Fine Arts, among other venues.
</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  6: {
    nom: "Emmanuel Van der Auwera",
    titre: "The Gospel",
    details: "2024 — HD video, color, sound, 17:53 minutes",
detailsFR: "2024 — vidéo HD, couleur, son, 17:53 minutes",
    video: "img/emmanuel_van_der_auwera.mp4",
    poster: "img/emmanuel_van_der_auwera.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  7: {
    nom: "Jon Rafman",
    titre: "Catastrophonics I–IV",
    details: "2025 — HD single-channel video, color, sound, 21:20 minutes",
detailsFR: "2025 — HD single-channel video, color, sound, 21:20 minutes",
    video: "img/jon_rafman.mp4",
    poster: "img/jon_rafman.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  8: {
    nom: "Ho Tzu Nyen",
    titre: "P for Power",
    details: "2023 — HD video, 9:38 minutes",
detailsFR: "2023 — vidéo HD, 9:38 minutes",
    video: "img/ho_tzu_nyen.mp4",
    poster: "img/ho_tzu_nyen.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  9: {
    nom: "John Menick",
    titre: "Telharmonium",
    details: "2025 —  generative film and score, infinite runtime, custom software, 4K video, stereo sound",
detailsFR: "2025 —  generative film and score, infinite runtime, custom software, 4K video, stereo sound",
 youtube: "dQw4w9WgXcQ",
    poster: "img/john_menick.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
  10: {
    nom: "Sofia Crespo",
    titre: "Temporally Uncaptured",
    details: "2023-2024 — neural networks and digital video from scanned cyanotypes, 4:10 minutes",
detailsFR: "2023-2024 — réseaux neuronaux et vidéo numérique à partir de cyanotypes numérisés, 4:10 minutes",
    video: "img/sofia_crespo.mp4",
    poster: "img/sofia_crespo.jpg",
text: `In her practice, Agnieszka Polska uses cinematic storytelling and affective technologies to address the perpetually negotiated relationship between human and technology, examining the processes that mutually influence and legitimate this relationship in language, history and consciousness. She is interested in the question of individual social responsibility against the background of technology-driven disorientation and ideologies of technological determinism.

Polska’s works combine historical research, cinematic storytelling and affective communication technologies, seeking new narrative formats that correspond with the rapidly changing requirements of information-driven societies. According to Polska, such formats are available at the intersection of poetry and narration, art and cinema.

A major strand of her current practice and thinking is the construction of a pre-history of an emerging global cybernetic consciousness. The animation The Book of Flowers (2023), devoted to gendered reproductive labor, takes this process a step further - as the pre-history depicted in the film is obviously fabricated. 

In the film, deep and enchanting voice of the actress Tina Greatrex guides the listener through the joined history of humankind and flowers. According to the narrator, blooming plants used to be enormous and humans were their main pollinators. A complex symbiosis existed between the species, both humans and flowers unable to reproduce without one another. Over the centuries, humans mastered technologies that allowed them to reproduce without participation of plants and reduced sizes of flowers. Especially one technology played an important role in this morally-ambiguous process: technology of storytelling. 

This fantastic history that led to the contemporary state of affairs is told against the backdrop of impassioned Charles-Marie Widor's Symphony No. 5 Toccata for Organ and a succession of dynamic animations of surreal flowers, often equipped with animal- or machine-like textures. A complex process of re-writing early time-lapse plant videos with Artificial Intelligence tools led to creation of material that could be described as found footage - but with not a single original frame used.  

“What if what we believe is required of humans by nature is just a story that we told ourselves about what being human is and what nature is? What if who we think we are, what we believe at a gut level about our kinship loyalty and our perceived survival needs are responses to a story we made up and told ourselves was written by our genes?,” writes Alexis Pauline Gumbs on Sylvia Wynter. This “discursive construction of man” echoes in Polska’s film, where the main power and, at the same time, threat to humanity is becoming enchanted in one’s own story, whispered into a human ear by technological mouth. The Book of Flowers, itself constituting a sci-fi story, is designed as a “thought experiment” in immersion and dissociation.
<bio>Agnieszka Polska is a visual artist, film and theatre director based in Berlin. Polska employs computer-generated media to explore themes of individual agency, social responsibility, and the shaping of historical narratives within environments driven by rapid technological changes and the flow of information. Her work bridges the past and the digital present, using hallucinatory animations and poetic storytelling to delve into the ethical ambiguities of contemporary society. Polska’s art has been showcased internationally, including exhibitions at the New Museum and MoMA in New York, Centre Pompidou in Paris, Tate Modern in London, and the Hirshhorn Museum in Washington, D.C. She has held solo exhibitions at Hamburger Bahnhof in Berlin, the Museum of Modern Art in Warsaw, M HKA in Antwerp, Frye Art Museum in Seattle, Nottingham Contemporary, and Salzburger Kunstverein. She participated in the 57th Venice Biennale, 11th Gwangju Biennale, 19th and 24th Biennale of Sydney, 14th Shanghai Biennale, and 13th Istanbul Biennial. In 2023, she premiered her first theatre play, The Talking Car, in the frame of BoCA Biennale, Lisbon.</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>
`,
textFR: `Texte en français

<bio>txt en francais</bio>
<credits>Écrit et réalisé par Agnieszka Polska
voix: Tina Greatrex
workflow stable diffusion: Nathan Gray
animation: Agnieszka Polska, Nathan Gray, Ewa Polska
conception sonore: Igor Kłaczyński
enregistrement sonore: The Sound Company
musique: Charles-Marie Widor/Olivier Latry - 5e & 6e Symphonies Pour Orgue, BNL Productions 1986

Commandé pour l'exposition Chronic desire - Sete cronica, 17 fév - 23 avril 2023, dans le cadre de Timisoara 2023, Capitale Européenne de la Culture</credits>

`,  },
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
const DEBUG_DATE = '2026-09-18';
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
let tunnelActive = false;
let vimeoFrame = null;
let vimeoPlayer = null;
let wasInCinemaModeBeforeFullscreen = false;
let playIntroCalled = false;
let youtubeFrame = null;
let youtubePlayer = null;
let youtubeApiReady = false;
let youtubePendingAutoplay = false;
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
  { date: "2026-09-21", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-09-22", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-09-23", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-09-24", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-09-25", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-09-26", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-09-27", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-09-28", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-09-29", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-09-30", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-01", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-10-02", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-03", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-04", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-05", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-06", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-10-07", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-10-08", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-10-09", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-10-10", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-11", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-10-12", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-13", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-14", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-15", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-16", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-10-17", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-10-18", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-10-19", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-10-20", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-21", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-10-22", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-10-23", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-10-24", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-10-25", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-10-26", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-10-27", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-10-28", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-10-29", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-10-30", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-10-31", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-11-01", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-11-02", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-11-03", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-11-04", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-11-05", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-06", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-07", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-08", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-11-09", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-11-10", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-11-11", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-11-12", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-11-13", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-11-14", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-11-15", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-16", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-17", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-18", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-11-19", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-11-20", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-11-21", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-11-22", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-11-23", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-11-24", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-11-25", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-11-26", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-11-27", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-11-28", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-11-29", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-11-30", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-12-01", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-12-02", artist: "Egor Kraft", work: "One & Infinite Chairs" },
  { date: "2026-12-03", artist: "Lu Yang", work: "DOKU the Creator" },
  { date: "2026-12-04", artist: "Sofia Crespo", work: "Invertebrate Interactions" },
  { date: "2026-12-05", artist: "Ho Tzu Nyen", work: "P for Power" },
  { date: "2026-12-06", artist: "Emmanuel Van der Auwera", work: "The Gospel" },
  { date: "2026-12-07", artist: "Agnieszka Polska", work: "The Book of Flowers" },
  { date: "2026-12-08", artist: "Jon Rafman", work: "Catastrophonics I–IV" },
  { date: "2026-12-09", artist: "Jonas Lund", work: "The Future of Life" },
  { date: "2026-12-10", artist: "John Menick", work: "Telharmonium" },
  { date: "2026-12-11", artist: "Elsa Werth", work: "If/Then" },
  { date: "2026-12-12", artist: "ALL" },
  { date: "2026-12-13", artist: "ALL" },
  { date: "2026-12-14", artist: "CLOSED" },
];

window.onYouTubeIframeAPIReady = function() {
  youtubeApiReady = true;
};


function setOpacity(el, val, duration = '0.8s') {
  if (!el) return;
  el.style.transition = `opacity ${duration} ease, text-shadow 0.3s ease, color 1s ease, filter 0.3s ease`;
  el.style.opacity = val;
}


// ══════════════════════════════════════════════
// ── HELPERS GÉNÉRAUX ──────────────────────────
// ══════════════════════════════════════════════

video.addEventListener('loadedmetadata', () => {
    if (isTransitioning) return;
  if (videoWrapper.classList.contains('is-vimeo')) return;
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

artistesContainer.addEventListener('mouseover', (e) => {
  if (!e.target.classList.contains('artiste_accueil')) return;
  const id = e.target.dataset.artiste;

  if (!id || id === lastHoveredId) return; // ← même élément, on ignore
  const nom = artistes[id]?.nom;
  if (nom) updateCalendarLabelForArtist(nom);
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

    resetCalendarLabel();
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


async function handlePlayPauseClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const data = artistes[artisteCourant];

  if (data?.youtube) {
    if (hasStarted && youtubePlayer) {
      const state = youtubePlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        youtubePlayer.pauseVideo();
      } else {
        youtubePlayer.playVideo();
      }
      return;
    }

    video.style.transition = 'opacity 0.8s ease';
    video.style.opacity = '0';
    btnPlay.style.opacity = '0';
    btnPlay.style.pointerEvents = 'none';

    setTimeout(() => {
      video.style.display = 'none';
      youtubeFrame.style.display = 'block';
      youtubeFrame.style.transition = 'opacity 0.8s ease';
      youtubeFrame.style.opacity = '1';
      hasStarted = true;
      btnPlay.style.pointerEvents = '';

function startYoutubePlayer() {
  youtubePlayer = new YT.Player(youtubeFrame, {
    videoId: data.youtube,
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      showinfo: 0,
      iv_load_policy: 3,
      fs: 0,
      disablekb: 1,
      origin: window.location.origin,
    },
    events: {
      onReady: (ev) => {
        ev.target.playVideo();
        setTimeout(() => {
          fullscreenBtn.style.display = 'block';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              fullscreenBtn.style.opacity = '1';
              fullscreenVisible = true;
            });
          });
        }, 2000);
      },
      onStateChange: (ev) => {
        if (ev.data === YT.PlayerState.PLAYING) {
          btnPlay.textContent = 'Pause';
          btnPlay.classList.add('playing');
          btnPlay.style.opacity = '0';
          btnPlay.style.pointerEvents = 'none';
          if (isMobile() && typeof onMobileVideoPlay === 'function') onMobileVideoPlay();
          if (youtubeTimelineRaf) cancelAnimationFrame(youtubeTimelineRaf);
          updateYoutubeTimeline();
        }
        if (ev.data === YT.PlayerState.PAUSED) {
          btnPlay.textContent = translations[currentLang].playVideo;
          btnPlay.classList.remove('playing');
          btnPlay.style.opacity = '1';
          btnPlay.style.pointerEvents = 'auto';
          showInfo3();
          if (isMobile() && typeof onMobileVideoPause === 'function') onMobileVideoPause();
          if (youtubeTimelineRaf) cancelAnimationFrame(youtubeTimelineRaf);
        }
        if (ev.data === YT.PlayerState.ENDED) {
          btnPlay.textContent = translations[currentLang].playVideo;
          btnPlay.classList.remove('playing');
          youtubeFrame.style.transition = 'opacity 0.8s ease';
          youtubeFrame.style.opacity = '0';
          setTimeout(() => {
            youtubeFrame.style.display = 'none';
            video.style.display = 'block';
            video.style.opacity = '1';
            positionVimeoBtn();
          }, 800);
          hasStarted = false;
          if (youtubeTimelineRaf) cancelAnimationFrame(youtubeTimelineRaf);
          showInfo3();
        }
      }
    }
  });
}

      if (youtubeApiReady && window.YT && window.YT.Player) {
        startYoutubePlayer();
      } else {
        const waitForApi = setInterval(() => {
          if (youtubeApiReady && window.YT && window.YT.Player) {
            clearInterval(waitForApi);
            startYoutubePlayer();
          }
        }, 100);
      }
    }, 800);
    return;
  }

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

      setTimeout(() => {
        fullscreenBtn.style.display = 'block';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            fullscreenBtn.style.opacity = '1';
            fullscreenVisible = true;
          });
        });
      }, 2000);

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
        if (isMobile() && typeof onMobileVideoPlay === 'function') onMobileVideoPlay();
      });

      vimeoPlayer.on('pause', () => {
        btnPlay.textContent = translations[currentLang].playVideo;
        btnPlay.classList.remove('playing');
        btnPlay.style.opacity = '1';
        btnPlay.style.pointerEvents = 'auto';
        showInfo3();
        if (isMobile() && typeof onMobileVideoPause === 'function') onMobileVideoPause();
      });

      vimeoPlayer.on('ended', () => {
        btnPlay.textContent = translations[currentLang].playVideo;
        btnPlay.classList.remove('playing');
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
}

btnPlay.addEventListener('click', handlePlayPauseClick);










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

// ══════════════════════════════════════════════
// ── TAP POUR AFFICHER PLAY/PAUSE (MOBILE)
// ══════════════════════════════════════════════
let mobileBtnPlayHideTimer = null;

function showBtnMobile() {
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
  if (data?.youtube && youtubePlayer) {
    const duration = youtubePlayer.getDuration();
    youtubePlayer.seekTo(pct * duration, true);
  } else if (data?.vimeo && vimeoPlayer) {
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
  const uiElements = getPseudoFullscreenUIElements();

  // 1. fade out de tous les éléments de la page artiste (vidéo et fullscreen inclus)
  uiElements.forEach(el => setOpacity(el, '0', '1s'));

  setTimeout(() => {
    videoWrapper.classList.add('pseudo-fullscreen');
    isFullscreen = true;
    fullscreenBtn.textContent = translations[currentLang].exitFullscreen;
    timelineFull.style.display = 'block';

    fullscreenExit.style.display = 'block';
    btnRestart.style.display = 'block';

    // fade in vidéo, fullscreen btn (déjà dans uiElements) + restart + exit fullscreen
// fade in vidéo + restart + exit fullscreen (fullscreen reste caché)
    setOpacity(fullscreenExit, '1', '1s');
    setOpacity(btnRestart, '1', '1s');
    uiElements.forEach(el => {
      if (el && el.id === 'video') {
        setOpacity(el, '1', '1s');
      }
    });

    // démarre automatiquement le minuteur de disparition (2s)
    if (typeof showBtnMobile === 'function') {
      showBtnMobile();
    }

  }, 1000);
}

function exitPseudoFullscreenMobile() {
  const videoEl = document.getElementById('video');
  const uiElements = getPseudoFullscreenUIElements();
  const isPlaying = !video.paused;

  // fade out : vidéo, fond noir, exit/restart
  setOpacity(videoEl, '0', '0.6s');
  setOpacity(fullscreenExit, '0', '0.6s');
  setOpacity(btnRestart, '0', '0.6s');
  videoWrapper.style.transition = 'background-color 0.6s ease';
  videoWrapper.style.backgroundColor = 'transparent';

  setTimeout(() => {
    // 2. on sort réellement du mode pseudo-fullscreen
    videoWrapper.classList.remove('pseudo-fullscreen');
    videoWrapper.style.transition = '';
    videoWrapper.style.backgroundColor = '';
    isFullscreen = false;
    fullscreenBtn.textContent = translations[currentLang].fullscreen;
    timelineFull.style.display = 'none';
    fullscreenExit.style.display = 'none';
    btnRestart.style.display = 'none';

    positionVimeoBtn();

// 3. fade in : page artiste comme avant
    const infoConditionalIds = ['btn_home', 'btn_cine_switch', 'btn-lang', 'texte-oeuvre'];

    uiElements.forEach(el => {
      if (!el) return;
      if (el.id === 'fullscreen') return; // jamais réaffiché en sortie de pseudo-fullscreen
      if (el.id === 'next_artist' && isPlaying) return;
      if (infoConditionalIds.includes(el.id) && !info3AlreadyShown) return;
      setOpacity(el, '1', '0.6s');
    });

  }, 600);
}



document.addEventListener('fullscreenchange', () => {
  const data = artistes[artisteCourant];

  if (document.fullscreenElement) {
    isFullscreen = true;
    fullscreenBtn.textContent = translations[currentLang].exitFullscreen;
    timelineFull.style.display = 'block';
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
    video.style.objectPosition = 'right top';
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
  if (data?.youtube && youtubePlayer) {
    youtubePlayer.seekTo(0, true);
    youtubePlayer.playVideo();
  } else if (data?.vimeo && vimeoPlayer) {
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
      setOpacity(document.getElementById('btn_cine_switch'), '0', '0.8s');
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
      showInfo3();
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
}, 800);


}


// ══════════════════════════════════════════════
// ── NEXT ARTIST ───────────────────────────────
// ══════════════════════════════════════════════

document.getElementById('next_artist').addEventListener('click', () => {
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
if (!isArtistAvailableToday(data.nom)) {
  texte.classList.remove('visible');
  texteWrapper.classList.remove('visible');
}
  // — SORTIE
[video, titre, infoBtn].forEach(el => {
  el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  el.style.opacity = '0';
  el.style.transform = 'translateY(12px)';
});
btnPlay.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
btnPlay.style.opacity = '0';
if (texteVisible) {
  texte.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
  texte.style.opacity = '0';
  texte.style.transform = 'translateY(12px)';
  texte.classList.remove('visible');
  texteWrapper.classList.remove('visible');
}

setTimeout(() => {
    // — RESET contenu
const detailsT = currentLang === "FR" && data.detailsFR ? data.detailsFR : data.details;
titre.innerHTML = formatTitreArtiste(data.nom, data.titre, titre, detailsT);

loadArtistMedia(data);
if (isArtistAvailableToday(data.nom)) {
  texte.textContent = currentLang === "FR" && data.textFR ? data.textFR : data.text;
}
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

    if (!info3AlreadyShown) { texte.classList.remove('visible'); infoBtn.textContent = '+'; texteWrapper.classList.remove('visible'); }
    if (!info3AlreadyShown) hideInfo3();
    if (info3AlreadyShown) showInfo3();

    if (isMobile()) {
      fullscreenBtn.style.display = 'none';
      fullscreenBtn.style.opacity = '0';
      fullscreenVisible = false;
    } else {
      if (fullscreenUnlocked) { fullscreenBtn.style.display = 'block'; fullscreenBtn.style.opacity = '1'; fullscreenVisible = true; }
      else { fullscreenBtn.style.display = 'none'; fullscreenBtn.style.opacity = '0'; fullscreenVisible = false; }
    }



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
if (texteVisible && isArtistAvailableToday(data.nom)) {
  texte.style.transition = 'opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
  texte.style.opacity = '1';
  texte.style.transform = 'translateY(0)';
}

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
titreHaut.style.transition = '';
titreHaut.style.transform = '';          

          isTransitioning = false;
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
  setTimeout(() => {
    btnPlay.style.transition = '';
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


// ══════════════════════════════
// ── CALENDAR PANEL
// ══════════════════════════════

function openCalendar() {
  if (calendarOpen) return;
  calendarOpen = true;
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

function updateCalendarLabelForArtist(nom) {
  const label = document.getElementById('calendar-label');
  if (!label || calendarOpen) return;
  const today = getToday();
  const todayEntry = schedule.find(e => e.date === today);
  if (todayEntry && (todayEntry.artist === nom || todayEntry.artist === 'ALL')) {
    resetCalendarLabel();
    return;
  }
  const date = getNextDateForArtist(nom);
  if (date) {
    label.style.opacity = '0';
setTimeout(() => {
  const text = currentLang === 'FR' 
    ? `prochaine diffusion : ${date}` 
    : `next screening : ${date}`;
  label.innerHTML = currentLang === 'FR'
    ? `<u>prochaine diffusion</u> : ${date}`
    : `<u>next screening</u> : ${date}`;
  label.style.whiteSpace = 'nowrap';
  label.style.opacity = '1';
}, 200);
  }
}

function resetCalendarLabel() {
  const label = document.getElementById('calendar-label');
  if (!label || calendarOpen) return;
  label.style.opacity = '0';
  setTimeout(() => {
    label.textContent = currentLang === 'FR' ? 'calendrier' : 'calendar';
    label.style.whiteSpace = '';
    label.style.opacity = '1';
  }, 200);
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
    const titreBio = data.bioTitre || data.nom;
    html += `<div class="texte-bio"><span class="bio-nom">${titreBio}</span><div class="bio-text">${bioText.replace(/\n/g, '<br>')}</div></div>`;
  }

  // 3. CREDITS en dernier
  if (creditsText) {
    const creditsLines = creditsText.split('\n').map(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        const label = line.substring(0, colonIdx);
        const value = line.substring(colonIdx + 1);
        return `<span class="credit-label">${label}<span class="credit-colon">&thinsp;:</span></span>${value}`;
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
  youtubeFrame = document.getElementById('youtube-frame');

  // reset état youtube
  if (youtubeFrame) {
    youtubeFrame.style.display = 'none';
    youtubeFrame.style.opacity = '0';
  }
  if (youtubePlayer) {
    try { youtubePlayer.destroy(); } catch(e) {}
    youtubePlayer = null;
  }

  if (data.youtube) {
    if (!youtubeFrame) {
      youtubeFrame = document.createElement('div');
      youtubeFrame.id = 'youtube-frame';
      wrapper.appendChild(youtubeFrame);
    }
    if (vimeoFrame) { vimeoFrame.src = ''; vimeoFrame.style.display = 'none'; }
    videoEl.style.display = 'block';
    videoEl.src = '';
    videoEl.poster = data.poster;
    wrapper.classList.add('is-vimeo'); // réutilise le même habillage CSS 16:9
    setTimeout(() => positionVimeoBtn(), 1100);
    return;
  }

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
// calcul identique à loadedmetadata mais pour 16:9
setTimeout(() => positionVimeoBtn(), 1100);

  } else {
    // Vidéo native MP4
    if (vimeoFrame) {
      vimeoFrame.src           = '';
      vimeoFrame.style.display = 'none';
    }
        wrapper.classList.remove('is-vimeo'); 
    videoEl.style.display = 'block';
    videoEl.src           = data.video;
    videoEl.poster        = data.poster;
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

let youtubeTimelineRaf = null;

function updateYoutubeTimeline() {
  if (!youtubePlayer || typeof youtubePlayer.getCurrentTime !== 'function') return;
  const current = youtubePlayer.getCurrentTime();
  const duration = youtubePlayer.getDuration();
  if (duration > 0) {
    const pct = (current / duration) * 100;
    timelineFill.style.width = pct + '%';
  }
  youtubeTimelineRaf = requestAnimationFrame(updateYoutubeTimeline);
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
      { role: "Services Communication et Presse", names: "Dorothée Mireux, Vanina Frasseto, Claire Galibert" },
      { role: "Remerciements", names: "Agnès de Cayeux, Faustine Fraysse, Bruno Gonthier, Alexandre Michaan" },
    ],
    kadistRoles: [
      { role: "Commissaire", names: "Joseph del Pesco" },
      { role: "Directrice des opérations globales", names: "Anne Becker" },
      { role: "Responsable des programmes", names: "Anna Ezequel" },
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
      <span class="credit-role">${lang === 'FR' ? 'Développement web' : 'Web development'} :</span><span class="credit-names"><a href="https://eleonoresense.com" target="_blank">Eléonore Sense</a></span>
    </div>
    <div class="credit-block">
      <span class="credit-role">${lang === 'FR' ? 'Typographie de titrage' : 'Display typeface'} :</span><span class="credit-names">Lagarto de <a href="https://www.sudtipos.com/font/lagarto" target="_blank">Sudtipos</a></span>
    </div>
    <div class="credit-block">
      <span class="credit-role">${lang === 'FR' ? 'Typographie de labeur' : 'Body typeface'} :</span><span class="credit-names">Abordage de <a href="https://velvetyne.fr/degheest/fr.html" target="_blank">Ange Degheest</a></span>
    </div>
  `;

  el.innerHTML = html;
},</span> ` 
      : `<span class="credit-name">${name}</span>`
  ).join('');
}