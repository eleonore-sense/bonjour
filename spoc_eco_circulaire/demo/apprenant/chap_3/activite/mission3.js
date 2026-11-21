// =====================================================================
// MISSION 3 : imaginer des éco-solutions et faire les bons choix
//
//   1. Andréa en pop-up          andreaDit(template, bouton, ensuite)
//   2. Conversation avec l'IA    relais, signaux, petite fenêtre (agent 3)
//   3. Présentation              rappel de la problématique (mission 2)
//   4. Éco-solutions             1 à 3 ; « soumettre à Andréa » (bas à droite) → IA
//   5. Banque d'idées            pop-up → dossier de 5 fiches à ouvrir
//   6. Grille                    3 solutions (1 exemple + 2 au choix), curseurs −3 à +3
//   7. Graphique araignée        voir tout / une solution ; modifier / poursuivre
//   8. Choisir la piste          pop-up à capsules, ou discussion avec Andréa
//   9. Fiche synthétique         pré-remplie avec la piste choisie
//  10. Relecture de la fiche     Andréa (petite fenêtre) ; 2 échanges → « continuer »
//  11. Conclusion                pop-up « Bravo », boîte rose, mascotte → chap3_V
//
// Signaux de l'IA (retirés avant affichage) :
//   [EVAL: Éco-solution N = ok|a_approfondir]   avis (rond dans la pastille)
//   [ECO: N = éco-solution | pourquoi]          version finale → les cases se remplissent
//   [HUMEUR: neutre|content|decu]               visage d'Andréa
// =====================================================================

