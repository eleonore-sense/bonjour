// =====================================================
// PATCH ANIM (à remplacer tel quel dans ton script_anim)
// =====================================================

let multipleNuclei = [];
let freezeSoloAtom = false;

// drift pendant le dézoom (position finale)
const DRIFT_X = -30;   // ← à régler
const DRIFT_Y = -70;  // ← à régler

// offset courant animé (0 → DRIFT)
let driftNowX = 0;
let driftNowY = 0;



// ✅ NEW : cache proprement l'atome solo + sa boucle
function hideSoloAtom() {
  if (typeof circle !== "undefined" && circle) circle.style.display = "none";
  if (typeof nucleus !== "undefined" && nucleus) nucleus.style.display = "none";

  document.querySelectorAll(".proton-symbol").forEach((p) => {
    p.style.display = "none";
  });

  if (typeof electrons !== "undefined" && electrons && Array.isArray(electrons)) {
    electrons.forEach((e) => {
      if (!e || !e.group) return;
      e.group.style.opacity = "0";
      e.group.style.display = "none";
    });
  }

  if (typeof currentLoop !== "undefined" && currentLoop) currentLoop.style.display = "none";
  if (typeof loopArrow !== "undefined" && loopArrow) loopArrow.style.display = "none";
}

// ✅ NEW : transition safe à appeler depuis ton bouton 3
function startMatterZoom() {
  // 1) on gèle l’anim de l’atome solo pour éviter qu’il bouge 1 frame
  freezeSoloAtom = true;

  // 2) on cache l’atome solo immédiatement
  hideSoloAtom();

  // 3) on prépare la matière
  createLargeStructure();

  // 4) zoom
  animateZoomOutViewBox();
}

// ------------------------------
// Step: createLargeStructure
// ------------------------------
function createLargeStructure() {
  multipleLoops = [];
  multipleLoopArrows = [];
  multipleNuclei = [];

  overlay.querySelectorAll(".loop-arrow").forEach((n) => n.remove());
  matterGroup.querySelectorAll(".mini-nucleus, .current-loop, rect").forEach((n) => n.remove());

  matterContainer = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  matterContainer.setAttribute("x", centerX -30);
  matterContainer.setAttribute("y", centerY - 20);
  matterContainer.setAttribute("width", "120");
  matterContainer.setAttribute("height", "180");
  matterContainer.setAttribute("rx", "5");
  matterContainer.setAttribute("ry", "5");
  matterContainer.setAttribute("fill", "#ffffff");
  matterContainer.setAttribute("stroke", "#000000");
  matterContainer.setAttribute("stroke-width", "1");
  matterContainer.setAttribute("vector-effect", "non-scaling-stroke");

  // ✅ important : on démarre invisible, et on fera monter avec eased pendant le zoom
  matterContainer.style.opacity = "0";
  matterGroup.appendChild(matterContainer);

  // --- positions (brutes) ---
  const positionsRaw = [
    { x: centerX - 32, y: centerY - 72 },
    { x: centerX + 5,  y: centerY - 35 },
    { x: centerX + 25, y: centerY - 65 },
    { x: centerX - 28, y: centerY - 20 },
    { x: centerX + 10, y: centerY - 2  },
    { x: centerX + 20, y: centerY + 20 },
    { x: centerX - 15, y: centerY + 50 },
    { x: centerX + 10, y: centerY + 72 }
  ];

  // ✅ NEW : on recale tout pour que positions[0] tombe pile au centre
  const dx = centerX  - positionsRaw[0].x;
  const dy = centerY - positionsRaw[0].y;



  const positions = positionsRaw.map(p => ({ x: p.x + dx, y: p.y + dy }));

  const finalOrbitRadius = 25;
  const currentLoopRadius = 250;
  const currentLoopRy = 62;

  const scale = currentLoopRadius / finalOrbitRadius;
  const miniNucleusRadius = 100 / scale;
  const finalOrbitRy = finalOrbitRadius * (currentLoopRy / currentLoopRadius);

  positions.forEach((pos, index) => {
    const miniNucleus = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    miniNucleus.setAttribute("class", "mini-nucleus");
    miniNucleus.setAttribute("cx", pos.x);
    miniNucleus.setAttribute("cy", pos.y);
    miniNucleus.setAttribute("r", miniNucleusRadius);
    miniNucleus.setAttribute("vector-effect", "non-scaling-stroke");
    miniNucleus.style.transition = "opacity 1s ease-out";

    // ✅ index>0 démarre à 0 et on le fera monter pendant le zoom
    miniNucleus.style.opacity = (index === 0) ? "1" : "0";

    matterGroup.appendChild(miniNucleus);
    multipleNuclei.push(miniNucleus);

    const loop = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    loop.setAttribute("class", "current-loop");
    loop.setAttribute("cx", pos.x);
    loop.setAttribute("cy", pos.y);
    loop.setAttribute("rx", finalOrbitRadius);
    loop.setAttribute("ry", finalOrbitRy);
    loop.setAttribute("vector-effect", "non-scaling-stroke");

    loop.style.opacity = (index === 0) ? "1" : "0";

    matterGroup.appendChild(loop);
    multipleLoops.push(loop);

    const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    arrow.setAttribute("class", "loop-arrow");
    arrow.dataset.loopX = pos.x;
    arrow.dataset.loopY = pos.y;
    arrow.dataset.rx = finalOrbitRadius;
    arrow.dataset.ry = finalOrbitRy;

    arrow.style.opacity = (index === 0) ? "1" : "0";

    overlay.appendChild(arrow);
    multipleLoopArrows.push(arrow);
  });
}

