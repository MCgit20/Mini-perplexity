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