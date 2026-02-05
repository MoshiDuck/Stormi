// INFO : workers/utils.ts
type GoogleTokenPayload = {
    azp?: string;
    aud?: string;
    sub?: string;
    email?: string;
    email_verified?: string | boolean;
    name?: string;
    picture?: string;
    given_name?: string;
    family_name?: string;
    iat?: string;
    exp?: string;
};

// Fonctions d'authentification Google
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload | null> {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const res = await fetch(url);
    return res.ok ? (await res.json() as GoogleTokenPayload) : null;
}

export function generateGoogleAuthUrl(
    clientId: string,
    redirectUri: string,
    nonce: string,
    options?: { prompt?: string }
): URL {
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', nonce);

    if (options?.prompt) {
        authUrl.searchParams.set('prompt', options.prompt);
    }

    return authUrl;
}

// Fonctions pour les en-têtes HTTP
export function corsHeaders(methods: string = 'GET, OPTIONS'): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': 'Content-Type'
    };
}

export function noCacheHeaders(): Record<string, string> {
    return {
        'Cache-Control': 'no-store',
        ...corsHeaders('GET, OPTIONS')
    };
}

// Fonctions JWT
function base64UrlEncode(input: string): string {
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlFromArrayBuffer(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createJWTAsync(
    payloadData: Record<string, any>,
    secret: string,
    opts?: { expiresInSeconds?: number }
): Promise<string> {
    const header = { alg: 'HS256', typ: 'JWT' };
    const iat = Math.floor(Date.now() / 1000);
    const payload: Record<string, any> = { iat, ...payloadData };

    if (opts?.expiresInSeconds) {
        payload.exp = iat + opts.expiresInSeconds;
    }

    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const toSign = `${headerB64}.${payloadB64}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(toSign));
    const sigB64 = base64UrlFromArrayBuffer(sig);

    return `${toSign}.${sigB64}`;
}

function base64UrlDecode(input: string): string {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) base64 += '='.repeat(4 - pad);
    return atob(base64);
}

/** Payload JWT Stormi (sub = account id Google). */
export interface JwtPayload {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    email_verified?: boolean;
    iat?: number;
    exp?: number;
}

/**
 * Vérifie et décode un JWT Stormi. Retourne le payload ou null si invalide/expiré.
 */
export async function verifyJWTAsync(token: string, secret: string): Promise<JwtPayload | null> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const [, payloadB64, sigB64] = parts;
        const toSign = `${parts[0]}.${payloadB64}`;
        const payloadJson = base64UrlDecode(payloadB64);
        const payload = JSON.parse(payloadJson) as JwtPayload;
        if (payload.exp != null && payload.exp < Math.floor(Date.now() / 1000)) return null;

        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        const sigBin = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
        const ok = await crypto.subtle.verify('HMAC', key, sigBin, enc.encode(toSign));
        return ok ? payload : null;
    } catch {
        return null;
    }
}

// ——— Code PIN (4 chiffres) : stockage sécurisé PBKDF2 ———
const PIN_PBKDF2_ITERATIONS = 100_000;
const PIN_SALT_BYTES = 16;
const PIN_HASH_BYTES = 32;

/** Génère un sel aléatoire pour le PIN (base64). */
export function generatePinSalt(): string {
    const bytes = new Uint8Array(PIN_SALT_BYTES);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Hash le PIN avec PBKDF2 (salt en base64url, retourne hash en base64url). */
export async function hashPin(saltB64: string, pin: string): Promise<string> {
    const saltBin = Uint8Array.from(atob(saltB64.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(pin),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const derived = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBin,
            iterations: PIN_PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        key,
        PIN_HASH_BYTES * 8
    );
    const hash = btoa(String.fromCharCode(...new Uint8Array(derived))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return hash;
}

/** Vérifie un PIN contre un hash stocké. */
export async function verifyPin(saltB64: string, storedHashB64: string, pin: string): Promise<boolean> {
    const computed = await hashPin(saltB64, pin);
    return computed === storedHashB64;
}

/** Valide le format PIN (4 chiffres). */
export function isValidPinFormat(pin: string): boolean {
    return /^\d{4}$/.test(pin);
}