# Réorganisation IA/UX — Stormi — Options et recommandations

**Expertise** : Architecture d’information, UX, accessibilité (WCAG 2.1 AA)  
**Méthodes** : Design thinking, heuristiques Nielsen, card-sorting / tree-testing, principes WCAG  
**Objectifs** : Clarté maximale, fluidité des parcours, anticipation des prochaines actions, priorisation des chemins critiques.

---

## 1. État des lieux (audit synthétique)

### 1.1 Structure actuelle

| Élément | Actuel | Problème IA/UX |
|--------|--------|-----------------|
| **Nav** | Accueil · Ajouter · Regarder · Écouter · Bibliothèque · Lecteur local · Profil | 7 entrées = charge cognitive ; "Regarder" mène à Films (Séries = même espace mais sous-onglet) → OK. "Bibliothèque" déjà explicite. |
| **Accueil** | Titre, 3 cartes (Vidéos, Musiques, Bibliothèque), Continuer de regarder, Récemment ajoutés, Stats repliables, état vide | Déjà orienté découverte ; manque parfois un CTA "Ajouter" visible après premier upload. |
| **Vidéos** | Films \| Séries (VideoSubCategoryBar), hero, genres, top 10 | Clair. |
| **Bibliothèque** | Onglets Images, Documents, Archives, Exécutables, Autres | 5 onglets ; Archives/Exécutables peu utilisés en priorité. |
| **URLs** | `/films`, `/series`, `/musics`, `/library?tab=…`, redirects `/images` → `/library?tab=images` | Cohérent avec `getCategoryRoute`. |

### 1.2 Parcours critiques (jobs-to-be-done)

| Job | Parcours actuel | Friction |
|-----|-----------------|----------|
| Reprendre un film/série | Accueil → "Continuer de regarder" ou Nav "Regarder" → Films/Séries | Faible. |
| Écouter de la musique | Accueil (carte Musiques) ou Nav "Écouter" | Faible. |
| Ajouter des médias | Nav "Ajouter" ou Accueil (état vide) | CTA "Ajouter" peu visible après le premier upload. |
| Trouver un document PDF | Nav "Bibliothèque" → onglet Documents | Faible. |
| Lire des fichiers locaux sans cloud | Nav "Lecteur local" | Isolé mais compréhensible. |

### 1.3 Heuristiques Nielsen (résumé)

- **Correspondance système / monde réel** : "Regarder", "Écouter", "Bibliothèque" sont bons ; "Ajouter" meilleur que "Upload".
- **Reconnaissance plutôt que rappel** : 7 items en nav = limite haute ; regroupement Médias vs Fichiers pourrait réduire.
- **Flexibilité** : Accueil avec "Continuer de regarder" donne un raccourci ; à renforcer.
- **Cohérence** : Redirection `/videos` → `/films` à garder avec message court (aria-live).

---

## 2. Quatre options de réorganisation

### Option A — Par intention ("Que voulez-vous faire ?")

**Principe** : Navigation par objectif utilisateur (consommer, ajouter, gérer, lire localement).

| Nav | Route | Contenu |
|-----|-------|--------|
| Accueil | `/home` | Hub : Continuer de regarder, Récemment ajoutés, Stats (repliable), CTA Ajouter |
| Regarder | `/films` | Films \| Séries (sous-nav), hero, genres, top 10 |
| Écouter | `/musics` | Musiques (artistes, albums) |
| Explorer | `/library` | Onglets : Images, Documents, Archives, Autres (Exécutables dans Autres ou filtre) |
| Ajouter | `/upload` | Inchangé |
| Lecteur local | `/lecteur-local` | Inchangé |
| Profil | `/profile` | Inchangé |

**Justification** : Alignement Netflix/Spotify ; tâches les plus fréquentes (regarder, écouter) en un clic. "Explorer" regroupe tout ce qui n’est pas vidéo/musique.

**Points forts** : Clarté de l’intention, parcours courts pour les médias.  
**Points faibles** : "Explorer" peut rester vague ; Images/Documents moins mis en avant que Vidéo/Musique.

---

### Option B — Par type de média (hiérarchie simplifiée)

**Principe** : Deux blocs principaux — "Médias" (consommation) et "Fichiers" (stockage/utilitaire), avec sous-nav.

| Nav | Route | Contenu |
|-----|-------|--------|
| Accueil | `/home` | Stats + raccourcis visuels (Films, Musiques, Images, Ajouter) + Continuer de regarder |
| Médias | `/medias` (landing) | Sous-nav : Films \| Séries \| Musiques \| Images |
| Fichiers | `/files` (landing) | Sous-nav : Documents \| Archives \| Autres |
| Ajouter | `/upload` | Inchangé |
| Lecteur local | `/lecteur-local` | Inchangé |
| Profil | `/profile` | Inchangé |

