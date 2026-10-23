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

        // haut de la zone à centrer :
        // dossier → on compte l'onglet qui dépasse au-dessus de la boîte
        // roue    → on part de la consigne, pour centrer la consigne + la roue
        const consigne = partie.querySelector('h3.consigne');
        let haut = rect.top;
        if (cible.classList.contains('dossier')) haut = rect.top - 70;
        if (cible.classList.contains('roue') && consigne) haut = consigne.getBoundingClientRect().top;
        const zone = { top: haut, height: rect.bottom - haut };

        // la roue apparaît : le mentor arrive une fois la page en place (voir activite/mentor.js)
        const arriveeMentor = partie.id === 'partie_roue' && typeof window.ouvrirMentor === 'function'
          ? () => window.ouvrirMentor()
          : null;

        if (typeof centrerSur === 'function') {
          centrerSur(zone, arriveeMentor);
        } else {
          partie.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (arriveeMentor) setTimeout(arriveeMentor, 700);
        }

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

  // après 2 documents ouverts, la mascotte rappelle de tous les ouvrir ;
  // quand tout est lu, elle laisse la place au bouton « passer à l'analyse 360° »
  const DOCUMENTS_AVANT_RAPPEL = 2;
  const rappel = document.getElementById('rappel_documents');

  function verifierLecture() {
    if (!suiteDocuments || !suiteDocuments.hidden) return;
    const lus = [...miniatures].filter(m => m.classList.contains('lue')).length;

    if (lus < miniatures.length) {
      if (rappel && lus >= DOCUMENTS_AVANT_RAPPEL) rappel.hidden = false;
      return;
    }

    suiteDocuments.hidden = false;
    if (rappel) rappel.hidden = true;
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
  const LONGUEUR_NOTE = 90;   // nombre de caractères affichés à côté du titre

  const nomDe = r => r.querySelector('.rubrique_bouton').textContent.trim();
  const estRemplie = r => r.classList.contains('remplie');

  // toutes les rubriques remplies : le bouton « continuer » apparaît
  function verifierRoue() {
    const pied = document.getElementById('pied_roue');
    if (!pied || !pied.hidden || ![...rubriques].every(estRemplie)) return;
    pied.hidden = false;
    const annonce = document.getElementById('annonce_roue');
    if (annonce) annonce.textContent = 'Toutes les rubriques sont remplies. Le bouton « continuer » est disponible en bas de l’écran.';
  }

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
      // version courte à côté du titre ; le texte complet reste dans la fenêtre de saisie
      note.textContent = texte.length > LONGUEUR_NOTE
        ? texte.slice(0, LONGUEUR_NOTE - 1).trimEnd() + '…'
        : texte;
      note.hidden = texte === '';
      verifierRoue();
    }

    bouton.addEventListener('click', () => {
      const ouverte = !rubrique.classList.contains('ouverte');
      rubrique.classList.remove('repliee', 'sans_focus');
      fermerTout(rubrique);
      rubrique.classList.toggle('ouverte', ouverte);
      bouton.setAttribute('aria-expanded', String(ouverte));
      if (ouverte && champ) champ.focus();
    });

    if (!champ) return;

    champ.addEventListener('input', recopier);

    // Entrée valide la réponse et referme la fenêtre ; Maj + Entrée passe à la ligne
    champ.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      rubrique.classList.remove('ouverte');
      rubrique.classList.add('repliee', 'sans_focus');   // pas de surbrillance sur le titre
      bouton.setAttribute('aria-expanded', 'false');
      bouton.focus();

      // la réponse part au mentor, sauf si elle est vide ou identique à la dernière envoyée
      const texte = champ.value.trim();
      if (texte && texte !== rubrique.dataset.envoye && typeof window.mentorRubrique === 'function') {
        rubrique.dataset.envoye = texte;
        const remplies = [...rubriques].filter(estRemplie);
        const restantes = [...rubriques].filter(r => !estRemplie(r)).map(nomDe);
        window.mentorRubrique(nomDe(rubrique), texte, remplies.length, restantes);
      }
    });

    // dès que le focus quitte le titre, il retrouve son contour normal au clavier
    bouton.addEventListener('blur', () => rubrique.classList.remove('sans_focus'));

    // la fenêtre peut se rouvrir dès que la souris quitte la rubrique
    rubrique.addEventListener('mouseleave', () => rubrique.classList.remove('repliee'));
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


  // ---------- Fin de la roue : « continuer », puis question suivante ----------
  // Le bouton fixe apparaît quand les 7 rubriques sont remplies.
  // Au clic, le mentor fait le bilan et pose la question des 2 enjeux (activite/mentor.js),
  // puis il appelle window.allerALaQuestion().

  const piedRoue = document.getElementById('pied_roue');
  const boutonContinuerRoue = document.getElementById('bouton_continuer_roue');
  const partieQ2 = document.getElementById('partie_q2');

  window.allerALaQuestion = function () {
    if (!partieQ2) return;
    fermerTout(null);
    partieQ2.hidden = false;
    if (piedRoue) piedRoue.hidden = true;
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
  };

  boutonContinuerRoue?.addEventListener('click', () => {
    fermerTout(null);
    if (typeof window.mentorBilan === 'function') window.mentorBilan();
    else window.allerALaQuestion();      // sans mentor : directement la question
  });


  // ---------- Le bouton « passer à la suite » mène à la mission suivante ----------
  // (<body data-page-suivante="…">). Sans cet attribut, il suit cours.js.

  const pageSuivante = document.body.dataset.pageSuivante;
  if (pageSuivante) {
    let boutonSuite = document.querySelector('.bouton_suite');
    // dernière partie du chapitre : script.js n'a pas créé le bouton, on l'ajoute (caché)
    if (!boutonSuite) {
      document.getElementById('contenu_gauche')?.insertAdjacentHTML('beforeend', `
        <div class="conteneur_suite cache">
          <a class="bouton_suite">passer à la suite</a>
        </div>`);
      boutonSuite = document.querySelector('.bouton_suite');
    }
    if (boutonSuite) boutonSuite.href = pageSuivante;
  }


  // ---------- Question : « Que fais-tu maintenant ? » (doc de la prof, p. 37) ----------
  // La réponse s'affiche dans la fenêtre d'Andréa (activite/mentor.js, textes dans le HTML).
  // Sans mentor, elle s'affiche sous la question.
  // Pour A et C, l'élève peut changer d'avis et valider à nouveau.

  const formulaire = document.getElementById('question_2');
  const retour = document.getElementById('retour_q2');
  if (!formulaire || !retour) return;

  formulaire.addEventListener('submit', e => {
    e.preventDefault();

    const choix = formulaire.querySelector('input[name="q2"]:checked');
    if (!choix) {
      retour.textContent = 'Choisis une réponse avant de valider.';
      retour.hidden = false;
      return;
    }

    const intitule = choix.closest('.qcm_option').querySelector('span').textContent.trim();
    const parAndrea = typeof window.mentorQuestion === 'function' && window.mentorQuestion(choix.value, intitule);

    if (parAndrea) {
      retour.hidden = true;
    } else {
      const texte = document.getElementById(`texte_retour_${choix.value}`);
      if (texte) retour.replaceChildren(texte.content.cloneNode(true));
      retour.hidden = false;
    }

    // bonne réponse : le bouton « passer à la suite » apparaît
    if (choix.value === 'B' && typeof afficherSuite === 'function') afficherSuite();
  });

})();