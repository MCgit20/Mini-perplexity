// src/mistral.js
// Wrapper léger autour de l'API Mistral (chat + embeddings)

const MISTRAL_API_URL = 'https://api.mistral.ai/v1';

function getKey() {
  const key = process.env.MISTRAL_API_KEY;
  if (!key) throw new Error('MISTRAL_API_KEY manquante dans .env');
  return key;
}

/**
 * Appel au modèle de chat Mistral.
 * @param {Array}  messages   - Tableau de messages { role, content }
 * @param {Array}  tools      - Définitions d'outils (optionnel)
 * @param {string} model      - Modèle à utiliser
 * @returns {Promise<Object>} - Réponse brute de l'API
 */
export async function chatCompletion(
  messages,
  tools = [],
  model = 'mistral-small-latest'
) {
  const body = {
    model,
    messages,
    ...(tools.length > 0 && { tools, tool_choice: 'auto' }),
  };

  const res = await fetch(`${MISTRAL_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral chat error ${res.status}: ${err}`);
  }

  return res.json();
}

/**
 * Génère un embedding vectoriel pour un texte.
 * @param {string} text - Texte à embédder
 * @returns {Promise<number[]>} - Vecteur de 1024 dimensions
 */
export async function getEmbedding(text) {
  const res = await fetch(`${MISTRAL_API_URL}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getKey()}`,
    },
    body: JSON.stringify({
      model: 'mistral-embed',
      input: [text],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral embedding error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}