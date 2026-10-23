// =====================================================================
// RELAIS DU MENTOR IA (version de test, sur ton ordinateur)
//
// 1. Il affiche ton site comme un vrai serveur : http://localhost:8000
// 2. Il reçoit les messages du chat (/api/mentor) et les transmet
//    à ton agent Mistral, avec ta clé API qui reste ici, cachée.
//
// Le prompt, le modèle et la température se règlent dans le Studio Mistral,
// sur l'agent : rien à changer ici quand tu modifies le prompt.
//
// Lancement : double-clic sur lancer_test.bat
// =====================================================================

import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DOSSIER_SERVEUR = path.dirname(fileURLToPath(import.meta.url));
const RACINE_SITE = path.resolve(DOSSIER_SERVEUR, '..');   // le dossier de ton site
const PORT = Number(process.env.PORT) || 8000;
const CLE = (process.env.MISTRAL_API_KEY || '').trim();
const AGENT = (process.env.MISTRAL_AGENT_ID || '').trim();
const API = process.env.MISTRAL_API_URL || 'https://api.mistral.ai/v1/conversations';
const LONGUEUR_MAX = 2000;   // nombre de caractères maximum par message d'élève


// ---------- Vérification des réglages ----------

if (!CLE || CLE.startsWith('colle') || !AGENT || AGENT.startsWith('colle')) {
  console.error('\n  Il manque ta clé API ou l\'identifiant de ton agent.');
  console.error('  Ouvre le fichier cles.env avec le Bloc-notes et colle-les après les signes =.\n');
  process.exit(1);
}


// ---------- Outils ----------

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.pdf':  'application/pdf',
  '.ttf':  'font/ttf',
  '.otf':  'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.riv':  'application/octet-stream',
  '.mp4':  'video/mp4',
};

function envoyerJSON(res, code, donnees) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(donnees));
}

async function lireCorps(req) {
  let texte = '';
  for await (const morceau of req) {
    texte += morceau;
    if (texte.length > 20000) throw new Error('requête trop longue');
  }
  return texte;
}

// Le texte de la dernière réponse du mentor dans ce que renvoie Mistral
function texteDeSortie(donnees) {
  const sorties = Array.isArray(donnees.outputs) ? donnees.outputs : [];
  const messages = sorties.filter(s => s && s.type === 'message.output');
  const dernier = messages[messages.length - 1];
  if (!dernier) return '';
  const contenu = dernier.content;
  if (typeof contenu === 'string') return contenu;
  if (Array.isArray(contenu)) {
    return contenu
      .map(m => (typeof m === 'string' ? m : m && m.type === 'text' ? m.text : ''))
      .join('');
  }
  return '';
}


// ---------- /api/mentor : le relais vers l'agent ----------
// La page envoie { message, conversation_id }.
// 1er message : on démarre une conversation avec l'agent.
// Messages suivants : on continue la conversation (Mistral garde l'historique).

async function routeMentor(req, res) {
  let corps;
  try {
    corps = JSON.parse(await lireCorps(req));
  } catch {
    return envoyerJSON(res, 400, { erreur: 'Message illisible.' });
  }

  const message = typeof corps.message === 'string' ? corps.message.trim() : '';
  const conversation = typeof corps.conversation_id === 'string' ? corps.conversation_id : '';

  if (!message) return envoyerJSON(res, 400, { erreur: 'Le message est vide.' });
  if (message.length > LONGUEUR_MAX) return envoyerJSON(res, 400, { erreur: 'Ton message est trop long.' });
  if (conversation && !/^[\w-]{1,100}$/.test(conversation)) {
    return envoyerJSON(res, 400, { erreur: 'Conversation inconnue.' });
  }

  const adresse = conversation ? `${API}/${conversation}` : API;
  const demande = conversation
    ? { inputs: message, stream: false }
    : { agent_id: AGENT, inputs: message, stream: false };

  let reponse;
  try {
    reponse = await fetch(adresse, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLE}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(demande),
    });
  } catch (e) {
    console.error('  Mistral est injoignable :', e.message);
    return envoyerJSON(res, 502, { erreur: 'Le mentor est injoignable pour le moment.' });
  }

  const brut = await reponse.text();

  if (!reponse.ok) {
    console.error(`  Erreur Mistral ${reponse.status} :`, brut.slice(0, 600));
    return envoyerJSON(res, 502, { erreur: 'Le mentor ne peut pas répondre pour le moment.' });
  }

  let donnees;
  try {
    donnees = JSON.parse(brut);
  } catch {
    console.error('  Réponse Mistral illisible :', brut.slice(0, 600));
    return envoyerJSON(res, 502, { erreur: 'Le mentor ne peut pas répondre pour le moment.' });
  }

  const texte = texteDeSortie(donnees).trim();
  if (!texte) {
    console.error('  Réponse Mistral sans texte :', brut.slice(0, 600));
    return envoyerJSON(res, 502, { erreur: 'Le mentor ne peut pas répondre pour le moment.' });
  }

  envoyerJSON(res, 200, {
    conversation_id: donnees.conversation_id || conversation,
    reponse: texte,
  });
}


// ---------- Les fichiers du site ----------

async function listerPages(res) {
  const fichiers = (await readdir(RACINE_SITE)).filter(f => f.toLowerCase().endsWith('.html'));
  const liens = fichiers.map(f => `<li><a href="/${encodeURIComponent(f)}">${f}</a></li>`).join('');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html><meta charset="utf-8"><title>Pages du site</title>
    <h1>Pages de ton site</h1><ul>${liens || '<li>Aucune page .html trouvée dans ce dossier.</li>'}</ul>`);
}

async function servirFichier(req, res) {
  let chemin;
  try {
    chemin = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400);
    return res.end();
  }

  if (chemin === '/') return listerPages(res);

  const complet = path.resolve(RACINE_SITE, '.' + chemin);
  const interdit =
    !complet.startsWith(RACINE_SITE + path.sep) ||        // en dehors du site
    complet.startsWith(DOSSIER_SERVEUR + path.sep) ||      // le dossier du relais (clés)
    path.basename(complet).startsWith('.');                // fichiers cachés

  if (interdit) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Accès interdit.');
  }

  try {
    const contenu = await readFile(complet);
    const type = TYPES[path.extname(complet).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(contenu);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Fichier introuvable : ' + chemin);
  }
}


// ---------- Démarrage ----------

http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/mentor') return await routeMentor(req, res);
    if (req.method === 'GET' || req.method === 'HEAD') return await servirFichier(req, res);
    res.writeHead(405);
    res.end();
  } catch (e) {
    console.error('  Erreur inattendue :', e);
    if (!res.headersSent) envoyerJSON(res, 500, { erreur: 'Erreur du relais.' });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log('\n  Le relais du mentor est lancé.');
  console.log(`  Ouvre ton navigateur sur : http://localhost:${PORT}`);
  console.log('  (laisse cette fenêtre ouverte ; ferme-la pour tout arrêter)\n');
});
