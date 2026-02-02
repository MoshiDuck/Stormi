// INFO : app/components/navigation/BottomNav.tsx
// Barre de navigation en bas pour téléphone et tablette : icônes + libellés, indicateur sous l’icône active

import React from 'react';
import { Link, useLocation } from 'react-router';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';
import { TOUCH_TARGET_MIN, BOTTOM_NAV_HEIGHT } from '~/utils/ui/breakpoints';
import {
    Home,
    Upload,
    Film,
    Music,
    Library,
    MonitorPlay,
    type LucideIcon,
} from 'lucide-react';

interface NavItemConfig {
    to: string;
    labelKey: string;
    ariaKey: string;
    icon: LucideIcon;
    activePaths?: string[];
}

const navItems: NavItemConfig[] = [
    { to: '/home', labelKey: 'nav.home', ariaKey: 'nav.homeAriaLabel', icon: Home },
    { to: '/upload', labelKey: 'nav.add', ariaKey: 'nav.addAriaLabel', icon: Upload },
    {
        to: '/films',
        labelKey: 'nav.watch',
        ariaKey: 'nav.watchAriaLabel',
        icon: Film,
        activePaths: ['/films', '/series'],
    },
    { to: '/musics', labelKey: 'nav.listen', ariaKey: 'nav.listenAriaLabel', icon: Music },
    { to: '/library', labelKey: 'nav.library', ariaKey: 'nav.libraryAriaLabel', icon: Library },
    {
        to: '/lecteur-local',
        labelKey: 'nav.localPlayer',
        ariaKey: 'nav.localPlayerAriaLabel',
        icon: MonitorPlay,
    },
];

export function BottomNav() {
    const location = useLocation();
    const { t } = useLanguage();

    const isItemActive = (item: NavItemConfig) => {
        if (item.activePaths) return item.activePaths.some((p) => location.pathname === p);
        return location.pathname === item.to;
    };

    return (
        <nav
            role="navigation"
            aria-label={t('nav.home')}
            className="bottom-nav"
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: BOTTOM_NAV_HEIGHT,
                paddingBottom: 'env(safe-area-inset-bottom, 0)',
                backgroundColor: darkTheme.background.nav,
                borderTop: `1px solid ${darkTheme.border.primary}`,
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'space-around',
                zIndex: 90,
                boxShadow: '0 -1px 0 0 rgba(255,255,255,0.04)',
                boxSizing: 'content-box',
            }}
        >
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);
                const label = t(item.labelKey);
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        prefetch="intent"
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={t(item.ariaKey)}
                        className="bottom-nav-item"
                        style={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            padding: '6px 4px 8px',
                            textDecoration: 'none',
                            color: isActive ? darkTheme.accent.blue : darkTheme.text.tertiary,
                            fontWeight: isActive ? 600 : 500,
                            fontSize: 10,
                            lineHeight: 1.2,
                            transition: 'color 0.2s ease',
                            minHeight: TOUCH_TARGET_MIN,
                            position: 'relative',
                        }}
                    >
                        <span
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 28,
                                height: 28,
                                flexShrink: 0,
                            }}
                        >
                            <Icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                aria-hidden
                            />
                        </span>
                        <span
                            style={{
                                maxWidth: '100%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                minHeight: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isActive ? label : null}
                        </span>
                        {isActive && (
                            <span
                                aria-hidden
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 24,
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                    backgroundColor: darkTheme.accent.blue,
                                }}
                            />
                        )}
                    </Link>
                );
            })}
            <style>{`
                .bottom-nav-item:hover {
                    color: ${darkTheme.text.primary} !important;
                }
                .bottom-nav-item:focus-visible {
                    outline: 2px solid ${darkTheme.accent.blue};
                    outline-offset: -2px;
                }
                .bottom-nav-item[aria-current="page"] {
                    color: ${darkTheme.accent.blue};
                }
            `}</style>
        </nav>
    );
}
