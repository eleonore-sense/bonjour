const $ = id => document.getElementById(id);

const original = JSON.parse(JSON.stringify(window.SPOC_CONTENT));
let draft = JSON.parse(JSON.stringify(original));
if (!Array.isArray(draft.definitions)) draft.definitions = [];

const typeLabels = {
  juste: 'Bonne réponse',
  neutre: 'Neutre',
  faux: 'Mauvaise réponse'
};


// ---------- CHAMP DE TEXTE ENRICHI ----------
// barre G / S / I / + définition, suivie de la zone de texte

const OUTILS = `
  <button type="button" data-cmd="bold" aria-label="Gras"><b>G</b></button>
  <button type="button" data-cmd="underline" aria-label="Souligné"><u>S</u></button>
  <button type="button" data-cmd="italic" aria-label="Italique"><i>I</i></button>
  <button type="button" data-cmd="add-definition">+ Ajouter un mot à définir</button>`;

// uneLigne : la touche Entrée ne crée pas de nouvelle ligne (réponses, titres de niveau)
function champRiche({ libelle, valeur, attributs = {}, uneLigne = false }) {
  const bloc = document.createElement('div');
  bloc.className = 'a_remplir';
  if (libelle) bloc.append(libelle);

  const outils = document.createElement('div');
  outils.className = 'rich-tools';
  outils.innerHTML = OUTILS;

  const zone = document.createElement('div');
  zone.className = 'rich-editor' + (uneLigne ? ' une-ligne' : '');
  zone.contentEditable = 'true';
  zone.setAttribute('role', 'textbox');
  zone.setAttribute('aria-multiline', uneLigne ? 'false' : 'true');
  zone.setAttribute('aria-label', attributs['aria-label'] || libelle || 'Texte');
  Object.entries(attributs).forEach(([nom, val]) => zone.setAttribute(nom, val));
  zone.innerHTML = valeur || '';

  bloc.append(outils, zone);
  return bloc;
}

// les mots à définir forment un bloc : on ne peut pas taper à l'intérieur par erreur
function verrouillerMots() {
  document.querySelectorAll('#edit .rich-editor .mot_notion').forEach(mot => {
    mot.contentEditable = 'false';
  });
}


// ---------- RENDU ----------

function render() {
  $('title').value = draft.title;

  $('zone_intro').replaceChildren(champRiche({
    libelle: 'Texte d’introduction',
    valeur: draft.intro,
    attributs: { id: 'intro' }
  }));

  $('zone_classIntro').replaceChildren(champRiche({
    libelle: 'Consigne',
    valeur: draft.classification.intro,
    attributs: { id: 'classIntro' }
  }));

  $('zone_classInstruction').replaceChildren(champRiche({
    libelle: 'Instruction',
    valeur: draft.classification.instruction,
    attributs: { id: 'classInstruction' }
  }));

  // Questions
  $('questions').innerHTML = '';

  draft.questions.forEach((q, i) => {
    const box = document.createElement('section');
    box.className = 'q';

    const h = document.createElement('h3');
    h.textContent = `Question ${i + 1}`;

    const enonce = champRiche({
      libelle: 'Énoncé',
      valeur: q.scenario,
      attributs: { 'data-q': i, 'data-prop': 'scenario', 'aria-label': `Question ${i + 1}, énoncé` }
    });

    const opts = document.createElement('div');
    opts.dataset.options = i;

    q.options.forEach((o, j) => {
      const line = document.createElement('div');
      line.className = 'option';

      const sel = document.createElement('select');
      sel.className = 'tag';
      sel.setAttribute('aria-label', `Question ${i + 1}, type de la réponse ${j + 1}`);

      [
        ['juste', 'Bonne réponse'],
        ['neutre', 'Neutre'],
        ['faux', 'Mauvaise réponse']
      ].forEach(([v, l]) => {
        const op = document.createElement('option');
        op.value = v;
        op.textContent = l;
        sel.appendChild(op);
      });

      sel.value = o.type;
      sel.addEventListener('change', () => {
        draft.questions[i].options[j].type = sel.value;
      });

      const reponse = champRiche({
        valeur: o.text,
        uneLigne: true,
        attributs: { 'data-opt-q': i, 'data-opt-o': j, 'aria-label': `Question ${i + 1}, réponse ${j + 1}` }
      });

      line.append(sel, reponse);
      opts.appendChild(line);
    });

    const correction = champRiche({
      libelle: 'Correction',
      valeur: q.correction,
      attributs: { 'data-q': i, 'data-prop': 'correction', 'aria-label': `Question ${i + 1}, correction` }
    });

    box.append(h, enonce, opts, correction);
    $('questions').appendChild(box);
  });

  // Niveaux
  $('levels').innerHTML = '';

  draft.classification.levels.forEach((lev, i) => {
    const box = document.createElement('div');
    box.className = 'q';

    const h = document.createElement('h3');
    h.textContent = `Niveau ${i + 1}`;

    const titre = champRiche({
      libelle: 'Titre',
      valeur: lev.title,
      uneLigne: true,
      attributs: { 'data-level': i, 'data-prop': 'title', 'aria-label': `Niveau ${i + 1}, titre` }
    });

    const description = champRiche({
      libelle: 'Description',
      valeur: lev.description,
      attributs: { 'data-level': i, 'data-prop': 'description', 'aria-label': `Niveau ${i + 1}, description` }
    });

    box.append(h, titre, description);
    $('levels').appendChild(box);
  });

  // Correction du classement (créée sous les niveaux si le HTML n'a pas encore sa place)
  if (!$('zone_classCorrection')) {
    const zone = document.createElement('div');
    zone.id = 'zone_classCorrection';
    $('levels').after(zone);
  }

  $('zone_classCorrection').replaceChildren(champRiche({
    libelle: 'Correction du classement',
    valeur: draft.classification.correction,
    attributs: { id: 'classCorrection' }
  }));

  // Catalogue d'images
  $('catalog').innerHTML = '';

  draft.catalogImages.forEach(img => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile' + (draft.selectedImage === img.src ? ' selected' : '');

    const im = document.createElement('img');
    im.src = img.src;
    im.alt = '';

    const label = document.createElement('span');
    label.textContent = img.label;

    b.append(im, label);

    b.onclick = () => {
      draft.selectedImage = img.src;
      renderCatalog();
      $('selectedImage').textContent = 'Image sélectionnée : ' + img.label;
    };

    $('catalog').appendChild(b);
  });

  verrouillerMots();
  renderDefinitions();
  renderCatalog();
}


