const $ = id => document.getElementById(id);

const original = JSON.parse(JSON.stringify(window.SPOC_CONTENT));
let draft = JSON.parse(JSON.stringify(original));

const typeLabels = {
  juste: 'Bonne réponse',
  neutre: 'Neutre',
  faux: 'Mauvaise réponse'
};


// ---------- RENDU ----------

function render() {
  $('title').value = draft.title;
  $('intro').value = draft.intro;
  $('classIntro').value = draft.classification.intro || '';
  $('classInstruction').value = draft.classification.instruction || '';

  // Questions
  $('questions').innerHTML = '';

  draft.questions.forEach((q, i) => {
    const box = document.createElement('section');
    box.className = 'q';
    box.innerHTML = `
      <h3>Question ${i + 1}</h3>
      <label class="a_remplir">Énoncé<textarea data-q="${i}" data-prop="scenario"></textarea></label>
      <div data-options="${i}"></div>
      <label class="a_remplir">Correction<textarea data-q="${i}" data-prop="correction"></textarea></label>
    `;

    box.querySelector('[data-prop="scenario"]').value = q.scenario;
    box.querySelector('[data-prop="correction"]').value = q.correction;

    const opts = box.querySelector('[data-options]');

    q.options.forEach((o, j) => {
      const line = document.createElement('div');
      line.className = 'option';

      const sel = document.createElement('select');
      sel.className = 'tag';
      sel.setAttribute('aria-label', 'Type de réponse');

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

      const inp = document.createElement('input');
      inp.value = o.text;
      inp.setAttribute('aria-label', `Question ${i + 1}, réponse ${j + 1}`);
      inp.addEventListener('input', () => {
        draft.questions[i].options[j].text = inp.value;
      });

      line.append(sel, inp);
      opts.appendChild(line);
    });

    $('questions').appendChild(box);
  });

  // Niveaux
  $('levels').innerHTML = '';

  draft.classification.levels.forEach((lev, i) => {
    const box = document.createElement('div');
    box.className = 'q';
    box.innerHTML = `
      <h3>Niveau ${i + 1}</h3>
      <label class="a_remplir">Titre<input type="text" data-level="${i}" data-prop="title"></label>
      <label class="a_remplir">Description<textarea data-level="${i}" data-prop="description"></textarea></label>
    `;

    box.querySelector('[data-prop="title"]').value = lev.title;
    box.querySelector('[data-prop="description"]').value = lev.description;

    $('levels').appendChild(box);
  });

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

  renderCatalog();
}


function renderCatalog() {
  [...$('catalog').children].forEach((b, i) =>
    b.classList.toggle('selected', draft.selectedImage === draft.catalogImages[i].src)
  );

  const im = draft.catalogImages.find(x => x.src === draft.selectedImage);

  $('selectedImage').textContent = im
    ? 'Image sélectionnée : ' + im.label
    : 'Aucune image sélectionnée';
}




// ---------- LIRE LE FORMULAIRE ----------

function readEdits() {
  draft.title = $('title').value;
  draft.intro = $('intro').value;
  draft.classification.intro = $('classIntro').value;
  draft.classification.instruction = $('classInstruction').value;

  document.querySelectorAll('[data-q][data-prop]').forEach(el => {
    draft.questions[Number(el.dataset.q)][el.dataset.prop] = el.value;
  });

  document.querySelectorAll('[data-level][data-prop]').forEach(el => {
    draft.classification.levels[Number(el.dataset.level)][el.dataset.prop] = el.value;
  });
}


// ---------- SUPAABASE ----------

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
    return 'Contenu chargé depuis Supabase.';
  }

  draft = JSON.parse(JSON.stringify(original));
  return 'La ligne Supabase existe, mais son contenu est encore le JSON de test simple. J’ai chargé le QCM initial dans l’éditeur. Enregistrer dans Supabase remplacera ce contenu par le contenu complet du QCM.';
}


async function ouvrirEditeur() {
  $('home').classList.add('hidden');
  $('edit').classList.remove('hidden');

  draft = JSON.parse(JSON.stringify(original));
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
  render();
  $('notice').textContent = 'Modifications du formulaire annulées. Rien n’a été envoyé à Supabase.';
  $('notice').classList.remove('hidden');
};


$('save').onclick = async () => {
  readEdits();
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


// ---------- Aperçu en direct ----------



render();