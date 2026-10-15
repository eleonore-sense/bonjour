// =====================================================================
// ACTIVITÉ D : CAS D'ÉTUDE D'UN SMARTPHONE
// Comportements propres à cette page.
// À charger après script.js, avec defer.
// =====================================================================

(function () {

  // ---------- Boutons qui font apparaître la suite de l'activité ----------
  // <button data-montrer="id_de_la_partie">
  // la partie apparaît, puis la page glisse pour la centrer à l'écran

  document.querySelectorAll('button[data-montrer]').forEach(bouton => {
    const partie = document.getElementById(bouton.dataset.montrer);
    if (!partie) return;

    bouton.addEventListener('click', () => {
      partie.hidden = false;
      bouton.setAttribute('aria-expanded', 'true');

      // bouton fixe en bas à droite : il disparaît une fois utilisé
      const pied = bouton.closest('.qcm_pied');
      if (pied) pied.hidden = true;

      // on attend que la partie soit affichée pour mesurer sa position
      requestAnimationFrame(() => {
        const cible = partie.querySelector('.dossier, .roue') || partie;
        const rect = cible.getBoundingClientRect();

        // l'onglet du dossier dépasse au-dessus de la boîte : on le compte aussi
        const onglet = cible.classList.contains('dossier') ? 70 : 0;
        const zone = { top: rect.top - onglet, height: rect.height + onglet };

        if (typeof centrerSur === 'function') centrerSur(zone);
        else partie.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // le focus passe au début de la nouvelle partie (lecteurs d'écran, clavier)
        const premier = partie.querySelector('.consigne, h3');
        if (premier) {
          premier.tabIndex = -1;
          premier.focus({ preventScroll: true });
        }
      });
    });
  });


  // ---------- Documents : miniature → pop-up ----------

  const miniatures = document.querySelectorAll('.miniature[data-document]');
  const suiteDocuments = document.getElementById('suite_documents');
  const annonceDocuments = document.getElementById('annonce_documents');

  // le bouton « reconstituer la roue » n'apparaît qu'une fois tous les documents ouverts
  function verifierLecture() {
    if (!suiteDocuments || !suiteDocuments.hidden) return;
    const toutLu = [...miniatures].every(m => m.classList.contains('lue'));
    if (!toutLu) return;
    suiteDocuments.hidden = false;
    if (annonceDocuments) annonceDocuments.textContent = 'Tous les documents ont été consultés. Vous pouvez passer à la roue de l’analyse.';
  }

  miniatures.forEach(miniature => {
    const fenetre = document.getElementById(miniature.dataset.document);
    if (!fenetre || typeof fenetre.showModal !== 'function') return;

    miniature.setAttribute('aria-haspopup', 'dialog');

    miniature.addEventListener('click', () => {
      fenetre.showModal();
      miniature.classList.add('lue');
    });

    // rond rouge
    fenetre.querySelector('.qcm_fermer')?.addEventListener('click', () => fenetre.close());

    // clic sur le fond assombri, à côté du document
    fenetre.addEventListener('click', e => {
      if (e.target !== fenetre) return;
      const r = fenetre.getBoundingClientRect();
      const dehors = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (dehors) fenetre.close();
    });

    // à la fermeture (rond rouge, clic à côté ou Échap), le focus revient sur la miniature
    // le bouton suivant apparaît à la fermeture du dernier document, pas pendant sa lecture
    fenetre.addEventListener('close', () => {
      miniature.focus();
      verifierLecture();
    });
  });


  // ---------- Question 1 : roue de l'analyse 360° ----------
  // la fenêtre s'ouvre au survol ou au clavier ; un clic sur la rubrique la garde ouverte

  const rubriques = document.querySelectorAll('.roue .rubrique');

  function fermerTout(sauf) {
    rubriques.forEach(r => {
      if (r === sauf) return;
      r.classList.remove('ouverte');
      r.querySelector('.rubrique_bouton').setAttribute('aria-expanded', 'false');
    });
  }

  rubriques.forEach(rubrique => {
    const bouton = rubrique.querySelector('.rubrique_bouton');
    const champ = rubrique.querySelector('textarea');
    const note = rubrique.querySelector('.note_eleve');

    // la phrase de l'élève reste affichée à côté de la rubrique
    function recopier() {
      const texte = champ.value.trim();
      rubrique.classList.toggle('remplie', texte !== '');
      if (!note) return;
      note.textContent = texte;
      note.hidden = texte === '';
    }

    bouton.addEventListener('click', () => {
      const ouverte = !rubrique.classList.contains('ouverte');
      fermerTout(rubrique);
      rubrique.classList.toggle('ouverte', ouverte);
      bouton.setAttribute('aria-expanded', String(ouverte));
      if (ouverte && champ) champ.focus();
    });

    if (!champ) return;

    champ.addEventListener('input', recopier);
  });

  // Échap ferme la fenêtre ouverte et rend le focus à son bouton
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const ouverte = document.querySelector('.roue .rubrique.ouverte, .roue .rubrique:focus-within');
    fermerTout(null);
    ouverte?.querySelector('.rubrique_bouton').focus();
  });

  // clic en dehors de la roue : on referme
  document.addEventListener('click', e => {
    if (!e.target.closest('.roue')) fermerTout(null);
  });


  // ---------- Éléments attendus, puis passage à l'étape 2 ----------
  // bouton fixe en bas à droite ; placé dans #partie_roue, il reste caché tant que la roue l'est

  const roue = document.querySelector('.roue');
  const piedRoue = document.getElementById('pied_roue');
  const boutonAttendus = document.getElementById('bouton_attendus');
  const partieQ2 = document.getElementById('partie_q2');

  if (roue && piedRoue && boutonAttendus && partieQ2) {

    function montrerAttendus() {
      fermerTout(null);
      roue.classList.add('corrigee');
      roue.querySelectorAll('.note_attendue').forEach(n => { n.hidden = false; });
      boutonAttendus.textContent = 'passer à la suite';
      boutonAttendus.dataset.etat = 'suite';
    }

    function passerEtape2() {
      partieQ2.hidden = false;
      piedRoue.hidden = true;
      requestAnimationFrame(() => {
        const zone = partieQ2.getBoundingClientRect();
        if (typeof centrerSur === 'function') centrerSur(zone);
        else partieQ2.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const legende = partieQ2.querySelector('legend');
        if (legende) {
          legende.tabIndex = -1;
          legende.focus({ preventScroll: true });
        }
      });
    }

    boutonAttendus.addEventListener('click', () => {
      if (boutonAttendus.dataset.etat === 'suite') passerEtape2();
      else montrerAttendus();
    });
  }


  // ---------- Question 2 : choix de l'étape suivante ----------
  // Textes provisoires : l'agent IA prendra le relais pour les réponses A et C.

  const formulaire = document.getElementById('question_2');
  const retour = document.getElementById('retour_q2');
  if (!formulaire || !retour) return;

  const RETOURS = {
    A: [
      'Vous choisissez de fixer tout de suite les objectifs, le périmètre et les critères d’évaluation.',
      'Sur quels documents vous appuyez-vous pour fixer ces objectifs ? À ce stade, vous ne connaissez pas encore les étapes du cycle de vie du smartphone ni ses principaux impacts : il vous manque des informations pour cadrer le projet de façon solide.'
    ],
    B: [
      'Bon choix : avant de fixer des objectifs, il faut analyser le produit en profondeur, son cycle de vie, ses fonctions, ses impacts environnementaux et son usage.',
      'C’est cette analyse qui vous permettra de formuler la problématique, puis de définir le périmètre, les objectifs et les critères d’évaluation.'
    ],
    C: [
      'Certaines idées peuvent déjà venir de vos lectures, par exemple sourcer le cobalt de manière responsable ou rendre le téléphone plus réparable.',
      'Mais sont-elles les plus pertinentes ? Vous n’avez pas encore analysé les principaux contributeurs aux impacts du smartphone, ni son usage et sa fin de vie. Sans objectifs ni cadrage, vous ne pourrez pas comparer vos idées entre elles.'
    ]
  };

  formulaire.addEventListener('submit', e => {
    e.preventDefault();

    const choix = formulaire.querySelector('input[name="q2"]:checked');
    if (!choix) {
      retour.hidden = false;
      retour.textContent = 'Choisissez une réponse avant de valider.';
      return;
    }

    retour.replaceChildren(...RETOURS[choix.value].map(texte => {
      const p = document.createElement('p');
      p.textContent = texte;
      return p;
    }));
    retour.hidden = false;

    // bonne réponse : le bouton « passer à la suite » apparaît
    if (choix.value === 'B' && typeof afficherSuite === 'function') afficherSuite();
  });

})();