// ------------------------------
// Zoom viewBox (anti-flash)
// ------------------------------
function animateZoomOutViewBox() {
  setAnimating(true);
  currentStep = 2.85;

  const startTime = performance.now();
  const duration = 2000;

  const startScale = 260 / 25;
  const vbEnd = VIEWBOX_NORMAL;

  const startW = vbEnd.w / startScale;
  const startH = vbEnd.h / startScale;

  const vbStart = {
    w: startW,
    h: startH,
    x: centerX - startW / 2,
    y: centerY - startH / 2,
  };

  matterGroup.style.visibility = "hidden";
  overlay.style.visibility = "hidden";

  currentViewBox = { ...vbStart };
  svg.setAttribute("viewBox", `${vbStart.x} ${vbStart.y} ${vbStart.w} ${vbStart.h}`);
  svg.getBoundingClientRect();

  requestAnimationFrame(() => {
    matterGroup.style.visibility = "visible";
    overlay.style.visibility = "visible";
    zoomStep();
  });

  function zoomStep() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const x = vbStart.x + (vbEnd.x - vbStart.x) * eased;
    const y = vbStart.y + (vbEnd.y - vbStart.y) * eased;
    const w = vbStart.w + (vbEnd.w - vbStart.w) * eased;
    const h = vbStart.h + (vbEnd.h - vbStart.h) * eased;

    currentViewBox = { x, y, w, h };
    svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);

driftNowX = DRIFT_X * eased;
driftNowY = DRIFT_Y * eased;

matterGroup.setAttribute("transform", `translate(${driftNowX}, ${driftNowY})`);

const easedFast = Math.min(eased * 3, 1);

if (matterContainer) matterContainer.style.opacity = String(easedFast);

