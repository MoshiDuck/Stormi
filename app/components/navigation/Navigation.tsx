// INFO : app/components/Navigation.tsx — menu profil au survol (Manage profile, Account, Help center)
import React from 'react';
import { Link, useLocation } from 'react-router';
import type { User } from '~/types/auth';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';
import { ProfileDropdown } from '~/components/navigation/ProfileDropdown';

interface NavigationProps {
    user: User;
    onLogout: () => void;
}

export function Navigation({ user, onLogout }: NavigationProps) {
    const location = useLocation();
    const { t } = useLanguage();

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            {/* PrefetchPageLinks désactivé : causait des centaines de requêtes __manifest
                et ERR_INSUFFICIENT_RESOURCES / ERR_HTTP2_PROTOCOL_ERROR sur certaines configs.
                prefetch="intent" sur les Links reste actif (prefetch au survol uniquement). */}
        <nav style={{
            backgroundColor: darkTheme.background.nav,
            padding: '16px 0',
            marginBottom: '30px',
            boxShadow: darkTheme.shadow.small
        }}>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '0 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                    <Link
                        to="/home"
                        prefetch="intent"
                        aria-label={t('nav.home')}
                        style={{
                            color: darkTheme.text.primary,
                            textDecoration: 'none',
                            fontSize: '22px',
                            fontWeight: '700',
                            letterSpacing: '-0.5px',
                            transition: darkTheme.transition.normal
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                        }}
                    >
                        Stormi
                    </Link>

                    <div style={{ display: 'flex', gap: '20px' }}>
                    <Link
                        to="/home"
                        prefetch="intent"
                        aria-current={isActive('/home') ? 'page' : undefined}
                        aria-label={t('nav.homeAriaLabel')}
                        style={{
                                color: isActive('/home') ? darkTheme.accent.blue : darkTheme.text.secondary,
                                textDecoration: 'none',
                                padding: '10px 16px',
                                borderRadius: darkTheme.radius.medium,
                                backgroundColor: isActive('/home') ? darkTheme.surface.info : 'transparent',
                                transition: darkTheme.transition.normal,
                                fontWeight: isActive('/home') ? '600' : '500',
                                fontSize: '15px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/home')) {
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    e.currentTarget.style.color = darkTheme.text.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/home')) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                }
                            }}
                        >
                            {t('nav.home')}
                        </Link>

                        <Link
                            to="/upload"
                            prefetch="intent"
                            aria-current={isActive('/upload') ? 'page' : undefined}
                            aria-label={t('nav.addAriaLabel')}
                            style={{
                                color: isActive('/upload') ? darkTheme.accent.blue : darkTheme.text.secondary,
                                textDecoration: 'none',
                                padding: '10px 16px',
                                borderRadius: darkTheme.radius.medium,
                                backgroundColor: isActive('/upload') ? darkTheme.surface.info : 'transparent',
                                transition: darkTheme.transition.normal,
                                fontWeight: isActive('/upload') ? '600' : '500',
                                fontSize: '15px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/upload')) {
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    e.currentTarget.style.color = darkTheme.text.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/upload')) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                }
                            }}
                        >
                            {t('nav.add')}
                        </Link>

                        <Link
                            to="/films"
                            aria-label={t('nav.watchAriaLabel')}
                            prefetch="intent"
                            aria-current={isActive('/films') || isActive('/series') ? 'page' : undefined}
                            style={{
                                color: isActive('/films') || isActive('/series') ? darkTheme.accent.blue : darkTheme.text.secondary,
                                textDecoration: 'none',
                                padding: '10px 16px',
                                borderRadius: darkTheme.radius.medium,
                                backgroundColor: isActive('/films') || isActive('/series') ? darkTheme.surface.info : 'transparent',
                                transition: darkTheme.transition.normal,
                                fontWeight: isActive('/films') || isActive('/series') ? '600' : '500',
                                fontSize: '15px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/films') && !isActive('/series')) {
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    e.currentTarget.style.color = darkTheme.text.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/films') && !isActive('/series')) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                }
                            }}
                        >
                            {t('nav.watch')}
                        </Link>

                        <Link
                            to="/musics"
                            aria-label={t('nav.listenAriaLabel')}
                            prefetch="intent"
                            aria-current={isActive('/musics') ? 'page' : undefined}
                            style={{
                                color: isActive('/musics') ? darkTheme.accent.blue : darkTheme.text.secondary,
                                textDecoration: 'none',
                                padding: '10px 16px',
                                borderRadius: darkTheme.radius.medium,
                                backgroundColor: isActive('/musics') ? darkTheme.surface.info : 'transparent',
                                transition: darkTheme.transition.normal,
                                fontWeight: isActive('/musics') ? '600' : '500',
                                fontSize: '15px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/musics')) {
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    e.currentTarget.style.color = darkTheme.text.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/musics')) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                }
                            }}
                        >
                            {t('nav.listen')}
                        </Link>

                        <Link
                            to="/library"
                            aria-label={t('nav.libraryAriaLabel')}
                            prefetch="intent"
                            aria-current={isActive('/library') ? 'page' : undefined}
                            style={{
                                color: isActive('/library') ? darkTheme.accent.blue : darkTheme.text.secondary,
                                textDecoration: 'none',
                                padding: '10px 16px',
                                borderRadius: darkTheme.radius.medium,
                                backgroundColor: isActive('/library') ? darkTheme.surface.info : 'transparent',
                                transition: darkTheme.transition.normal,
                                fontWeight: isActive('/library') ? '600' : '500',
                                fontSize: '15px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/library')) {
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    e.currentTarget.style.color = darkTheme.text.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/library')) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                }
                            }}
                        >
                            {t('nav.library')}
                        </Link>

                        <Link
                            to="/lecteur-local"
                            prefetch="intent"
                            aria-current={isActive('/lecteur-local') ? 'page' : undefined}
                            aria-label={t('nav.localPlayerAriaLabel')}
                            style={{
                                color: isActive('/lecteur-local') ? darkTheme.accent.blue : darkTheme.text.secondary,
                                textDecoration: 'none',
                                padding: '10px 16px',
                                borderRadius: darkTheme.radius.medium,
                                backgroundColor: isActive('/lecteur-local') ? darkTheme.surface.info : 'transparent',
                                transition: darkTheme.transition.normal,
                                fontWeight: isActive('/lecteur-local') ? '600' : '500',
                                fontSize: '15px'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive('/lecteur-local')) {
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                    e.currentTarget.style.color = darkTheme.text.primary;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive('/lecteur-local')) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                }
                            }}
                        >
                            {t('nav.localPlayer')}
                        </Link>
                    </div>
                </div>

                <ProfileDropdown user={user} onLogout={onLogout} />
            </div>
        </nav>
        </>
    );
}