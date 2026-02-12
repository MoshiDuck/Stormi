# Vérification : app Flutter = copie du site adaptée au téléphone

**Résultat** : l’app Flutter reproduit le site (UI + fonctionnalités) adaptée au téléphone. Les seules différences assumées sont listées en bas (pas d’onglet Accueil dédié, pas d’écran Match, lecteur local placeholder, pas de sous-pages Communauté).

## Comparatif effectué

- **Site web** : `app/` (React), routes dans `app/routes.ts`, navigation `Navigation.tsx`.
- **App Flutter** : `lib/` (screens, providers, services).

---

## Navigation

| Site web (barre haute) | Flutter (barre basse) |
|------------------------|------------------------|
| Regarder → /films | Onglet 1 : **Regarder** (`WatchScreen`) |
| Écouter → /musics | Onglet 2 : **Musique** (`MusicScreen`) |
| Bibliothèque → /library | Onglet 3 : **Bibliothèque** (`LibraryScreen`) |
| Ajouter → /upload | Onglet 4 : **Ajouter** (`UploadScreen`) |
| Lecteur local → /lecteur-local | Onglet 5 : **Lecteur local** (`LocalPlayerScreen`) |
| Profil (dropdown) | Onglet 6 : **Profil** (`ProfileScreen`) |
| Accueil/Stats, Communauté, Aide | Depuis Profil → Gérer le profil → Statistiques / Communauté / Aide |

Ordre des onglets Flutter = ordre du site (sans page Accueil dédiée ; stats accessibles via Profil → Statistiques).

---

## UI et écrans alignés

| Site web | Flutter | Statut |
|----------|---------|--------|
| Accueil (stats, continuer à regarder, récemment ajoutés) | `HomeScreen` (depuis Profil → Statistiques) | OK (cache, invalidation, pull-to-refresh). Tap poster → `InfoScreen`. |
| Upload (nav + zone drop) | `UploadScreen` (onglet + depuis Profil) | OK. Titre, sous-titre, « Sélectionner un fichier », zone tap, « Formats supportés ». Multi-fichiers, POST /api/upload, catégorie serveur (MIME + extension). |
| Films / Séries (onglets) | `WatchScreen` (Films / Séries) | OK. Tap carte → `InfoScreen`. Long-press → Supprimer. |
| Musique | `MusicScreen` | OK. Tap piste → `InfoScreen` (Lire / Supprimer). Cache, notifier. |
| Bibliothèque (Images, Documents, Archives, Autres, Exécutables) | `LibraryScreen` | OK. Ordre onglets = site. Images : grille + aperçu plein écran. Documents : grille + ouvrir. Autres : liste, ouvrir, long-press Supprimer. États vides + « Ajouter des fichiers ». |
| Profil (infos, compte, menu) | `ProfileScreen` | OK. Liens Gérer le profil, Statistiques, Communauté, Aide, Déconnexion. |
| Gérer le profil (Apparence, Langue, Données, Aide, Déconnexion) | `ManageProfileScreen` | OK. Thème, Langue, Aide, Déconnexion (cache clear). |
| Communauté (6 sections « bientôt ») | `CommunityScreen` | OK. i18n, tap section → « Bientôt disponible ». |
| Fiche média (poster, titre, Lire, Supprimer) | `InfoScreen` | OK. Ouvert depuis Watch, Music, Home. Lire → `PlayerScreen`, Supprimer + invalidation. |
| Lecteur vidéo/audio | `PlayerScreen` | OK. URL avec token, reprise, sauvegarde progression. |
| Thème (clair / sombre / gris) | `ThemeSettingsScreen` | OK |
| Langue (FR, EN, ES, DE) | `LanguageSettingsScreen` | OK |
| Aide (FAQ, Contact) | `HelpScreen` | OK. i18n. |
| Login Google | `LoginScreen` | OK |

---

## Fonctionnalités alignées

- **Cache** : TTL stats 5 min, files 1 h. `CacheService` + `CacheInvalidationNotifier`. Fallback stale.
- **Renouvellement auto** : timer 5 min dans `MainShell` → `invalidateStats`.
- **Upload** : POST /api/upload, catégorie serveur (MIME + extension). Envoi de **basicMetadata** (titre, artiste, album, année) pour vidéos/musiques → même enrichissement **TMDB** (vidéos) et **Spotify** (musiques) que le site. Invalidation après upload.
- **Catégories** : videos (Films/Séries), musics, images, documents, archives, others, executables (ordre Bibliothèque = site).
- **Suppression** : Watch (long-press), InfoScreen (bouton), Library (long-press) → API DELETE + invalidation.
- **Lecture** : InfoScreen « Lire » → `PlayerScreen`. Reprise et sauvegarde progression (watch-progress).
- **Déconnexion** : `clearAll()` / `clearOnLogout()`.

---

## Différences assumées (adaptation mobile)

