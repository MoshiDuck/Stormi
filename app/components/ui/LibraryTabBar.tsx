// INFO : app/components/ui/LibraryTabBar.tsx
// Barre d'onglets pour la page Bibliothèque (ordre : usage décroissant — IA Phase 2)

import React from 'react';
import { useSearchParams } from 'react-router';
import { darkTheme } from '~/utils/ui/theme';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { useLanguage } from '~/contexts/LanguageContext';
import type { FileCategory } from '~/utils/file/fileClassifier';

export type LibraryTab = 'images' | 'documents' | 'archives' | 'executables' | 'others';

/** Ordre recommandé : Images, Documents, Archives, Autres, Exécutables (usage décroissant). */
const LIBRARY_TABS: Array<{ key: LibraryTab; category: FileCategory; icon: string }> = [
    { key: 'images', category: 'images', icon: '🖼️' },
    { key: 'documents', category: 'documents', icon: '📄' },
    { key: 'archives', category: 'archives', icon: '📦' },
    { key: 'others', category: 'others', icon: '📎' },
    { key: 'executables', category: 'executables', icon: '⚙️' },
];

interface LibraryTabBarProps {
    selectedTab: LibraryTab;
    onTabChange?: (tab: LibraryTab) => void;
}

export function LibraryTabBar({ selectedTab, onTabChange }: LibraryTabBarProps) {
    const { t } = useLanguage();
    const breakpoint = useBreakpoint();
    const [, setSearchParams] = useSearchParams();

    const handleTabClick = (tab: LibraryTab) => {
        onTabChange?.(tab);
        setSearchParams({ tab });
    };

    return (
        <div
            style={{
                display: 'flex',
                gap: breakpoint === 'narrow' ? 6 : 8,
                marginBottom: breakpoint === 'narrow' ? 16 : 24,
                padding: breakpoint === 'narrow' ? 4 : 6,
                backgroundColor: darkTheme.background.tertiary,
                borderRadius: breakpoint === 'narrow' ? 10 : 12,
                width: 'fit-content',
                maxWidth: '100%',
                flexWrap: 'wrap',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
            }}
            role="tablist"
            aria-label={t('nav.library')}
        >
            {LIBRARY_TABS.map(({ key, category, icon }) => {
                const isSelected = selectedTab === key;
                return (
                    <button
                        key={key}
                        role="tab"
                        aria-selected={isSelected}
                        aria-controls={`library-${key}-panel`}
                        id={`library-tab-${key}`}
                        onClick={() => handleTabClick(key)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: breakpoint === 'narrow' ? '10px 14px' : '10px 20px',
                            backgroundColor: isSelected ? darkTheme.accent.blue : 'transparent',
                            color: isSelected ? '#fff' : darkTheme.text.secondary,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: isSelected ? '600' : '500',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = darkTheme.background.secondary;
                                e.currentTarget.style.color = darkTheme.text.primary;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = darkTheme.text.secondary;
                            }
                        }}
                    >
                        <span>{icon}</span>
                        <span>{t(`categories.${category}`)}</span>
                    </button>
                );
            })}
        </div>
    );
}

export { LIBRARY_TABS };