for (let i = 1; i < multipleLoops.length; i++) {
  if (multipleNuclei[i]) multipleNuclei[i].style.opacity = String(easedFast);
  if (multipleLoops[i]) multipleLoops[i].style.opacity = String(easedFast);
  if (multipleLoopArrows[i]) multipleLoopArrows[i].style.opacity = String(easedFast);

    }


    if (progress < 1) {
      requestAnimationFrame(zoomStep);
    } else {
      currentViewBox = { ...VIEWBOX_NORMAL };
      svg.setAttribute("viewBox", `0 0 600 350`);

      // fin propre
      if (matterContainer) matterContainer.style.opacity = "1";
      for (let i = 1; i < multipleLoops.length; i++) {
        if (multipleNuclei[i]) multipleNuclei[i].style.opacity = "1";
        if (multipleLoops[i]) multipleLoops[i].style.opacity = "1";
        if (multipleLoopArrows[i]) multipleLoopArrows[i].style.opacity = "1";
      }

      setAnimating(false);

driftNowX = DRIFT_X;
driftNowY = DRIFT_Y;
matterGroup.setAttribute("transform", `translate(${driftNowX}, ${driftNowY})`);

      finishZoomOut();
    }
  }
}



// ------------------------------
// Finish zoom
// ------------------------------
function finishZoomOut() {
  if (matterContainer) matterContainer.style.opacity = "1";

  document.querySelectorAll(".mini-nucleus").forEach((n) => {
    n.style.opacity = "1";
  });

  multipleLoops.forEach((loop) => {
    loop.style.opacity = "1";
  });

  multipleLoopArrows.forEach((arrow) => {
    arrow.style.opacity = "1";
  });
}
function createBigLoop() {
  const rx = 100;
  const ry = 25;
  const rectRight = centerX + 60;
  const angleCut = Math.acos((rectRight - centerX) / rx);

  const defs = svg.querySelector('defs') || document.createElementNS("http://www.w3.org/2000/svg", "defs");
  if (!svg.querySelector('defs')) svg.appendChild(defs);

  const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  filter.setAttribute("id", "pinkGlow");
  filter.setAttribute("x", "-50%");
  filter.setAttribute("y", "-50%");
  filter.setAttribute("width", "200%");
  filter.setAttribute("height", "200%");

  const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
  blur.setAttribute("in", "SourceAlpha");
  blur.setAttribute("stdDeviation", "15");
  blur.setAttribute("result", "blur");

  const colorMatrix = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
  colorMatrix.setAttribute("in", "blur");
  colorMatrix.setAttribute("type", "matrix");
  colorMatrix.setAttribute("values", "0 0 0 0 1  0 0 0 0 0.4  0 0 0 0 0.8  0 0 0 1 0");
  colorMatrix.setAttribute("result", "pinkBlur");

  const merge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
  const mergeNode1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
  mergeNode1.setAttribute("in", "pinkBlur");
  const mergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
  mergeNode2.setAttribute("in", "SourceGraphic");
  merge.appendChild(mergeNode1);
  merge.appendChild(mergeNode2);
  filter.appendChild(blur);
  filter.appendChild(colorMatrix);
  filter.appendChild(merge);
  defs.appendChild(filter);

  bigLoopBack = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  bigLoopBack.setAttribute("class", "current-loop");
  bigLoopBack.setAttribute("cx", centerX);
  bigLoopBack.setAttribute("cy", centerY);
  bigLoopBack.setAttribute("rx", rx);
  bigLoopBack.setAttribute("ry", ry);
  bigLoopBack.setAttribute("filter", "url(#pinkGlow)");
  svg.insertBefore(bigLoopBack, matterGroup);

  bigLoop = document.createElementNS("http://www.w3.org/2000/svg", "path");
  bigLoop.setAttribute("class", "current-loop");
  bigLoop.setAttribute("d", `
    M ${centerX + rx * Math.cos(angleCut)},${centerY + ry * Math.sin(angleCut)}
    A ${rx},${ry} 0 0,1 ${centerX - rx * Math.cos(angleCut)},${centerY + ry * Math.sin(angleCut)}
  `);
  bigLoop.setAttribute("filter", "url(#pinkGlow)");
  svg.appendChild(bigLoop);

  bigLoopArrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  bigLoopArrow.setAttribute("class", "loop-arrow");
  svg.appendChild(bigLoopArrow);
}

