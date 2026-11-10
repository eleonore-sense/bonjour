
window.addEventListener('load', function () {
  var liste = [];

  if (typeof image !== 'undefined' && Array.isArray(image)) {

    for (var i = 1; i < image.length; i++) {
      liste.push('img/' + image[i]);
    }
  } else {
      document.querySelectorAll('[onmouseover]').forEach(function (lien) {
      var nom = lien.getAttribute('onmouseover').replace(/\(.*$/, '').trim();
      if (typeof window[nom] !== 'function') return;
      var trouve = String(window[nom]).match(/url\(["']?([^"')]+)["']?\)/);
      if (trouve && liste.indexOf(trouve[1]) === -1) liste.push(trouve[1]);
    });
 
    liste.sort(function (a, b) { return /\.gif$/i.test(a) - /\.gif$/i.test(b); });
  }

  var gardees = []; // garde les images en mémoire pour que le navigateur ne les oublie pas
  function suivante() {
    var src = liste.shift();
    if (!src) return;
    var img = new Image();
    img.onload = img.onerror = function () {
      img.onload = img.onerror = null; // une seule fois par image
      suivante();
    };
    img.src = src;
    gardees.push(img);
  }
  suivante();
});