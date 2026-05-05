// phase2.js — Agent avec calculatrice + météo
// Le modèle choisit seul lequel appeler, ou les deux en séquence.

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
import { calculate, calculateTool } from './src/tools/calculate.js';
import { get_weather, weatherTool } from './src/tools/weather.js';

const tools = [calculateTool, weatherTool];
const toolFunctions = { calculate, get_weather };

// ── Test 1 : météo seule ─────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(60));
console.log('TEST 1 — Météo seule');
console.log('═'.repeat(60));

const q1 = 'Quel temps fait-il à Tokyo en ce moment ?';
console.log(`Question : "${q1}"`);
const a1 = await runAgent(tools, toolFunctions, q1);
console.log('\n💬 Réponse :\n' + a1);

// ── Test 2 : météo + conversion Fahrenheit (deux outils en séquence) ─────────
console.log('\n' + '═'.repeat(60));
console.log('TEST 2 — Météo + conversion (deux outils en séquence)');
console.log('═'.repeat(60));

const q2 = "Quelle est la météo à Londres, et si je convertis la température en Fahrenheit ?";
console.log(`Question : "${q2}"`);
const a2 = await runAgent(tools, toolFunctions, q2);
console.log('\n💬 Réponse :\n' + a2);