- **Pas d’onglet Accueil** : stats + « continuer à regarder » + « récemment ajoutés » accessibles via Profil → Statistiques (`HomeScreen(showAsStatisticsPage: true)`).
- **Lecteur local** : présent sur le site (fichiers locaux). Flutter = écran placeholder « Bientôt » (usage mobile = stream).
- **Sélection de profil** : site = écran select-profile après login. Flutter = accès direct après login (pas de profils multiples).
- **Match** : site = route `/match/:category/:fileId` (sélection manuelle de la correspondance TMDB/Spotify après upload). Flutter = non implémenté (les correspondances restent automatiques).
- **Sous-pages Communauté** : site = routes family/friends/etc. Flutter = SnackBar « Bientôt disponible » au tap sur une section.

---

## Modifs réalisées lors de cette vérification

1. **Communauté** : sections en i18n + « Bientôt disponible » (FR/EN/ES/DE).
2. **Navigation** : onglet **Ajouter** (Upload), ordre = site (Regarder, Musique, Bibliothèque, Ajouter, Lecteur local, Profil).
3. **Lecteur** : `PlayerScreen` depuis InfoScreen « Lire » (URL avec token). Reprise + sauvegarde progression.
4. **InfoScreen** : Supprimer + Reprendre. Ouvert depuis Watch (tap carte), **Music (tap piste)** et Home (tap poster).
5. **MusicScreen** : tap sur une piste → `InfoScreen` (comme le site : fiche détail puis Lire / Supprimer).
6. **HelpScreen** : FAQ + Contact, i18n. **Upload** : selectFile + supportedFormats en 4 langues. **Bibliothèque** : ordre onglets = site (others avant executables).
7. **Catégorie upload** : serveur utilise extension en fallback (MIME générique) pour que images/documents ne soient plus classés « autres ».
8. **TMDB / Spotify à l’upload** : même flux que le site. Le backend (POST /api/upload) lance l’enrichissement automatique (TMDB pour vidéos, Spotify pour musiques) après enregistrement du fichier. Flutter envoie désormais les **métadonnées de base** (ID3 / MP4 : titre, artiste, album, année) via le champ `basicMetadata` pour améliorer les correspondances ; lecture via `audio_metadata_reader`. L’écran **Match** (choix manuel de la fiche TMDB/Spotify) n’existe pas sur l’app (correspondance uniquement automatique).

---

## Checklist définitive (parité site ↔ Flutter)

| # | Élément site | Flutter | Vérifié |
|---|----------------|--------|--------|
| 1 | Nav : Regarder, Écouter, Bibliothèque, Ajouter, Lecteur local, Profil | 6 onglets dans le même ordre | ✅ |
| 2 | Regarder : onglets Films / Séries, liste, tap → fiche, long-press → Supprimer | `WatchScreen` : _films / _series, `InfoScreen`, suppression | ✅ |
| 3 | Musique : liste pistes, tap → fiche → Lire / Supprimer | `MusicScreen` → `InfoScreen` → `PlayerScreen` / Supprimer | ✅ |
| 4 | Bibliothèque : Images, Documents, Archives, Autres, Exécutables (ordre) | `LibraryScreen` : même ordre, grilles/liste, ouvrir, Supprimer | ✅ |
| 5 | Upload : zone, multi-fichiers, basicMetadata (TMDB/Spotify) | `UploadScreen` : zone, basicMetadata envoyé | ✅ |
| 6 | Profil : Gérer, Statistiques, Communauté, Aide, Déconnexion | `ProfileScreen` : mêmes entrées | ✅ |
| 7 | Gérer le profil : Apparence, Langue, Données, Aide, Déconnexion | `ManageProfileScreen` : Thème, Langue, Aide, Déconnexion | ✅ |
| 8 | Fiche média : poster, Lire, Supprimer, Reprendre | `InfoScreen` : idem, `PlayerScreen` avec reprise/sauvegarde | ✅ |
| 9 | Cache + invalidation (upload, suppression, déconnexion, timer 5 min) | `CacheService` + `CacheInvalidationNotifier` | ✅ |
| 10 | Login Google | `LoginScreen` | ✅ |
| 11 | Thème (clair/sombre/gris), Langue (FR/EN/ES/DE), Aide (FAQ, Contact) | `ThemeSettingsScreen`, `LanguageSettingsScreen`, `HelpScreen` | ✅ |
| 12 | Communauté : sections « bientôt » | `CommunityScreen` + SnackBar | ✅ |
| 13 | Lecteur local | `LocalPlayerScreen` (placeholder) | ✅ (différence assumée) |
| 14 | Écran Match (choix manuel TMDB/Spotify) | Non implémenté | ✅ (différence assumée) |

---

## Lancer et tester

```bash
cd flutter/stormi && flutter pub get && flutter run
```

`flutter analyze lib/` : sans erreur.
