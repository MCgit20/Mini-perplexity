import { ragQuery } from "./src/rag.js";

const run = async () => {
  const question = "Qui a créé Node.js et quand ?";

  console.log("\n=== QUESTION ===\n");
  console.log(question);

  const answer = await ragQuery(question);

  console.log("\n=== RÉPONSE ===\n");
  console.log(answer);
};

run();