// ---------- DÉFINITIONS ----------

// le numéro affiché après chaque mot suit l'ordre de la liste des définitions
function renumeroter() {
  draft.definitions.forEach((d, i) => {
    document.querySelectorAll(`.mot_notion[data-cible="${d.id}"]`).forEach(mot => {
      mot.dataset.numero = i + 1;
    });
  });
}

function renderDefinitions() {
  const host = $('definitions');
  if (!host) return;

  host.innerHTML = '';
  if (!Array.isArray(draft.definitions)) draft.definitions = [];

  if (!draft.definitions.length) {
    const vide = document.createElement('p');
    vide.className = 'muted';
    vide.textContent = 'Sélectionne un mot dans n’importe quel texte, puis clique sur « + Ajouter un mot à définir ».';
    host.appendChild(vide);
  }

  draft.definitions.forEach((d, i) => {
    const row = document.createElement('div');
    row.className = 'definition-row';

    const title = document.createElement('strong');
    title.textContent = `${i + 1}) ${d.term || 'Mot à définir'}`;

    const term = document.createElement('input');
    term.value = d.term || '';
    term.placeholder = 'Mot ou expression';
    term.setAttribute('aria-label', `Mot ${i + 1}`);
    term.addEventListener('input', () => {
      d.term = term.value;
      title.textContent = `${i + 1}) ${d.term || 'Mot à définir'}`;
    });

    const def = document.createElement('textarea');
    def.value = d.text || '';
    def.placeholder = 'Saisir la définition';
    def.setAttribute('aria-label', `Définition ${i + 1}`);
    def.addEventListener('input', () => { d.text = def.value; });

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = 'Supprimer';
    del.addEventListener('click', () => {
      // le mot redevient du texte normal là où il apparaît
      document.querySelectorAll(`.mot_notion[data-cible="${d.id}"]`).forEach(mot => {
        mot.replaceWith(document.createTextNode(mot.textContent));
      });
      draft.definitions.splice(i, 1);
      renderDefinitions();
    });

    row.append(title, term, def, del);
    host.appendChild(row);
  });

  renumeroter();
}

function ajouterDefinition(zone) {
  const sel = window.getSelection();
  const selected = sel && sel.rangeCount ? sel.toString().trim() : '';

  if (!selected || !zone.contains(sel.getRangeAt(0).commonAncestorContainer)) {
    alert('Sélectionne d’abord un mot ou une expression dans ce texte.');
    return;
  }

  const id = 'definition-' + Date.now();

  const span = document.createElement('span');
  span.className = 'mot_notion';
  span.dataset.cible = id;
  span.contentEditable = 'false';
  span.textContent = selected;

  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(span);
  sel.removeAllRanges();

  draft.definitions.push({ id, term: selected, text: '' });
  renderDefinitions();

  // le curseur va directement dans la nouvelle définition
  const champs = $('definitions').querySelectorAll('.definition-row textarea');
  champs[champs.length - 1]?.focus();
}


