# Documentation Oolu KPIs / OKRFlow

Dernière analyse du code: 2026-06-13.

Ce dossier documente la plateforme telle qu'elle existe dans ce dépôt. Il couvre les usages fonctionnels, l'architecture React/Firebase, le modèle de données Firestore, les services applicatifs, la sécurité, l'exploitation et les points d'attention relevés dans le code.

## Carte de la documentation

| Fichier | Contenu |
| --- | --- |
| [01-vue-d-ensemble.md](./01-vue-d-ensemble.md) | Objectif de la plateforme, utilisateurs, périmètre fonctionnel, navigation. |
| [02-architecture-technique.md](./02-architecture-technique.md) | Stack, organisation du frontend, providers, routage, Firebase, flux applicatifs. |
| [03-installation-configuration-deploiement.md](./03-installation-configuration-deploiement.md) | Prérequis, variables d'environnement, commandes npm, build, Firebase Hosting. |
| [04-authentification-securite-permissions.md](./04-authentification-securite-permissions.md) | Authentification, rôles, permissions, routes privées, règles Firestore et limites. |
| [05-modules-fonctionnels.md](./05-modules-fonctionnels.md) | Guide métier par module: objectifs, KPIs, tâches, projets, évaluations, planning, support, etc. |
| [06-modele-donnees-firestore.md](./06-modele-donnees-firestore.md) | Collections Firestore, champs principaux, relations, index probables. |
| [07-services-et-flux-de-donnees.md](./07-services-et-flux-de-donnees.md) | Services TypeScript, méthodes exposées, flux CRUD, listeners temps réel, notifications. |
| [08-guide-developpement.md](./08-guide-developpement.md) | Conventions, structure du code, ajout d'un module, patterns UI/services. |
| [09-exploitation-maintenance.md](./09-exploitation-maintenance.md) | Observabilité, sauvegardes, données, maintenance Firebase, gestion de version. |
| [10-limites-risques-roadmap.md](./10-limites-risques-roadmap.md) | Écarts constatés, risques techniques, priorités de correction. |

## Résumé rapide

La plateforme est une SPA React 18 + TypeScript construite avec Vite. Elle utilise Firebase côté client pour l'authentification, Firestore, Analytics, Firebase Cloud Messaging et l'hébergement. Le domaine principal est le pilotage de performance: objectifs, KPIs/key results, projets, tâches, équipes, évaluations annuelles, reporting et analytics.

Les sources principales sont:

- `src/App.tsx`: routage et protection des routes.
- `src/contexts/AuthContext.tsx`: session Firebase Auth et profil utilisateur Firestore.
- `src/contexts/NotificationContext.tsx`: notifications utilisateur en temps réel.
- `src/services/*.ts`: couche d'accès Firestore.
- `src/types.ts`: contrats TypeScript partagés.
- `src/config/roles.ts`: matrice des rôles et permissions.
- `src/config/firebase.ts`: initialisation Firebase.

## Commandes usuelles

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Notes importantes

Cette documentation distingue le comportement prévu et le comportement effectivement visible dans le code. Les points qui semblent incomplets ou incohérents sont listés dans [10-limites-risques-roadmap.md](./10-limites-risques-roadmap.md) pour éviter de les confondre avec des fonctionnalités stabilisées.
