// INFO : app/hooks/useAuth.ts
import { useState, useEffect, useCallback, useContext } from 'react';
import type { ApiAuthResponse, AuthConfig, StreamingProfile } from '~/types/auth';
import { useNavigate } from 'react-router';
import { AuthContext } from '~/contexts/AuthContext';
import { clearLocalCache } from '~/utils/cache/localCache';
import { clearServiceWorkerCache, setServiceWorkerUserId } from '~/utils/cache/serviceWorker';
import { handleCacheInvalidation } from '~/utils/cache/cacheInvalidation';

const STORAGE_ACTIVE_PROFILE = 'stormi_active_profile';

// Type guard pour ApiAuthResponse
function isApiAuthResponse(obj: unknown): obj is ApiAuthResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'success' in obj &&
        typeof (obj as any).success === 'boolean'
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context !== undefined) return context;

    const [user, setUser] = useState<ApiAuthResponse['user'] | null>(null);
    const [activeProfile, setActiveProfileState] = useState<StreamingProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const setActiveProfile = useCallback((profile: StreamingProfile | null) => {
        setActiveProfileState(profile);
        if (profile) {
            localStorage.setItem(STORAGE_ACTIVE_PROFILE, JSON.stringify(profile));
        } else {
            localStorage.removeItem(STORAGE_ACTIVE_PROFILE);
        }
    }, []);

    const clearActiveProfile = useCallback(() => {
        setActiveProfileState(null);
        localStorage.removeItem(STORAGE_ACTIVE_PROFILE);
    }, []);

    const hasSelectedProfile = useCallback(() => {
        return !!activeProfile?.id && activeProfile.account_id === user?.id;
    }, [activeProfile, user?.id]);

    // Charger l'utilisateur et le profil actif depuis localStorage au démarrage
    useEffect(() => {
        const storedUser = localStorage.getItem('stormi_user');
        const storedToken = localStorage.getItem('stormi_token');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                const storedProfile = localStorage.getItem(STORAGE_ACTIVE_PROFILE);
                if (storedProfile) {
                    try {
                        const profile = JSON.parse(storedProfile) as StreamingProfile;
                        if (profile?.id && profile.account_id === parsedUser?.id) {
                            setActiveProfileState(profile);
                        } else {
                            localStorage.removeItem(STORAGE_ACTIVE_PROFILE);
                        }
                    } catch {
                        localStorage.removeItem(STORAGE_ACTIVE_PROFILE);
                    }
                }

                if (parsedUser?.id) {
                    setServiceWorkerUserId(parsedUser.id);
                }
            } catch (e) {
                localStorage.removeItem('stormi_token');
                localStorage.removeItem('stormi_user');
                localStorage.removeItem(STORAGE_ACTIVE_PROFILE);
                setUser(null);
                setActiveProfileState(null);
            }
        }
        setLoading(false);
    }, []);

    const handleAuthWithToken = useCallback(async (idToken: string, config: AuthConfig) => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${config.baseUrl}/api/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            const data: unknown = await res.json();

            if (!isApiAuthResponse(data)) {
                throw new Error('Réponse d\'authentification invalide');
            }

            if (!data.success || !data.token) {
                throw new Error(data.error || 'Échec de l\'authentification');
            }

            // Stocker les données minimales
            const completeUser = {
                id: data.user?.id || '',
                email: data.user?.email,
                name: data.user?.name,
                picture: data.user?.picture,
                email_verified: data.user?.email_verified
            };

            localStorage.setItem('stormi_user', JSON.stringify(completeUser));
            localStorage.setItem('stormi_token', data.token);
            setUser(completeUser);

            if (completeUser.id) {
                setServiceWorkerUserId(completeUser.id);
            }

            // Après login : sélection de profil (pas d'entrée directe dans l'app)
            navigate('/select-profile');
        } catch (err: any) {
            setError(err.message || 'Erreur d\'authentification');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        const userId = user?.id;
        
        // Nettoyer le cache local (IndexedDB)
        if (userId) {
            try {
                await clearLocalCache(userId);
                // Invalider via le système d'invalidation pour notifier les composants
                await handleCacheInvalidation({
                    type: 'user:logout',
                    userId: userId,
                });
            } catch (error) {
                console.error('❌ Erreur nettoyage cache local:', error);
            }
        }
        
        // Nettoyer le cache Service Worker
        try {
            await clearServiceWorkerCache(userId);
        } catch (error) {
            console.error('❌ Erreur nettoyage cache Service Worker:', error);
        }
        
        // Nettoyer localStorage
        localStorage.removeItem('stormi_token');
        localStorage.removeItem('stormi_user');
        localStorage.removeItem(STORAGE_ACTIVE_PROFILE);

        // Nettoyer sessionStorage (stats cache)
        if (typeof window !== 'undefined') {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('stormi_')) {
                    sessionStorage.removeItem(key);
                }
            });
        }
        
        setUser(null);
        setActiveProfileState(null);
        setError(null);
        navigate('/login');
    }, [navigate, user?.id]);

    const isAuthenticated = !!user;

    return {
        user,
        activeProfile,
        setActiveProfile,
        clearActiveProfile,
        hasSelectedProfile,
        loading,
        error,
        setError,
        handleAuthWithToken,
        logout,
        isAuthenticated,
    };
}