function computeMagneticField(x, y) {
  let fx = 0, fy = 0;
  const northX = centerX, northY = centerY - 90;
  const dxN = x - northX, dyN = y - northY;
  const distSqN = dxN * dxN + dyN * dyN;
  if (distSqN > 100) {
    const distN = Math.sqrt(distSqN);
    const forceN = 1 / (distSqN * 0.002);
    fx += forceN * dxN / distN;
    fy += forceN * dyN / distN;
  }
  const southX = centerX, southY = centerY + 90;
  const dxS = x - southX, dyS = y - southY;
  const distSqS = dxS * dxS + dyS * dyS;
  if (distSqS > 100) {
    const distS = Math.sqrt(distSqS);
    const forceS = -1 / (distSqS * 0.002);
    fx += forceS * dxS / distS;
    fy += forceS * dyS / distS;
  }
  return { fx, fy };
}

function traceMagneticLine(x, y, reverse = false) {
  let points = [`M${x},${y}`];
  let prevDir = null;

  for (let i = 0; i < 250; i++) {
    const { fx, fy } = computeMagneticField(x, y);
    const len = Math.sqrt(fx * fx + fy * fy);
    if (len === 0) break;

    let dx = fx / len;
    let dy = fy / len;
    if (reverse) { dx = -dx; dy = -dy; }

    if (prevDir) {
      const curveStrength = 0.5;
      dx = (1 - curveStrength) * prevDir.dx + curveStrength * dx;
      dy = (1 - curveStrength) * prevDir.dy + curveStrength * dy;
      const dlen = Math.sqrt(dx * dx + dy * dy);
      if (dlen > 0) { dx /= dlen; dy /= dlen; }
    }

    x += dx * 1.5;
    y += dy * 1.5;

    if (x < 50 || x > 550 || y < 20 || y > 330) break;

    const distToSouth = Math.sqrt((x - centerX) ** 2 + (y - (centerY + 90)) ** 2);
    if (!reverse && distToSouth < 15) break;

    const distToNorth = Math.sqrt((x - centerX) ** 2 + (y - (centerY - 90)) ** 2);
    if (reverse && distToNorth < 15) break;

    points.push(`L${x},${y}`);
    prevDir = { dx, dy };
  }
  return points.join(" ");
}

function shouldHideSouthLine(pathData) {
  const coords = pathData.match(/[\d.]+/g);
  let maxDist = 0;
  let allPointsAboveSouth = true;
  const southY = centerY + 90;

  for (let i = 0; i < coords.length; i += 2) {
    const x = parseFloat(coords[i]);
    const y = parseFloat(coords[i + 1]);
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    maxDist = Math.max(maxDist, dist);
    if (y > southY) allPointsAboveSouth = false;
  }
  return maxDist < 170 && allPointsAboveSouth;
}

function createFieldLines() {
  const linesCount = 20;
  const offsetRadius = 15;

  for (let i = 0; i < linesCount; i++) {
    const angle = (2 * Math.PI * i) / linesCount;
    const startX = centerX + Math.cos(angle) * offsetRadius;
    const startY = (centerY - 90) + Math.sin(angle) * offsetRadius;
    const pathData = traceMagneticLine(startX, startY, false);

    if (pathData && pathData.length > 10) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "field-line");
      path.setAttribute("d", pathData);
      path.style.opacity = "0";
      svg.appendChild(path);
      fieldPaths.push(path);

      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      arrow.setAttribute("class", "field-arrow");
      arrow.style.opacity = "0";
      svg.appendChild(arrow);
      fieldArrows.push({ arrow, path, fromSouth: false });
    }
  }

  for (let i = 0; i < linesCount; i++) {
    const angle = (2 * Math.PI * i) / linesCount;
    const startX = centerX + Math.cos(angle) * offsetRadius;
    const startY = (centerY + 90) + Math.sin(angle) * offsetRadius;
    const pathData = traceMagneticLine(startX, startY, true);

    if (pathData && pathData.length > 10) {
      const shouldHide = shouldHideSouthLine(pathData);
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("class", "field-line");
      path.setAttribute("d", pathData);
      path.style.opacity = "0";
      if (shouldHide) path.style.display = "none";
      svg.appendChild(path);
      fieldPaths.push(path);

      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      arrow.setAttribute("class", "field-arrow");
      arrow.style.opacity = "0";
      svg.appendChild(arrow);
      fieldArrows.push({ arrow, path, fromSouth: true, hidden: shouldHide });
    }
  }
}