// ---------- BARRE D'OUTILS ET SAISIE ----------
// écoutes posées une seule fois sur la page : elles marchent pour tous les champs, même recréés

// le clic sur un bouton ne doit pas faire perdre la sélection dans le texte
document.addEventListener('mousedown', e => {
  if (e.target.closest('.rich-tools button')) e.preventDefault();
});

document.addEventListener('click', e => {
  const btn = e.target.closest('.rich-tools button[data-cmd]');
  if (!btn) return;

  const zone = btn.closest('.rich-tools').nextElementSibling;
  if (!zone || !zone.classList.contains('rich-editor')) return;

  if (btn.dataset.cmd === 'add-definition') {
    ajouterDefinition(zone);
    return;
  }

  zone.focus();
  document.execCommand(btn.dataset.cmd, false, null);
});

// champ sur une ligne : pas de retour à la ligne
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.closest('.rich-editor.une-ligne')) e.preventDefault();
});

// coller : texte brut seulement (évite les styles importés de Word ou d'une page web)
document.addEventListener('paste', e => {
  if (!e.target.closest('.rich-editor')) return;
  e.preventDefault();
  let texte = (e.clipboardData || window.clipboardData).getData('text/plain');
  if (e.target.closest('.une-ligne')) texte = texte.replace(/\s*\n\s*/g, ' ');
  document.execCommand('insertText', false, texte);
});


function renderCatalog() {
  [...$('catalog').children].forEach((b, i) =>
    b.classList.toggle('selected', draft.selectedImage === draft.catalogImages[i].src)
  );

  const im = draft.catalogImages.find(x => x.src === draft.selectedImage);

  $('selectedImage').textContent = im
    ? 'Image sélectionnée : ' + im.label
    : 'Aucune image sélectionnée';
}


// ---------- ESPACE FINE INSÉCABLE AVANT « : » ----------
// appliquée au moment de l'enregistrement, pour l'export vers le site

const FINE = ' ';

// « mot : » ou « mot: » → espace fine insécable avant les deux-points
// (les adresses du type https:// ne sont pas touchées)
function fineTexte(texte) {
  return String(texte ?? '').replace(/[   ]*:(?!\/\/)/g, FINE + ':');
}

// texte enrichi : on ne touche qu'au texte, jamais aux balises ni aux attributs ;
// on retire aussi le verrou d'édition des mots à définir, inutile sur le site
function fineHTML(html) {
  const modele = document.createElement('template');
  modele.innerHTML = html || '';

  modele.content.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));

  const parcours = document.createTreeWalker(modele.content, NodeFilter.SHOW_TEXT);
  let noeud;
  while ((noeud = parcours.nextNode())) {
    noeud.nodeValue = fineTexte(noeud.nodeValue);
  }

  return modele.innerHTML;
}

function appliquerEspacesFines() {
  draft.title = fineTexte(draft.title);
  draft.intro = fineHTML(draft.intro);

  draft.questions.forEach(q => {
    q.scenario = fineHTML(q.scenario);
    q.correction = fineHTML(q.correction);
    q.options.forEach(o => { o.text = fineHTML(o.text); });
  });

  const c = draft.classification;
  c.intro = fineHTML(c.intro);
  c.instruction = fineHTML(c.instruction);
  c.correction = fineHTML(c.correction);
  c.levels.forEach(l => {
    l.title = fineHTML(l.title);
    l.description = fineHTML(l.description);
  });

  draft.definitions.forEach(d => {
    d.term = fineTexte(d.term);
    d.text = fineTexte(d.text);
  });
}


// ---------- LIRE LE FORMULAIRE ----------

function readEdits() {
  draft.title = $('title').value;
  draft.intro = $('intro').innerHTML;
  draft.classification.intro = $('classIntro').innerHTML;
  draft.classification.instruction = $('classInstruction').innerHTML;
  draft.classification.correction = $('classCorrection').innerHTML;

  document.querySelectorAll('.definition-row').forEach((row, i) => {
    const d = draft.definitions[i];
    if (!d) return;
    d.term = row.querySelector('input').value;
    d.text = row.querySelector('textarea').value;
  });

  document.querySelectorAll('[data-q][data-prop]').forEach(el => {
    draft.questions[Number(el.dataset.q)][el.dataset.prop] = el.innerHTML;
  });

  document.querySelectorAll('[data-opt-q]').forEach(el => {
    draft.questions[Number(el.dataset.optQ)].options[Number(el.dataset.optO)].text = el.innerHTML;
  });

  document.querySelectorAll('[data-level][data-prop]').forEach(el => {
    draft.classification.levels[Number(el.dataset.level)][el.dataset.prop] = el.innerHTML;
  });
}


