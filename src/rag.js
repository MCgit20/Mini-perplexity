import { getEmbedding, chatCompletion } from "./mistral.js";
import { searchSimilar } from "./vectorStore.js";

export async function ragQuery(question) {
  try {
    // 1. Retrieval
    const results = await searchSimilar(question, 3);

    // 2. Debug (IMPORTANT)
    console.log("\n=== CONTEXTE RÉCUPÉRÉ ===\n");

    results.forEach((r) => {
      console.log(`[${r.score.toFixed(3)}] ${r.metadata.text}\n`);
    });

    // 3. Construction du contexte
    const context = results
      .map((r) => r.metadata.text)
      .join("\n\n");

    // 4. Prompt (TRÈS IMPORTANT)
    const messages = [
      {
        role: "system",
        content: `
Tu es un assistant RAG strict.

Règles :
- Réponds UNIQUEMENT avec les informations du contexte
- Si l'information n'est pas présente, dis clairement :
  "Je ne trouve pas l'information dans le contexte fourni"
- Ne fais aucune supposition
- Sois précis et concis
        `,
      },
      {
        role: "user",
        content: `Contexte:\n${context}\n\nQuestion: ${question}`,
      },
    ];

    // 5. Génération
    const raw = await chatCompletion(messages);

// support des 2 cas (texte direct OU réponse brute)
    const answer =
        typeof raw === "string"
        ? raw
        : raw?.choices?.[0]?.message?.content;

return answer;
    } catch (error) {
        console.error("Erreur dans ragQuery:", error);
        return "Désolé, une erreur est survenue lors de la récupération de l'information.";
        } 
}