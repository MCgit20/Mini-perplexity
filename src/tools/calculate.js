// src/tools/calculate.js
// Outil de calcul mathématique — évalue une expression JS de façon contrôlée.

/**
 * Évalue une expression mathématique.
 * @param {{ expression: string }} params
 * @returns {{ result: number } | { error: string }}
 */
export function calculate({ expression }) {
  try {
    // On autorise uniquement les caractères mathématiques pour éviter l'injection
    if (!/^[\d\s\+\-\*\/\.\(\)\^e%\*\*]+$/i.test(expression)) {
      return { error: `Expression invalide : "${expression}"` };
    }
    const result = Function('"use strict"; return (' + expression + ')')();
    return { result };
  } catch (e) {
    return { error: `Impossible d'évaluer : "${expression}" — ${e.message}` };
  }
}

// Définition de l'outil pour Mistral
export const calculateTool = {
  type: 'function',
  function: {
    name: 'calculate',
    description:
      'Évalue une expression mathématique (addition, multiplication, puissances, etc.). ' +
      'À utiliser pour tout calcul numérique.',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description:
            'Expression mathématique JavaScript valide. ' +
            'Exemples : "17**2", "4**5", "289 + 1024", "(12*9/5)+32"',
        },
      },
      required: ['expression'],
    },
  },
};