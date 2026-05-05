import { getEmbedding } from "./mistral.js";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST;

export async function searchSimilar(question, topK = 3) {
  try {
    // 1. Embedding de la question
    const vector = await getEmbedding(question);

    // 2. Requête Pinecone
    const response = await fetch(`${PINECONE_INDEX_HOST}/query`, {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector,
        topK,
        includeMetadata: true,
      }),
    });

    const data = await response.json();

    // 3. Format des résultats
    const results = data.matches.map((match) => ({
      score: match.score,
      metadata: match.metadata,
    }));

    return results;
  } catch (error) {
    console.error("Erreur searchSimilar:", error);
    return [];
  }
}