// phase5.js
// Test de connexion à Pinecone — vérifie que les variables d'environnement sont correctes
import { getIndexInfo } from './src/pinecone.js';

async function main() {
  console.log("--- Connexion à Pinecone... ---");
  
  try {
    const info = await getIndexInfo();
    
    console.log("✅ Index connecté avec succès !");
    console.table({
      Nom: info.name,
      Dimension: info.dimension,
      Métrique: info.metric,
      Statut: info.status.ready ? "Prêt" : "En attente",
      Host: info.host
    });

  } catch (error) {
    console.error("❌ Échec de la connexion :");
    console.error(error.message);
  }
}

main();