**Structure** : `/medias/films`, `/medias/series`, `/medias/musics`, `/medias/images` ; `/files/documents`, `/files/archives`, `/files/others`.

**Justification** : Card-sorting implicite — les utilisateurs regroupent Films/Séries/Musiques/Images comme "médias" et Documents/Archives comme "fichiers".

**Points forts** : Hiérarchie claire, moins d’entrées en nav (6).  
**Points faibles** : Un clic de plus pour Films/Musiques depuis la landing ; "Fichiers" reste technique.

---

### Option C — Accueil hub + nav plate (une entrée par type)

**Principe** : Accueil = hub de découverte ; nav avec une entrée par type majeur.

| Nav | Route | Contenu |
|-----|-------|--------|
| Accueil | `/home` | Hub : Continuer de regarder, Films/Musiques/Images récents, Stats, CTA Ajouter |
| Films | `/films` | Films (hero, genres, top 10) |
| Séries | `/series` | Séries (hero, saisons, épisodes) |
| Musiques | `/musics` | Musiques (artistes, albums) |
| Images | `/images` | Redirige vers `/library?tab=images` ou page dédiée |
| Bibliothèque | `/library` | Documents, Archives, Exécutables, Autres (onglets) |
| Ajouter | `/upload` | Inchangé |
| Lecteur local | `/lecteur-local` | Inchangé |
| Profil | `/profile` | Inchangé |

**Justification** : Tree-testing — les utilisateurs cherchent souvent "Films" ou "Séries" directement ; une entrée par type réduit le temps de recherche.

**Points forts** : Zéro ambiguïté, chaque intention = un lien.  
**Points faibles** : Nav longue (9 items), risque de wrap sur mobile ; "Bibliothèque" peut prêter à confusion avec "ma bibliothèque de films".

---

### Option D — Progressive disclosure (nav minimale + hub)

**Principe** : Nav réduite à 4–5 entrées ; le reste dans l’accueil et des menus contextuels.

| Nav | Route | Contenu |
|-----|-------|--------|
| Accueil | `/home` | Hub riche : Continuer de regarder, Récemment ajoutés, Raccourcis (Films, Séries, Musiques, Images, Bibliothèque), Stats, CTA Ajouter |
| Médias | `/films` | Sous-nav globale : Films \| Séries \| Musiques (pas de page "Médias" intermédiaire ; premier onglet = Films) |
| Bibliothèque | `/library` | Images, Documents, Archives, Autres (onglets) |
| Ajouter | `/upload` | Inchangé |
| Plus | (menu déroulant ou drawer) | Lecteur local, Profil, Langue |

**Justification** : Réduction de la charge cognitive (règle des 5 ± 2) ; les power users passent par l’accueil ou les raccourcis.

**Points forts** : Nav très lisible, adaptée mobile.  
**Points faibles** : "Plus" cache des entrées importantes (Profil, Lecteur local) ; un clic de plus pour y accéder.

---

## 3. Matrice de décision

| Critère | A (Intention) | B (Type simplifié) | C (Hub + nav plate) | D (Progressive) |
|---------|----------------|--------------------|----------------------|-----------------|
| Clarté du parcours "regarder" | ★★★ | ★★ | ★★★ | ★★★ |
| Clarté "documents / images" | ★★ | ★★★ | ★★★ | ★★ |
| Charge cognitive (nav) | ★★ (7) | ★★★ (6) | ★ (9) | ★★★ (5) |
| Anticipation (accueil hub) | ★★★ | ★★★ | ★★★ | ★★★ |
| Mobile (wrap / lisibilité) | ★★ | ★★★ | ★ | ★★★ |
| Effort d’implémentation | Faible | Moyen (nouvelles routes) | Faible | Moyen (menu "Plus") |
| Accessibilité (landmarks, focus) | ★★★ | ★★★ | ★★★ | ★★ (menu caché) |

---

## 4. Recommandation : Option A renforcée (hybride A+)

**Choix** : Garder l’**Option A** (par intention) déjà alignée avec la nav actuelle, et l’enrichir avec les bonnes pratiques ci-dessous. Pas de changement de structure d’URL majeur (pas de passage à /medias/ ou /files/), donc effort limité.

### 4.1 Nav cible (inchangée en structure, améliorée en micro-copy et affordances)

| Nav | Route | Label (FR) | aria-label |
|-----|-------|------------|------------|
| Accueil | `/home` | Accueil | "Page d’accueil Stormi" |
| Ajouter | `/upload` | Ajouter | "Ajouter des médias" |
| Regarder | `/films` | Regarder | "Films et séries" |
| Écouter | `/musics` | Écouter | "Musiques" |
| Bibliothèque | `/library` | Bibliothèque | "Images, documents et archives" |
| Lecteur local | `/lecteur-local` | Lecteur local | "Lire des fichiers locaux sans upload" |
| Profil | `/profile` | Profil | "Mon compte et paramètres" |

