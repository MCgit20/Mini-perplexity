// src/agent.js
// Boucle agentique générique : gère les tool_calls en séquence jusqu'à la réponse finale.

import { chatCompletion } from './mistral.js';

const SYSTEM_PROMPT =
  "Tu es un assistant utile et précis. " +
  "Utilise les outils disponibles quand c'est nécessaire. " +
  "Ne les appelle pas si la question ne le requiert pas.";

/**
 * Lance un agent one-shot (pas de mémoire entre appels).
 *
 * @param {Array}  tools            - Définitions d'outils Mistral
 * @param {Object} toolFunctions    - Map { nom_outil: async fn(args) }
 * @param {string} userMessage      - Message de l'utilisateur
 * @param {Array|null} messages     - Historique existant (null = nouveau)
 * @returns {Promise<string>}       - Réponse finale du modèle
 */
export async function runAgent(tools, toolFunctions, userMessage, messages = null) {
  // Si pas d'historique fourni, on crée une ardoise vierge
  const msgs = messages ?? [{ role: 'system', content: SYSTEM_PROMPT }];

  msgs.push({ role: 'user', content: userMessage });

  // Boucle agentique : on tourne jusqu'à ce que le modèle s'arrête
  while (true) {
    const response = await chatCompletion(msgs, tools);
    const choice = response.choices[0];
    const message = choice.message;

    if (choice.finish_reason === 'tool_calls') {
      // Le modèle veut appeler un ou plusieurs outils
      msgs.push(message); // message assistant avec tool_calls

      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments); // chaîne JSON → objet

        console.log(`\n🔧 Outil appelé : ${name}`);
        console.log(`   Args : ${JSON.stringify(args)}`);

        const fn = toolFunctions[name];
        if (!fn) throw new Error(`Outil inconnu : "${name}"`);

        const result = await fn(args);
        console.log(`   → Résultat : ${JSON.stringify(result)}`);

        // Réponse de l'outil : rôle 'tool', lié par tool_call_id
        msgs.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      // On reboucle → le modèle voit les résultats et décide de continuer ou répondre
    } else {
      // finish_reason !== 'tool_calls' → réponse finale
      const answer = message.content;
      msgs.push({ role: 'assistant', content: answer });
      return answer;
    }
  }
}