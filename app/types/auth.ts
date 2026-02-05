// INFO : app/types/auth.ts
export interface ApiAuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}

export interface ConfigResponse {
    googleClientId?: string | null;
    tmdbApiKey?: string | null;
    omdbApiKey?: string | null;
    spotifyClientId?: string | null;
    spotifyClientSecret?: string | null;
    discogsApiToken?: string | null;
}

export interface User {
    id: string;
    email?: string;
    name?: string; // Nom complet seulement
    picture?: string;
    email_verified?: boolean | string;
}

/** Profil de type streaming (plusieurs par compte). */
export interface StreamingProfile {
    id: string;
    account_id: string;
    name: string;
    avatar_url: string | null;
    is_main: boolean;
    sort_order: number;
    created_at: number;
    updated_at: number;
}

/** Profil actif en session (stocké après sélection). */
export type ActiveProfile = StreamingProfile;

export interface AuthConfig {
    googleClientId: string | null;
    baseUrl: string;
    redirectUri?: string;
    tmdbApiKey: string | null;
    omdbApiKey: string | null;
    spotifyClientId: string | null;
    spotifyClientSecret: string | null;
    discogsApiToken: string | null;
}