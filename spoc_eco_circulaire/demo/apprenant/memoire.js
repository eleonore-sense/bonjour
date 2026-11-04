// =====================================================================
// MÉMOIRE : les réponses de l'étudiant, gardées entre les pages et les séances
//
// Le seul endroit qui range les réponses. Les autres fichiers (mentor.js,
// mission2.js, porte_documents.js…) passent par lui :
//   Memoire.lire('athentech_enjeux')            → la valeur (ou null)
//   Memoire.ecrire('athentech_enjeux', valeur)  → range la valeur
//
// Où sont rangées les réponses ?
//   - toujours dans le navigateur (localStorage), sous des noms qui commencent par « athentech_ » ;
//   - et, quand la page est ouverte dans Moodle par le SCORM, aussi dans Moodle :
//     la page parle au « pont » (scorm.html), qui écrit dans le SCORM (cmi.suspend_data).
//     L'étudiant retrouve alors ses réponses même sur un autre ordinateur.
//
// Ouverture de la page dans Moodle : les réponses gardées par Moodle arrivent
// une fraction de seconde après le chargement. Elles remplacent celles du navigateur,
// puis l'événement « memoire:prete » prévient les autres fichiers.
//
// À charger juste après script.js, AVANT les scripts de l'activité, avec defer :
//   <script src="memoire.js" defer></script>
// =====================================================================

(function () {

  const PREFIXE = 'athentech_';

  // Adresses autorisées pour le pont, en plus de celle de la page elle-même.
  // Rien à mettre si les pages sont DANS le zip SCORM (même adresse que le pont).
  // Si le zip ouvre ton site GitHub Pages dans un cadre, mets ici l'adresse de ton Moodle,
  // par exemple : ['https://moodle.universite-paris-saclay.fr']
  const ORIGINES_PONT = [];

  const DELAI_PONT = 1500;   // sans réponse du pont après ce délai (ms) : on continue sans Moodle


  // ---------- Le navigateur (localStorage) ----------

  function lireLocal(cle) {
    try {
      const brut = localStorage.getItem(cle);
      return brut === null ? null : JSON.parse(brut);
    } catch {
      return null;
    }
  }

  function ecrireLocal(cle, valeur) {
    try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* stockage indisponible */ }
  }

  function clesLocales() {
    const cles = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const cle = localStorage.key(i);
        if (cle && cle.startsWith(PREFIXE)) cles.push(cle);
      }
    } catch { /* stockage indisponible */ }
    return cles;
  }


  // ---------- Le pont vers Moodle (scorm.html) ----------

  const dansUnCadre = window.parent !== window;
  const originesPossibles = [location.origin, ...ORIGINES_PONT];
  let originePont = null;    // connue dès que le pont a répondu
  let pret = !dansUnCadre;   // hors de Moodle : prêt tout de suite

  function versPont(message) {
    if (originePont) window.parent.postMessage(message, originePont);
  }

  function annoncerPret() {
    pret = true;
    document.dispatchEvent(new CustomEvent('memoire:prete', { detail: { scorm: Boolean(originePont) } }));
  }

  if (dansUnCadre) {
    window.addEventListener('message', e => {
      if (e.source !== window.parent || !originesPossibles.includes(e.origin)) return;
      if (!e.data || e.data.type !== 'memoire:donnees') return;

      originePont = e.origin;
      const recues = e.data.donnees || {};

      // ce que Moodle a gardé remplace ce que le navigateur a
      Object.entries(recues).forEach(([cle, valeur]) => {
        if (cle.startsWith(PREFIXE)) ecrireLocal(cle, valeur);
      });
      // ce que seul le navigateur a (réponses d'avant le SCORM) part vers Moodle
      clesLocales()
        .filter(cle => !(cle in recues))
        .forEach(cle => versPont({ type: 'memoire:ecrire', cle, valeur: lireLocal(cle) }));

      annoncerPret();
    });

    // on demande au pont les réponses gardées par Moodle
    originesPossibles.forEach(origine => {
      try { window.parent.postMessage({ type: 'memoire:demande' }, origine); } catch { /* pas ce cadre-là */ }
    });

    // pas de pont (page ouverte dans un autre cadre) : on continue avec le navigateur seul
    setTimeout(() => { if (!pret) annoncerPret(); }, DELAI_PONT);
  }


  // ---------- Ce que les autres fichiers utilisent ----------

  window.Memoire = {
    lire: cle => lireLocal(cle),

    ecrire(cle, valeur) {
      ecrireLocal(cle, valeur);
      versPont({ type: 'memoire:ecrire', cle, valeur });
    },

    // pour plus tard : l'activité est terminée (« completed » dans le SCORM)
    terminer() {
      versPont({ type: 'memoire:statut', statut: 'completed' });
    },

    get pret() { return pret; },                 // les réponses de Moodle sont-elles arrivées ?
    get scorm() { return Boolean(originePont); }, // la page est-elle reliée à Moodle ?
  };

})();
