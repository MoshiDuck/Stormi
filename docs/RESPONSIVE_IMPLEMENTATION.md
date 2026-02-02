# Implémentation responsive / adaptive — Stormi

Ce document décrit l’approche technique pour rendre le site React responsive et adaptive sur **téléphone**, **tablette**, **desktop** et **TV (10-foot UI)**, avec focus sur la performance et l’accessibilité.

---

## 1. Approche technique

- **Mobile-first** : styles de base pour petit écran, puis `min-width` pour tablette, desktop et TV.
- **Breakpoints centralisés** dans `app/utils/ui/breakpoints.ts` (phone &lt; 600px, tablet 600–1023px, desktop 1024–1919px, TV ≥ 1920px).
- **Hooks React** : `useMediaQuery(query)` et `useBreakpoint()` pour adapter le rendu et les styles (SSR-safe).
- **10-foot UI** : cibles tactiles ≥ 44px (WCAG 2.5.5 AAA), focus visible marqué, `useIsTenFoot()` pour grands écrans / pointer coarse.
- **Safe area** : `viewport-fit=cover` + `env(safe-area-inset-*)` pour encoches et barres système.
- **Réduction du mouvement** : les transitions du drawer et des view transitions respectent `prefers-reduced-motion`.

---

## 2. Fichiers créés ou modifiés

| Fichier | Rôle |
|--------|------|
| `app/utils/ui/breakpoints.ts` | Breakpoints, media, padding/maxWidth, `TOUCH_TARGET_MIN` |
| `app/hooks/useMediaQuery.ts` | Hook `useMediaQuery(query)` (SSR-safe) |
| `app/hooks/useBreakpoint.ts` | Hook `useBreakpoint()` → 'phone' \| 'tablet' \| 'desktop' \| 'tv', et `useIsTenFoot()` |
| `app/root.tsx` | Viewport `viewport-fit=cover`, body avec `safe-area-inset-*` |
| `app/routes/_app.tsx` | `main` : padding et maxWidth selon breakpoint |
| `app/components/navigation/Navigation.tsx` | Mobile : drawer (hamburger) ; desktop : barre horizontale ; 10-foot : cibles 44px |
| `app/components/ui/categoryBar.tsx` | Padding / gap / margin selon breakpoint, scroll horizontal si besoin |
| `app/components/ui/LibraryTabBar.tsx` | Idem + overflow horizontal |
| `app/components/ui/MiniPlayer.tsx` | Mobile : barre pleine largeur en bas + safe-area ; desktop : carte flottante déplaçable |
| `app/components/ui/VirtualizedMasonryGrid.tsx` | `columnWidth` par défaut selon breakpoint (160 / 220 / 280 / 300) |
| `app/components/navigation/ProfileDropdown.tsx` | Trigger et items du menu : min-height/min-width 44px |
| `app/utils/i18n.ts` | Clés `nav.menuOpenAriaLabel` et `nav.menuCloseAriaLabel` (fr, en, es, de) |

---

## 3. Plan d’implémentation (déjà appliqué)

1. **Breakpoints et hooks**  
   Créer `breakpoints.ts`, `useMediaQuery`, `useBreakpoint` / `useIsTenFoot`.

2. **Root et layout**  
   Viewport + safe-area sur le body ; `_app` avec padding et maxWidth dynamiques.

3. **Navigation**  
   Sur phone : logo + bouton menu → drawer avec liens + profil. Sur tablet/desktop : barre horizontale. 10-foot : liens avec padding/cibles 44px.

4. **Composants UI**  
   CategoryBar, LibraryTabBar : espacements et scroll ; MiniPlayer : barre bas / carte ; ProfileDropdown : cibles 44px.

5. **Grilles**  
   SectionedMasonryGrid et VirtualizedMasonryGrid : `columnWidth` par défaut selon breakpoint ; routes images/documents/library sans `columnWidth` fixe.

6. **i18n**  
   Ajout des libellés du menu (ouvrir / fermer) pour l’accessibilité.

---

## 4. Tests recommandés

### 4.1 Manuel (navigateur / DevTools)

- **Redimensionnement** : faire varier la largeur de 320px à 2560px et vérifier :
  - Navigation : drawer &lt; 600px, barre horizontale ≥ 600px.
  - Contenu : padding et maxWidth du `main` cohérents.
  - CategoryBar / LibraryTabBar : pas de débordement, scroll horizontal si besoin.
  - MiniPlayer : barre en bas sur phone, carte flottante sur desktop.
  - Grilles (images, documents, bibliothèque) : colonnes plus étroites sur phone, plus larges sur TV.
- **Touch** : sur mobile ou émulation “touch”, vérifier que tous les boutons/liens ont une zone cliquable ≥ 44×44px.
- **Focus clavier** : Tab dans la nav, le drawer, le MiniPlayer et le menu profil ; focus visible (outline) et pas de piège au clavier.
- **Safe area** : sur iPhone avec encoche (ou simulateur), vérifier que le contenu ne passe pas sous la barre de statut / home indicator.
- **Réduction du mouvement** : activer “Réduire les animations” (macOS / Windows) et vérifier que le drawer et les transitions restent utilisables (pas d’animation longue).

### 4.2 Accessibilité (a11y)

- **Lecteur d’écran** : menu “Ouvrir / Fermer le menu de navigation” annoncés ; liens de la nav et du drawer avec libellés pertinents.
- **Contraste** : conserver les ratios du thème (WCAG AA) sur tous les breakpoints.
- **Cibles** : vérifier 44×44px minimum pour les contrôles interactifs (boutons, liens principaux, items du menu profil).

### 4.3 Automatisés (à mettre en place si besoin)

- **Tests unitaires** : `useMediaQuery` et `useBreakpoint` avec `window.matchMedia` mocké (valeur initiale + changement).
- **Tests composants** : Navigation (drawer ouvert/fermé selon breakpoint), CategoryBar / LibraryTabBar (pas de crash, styles conditionnels).
- **E2E (Playwright/Cypress)** : un scénario “mobile” (ouvrir menu, naviguer, fermer) et un “desktop” (nav horizontale, pas de drawer).

### 4.4 Performance

- **Pas de layout shift** : le drawer est en `visibility: hidden` quand fermé (pas de flash).
- **SSR** : `useBreakpoint` retourne `'phone'` côté serveur pour éviter une hydratation incorrecte.
- **Grilles** : virtualisation Masonry inchangée ; `columnWidth` par breakpoint évite des colonnes trop larges sur petit écran.

---

## 5. Références

- [WCAG 2.2 – Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) (2.5.5 niveau AAA : 44×44 CSS px).
- [Apple HIG – Layout](https://developer.apple.com/design/human-interface-guidelines/layout) (safe area, tailles minimales).
- [Material Design – Touch targets](https://m3.material.io/foundations/accessible-design/accessibility-basics#44dp-minimum-touch-target-size).
- [10-foot UI](https://developer.android.com/design/ui/tv) : grands écrans, télécommande, focus visible.
