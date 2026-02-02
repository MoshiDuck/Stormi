# Proposition de réorganisation IA/UX — Stormi

**Document de travail** — Architecture d'information et parcours utilisateur  
Méthode : Design thinking, heuristiques Nielsen, card-sorting, principes WCAG 2.1 AA

---

## 1. État des lieux (audit rapide)

### 1.1 Structure actuelle

| Zone | Contenu | Problèmes identifiés |
|------|---------|----------------------|
| **Nav principale** | Accueil · Upload · Fichiers · Lecteur local · Profil | "Fichiers" pointe vers `/films` mais reste actif sur 9 routes → confusion |
| **Accueil** | Stats (nb fichiers, Go), facturation, CTA upload si vide | Orienté "admin" ; peu orienté "découverte" ou "continuer où j'en étais" |
| **Fichiers** | CategoryBar (7 catégories) + VideoSubCategoryBar (Films \| Séries) sur vidéos | Hiérarchie floue : Vidéos = Films+Séries, mais le lien "Fichiers" mène à Films |
| **Catégories** | Vidéos, Musiques, Images, Documents, Archives, Exécutables, Autres | 7 catégories techniques ; Archives/Exécutables/Autres peu utilisés en priorité |
| **Lecteur local** | Lecteur drag & drop hors cloud | Bien positionné, mais peu visible dans le flux principal |

### 1.2 Parcours critiques (jobs-to-be-done)

| Job utilisateur | Parcours actuel | Friction |
|-----------------|-----------------|----------|
| **Regarder un film** | Accueil → Fichiers → Films (ou déjà sur Films) → Info → Lecture | "Fichiers" ne dit pas "Films" |
| **Écouter de la musique** | Fichiers → Musiques (ou via CategoryBar sur Films) | Navigation indirecte |
| **Uploader des médias** | Accueil → Upload | OK, mais CTA peu visible après premier upload |
| **Continuer une série** | Fichiers → Séries | Deux clics depuis Accueil, pas de raccourci "Continuer" |
| **Consulter stats / facturation** | Accueil | OK |
| **Lire des fichiers locaux sans upload** | Lecteur local | Isolé du flux médias |

### 1.3 Heuristiques Nielsen (points faibles)

- **Visibilité du statut** : OK (loading, skeletons).
- **Correspondance système / monde réel** : "Fichiers" est technique ; "Films", "Musiques" sont plus parlants.
- **Contrôle utilisateur** : OK (navigation, annulation).
- **Cohérence** : Incohérence entre "Fichiers" (nav) et "Vidéos" (CategoryBar) ; /videos → /films silencieux.
- **Prévention des erreurs** : OK.
- **Reconnaissance vs rappel** : Trop de catégories à mémoriser (7).
- **Flexibilité** : Pas de raccourcis "Continuer de regarder" depuis l'accueil.
- **Esthétique et minimalisme** : Nav chargée.
- **Aide aux erreurs** : OK (ErrorBoundary, 404).
- **Documentation** : Pas nécessaire si l'IA est claire.

---

## 2. Trois options de réorganisation

### Option A — Par intention : "Que voulez-vous faire ?"

**Principe** : Organiser la navigation par objectif utilisateur (consommer, ajouter, gérer, lire localement).

| Nav | Route | Contenu |
|-----|-------|---------|
| **Accueil** | `/home` | Dashboard enrichi : Continue de regarder, Récemment ajoutés, Statistiques (repliable) |
| **Regarder** | `/films` (Films \| Séries en sous-nav) | Films, Séries, Hero, Genres, Top 10 |
| **Écouter** | `/musics` | Musiques par artiste/album |
| **Explorer** | `/explore` ou `/library` | Grille unifiée : Images, Documents, Archives, Exécutables, Autres (onglets ou filtre) |
| **Ajouter** | `/upload` | Upload (inchangé) |
| **Lecteur local** | `/lecteur-local` | Inchangé |
| **Profil** | `/profile` | Inchangé |

**Points forts** :  
- Clarté de l’intention ("Regarder", "Écouter").  
- Parcours court pour consommer du média.  
- Séparation nette médias de divertissement vs fichiers utilitaires.  

**Points faibles** :  
- "Explorer" peut sembler vague.  
- Images et Documents ne sont pas mis en avant comme les vidéos/musiques.  

**Justification** : Aligné avec le positionnement Netflix/Spotify (consommation de médias) ; les tâches les plus fréquentes sont immédiatement accessibles.

---

### Option B — Par type de média (structure actuelle simplifiée)

**Principe** : Garder une structure par type, mais clarifier la hiérarchie et réduire la charge cognitive.