function createPoleLegend() {
  const poleRadius = 20;
  const northX = centerX, northY = centerY - 90;
  const southX = centerX, southY = centerY + 90;

  const circleN = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleN.setAttribute("class", "pole-legend");
  circleN.setAttribute("cx", northX);
  circleN.setAttribute("cy", northY);
  circleN.setAttribute("r", poleRadius);
  svg.appendChild(circleN);

  const labelN = document.createElementNS("http://www.w3.org/2000/svg", "text");
  labelN.setAttribute("class", "pole-legend-label");
  labelN.setAttribute("x", northX);
  labelN.setAttribute("y", northY);
  labelN.textContent = "N";
  svg.appendChild(labelN);

  const circleS = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circleS.setAttribute("class", "pole-legend-south");
  circleS.setAttribute("cx", southX);
  circleS.setAttribute("cy", southY);
  circleS.setAttribute("r", poleRadius);
  svg.appendChild(circleS);

  const labelS = document.createElementNS("http://www.w3.org/2000/svg", "text");
  labelS.setAttribute("class", "pole-legend-label-south");
  labelS.setAttribute("x", southX);
  labelS.setAttribute("y", southY);
  labelS.textContent = "S";
  svg.appendChild(labelS);
}




// ========== ANIMATIONS EN BOUCLE ==========

function animateLoopArrow() {
  if (!currentLoop) return;
  const t = performance.now() * 0.001;
  const angle = (t % 3) / 3 * Math.PI * 2;
  const x = centerX + 250 * Math.cos(angle);
  const y = centerY + 62 * Math.sin(angle);
  const tangentAngle = Math.atan2(62 * Math.cos(angle), -250 * Math.sin(angle));
  const size = 6;
  const cos = Math.cos(tangentAngle), sin = Math.sin(tangentAngle);
  const points = [
    [x + cos * size, y + sin * size],
    [x - sin * size * 0.5, y + cos * size * 0.5],
    [x + sin * size * 0.5, y - cos * size * 0.5]
  ];
  loopArrow.setAttribute("points", points.map(p => p.join(",")).join(" "));
}
function animateMultipleLoopArrows() {
  if (multipleLoopArrows.length === 0) return;
  const t = performance.now() * 0.001;
  const angle = ((t % 3) / 3) * Math.PI * 2;

multipleLoopArrows.forEach((arrow, i) => {
  const svgCx = parseFloat(multipleNuclei[i].getAttribute("cx")) + driftNowX;
  const svgCy = parseFloat(multipleNuclei[i].getAttribute("cy")) + driftNowY;

  // convertir coords SVG → coords overlay (taille fixe 600x350)
  const scaleX = 600 / currentViewBox.w;
  const scaleY = 350 / currentViewBox.h;
  const loopX = (svgCx - currentViewBox.x) * scaleX;
  const loopY = (svgCy - currentViewBox.y) * scaleY;

  const rx = parseFloat(arrow.dataset.rx) * scaleX;
  const ry = parseFloat(arrow.dataset.ry) * scaleY;

    const x = loopX + rx * Math.cos(angle);
    const y = loopY + ry * Math.sin(angle);

    const tangentAngle = Math.atan2(ry * Math.cos(angle), -rx * Math.sin(angle));
    const size = 6;
    const cos = Math.cos(tangentAngle);
    const sin = Math.sin(tangentAngle);

    const points = [
      [x + cos * size, y + sin * size],
      [x - sin * size * 0.5, y + cos * size * 0.5],
      [x + sin * size * 0.5, y - cos * size * 0.5],
    ];
    arrow.setAttribute("points", points.map((pt) => pt.join(",")).join(" "));
  });
}


