// =====================================================================
// MENTOR IA : la fenêtre du mentor (mission 1)
//
// Deux présentations :
//   pop-up au centre   grand dessin à gauche, texte de l'étape à droite.
//                      On n'y voit pas l'historique de la conversation.
//   petite fenêtre     en bas à droite : l'historique de la conversation.
//
// Les étapes :
//   accueil   la roue apparaît : pop-up avec l'accueil, bouton « c'est parti »
//   roue      petite fenêtre (réduite jusqu'à la 1re rubrique) ;
//             chaque rubrique validée (Entrée) part au mentor, qui répond
//   bilan     clic sur « continuer » sous la roue : pop-up
//             → rubriques à approfondir : « je veux reprendre » (retour à la conversation)
//               ou « continuer malgré tout »
//             → sinon : « Bravo », bouton « continuer »
//   enjeux    le pop-up pose la question des 2 enjeux ; l'élève en discute avec le mentor,
//             puis « continuer » mène à la question « Que fais-tu maintenant ? »
//   question  pendant la question « Que fais-tu maintenant ? », la fenêtre disparaît ;
//             quand l'élève valide un choix, elle revient en bas à droite, vidée,
//             avec la réponse prévue pour ce choix (<template id="texte_retour_A|B|C">).
//             Pas d'IA ni de zone de texte à cette étape : l'élève lit, puis change d'avis ou passe à la suite.
//
// Signaux invisibles écrits par le mentor (retirés avant affichage) :
//   [EVAL: Clients = ok] ou [EVAL: Clients = a_approfondir]   jugement d'une rubrique
//   [HUMEUR: neutre|content|decu]                              pour les futurs visages
//   [ENJEUX_VALIDES]                                           les 2 enjeux sont bien justifiés
//
// Textes écrits par toi : dans le HTML (<template> de l'accueil, du bilan, des enjeux).
// Comportement de l'IA : prompt de l'agent, sur le Studio Mistral.
// À charger après activite_smartphone.js, avec defer.
// =====================================================================

