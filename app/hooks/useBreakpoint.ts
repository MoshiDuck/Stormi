// INFO : app/hooks/useBreakpoint.ts
// Hook pour le breakpoint actif (phone | tablet | desktop | tv)

import { useMediaQuery } from './useMediaQuery';
import { MEDIA_MIN } from '~/utils/ui/breakpoints';
import type { BreakpointName } from '~/utils/ui/breakpoints';

/**
 * Retourne le nom du breakpoint actif (mobile-first : plus grande largeur qui matche).
 * SSR : retourne 'phone'.
 */
export function useBreakpoint(): BreakpointName {
    const isTablet = useMediaQuery(MEDIA_MIN.tablet);
    const isDesktop = useMediaQuery(MEDIA_MIN.desktop);
    const isTv = useMediaQuery(MEDIA_MIN.tv);

    if (isTv) return 'tv';
    if (isDesktop) return 'desktop';
    if (isTablet) return 'tablet';
    return 'phone';
}

/**
 * True si l'écran est considéré 10-foot (TV ou grand écran / pointer coarse).
 */
export function useIsTenFoot(): boolean {
    const isTv = useMediaQuery(MEDIA_MIN.tv);
    const isCoarseDesktop = useMediaQuery('(pointer: coarse) and (min-width: 1024px)');
    return isTv || isCoarseDesktop;
}
