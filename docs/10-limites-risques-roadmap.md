# Limites, risques et roadmap technique

Ce fichier liste les écarts observés dans le code au moment de l'analyse. Il sert de base de priorisation avant stabilisation production.

## Priorité haute

### Règles Firestore incomplètes

`firestore.rules` ne contient qu'un extrait pour `kpis` et référence des helper functions non présentes dans le fichier. Pour une application client-only Firebase, c'est le principal risque de sécurité.

Action recommandée:

- reconstruire les règles complètes pour toutes les collections
- tester avec Firebase Emulator Suite
- couvrir au minimum read/create/update/delete par rôle

### Rôle `superadmin` incohérent

Le code vérifie `user.role === 'superadmin'` dans plusieurs endroits, mais `UserRole` ne contient pas `superadmin`.

Impacts possibles:

- erreurs TypeScript
- logique d'accès difficile à maintenir
- données utilisateurs hors contrat

Action recommandée:

- ajouter `superadmin` à `UserRole` et à `ROLES`, ou remplacer la logique par `admin`/permissions explicites
- aligner `menuItems`, `Settings`, `UserManagement`, `objectiveService`, `adminService`, `userService`

### Types manquants ou désalignés

Exemples observés:

- `integrationService` importe `Integration` depuis `src/types.ts`, mais ce type n'est pas exporté.
- `Planning.tsx` importe `Resource` depuis `src/types.ts`, mais ce type n'est pas exporté.
- des composants départements/utilisateurs importent `Department` depuis `src/types.ts`, mais ce type n'est pas exporté.
- `onboardingService` importe `OnboardingProgress` depuis `src/types.ts`, mais ce type n'est pas exporté.
- plusieurs écrans utilisent des champs `User` non typés: `status`, `phone`, `location`, `jobTitle`, `bio`, `name`.
- `Notification.type` ne contient pas `appraisal`, alors que plusieurs services créent ce type avec `as any`.
- `Report.status` est typé `active | paused | draft`, mais `reportService` écrit `scheduled` et `generated`.
- `Message` est typé avec `authorId/authorName`, mais `messageService.sendMessage` manipule `message.sender.name`.
- `Objective.keyResults` utilise `KeyResult`, mais `objectiveService` référence `kr.current`, champ absent du type.

Action recommandée:

- exécuter `npm run build`
- corriger les contrats dans `src/types.ts`
- supprimer les casts `as any` qui masquent les écarts métier

### Bugs de compilation probables

Écarts spécifiques:

- `supportService.addTicketComment` utilise `arrayUnion` sans l'importer.
- `adminService.updateRole` appelle `db.batch()`, qui n'existe pas avec l'API modulaire Firestore; utiliser `writeBatch(db)`.
- `notificationService.getNotifications(userId, limit = 50)` masque l'import Firestore `limit`, puis appelle `limit(limit)`, ce qui produit une erreur TypeScript.
- `planningService` utilise `limit` sans l'importer.
- `Feedback360.tsx` référence `handleCancelInvitation`, qui n'est pas défini.
- `LucideIcon` est utilisé comme type dans la documentation intégrée alors qu'il est importé comme valeur.

Action recommandée:

- corriger les imports et APIs Firestore
- ajouter une étape CI `npm run lint && npm run build`
- réduire les erreurs `noUnusedLocals/noUnusedParameters`, très nombreuses à cause d'imports React/Lucide et variables non utilisées

## Priorité moyenne

### Source d'autorité des permissions

Les permissions existent dans:

- `src/config/roles.ts`
- `users.permissions`
- `users.customClaims.permissions`
- potentiellement `roles/{roleId}` Firestore

Action recommandée:

- choisir une source d'autorité
- régénérer les permissions utilisateur depuis cette source
- réserver les custom claims aux contrôles côté règles si elles sont réellement écrites via Admin SDK

### Timestamps hétérogènes

Le code mélange `serverTimestamp()`, `Timestamp`, ISO string et `Date`. Les analytics et tris peuvent devenir incohérents.

Action recommandée:

- standardiser `createdAt/updatedAt` en Firestore Timestamp
- convertir côté UI
- migrer progressivement les documents existants

### Chargements non paginés

Plusieurs écrans chargent toutes les données d'une collection. Cela peut devenir coûteux.

Action recommandée:

- ajouter pagination ou lazy loading sur utilisateurs, tâches, projets, objectifs, notifications anciennes et articles support
- filtrer côté Firestore quand possible

### Notifications multi-device

`fcmTokens` semble stocker un token unique. Un utilisateur avec plusieurs navigateurs/appareils peut écraser son token précédent.

Action recommandée:

- stocker un tableau ou une sous-collection `users/{uid}/fcmTokens`
- gérer expiration et suppression des tokens invalides

### Suppression utilisateur Firebase Auth

Un client web ne peut pas administrer tous les comptes Auth avec les privilèges Admin SDK. `adminService.deleteUser` supprime le document Firestore et ne supprime le compte Auth que si l'utilisateur courant est aussi la cible.

Action recommandée:

- déplacer les opérations Auth admin vers Cloud Functions ou un backend sécurisé
- journaliser les suppressions

## Priorité basse

### UI affichée mais non branchée

Exemples:

- 2FA dans Settings
- import/export utilisateurs
- certaines actions de téléchargement/partage planning
- certains écrans API ou Security avec données locales

Action recommandée:

- marquer explicitement comme "à venir" ou implémenter complètement
- éviter les boutons sans action en production

### Documentation intégrée limitée

`src/components/documentation/data` contient une documentation courte et en anglais. Le dossier `docs/` est plus complet, mais il n'est pas synchronisé automatiquement avec l'interface.

Action recommandée:

- soit enrichir la documentation intégrée
- soit afficher les fichiers Markdown de `docs/` dans l'application

### Données de démonstration dans Planning

`Planning.tsx` initialise des événements et ressources d'exemple avant chargement Firestore.

Action recommandée:

- supprimer ou isoler les données sample
- afficher un état vide lorsque Firestore ne retourne rien

## Roadmap proposée

### Phase 1: stabilisation build et types

- corriger `UserRole/superadmin`
- ajouter `Integration`, `Resource`, `Department`, `OnboardingProgress`, `appraisal` notification type
- aligner `User`, `Report.status`, `Message`, `Objective.keyResults`
- corriger `arrayUnion`, `writeBatch`, `limit` et les handlers manquants
- nettoyer les imports/variables inutilisés ou assouplir temporairement `noUnusedLocals` pendant la reprise
- rendre `npm run build` obligatoire en CI

### Phase 2: sécurité Firebase

- écrire les règles complètes
- ajouter tests emulator
- définir la source d'autorité permissions
- déplacer les opérations admin sensibles vers backend/Admin SDK

### Phase 3: données et performance

- standardiser les timestamps
- définir les index Firestore
- ajouter pagination
- réduire les chargements globaux

### Phase 4: expérience produit

- brancher ou masquer les boutons non implémentés
- enrichir la documentation in-app
- ajouter monitoring frontend
- améliorer les workflows de reporting/export