| Nav | Route | Contenu |
|-----|-------|---------|
| **Accueil** | `/home` | Stats + raccourcis visuels (Films, Musiques, Images, Upload) + "Continuer de regarder" si applicable |
| **Médias** | `/medias` (landing) ou `/films` | Sous-nav : Films \| Séries \| Musiques \| Images |
| **Fichiers** | `/files` (landing) | Sous-nav : Documents \| Archives \| Autres (Exécutables intégrés ou cachés) |
| **Ajouter** | `/upload` | Inchangé |
| **Lecteur local** | `/lecteur-local` | Inchangé |
| **Profil** | `/profile` | Inchangé |

**Structure des sous-pages** :  
- `/medias/films`, `/medias/series`, `/medias/musics`, `/medias/images`  
- `/files/documents`, `/files/archives`, `/files/others`  

**Points forts** :  
- Hiérarchie claire : Médias (consommation) vs Fichiers (stockage/utilitaire).  
- Moins d’entrées en nav (5–6 au lieu de 7+).  
- Exécutables/Archives regroupés, moins prioritaires.  

**Points faibles** :  
- Un clic de plus pour atteindre Films/Musiques si on part de `/medias`.  
- "Fichiers" reste un terme technique.  

**Justification** : Card-sorting implicite : les utilisateurs regroupent naturellement Films/Séries/Musiques/Images comme "médias de loisir" et Documents/Archives comme "fichiers de travail".

---

### Option C — Accueil hub + navigation secondaire contextuelle

**Principe** : L’accueil devient un hub de découverte ; la nav reste minimale.

| Nav | Route | Contenu |
|-----|-------|---------|
| **Accueil** | `/home` | Hub : Continue de regarder, Films récents, Musiques récentes, Images récentes, Stats (repliable), CTA Upload |
| **Films** | `/films` | Films (hero, genres, top 10) |
| **Séries** | `/series` | Séries (hero, saisons, épisodes) |
| **Musiques** | `/musics` | Musiques (artistes, albums) |
| **Images** | `/images` | Galerie images |
| **Bibliothèque** | `/library` | Documents, Archives, Exécutables, Autres (CategoryBar interne) |
| **Upload** | `/upload` | Inchangé |
| **Lecteur local** | `/lecteur-local` | Inchangé |
| **Profil** | `/profile` | Inchangé |

**Points forts** :  
- Chaque média majeur a sa propre entrée.  
- Accueil orienté découverte et reprise.  
- Pas d’ambiguïté Films vs Séries.  

**Points faibles** :  
- Nav plus longue (risque de wrap sur mobile).  
- "Bibliothèque" pour Documents/Archives peut prêter à confusion avec "ma bibliothèque de films".  

**Justification** : Tree-testing : les utilisateurs cherchent "Films" ou "Séries" directement ; une entrée par type réduit le temps de recherche.

---

## 3. Recommandation : Option hybride A+

Combinaison des forces de A et B :

| Nav | Route | Rôle |
|-----|-------|------|
| **Accueil** | `/home` | Hub : Continue de regarder (si vidéos en cours), Récemment ajoutés (médias), Stats (repliable), CTA "Ajouter des médias" |
| **Regarder** | `/films` | Films \| Séries (sous-onglets), hero, genres, top 10 |
| **Écouter** | `/musics` | Musiques (artistes, albums) |
| **Bibliothèque** | `/library` | Onglets : Images \| Documents \| Archives \| Autres (Exécutables dans Autres ou filtrable) |
| **Ajouter** | `/upload` | Upload, CTA visible |
| **Lecteur local** | `/lecteur-local` | Fichiers locaux sans cloud |
| **Profil** | `/profile` | Paramètres, langue |

**Changements clés** :
1. Renommer "Fichiers" → "Regarder" (pointe vers Films) + "Écouter" (Musiques) + "Bibliothèque" (Images, Documents, Archives, Autres).
2. Accueil orienté découverte : "Continuer de regarder" en haut si des progressions existent.
3. Catégories peu utilisées (Archives, Exécutables) regroupées dans Bibliothèque.
4. `/videos` redirige vers `/films` avec une redirection 301 et un message court : "Redirection vers Films" (aria-live pour a11y).

---

## 4. Détail des parcours cibles

### 4.1 Premier arrivant (0 fichier)

1. Splash → Login  
2. Accueil : message "Bienvenue, ajoutez vos premiers médias" + CTA "Ajouter des médias" (Upload)  
3. Upload → retour Accueil (stats mises à jour)  
4. Accueil : suggestion "Découvrez vos Films" ou "Découvrez vos Musiques" selon ce qui a été uploadé  

### 4.2 Utilisateur régulier (films/séries)

1. Accueil : "Continuer de regarder" en premier  
2. Clic → Info ou Lecture directe  
3. Nav : "Regarder" pour explorer Films/Séries  

