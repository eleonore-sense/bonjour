// ==============================
// script_anim.js (version patchée)
// ==============================

let isAnimating = false;

function setAnimating(value) {
  isAnimating = value;
  document.querySelectorAll(".next-button").forEach((btn) => {
    btn.classList.toggle("bloque", value);
  });
}

const svg = document.getElementById("mysvg");
const overlay = document.getElementById("overlay");

const centerX = 300;
const centerY = 175;
const radius = 100;

const VIEWBOX_NORMAL = { x: 0, y: 0, w: 600, h: 350 };
let currentViewBox = { ...VIEWBOX_NORMAL };

// ✅ zoomFocus existe (mais ici on force le départ au centre pour éviter le "move bizarre")
let zoomFocus = { x: centerX, y: centerY };

const matterGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
matterGroup.setAttribute("id", "matter-group");
svg.appendChild(matterGroup);

const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("id", "matter-circle");
circle.setAttribute("cx", centerX);
circle.setAttribute("cy", centerY);
circle.setAttribute("r", radius);
circle.setAttribute("fill", "#ffffff");
circle.style.pointerEvents = "none";
svg.appendChild(circle);

const nucleus = document.createElementNS("http://www.w3.org/2000/svg", "circle");
nucleus.setAttribute("id", "nucleus");
nucleus.setAttribute("cx", centerX);
nucleus.setAttribute("cy", centerY);
nucleus.setAttribute("fill", "#ffffff");
nucleus.style.pointerEvents = "all";
nucleus.setAttribute("r", 25);
svg.appendChild(nucleus);

const numProtons = 4;
for (let i = 0; i < numProtons; i++) {
  const angle = (Math.PI * 2 * i) / numProtons;
  const dist = 10;
  const px = centerX + Math.cos(angle) * dist;
  const py = centerY + Math.sin(angle) * dist;
  const proton = document.createElementNS("http://www.w3.org/2000/svg", "text");
  proton.setAttribute("class", "proton-symbol");
  proton.setAttribute("x", px);
  proton.setAttribute("y", py);
  proton.setAttribute("fill", "#ffffff");
  proton.textContent = "+";
  svg.appendChild(proton);
}

const electrons = [];
const numElectrons = 8;
const electronRadius = 8;

let currentStep = 1;

let fieldPaths = [];
let fieldArrows = [];

let currentLoop = null;
let loopArrow = null;

let multipleLoops = [];
let multipleLoopArrows = [];

let matterContainer = null;

let bigLoop = null;
let bigLoopArrow = null;
let bigLoopBack = null;

// ------------------------------
// Electrons
// ------------------------------
function createElectron(index) {
  const orbitRadius = 40 + (index % 3) * 20;
  const orbitSpeed = 0.01 + Math.random() * 0.005;
  const startAngle = Math.random() * Math.PI * 2;
  const spinSpeed =
    (index % 2 === 0 ? 1 : -1) * (0.03 + Math.random() * 0.02);

  const electron = {
    x: centerX + Math.cos(startAngle) * orbitRadius,
    y: centerY + Math.sin(startAngle) * orbitRadius,
    orbitRadius,
    orbitAngle: startAngle,
    orbitSpeed,
    spinAngle: Math.random() * Math.PI * 2,
    spinSpeed,
    group: null,
    circle: null,
    symbol: null,
  };

  const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(group);
  electron.group = group;

  const circleElem = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleElem.setAttribute("class", "electron-circle");
  circleElem.setAttribute("cx", 0);
  circleElem.setAttribute("cy", 0);
  circleElem.setAttribute("r", electronRadius);
  group.appendChild(circleElem);
  electron.circle = circleElem;

  const symbolElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
  symbolElem.setAttribute("class", "electron-symbol");
  symbolElem.setAttribute("x", 0);
  symbolElem.setAttribute("y", 0);
  symbolElem.textContent = "−";
  group.appendChild(symbolElem);
  electron.symbol = symbolElem;

  return electron;
}

