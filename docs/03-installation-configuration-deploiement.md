# Installation, configuration et déploiement

## Prérequis

- Node.js compatible avec Vite 5 et TypeScript 5.
- npm, car le dépôt contient `package-lock.json`.
- Un projet Firebase configuré avec Auth, Firestore, Analytics, Messaging si les notifications push sont utilisées, et Hosting pour le déploiement.

## Installation locale

```bash
npm install
```

## Variables d'environnement

Créer un fichier `.env` à partir de `.env.example`.

```bash
cp .env.example .env
```

Variables attendues:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Le service de notifications utilise aussi `VITE_FIREBASE_VAPID_KEY` dans `notificationService.ts`. Cette variable n'est pas présente dans `.env.example` au moment de l'analyse; l'ajouter si Firebase Cloud Messaging Web Push est activé.

## Développement local

```bash
npm run dev
```

Vite démarre un serveur local. L'application communique directement avec Firebase selon les variables `.env`.

## Qualité et build

```bash
npm run lint
npm run build
```

`npm run build` exécute automatiquement:

1. `node scripts/generate-version.cjs`
2. `vite build`
3. `cp public/version.json dist/version.json`

## Preview locale du build

```bash
npm run preview
```

## Déploiement Firebase Hosting

Le fichier `firebase.json` configure l'hébergement depuis `dist`.

Déploiement typique:

```bash
npm run build
firebase deploy --only hosting
```

Si les règles Firestore sont maintenues dans ce dépôt:

```bash
firebase deploy --only firestore:rules
```

## Configuration Firebase à vérifier

### Authentication

Activer au minimum le provider email/password, car `AuthContext` utilise:

- `createUserWithEmailAndPassword`
- `signInWithEmailAndPassword`
- `updatePassword`
- `reauthenticateWithCredential`

### Firestore

Créer les collections nécessaires automatiquement par écriture côté client ou via scripts d'initialisation. Les collections sont listées dans [06-modele-donnees-firestore.md](./06-modele-donnees-firestore.md).

### Cloud Messaging

Pour les notifications push navigateur:

1. Créer une Web Push certificate key dans Firebase.
2. Exposer la clé publique via `VITE_FIREBASE_VAPID_KEY`.
3. Vérifier que `public/firebase-messaging-sw.js` est compatible avec la configuration Firebase réelle.
4. Tester les permissions navigateur sur HTTPS ou localhost.

### Hosting cache

La configuration actuelle est adaptée à une SPA:

- HTML et version JSON sans cache.
- Assets avec cache long.
- Réécriture de toutes les routes vers `index.html`.

## Données initiales recommandées

Pour un environnement neuf, préparer au minimum:

- Un utilisateur administrateur ou superadmin cohérent avec les règles d'accès de l'application.
- Les départements de base.
- Les pays actifs.
- Les rôles et permissions si la collection `roles` est utilisée en plus de `src/config/roles.ts`.
- Un ou plusieurs templates d'évaluation annuelle.

## Environnements

Recommandation:

| Environnement | Usage |
| --- | --- |
| local | Développement individuel, Firebase projet dev. |
| staging | Validation métier, données anonymisées. |
| production | Données réelles, règles Firestore strictes, sauvegardes actives. |

Chaque environnement devrait avoir son propre projet Firebase et ses propres variables `.env`.
