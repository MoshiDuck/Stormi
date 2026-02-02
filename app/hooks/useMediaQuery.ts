// INFO : app/hooks/useMediaQuery.ts
// Hook pour media queries (SSR-safe, pas de flash)

import { useState, useEffect } from 'react';

/**
 * Retourne true si la media query correspond.
 * Côté SSR : retourne false (pas de window). Au montage, met à jour avec la vraie valeur.
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            setMatches(false);
            return;
        }
        const mql = window.matchMedia(query);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        setMatches(mql.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);

    return matches;
}
