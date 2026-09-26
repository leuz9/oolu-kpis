# Recette mobile OKRFlow

## Perimetre

La recette mobile couvre les largeurs CSS suivantes:

- 375 px: telephone compact;
- 390 px: telephone courant;
- 430 px: grand telephone;
- 768 px: seuil tablette et navigation desktop.

Pour chaque route, verifier:

- acces depuis le tiroir de navigation ou une action explicite;
- absence de debordement horizontal au niveau de la page;
- titre et actions principales visibles sans chevauchement;
- controles tactiles utilisables et libelles lisibles;
- tableaux consultables par defilement horizontal;
- formulaires en une colonne sur telephone;
- modales contenues dans la hauteur visible avec defilement interne;
- fermeture du tiroir apres navigation et restauration via le bouton menu.

## Matrice des routes

| Route | Profil | Controles particuliers |
| --- | --- | --- |
| `/login` | Public | SSO, formulaire legacy, liaison Google/Microsoft |
| `/register` | Public | Suffixe email, mot de passe, validation |
| `/` | Employe | Cartes, indicateurs, echeances |
| `/objectives` | Employe | Filtres, vues, formulaires et details |
| `/key-results` | Employe | Cartes, tableau et mise a jour |
| `/appraisals` | Employe | Onglets, tableaux, formulaires longs |
| `/directory` | Employe | Cartes, tableau et contact |
| `/team` | Employe | Cartes et tableau |
| `/tasks` | Employe | Liste, grille, kanban, calendrier, filtres et modales |
| `/notifications` | Employe | Filtres et liste |
| `/planning` | Employe | Liste, calendrier et formulaire evenement |
| `/settings` | Employe | Onglets, preferences et changement de mot de passe |
| `/profile` | Employe | Profil et edition |
| `/support` | Employe | Recherche, tickets et formulaire |
| `/projects` | Admin | Liste, details et formulaire multi-section |
| `/documentation` | Admin | Sommaire et contenu |
| `/users` | Admin | Tableau, actions groupees et modales |
| `/analytics` | Admin | Indicateurs et graphiques |
| `/reports` | Admin | Liste et formulaire de generation |
| `/security` | Admin | Indicateurs et reglages |
| `/departments` | Admin | Cartes, formulaire et statistiques |
| `/countries` | Admin | Navigation, cartes et formulaire |
| `/integrations` | Admin | Cartes et configuration |
| `/api` | Admin | Cles, documentation et modales |

## Non-regression

- La navigation desktop conserve les modes ouvert et reduit.
- Les fournisseurs Microsoft et Google restent accessibles depuis `/login`.
- Les tableaux restent complets sur desktop.
- Le calendrier affiche les heures sur tablette/desktop et un resume compact sur telephone.
- Aucun test de recette ne doit creer, modifier ou supprimer une donnee de production sans autorisation explicite.

## Execution du 26 septembre 2026

Version de production validee: `2026-09-26T07:17:24.281Z`.

- les 22 routes authentifiees ont ete ouvertes en production a 375, 390, 430 et 768 px;
- la largeur du document est restee egale a celle du viewport sur chaque route;
- `/users` affiche correctement le refus d'acces pour un administrateur qui n'est pas superadmin;
- le tiroir mobile masque les actions de la page, reste dans le viewport et se ferme apres navigation;
- le bouton flottant redondant des taches est masque sur telephone afin de ne pas intercepter les actions des cartes;
- le bandeau des evaluations permet d'atteindre tous les onglets par defilement horizontal interne;
- les ecrans denses `/tasks`, `/countries` et `/appraisals` ont ete controles visuellement a 375 px;
- la modale de creation d'un pays reste dans le viewport et utilise un defilement vertical interne;
- `/login` et `/register` ont ete controles a 375 px sur la meme version dans une origine locale vierge, afin de conserver la session de recette authentifiee en production;
- aucune donnee de production n'a ete creee, modifiee ou supprimee pendant cette recette.
