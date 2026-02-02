/**
 * Layout principal authentifié : shell commun à toutes les pages app (home, upload, films, etc.).
 * - AuthGuard : protège toutes les routes enfants ; si non connecté → affiche SplashScreen puis redirection /login
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
import { AuthGuard } from '~/components/auth/AuthGuard';
import { Navigation } from '~/components/navigation/Navigation';
import { PageTransition } from '~/components/navigation/PageTransition';
import { AppLayoutLoadingBar } from '~/components/navigation/AppLayoutLoadingBar';
import { darkTheme } from '~/utils/ui/theme';

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigation = useNavigation();
    const location = useLocation();
    const mainRef = useRef<HTMLElement>(null);
    const isNavigating = navigation.state === 'loading';

    // Focus sur le contenu principal après chaque navigation (a11y : clavier / lecteur d'écran)
    useEffect(() => {
        if (navigation.state === 'idle' && mainRef.current) {
            mainRef.current.focus({ preventScroll: true });
        }
    }, [location.pathname, location.search, navigation.state]);

    return (
        <AuthGuard>
            <div style={{ minHeight: '100vh', backgroundColor: darkTheme.background.primary }}>
                <AppLayoutLoadingBar visible={isNavigating} />
                <Navigation user={user!} onLogout={logout} />
                <main
                    ref={mainRef}
                    tabIndex={-1}
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0 20px 40px',
                        fontFamily: 'system-ui, sans-serif',
                        outline: 'none',
                        opacity: isNavigating ? 0 : 1,
                        transition: 'opacity 0.12s ease-out',
                        pointerEvents: isNavigating ? 'none' : 'auto',
                    }}
                    role="main"
                    id="main-content"
                >
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </main>
            </div>
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
              ? (error.statusText as string) || `Erreur ${error.status ?? 500}`
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
                    href="/home"
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
