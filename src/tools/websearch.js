// src/tools/websearch.js
// Outil de recherche web — DuckDuckGo Instant Answers (gratuit, sans clé API)

/**
 * Recherche des informations sur le web via DuckDuckGo.
 * @param {{ query: string }} params
 * @returns {Promise<Array<{text: string, url: string}> | { message: string }>}
 */
export async function web_search({ query }) {
  try {
    const url =
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}` +
      `&format=json&no_html=1&skip_disambig=1`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'mini-perplexity/1.0' },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();

    // Collecter les résultats depuis RelatedTopics (entrées avec .Text)
    const results = (data.RelatedTopics ?? [])
      .filter((t) => t.Text && t.FirstURL)
      .slice(0, 5)
      .map((t) => ({ text: t.Text, url: t.FirstURL }));

    // Fallback sur AbstractText si RelatedTopics est vide
    if (results.length === 0 && data.AbstractText) {
      return [{ text: data.AbstractText, url: data.AbstractURL ?? '' }];
    }

    if (results.length === 0) {
      return { message: `Aucun résultat trouvé pour "${query}". Essaie une reformulation.` };
    }

    return results;
  } catch (e) {
    return { error: `Erreur lors de la recherche : ${e.message}` };
  }
}

// Définition de l'outil pour Mistral
export const webSearchTool = {
  type: 'function',
  function: {
    name: 'web_search',
    description:
      'Recherche des informations récentes ou factuelles sur le web via DuckDuckGo. ' +
      'À utiliser pour : actualités, versions logicielles, événements récents, ' +
      'faits vérifiables. Ne pas utiliser pour des calculs ou la météo.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Requête de recherche en français ou anglais. ' +
            'Ex : "dernière version Node.js", "vainqueur Coupe du Monde 2022"',
        },
      },
      required: ['query'],
    },
  },
};