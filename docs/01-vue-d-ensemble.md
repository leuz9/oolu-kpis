# Vue d'ensemble de la plateforme

## Positionnement

Oolu KPIs / OKRFlow est une plateforme web interne de pilotage de performance. Elle centralise la gestion des objectifs, des indicateurs, des projets, des tâches, des équipes, des évaluations annuelles et des tableaux de bord.

Le produit est conçu comme une application opérationnelle pour managers, collaborateurs et administrateurs. Le parcours principal consiste à aligner les objectifs de l'organisation, les mesurer par des KPIs/key results, suivre l'exécution au quotidien et produire des rapports de performance.

## Profils utilisateurs

| Profil | Usage principal |
| --- | --- |
| Collaborateur | Consulter ses objectifs, gérer ses tâches, suivre ses évaluations, recevoir les notifications. |
| Manager / team lead | Suivre objectifs d'équipe, tâches, projets, évaluations des collaborateurs, feedback 360. |
| Directeur | Piloter objectifs départementaux, projets, analytics et reporting. |
| Administrateur | Paramétrer les départements, pays, intégrations, sécurité, analytics, rapports. |
| Superadmin | Gestion avancée des utilisateurs et opérations destructives sensibles selon le code. |

Les rôles typés dans `src/types.ts` sont `admin`, `director`, `manager`, `team_lead`, `senior_employee`, `employee`, `intern` et `external`. Le code référence aussi `superadmin` dans plusieurs écrans et services; cet écart est documenté dans les limites connues.

## Modules principaux

| Module | Route | Description |
| --- | --- | --- |
| Dashboard | `/` | Vue de synthèse des objectifs, key results, équipe et projets. |
| Annual Appraisals | `/appraisals` | Cycles d'évaluation, templates, reviews, analytics et feedback 360. |
| Objectives | `/objectives/*` | Création, filtrage, vue hiérarchique, grille et kanban des objectifs. |
| Key Results / KPIs | `/key-results`, composants `kpis` | Suivi des indicateurs, cibles, tendances, contributeurs et historique. |
| Team | `/team` | Structure d'équipe et informations collaborateurs. |
| Directory | `/directory` | Annuaire utilisateur. |
| Tasks | `/tasks` | Gestion de tâches en liste, grille, kanban, calendrier, analytics et focus mode. |
| Projects | `/projects` | Gestion de projets, filtres, statistiques, détails, tâches liées. |
| Documentation | `/documentation` | Documentation intégrée à l'application, accessible admin-only. |
| Notifications | `/notifications` | Centre de notifications utilisateur. |
| Planning | `/planning` | Événements, calendrier, ressources et comptes rendus d'événements. |
| Settings | `/settings` | Préférences, notifications, sécurité, mot de passe, accès admin selon rôle. |
| User Management | `/users` | Gestion des utilisateurs et affectation pays, réservée superadmin dans l'écran. |
| Analytics | `/analytics` | Indicateurs consolidés par période. |
| Reports | `/reports` | Création et génération de rapports. |
| Security | `/security` | Vue de sécurité applicative. |
| Departments | `/departments` | Administration des départements. |
| Countries | `/countries` | Administration des pays et régions. |
| Integrations | `/integrations` | Configuration des intégrations externes. |
| API | `/api` | Écran de gestion d'API keys côté interface. |
| Support | `/support` ou lien externe | Tickets support et base de connaissance selon composant. |

## Navigation et accès

Le fichier `src/App.tsx` protège les routes avec `PrivateRoute`. Un utilisateur non connecté est redirigé vers `/login`. Certaines routes utilisent `adminOnly` et exigent `user.isAdmin`.

Le menu latéral est défini dans `src/components/Sidebar/menuItems.ts`. Il contient des routes internes et des liens externes vers Google Chat/Gmail Chat pour certains items de communication.

## Parcours fonctionnels clés

### Pilotage OKR

1. Créer des objectifs au niveau entreprise, département ou individuel.
2. Ajouter ou lier des KPIs/key results.
3. Affecter des contributeurs.
4. Mettre à jour la progression.
5. Recalculer la progression parent via les objectifs enfants ou les key results.
6. Consulter les analytics et rapports.

### Exécution projet

1. Créer un projet avec statut, dates, département, pays et membres.
2. Associer des tâches, documents, risques et objectifs.
3. Suivre l'avancement par statut et progression.
4. Filtrer par pays, département, date, statut et présence de tâches.

### Gestion des tâches

1. Créer une tâche avec priorité, statut, échéance et assigné.
2. Visualiser en kanban, liste, grille, calendrier ou analytics.
3. Utiliser les filtres rapides: mes tâches, urgent, échéance du jour, retard, terminées.
4. Ajouter commentaires et sous-tâches.
5. Notifier l'assigné lors de création ou mise à jour.

### Évaluations annuelles

1. Créer un cycle d'évaluation.
2. Créer ou sélectionner un template.
3. Générer des évaluations pour les employés.
4. Collecter self-review, manager-review, hr-review selon le template.
5. Calculer la note globale.
6. Ajouter feedback 360, objectifs et compétences.
7. Suivre la complétion dans le dashboard et les analytics.

## Sources de vérité

La base de données Firestore est la source de vérité applicative. Le frontend n'appelle pas d'API backend dédiée dans ce dépôt; les services TypeScript utilisent directement le SDK Firebase côté client.

Les contrats de données sont centralisés dans `src/types.ts`, mais certains modules définissent aussi des types locaux, par exemple `Country` dans `countryService.ts` ou des types d'interface propres aux composants.
