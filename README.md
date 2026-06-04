# Assistant Pédagogique — Claude Haiku 4.5

Script Node.js qui interroge Claude Haiku 4.5 en tant qu'assistant pédagogique spécialisé en management et leadership.

## Prérequis

- Node.js 18 ou supérieur
- Une clé API Anthropic

## Installation

```bash
npm install
```

## Configuration

Exportez votre clé API Anthropic dans votre terminal :

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Ou créez un fichier `.env` (non versionné) avec :

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Lancement

```bash
node index.js
```

## Ce que fait le script

1. Envoie la question *"Quelle est la différence entre leadership et management ? Donne-moi 3 exemples concrets."* au modèle `claude-haiku-4-5-20251001`
2. Affiche la réponse dans le terminal
3. Affiche le nombre de tokens consommés (input et output)
4. Calcule et affiche le coût estimé en euros :
   - Input : 0,000001 € / token
   - Output : 0,000004 € / token