(function () {

  const panneau = document.getElementById('mentor_ia');
  if (!panneau) return;

  // en local (lancer_test.bat) : le relais de ton ordinateur ; en ligne : Supabase
  const ADRESSE_RELAIS = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'api/mentor'
    : 'https://dhssndnqurrpidyxatwj.supabase.co/functions/v1/mentor';
  const LONGUEUR_MAX = 2000;
  const REPONSES_AVANT_CONTINUER = 2;         // la mascotte propose de passer après 2 réponses non validées
  const CLE_ENJEUX = 'athentech_enjeux';      // enjeux mis de côté pour les missions suivantes

  const fil         = panneau.querySelector('.mentor_fil');            // historique (petite fenêtre)
  const scene       = panneau.querySelector('.mentor_scene');          // pop-up
  const sceneTexte  = panneau.querySelector('.mentor_scene_texte');
  const sceneFil    = panneau.querySelector('.mentor_scene_fil');      // échange sur les enjeux
  const etat        = panneau.querySelector('.mentor_etat');
  const formulaire  = panneau.querySelector('.mentor_saisie');
  const champ       = formulaire.querySelector('textarea');
  const envoi       = formulaire.querySelector('button[type="submit"]');
  const boutons     = Object.fromEntries(
    [...panneau.querySelectorAll('[data-choix]')].map(b => [b.dataset.choix, b])
  );

  let etape = 'ferme';
  let conversationId = null;
  let enCours = false;
  const enAttente = [];            // messages à envoyer, dans l'ordre
  const evaluations = new Map();   // nom de rubrique → 'ok' | 'a_approfondir'
  const reponsesEnjeux = [];       // ce que l'élève a écrit sur les 2 enjeux
  let enjeuxValides = false;

  // boîte de la mascotte, en bas à droite : « tu peux passer à l'étape suivante »
  const rappelEnjeux = document.getElementById('rappel_enjeux');
  const passerEnjeux = document.getElementById('passer_enjeux');

  // une seule façon de changer d'étape : data-etape sert au CSS
  function passerA(nouvelle) {
    etape = nouvelle;
    panneau.dataset.etape = nouvelle;
  }


  // ---------- Outils ----------

  // « Stratégie de l’entreprise » et « strategie de l'entreprise » désignent la même rubrique
  const normaliser = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

  const rubriques = [...document.querySelectorAll('.roue .rubrique')];
  const nomDe = r => r.querySelector('.rubrique_bouton').textContent.trim();
  const rubriqueNommee = nom => rubriques.find(r => normaliser(nomDe(r)) === normaliser(nom));
  const rubriquesARevoir = () => rubriques.map(nomDe).filter(nom => evaluations.get(nom) === 'a_approfondir');

  // le bouton « continuer » sous la roue : caché tant que le pop-up du bilan ou des enjeux est ouvert
  const piedRoue = document.getElementById('pied_roue');
  const montrerPiedRoue = visible => { if (piedRoue) piedRoue.hidden = !visible; };

  // montre seulement les boutons du pop-up de l'étape en cours
  function montrerBoutons(...noms) {
    Object.entries(boutons).forEach(([nom, b]) => { b.hidden = !noms.includes(nom); });
  }


  // ---------- Position : pop-up au centre, ou petite fenêtre en bas à droite ----------

  // centre de la zone « consigne + roue » visible à l'écran (accueil), sinon de l'écran
  function centreVise() {
    const ecran = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    if (etape !== 'accueil') return ecran;
    const elements = [document.getElementById('consigne_q1'), document.querySelector('.roue')].filter(Boolean);
    if (!elements.length) return ecran;
    const rects = elements.map(el => el.getBoundingClientRect());
    const haut = Math.max(0, Math.min(...rects.map(r => r.top)));
    const bas = Math.min(window.innerHeight, Math.max(...rects.map(r => r.bottom)));
    return {
      x: (Math.min(...rects.map(r => r.left)) + Math.max(...rects.map(r => r.right))) / 2,
      y: (haut + bas) / 2,
    };
  }

  // La fenêtre est en bas à droite par défaut ; en pop-up, on la décale jusqu'au centre visé
  function placer() {
    panneau.classList.add('sans_transition');
    panneau.style.transform = '';
    if (panneau.classList.contains('popup')) {
      const r = panneau.getBoundingClientRect();
      const c = centreVise();
      const marge = 16;
      const x = Math.min(Math.max(c.x - r.width / 2, marge), window.innerWidth - r.width - marge);
      const y = Math.min(Math.max(c.y - r.height / 2, marge), window.innerHeight - r.height - marge);
      panneau.style.transform = `translate(${x - r.left}px, ${y - r.top}px)`;
    }
    void panneau.offsetHeight;
    panneau.classList.remove('sans_transition');
  }

  // Ouvre le pop-up avec le texte d'un <template> du HTML
  function enPopup(template) {
    sceneTexte.replaceChildren(template.content.cloneNode(true));
    sceneFil.replaceChildren();
    panneau.classList.add('popup');
    panneau.classList.remove('reduit');
    placer();
    scene.focus({ preventScroll: true });       // les lecteurs d'écran lisent le message
  }

  // Revient en petite fenêtre, avec l'historique de la conversation
  function dansLeCoin({ reduit = false } = {}) {
    // l'échange sur les enjeux rejoint l'historique
    while (sceneFil.firstChild) fil.appendChild(sceneFil.firstChild);
    sceneTexte.replaceChildren();
    panneau.classList.remove('popup');
    panneau.classList.toggle('reduit', reduit);
    panneau.style.transform = '';
    fil.scrollTop = fil.scrollHeight;
  }

  // le pop-up change de taille quand on ajoute un message : on le recentre
  new ResizeObserver(() => { if (panneau.classList.contains('popup')) placer(); }).observe(panneau);
  window.addEventListener('resize', () => { if (panneau.classList.contains('popup')) placer(); });


  // ---------- Messages ----------

  // Pendant les enjeux, les messages s'affichent dans le pop-up ; sinon dans l'historique.
  function ajouterMessage(qui, texte, etiquette) {
    const bulle = document.createElement('div');
    bulle.className = `mentor_message mentor_message_${qui}`;

    const auteur = document.createElement('span');
    auteur.className = 'visuellement_cache';
    auteur.textContent = qui === 'eleve' ? 'Toi : ' : qui === 'mentor' ? 'Mentor : ' : 'Information : ';
    bulle.appendChild(auteur);

    if (etiquette) {
      const e = document.createElement('span');
      e.className = 'mentor_etiquette';
      e.textContent = etiquette;
      bulle.appendChild(e);
    }

    if (texte instanceof HTMLTemplateElement) {
      bulle.appendChild(texte.content.cloneNode(true));
    } else {
      const p = document.createElement('p');
      p.className = 'mentor_texte';
      p.textContent = texte;
      bulle.appendChild(p);
    }

    const cible = etape === 'enjeux' ? sceneFil : fil;
    cible.appendChild(bulle);
    cible.scrollTop = cible.scrollHeight;
    if (cible === sceneFil) scene.scrollTop = scene.scrollHeight;
  }

  function attente(active) {
    enCours = active;
    envoi.disabled = active;
    fil.setAttribute('aria-busy', String(active));
    sceneFil.setAttribute('aria-busy', String(active));
    etat.textContent = active ? 'Le mentor écrit…' : '';
  }

  // Retire les signaux du mentor et les applique
  function lireSignaux(texte) {
    texte = texte.replace(/\[\s*EVAL\s*:\s*([^=\]]+?)\s*=\s*(ok|a_approfondir)\s*\]/gi, (_, nom, avis) => {
      const rubrique = rubriqueNommee(nom);
      if (rubrique) {
        evaluations.set(nomDe(rubrique), avis.toLowerCase());
        rubrique.dataset.avis = avis.toLowerCase();
      }
      return '';
    });

    texte = texte.replace(/\[\s*HUMEUR\s*:\s*([a-zéèê_]+)\s*\]/gi, (_, humeur) => {
      panneau.dataset.humeur = humeur.toLowerCase();     // pour les futurs visages du mentor
      return '';
    });

    texte = texte.replace(/\[\s*ENJEUX_VALIDES\s*\]/gi, () => {
      if (etape === 'enjeux') validerEnjeux();
      return '';
    });

    return texte.replace(/\[\s*MISSION_TERMINEE\s*\]/gi, '').replace(/\n{3,}/g, '\n\n').trim();
  }


  // ---------- Échange avec le relais ----------
  // Les messages partent un par un, dans l'ordre.

  function envoyer(message) {
    enAttente.push(message);
    traiter();
  }

  async function traiter() {
    if (enCours || !enAttente.length) return;
    const { texte, siErreur } = enAttente.shift();
    attente(true);

    try {
      const reponse = await fetch(ADRESSE_RELAIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: texte.slice(0, LONGUEUR_MAX), conversation_id: conversationId }),
      });
      const donnees = await reponse.json().catch(() => ({}));
      if (!reponse.ok || !donnees.reponse) throw new Error(donnees.erreur || 'Le mentor ne répond pas.');

      conversationId = donnees.conversation_id || conversationId;
      const propre = lireSignaux(donnees.reponse);
      if (propre) ajouterMessage('mentor', propre);

    } catch (erreur) {
      ajouterMessage('erreur', `${erreur.message} ${siErreur}`);

    } finally {
      attente(false);
      verifierEnjeux();
      traiter();
    }
  }


  // ---------- Étape « accueil » ----------

  window.ouvrirMentor = function () {
    if (etape !== 'ferme') return;
    passerA('accueil');
    panneau.hidden = false;
    document.body.classList.add('mentor_visible');
    montrerBoutons('commencer');
    enPopup(document.getElementById('texte_accueil'));
  };

  // l'accueil disparaît : la conversation commence vide
  function commencer() {
    if (etape !== 'accueil') return;
    passerA('roue');
    montrerBoutons();
    dansLeCoin({ reduit: true });
    document.querySelector('.roue .rubrique_bouton')?.focus({ preventScroll: true });
  }

  boutons.commencer.addEventListener('click', commencer);

  panneau.addEventListener('keydown', e => {
    if (e.key === 'Escape' && etape === 'accueil') commencer();
  });


  // ---------- Étape « roue » : une rubrique validée ----------
  // Appelée par activite_smartphone.js quand l'élève appuie sur Entrée.

  window.mentorRubrique = function (nom, texte, remplies, restantes) {
    if (etape === 'ferme' || etape === 'bilan' || etape === 'enjeux') return;
    if (etape === 'accueil') commencer();
    dansLeCoin();
    ajouterMessage('eleve', texte, `Roue · ${nom}`);

    let message = `Rubrique « ${nom} » (${remplies}/7 rubriques remplies) :\n${texte}`;
    message += restantes.length
      ? `\n\nRubriques encore à remplir : ${restantes.join(', ')}.`
      : '\n\nToutes les rubriques sont remplies.';

    envoyer({ texte: message, siErreur: `Valide à nouveau ta réponse « ${nom} » avec Entrée dans un instant.` });
  };


  // ---------- Étape « bilan » : clic sur « continuer » sous la roue ----------

  window.mentorBilan = function () {
    if (etape === 'ferme' || etape === 'accueil') return window.allerALaQuestion?.();
    if (etape !== 'roue') return;
    passerA('bilan');
    montrerPiedRoue(false);

    const aRevoir = rubriquesARevoir();
    if (aRevoir.length) {
      montrerBoutons('reprendre', 'continuer_malgre_tout');
      enPopup(document.getElementById('texte_bilan_a_revoir'));
      const liste = sceneTexte.querySelector('.liste_a_revoir');
      aRevoir.forEach(nom => {
        const li = document.createElement('li');
        li.textContent = nom;
        liste?.appendChild(li);
      });
    } else {
      montrerBoutons('vers_enjeux');
      enPopup(document.getElementById('texte_bilan_bravo'));
    }
  };

  // « je veux reprendre » : retour à la conversation, le mentor reprend la 1re rubrique à approfondir
  boutons.reprendre.addEventListener('click', () => {
    const aRevoir = rubriquesARevoir();
    passerA('roue');
    montrerBoutons();
    dansLeCoin();
    montrerPiedRoue(true);
    ajouterMessage('eleve', 'Je veux reprendre.');
    envoyer({
      texte: `[L'apprenant veut reprendre les rubriques à approfondir : ${aRevoir.join(', ')}.]`,
      siErreur: 'Clique à nouveau sur « continuer » sous la roue dans un instant.',
    });
    champ.focus({ preventScroll: true });
  });

  boutons.continuer_malgre_tout.addEventListener('click', lancerEnjeux);
  boutons.vers_enjeux.addEventListener('click', lancerEnjeux);


  // ---------- Étape « enjeux » : le pop-up se transforme et pose la question ----------

  function lancerEnjeux() {
    passerA('enjeux');
    montrerBoutons();
    enPopup(document.getElementById('texte_enjeux'));
    champ.focus({ preventScroll: true });
  }

  // Enjeux validés par le mentor : « continuer » remplace la zone de texte du pop-up
  function validerEnjeux() {
    enjeuxValides = true;
    panneau.classList.add('enjeux_valides');
    montrerBoutons('vers_question');
    if (rappelEnjeux) rappelEnjeux.hidden = true;
  }

  // Après 2 réponses non validées (une fois la réponse du mentor affichée) :
  // la mascotte propose de passer quand même
  function verifierEnjeux() {
    if (etape !== 'enjeux' || enjeuxValides || enAttente.length) return;
    if (reponsesEnjeux.length >= REPONSES_AVANT_CONTINUER && rappelEnjeux) rappelEnjeux.hidden = false;
  }

  // les deux « continuer » mènent au même endroit :
  // on met les enjeux de côté et on passe à la question suivante
  function allerALaQuestion() {
    try {
      localStorage.setItem(CLE_ENJEUX, JSON.stringify({
        reponses: reponsesEnjeux,
        valides: enjeuxValides,
        date: new Date().toISOString(),
      }));
    } catch { /* stockage indisponible : tant pis, l'activité continue */ }
    if (rappelEnjeux) rappelEnjeux.hidden = true;
    dansLeCoin();
    passerA('question');
    montrerBoutons();
    cacherFenetre();
    window.allerALaQuestion?.();
  }

  // pendant le QCM, la fenêtre d'Andréa s'efface
  function cacherFenetre() {
    panneau.hidden = true;
    document.body.classList.remove('mentor_visible');
  }

  boutons.vers_question.addEventListener('click', allerALaQuestion);
  passerEnjeux?.addEventListener('click', allerALaQuestion);


  // ---------- Message écrit dans la fenêtre ----------

  formulaire.addEventListener('submit', e => {
    e.preventDefault();
    const texte = champ.value.trim();
    if (!texte || enCours) return;
    champ.value = '';

    if (etape === 'enjeux') {
      reponsesEnjeux.push(texte);
      ajouterMessage('eleve', texte, 'Les 2 enjeux à creuser');
      envoyer({
        texte: `[Réponse à la question « quels sont les 2 enjeux les plus intéressants à creuser ? »]\n${texte}`,
        siErreur: 'Ton message n’est pas parti : réécris-le dans un instant.',
      });
    } else {
      ajouterMessage('eleve', texte);
      envoyer({ texte, siErreur: 'Ton message n’est pas parti : réécris-le dans un instant.' });
    }
    champ.focus();
  });

  // Entrée envoie ; Maj + Entrée passe à la ligne
  champ.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    formulaire.requestSubmit();
  });


  // ---------- Étape « question » : « Que fais-tu maintenant ? » ----------
  // Appelée par activite_smartphone.js quand l'élève valide un choix.
  // La fenêtre revient en bas à droite, sans les anciens messages,
  // avec la réponse prévue pour ce choix. L'IA n'est pas sollicitée.

  window.mentorQuestion = function (lettre, intitule) {
    if (etape === 'ferme') return false;
    const retour = document.getElementById(`texte_retour_${lettre}`);
    if (!retour) return false;

    passerA('question');
    montrerBoutons();
    dansLeCoin();
    fil.replaceChildren();                       // on repart d'une fenêtre vide
    panneau.hidden = false;
    document.body.classList.add('mentor_visible');

    ajouterMessage('eleve', intitule, 'Question · Que fais-tu maintenant ?');
    ajouterMessage('mentor', retour);
    return true;
  };

  montrerBoutons();

})();