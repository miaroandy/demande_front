# Guichet — front React

Interface du suivi des demandes d’intervention. Trois écrans : liste filtrée, création, détail avec le workflow de statuts.

L’API attendue est celle du sujet : `GET/POST /api/demandes` et `PATCH /api/demandes/{id}/statut`. En développement, Vite proxifie `/api` vers `http://localhost:5000`.

## Prérequis

- Node.js 20 ou plus
- L’API .NET sur le port 5000, ou le mode démonstration ci-dessous

## Lancer avec l’API

```bash
npm install
npm run dev
```

Front : http://localhost:5173

## Lancer sans API

Le mode démonstration rejoue le contrat HTTP en mémoire (mêmes statuts, mêmes refus).

```bash
npm install
npm run dev:mock
```

## Vérifier

```bash
npm test
npm run build
```

## Choix

- React, Vite, TypeScript
- TanStack Query pour le chargement, le cache et les mutations
- Zod pour la validation du formulaire et le contrôle de la réponse API
- Les transitions autorisées sont dans `src/domain/transitions.ts` : les boutons impossibles ne s’affichent pas. Le refus définitif reste celui de l’API (`400`, `404`, `409`), affiché tel quel.
- Pas de bibliothèque UI : le style est dans `src/styles/global.css`

Les données, le statut initial et les dates viennent du serveur. Le formulaire n’envoie que titre, description, catégorie, priorité et auteur.
