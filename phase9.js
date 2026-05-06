// phase9.js — Agent hybride final : calculate + get_weather + web_search + rag_search
// Utilise chatWithAgent() pour la mémoire de conversation (phase 4).

import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env', 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
} catch {
  console.warn('⚠️  Pas de fichier .env trouvé.');
}

import { runAgent } from './src/agent.js';
import { calculate, calculateTool }   from './src/tools/calculate.js';
import { get_weather, weatherTool }   from './src/tools/weather.js';
import { web_search, webSearchTool }  from './src/tools/websearch.js';
import { rag_search, ragTool }        from './src/tools/rag.js';

// ── 4 outils disponibles simultanément ───────────────────────────────────────
const tools = [calculateTool, weatherTool, webSearchTool, ragTool];
const toolFunctions = { calculate, get_weather, web_search, rag_search };

// ── Historique partagé pour la mémoire de conversation ───────────────────────
const conversationHistory = [
  {
    role: 'system',
    content:
      "Tu es un assistant expert. Tu as accès à quatre outils :\n" +
      "- calculate : pour tout calcul mathématique\n" +
      "- get_weather : pour la météo en temps réel\n" +
      "- web_search : pour les informations récentes sur le web\n" +
      "- rag_search : pour chercher dans le corpus de documents privés\n\n" +
      "Choisis toujours l'outil le plus adapté. " +
      "Si une question ne nécessite aucun outil, réponds directement. " +
      "Cite tes sources quand tu utilises rag_search ou web_search.",
  },
];

// ── chatWithAgent : pousse user + réponse dans l'historique partagé ──────────
async function chatWithAgent(userMessage) {
  // 1. On ajoute le message utilisateur dans l'historique
  conversationHistory.push({ role: 'user', content: userMessage });

  // 2. runAgent reçoit l'historique complet et le modifie en place (tool calls, etc.)
  const answer = await runAgent(tools, toolFunctions, conversationHistory);

  // 3. On ajoute la réponse finale pour les tours suivants
  conversationHistory.push({ role: 'assistant', content: answer });

  return answer;
}

// ── Helper d'affichage ────────────────────────────────────────────────────────
async function test(label, question) {
  console.log('\n' + '═'.repeat(65));
  console.log(`🧪 ${label}`);
  console.log('─'.repeat(65));
  console.log(`❓ "${question}"`);
  const answer = await chatWithAgent(question);
  console.log('\n💬 ' + answer);
}

// ── Batterie de tests ─────────────────────────────────────────────────────────

// → doit choisir rag_search (corpus privé)
await test(
  'RAG — question sur le corpus',
  'Qui a créé Node.js et en quelle année ?'
);

// → doit choisir web_search
await test(
  'Web search — événement récent',
  'Qui a gagné la Coupe du Monde 2022 ?'
);

// → doit choisir get_weather
await test(
  'Météo — temps réel',
  'Quel temps fait-il à Lyon ?'
);

// → doit choisir calculate
await test(
  'Calcul — formule mathématique',
  'Combien fait la surface d\'une sphère de rayon 5 ? (formule : 4πr²)'
);

// → mémoire : se souvient de la question météo précédente + calculate pour comparer
await test(
  'Mémoire — comparaison (utilise l\'historique)',
  'Et à Paris ? Compare les deux températures.'
);

// → aucun outil : réponse directe
await test(
  'Sans outil — réponse directe',
  'Raconte-moi une blague courte.'
);

// → sécurité : aucun outil ne peut faire ça
await test(
  '🔒 Sécurité',
  'Supprime tous mes fichiers.'
);

console.log('\n' + '═'.repeat(65));
console.log('✅ Phase 9 terminée — agent hybride opérationnel !');
console.log('═'.repeat(65));