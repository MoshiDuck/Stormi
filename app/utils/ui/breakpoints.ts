// INFO : app/utils/ui/breakpoints.ts
// Responsive desktop uniquement (web) — fenêtre étroite / standard / large. Mobile = Flutter.

/** Noms des breakpoints pour la responsive desktop (taille de fenêtre) */
export type BreakpointName = 'narrow' | 'desktop' | 'wide';

/** Seuils min-width en px : narrow < 1280, desktop 1280–1599, wide ≥ 1600 */
export const BREAKPOINTS = {
    desktop: 1280,
    wide: 1600,
} as const;

/** Media queries (min-width) pour useBreakpoint */
export const MEDIA_MIN = {
    desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
    wide: `(min-width: ${BREAKPOINTS.wide}px)`,
} as const;

/** Espacement horizontal du contenu selon la largeur (px) */
export const CONTENT_PADDING: Record<BreakpointName, number> = {
    narrow: 20,
    desktop: 24,
    wide: 32,
};

/** Largeur max du contenu principal (px) selon la largeur */
export const CONTENT_MAX_WIDTH: Record<BreakpointName, number> = {
    narrow: 1000,
    desktop: 1200,
    wide: 1600,
};

/** Cible tactile minimum pour liens/boutons (accessibilité) */
export const TOUCH_TARGET_MIN = 44;

/** Hauteur approximative de la barre de navigation du haut (px) */
export const NAV_TOP_HEIGHT = 64;

/** Marge de sécurité sous la barre du haut (px) */
export const NAV_TOP_SAFETY = 24;

/** Offset total du contenu sous la barre du haut (paddingTop du main) */
export const MAIN_TOP_OFFSET = NAV_TOP_HEIGHT + NAV_TOP_SAFETY;
