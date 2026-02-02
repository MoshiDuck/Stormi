// INFO : app/utils/ui/breakpoints.ts
// Breakpoints responsive : téléphone, tablette, desktop, TV (10-foot UI)
// Alignés sur les meilleures pratiques (WCAG, Apple HIG, Material)

/** Noms des breakpoints pour usage dans les hooks et composants */
export type BreakpointName = 'phone' | 'tablet' | 'desktop' | 'tv';

/** Valeurs en px (min-width) pour media queries */
export const BREAKPOINTS = {
    /** < 600px : téléphone (portrait / petite largeur) */
    phone: 0,
    /** 600–1023px : tablette */
    tablet: 600,
    /** 1024–1919px : desktop */
    desktop: 1024,
    /** ≥ 1920px : TV / grand écran (10-foot UI) */
    tv: 1920,
} as const;

/** Media query (min-width) pour chaque breakpoint (phone = base, pas de media) */
export const MEDIA_MIN = {
    tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
    desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
    tv: `(min-width: ${BREAKPOINTS.tv}px)`,
} as const;

/** Media query (max-width) pour mobile-first : "en dessous de X" */
export const MEDIA_MAX = {
    phone: `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
    tablet: `(max-width: ${BREAKPOINTS.desktop - 1}px)`,
    desktop: `(max-width: ${BREAKPOINTS.tv - 1}px)`,
} as const;

/** 10-foot UI : pointer grossier OU grand écran (télécommande / tactile à distance) */
export const MEDIA_TEN_FOOT = `(min-width: ${BREAKPOINTS.tv}px), (pointer: coarse) and (min-width: ${BREAKPOINTS.desktop}px)`;

/** Cible tactile minimum (WCAG 2.5.5 niveau AAA, Apple 44pt) */
export const TOUCH_TARGET_MIN = 44;

/** Espacement main responsive (padding du contenu) */
export const CONTENT_PADDING = {
    phone: 12,
    tablet: 20,
    desktop: 24,
    tv: 32,
} as const;

/** Largeur max du contenu principal */
export const CONTENT_MAX_WIDTH = {
    phone: 0, // 100%
    tablet: 900,
    desktop: 1200,
    tv: 1400,
} as const;

/** Hauteur de la barre de navigation basse (téléphone / tablette) */
export const BOTTOM_NAV_HEIGHT = 64;

/** Hauteur approximative de la barre de navigation du haut (pour padding-top du main quand la barre est fixed) */
export const NAV_TOP_HEIGHT = 60;

/** Marge de sécurité sous la barre du haut pour éviter que le contenu soit masqué (scroll, zoom, etc.) */
export const NAV_TOP_SAFETY = 12;
