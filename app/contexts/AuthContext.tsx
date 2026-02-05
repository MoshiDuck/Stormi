// INFO : app/contexts/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '~/hooks/useAuth';
import type { StreamingProfile } from '~/types/auth';

interface AuthContextType {
    user: any;
    activeProfile: StreamingProfile | null;
    setActiveProfile: (profile: StreamingProfile | null) => void;
    clearActiveProfile: () => void;
    hasSelectedProfile: () => boolean;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    logout: () => void;
    setError: (error: string | null) => void;
    handleAuthWithToken: (token: string, config: any) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext doit être utilisé à l\'intérieur de AuthProvider');
    }
    return context;
}