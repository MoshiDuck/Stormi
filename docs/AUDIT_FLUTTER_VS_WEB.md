# Audit : App Flutter vs Site Web

Comparaison des pages et fonctionnalités pour vérifier que l’app Flutter est l’exacte copie du site adaptée au mobile.

---

## 1. Structure des routes (site web)

D’après `app/routes.ts` :

| Route | Description |
|-------|-------------|
| `/` (index) | SplashScreen |
| `/splash` | Splash |
| `/login` | Connexion |
| `/select-profile` | Sélection du profil (qui regarde) — multi‑profils |
| `/home` | Redirige vers `/films` |
| `/statistics` | Même composant que Home (stats + continue watching + recently added) |
| `/profile` | Profil utilisateur |
| `/manage-profile` | Gérer le profil (apparence, langue, aide, déconnexion) |
| `/theme-settings` | Thème clair/sombre/gris |
| `/language-settings` | Langue FR/EN/ES/DE |
| `/help` | Centre d’aide (FAQ, contact) |
| `/community` | Communauté (sections « bientôt disponible ») |
| `/community/friends`, `/family`, `/invitations`, etc. | Sous‑pages Communauté |
| `/upload` | Upload de fichiers |
| `/musics` | Musiques |
| `/films` | Films (vidéos sans saison/épisode) |
| `/series` | Séries (vidéos avec saison/épisode) |
| `/videos` | Redirige vers films/series |
| `/library` | Bibliothèque (onglets images, documents, archives, autres, exécutables) |
| `/images`, `/documents`, etc. | Redirige vers library avec onglet |
| `/lecteur-local` | Lecteur local (bientôt disponible) |
| `/reader/:category/:fileId` | Lecteur vidéo/audio |
| `/match/:category/:fileId` | Associer un fichier à TMDB (vidéos) ou Spotify (musiques) |
| `/info/:category/:fileId` | Détail fichier (style Netflix) |
| `*` | 404 |

---

## 2. Écrans Flutter existants

| Écran | Équivalent web | Statut |
|-------|----------------|--------|
| `LoginScreen` | `/login` | ✅ |
| `MainShell` (tabs) | Navigation principale | ✅ |
| `WatchScreen` (Films / Séries) | `/films` + `/series` | ✅ (2 onglets, même logique) |
| `MusicScreen` | `/musics` | ✅ |
| `LibraryScreen` (onglets images, documents, archives, others, executables) | `/library` | ✅ |
| `UploadScreen` | `/upload` | ✅ |
| `LocalPlayerScreen` | `/lecteur-local` | ✅ (bientôt disponible) |
| `ProfileScreen` | `/profile` | ✅ |
| `ManageProfileScreen` | `/manage-profile` | ✅ |
| `ThemeSettingsScreen` | `/theme-settings` | ✅ |
| `LanguageSettingsScreen` | `/language-settings` | ✅ |
| `HelpScreen` | `/help` | ✅ |
| `CommunityScreen` | `/community` | ✅ |
| `HomeScreen` (stats) | `/statistics` (affiché depuis Profil → Statistiques) | ✅ |
| `InfoScreen` | `/info/:category/:fileId` | ✅ (lecture, suppression ; pas de notation ni match) |
| `PlayerScreen` | `/reader/:category/:fileId` | ✅ |
| `ImageViewerScreen` | Aperçu image plein écran (library/images) | ✅ |
| `AuthGate` | Splash + redirection login / app | ⚠️ Pas d’écran splash dédié (branding) |

---

## 3. Pages / fonctionnalités manquantes ou différentes

### 3.1 Sélection de profil (multi‑profils) — **manquant**

- **Web** : après login, `/select-profile` permet de choisir « Qui regarde ? » (profils type Netflix : adulte, enfant, etc.). API `/api/profiles`, création/édition/suppression de profils, PIN pour profils secondaires.
- **Flutter** : après login → directement `MainShell`. Aucun écran de sélection de profil, pas d’appel à `/api/profiles`.
- **Impact** : sur mobile, un seul « profil » implicite (l’utilisateur connecté). Pas de restriction par profil enfant ni de gestion multi‑profils.

**Recommandation** : ajouter un écran `SelectProfileScreen` après login si `hasSelectedProfile()` est faux, avec appel à `GET/POST/PATCH/DELETE /api/profiles` et stockage du profil actif (et optionnellement flux PIN comme sur le web).

---

### 3.2 Page Match (TMDB / Spotify) — **manquante**

- **Web** : `/match/:category/:fileId` permet d’associer un fichier vidéo à un film/série TMDB ou une musique à un album/artiste Spotify (recherche, sélection, sauvegarde métadonnées). Accessible depuis les listes Films, Séries, Musiques.
- **Flutter** : pas d’écran « Match ». `InfoScreen` a Lecture et Supprimer uniquement.
- **Impact** : impossible sur mobile d’enrichir manuellement un fichier avec TMDB/Spotify ; l’enrichissement automatique (côté serveur) reste possible à l’upload.

