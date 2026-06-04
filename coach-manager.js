import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";

// ─── Configuration ────────────────────────────────────────────────────────────

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;
const PRIX_INPUT = 0.000001;   // € par token
const PRIX_OUTPUT = 0.000004;  // € par token

const SYSTEM_PROMPT = `Tu es Coach Manager, un assistant de coaching managérial destiné aux managers de TPE (moins de 10 salariés) qui n'ont pas reçu de formation formelle en management.

## Ton rôle
Tu n'es PAS un professeur qui donne des cours. Tu es un COACH qui accompagne par le questionnement. Tu aides le manager à trouver ses propres réponses avant de lui proposer des pistes.

## Processus de coaching à respecter
1. **Explorer d'abord** : pose 1 à 2 questions ouvertes pour comprendre la situation concrète avant de donner le moindre conseil.
2. **Reformuler** : reflète ce que tu as compris pour valider et montrer que tu as bien saisi.
3. **Creuser** : demande ce que le manager a déjà essayé, ce qu'il ressent, ce qu'il voudrait à la place.
4. **Outiller** : propose des outils concrets adaptés à la situation, expliqués simplement.
5. **Plan d'action** : termine chaque séquence par une question du type "Quelle est la première chose que vous pourriez faire dès demain ?"

## Outils à mobiliser selon les situations
- **CNV (Communication Non-Violente)** : pour les conflits et tensions — observation, sentiment, besoin, demande.
- **Feedback SBI** (Situation–Behavior–Impact) : pour formuler un retour constructif sans attaquer la personne.
- **Management situationnel de Hersey-Blanchard** : pour adapter son style au niveau d'autonomie du collaborateur (S1 directif → S2 persuasif → S3 participatif → S4 délégatif).
- **Écoute active** : reformulation, questions ouvertes, silence.
- **Contrat de performance** : clarifier les attentes mutuelles par écrit.

## Règles de communication
- Utilise un langage simple, concret, sans jargon RH inutile.
- Pose UNE seule question à la fois — jamais plusieurs d'un coup.
- Reste bienveillant et sans jugement en toutes circonstances.
- Si la situation décrite est complexe, décompose-la en étapes claires.
- N'invente jamais de détails sur la situation du manager ; travaille uniquement avec ce qu'il te dit.`;

const SALUTATION_INITIALE =
  "Bonjour, je suis votre Coach Manager. " +
  "Décrivez-moi une situation concrète que vous traversez en ce moment avec votre équipe.";

// ─── Utilitaires ──────────────────────────────────────────────────────────────

function formatCout(montant) {
  return montant.toFixed(6) + " €";
}

function afficherBandeau(texte) {
  const largeur = 62;
  const padding = Math.max(0, largeur - texte.length);
  const gauche = Math.floor(padding / 2);
  const droite = padding - gauche;
  console.log("╔" + "═".repeat(largeur) + "╗");
  console.log("║" + " ".repeat(gauche) + texte + " ".repeat(droite) + "║");
  console.log("╚" + "═".repeat(largeur) + "╝");
}

function afficherAssistant(texte) {
  console.log("\n\x1b[36mCoach Manager :\x1b[0m " + texte + "\n");
}

function afficherCout(echange, coutEchange, coutCumulé, inputTokens, outputTokens) {
  console.log(
    "\x1b[2m" +
      `💶 Échange #${echange}` +
      ` — coût : ${formatCout(coutEchange)}` +
      `  |  cumulé : ${formatCout(coutCumulé)}` +
      `  |  tokens : ${inputTokens}↑ ${outputTokens}↓` +
      "\x1b[0m"
  );
}

// ─── Boucle principale ────────────────────────────────────────────────────────

async function main() {
  const client = new Anthropic();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt) =>
    new Promise((resolve) => rl.question(prompt, resolve));

  // État de la session
  const historique = [];
  let echanges = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  // Accueil
  console.log();
  afficherBandeau("🎯  Coach Manager IA  —  Votre espace de coaching");
  console.log('\nTapez \x1b[1m"exit"\x1b[0m à tout moment pour terminer la session.\n');

  // Message d'ouverture (affiché sans appel API, ajouté à l'historique)
  afficherAssistant(SALUTATION_INITIALE);
  historique.push({ role: "assistant", content: SALUTATION_INITIALE });

  // Boucle conversationnelle
  while (true) {
    const saisie = await question("\x1b[33mVous :\x1b[0m ");

    if (saisie.trim().toLowerCase() === "exit") {
      break;
    }

    if (saisie.trim() === "") {
      continue;
    }

    historique.push({ role: "user", content: saisie.trim() });

    let response;
    try {
      response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: historique,
      });
    } catch (err) {
      console.error("\n\x1b[31mErreur API :\x1b[0m", err.message, "\n");
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
      inputTokens * PRIX_INPUT + outputTokens * PRIX_OUTPUT;
    const coutCumulé =
      totalInputTokens * PRIX_INPUT + totalOutputTokens * PRIX_OUTPUT;

    afficherAssistant(texteReponse);
    afficherCout(echanges, coutEchange, coutCumulé, inputTokens, outputTokens);
    console.log();
  }

  // Résumé de session
  const coutTotal =
    totalInputTokens * PRIX_INPUT + totalOutputTokens * PRIX_OUTPUT;

  console.log("\n" + "═".repeat(64));
  console.log("  📋  Résumé de la session");
  console.log("─".repeat(64));
  console.log(`  Échanges           : ${echanges}`);
  console.log(`  Tokens input       : ${totalInputTokens}`);
  console.log(`  Tokens output      : ${totalOutputTokens}`);
  console.log(`  Tokens total       : ${totalInputTokens + totalOutputTokens}`);
  console.log(`  Coût total         : ${formatCout(coutTotal)}`);
  console.log("═".repeat(64) + "\n");

  rl.close();
}

main().catch((err) => {
  console.error("\x1b[31mErreur fatale :\x1b[0m", err.message);
  process.exit(1);
});
