// phase6.js
import { getEmbedding } from './src/mistral.js';
import { simpleChunk, upsertChunks } from './src/pinecone.js';

const docTest = `
Node.js est un environnement d'exécution JavaScript côté serveur, créé par Ryan Dahl en 2009. 
Il utilise le moteur V8 de Google Chrome pour exécuter du JavaScript hors du navigateur. 
Node.js est particulièrement performant pour les applications I/O-intensives grâce à son modèle non-bloquant.
La dernière version LTS offre des performances accrues et une meilleure gestion de la mémoire.
`;

async function main() {
  console.log("🚀 Début de l'indexation...");

  // 1. Découpage
  const chunks = simpleChunk(docTest, 20);
  console.log(`--- ${chunks.length} chunks créés.`);

  // 2. Génération des embeddings
  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`--- Embedding chunk ${i}...`);
    const values = await getEmbedding(chunks[i]);
    
    vectors.push({
      id: `chunk-${i}-${Date.now()}`, // ID unique
      values: values,
      metadata: { text: chunks[i] }   // On stocke le texte pour le relire plus tard
    });
  }

  // 3. Envoi à Pinecone
  console.log("--- Envoi à Pinecone...");
  const result = await upsertChunks(vectors);
  
  console.log("✅ Succès !", result);
}

main().catch(console.error);