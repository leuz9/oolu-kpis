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
VITE_FIREBASE_AUTH_DOMAIN=okrs.oolu.energy
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_MICROSOFT_TENANT_ID=a7b0a2fa-f9a2-41fe-9e4a-bdaa847f35f9
VITE_MICROSOFT_ALLOWED_DOMAIN=igniteaccess.com
VITE_GOOGLE_ALLOWED_DOMAIN=ignite.solar
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

La plateforme prend aussi en charge deux fournisseurs SSO:

- Microsoft Entra, limité au tenant configuré et au domaine `igniteaccess.com`.
- Google Workspace, limité au domaine `ignite.solar`.

#### Microsoft Entra

> Etat de production : l'application Entra `OKRFlow Production` est configuree en mono-tenant et le fournisseur Firebase `microsoft.com` est actif. Le secret Entra actuel expire le 20 mars 2027 et doit etre renouvele avant cette date dans Entra puis dans Firebase Authentication.

1. Créer une App Registration mono-tenant dans Microsoft Entra.
2. Ajouter les deux URI de redirection Web:
   - `https://okrs.oolu.energy/__/auth/handler` pour le domaine d'authentification de production;
   - `https://oolusolar-9f574.firebaseapp.com/__/auth/handler` comme callback Firebase de compatibilite.
3. Créer un client secret et le saisir uniquement dans Firebase Console, jamais dans `.env`.
4. Dans Firebase Console > Authentication > Sign-in method, activer Microsoft avec le client ID et le secret.
5. Renseigner l'identifiant du tenant dans `VITE_MICROSOFT_TENANT_ID`.

#### Google Workspace

1. Dans Firebase Console > Authentication > Sign-in method, activer Google.
2. Sélectionner l'adresse de support du projet.
3. Dans le client OAuth Web Google Cloud, autoriser l'URI de redirection `https://okrs.oolu.energy/__/auth/handler` afin que l'ecran Google affiche le domaine applicatif et non le domaine technique Firebase.
4. Vérifier dans Google Workspace que les utilisateurs `ignite.solar` sont autorisés à utiliser l'application OAuth.
5. Le paramètre OAuth `hd=ignite.solar` améliore la sélection du compte, mais l'application valide également le domaine après authentification.

#### Domaines autorisés

Dans Firebase Console > Authentication > Settings > Authorized domains, ajouter:

- `okrs.oolu.energy`
- les domaines locaux utilisés pour les tests, par exemple `localhost`

Le domaine `oolusolar-9f574.firebaseapp.com` doit rester autorisé pour le callback Firebase.

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
