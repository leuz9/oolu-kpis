# Modules fonctionnels

## Dashboard

Route: `/`

Le dashboard charge en parallèle:

- objectifs via `objectiveService.getObjectives()`
- key results/KPIs via `kpiService.getKPIs()`
- équipe via `teamService.getTeamMembers()`
- projets via `projectService.getProjects()`

Indicateurs affichés:

- progression globale moyenne des objectifs
- volume et santé des key results
- nombre de membres d'équipe actifs
- état des projets: terminés, en cours, en pause, à risque

## Objectifs

Route: `/objectives/*`

Fonctions principales:

- création d'objectifs entreprise, département et individuels
- édition, archivage et suppression selon rôle
- vue grille, hiérarchie et kanban
- filtres par statut, niveau, département, contributeur et recherche
- progression calculée depuis enfants ou key results
- historique de progression
- notifications lors de mises à jour importantes

Statuts d'objectif:

- `on-track`
- `at-risk`
- `behind`
- `archived`

Niveaux d'objectif:

- `company`
- `department`
- `individual`

## KPIs / Key Results

Routes/composants:

- `/key-results`
- `src/components/kpis`

Fonctions principales:

- création et édition de KPI/key result
- cible, valeur courante, unité, fréquence, catégorie
- statut calculé selon la cible
- tendance `up`, `down`, `stable`
- historique de valeurs
- liaison à un ou plusieurs objectifs
- contributeurs

Fréquences supportées:

- `daily`
- `weekly`
- `monthly`
- `quarterly`
- `yearly`

Catégories visibles dans les formulaires:

- Revenue
- Customer
- Operations
- People
- Finance
- Product
- Quality
- Marketing

## Projets

Route: `/projects`

Fonctions principales:

- création, édition et suppression de projets
- dates de début et échéance
- statut, progression, département, pays
- membres d'équipe
- objectifs liés
- tâches, risques et documents dans le modèle
- filtres par recherche, statut, pays, département, progression, date et présence de tâches
- statistiques de portefeuille

Statuts projet:

- `planning`
- `in-progress`
- `on-hold`
- `completed`
- `cancelled`

## Tâches

Route: `/tasks`

Fonctions principales:

- création, édition, suppression
- assignation utilisateur
- priorité et statut
- vues liste, grille, kanban, calendrier, analytics
- focus mode
- quick actions via raccourcis clavier
- filtres par statut, priorité, assigné, département, projet, pays, retard, "mes tâches"
- actions en masse
- commentaires et sous-tâches
- notifications à l'assigné

Statuts tâche:

- `todo`
- `in-progress`
- `review`
- `done`
- `blocked`

Priorités:

- `low`
- `medium`
- `high`
- `urgent`

## Évaluations annuelles

Route: `/appraisals/*`

Vues internes:

- dashboard
- cycles
- appraisals
- templates
- analytics
- feedback360

Fonctions principales:

- cycles d'évaluation avec statut et période
- templates avec sections/questions pondérées
- génération d'évaluations en masse pour des employés
- self-review, manager-review et HR-review
- calcul de note globale depuis les réponses numériques
- objectifs et compétences d'évaluation
- import des objectifs d'un employé comme objectifs d'évaluation
- feedback 360
- analytics par cycle

Statuts appraisal:

- `draft`
- `self-review`
- `manager-review`
- `hr-review`
- `completed`
- `cancelled`

Types de review de template:

- `self`
- `manager`
- `both`

## Team et Directory

Routes:

- `/team`
- `/directory`

`teamService` manipule la collection `team` et `userService` manipule la collection `users`.

Les membres d'équipe ont:

- utilisateur lié
- nom/email/rôle/département
- statut
- utilisation
- compétences
- manager et reports

## User Management

Route: `/users`

Fonctions visibles:

- listing utilisateur
- recherche
- filtre par rôle, département, statut
- édition utilisateur
- suppression
- actions en masse: activer, désactiver, supprimer
- affectation pays
- boutons import/export actuellement non implémentés dans l'interface

L'écran exige `user.role === 'superadmin'`.

## Settings

Route: `/settings`

Sections:

- gestion utilisateurs et rôles si superadmin
- paramètres de notification
- sécurité: 2FA affiché, changement de mot de passe effectif
- préférences: langue et dark mode affichés

Le changement de mot de passe est réellement branché à Firebase Auth. La 2FA et certaines préférences semblent être des éléments UI à finaliser.

## Planning

Route: `/planning`

Fonctions principales:

- affichage liste ou calendrier
- création d'événement
- filtre type/recherche
- navigation par date
- statut et priorité
- ressources
- compte rendu d'événement avec décisions et actions

Le composant initialise des exemples statiques puis les remplace par Firestore via `planningService.getEvents()` et `planningService.getResources()`.

## Notifications

Route: `/notifications`

Fonctions principales:

- notifications temps réel par utilisateur
- compteur non lu
- marquer une notification comme lue
- tout marquer comme lu
- supprimer une notification
- supprimer les notifications lues

Types typés dans `notificationService`:

- `objective`
- `team`
- `project`
- `system`
- `message`

Le code crée aussi des notifications de type `appraisal` avec cast `as any`; le type doit être aligné.

## Messages

Le module messages existe dans `src/components/messages`, mais l'entrée du menu latéral pointe actuellement vers Google Chat externe. Le service local supporte:

- channels publics, privés et directs
- abonnement aux channels par membre
- messages temps réel
- réactions
- typing status
- ajout/retrait de membres

## Reports

Route: `/reports`

Le service `reportService` gère:

- création de rapports
- mise à jour
- suppression
- génération
- statut et date de dernière génération

Types de rapport:

- `objective`
- `kpi`
- `project`
- `team`
- `custom`

Formats:

- `pdf`
- `excel`
- `csv`

## Analytics

Route: `/analytics`

`analyticsService.getAnalyticsByPeriod(period)` calcule:

- taux de complétion des objectifs
- performance équipe
- KPIs on-track
- projets actifs
- performance par département
- progression par niveau d'objectif
- métriques de key results
- dernières mises à jour

Périodes:

- semaine
- mois
- trimestre
- année

## Départements et pays

Routes:

- `/departments`
- `/countries`

Les départements sont utilisés pour filtrer utilisateurs, projets, tâches et analytics. Les pays sont utilisés pour affecter des utilisateurs et filtrer/segmenter des projets ou cycles d'évaluation.

## Intégrations et API

Routes:

- `/integrations`
- `/api`

Le service `integrationService` prévoit un CRUD d'intégrations avec type, statut et créateur. L'écran API contient une interface de gestion d'API keys côté composant.

## Support

Route composant: `/support`

Le service support prévoit:

- tickets
- commentaires de tickets
- articles de base de connaissance
- recherche simple côté client
- vote helpful/not helpful

Le menu latéral contient cependant un lien externe Google Chat pour Support, pas la route interne.
