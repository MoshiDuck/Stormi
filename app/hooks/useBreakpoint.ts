// INFO : app/hooks/useBreakpoint.ts
// Hook pour le breakpoint desktop actif (narrow | desktop | wide) selon la largeur de fenêtre

import { useMediaQuery } from './useMediaQuery';
import { MEDIA_MIN } from '~/utils/ui/breakpoints';
import type { BreakpointName } from '~/utils/ui/breakpoints';

/**
 * Retourne le breakpoint actif : narrow (< 1280px), desktop (1280–1599px), wide (≥ 1600px).
 * SSR : retourne 'desktop'.
 */
export function useBreakpoint(): BreakpointName {
    const isDesktop = useMediaQuery(MEDIA_MIN.desktop);
    const isWide = useMediaQuery(MEDIA_MIN.wide);

    if (isWide) return 'wide';
    if (isDesktop) return 'desktop';
    return 'narrow';
}
