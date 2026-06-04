import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";

const client = new Anthropic();

const SYSTEM_PROMPT =
  "Tu es un assistant pédagogique spécialisé en management et leadership. " +
  "Tu réponds de façon claire, structurée et bienveillante, en utilisant des exemples " +
  "concrets tirés du monde de l'entreprise.";

const PRIX_INPUT_PAR_TOKEN = 0.000001;
const PRIX_OUTPUT_PAR_TOKEN = 0.000004;

function formatCout(montant) {
  return montant.toFixed(6) + " €";
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  const historique = [];
  let echanges = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  console.log("╔" + "═".repeat(58) + "╗");
  console.log("║   🎓 Assistant Pédagogique — Management & Leadership   ║");
  console.log("╚" + "═".repeat(58) + "╝");
  console.log('Tapez "exit" pour quitter.\n');

  while (true) {
    const saisie = await question("Vous : ");

    if (saisie.trim().toLowerCase() === "exit") {
      break;
    }

    if (saisie.trim() === "") {
      continue;
    }

    historique.push({ role: "user", content: saisie });

    let response;
    try {
      response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: historique,
      });
    } catch (err) {
      console.error("\nErreur API :", err.message, "\n");
      historique.pop();
      continue;
    }

    const texteReponse = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    historique.push({ role: "assistant", content: texteReponse });

    echanges++;
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    totalInputTokens += inputTokens;
    totalOutputTokens += outputTokens;

    const coutEchange =
      inputTokens * PRIX_INPUT_PAR_TOKEN +
      outputTokens * PRIX_OUTPUT_PAR_TOKEN;
    const coutCumulé =
      totalInputTokens * PRIX_INPUT_PAR_TOKEN +
      totalOutputTokens * PRIX_OUTPUT_PAR_TOKEN;

    console.log("\nAssistant : " + texteReponse);
    console.log("─".repeat(60));
    console.log(
      `💶 Échange #${echanges} — coût : ${formatCout(coutEchange)}` +
        `  |  cumulé : ${formatCout(coutCumulé)}` +
        `  |  tokens : ${inputTokens}↑ ${outputTokens}↓`
    );
    console.log();
  }

  // Résumé final
  const coutTotal =
    totalInputTokens * PRIX_INPUT_PAR_TOKEN +
    totalOutputTokens * PRIX_OUTPUT_PAR_TOKEN;

  console.log("\n" + "═".repeat(60));
  console.log("📋 Résumé de la session");
  console.log("─".repeat(60));
  console.log(`   Échanges         : ${echanges}`);
  console.log(`   Tokens input     : ${totalInputTokens}`);
  console.log(`   Tokens output    : ${totalOutputTokens}`);
  console.log(`   Tokens total     : ${totalInputTokens + totalOutputTokens}`);
  console.log(`   Coût total       : ${formatCout(coutTotal)}`);
  console.log("═".repeat(60));

  rl.close();
}

main().catch((err) => {
  console.error("Erreur :", err.message);
  process.exit(1);
});