### 4.2 Accueil — Anticipation des prochaines actions

À chaque zone, l’utilisateur doit voir **où aller ensuite** :

| Zone | Contenu | Prochaine action suggérée |
|------|--------|----------------------------|
| En-tête | Titre + message de bienvenue | — |
| Cartes | Vidéos, Musiques, Bibliothèque | Clic carte → Films, Musiques ou Library |
| Continuer de regarder | Carousel (si progressions) | Clic → Info ou Lecture |
| Récemment ajoutés | Carousel (si données) | Clic → Info ou Lecteur |
| Stats | Repliables par défaut | "Voir les stats" → déplier |
| État vide | Message + CTA | "Ajouter des médias" → Upload |
| Après premier upload | Conserver un CTA secondaire | Ex. "Ajouter encore" ou lien discret vers Upload |

### 4.3 Bibliothèque — Sous-catégories

- **Onglets** : Images, Documents, Archives, Exécutables, Autres (garder les 5 pour couvrir tous les types).
- **Ordre recommandé** : Images, Documents, Archives, Autres, Exécutables (usage décroissant).
- **Micro-copy** : "Autres fichiers" plutôt que "Autres" pour plus de clarté.

### 4.4 Redirection `/videos` → `/films`

- Conserver la redirection.
- Optionnel : message court aria-live "Redirection vers Films" pour les utilisateurs lecteurs d’écran.

---

## 5. Parcours cibles (résumé)

### 5.1 Premier arrivant (0 fichier)

1. Splash → Login  
2. Accueil : "Bienvenue, ajoutez vos premiers médias" + CTA **"Ajouter des médias"**  
3. Upload → retour Accueil (stats à jour)  
4. Accueil : suggestion "Découvrez vos Films" / "Vos Musiques" selon ce qui a été uploadé + CTA secondaire "Ajouter encore" si pertinent  

### 5.2 Utilisateur régulier (films/séries)

1. Accueil : **"Continuer de regarder"** en premier (si progressions)  
2. Clic → Info ou Lecture  
3. Nav **"Regarder"** pour explorer Films / Séries  

### 5.3 Utilisateur mixte (musique + documents)

1. Accueil : cartes Vidéos, Musiques, Bibliothèque  
2. **"Écouter"** → Musiques  
3. **"Bibliothèque"** → onglet Documents  

---

## 6. Micro-copy et affordances

### 6.1 Labels recommandés (FR)

| Contexte | Actuel | Proposé | Raison |
|----------|--------|---------|--------|
| Nav upload | Ajouter | Ajouter | Verbe d’action, déjà bon |
| Accueil vide | (selon i18n) | "Bienvenue ! Ajoutez vos premiers médias" | CTA explicite |
| CTA état vide | (selon i18n) | "Ajouter des médias" | Inclusif, verbe |
| Catégorie "others" | Autres | Autres fichiers | Plus explicite |
| Vidéos non identifiés | (selon i18n) | "À identifier" | Court et clair |

### 6.2 Affordances

- **Boutons d’action** : verbes (Lecture, Ajouter, Identifier).  
- **Liens de navigation** : noms de section (Films, Séries, Bibliothèque).  
- **État vide** : icône + titre + description courte + **un seul CTA principal**.  
- **Cartes accueil** : au survol/focus, indiquer qu’elles sont cliquables (soulignement ou légère élévation déjà en place).

---

## 7. Accessibilité (WCAG 2.1 AA)

| Critère | Application |
|---------|-------------|
| **1.3.1** Info et relations | Landmarks `nav`, `main` ; hiérarchie titres (h1 → h2) cohérente |
| **2.1.1** Clavier | Tous les liens et boutons accessibles au clavier |
| **2.4.3** Ordre du focus | Ordre logique : nav → contenu principal → actions |
| **2.4.4** Fonction du lien | Labels explicites (aria-label sur nav : "Films et séries", etc.) |
| **2.4.6** En-têtes et étiquettes | Titres de page uniques (meta), en-têtes de section descriptifs |
| **2.4.7** Focus visible | `:focus-visible` sur tous les éléments interactifs |
| **3.2.3** Navigation cohérente | Même structure de nav sur toutes les pages |
| **4.1.2** Nom, rôle, valeur | `aria-current="page"` sur la page courante, `aria-label` sur icônes seules |
| **Réduction du mouvement** | `prefers-reduced-motion` respecté (déjà en place) |

---

## 8. Plan de mise en œuvre (priorisation)

### Phase 1 — Quick wins (impact élevé, effort faible)

