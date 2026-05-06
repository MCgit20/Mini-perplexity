// src/tools/rag.js
// Outil RAG — embed la query avec Mistral, interroge Pinecone, retourne les chunks.
// Réutilise getEmbedding() et searchSimilar() déjà écrits dans src/pinecone.js

import { getEmbedding, searchSimilar } from '../pinecone.js';

/**
 * Recherche sémantique dans le corpus privé indexé dans Pinecone.
 * @param {{ query: string }} params
 * @returns {Promise<Array<{score: number, text: string}> | { error: string }>}
 */
export async function rag_search({ query }) {
  try {
    const matches = await searchSimilar(query, 3);

    if (!matches || matches.length === 0) {
      return { message: 'Aucun document pertinent trouvé dans le corpus privé.' };
    }

    return matches.map((m) => ({
      score: parseFloat(m.score.toFixed(3)),
      text: m.metadata.text,
    }));
  } catch (e) {
    return { error: `Erreur RAG : ${e.message}` };
  }
}

// Définition de l'outil pour Mistral
export const ragTool = {
  type: 'function',
  function: {
    name: 'rag_search',
    description:
      'Cherche des informations dans la base de documents internes indexée (corpus privé). ' +
      'À utiliser pour des questions sur le contenu du corpus, la documentation interne, ' +
      "ou quand web_search ne retourne pas de résultats pertinents. " +
      "Ne pas utiliser pour la météo ou les calculs.",
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'La requête de recherche sémantique, reformulée si besoin.',
        },
      },
      required: ['query'],
    },
  },
};