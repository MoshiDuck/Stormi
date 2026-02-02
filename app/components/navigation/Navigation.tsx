// INFO : app/components/Navigation.tsx — barre de navigation moderne avec icônes
import React from 'react';
import { Link, useLocation } from 'react-router';
import type { User } from '~/types/auth';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';
import { ProfileDropdown } from '~/components/navigation/ProfileDropdown';
import { StormiLogo } from '~/components/navigation/StormiLogo';
import {
    Home,
    Upload,
    Film,
    Music,
    Library,
    MonitorPlay,
    type LucideIcon,
} from 'lucide-react';

interface NavigationProps {
    user: User;
    onLogout: () => void;
}

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

function NavLink({
    to,
    label,
    ariaLabel,
    isActive,
    icon: Icon,
}: {
    to: string;
    label: string;
    ariaLabel: string;
    isActive: boolean;
    icon: LucideIcon;
}) {
    return (
        <Link
            to={to}
            prefetch="intent"
            aria-current={isActive ? 'page' : undefined}
            aria-label={ariaLabel}
            className="nav-link"
            style={{
                color: isActive ? darkTheme.accent.blue : darkTheme.text.secondary,
                backgroundColor: isActive ? 'rgba(66, 133, 244, 0.12)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
            }}
        >
            <Icon
                size={18}
                strokeWidth={2.2}
                aria-hidden
                style={{ flexShrink: 0 }}
            />
            <span>{label}</span>
            {isActive && <span className="nav-link-indicator" aria-hidden />}
        </Link>
    );
}

export function Navigation({ user, onLogout }: NavigationProps) {
    const location = useLocation();
    const { t } = useLanguage();

    const isItemActive = (item: NavItemConfig) => {
        if (item.activePaths) {
            return item.activePaths.some((p) => location.pathname === p);
        }
        return location.pathname === item.to;
    };

    return (
        <>
            <nav
                className="nav-bar"
                role="navigation"
                aria-label={t('nav.home')}
            >
                <div className="nav-bar-inner">
                    <div className="nav-bar-left">
                        <Link
                            to="/home"
                            prefetch="intent"
                            aria-label={t('nav.home')}
                            className="nav-logo-link"
                        >
                            <StormiLogo theme="dark" />
                        </Link>

                        <div className="nav-links">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    label={t(item.labelKey)}
                                    ariaLabel={t(item.ariaKey)}
                                    isActive={isItemActive(item)}
                                    icon={item.icon}
                                />
                            ))}
                        </div>
                    </div>

                    <ProfileDropdown user={user} onLogout={onLogout} />
                </div>
            </nav>

            <style>{`
                .nav-bar {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    background: ${darkTheme.background.nav};
                    background: linear-gradient(
                        180deg,
                        ${darkTheme.background.nav} 0%,
                        rgba(21, 21, 21, 0.97) 100%
                    );
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid ${darkTheme.border.primary};
                    padding: 12px 0;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.04);
                }

                .nav-bar-inner {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 12px 0 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 24px;
                }

                .nav-bar-left {
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    min-width: 0;
                }

                .nav-logo-link {
                    display: inline-flex;
                    text-decoration: none;
                    color: inherit;
                }
                .nav-logo-link:focus-visible {
                    outline: none;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    overflow-x: auto;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 2px 0;
                }

                .nav-links::-webkit-scrollbar {
                    display: none;
                }

                .nav-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    border-radius: ${darkTheme.radius.medium};
                    text-decoration: none;
                    font-size: 0.9375rem;
                    transition: ${darkTheme.transition.normal};
                    white-space: nowrap;
                    position: relative;
                }

                .nav-link:hover {
                    background-color: ${darkTheme.background.tertiary} !important;
                    color: ${darkTheme.text.primary} !important;
                }

                .nav-link:focus-visible {
                    outline: 2px solid ${darkTheme.accent.blue};
                    outline-offset: 2px;
                }

                .nav-link-indicator {
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: ${darkTheme.accent.blue};
                }
            `}</style>
        </>
    );
}
