# Coach Manager IA — Prototype terminal

Ce dossier contient le **prototype terminal** de Coach Manager IA, un assistant de coaching managérial destiné aux managers de TPE (moins de 10 salariés) qui n'ont pas reçu de formation formelle en management.

## Ce que c'est

Un script Node.js conversationnel qui tourne dans le terminal et incarne un coach manager IA. Le coach accompagne par le questionnement (méthode CNV, feedback SBI, management situationnel de Hersey-Blanchard…) plutôt que par des cours magistraux.

Il a servi de **banc d'essai** pour valider :
- le system prompt et la posture de coaching
- la boucle conversationnelle avec historique de session
- le modèle `claude-haiku-4-5-20251001` (Anthropic SDK)
- le suivi des coûts par échange (tokens input/output, cumul en €)

## Application web

Le prototype a évolué vers une application web complète, déployée ici :

**[https://coach-manager-web.vercel.app](https://coach-manager-web.vercel.app)**

## Lancer le prototype

```bash
npm install
export ANTHROPIC_API_KEY="sk-ant-..."
node coach-manager.js
```

Tapez `exit` pour terminer la session et afficher le résumé (tokens consommés, coût total).

## Fichiers

| Fichier | Rôle |
|---|---|
| `coach-manager.js` | Chatbot coaching — boucle conversationnelle complète |
| `index.js` | Script one-shot initial (question unique, pas de conversation) |