function animateBigLoopArrow() {
  if (!bigLoop) return;
  const t = performance.now() * 0.001;
  const angle = (t % 3) / 3 * Math.PI * 2;
  const x = centerX + 100 * Math.cos(angle);
  const y = centerY + 25 * Math.sin(angle);

  if (x >= centerX - 60 && x <= centerX + 60 && y >= centerY - 90 && y <= centerY + 90 && y < centerY) {
    bigLoopArrow.setAttribute("points", "");
    return;
  }

  const tangentAngle = Math.atan2(25 * Math.cos(angle), -100 * Math.sin(angle));
  const size = 6;
  const cos = Math.cos(tangentAngle), sin = Math.sin(tangentAngle);
  const points = [
    [x + cos * size, y + sin * size],
    [x - sin * size * 0.5, y + cos * size * 0.5],
    [x + sin * size * 0.5, y - cos * size * 0.5]
  ];
  bigLoopArrow.setAttribute("points", points.map(p => p.join(",")).join(" "));
}

function animateFieldArrows() {
  if (fieldArrows.length === 0) return;
  const t = performance.now() * 0.001;
  const cycle = (t % 3) / 3;

  fieldArrows.forEach(({ arrow, path, fromSouth, hidden }) => {
    if (hidden) { arrow.setAttribute("points", ""); return; }
    if (!path || !path.getTotalLength) return;
    const len = path.getTotalLength();
    let pos = fromSouth ? len * (1 - cycle) : len * cycle;
    const p1 = path.getPointAtLength(pos);
    const p2 = path.getPointAtLength(fromSouth ? Math.max(pos - 8, 0) : Math.min(pos + 8, len));
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const size = 6;
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const points = [
      [p1.x + cos * size, p1.y + sin * size],
      [p1.x - sin * size * 0.5, p1.y + cos * size * 0.5],
      [p1.x + sin * size * 0.5, p1.y - cos * size * 0.5]
    ];
    arrow.setAttribute("points", points.map(p => p.join(",")).join(" "));
  });
}

function animate() {
  if (currentStep <= 2.85 && !freezeSoloAtom) {
    electrons.forEach(electron => {
      electron.orbitAngle += electron.orbitSpeed;
      electron.x = centerX + Math.cos(electron.orbitAngle) * electron.orbitRadius;
      electron.y = centerY + Math.sin(electron.orbitAngle) * electron.orbitRadius;
      electron.spinAngle += electron.spinSpeed;
      electron.group.setAttribute("transform",
        `translate(${electron.x},${electron.y}) rotate(${electron.spinAngle * 180 / Math.PI})`
      );
    });
  }

  if (currentStep === 2.5 || currentStep === 2.75) animateLoopArrow();

  // multiple loops (pendant + après zoom)
  if (currentStep === 2.75 || currentStep === 2.85 || currentStep === 3) {
    animateMultipleLoopArrows();
  }

  // big loop (step 3+)
  if (currentStep >= 3) {
    animateBigLoopArrow();
  }

  // champ (step 4+)
  if (currentStep >= 4) {
    animateFieldArrows();
  }

  requestAnimationFrame(animate);
}

animate();

// ------------------------------
// Expose functions (pour script_bouton)
// ------------------------------
window.createLargeStructure = createLargeStructure;
window.animateZoomOutViewBox = animateZoomOutViewBox;
window.finishZoomOut = finishZoomOut;
window.startMatterZoom = startMatterZoom;
window.createBigLoop = createBigLoop;