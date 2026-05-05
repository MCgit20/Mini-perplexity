import { searchSimilar } from "./src/vectorStore.js";

const run = async () => {
  const question = "Qui a créé Node.js ?";
  
  const results = await searchSimilar(question);

  console.log("Résultats trouvés :\n");

  results.forEach((r) => {
    console.log(
      `Score: ${r.score.toFixed(3)} | ${r.metadata.text}\n`
    );
  });
};

run();