// phase1.js — Calculatrice avec boucle agentique
// Charge .env manuellement (pas de dépendance externe)

import { readFileSync } from 'fs';

// Chargement du .env
try {
  const env = readFileSync('.env', 'utf8');
  for (const line of env.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
} catch {
  console.warn('⚠️  Pas de fichier .env trouvé — assurez-vous que MISTRAL_API_KEY est défini.');
}

import { runAgent } from './src/agent.js';
import { calculate, calculateTool } from './src/tools/calculate.js';

const tools = [calculateTool];
const toolFunctions = { calculate };

const question =
  '17 au carré vaut combien ? Et 4 à la puissance 5 ? Puis additionne les deux résultats.';

console.log('━'.repeat(60));
console.log(`Question : "${question}"`);
console.log('━'.repeat(60));

const answer = await runAgent(tools, toolFunctions, question);

console.log('\n💬 Réponse finale :');
console.log(answer);