### 4.3 Utilisateur mixte (musique + documents)

1. Accueil : raccourcis visuels (Films, Musiques, Documents)  
2. "Écouter" pour Musiques  
3. "Bibliothèque" → onglet Documents  

---

## 5. Micro-copy et affordances

### Labels recommandés (FR)

| Élément | Actuel | Proposé | Raison |
|---------|--------|---------|--------|
| nav.files | Fichiers | (supprimé, remplacé par Regarder / Écouter / Bibliothèque) | Trop générique |
| nav.home | Accueil | Accueil | OK |
| nav.upload | Upload | Ajouter | Verbe d’action |
| home.emptyTitle | Bienvenue sur Stormi ! | Bienvenue ! Ajoutez vos premiers médias | CTA explicite |
| home.uploadFirst | Uploader mes premiers fichiers | Ajouter des médias | Plus inclusif |
| videos.unidentifiedFiles | Fichiers à identifier | À identifier | Plus court |
| categories.others | Autres | Autres fichiers | Plus explicite |

### Affordances

- Boutons d’action : "Lecture", "Ajouter", "Identifier" (verbes).  
- Liens de navigation : noms de sections ("Films", "Séries", "Bibliothèque").  
- État vide : icône + titre + description courte + CTA unique.  

---

## 6. Accessibilité (WCAG 2.1 AA)

| Critère | Application |
|---------|-------------|
| **1.3.1 Info et relations** | Landmarks (`nav`, `main`), hiérarchie de titres (h1 → h2) cohérente |
| **2.1.1 Clavier** | Tous les liens et boutons accessibles au clavier |
| **2.4.3 Ordre du focus** | Ordre logique : nav → contenu principal → actions |
| **2.4.4 Fonction du lien** | Labels explicites : "Regarder vos films" plutôt que "Fichiers" |
| **2.4.6 En-têtes et étiquettes** | Titres de page uniques (meta), en-têtes de section descriptifs |
| **2.4.7 Focus visible** | `:focus-visible` sur tous les éléments interactifs |
| **3.2.3 Navigation cohérente** | Même structure de nav sur toutes les pages |
| **4.1.2 Nom, rôle, valeur** | `aria-current="page"`, `aria-label` sur icônes seules |

---

## 7. Plan de mise en œuvre (priorisation)

### Phase 1 — Quick wins (impact élevé, effort faible)

1. Renommer "Fichiers" en un lien plus explicite ou le remplacer par "Regarder" pointant vers `/films`.  
2. Ajouter "Continuer de regarder" sur l’accueil si progressions existent.  
3. Améliorer le micro-copy de l’état vide (home.emptyTitle, home.uploadFirst).  
4. Vérifier `aria-current` et labels sur la nav.  

### Phase 2 — Restructuration navigation

1. Implémenter l’option hybride A+ (Regarder, Écouter, Bibliothèque).  
2. Créer une page `/library` avec onglets Images, Documents, Archives, Autres.  
3. Adapter `getCategoryRoute` et les liens internes.  

### Phase 3 — Accueil hub

1. Enrichir l’accueil avec "Continuer de regarder" et "Récemment ajoutés".  
2. Raccourcis visuels vers Films, Musiques, Images, Upload.  
3. Replier les stats par défaut (bouton "Voir les stats").  

---

## 8. Validation (tree-testing / tests rapides)

**Scénarios à tester** (5 utilisateurs) :

1. "Vous voulez reprendre un film là où vous vous êtes arrêté. Où allez-vous ?"  
2. "Vous voulez uploader une nouvelle chanson. Où allez-vous ?"  
3. "Vous cherchez un document PDF que vous avez uploadé. Où allez-vous ?"  
4. "Vous voulez écouter des fichiers audio depuis votre ordinateur sans les uploader. Où allez-vous ?"  

**Métriques** : taux de succès, nombre de clics, temps pour atteindre la cible.

---

## 9. Synthèse

| Option | Complexité | Impact UX | Recommandation |
|--------|------------|-----------|----------------|
| A — Par intention | Moyenne | Élevé | Base de l’hybride |
| B — Par type simplifié | Moyenne | Moyen–Élevé | Idée "Médias" vs "Fichiers" |
| C — Hub + nav plate | Faible | Élevé | Risque de nav trop longue |
| **A+ Hybride** | **Moyenne** | **Élevé** | **Recommandé** |

L’option hybride A+ maximise la clarté des parcours (Regarder, Écouter, Bibliothèque), anticipe les actions suivantes (Continuer de regarder sur l’accueil) et garde une nav raisonnable (6–7 items). Les phases 1 à 3 permettent une migration progressive sans rupture.
