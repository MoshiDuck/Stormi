// INFO : app/components/AuthGuard.tsx
// Non connecté sur une page protégée → SplashScreen puis /login.
// Connecté sans profil sélectionné → redirection vers /select-profile.
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useLanguage } from '~/contexts/LanguageContext';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { SplashScreen } from '~/components/ui/SplashScreen';

interface AuthGuardProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    redirectTo?: string;
}

export function AuthGuard({
                              children,
                              requireAuth = true,
                              redirectTo = '/splash'
                          }: AuthGuardProps) {
    const { user, loading, hasSelectedProfile } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const hasProfile = hasSelectedProfile();

    // Connecté sur page publique (login) : rediriger vers sélection de profil ou home
    useEffect(() => {
        if (loading) return;
        if (!requireAuth && user) {
            navigate(hasProfile ? '/home' : '/select-profile', { replace: true });
        }
    }, [loading, user, requireAuth, navigate, hasProfile]);

    // Connecté mais pas de profil sélectionné : rediriger vers sélection de profil
    useEffect(() => {
        if (loading) return;
        if (requireAuth && user && !hasProfile && location.pathname !== '/select-profile') {
            navigate('/select-profile', { replace: true });
        }
    }, [loading, user, requireAuth, hasProfile, location.pathname, navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (requireAuth && !user) {
        return <SplashScreen />;
    }

    if (requireAuth && user && !hasProfile) {
        return <LoadingSpinner message={t('selectProfile.loading')} />;
    }

    if (!requireAuth && user) {
        return <LoadingSpinner message={t('splash.redirecting')} />;
    }

    return <>{children}</>;
}