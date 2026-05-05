import { getEmbedding } from "../mistral.js";

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_HOST = process.env.PINECONE_INDEX_HOST;

export const ragTool = {
  type: "function",
  function: {
    name: "rag_search",
    description:
      "Cherche dans le corpus privé indexé (Pinecone). À utiliser pour des questions sur la documentation interne.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Requête de recherche sémantique",
        },
      },
      required: ["query"],
    },
  },
};

export async function rag_search({ query }) {
  try {
    // 1. embedding de la query
    const vector = await getEmbedding(query);

    // 2. requête Pinecone
    const res = await fetch(`${PINECONE_INDEX_HOST}/query`, {
      method: "POST",
      headers: {
        "Api-Key": PINECONE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector,
        topK: 3,
        includeMetadata: true,
      }),
    });

    const data = await res.json();

    // 3. format propre
    return data.matches.map((m) => ({
      score: m.score,
      text: m.metadata?.text,
    }));
  } catch (err) {
    console.error("rag_search error:", err);
    return [{ score: 0, text: "Erreur lors de la recherche RAG" }];
  }
}