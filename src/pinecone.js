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