for (let i = 0; i < numElectrons; i++) {
  electrons.push(createElectron(i));
}


// ===== INIT TOOLTIP (début) =====

// 1) Tooltip sur le noyau (+)
createTooltip(
  document.getElementById("nucleus"),
  "Noyau (+)\ncharge positive",
  "champs_electrique.html"
);

// 2) Tooltip sur les protons "+" (text)
document.querySelectorAll(".proton-symbol").forEach((p) => {
  createTooltip(
    p,
    "Proton (+)\ncharge positive",
    "champs_electrique.html"
  );
});

// 3) Tooltip sur les électrons (-)
// (on met le tooltip sur le groupe entier, plus facile à survoler)
electrons.forEach((e) => {
  // Hitbox pour être sûr que le hover est facile
  const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  hit.setAttribute("cx", 0);
  hit.setAttribute("cy", 0);
  hit.setAttribute("r", 14);
  hit.setAttribute("fill", "transparent");
  hit.setAttribute("pointer-events", "all");
  e.group.insertBefore(hit, e.group.firstChild);

  createTooltip(
    e.group,
    "Electron (−)\ncharge négative",
    "champs_electrique.html"
  );
});
// ------------------------------
// Step: createCurrentLoop
// ------------------------------
function createCurrentLoop() {
  setAnimating(true);

  currentLoop = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  currentLoop.setAttribute("class", "current-loop");
  currentLoop.setAttribute("cx", centerX);
  currentLoop.setAttribute("cy", centerY);
  currentLoop.setAttribute("rx", "250");
  currentLoop.setAttribute("ry", "62");
  currentLoop.style.opacity = "0";
  svg.appendChild(currentLoop);

  loopArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  loopArrow.setAttribute("class", "loop-arrow");
  loopArrow.style.opacity = "0";
  svg.appendChild(loopArrow);

  const startTime = performance.now();
  const duration = 1000;

  function fadeIn() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    currentLoop.style.opacity = progress;
    loopArrow.style.opacity = progress;

    if (progress < 1) requestAnimationFrame(fadeIn);
    else setAnimating(false);
  }

  fadeIn();
}


// ===== TOOLTIPS ET LIENS =====
function createTooltip(element, text, link) {
  if (!element) {
    console.log("Element non trouvé pour le tooltip");
    return;
  }

  const tooltip = document.getElementById("legende");
  if (!tooltip) {
    console.log("Div #legende introuvable (ajoute-la dans le HTML)");
    return;
  }

  element.classList.add("clickable-element");

  element.addEventListener("mouseenter", (e) => {
    tooltip.textContent = text; // \n ok grâce à white-space: pre-line
    tooltip.style.display = "block";
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY - 30 + "px";
  });

  element.addEventListener("mousemove", (e) => {
    tooltip.style.left = e.pageX + 10 + "px";
    tooltip.style.top = e.pageY - 30 + "px";
  });

  element.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

  if (link) {
    element.addEventListener("click", () => {
      window.open(link, "_blank");
    });
  }
}






// BULLE AIMANT
const bulle_paquet = document.getElementById('bulle_paquet');
const grosseBulle = document.getElementById('grosse_bulle');
const contenu_bulle = document.getElementById('contenu_bulle');
let leaveTimeout;
let boutonApparu = false;

grosseBulle.addEventListener('mouseenter', () => {
    clearTimeout(leaveTimeout);
  if (!boutonApparu) return;
    contenu_bulle.style.opacity = '';
  grosseBulle.classList.add('expanded');
  // pas touche au contenu ici, c'est le CSS qui gère
});

grosseBulle.addEventListener('mouseleave', () => {
  if (!boutonApparu) return;
  leaveTimeout = setTimeout(() => {
  contenu_bulle.style.opacity = '0'; // contenu disparaît d'abord
  setTimeout(() => {
    grosseBulle.classList.remove('expanded'); // puis bulle rétrécit
  }, 250);
    }, 100);
});