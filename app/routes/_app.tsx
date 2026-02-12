/**
 * Layout principal authentifié : shell commun à toutes les pages app (home, upload, films, etc.).
 * - AuthGuard : protège toutes les routes enfants ; si non connecté → affiche SplashScreen puis redirection /login
 * - ThemeProvider : thème par utilisateur (light, dark, grey), persistance localStorage
 * - Navigation : barre de navigation avec prefetch
 * - Indicateur de chargement global pendant les navigations
 * - Transition de page : le main disparaît pendant le chargement (opacity 0), puis la nouvelle page apparaît en fondu (évite de voir deux pages en même temps)
 * - Focus a11y : après navigation, focus sur #main-content
 * - ErrorBoundary pour les erreurs dans les routes enfants
 */
import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigation, useLocation, useRouteError } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useLanguage } from '~/contexts/LanguageContext';
import { replacePlaceholders } from '~/utils/i18n';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { AuthGuard } from '~/components/auth/AuthGuard';
import { ThemeProvider, useTheme } from '~/contexts/ThemeContext';
import { Navigation } from '~/components/navigation/Navigation';
import { PageTransition } from '~/components/navigation/PageTransition';
import { AppLayoutLoadingBar } from '~/components/navigation/AppLayoutLoadingBar';
import { darkTheme } from '~/utils/ui/theme';
import { CONTENT_PADDING, CONTENT_MAX_WIDTH, MAIN_TOP_OFFSET } from '~/utils/ui/breakpoints';

function AppLayoutContent() {
    const { user, activeProfile, logout, clearActiveProfile } = useAuth();
    const { theme } = useTheme();
    const navigation = useNavigation();
    const location = useLocation();
    const mainRef = useRef<HTMLElement>(null);
    const breakpoint = useBreakpoint();
    const isNavigating = navigation.state === 'loading';
    const padding = CONTENT_PADDING[breakpoint];
    const maxWidth = CONTENT_MAX_WIDTH[breakpoint];

    useEffect(() => {
        if (navigation.state === 'idle' && mainRef.current) {
            mainRef.current.focus({ preventScroll: true });
        }
    }, [location.pathname, location.search, navigation.state]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: theme.background.primary }}>
            <AppLayoutLoadingBar visible={isNavigating} />
            <Navigation user={user!} activeProfile={activeProfile} onLogout={logout} onSwitchProfile={clearActiveProfile} />
            <main
                ref={mainRef}
                tabIndex={-1}
                style={{
                    maxWidth: maxWidth || undefined,
                    width: '100%',
                    margin: '0 auto',
                    paddingTop: `calc(${MAIN_TOP_OFFSET}px + env(safe-area-inset-top, 0px))`,
                    paddingLeft: padding,
                    paddingRight: padding,
                    paddingBottom: 40,
                    fontFamily: 'system-ui, sans-serif',
                    outline: 'none',
                    opacity: isNavigating ? 0 : 1,
                    transition: 'opacity 0.12s ease-out',
                    pointerEvents: isNavigating ? 'none' : 'auto',
                    boxSizing: 'border-box',
                    minHeight: 0,
                    overflowX: 'hidden',
                }}
                role="main"
                id="main-content"
            >
                <PageTransition key={location.pathname}>
                    <Outlet />
                </PageTransition>
            </main>
        </div>
    );
}

export default function AppLayout() {
    return (
        <AuthGuard>
            <ThemeProvider>
                <AppLayoutContent />
            </ThemeProvider>
        </AuthGuard>
    );
}

/**
 * ErrorBoundary au niveau du layout app : erreurs API, loaders, etc.
 * Affiche un message lisible et deux actions : réessayer ou retour à l'accueil.
 */
export function ErrorBoundary() {
    const error = useRouteError() as Error | { status?: number; statusText?: string; data?: unknown } | undefined;
    const { t } = useLanguage();
    const message =
        error instanceof Error
            ? error.message
            : error && typeof error === 'object' && 'statusText' in error
              ? (error.statusText as string) || replacePlaceholders(t('errors.errorWithStatus'), { status: String((error as { status?: number }).status ?? 500) })
              : t('errors.unknown');

    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div
            style={{
                padding: 40,
                textAlign: 'center',
                color: darkTheme.text.primary,
            }}
            role="alert"
        >
            <h2 style={{ marginBottom: 16 }}>{t('errors.title')}</h2>
            <p style={{ color: darkTheme.text.secondary, marginBottom: 24 }}>{message}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
                <button
                    type="button"
                    onClick={handleRetry}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: darkTheme.accent.blue,
                        color: '#fff',
                        border: 'none',
                        borderRadius: darkTheme.radius.medium,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                        transition: darkTheme.transition.normal,
                    }}
                >
                    {t('common.retry')}
                </button>
                <a
                    href="/films"
                    style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        backgroundColor: darkTheme.background.tertiary,
                        color: darkTheme.text.primary,
                        border: `1px solid ${darkTheme.border.secondary}`,
                        borderRadius: darkTheme.radius.medium,
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: 14,
                        transition: darkTheme.transition.normal,
                    }}
                >
                    {t('notFound.backHome')}
                </a>
            </div>
        </div>
    );
}
