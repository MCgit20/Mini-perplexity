// src/agent.js
import { chatCompletion } from './mistral.js';

/**
 * @param {Array}  tools            - Définitions d'outils
 * @param {Object} toolFunctions    - Fonctions réelles
 * @param {Array}  messages         - L'HISTORIQUE COMPLET (modifié par référence)
 */
export async function runAgent(tools, toolFunctions, messages) {
  while (true) {
    const response = await chatCompletion(messages, tools);
    const choice = response.choices[0];
    const message = choice.message;

    if (choice.finish_reason === 'tool_calls') {
      messages.push(message); // On garde l'intention de l'assistant

      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`\n🔧 Outil appelé : ${name}`);
        const fn = toolFunctions[name];
        const result = await fn(args);

        // On injecte le résultat dans l'historique
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
      // La boucle continue : le LLM verra les résultats des outils au prochain tour
    } else {
      // Pas d'outils à appeler : c'est la réponse finale
      return message.content;
    }
  }
}