1. **Micro-copy** : Vérifier/ajuster `home.emptyTitle`, `home.emptyDescription`, `home.uploadFirst`, `categories.others` (ex. "Autres fichiers").  
2. **Accueil** : Après premier upload, garder un CTA secondaire "Ajouter encore" ou lien discret vers Upload.  
3. **aria-label** sur les liens de nav (déjà partiellement en place : compléter pour Regarder, Écouter, Bibliothèque, Lecteur local, Profil).  
4. **Redirection `/videos`** : Optionnel — message aria-live "Redirection vers Films" pour a11y.

### Phase 2 — Affinements IA (sans changer les routes)

1. **Ordre des onglets Bibliothèque** : Images, Documents, Archives, Autres, Exécutables.  
2. **Accueil** : S’assurer que "Continuer de regarder" est bien en premier quand des progressions existent.

### Phase 3 — Évolutions optionnelles (si besoin)

1. Renommer "Explorer" si vous introduisez un jour une entrée nav dédiée (Option A avec "Explorer" au lieu de "Bibliothèque") — **non recommandé** pour l’instant, "Bibliothèque" étant déjà clair.  
2. Menu "Plus" (Option D) uniquement si vous visez une nav à 5 entrées (ex. mobile first) ; à valider par tests utilisateurs.

---

## 9. Validation (tree-testing / tests rapides)

**Scénarios à faire tester (5 utilisateurs minimum)** :

1. "Vous voulez reprendre un film là où vous vous êtes arrêté. Où allez-vous ?"  
   - **Succès attendu** : Accueil → "Continuer de regarder" ou Nav "Regarder".  
2. "Vous voulez uploader une nouvelle chanson. Où allez-vous ?"  
   - **Succès attendu** : Nav "Ajouter" ou Accueil → CTA Ajouter.  
3. "Vous cherchez un document PDF que vous avez uploadé. Où allez-vous ?"  
   - **Succès attendu** : Nav "Bibliothèque" → onglet Documents.  
4. "Vous voulez écouter des fichiers audio depuis votre ordinateur sans les uploader. Où allez-vous ?"  
   - **Succès attendu** : Nav "Lecteur local".

**Métriques** : Taux de succès, nombre de clics jusqu’à la cible, temps pour atteindre la cible.

---

## 10. Synthèse

| Option | Complexité | Impact UX | Recommandation |
|--------|------------|-----------|----------------|
| A — Par intention | Faible | Élevé | **Base retenue (hybride A+)** |
| B — Par type simplifié | Moyenne | Moyen–Élevé | Intéressant si refonte URLs |
| C — Hub + nav plate | Faible | Élevé (mais nav longue) | À éviter sauf si tree-test montre besoin de liens Films/Séries séparés |
| D — Progressive disclosure | Moyenne | Moyen | À considérer pour version mobile dédiée |

**Recommandation finale** : Rester sur l’**Option A** (structure actuelle par intention), avec les renforcements Phase 1 et 2 : micro-copy, CTA "Ajouter encore" sur l’accueil, aria-labels complets, ordre des onglets Bibliothèque. Valider par les 4 scénarios de tree-test ci-dessus pour confirmer que les parcours critiques sont intuitifs.

---

## Annexe — Sitemap actuel (recommandé conservé)

```
/                    → index (redir. splash)
/splash              → écran de démarrage
/login               → connexion

[Layout _app — authentifié]
/home                → Accueil (hub : Continuer de regarder, Récemment ajoutés, cartes Vidéos/Musiques/Bibliothèque, stats, état vide)
/upload              → Ajouter des médias
/films               → Regarder — Films (sous-nav Films | Séries)
/series              → Regarder — Séries
/musics              → Écouter
/library             → Bibliothèque (onglets Images | Documents | Archives | Exécutables | Autres)
/images              → redirect /library?tab=images
/documents           → redirect /library?tab=documents
/archives            → redirect /library?tab=archives
/executables         → redirect /library?tab=executables
/others              → redirect /library?tab=others
/videos              → redirect /films

/lecteur-local       → Lecteur local (fichiers hors cloud)
/profile             → Profil

/reader/:category/:fileId   → Lecture (vidéo, audio, PDF, image)
/match/:category/:fileId    → Identification / matching
/info/:category/:fileId     → Fiche détail (film, série, etc.)

*                    → 404
```

**Prochaines actions par page** (anticipation) :
- **Accueil** : Continuer de regarder → Info/Lecture ; Cartes → Films / Musiques / Bibliothèque ; État vide → Ajouter.
- **Films / Séries** : Carte → Info ; Info → Lecture ou Identifier.
- **Musiques** : Titre/Album → Lecteur.
- **Bibliothèque** : Fichier → Ouvrir / Lecteur selon type.
- **Upload** : Fin → Retour accueil ou découverte Films/Musiques.
