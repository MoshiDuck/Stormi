// INFO : app/components/ui/categoryBar.tsx
// Composant réutilisable pour la barre de sélection de catégories

import React from 'react';
import { darkTheme } from '~/utils/ui/theme';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import type { FileCategory } from '~/utils/file/fileClassifier';
import { useFilesPreloader } from '~/hooks/useFilesPreloader';
import { useAuth } from '~/hooks/useAuth';
import { useLanguage } from '~/contexts/LanguageContext';
import { Tooltip } from '~/components/ui/Tooltip';

const CATEGORY_ICONS: Record<FileCategory, string> = {
    videos: '🎬',
    musics: '🎵',
    images: '🖼️',
    documents: '📄',
    archives: '📦',
    executables: '⚙️',
    others: '📎'
};

interface CategoryBarProps {
    selectedCategory: FileCategory;
    onCategoryChange: (category: FileCategory) => void;
}

const CATEGORIES: FileCategory[] = ['videos', 'musics', 'images', 'documents', 'archives', 'executables', 'others'];

export function CategoryBar({ selectedCategory, onCategoryChange }: CategoryBarProps) {
    const { user } = useAuth();
    const { t } = useLanguage();
    const breakpoint = useBreakpoint();
    const { preloadCategory } = useFilesPreloader({ 
        userId: user?.id || null, 
        enabled: !!user?.id,
        preloadOnHover: true 
    });

    return (
        <div style={{
            backgroundColor: darkTheme.background.secondary,
            borderRadius: breakpoint === 'phone' ? '10px' : '12px',
            padding: breakpoint === 'phone' ? 12 : 20,
            marginBottom: breakpoint === 'phone' ? 20 : 30,
            boxShadow: darkTheme.shadow.medium,
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
        }}>
            <div style={{
                display: 'flex',
                gap: breakpoint === 'phone' ? 8 : 12,
                flexWrap: 'wrap',
                alignItems: 'center',
                minWidth: 'min-content',
            }}>
                {CATEGORIES.map(category => {
                    const hint = t(`categories.${category}Hint` as keyof typeof t);
                    return (
                        <Tooltip
                            key={category}
                            content={typeof hint === 'string' && hint ? hint : t(`categories.${category}`)}
                            position="bottom"
                            delay={400}
                        >
                            <button
                                onClick={() => onCategoryChange(category)}
                                onMouseEnter={() => {
                                    if (selectedCategory !== category) {
                                        preloadCategory(category);
                                    }
                                }}
                                aria-current={selectedCategory === category ? 'page' : undefined}
                                aria-label={`${t(`categories.${category}`)}${typeof hint === 'string' && hint ? ` — ${hint}` : ''}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    borderRadius: darkTheme.radius.medium,
                                    border: '2px solid transparent',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    backgroundColor: selectedCategory === category
                                        ? darkTheme.accent.blue
                                        : darkTheme.background.tertiary,
                                    color: selectedCategory === category
                                        ? '#fff'
                                        : darkTheme.text.primary,
                                    transition: darkTheme.transition.normal,
                                    boxShadow: selectedCategory === category
                                        ? darkTheme.shadow.small
                                        : 'none'
                                }}
                                onMouseOver={(e) => {
                                    if (selectedCategory !== category) {
                                        e.currentTarget.style.backgroundColor = darkTheme.border.secondary;
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (selectedCategory !== category) {
                                        e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    }
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.outline = `2px solid ${darkTheme.accent.blue}`;
                                    e.currentTarget.style.outlineOffset = '2px';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.outline = 'none';
                                    e.currentTarget.style.outlineOffset = '0';
                                }}
                            >
                                <span>{CATEGORY_ICONS[category]}</span>
                                <span>{t(`categories.${category}`)}</span>
                            </button>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}

export { CATEGORIES, CATEGORY_ICONS };
