# Vérification : app Flutter = copie du site adaptée au téléphone

## Comparatif effectué

- **Site web** : `app/` (React), routes dans `app/routes.ts`, navigation `Navigation.tsx`.
- **App Flutter** : `lib/` (screens, providers, services).

---

## UI et écrans alignés

| Site web | Flutter | Statut |
|----------|---------|--------|
| Accueil (stats, continuer à regarder, récemment ajoutés) | `HomeScreen` | OK (cache, invalidation, pull-to-refresh) |
| Upload (nav + zone drop) | `UploadScreen` (onglet nav + depuis Profil) | OK (onglet Ajouter ajouté, zone tappable) |
| Films / Séries (onglets) | `WatchScreen` (Films / Séries) | OK (cache, long-press Supprimer) |
| Musique | `MusicScreen` | OK (cache, notifier) |
| Bibliothèque (Images, Documents, Archives, Exécutables, Autres) | `LibraryScreen` | OK (cache, notifier) |
| Profil (infos, compte connecté, menu) | `ProfileScreen` | OK |
| Gérer le profil (Apparence, Langue, Données, Aide, Déconnexion) | `ManageProfileScreen` | OK (cache clear on logout) |
| Communauté (6 sections + bandeau « bientôt ») | `CommunityScreen` | OK (i18n complètes, même ordre et textes) |
| Fiche média (poster, titre, année, durée, description, Lire, Supprimer) | `InfoScreen` | OK (Lire → lecteur, Supprimer + API + cache) |
| Lecteur vidéo/audio | `PlayerScreen` | OK (video_player, URL avec token) |
| Thème (clair / sombre / gris) | `ThemeProvider` + `ThemeSettingsScreen` | OK |
| Langue (FR, EN, ES, DE) | `LanguageProvider` + `LanguageSettingsScreen` | OK |
| Aide (titre, sous-titre, FAQ upload/stockage, Contact) | `HelpScreen` | OK (i18n complètes, même structure) |
| Login Google | `LoginScreen` | OK |

---

## Fonctionnalités alignées

- **Cache** : TTL (stats 5 min, files 1 h), lecture cache → réseau, fallback stale. `CacheService` + `CacheInvalidationNotifier`.
- **Renouvellement auto** : timer 5 min dans `MainShell` → `invalidateStats` → refetch Home (et écrans qui écoutent).
- **Après upload** : `invalidateAllForUser` + `invalidateAfterUpload` → refetch partout.
- **Après suppression** : invalidation stats + files, `invalidateAfterDelete` → refetch.
- **Déconnexion** : `clearAll()` + `clearOnLogout()` (Profil et Gérer le profil).
- **Upload** : zone « Glissez-déposez ou appuyez pour parcourir » (i18n), multi-fichiers.
- **Suppression** : Watch (long-press sur carte), InfoScreen (bouton Supprimer) → API DELETE + invalidation.
- **Lecture** : InfoScreen « Lire » → `PlayerScreen` (stream avec token). **Reprise** : chargement de la progression (GET /api/watch-progress/:fileId), affichage « Reprendre à X », position initiale passée au lecteur. **Sauvegarde** : à la sortie du lecteur, POST /api/watch-progress/:fileId (current_time, duration, user_id).

---

## Différences assumées (adaptation mobile)

- **Navigation** : site = barre haute avec 7 liens (Home, Upload, Watch, Music, Library, Community, Lecteur local). Flutter = barre basse 6 onglets (Accueil, Ajouter, Regarder, Musique, Bibliothèque, Profil). Communauté et Aide accessibles depuis Profil.
- **Lecteur local** : présent sur le site (fichiers locaux). Non implémenté sur Flutter (usage mobile = stream).
- **Sélection de profil** : site = écran « select-profile » après login (profils streaming). Flutter = accès direct au contenu après login (pas de gestion de profils multiples pour l’instant).
- **Sous-pages Communauté** : site = routes dédiées (family, friends, etc.) avec « Bientôt disponible ». Flutter = tap sur une section → SnackBar « Bientôt disponible » (pas de sous-écrans).

---

## Modifs réalisées lors de cette vérification

1. **Communauté** : toutes les sections en i18n (titres, sous-titres, descriptions) + bandeau description + « Bientôt disponible » (FR/EN/ES/DE).
2. **Navigation** : onglet **Ajouter** (Upload) ajouté comme sur le site, avec `nav.add` en 4 langues. `UploadScreen(showBackButton: false)` en onglet, `true` quand ouvert depuis Profil.
3. **Lecteur** : `PlayerScreen` avec `video_player`, ouvert depuis InfoScreen « Lire » (URL avec token).
4. **InfoScreen** : bouton **Supprimer** (videos/musics) avec dialogue de confirmation, appel API delete + invalidation cache + pop. **Reprendre** : chargement progression vidéo, affichage « Reprendre à X », passage de la position au lecteur.
5. **HelpScreen** : aligné sur le site (titre, sous-titre, FAQ « Comment ajouter des fichiers ? », « Où sont stockées mes données ? », section Contact) avec i18n FR/EN/ES/DE.
6. **Progression de lecture** : `ApiClient.getWatchProgressForFile`, `ApiClient.saveWatchProgress` ; `PlayerScreen` reçoit fileId, userId, initialPositionSeconds et sauvegarde à la sortie.

---

## Lancer et tester

```bash
cd flutter/stormi && flutter pub get && flutter run
```

`flutter analyze lib/` : sans erreur.
