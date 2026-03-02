
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