(function () {

  // =====================================================================
  // 1. ANDRÉA EN POP-UP
  // =====================================================================

  const panneau       = document.getElementById('mentor_ia');
  const scene         = panneau?.querySelector('.mentor_scene');
  const sceneTexte    = panneau?.querySelector('.mentor_scene_texte');
  const boutonSuivant = panneau?.querySelector('[data-choix="suivant"]');
  let apresAndrea = null;

  // décalage de la fenêtre (en bas à droite) jusqu'au centre
  function placerAuCentre() {
    panneau.classList.add('sans_transition');
    panneau.style.transform = '';
    const r = panneau.getBoundingClientRect();
    const marge = 16;
    const x = Math.min(Math.max(window.innerWidth / 2 - r.width / 2, marge), window.innerWidth - r.width - marge);
    const y = Math.min(Math.max(window.innerHeight / 2 - r.height / 2, marge), window.innerHeight - r.height - marge);
    panneau.style.transform = `translate(${x - r.left}px, ${y - r.top}px)`;
    void panneau.offsetHeight;
    panneau.classList.remove('sans_transition');
  }

  function andreaDit(idTemplate, texteBouton, ensuite, large) {
    const modele = document.getElementById(idTemplate);
    if (!panneau || !modele) { if (ensuite) ensuite(); return; }
    document.body.classList.remove('mentor_visible');
    sceneTexte.replaceChildren(modele.content.cloneNode(true));
    sceneFil?.replaceChildren();
    panneau.dataset.humeur = modele.dataset.humeur || 'neutre';
    panneau.dataset.etape = 'message';
    boutonSuivant.textContent = texteBouton;
    boutonSuivant.hidden = false;
    apresAndrea = ensuite || null;
    panneau.hidden = false;
    panneau.classList.add('popup');
    panneau.classList.remove('reduit');
    panneau.classList.toggle('popup_large', !!large);
    placerAuCentre();
    scene.focus({ preventScroll: true });
  }

  // pop-up à 2 boutons : andreaDit(…), puis deuxiemeBouton('texte', action)
  const boutonDeux = panneau?.querySelector('[data-choix="reprendre"]');
  let actionDeux = null;
  function deuxiemeBouton(texte, action) {
    if (!boutonDeux) return;
    boutonDeux.textContent = texte;
    boutonDeux.hidden = false;
    actionDeux = action;
  }
  boutonDeux?.addEventListener('click', () => {
    boutonDeux.hidden = true;
    const action = actionDeux;
    actionDeux = null;
    apresAndrea = null;
    panneau.hidden = true;
    panneau.classList.remove('popup_large');
    if (action) action();
  });

  function fermerAndrea() {
    if (!panneau || panneau.hidden) return;
    panneau.hidden = true;
    panneau.classList.remove('popup_large');
    if (boutonDeux) boutonDeux.hidden = true;
    const suite = apresAndrea;
    apresAndrea = null;
    if (suite) suite();
  }

  if (panneau) {
    boutonSuivant?.addEventListener('click', fermerAndrea);
    panneau.addEventListener('keydown', e => {
      if (e.key === 'Escape' && panneau.dataset.etape === 'message') fermerAndrea();
    });
    const recentrer = () => { if (!panneau.hidden && panneau.classList.contains('popup')) placerAuCentre(); };
    new ResizeObserver(recentrer).observe(panneau);
    window.addEventListener('resize', recentrer);
  }


  // =====================================================================
  // 2. CONVERSATION AVEC L'IA (agent de la mission 3)
  // =====================================================================

  const ADRESSE_RELAIS = ['localhost', '127.0.0.1'].includes(location.hostname)
    ? 'api/mentor'
    : 'https://dhssndnqurrpidyxatwj.supabase.co/functions/v1/mentor';
  const MISSION = 3;
  const LONGUEUR_MAX = 2000;
  const ESSAIS_RELAIS = 3;              // relais en erreur : 3 essais (5 s, puis 10 s)
  const ECART_MIN = 2500;               // au moins 2,5 s entre deux messages
  const CLE_ENJEUX = 'athentech_enjeux';
  const CLE_MISSION2 = 'athentech_mission2';
  const CLE_MISSION3 = 'athentech_mission3';

  // mémoire : memoire.js, sinon navigateur seul
  const memoire = window.Memoire || {
    lire(cle) { try { return JSON.parse(localStorage.getItem(cle)); } catch { return null; } },
    ecrire(cle, valeur) { try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* indisponible */ } },
  };

  function sauverMission3(partie) {
    memoire.ecrire(CLE_MISSION3, Object.assign({}, memoire.lire(CLE_MISSION3) || {}, partie, { date: new Date().toISOString() }));
  }

  const fil      = panneau?.querySelector('.mentor_fil');
  const sceneFil = panneau?.querySelector('.mentor_scene_fil');
  const etat     = panneau?.querySelector('.mentor_etat');
  const saisie   = panneau?.querySelector('.mentor_saisie');
  const champ    = saisie?.querySelector('textarea');
  const envoi    = saisie?.querySelector('button[type="submit"]');

  let conversationId = null;
  let fileEnvois = Promise.resolve();
  let enCours = 0;
  let dernierEnvoi = 0;

  const normaliser = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();

  function ajouterMessage(qui, texte, etiquette) {
    const cible = panneau.classList.contains('popup') ? sceneFil : fil;
    const bulle = document.createElement('div');
    bulle.className = `mentor_message mentor_message_${qui}`;
    const auteur = document.createElement('span');
    auteur.className = 'visuellement_cache';
    auteur.textContent = qui === 'eleve' ? 'Toi : ' : qui === 'mentor' ? 'Andréa : ' : 'Information : ';
    bulle.append(auteur);
    if (etiquette) {
      const e = document.createElement('span');
      e.className = 'mentor_etiquette';
      e.textContent = etiquette;
      bulle.append(e);
    }
    const p = document.createElement('p');
    p.className = 'mentor_texte';
    p.textContent = texte;
    bulle.append(p);
    cible.appendChild(bulle);
    cible.scrollTop = cible.scrollHeight;
  }

  function attente(active) {
    enCours += active ? 1 : -1;
    const occupe = enCours > 0;
    if (envoi) envoi.disabled = occupe;
    if (etat) etat.textContent = occupe ? 'Andréa écrit…' : '';
  }

  const changerHumeur = h => { if (h && panneau) panneau.dataset.humeur = h; };

  // signaux : lus et retirés du texte
  function lireSignaux(brut) {
    const evals = [];
    const ecos = [];
    const champsFiche = [];
    let valide = null;
    let humeur = null;
    let texte = brut;
    texte = texte.replace(/\[\s*VALIDE\s*:\s*([^\]]+?)\s*\]/gi, (_, quoi) => { valide = normaliser(quoi); return ''; });
    texte = texte.replace(/\[\s*FICHE\s*:\s*([a-z_]+)\s*=\s*([^\]]+)\]/gi, (_, cle, t) => { champsFiche.push({ cle: cle.toLowerCase(), texte: t.trim() }); return ''; });
    texte = texte.replace(/\[\s*EVAL\s*:\s*([^=\]]+?)\s*=\s*(ok|a_approfondir)\s*\]/gi, (_, nom, avis) => {
      evals.push({ nom: nom.trim(), avis: avis.toLowerCase() });
      return '';
    });
    texte = texte.replace(/\[\s*ECO\s*:\s*(\d+)\s*=\s*([^|\]]+)\|([^\]]+)\]/gi, (_, n, solution, pourquoi) => {
      ecos.push({ n: Number(n), solution: solution.trim(), pourquoi: pourquoi.trim() });
      return '';
    });
    texte = texte.replace(/\[\s*HUMEUR\s*:\s*([a-zéè_]+)\s*\]/gi, (_, h) => { humeur = h.toLowerCase(); return ''; });
    texte = texte.replace(/\[\s*(EVAL|ECO|HUMEUR|VALIDE|RESUME|TEXTE|DOC|FICHE)[^\]]*\]/gi, '');   // signal mal écrit
    texte = texte
      .replace(/\*\*(.+?)\*\*/gs, '$1').replace(/__(.+?)__/gs, '$1')   // Markdown
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/\*\*/g, '');
    return { texte: texte.replace(/\n{3,}/g, '\n\n').trim(), evals, ecos, champsFiche, valide, humeur };
  }

  // envoi au relais, un message à la fois
  function envoyer(message) {
    const tache = fileEnvois.then(async () => {
      attente(true);
      let derniereErreur = 'Andréa ne répond pas.';
      try {
        for (let essai = 0; essai < ESSAIS_RELAIS; essai++) {
          if (essai) await new Promise(ok => setTimeout(ok, 5000 * essai));
          const attendre = dernierEnvoi + ECART_MIN - Date.now();
          if (attendre > 0) await new Promise(ok => setTimeout(ok, attendre));
          dernierEnvoi = Date.now();
          try {
            const reponse = await fetch(ADRESSE_RELAIS, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: message.slice(0, LONGUEUR_MAX), conversation_id: conversationId, mission: MISSION }),
            });
            const donnees = await reponse.json().catch(() => ({}));
            if (reponse.ok && donnees.reponse) {
              conversationId = donnees.conversation_id || conversationId;
              return { ok: true, ...lireSignaux(donnees.reponse) };
            }
            derniereErreur = donnees.erreur || derniereErreur;
            if (reponse.status < 500) break;
          } catch (erreur) {
            derniereErreur = erreur.message;
          }
        }
        return { ok: false, erreur: derniereErreur };
      } finally {
        attente(false);
      }
    });
    fileEnvois = tache.catch(() => {});
    return tache;
  }

  // contexte : 1er message seulement (problématique, missions 1 et 2)
  function contexte() {
    const lignes = [];
    const m2 = memoire.lire(CLE_MISSION2) || {};
    if (m2.problematique?.intitule) lignes.push(`[Contexte : problématique choisie en mission 2 : « ${m2.problematique.intitule} »]`);
    else lignes.push('[Contexte : problématique de mission 2 inconnue.]');
    if (m2.composants?.resume) lignes.push(`[Contexte : composants qui ressortent de l'ACV (mission 2) : ${m2.composants.resume}]`);
    const m1 = memoire.lire(CLE_ENJEUX);
    if (m1 && Array.isArray(m1.reponses) && m1.reponses.length) lignes.push(`[Contexte : enjeux retenus en mission 1 : ${m1.reponses.join(' / ')}]`);
    return lignes.join('\n') + '\n';
  }
  const debutMessage = () => (conversationId ? '' : contexte());

  // version finale d'Andréa → case remplie, petit flash
  function remplirCase(zone, texte) {
    if (!zone || !texte) return;
    zone.value = texte;
    zone.classList.remove('mise_a_jour');
    void zone.offsetWidth;
    zone.classList.add('mise_a_jour');
  }

  // petite fenêtre en bas à droite
  function ouvrirFenetre(etape = 'eco') {
    if (!panneau) return false;
    if (!panneau.hidden && panneau.classList.contains('popup')) return false;   // pop-up en cours
    if (panneau.dataset.etape !== etape) { fil.replaceChildren(); panneau.hidden = true; }
    panneau.dataset.etape = etape;
    panneau.classList.remove('popup', 'valide', 'reduit');
    panneau.style.transform = '';
    boutonSuivant.hidden = true;
    if (panneau.hidden) {
      panneau.dataset.humeur = 'neutre';
      panneau.hidden = false;
    }
    document.body.classList.add('mentor_visible');
    return true;
  }

  function fermerFenetre() {
    if (!panneau || !['eco', 'piste', 'fiche'].includes(panneau.dataset.etape)) return;
    panneau.hidden = true;
    document.body.classList.remove('mentor_visible');
  }

  // saisie dans la fenêtre
  saisie?.addEventListener('submit', e => {
    e.preventDefault();
    const texte = champ.value.trim();
    if (!texte) return;
    if (panneau.dataset.etape === 'eco') { champ.value = ''; repondreEco(texte); }
    else if (panneau.dataset.etape === 'piste') { champ.value = ''; repondrePiste(texte); }
    else if (panneau.dataset.etape === 'fiche') { champ.value = ''; repondreFiche(texte); }
  });

  champ?.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
    e.preventDefault();
    saisie.requestSubmit();
  });


  // =====================================================================
  // 3. PRÉSENTATION : problématique choisie en mission 2
  // =====================================================================

  const problematique = () => memoire.lire(CLE_MISSION2)?.problematique || null;

  function montrerProblematique() {
    const choix = problematique()?.intitule;
    const ligne = document.getElementById('rappel_problematique');
    const place = document.getElementById('problematique_choisie');
    if (!choix || !ligne || !place) return;
    place.textContent = choix.charAt(0).toLowerCase() + choix.slice(1);
    ligne.hidden = false;
  }
  montrerProblematique();
  document.addEventListener('memoire:prete', montrerProblematique);


  // =====================================================================
  // 4. ÉCO-SOLUTIONS
  // Mise en page des propositions de la mission 2 (style/mission2.css).
  // Bouton fixe « soumettre à Andréa » (ou Entrée dans « pourquoi ») → la petite fenêtre prend sa place
  // (ensuite : Entrée, ou la discussion dans la fenêtre).
  // « continuer » : une éco-solution validée, ou 2 échanges.
  //   → Andréa met les éco-solutions au propre ([ECO: …]) pour la banque et la grille ;
  //   validée → « belle intuition » ; sinon → « ça me chagrine » : reprendre / continuer quand même.
  // =====================================================================

  const zone = document.getElementById('propositions');
  const modele = document.getElementById('modele_eco_solution');
  const boutonAjouter = document.getElementById('ajouter_proposition');
  const piedSoumettre = document.getElementById('pied_soumettre');
  const piedIdees = document.getElementById('pied_idees');
  const annonceIdees = document.getElementById('annonce_idees');
  const ECO_SOLUTIONS_MAX = 3;
  const ECHANGES_AVANT_CONTINUER = 2;  // essais (erreurs comprises) avant « continuer »
  let ideesFinies = false;
  let ficheActive = null;          // la dernière éco-solution modifiée
  let echanges = 0;                // réponses d'Andréa reçues
  let derniereRemarque = '';

  const fiches = () => [...(zone?.querySelectorAll('.proposition') || [])];
  const champsDe = f => ({
    echelle: f.querySelector('.proposition_etape'),
    solution: f.querySelector('.proposition_probleme'),
    pourquoi: f.querySelector('.proposition_solution'),
  });
  const estComplete = f => Object.values(champsDe(f)).every(c => c.value.trim() !== '');
  const cleDe = f => { const c = champsDe(f); return `${c.echelle.value}|${c.solution.value.trim()}|${c.pourquoi.value.trim()}`; };
  const numeroDe = nom => parseInt(String(nom).replace(/\D+/g, ''), 10);
  const aEnvoyer = f => f && estComplete(f) && f.dataset.envoye !== cleDe(f);

  // boutons fixes : « soumettre à Andréa », « continuer »
  function majPieds() {
    if (ideesFinies) { piedSoumettre.hidden = true; piedIdees.hidden = true; return; }
    if (!aEnvoyer(ficheActive)) ficheActive = fiches().find(aEnvoyer) || ficheActive;
    piedSoumettre.hidden = !aEnvoyer(ficheActive) || document.body.classList.contains('mentor_visible');   // fenêtre ouverte : elle prend sa place
    const valide = fiches().some(f => f.dataset.avis === 'ok');
    const pret = fiches().some(estComplete) && (valide || echanges >= ECHANGES_AVANT_CONTINUER);
    if (pret && piedIdees.hidden && annonceIdees) annonceIdees.textContent = 'Le bouton « continuer » est disponible en bas de l’écran.';
    piedIdees.hidden = !pret;
  }

  function ajouterEcoSolution() {
    if (!zone || !modele || fiches().length >= ECO_SOLUTIONS_MAX) return null;
    const f = modele.content.firstElementChild.cloneNode(true);
    const n = fiches().length + 1;
    f.querySelector('.proposition_numero').textContent = n;
    const c = champsDe(f);
    [['echelle', '.proposition_label_etape'], ['solution', '.proposition_label_probleme'], ['pourquoi', '.proposition_label_solution']]
      .forEach(([cle, label]) => {
        c[cle].id = `eco_solution_${n}_${cle}`;
        f.querySelector(label).htmlFor = c[cle].id;
      });

    Object.values(c).forEach(champ => {
      champ.addEventListener('input', () => { ficheActive = f; delete f.dataset.envoye; majPieds(); });
      champ.addEventListener('change', sauverIdees);
    });

    // Entrée : éco-solution → pourquoi ; pourquoi → Andréa
    c.solution.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      c.pourquoi.focus();
    });
    c.pourquoi.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      envoyerEco(f);
    });

    zone.appendChild(f);
    if (boutonAjouter) boutonAjouter.hidden = fiches().length >= ECO_SOLUTIONS_MAX;
    return f;
  }

  function lireIdees() {
    return fiches().map(f => {
      const c = champsDe(f);
      return { echelle: c.echelle.value, solution: c.solution.value.trim(), pourquoi: c.pourquoi.value.trim(), avis: f.dataset.avis || null };
    });
  }
  const sauverIdees = () => sauverMission3({ idees: lireIdees().filter(x => x.echelle || x.solution || x.pourquoi) });

  // versions finales d'Andréa → les cases
  function appliquerEcos(ecos) {
    ecos.forEach(({ n, solution, pourquoi }) => {
      const f = fiches()[n - 1];
      if (!f) return;
      const c = champsDe(f);
      remplirCase(c.solution, solution);
      remplirCase(c.pourquoi, pourquoi);
      f.dataset.envoye = cleDe(f);
    });
  }

  // avis et versions finales d'Andréa
  function appliquerReponse(r) {
    r.evals.forEach(({ nom, avis }) => {
      const f = fiches()[numeroDe(nom) - 1];
      if (f) f.dataset.avis = avis;
    });
    appliquerEcos(r.ecos);
    if (r.texte) derniereRemarque = r.texte;
    echanges++;
    sauverIdees();
    majPieds();
  }

  async function envoyerEco(f) {
    if (!f) return;
    const c = champsDe(f);
    const manquant = Object.values(c).find(x => x.value.trim() === '');
    if (manquant) {
      if (annonceIdees) annonceIdees.textContent = 'Complète d’abord l’échelle d’action, l’éco-solution et pourquoi tu l’as choisie.';
      manquant.focus();
      return;
    }
    if (!aEnvoyer(f)) return;
    f.dataset.envoye = cleDe(f);
    sauverIdees();

    // la fenêtre s'ouvre tout de suite (« Andréa écrit… »)
    const n = fiches().indexOf(f) + 1;
    const solution = c.solution.value.trim();
    const pourquoi = c.pourquoi.value.trim();
    ouvrirFenetre();
    majPieds();
    ajouterMessage('eleve', `${solution}\n→ ${pourquoi}`, `Éco-solution ${n}`);

    const message = `${debutMessage()}[Étape : éco-solutions]\n[Éco-solution ${n} : échelle d'action « ${c.echelle.value} »]\nÉco-solution : ${solution}\nPourquoi : ${pourquoi}`;
    f.classList.add('en_lecture');
    const r = await envoyer(message);
    f.classList.remove('en_lecture');
    if (!r.ok) {
      delete f.dataset.envoye;
      ajouterMessage('erreur', `${r.erreur} Soumets à nouveau ton éco-solution ${n} dans un instant.`);
      echanges++;                          // erreur comprise : jamais bloqué
      majPieds();
      return;
    }
    appliquerReponse(r);
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte);
  }

  // réponse écrite dans la petite fenêtre
  async function repondreEco(texte) {
    ajouterMessage('eleve', texte);
    const r = await envoyer(`${debutMessage()}[Étape : éco-solutions]\n${texte}`);
    if (!r.ok) {
      ajouterMessage('erreur', `${r.erreur} Ton message n’est pas parti : réécris-le dans un instant.`);
      echanges++;
      majPieds();
      return;
    }
    appliquerReponse(r);
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte);
    champ.focus({ preventScroll: true });
  }

  ajouterEcoSolution();

  boutonAjouter?.addEventListener('click', () => {
    const f = ajouterEcoSolution();
    if (f) { ficheActive = f; champsDe(f).echelle.focus(); }
  });

  piedSoumettre?.querySelector('button')?.addEventListener('click', () => envoyerEco(ficheActive));

  // « continuer »
  function versBanque(texte) {
    sauverIdees();
    ideesFinies = true;
    majPieds();
    fermerFenetre();
    andreaDit(texte, 'voir la banque d’idées', montrerBanque);
  }

  // mise au propre : Andréa réécrit les éco-solutions avec ce qui s'est dit (signaux ECO seulement)
  async function mettreAuPropre() {
    const completes = fiches().map((f, i) => ({ f, n: i + 1 })).filter(({ f }) => estComplete(f));
    if (!completes.length) return;
    const liste = completes.map(({ f, n }) => {
      const c = champsDe(f);
      return `Éco-solution ${n} (échelle d'action « ${c.echelle.value} ») : ${c.solution.value.trim()} | Pourquoi : ${c.pourquoi.value.trim()}`;
    }).join('\n');
    if (etat) etat.textContent = 'Andréa met tes éco-solutions au propre…';
    const r = await envoyer(`${debutMessage()}[Étape : mise au propre]\n${liste}`);
    if (r.ok) appliquerEcos(r.ecos);       // erreur : on garde les textes tels quels
    sauverIdees();
  }

  piedIdees?.querySelector('button')?.addEventListener('click', async () => {
    const bouton = piedIdees.querySelector('button');
    if (bouton.disabled) return;
    bouton.disabled = true;
    if (echanges) await mettreAuPropre();
    bouton.disabled = false;
    if (fiches().some(f => f.dataset.avis === 'ok')) { versBanque('texte_belle_intuition'); return; }
    // pas encore convaincue : sa dernière remarque, reprendre / continuer quand même
    fermerFenetre();
    piedIdees.hidden = true;
    piedSoumettre.hidden = true;
    andreaDit('texte_chagrin', 'continuer quand même', () => versBanque('texte_banque_quand_meme'));
    const place = sceneTexte.querySelector('.derniere_remarque');
    if (place) {
      if (derniereRemarque) place.textContent = derniereRemarque;
      else place.remove();
    }
    // « je veux reprendre » : retour à la petite fenêtre
    deuxiemeBouton('je veux reprendre', () => {
      ouvrirFenetre();
      majPieds();
      (ficheActive ? champsDe(ficheActive).pourquoi : champ)?.focus();
    });
  });


  // =====================================================================
  // 5. BANQUE D'IDÉES
  // 5 fiches : celles de l'élève + l'exemple de l'équipe (data-exemple)
  // + d'autres idées tirées au hasard (templates banque_…).
  // Dossier comme en mission 1 ; toutes ouvertes → « comparer les solutions » (bas à droite).
  // =====================================================================

  const TOTAL_FICHES = 5;
  const FICHES_AVANT_RAPPEL = 2;
  const partieBanque = document.getElementById('partie_banque');
  const listeBanque = document.getElementById('banque_idees');
  const fenetreIdee = document.getElementById('fenetre_idee');
  const rappelBanque = document.getElementById('rappel_banque');
  const suiteBanque = document.getElementById('suite_banque');
  const annonceBanque = document.getElementById('annonce_banque');

  function listeEquipe() {
    const choix = problematique()?.choix || 'production';
    const modeleListe = document.getElementById(`banque_${choix}`) || document.getElementById('banque_production');
    return [...(modeleListe?.content.querySelectorAll('li') || [])].map(li => ({
      theme: li.dataset.theme,
      titre: li.dataset.titre,
      pourquoi: li.textContent.replace(/\s+/g, ' ').trim(),
      auteur: 'equipe',
      exemple: li.dataset.exemple ? li.dataset.exemple.split(',').map(Number) : null,
    }));
  }

  const auHasard = (liste, nombre) => {
    const copie = [...liste];
    for (let i = copie.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copie[i], copie[j]] = [copie[j], copie[i]];
    }
    return copie.slice(0, nombre);
  };

  // les 5 fiches : nouveau tirage à chaque fois (parmi les 15 de la prof)
  function constituerBanque() {
    const eleve = lireIdees().filter(x => x.solution && x.pourquoi).map(x => ({
      theme: x.echelle, titre: x.solution, pourquoi: x.pourquoi, auteur: 'eleve',
    }));
    const nombre = Math.max(TOTAL_FICHES - eleve.length, 1);
    const liste = listeEquipe();
    const exemple = liste.find(x => x.exemple);
    const autres = liste.filter(x => x !== exemple);
    let equipe = exemple ? [exemple, ...auHasard(autres, nombre - 1)] : auHasard(liste, nombre);
    equipe = auHasard(equipe, equipe.length);         // l'exemple n'est pas toujours en premier
    sauverMission3({ banque_equipe: equipe });
    return [...eleve, ...equipe];
  }

  let banque = [];

  function ouvrirFiche(idee, miniature) {
    if (!fenetreIdee) return;
    fenetreIdee.querySelector('.idee_theme').textContent = idee.theme;
    fenetreIdee.querySelector('.idee_titre_fiche').textContent = idee.titre;
    fenetreIdee.querySelector('.idee_pourquoi').textContent = idee.pourquoi;
    fenetreIdee.querySelector('.idee_auteur').textContent = idee.auteur === 'eleve' ? 'proposée par toi' : 'proposée par ton équipe';
    fenetreIdee.dataset.ouverteDepuis = [...listeBanque.querySelectorAll('.miniature')].indexOf(miniature);
    fenetreIdee.showModal();
    miniature.classList.add('lue');
  }

  function verifierLecture() {
    if (!suiteBanque || !suiteBanque.isConnected || !suiteBanque.hidden) return;
    const miniatures = [...listeBanque.querySelectorAll('.miniature')];
    const lues = miniatures.filter(m => m.classList.contains('lue')).length;
    if (lues < miniatures.length) {
      if (rappelBanque && lues >= FICHES_AVANT_RAPPEL) rappelBanque.hidden = false;
      return;
    }
    suiteBanque.hidden = false;
    if (rappelBanque) rappelBanque.hidden = true;
    if (annonceBanque) annonceBanque.textContent = 'Toutes les fiches ont été lues. Le bouton « comparer les solutions » est disponible en bas de l’écran.';
  }

  function montrerBanque() {
    if (!partieBanque || !listeBanque) return;
    banque = constituerBanque();
    sauverMission3({ banque });
    listeBanque.replaceChildren(...banque.map(idee => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `miniature miniature_idee ${idee.auteur === 'eleve' ? 'idee_eleve' : 'idee_equipe'}`;
      b.setAttribute('aria-haspopup', 'dialog');
      b.innerHTML = '<span class="miniature_theme"></span><span class="miniature_titre"></span><span class="miniature_auteur"></span>';
      b.querySelector('.miniature_theme').textContent = idee.theme;
      b.querySelector('.miniature_titre').textContent = idee.titre;
      b.querySelector('.miniature_auteur').textContent = idee.auteur === 'eleve' ? 'ton idée' : 'ton équipe';
      b.addEventListener('click', () => ouvrirFiche(idee, b));
      li.append(b);
      return li;
    }));
    partieBanque.hidden = false;
    // centré sur le dossier
    requestAnimationFrame(() => {
      const dossier = partieBanque.querySelector('.dossier');
      if (typeof centrerSur === 'function') centrerSur(dossier.getBoundingClientRect());
      else dossier.scrollIntoView({ behavior: 'smooth', block: 'center' });
      listeBanque.querySelector('.miniature')?.focus({ preventScroll: true });
    });
  }

  if (fenetreIdee) {
    fenetreIdee.querySelector('.qcm_fermer')?.addEventListener('click', () => fenetreIdee.close());
    fenetreIdee.addEventListener('click', e => {
      if (e.target !== fenetreIdee) return;
      const r = fenetreIdee.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) fenetreIdee.close();
    });
    fenetreIdee.addEventListener('close', () => {
      listeBanque.querySelectorAll('.miniature')[Number(fenetreIdee.dataset.ouverteDepuis)]?.focus({ preventScroll: true });
      verifierLecture();
    });
  }

  // « comparer les solutions » : la grille (data-montrer : activite_smartphone.js)
  suiteBanque?.querySelector('button')?.addEventListener('click', () => {
    if (rappelBanque) rappelBanque.hidden = true;
    suiteBanque.hidden = true;
    suiteBanque.remove();     // ne revient plus
    construireGrille();
  });


  // =====================================================================
  // 6. GRILLE : 3 SOLUTIONS NOTÉES DE −3 À +3
  // 1 = l'exemple de l'équipe, déjà noté ; 2 et 3 = au choix parmi les 4 autres.
  // Chaque curseur touché au moins une fois → « soumettre mon évaluation ».
  // =====================================================================

  const CRITERES = ['environnement', 'faisabilite', 'cout', 'utilisateur'];
  const grille = document.getElementById('grille');
  const modeleEvaluation = document.getElementById('modele_evaluation');
  const piedEvaluation = document.getElementById('pied_evaluation');
  const annonceComparer = document.getElementById('annonce_comparer');
  let cartes = [];

  const indexExemple = () => banque.findIndex(x => x.exemple);

  function carteEvaluation(numero, exemple) {
    const carte = modeleEvaluation.content.firstElementChild.cloneNode(true);
    carte.querySelector('.evaluation_numero').textContent = numero;
    const choix = carte.querySelector('.evaluation_solution');
    choix.id = `evaluation_${numero}`;
    carte.querySelector('.evaluation_label_choix').htmlFor = choix.id;

    carte.querySelectorAll('.critere').forEach(ligne => {
      const curseur = ligne.querySelector('input');
      const valeur = ligne.querySelector('output');
      curseur.id = `evaluation_${numero}_${ligne.dataset.critere}`;
      ligne.querySelector('label').htmlFor = curseur.id;
      const montrer = () => {
        valeur.textContent = Number(curseur.value) > 0 ? `+${curseur.value}` : curseur.value.replace('-', '−');
        curseur.style.setProperty('--note', curseur.value);
      };
      const toucher = () => { ligne.dataset.touche = '1'; montrer(); verifierGrille(); };
      curseur.addEventListener('input', toucher);
      curseur.addEventListener('pointerdown', toucher);
      curseur.addEventListener('keydown', toucher);
      montrer();
    });

    if (exemple) {
      // exemple de l'équipe : choix et notes fixés
      const i = indexExemple();
      choix.innerHTML = '';
      choix.add(new Option(banque[i].titre, String(i), true, true));
      choix.disabled = true;
      carte.classList.add('evaluation_exemple');
      carte.querySelector('.evaluation_titre').insertAdjacentHTML('beforeend', ' <span class="evaluation_badge">exemple de ton équipe</span>');
      carte.querySelectorAll('.critere').forEach((ligne, k) => {
        const curseur = ligne.querySelector('input');
        curseur.value = banque[i].exemple[k] ?? 0;
        curseur.disabled = true;
        curseur.dispatchEvent(new Event('input'));
        ligne.dataset.touche = '1';
      });
    } else {
      banque.forEach((idee, i) => {
        if (i === indexExemple()) return;
        choix.add(new Option(`${idee.titre}${idee.auteur === 'eleve' ? ' (ton idée)' : ''}`, String(i)));
      });
      choix.addEventListener('change', () => { majChoix(); verifierGrille(); });
    }
    return carte;
  }

  // une solution ne peut pas être choisie deux fois
  function majChoix() {
    const pris = cartes.map(c => c.querySelector('select').value).filter(Boolean);
    cartes.forEach(c => {
      const sel = c.querySelector('select');
      if (sel.disabled) return;
      [...sel.options].forEach(o => { if (o.value) o.disabled = o.value !== sel.value && pris.includes(o.value); });
    });
  }

  const carteFinie = c => c.querySelector('select').value !== '' && [...c.querySelectorAll('.critere')].every(l => l.dataset.touche);

  function verifierGrille() {
    if (!piedEvaluation) return;
    const fini = cartes.length && cartes.every(carteFinie);
    if (fini && piedEvaluation.hidden && annonceComparer) annonceComparer.textContent = 'Tes trois solutions sont notées. Le bouton « soumettre mon évaluation » est disponible en bas de l’écran.';
    piedEvaluation.hidden = !fini || !partieRadar.hidden;
  }

  function construireGrille() {
    if (!grille || !modeleEvaluation || cartes.length) return;
    if (!banque.length) banque = memoire.lire(CLE_MISSION3)?.banque || constituerBanque();
    cartes = [carteEvaluation(1, indexExemple() >= 0), carteEvaluation(2, false), carteEvaluation(3, false)];
    grille.replaceChildren(...cartes);
  }

  function lireEvaluation() {
    return cartes.map(c => {
      const i = Number(c.querySelector('select').value);
      const notes = [...c.querySelectorAll('.critere input')].map(x => Number(x.value));
      return { titre: banque[i]?.titre || '', auteur: banque[i]?.auteur || '', exemple: c.classList.contains('evaluation_exemple'), notes };
    });
  }


  // =====================================================================
  // 7. GRAPHIQUE ARAIGNÉE
  // Rayon = (note + 3) × 25 ; axes : environnement (haut), faisabilité (droite),
  // utilisateur (bas), coût (gauche). « voir tout », puis une solution à la fois.
  // =====================================================================

  const partieRadar = document.getElementById('partie_radar');
  const series = document.getElementById('radar_series');
  const choixRadar = document.getElementById('radar_choix');
  const tableauRadar = document.getElementById('radar_tableau')?.querySelector('tbody');
  const piedRadar = document.getElementById('pied_radar');
  const SVG = 'http://www.w3.org/2000/svg';

  // [environnement, faisabilité, coût, utilisateur] → points haut, droite, bas, gauche
  function points(notes) {
    const r = n => (n + 3) * 25;
    const [env, fais, cout, util] = notes;
    return [[200, 200 - r(env)], [200 + r(fais), 200], [200, 200 + r(util)], [200 - r(cout), 200]];
  }

  const signe = n => (n > 0 ? `+${n}` : String(n).replace('-', '−'));

  function dessinerRadar() {
    const evaluation = lireEvaluation();
    sauverMission3({ evaluation });

    series.replaceChildren(...evaluation.map((sol, k) => {
      const g = document.createElementNS(SVG, 'g');
      g.setAttribute('class', 'radar_serie');
      g.dataset.solution = String(k + 1);
      const pts = points(sol.notes);
      const poly = document.createElementNS(SVG, 'polygon');
      poly.setAttribute('points', pts.map(p => p.join(',')).join(' '));
      g.append(poly);
      pts.forEach(([x, y]) => {
        const c = document.createElementNS(SVG, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 4);
        g.append(c);
      });
      return g;
    }));

    // boutons : voir tout, puis chaque solution
    choixRadar.replaceChildren();
    const bouton = (valeur, texte, coche) => {
      const label = document.createElement('label');
      if (valeur !== 'tout') label.dataset.solution = valeur;
      label.innerHTML = `<input type="radio" name="solution_radar" value="${valeur}"${coche ? ' checked' : ''}><span></span>`;
      label.querySelector('span').textContent = texte;
      choixRadar.append(label);
    };
    bouton('tout', 'voir tout', true);
    evaluation.forEach((sol, k) => bouton(String(k + 1), sol.titre, false));
    afficherSerie('tout');

    tableauRadar.replaceChildren(...evaluation.map(sol => {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = sol.titre;
      tr.append(th);
      // ordre du tableau : environnement, faisabilité, coût, utilisateur
      sol.notes.forEach(n => { const td = document.createElement('td'); td.textContent = signe(n); tr.append(td); });
      return tr;
    }));
  }

  // une solution à la fois : les autres passent en transparence
  function afficherSerie(valeur) {
    series.querySelectorAll('.radar_serie').forEach(g => {
      g.classList.toggle('radar_estompee', valeur !== 'tout' && g.dataset.solution !== valeur);
    });
  }
  choixRadar?.addEventListener('change', e => afficherSerie(e.target.value));

  piedEvaluation?.querySelector('button')?.addEventListener('click', () => {
    dessinerRadar();
    piedEvaluation.hidden = true;
    partieRadar.hidden = false;
    piedRadar.hidden = false;
    requestAnimationFrame(() => {
      const bloc = document.getElementById('bloc_radar');
      if (typeof centrerSur === 'function') centrerSur(bloc.getBoundingClientRect());
      else bloc.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  // « modifier mon évaluation » : retour à la grille
  document.getElementById('bouton_modifier')?.addEventListener('click', () => {
    partieRadar.hidden = true;
    piedRadar.hidden = true;
    verifierGrille();
    const titre = document.getElementById('titre_grille');
    if (typeof calerEnHaut === 'function') calerEnHaut(titre);
    else titre.scrollIntoView({ behavior: 'smooth' });
  });

  // « poursuivre » : « c'est bon pour moi » → choisir la piste ; « je ne suis pas sûr·e » → discussion
  document.getElementById('bouton_poursuivre')?.addEventListener('click', () => {
    piedRadar.hidden = true;
    andreaDit('texte_apres_comparaison', 'c’est bon pour moi', choisirPiste);
    deuxiemeBouton('je ne suis pas sûr·e…', discuterPiste);
  });


  // =====================================================================
  // 8. CHOISIR LA PISTE LA PLUS PERTINENTE
  // Pop-up : 3 capsules (les solutions évaluées) → « valider mon choix » → fiche pré-remplie.
  // Pas sûr·e : discussion avec Andréa (petite fenêtre) ; « choisir ma piste » (bas à droite) à tout moment.
  // =====================================================================

  const piedPiste = document.getElementById('pied_piste');
  let choixPisteOuvert = false;

  function choisirPiste() {
    fermerFenetre();
    if (piedPiste) piedPiste.hidden = true;
    andreaDit('texte_choix_piste', 'valider mon choix', null, true);
    choixPisteOuvert = true;
    const place = sceneTexte.querySelector('.capsules_piste');
    lireEvaluation().forEach((sol, k) => {
      const label = document.createElement('label');
      label.dataset.solution = String(k + 1);
      label.innerHTML = `<input type="radio" name="piste" value="${k}"><span></span>`;
      label.querySelector('span').textContent = sol.titre;
      place?.append(label);
    });
    // un choix : le message d'erreur s'efface
    place?.addEventListener('change', () => { const e = sceneTexte.querySelector('.choix_erreur'); if (e) e.hidden = true; });
  }

  // « valider mon choix » : avant le clic normal (fermerAndrea)
  boutonSuivant?.addEventListener('click', e => {
    if (!choixPisteOuvert) return;
    e.stopImmediatePropagation();
    const coche = sceneTexte.querySelector('input[name="piste"]:checked');
    if (!coche) {
      const erreur = sceneTexte.querySelector('.choix_erreur');
      if (erreur) erreur.hidden = false;
      sceneTexte.querySelector('input[name="piste"]')?.focus();
      return;
    }
    choixPisteOuvert = false;
    fermerAndrea();
    montrerFiche(lireEvaluation()[Number(coche.value)]);
  }, { capture: true });

  panneau?.addEventListener('keydown', e => {
    if (e.key === 'Escape' && choixPisteOuvert) e.stopImmediatePropagation();
  }, { capture: true });

  // discussion : Andréa aide à choisir, sans choisir à sa place
  async function discuterPiste() {
    ouvrirFenetre('piste');
    if (piedPiste) piedPiste.hidden = false;
    const evaluation = lireEvaluation();
    const lignes = evaluation.map((sol, k) =>
      `${k + 1}. ${sol.titre}${sol.exemple ? ' (exemple de l’équipe)' : sol.auteur === 'eleve' ? ' (son idée)' : ''} : environnement ${signe(sol.notes[0])}, faisabilité ${signe(sol.notes[1])}, coût ${signe(sol.notes[2])}, utilisateur ${signe(sol.notes[3])}`);
    ajouterMessage('eleve', 'Je ne suis pas sûr·e de la piste la plus pertinente.');
    const r = await envoyer(`${debutMessage()}[Étape : choisir la piste]\n[Les 3 solutions évaluées, notes de −3 à +3 par rapport au Basic-phone® actuel]\n${lignes.join('\n')}\nL'apprenant n'est pas sûr de la piste la plus pertinente à développer.`);
    if (!r.ok) { ajouterMessage('erreur', `${r.erreur} Réessaie dans un instant, ou choisis ta piste.`); return; }
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte);
    champ.focus({ preventScroll: true });
  }

  async function repondrePiste(texte) {
    ajouterMessage('eleve', texte);
    const r = await envoyer(`${debutMessage()}[Étape : choisir la piste]\n${texte}`);
    if (!r.ok) { ajouterMessage('erreur', `${r.erreur} Ton message n’est pas parti : réécris-le dans un instant.`); return; }
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte);
    champ.focus({ preventScroll: true });
  }

  piedPiste?.querySelector('button')?.addEventListener('click', choisirPiste);


  // =====================================================================
  // 9. FICHE SYNTHÉTIQUE : pré-remplie avec la piste choisie
  // =====================================================================

  const NOMS_NOTES = ['environnement', 'faisabilité technique', 'coût', 'intérêt pour l’utilisateur'];

  function montrerFiche(sol) {
    const fiche = document.getElementById('partie_fiche');
    if (!fiche || !sol) return;
    const idee = banque.find(x => x.titre === sol.titre);
    const ecrire = (id, texte) => { const c = document.getElementById(id); if (c && !c.value) c.value = texte; };
    ecrire('fiche_titre', sol.titre);
    ecrire('fiche_description', idee?.pourquoi || '');
    // notes de la grille : pastilles noires à côté des titres
    const notes = { environnement: sol.notes[0], cout: sol.notes[2], performance: sol.notes[3] };
    fiche.querySelectorAll('.fiche_note').forEach(p => {
      const n = notes[p.dataset.note];
      p.hidden = n === undefined;
      if (n !== undefined) p.textContent = `note : ${signe(n)}`;
    });
    sauverMission3({ piste: { titre: sol.titre, notes: sol.notes, noms: NOMS_NOTES } });

    fiche.hidden = false;
    requestAnimationFrame(() => {
      const titre = document.getElementById('titre_fiche');
      if (typeof calerEnHaut === 'function') calerEnHaut(titre);
      else titre.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('fiche_innovation')?.focus({ preventScroll: true });
    });
  }

  // =====================================================================
  // 10. RELECTURE DE LA FICHE PAR ANDRÉA (petite fenêtre)
  // « soumettre ma fiche » → la fenêtre prend la place du bouton.
  // [VALIDE: fiche] ou 2 échanges → « continuer » (sous la fenêtre) → pop-up « Bravo ».
  // [FICHE: champ = texte] : Andréa met un champ à jour après la discussion.
  // =====================================================================

  const formFiche = document.getElementById('fiche_idee');
  const piedFiche = document.getElementById('pied_fiche');
  const piedFicheSuite = document.getElementById('pied_fiche_suite');
  const annonceFiche = document.getElementById('annonce_fiche');
  const CHAMPS_FICHE = {
    titre: 'titre de l’idée', description: 'description', innovation: 'niveau d’innovation', environnement: 'environnement',
    performance: 'performance', cout: 'coût', limites: 'difficultés, limites', plan: 'plan d’action',
  };
  const ECHANGES_FICHE = 2;
  let echangesFiche = 0;
  let ficheValidee = false;

  function texteFiche() {
    const lignes = Object.entries(CHAMPS_FICHE).map(([cle, nom]) => {
      const v = document.getElementById(`fiche_${cle}`)?.value.trim();
      return `- ${nom} (${cle}) : ${v || '(vide)'}`;
    });
    const choix = formFiche.querySelector('input[name="fiche_choix"]:checked');
    lignes.push(`- choix : ${choix ? choix.closest('label').textContent.trim() : '(non choisi)'}`);
    const echeance = document.getElementById('fiche_echeance');
    if (echeance) lignes.push(`- échéance : ${echeance.value}/5 (1 = court terme, 5 = long terme)`);
    return lignes.join('\n');
  }

  function sauverFiche() {
    const fiche = {};
    Object.keys(CHAMPS_FICHE).forEach(cle => { fiche[cle] = document.getElementById(`fiche_${cle}`)?.value.trim() || ''; });
    fiche.choix = formFiche.querySelector('input[name="fiche_choix"]:checked')?.value || null;
    fiche.echeance = document.getElementById('fiche_echeance')?.value || null;
    fiche.validee = ficheValidee;
    sauverMission3({ fiche });
  }

  function appliquerFiche(r) {
    r.champsFiche.forEach(({ cle, texte }) => remplirCase(document.getElementById(`fiche_${cle}`), texte));
    if (r.valide === 'fiche') ficheValidee = true;
    echangesFiche++;
    sauverFiche();
    majPiedFiche();
  }

  function majPiedFiche() {
    const pret = ficheValidee || echangesFiche >= ECHANGES_FICHE;
    if (pret && piedFicheSuite.hidden && annonceFiche) annonceFiche.textContent = 'Le bouton « continuer » est disponible en bas de l’écran.';
    piedFicheSuite.hidden = !pret;
  }

  formFiche?.addEventListener('submit', async e => {
    e.preventDefault();
    sauverFiche();
    if (piedFiche) piedFiche.hidden = true;
    ouvrirFenetre('fiche');
    ajouterMessage('eleve', 'Voici ma fiche idée.', 'Fiche idée');
    const r = await envoyer(`${debutMessage()}[Étape : relecture de la fiche]\n${texteFiche()}`);
    if (!r.ok) {
      ajouterMessage('erreur', `${r.erreur} Réessaie dans un instant.`);
      echangesFiche++;
      majPiedFiche();
      return;
    }
    appliquerFiche(r);
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte);
    champ.focus({ preventScroll: true });
  });

  // réponse dans la fenêtre : avec la fiche telle qu'elle est maintenant
  async function repondreFiche(texte) {
    ajouterMessage('eleve', texte);
    const r = await envoyer(`${debutMessage()}[Étape : relecture de la fiche]\n${texte}\n[Fiche actuelle]\n${texteFiche()}`);
    if (!r.ok) {
      ajouterMessage('erreur', `${r.erreur} Ton message n’est pas parti : réécris-le dans un instant.`);
      echangesFiche++;
      majPiedFiche();
      return;
    }
    appliquerFiche(r);
    changerHumeur(r.humeur);
    if (r.texte) ajouterMessage('mentor', r.texte);
    champ.focus({ preventScroll: true });
  }

  // « continuer » → pop-up « Bravo » → conclusion
  piedFicheSuite?.querySelector('button')?.addEventListener('click', () => {
    sauverFiche();
    piedFicheSuite.hidden = true;
    fermerFenetre();
    andreaDit('texte_conclusion', 'continuer', montrerConclusion, true);
  });


  // =====================================================================
  // 11. CONCLUSION : boîte rose, mascotte, « continuer » → chap3_V
  // =====================================================================

  const popFin = document.getElementById('pop_fin');
  const DELAI_POP_FIN = Number(popFin?.dataset.delai) || 4000;

  function montrerConclusion() {
    const conclusion = document.getElementById('partie_conclusion');
    if (!conclusion) return;
    conclusion.hidden = false;
    if (window.Memoire?.terminer) window.Memoire.terminer();     // SCORM : activité terminée
    requestAnimationFrame(() => {
      const zoneConclu = document.getElementById('conclusion_rose');
      if (typeof centrerSur === 'function') centrerSur(conclusion.getBoundingClientRect());
      else zoneConclu.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    // mascotte : quelques secondes après
    if (popFin && typeof popFin.showModal === 'function') {
      setTimeout(() => { if (!popFin.open) popFin.showModal(); }, DELAI_POP_FIN);
    }
  }

  // pop-up mascotte : croix, clic à côté
  if (popFin) {
    popFin.querySelector('.fermer_modal')?.addEventListener('click', () => popFin.close());
    popFin.addEventListener('click', e => {
      if (e.target !== popFin) return;
      const r = popFin.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) popFin.close();
    });
  }

})();