// INFO : app/utils/routes.ts
// Mapping centralisé des catégories vers leurs routes

import type { FileCategory } from '~/utils/file/fileClassifier';

/**
 * Mapping des catégories de fichiers vers leurs routes correspondantes.
 * Images, documents, archives, executables, others → /library avec onglet.
 */
export const CATEGORY_ROUTES: Record<FileCategory, string> = {
    'videos': '/films',
    'musics': '/musics',
    'images': '/library?tab=images',
    'documents': '/library?tab=documents',
    'archives': '/library?tab=archives',
    'executables': '/library?tab=executables',
    'others': '/library?tab=others',
};

/**
 * Obtient la route correspondant à une catégorie
 */
export function getCategoryRoute(category: FileCategory): string {
    return CATEGORY_ROUTES[category] || '/films';
}

/**
 * Obtient la catégorie à partir d'un pathname (et éventuellement search params pour /library)
 */
export function getCategoryFromPathname(pathname: string, searchParams?: URLSearchParams): FileCategory | null {
    if (pathname === '/films' || pathname === '/series') return 'videos';
    if (pathname === '/musics') return 'musics';
    if (pathname === '/library') {
        const tab = searchParams?.get('tab');
        const validTabs = ['images', 'documents', 'archives', 'executables', 'others'] as const;
        if (tab && validTabs.includes(tab)) return tab;
        return 'images'; // default
    }
    return null;
}
