// =====================================================================
// LE PONT SCORM 2004 (avec scorm.html)
//
// 1. Il trouve Moodle (l'API SCORM 2004, « API_1484_11 ») et s'y présente une seule fois.
// 2. Il récupère les réponses déjà gardées par Moodle (cmi.suspend_data).
// 3. Il affiche la page du cours dans son cadre.
// 4. Les pages lui envoient les réponses (memoire.js) : il les range dans Moodle.
// 5. Quand l'étudiant quitte, il dit à Moodle de tout garder pour la prochaine fois.
//
// Pourquoi un pont ? Moodle n'accepte qu'une présentation par visite. Si chaque page
// du cours se présentait elle-même, la 2e page serait refusée. Le pont reste ouvert
// pendant toute la visite, et les pages changent dans son cadre.
// =====================================================================

(function () {

  // ---------- Réglages ----------

  // La page qui s'ouvre en premier :
  //   - pages DANS le zip SCORM : son nom, par exemple 'chap3_IV_1.html'
  //   - site GitHub Pages ouvert dans le cadre : son adresse complète,
  //     par exemple 'https://eleonore-sense.github.io/…/chap3_IV_1.html'
  //     (et dans memoire.js, mettre l'adresse de Moodle dans ORIGINES_PONT)
  const PAGE_DE_DEPART = 'chap3_IV_1.html';

  const TAILLE_MAX = 64000;   // place maximale de cmi.suspend_data en SCORM 2004


  // ---------- Trouver Moodle ----------
  // L'API est posée par Moodle sur une des fenêtres « parentes » du pont

  function chercherAPI(fenetre) {
    for (let i = 0; fenetre && i < 10; i++) {
      try {
        if (fenetre.API_1484_11) return fenetre.API_1484_11;
      } catch { /* fenêtre d'un autre site : on ne peut pas regarder dedans */ }
      if (fenetre.parent === fenetre) break;
      fenetre = fenetre.parent;
    }
    return null;
  }

  const api = (window.parent !== window ? chercherAPI(window.parent) : null)
           || (window.opener ? chercherAPI(window.opener) : null);

  let donnees = {};          // toutes les réponses : { athentech_enjeux: …, athentech_mission2: … }
  let ouvert = false;        // la séance SCORM est-elle ouverte ?

  if (api && api.Initialize('') === 'true') {
    ouvert = true;
    try {
      const brut = api.GetValue('cmi.suspend_data');
      donnees = brut ? JSON.parse(brut) : {};
    } catch {
      donnees = {};
    }
    // 1re visite : l'activité passe de « pas commencée » à « en cours »
    const statut = api.GetValue('cmi.completion_status');
    if (statut === 'not attempted' || statut === 'unknown' || statut === '') {
      api.SetValue('cmi.completion_status', 'incomplete');
      api.Commit('');
    }
  } else {
    console.warn('Pont SCORM : Moodle introuvable. Les réponses restent dans le navigateur.');
  }


  // ---------- Ranger dans Moodle ----------

  function sauver() {
    if (!ouvert) return;
    const texte = JSON.stringify(donnees);
    if (texte.length > TAILLE_MAX) {
      console.error(`Pont SCORM : réponses trop longues (${texte.length} caractères, ${TAILLE_MAX} au plus). Elles ne sont pas enregistrées dans Moodle.`);
      return;
    }
    api.SetValue('cmi.suspend_data', texte);
    api.Commit('');
  }


  // ---------- Le cadre et les messages des pages ----------

  const cadre = document.getElementById('contenu');
  cadre.src = PAGE_DE_DEPART;
  const origineSite = new URL(PAGE_DE_DEPART, location.href).origin;

  window.addEventListener('message', e => {
    // seulement les pages du cours, affichées dans le cadre
    if (e.source !== cadre.contentWindow || e.origin !== origineSite) return;
    const m = e.data || {};

    // une page vient de s'ouvrir : on lui donne les réponses gardées
    if (m.type === 'memoire:demande') {
      cadre.contentWindow.postMessage({ type: 'memoire:donnees', donnees }, origineSite);
    }

    // une page range une réponse
    if (m.type === 'memoire:ecrire' && typeof m.cle === 'string' && m.cle.startsWith('athentech_')) {
      donnees[m.cle] = m.valeur;
      sauver();
    }

    // l'activité est terminée (pour plus tard)
    if (m.type === 'memoire:statut' && ouvert && (m.statut === 'completed' || m.statut === 'incomplete')) {
      api.SetValue('cmi.completion_status', m.statut);
      api.Commit('');
    }
  });


  // ---------- Fermeture ----------
  // « suspend » : Moodle garde les réponses, l'étudiant reprendra là où il en était

  let termine = false;
  function terminer() {
    if (!ouvert || termine) return;
    termine = true;
    api.SetValue('cmi.exit', 'suspend');
    sauver();
    api.Terminate('');
  }

  window.addEventListener('pagehide', terminer);
  window.addEventListener('beforeunload', terminer);

})();
