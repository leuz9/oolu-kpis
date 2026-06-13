# Authentification, sécurité et permissions

## Authentification

L'authentification repose sur Firebase Auth. Le contexte `AuthProvider` expose:

| Méthode | Rôle |
| --- | --- |
| `login(email, password)` | Connexion via email/password puis mise à jour de `lastLogin`. |
| `register(email, password, displayName)` | Création Firebase Auth, mise à jour du profil Auth, création du document `users/{uid}`. |
| `logout()` | Mise à jour de `lastSeen`, déconnexion Firebase Auth et nettoyage de l'état local. |
| `updateUserProfile(data)` | Mise à jour du document utilisateur et du profil Firebase Auth pour nom/photo. |
| `changePassword(currentPassword, newPassword)` | Réauthentification puis mise à jour du mot de passe. |

Le profil applicatif est stocké dans Firestore, collection `users`. Sans document utilisateur correspondant, `AuthProvider` met `user` à `null`.

## Routes privées

`PrivateRoute` dans `src/App.tsx` applique deux niveaux:

| Niveau | Condition | Effet si refusé |
| --- | --- | --- |
| Utilisateur connecté | `user !== null` | Redirection vers `/login`. |
| Admin-only | `user.isAdmin === true` | Redirection vers `/`. |

Routes admin-only dans le routage principal:

- `/projects`
- `/documentation`
- `/users`
- `/analytics`
- `/reports`
- `/security`
- `/departments`
- `/countries`
- `/integrations`
- `/api`

Certains composants appliquent des contrôles supplémentaires. Par exemple, l'écran `/users` exige `user.role === 'superadmin'`.

## Rôles applicatifs

Les rôles typés sont définis dans `src/types.ts`:

```ts
admin | director | manager | team_lead | senior_employee | employee | intern | external
```

Les permissions sont définies dans `RolePermissions` et configurées dans `src/config/roles.ts`.

Catégories de permissions:

- User Management
- Team Management
- Project Management
- Objective Management
- KPI Management
- Report & Analytics
- Document Management
- Communication & Collaboration
- System Administration
- Security & Compliance
- Workflow & Automation
- Resource Management
- Financial Management
- Training & Development
- Quality Management

## Fonctions utilitaires de rôles

`src/config/roles.ts` expose:

| Fonction | Usage |
| --- | --- |
| `getRoleByLevel(level)` | Retrouver un rôle par niveau hiérarchique. |
| `getRoleById(id)` | Retrouver la configuration d'un rôle. |
| `hasPermission(role, permission)` | Vérifier une permission pour un rôle. |
| `canManageRole(managerRole, targetRole)` | Vérifier si un rôle peut gérer un autre rôle. |

## Création utilisateur

Lors d'une inscription:

1. Firebase Auth crée le compte.
2. `updateProfile` définit le `displayName`.
3. `userService.createUser` crée `users/{uid}`.
4. Le rôle par défaut est `employee`.
5. Les permissions sont copiées depuis `ROLES.employee.permissions`.

## Administration utilisateur

Deux services manipulent les utilisateurs:

- `userService`: opérations profil et lien utilisateur/membre d'équipe.
- `adminService`: listing, update, suppression et update de rôle.

Le code protège explicitement les utilisateurs `superadmin` contre modification ou suppression. Cependant `superadmin` n'est pas dans le type `UserRole`, ce qui doit être corrigé ou documenté comme convention de données externe.

## Règles Firestore

Le fichier `firestore.rules` présent dans le dépôt ne contient qu'un extrait pour la collection `kpis` et des commentaires `keep existing helper functions`. Il n'est pas suffisant comme jeu de règles complet.

Extrait actuel:

```js
match /kpis/{kpiId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn() && (hasPermission('canCreateKPIs') || isAdmin());
  allow update: if isSignedIn() && (hasPermission('canEditKPIs') || isAdmin());
  allow delete: if isSignedIn() && (hasPermission('canDeleteKPIs') || isAdmin());
}
```

## Recommandation de sécurité Firestore

Les règles doivent couvrir toutes les collections utilisées:

- `users`
- `roles`
- `objectives`
- `kpis`
- `projects`
- `tasks`
- `team`
- `departments`
- `countries`
- `notifications`
- `settings`
- `appraisal_cycles`
- `appraisal_templates`
- `appraisals`
- `appraisal_responses`
- `feedback_360`
- `events`
- `resources`
- `event_reports`
- `channels`
- `messages`
- `typing`
- `reports`
- `integrations`
- `support_tickets`
- `support_articles`
- `onboarding_progress`

Les contrôles côté frontend ne remplacent pas les règles Firestore. Toute action sensible doit être protégée côté règles, en particulier la suppression d'utilisateurs, la mise à jour des rôles, les évaluations RH et les données pays/départements.

## Notifications et permissions navigateur

`notificationService.initializeFCM()`:

1. Vérifie le support Firebase Messaging.
2. Vérifie l'API navigateur `Notification`.
3. Demande la permission si nécessaire.
4. Enregistre le service worker `/firebase-messaging-sw.js`.
5. Récupère un token FCM avec `VITE_FIREBASE_VAPID_KEY`.
6. Stocke le token dans `users/{uid}`.
7. Configure un handler de messages foreground.

## Points de vigilance sécurité

- Plusieurs opérations sensibles reposent sur le rôle stocké dans Firestore côté client.
- Les règles Firestore ne sont pas complètes dans le dépôt.
- La suppression Firebase Auth dans `adminService.deleteUser` ne supprime que l'utilisateur courant si son UID correspond à la cible; un client web ne peut pas supprimer arbitrairement d'autres comptes Auth sans backend Admin SDK.
- Les tokens FCM sont stockés dans un champ `fcmTokens` qui semble être une valeur unique, pas une liste multi-device.
- Les permissions sont dupliquées entre `customClaims`, `permissions` Firestore et `config/roles.ts`; il faut définir une source d'autorité.
