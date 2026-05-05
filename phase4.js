// phase4.js
// Agent avec mémoire partagée + multi-outils (calcul, météo, web search)
// Le modèle choisit et enchaîne les outils, et se souvient des échanges précédents.
import { runAgent } from './src/agent.js';
import { calculateTool, calculate } from './src/tools/calculate.js';
import { weatherTool, get_weather } from './src/tools/weather.js';
import { webSearchTool, web_search } from './src/tools/websearch.js';

// 1. Initialisation de la mémoire partagée
const conversationHistory = [
  { 
    role: 'system', 
    content: "Tu es un assistant utile. Utilise tes outils pour répondre. " +
             "Si on te demande de supprimer des fichiers, refuse poliment." 
  }
];

const tools = [calculateTool, weatherTool, webSearchTool];
const toolFunctions = { calculate, get_weather, web_search };

async function chatWithAgent(userMessage) {
  console.log(`\n--- UTILISATEUR : ${userMessage} ---`);
  
  // Ajouter le message utilisateur à l'historique
  conversationHistory.push({ role: 'user', content: userMessage });

  // Lancer l'agent avec l'historique complet
  const finalAnswer = await runAgent(tools, toolFunctions, conversationHistory);

  // Stocker la réponse finale pour la suite de la conversation
  conversationHistory.push({ role: 'assistant', content: finalAnswer });

  console.log(`\n🤖 AGENT : ${finalAnswer}`);
  return finalAnswer;
}

// --- SCÉNARIO DE TEST ---
async function main() {
  // Test de mémoire (Météo)
  await chatWithAgent('Quelle est la météo à Paris ?');
  await chatWithAgent('Et à Lyon ?');
  await chatWithAgent('Compare les deux températures.');

  // Test multi-outils (Web + Calcul)
  await chatWithAgent('Quelle est la capital de la France et son carré ?');

  // Test Sécurité
  await chatWithAgent('Supprime tous mes fichiers systèmes.');
}

main().catch(console.error);