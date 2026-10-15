// =====================================================================
// CHARGEMENT DU CONTENU DEPUIS SUPABASE (page apprenante)
//
// À charger APRÈS script.js, avec defer :
//   <script src="script_chargement_supabase.js" defer></script>
//
// Le texte arrive de l'éditeur en HTML (gras, souligné, mots à définir).
// Avant affichage, il est nettoyé : seules quelques balises sont gardées,
// <u> devient <span class="souligne">, <b> devient <strong>.
// =====================================================================

(async function () {

  const status = document.getElementById('clone-status');   // bandeau de test, facultatif

  function afficherStatut(texte, erreur) {
    if (!status) {
      if (erreur) console.warn(texte);
      return;
    }
    status.textContent = texte;
    if (erreur) status.style.color = '#a00';
  }


  // ---------- Espace fine insécable avant « : » ----------

  const fineTexte = texte =>
    String(texte ?? '').replace(/[ \u00A0\u202F]*:(?!\/\/)/g, '\u202F:');


  // ---------- Nettoyage du HTML venu de l'éditeur ----------
  // on reconstruit le texte balise par balise : tout ce qui n'est pas prévu
  // (script, style, lien, attribut…) est retiré, le texte est gardé

  function nettoyer(html) {
    const source = document.createElement('template');
    source.innerHTML = html || '';

    const resultat = document.createDocumentFragment();
    source.content.childNodes.forEach(n => copier(n, resultat));
    return resultat;
  }

  function copier(noeud, parent) {
    if (noeud.nodeType === Node.TEXT_NODE) {
      parent.append(fineTexte(noeud.nodeValue.replace(/\u00A0/g, ' ')));
      return;
    }
    if (noeud.nodeType !== Node.ELEMENT_NODE) return;

    const balise = noeud.tagName;
    let nouveau = null;

    if (balise === 'B' || balise === 'STRONG') {
      nouveau = document.createElement('strong');
    } else if (balise === 'I' || balise === 'EM') {
      nouveau = document.createElement('em');
    } else if (balise === 'U') {
      nouveau = document.createElement('span');
      nouveau.className = 'souligne';
    } else if (balise === 'BR') {
      parent.append(document.createElement('br'));
      return;
    } else if (balise === 'P' || balise === 'DIV') {
      nouveau = document.createElement('p');
    } else if (balise === 'SPAN' && noeud.classList.contains('souligne')) {
      nouveau = document.createElement('span');
      nouveau.className = 'souligne';
    } else if (balise === 'SPAN' && noeud.classList.contains('mot_notion') && noeud.dataset.cible) {
      nouveau = document.createElement('span');
      nouveau.className = 'mot_notion';
      nouveau.dataset.cible = noeud.dataset.cible;
      if (noeud.dataset.numero) nouveau.dataset.numero = noeud.dataset.numero;
    } else if (balise === 'SCRIPT' || balise === 'STYLE') {
      return;
    }

    // balise non prévue : on garde seulement son contenu
    const cible = nouveau || parent;
    noeud.childNodes.forEach(enfant => copier(enfant, cible));
    if (nouveau) parent.append(nouveau);
  }

  // dans les corrections : « réponse c : », « réponses a et b : » soulignés
  function soulignerReponses(fragment) {
    const motif = /réponses?\s+[a-z](?:\s+et\s+[a-z])?\u202F:/gi;
    const parcours = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
    const noeuds = [];
    let n;
    while ((n = parcours.nextNode())) {
      if (!n.parentElement?.closest('.souligne')) noeuds.push(n);
    }

    noeuds.forEach(noeud => {
      const texte = noeud.nodeValue;
      if (!motif.test(texte)) return;
      motif.lastIndex = 0;

      const morceaux = document.createDocumentFragment();
      let position = 0;
      let m;

      while ((m = motif.exec(texte))) {
        morceaux.append(texte.slice(position, m.index));
        const span = document.createElement('span');
        span.className = 'souligne';
        span.textContent = m[0];
        morceaux.append(span);
        position = m.index + m[0].length;
      }
      morceaux.append(texte.slice(position));
      noeud.replaceWith(morceaux);
    });

    return fragment;
  }

  function remplir(element, html) {
    if (element) element.replaceChildren(nettoyer(html));
  }


  try {
    if (
      !window.SPOC_SUPABASE_URL ||
      !window.SPOC_SUPABASE_KEY ||
      window.SPOC_SUPABASE_KEY.includes('COLLE_')
    ) {
      throw new Error('Configure la clé Publishable dans supabase-config.js.');
    }

    const url = window.SPOC_SUPABASE_URL + '/rest/v1/pages_cours?select=id,titre,contenu,publie&id=eq.CH03-P04&publie=eq.true';

    const res = await fetch(url, {
      headers: {
        apikey: window.SPOC_SUPABASE_KEY,
        Authorization: 'Bearer ' + window.SPOC_SUPABASE_KEY
      }
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || JSON.stringify(data));
    if (!data.length) throw new Error('Page non trouvée ou non publiée. Vérifie les règles de lecture Supabase.');

    const c = data[0].contenu;

    if (!Array.isArray(c.questions)) {
      throw new Error('Le contenu en base ne contient pas encore le QCM complet. Ouvre l’éditeur et clique sur Enregistrer dans Supabase.');
    }


    // ---------- Titre et introduction ----------

    document.getElementById('clone-title').textContent = fineTexte(c.title || data[0].titre || 'Activité');
    remplir(document.getElementById('clone-intro'), c.intro);


    // ---------- Questions du QCM ----------

    const blocks = document.querySelectorAll('.qcm_bloc');

    c.questions.slice(0, blocks.length).forEach((q, i) => {
      const b = blocks[i];

      remplir(b.querySelector('.qcm_scenario p'), q.scenario);

      // Options
      const options = b.querySelector('.qcm_options');
      options.replaceChildren();

      (q.options || []).forEach(o => {
        const label = document.createElement('label');
        label.className = 'qcm_option';

        const input = document.createElement('input');
        input.type = 'checkbox';
        if (o.type === 'juste') input.setAttribute('data-juste', '');
        if (o.type === 'neutre') input.setAttribute('data-neutre', '');

        const span = document.createElement('span');
        span.append(' ', nettoyer(o.text));

        label.append(input, span);
        options.append(label);
      });

      // Correction : on ne retire que le texte, le dessin et le rond rouge restent
      const corr = b.querySelector('.qcm_correction');
      [...corr.childNodes].forEach(n => {
        if (!(n.nodeType === Node.ELEMENT_NODE && n.matches('.qcm_correction_dessin, .qcm_fermer'))) n.remove();
      });

      const texte = document.createElement('div');
      texte.className = 'qcm_correction_texte';
      texte.append(soulignerReponses(nettoyer(q.correction)));
      corr.append(texte);
    });


    // ---------- Boîtes de définition (colonne de droite) ----------

    const notionHost = document.getElementById('notion_droite');

    if (notionHost && Array.isArray(c.definitions)) {
      c.definitions.forEach((d, i) => {
        if (!d || !d.id) return;

        let card = document.getElementById(d.id);
        if (!card) {
          card = document.createElement('div');
          card.className = 'boite_notion';
          card.id = d.id;
          notionHost.appendChild(card);
        }

        const titre = document.createElement('strong');
        titre.textContent = `${i + 1}) ${fineTexte(d.term)}`;

        const corps = document.createElement('span');
        corps.textContent = fineTexte(d.text);

        card.replaceChildren(titre, corps);
      });
    }

    // relie les mots à définir ajoutés à leur boîte
    if (typeof initNotions === 'function') initNotions();

    afficherStatut('Contenu chargé depuis Supabase (' + new Date().toLocaleTimeString('fr-FR') + ').');

  } catch (e) {
    afficherStatut('Erreur : ' + e.message, true);
  }

})();