**Recommandation** : ajouter `MatchScreen` (category, fileId) avec recherche TMDB/Spotify et envoi des métadonnées au backend, et un bouton « Identifier » / « Associer » depuis `InfoScreen` pour vidéos et musiques.

---

### 3.3 Splash avec branding — **simplifié**

- **Web** : écran splash dédié (logo, animation, textes de chargement).
- **Flutter** : `AuthGate` affiche un simple `CircularProgressIndicator` pendant le chargement auth.
- **Impact** : expérience un peu moins soignée au démarrage, pas de cohérence visuelle avec le splash web.

**Recommandation** : ajouter un `SplashScreen` (logo Stormi, court délai ou attente config/auth) puis redirection vers Login ou MainShell.

---

### 3.4 Détail fichier (Info) — **fonctionnalités en moins**

- **Web** : notation (étoiles), « Ma liste », séries : saisons/épisodes avec lecture par épisode, style Netflix (backdrop, hero).
- **Flutter** : poster, titre, année/durée, description, boutons Lecture et Supprimer. Pas de notation, pas de « Ma liste », pas de découpage saisons/épisodes ni lien vers Match.
- **Impact** : détail plus minimaliste sur mobile ; pas de notation ni de parcours séries avancé.

**Recommandation** (optionnel) :  
- Ajouter un bouton « Identifier » vers `MatchScreen` pour vidéos/musiques.  
- Si le backend expose saisons/épisodes pour les séries, afficher une liste d’épisodes et lancer `PlayerScreen` par épisode.

---

### 3.5 Restriction / masquage par profil — **non vérifié**

- **Web** : `HideFromProfileButton`, profils enfants, contenu masqué par profil.
- **Flutter** : pas de multi‑profils donc pas de notion de « masquer pour ce profil ». À réévaluer si `SelectProfileScreen` est ajouté.

---

### 3.6 Sous‑pages Communauté — **équivalent**

- **Web** : `/community/friends`, `/community/family`, etc. (souvent « bientôt disponible »).
- **Flutter** : une seule `CommunityScreen` avec les mêmes sections en cartes « bientôt disponible ». Pas de routes dédiées par sous‑page.
- **Verdict** : équivalent fonctionnel pour l’état actuel (tout en « bientôt »).

---

## 4. Synthèse

| Élément | Site web | Flutter | Écart |
|---------|----------|---------|--------|
| Login | ✅ | ✅ | Aucun |
| Splash | ✅ Écran dédié | ⚠️ Spinner dans AuthGate | Mineur (branding) |
| Select Profile (multi‑profils) | ✅ | ❌ | **Majeur** |
| Accueil / Stats | ✅ home → films, statistics | ✅ via Profil → Statistiques | OK |
| Films / Séries | ✅ 2 routes | ✅ 2 onglets Watch | OK |
| Musiques | ✅ | ✅ | OK |
| Bibliothèque (onglets) | ✅ | ✅ | OK |
| Upload | ✅ | ✅ | OK |
| Lecteur local | ✅ (bientôt) | ✅ (bientôt) | OK |
| Lecteur (reader) | ✅ | ✅ PlayerScreen | OK |
| Détail (info) | ✅ + notation, séries, match | ✅ simplifié, pas match | Moyen |
| **Match TMDB/Spotify** | ✅ | ❌ | **Majeur** |
| Profil / Gérer profil | ✅ | ✅ | OK |
| Thème / Langue / Aide | ✅ | ✅ | OK |
| Communauté | ✅ | ✅ | OK |
| 404 | ✅ | (non géré explicitement) | Mineur |

---

## 5. Recommandations prioritaires

1. **Sélection de profil (multi‑profils)**  
   - Implémenter `SelectProfileScreen` + appels API profils + stockage du profil actif.  
   - Afficher après login si aucun profil sélectionné (comportement aligné sur le web).

2. **Page Match**  
   - Créer `MatchScreen(category, fileId)` avec recherche TMDB/Spotify et envoi des métadonnées.  
   - Ajouter un bouton « Identifier » / « Associer » dans `InfoScreen` pour vidéos et musiques.

3. **Splash**  
   - Écran splash avec logo Stormi avant Login/MainShell pour alignement avec le web.

4. **InfoScreen (optionnel)**  
   - Bouton vers Match ; si API séries disponible, afficher saisons/épisodes et lecture par épisode.

Une fois ces points traités, l’app Flutter sera très proche du site web pour l’UI et les fonctionnalités, avec les écarts restants documentés (ex. notation, « Ma liste ») pour une évolution ultérieure.
