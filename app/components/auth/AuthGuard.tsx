// INFO : app/components/AuthGuard.tsx
// Non connecté sur une page protégée → affichage immédiat du SplashScreen (évite fenêtre noire),
// puis SplashScreen redirige vers /login après le délai.
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
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
    const { user, loading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirection impérative pour "connecté sur page publique" (ex. login → home)
    useEffect(() => {
        if (loading) return;
        if (!requireAuth && user) {
            navigate('/home', { replace: true });
        }
    }, [loading, user, requireAuth, navigate]);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Non connecté : afficher le splash (logo + fond) puis redirection vers /login par SplashScreen
    if (requireAuth && !user) {
        return <SplashScreen />;
    }

    if (!requireAuth && user) {
        return <LoadingSpinner message="Redirection…" />;
    }

    return <>{children}</>;
}