// ---------- SUPABASE ----------

async function chargerSupabase() {
  if (
    !window.SPOC_SUPABASE_URL ||
    !window.SPOC_SUPABASE_KEY ||
    window.SPOC_SUPABASE_KEY.includes('COLLE_')
  ) {
    throw new Error('Configure d’abord supabase-config.js avec ton URL et ta clé Publishable.');
  }

  const url = window.SPOC_SUPABASE_URL + '/rest/v1/pages_cours?select=id,titre,contenu,publie&id=eq.CH03-P04';

  const res = await fetch(url, {
    headers: {
      apikey: window.SPOC_SUPABASE_KEY,
      Authorization: 'Bearer ' + window.SPOC_SUPABASE_KEY
    }
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  if (!data.length) throw new Error('La page CH03-P04 est introuvable ou la lecture est interdite. Vérifie les règles SQL.');

  const c = data[0].contenu;

  if (c && Array.isArray(c.questions) && c.classification) {
    draft = c;
    if (!Array.isArray(draft.definitions)) draft.definitions = [];
    return 'Contenu chargé depuis Supabase.';
  }

  draft = JSON.parse(JSON.stringify(original));
  if (!Array.isArray(draft.definitions)) draft.definitions = [];
  return 'La ligne Supabase existe, mais son contenu est encore le JSON de test simple. J’ai chargé le QCM initial dans l’éditeur. Enregistrer dans Supabase remplacera ce contenu par le contenu complet du QCM.';
}


async function ouvrirEditeur() {
  $('home').classList.add('hidden');
  $('edit').classList.remove('hidden');

  draft = JSON.parse(JSON.stringify(original));
  if (!Array.isArray(draft.definitions)) draft.definitions = [];
  render();

  $('notice').textContent = 'Connexion à Supabase…';
  $('notice').classList.remove('hidden');

  try {
    $('notice').textContent = await chargerSupabase();
    render();
  } catch (e) {
    $('notice').textContent = 'Connexion impossible : ' + e.message + ' — Le QCM initial reste disponible localement.';
  }
}


// ---------- LES BOUTONS ----------

$('open').onclick = ouvrirEditeur;

$('back').onclick = () => {
  $('edit').classList.add('hidden');
  $('home').classList.remove('hidden');
};

$('cancel').onclick = () => {
  draft = JSON.parse(JSON.stringify(original));
  if (!Array.isArray(draft.definitions)) draft.definitions = [];
  render();
  $('notice').textContent = 'Modifications du formulaire annulées. Rien n’a été envoyé à Supabase.';
  $('notice').classList.remove('hidden');
};

$('save').onclick = async () => {
  readEdits();
  appliquerEspacesFines();
  render();   // l'éditeur affiche le texte tel qu'il part sur le site

  $('save').disabled = true;
  $('notice').textContent = 'Enregistrement dans Supabase…';
  $('notice').classList.remove('hidden');

  try {
    if (
      !window.SPOC_SUPABASE_URL ||
      !window.SPOC_SUPABASE_KEY ||
      window.SPOC_SUPABASE_KEY.includes('COLLE_')
    ) {
      throw new Error('Configure supabase-config.js avec ton URL et ta clé Publishable.');
    }

    const res = await fetch(window.SPOC_SUPABASE_URL + '/rest/v1/pages_cours?id=eq.CH03-P04', {
      method: 'PATCH',
      headers: {
        apikey: window.SPOC_SUPABASE_KEY,
        Authorization: 'Bearer ' + window.SPOC_SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        titre: draft.title,
        contenu: draft,
        publie: true,
        updated_at: new Date().toISOString()
      })
    });

    const data = await res.json().catch(() => []);

    if (!res.ok) throw new Error(data.message || JSON.stringify(data));
    if (!data.length) throw new Error('Aucune ligne modifiée. Vérifie la policy UPDATE pour CH03-P04.');

    $('notice').textContent = 'Enregistré dans Supabase ! La page CH03-P04 contient maintenant le QCM complet.';
  } catch (e) {
    $('notice').textContent = 'Échec de l’enregistrement : ' + e.message;
  } finally {
    $('save').disabled = false;
  }
};


render();