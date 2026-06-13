# Guide de développement

## Principes locaux du code

La base de code suit une organisation simple:

- composants React par domaine dans `src/components`
- services Firestore par domaine dans `src/services`
- types partagés dans `src/types.ts`
- configuration Firebase et rôles dans `src/config`
- contexte global pour auth et notifications

Avant d'ajouter une fonctionnalité, chercher d'abord un module existant proche. La plupart des écrans ont déjà un pattern CRUD réutilisable.

## Ajouter un module fonctionnel

Étapes recommandées:

1. Définir ou compléter les types dans `src/types.ts`.
2. Créer un service `src/services/<module>Service.ts`.
3. Créer un dossier `src/components/<module>/`.
4. Ajouter la route dans `src/App.tsx`.
5. Ajouter l'entrée menu dans `src/components/Sidebar/menuItems.ts`.
6. Ajouter les règles Firestore.
7. Ajouter les index Firestore si `where + orderBy`.
8. Tester avec un utilisateur standard et un admin.
9. Documenter la collection dans `docs/06-modele-donnees-firestore.md`.

## Pattern service recommandé

```ts
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION_NAME = 'example';

export const exampleService = {
  async getItems() {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async addItem(data: Omit<Example, 'id'>) {
    const ref = await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: ref.id, ...data };
  },

  async updateItem(id: string, data: Partial<Example>) {
    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  async deleteItem(id: string) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
```

## Pattern composant recommandé

Les écrans principaux suivent généralement:

- `sidebarOpen`
- `items`
- `loading`
- `error`
- `success`
- état de filtres
- état de modales
- `fetchData`
- handlers CRUD

Conserver cette cohérence facilite la maintenance.

## Gestion des dates

Le code utilise aujourd'hui à la fois `serverTimestamp()` et `new Date().toISOString()`. Pour les nouveaux développements, choisir une convention par collection.

Recommandation:

- utiliser `serverTimestamp()` pour `createdAt` et `updatedAt` côté Firestore
- convertir en ISO string uniquement côté affichage ou export
- éviter de comparer directement `Timestamp` et string dans un même filtre

## Permissions

Pour toute nouvelle action sensible:

1. Vérifier côté UI pour l'expérience utilisateur.
2. Vérifier dans le service pour éviter les erreurs évidentes.
3. Vérifier dans les règles Firestore, car c'est le seul contrôle réellement opposable côté client.

Le contrôle UI seul n'est pas suffisant.

## Notifications

Pour notifier un utilisateur:

```ts
await notificationService.createNotification({
  userId,
  title: 'Titre',
  message: 'Message',
  type: 'system',
  priority: 'low',
  link: '/route'
});
```

Si le domaine est nouveau, mettre à jour l'union TypeScript de `Notification.type`.

## Temps réel

Utiliser `onSnapshot` seulement si le besoin métier exige une mise à jour immédiate. Pour les listes administratives peu dynamiques, un chargement ponctuel est plus simple et moins coûteux.

Toujours retourner et appeler la fonction `unsubscribe` dans le cleanup `useEffect`.

## Imports et types

Avec `strict`, `noUnusedLocals` et `noUnusedParameters`, le build TypeScript exige:

- types exportés réellement présents dans `src/types.ts`
- imports non utilisés supprimés
- champs cohérents entre types et données manipulées

Les écarts existants sont listés dans [10-limites-risques-roadmap.md](./10-limites-risques-roadmap.md).

## UI et composants

Conventions observées:

- layout principal `min-h-screen bg-gray-50 flex`
- `Sidebar` sur les écrans privés
- cartes blanches `bg-white rounded-lg shadow-sm`
- couleur primaire Tailwind `primary-*`
- icônes Lucide React
- messages d'erreur en bordure rouge
- messages succès en bordure verte

Pour garder la cohérence, réutiliser ces classes et composants avant de créer un nouveau design.

## Checklist avant merge

- `npm run lint`
- `npm run build`
- vérifier les routes touchées en local
- tester avec utilisateur standard et admin
- vérifier les règles Firestore correspondantes
- vérifier les index Firestore nécessaires
- mettre à jour les docs si nouvelle collection, route ou permission
