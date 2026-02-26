
// ========== BOUTON 1 ==========
document.getElementById('button1').addEventListener('click', function () {
  if (isAnimating) return;
  if (currentStep === 1) {
    currentStep = 2;
    this.style.display = 'none';
    document.getElementById('text3').style.display = 'block';
    document.getElementById('button2').style.display = 'block';
    electrons.forEach(electron => {
      electron.spinAngle = 0;
      electron.spinSpeed = 0.03;
    });
  }
});

// ========== BOUTON 2 ==========
document.getElementById('button2').addEventListener('click', function () {
  if (isAnimating) return;
  if (currentStep === 2) {
    currentStep = 2.5;
    this.style.display = 'none';
    document.getElementById('text3').style.display = 'none';
    document.getElementById('text4').style.display = 'block';
    document.getElementById('button3').style.display = 'block';
    document.getElementById('bulle_paquet').style.display = 'block';
    createCurrentLoop();


        // petite bulle → grande bulle
    setTimeout(() => {
      grosseBulle.classList.add('expanded');
      boutonApparu = true; // on déverrouille ici plutôt que sur le click button3
    }, 50);
  }
});

// ========== BOUTON 3 ==========
document.getElementById("button3").addEventListener("click", function () {
  if (isAnimating) return;
  if (currentStep !== 2.5) return;

  currentStep = 2.75;
  setAnimating(true);

  this.style.display = "none";
 boutonApparu = true; 
document.getElementById('contenu_bulle').style.opacity = '0';
document.getElementById('bulle_paquet').style.cursor = 'pointer';

// puis bulle rétrécit (petit délai pour laisser le fade out)
setTimeout(() => {
  grosseBulle.classList.remove('expanded');
}, 200);

  document.getElementById("text4b").style.display = "block";
  document.getElementById("button4b").style.display = "block";

  electrons.forEach(electron => { electron.group.style.opacity = "0"; });
  document.querySelectorAll(".proton-symbol").forEach(p => { p.style.opacity = "0"; });
  nucleus.style.opacity = "0";
  circle.style.opacity = "0";
  if (currentLoop) currentLoop.style.opacity = "0";
  if (loopArrow) loopArrow.style.opacity = "0";

  // ✅ au lieu du setTimeout + createLargeStructure + zoom
  startMatterZoom();
});

// ========== BOUTON 4B ==========
document.getElementById('button4b').addEventListener('click', function () {
  if (isAnimating) return;
  // on garde ton step logique
  if (currentStep === 2.85) {
    currentStep = 3;
    setAnimating(true);
    this.style.display = 'none';
    document.getElementById('text4c').style.display = 'block';
    document.getElementById('button5').style.display = 'block';

    createBigLoop();

    setTimeout(() => {
      multipleLoops.forEach(loop => { loop.style.opacity = "0"; });
      multipleLoopArrows.forEach(arrow => { arrow.style.opacity = "0"; });
      document.querySelectorAll('.mini-nucleus').forEach(n => { n.style.opacity = "0"; });
      setTimeout(() => { setAnimating(false); }, 1000);
    }, 1000);
  }
});


// ========== BOUTON 5 ==========
document.getElementById('button5').addEventListener('click', function () {
  if (isAnimating) return;
  if (currentStep === 3) {
    currentStep = 4;
    setAnimating(true);
    this.style.display = 'none';
    document.getElementById('text5').style.display = 'block';
    document.getElementById('boite_bord').style.display = 'block';
    document.getElementById('button6').style.display = 'block';

    createFieldLines();

    setTimeout(() => {
      fieldPaths.forEach(path => { path.style.opacity = "1"; });
      fieldArrows.forEach(({ arrow }) => { arrow.style.opacity = "1"; });
      setTimeout(() => { setAnimating(false); }, 1000);
    }, 50);
  }
});

// ========== BOUTON 6 ==========
document.getElementById('button6').addEventListener('click', function () {
  if (isAnimating) return;
  if (currentStep === 4) {
    currentStep = 5;
    setAnimating(true);
    this.style.display = 'none';
    document.getElementById('text6').style.display = 'block';
    if (bigLoop) bigLoop.style.opacity = "0";
    if (bigLoopBack) bigLoopBack.style.opacity = "0";
    if (bigLoopArrow) bigLoopArrow.style.opacity = "0";

    setTimeout(() => {
      createPoleLegend();
      setAnimating(false);
    }, 1000);



    setTimeout(() => {
  document.getElementById('passer_electro').style.display = 'block';
  document.getElementById('cartoon').style.opacity = "1";
  document.getElementById('champs_elec').style.display = 'block';
}, 2500); // apparaît 1.5s après createPoleLegend


  }
});