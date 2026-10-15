(async function () {
      const status = document.getElementById('clone-status');

      try {
        if (
          !window.SPOC_SUPABASE_URL ||
          !window.SPOC_SUPABASE_KEY ||
          window.SPOC_SUPABASE_KEY.includes('COLLE_')
        ) {
          throw new Error('Configure la clé Publishable dans spoc-editeur-supabase/supabase-config.js.');
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

        document.getElementById('clone-title').textContent = c.title || data[0].titre || 'Activité';
        document.getElementById('clone-intro').textContent = c.intro || '';

        const blocks = document.querySelectorAll('.qcm_bloc');

        c.questions.slice(0, blocks.length).forEach((q, i) => {
          const b = blocks[i];

          b.querySelector('.qcm_scenario p').textContent = q.scenario || '';

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
            span.textContent = ' ' + o.text;

            label.append(input, span);
            options.append(label);
          });

          // Correction
          const corr = b.querySelector('.qcm_correction');
          corr.replaceChildren();

          (q.correction || '')
            .split(/(?=réponse[s]?\s+[a-z](?:\s+et\s+[a-z])?\s*:)/i)
            .filter(Boolean)
            .forEach(t => {
              const p = document.createElement('p');
              p.textContent = t.trim();
              corr.append(p);
            });
        });

        status.textContent = 'Contenu chargé depuis Supabase (' + new Date().toLocaleTimeString('fr-FR') + ').';

      } catch (e) {
        status.textContent = 'Erreur : ' + e.message;
        status.style.color = '#a00';
      }
    })();