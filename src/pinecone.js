// src/pinecone.js

/**
 * Récupère les informations de l'index pour vérifier la connexion.
 * Utilise l'API de contrôle (api.pinecone.io)
 */
export async function getIndexInfo() {
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX_NAME;

  const response = await fetch(`https://api.pinecone.io/indexes/${indexName}`, {
    method: 'GET',
    headers: {
      'Api-Key': apiKey,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Pinecone : ${error}`);
  }

  return await response.json();
}

export function simpleChunk(text, maxWords = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
  }
  return chunks;
}

export async function upsertChunks(vectors) {
  const host = process.env.PINECONE_INDEX_HOST;
  const apiKey = process.env.PINECONE_API_KEY;

  const response = await fetch(`${host}/vectors/upsert`, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ vectors })
  });

  return await response.json();
}

/**
 * Génère un embedding vectoriel via l'API Mistral.
 * @param {string} text - Texte à embédder
 * @returns {Promise<number[]>} - Vecteur de 1024 dimensions
 */
export async function getEmbedding(text) {
  const apiKey = process.env.MISTRAL_API_KEY;

  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'mistral-embed',
      input: [text]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur embedding Mistral : ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

/**
 * Embed une question et retourne les chunks les plus proches dans Pinecone.
 * @param {string} question - La question à rechercher
 * @param {number} topK     - Nombre de résultats à retourner
 * @returns {Promise<Array<{ score: number, metadata: { text: string } }>>}
 */
export async function searchSimilar(question, topK = 3) {
  const host = process.env.PINECONE_INDEX_HOST;
  const apiKey = process.env.PINECONE_API_KEY;

  const vector = await getEmbedding(question);

  const response = await fetch(`${host}/query`, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      vector,
      topK,
      includeMetadata: true
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Pinecone query : ${error}`);
  }

  const data = await response.json();
  return data.matches; // [{ id, score, metadata: { text } }]
}