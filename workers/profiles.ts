// INFO : workers/profiles.ts — API profils de type streaming + code PIN (sécurisation profils secondaires)
import { Hono } from 'hono';
import type { Bindings } from './types.js';
import { verifyJWTAsync, hashPin, verifyPin, generatePinSalt, isValidPinFormat } from './utils.js';

const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const PIN_RATE_LIMIT_WINDOW_SEC = 900; // 15 min
const PIN_MAX_ATTEMPTS = 5;

const CREATE_USER_PROFILE_TABLE =
    "CREATE TABLE IF NOT EXISTS user_profile (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, name TEXT NOT NULL, avatar_url TEXT, is_main INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, created_at INTEGER DEFAULT (strftime('%s', 'now')), updated_at INTEGER DEFAULT (strftime('%s', 'now')))";

const CREATE_ACCOUNT_PIN_TABLE =
    "CREATE TABLE IF NOT EXISTS account_pin (account_id TEXT PRIMARY KEY, pin_salt TEXT NOT NULL, pin_hash TEXT NOT NULL)";

const CREATE_PIN_RATE_LIMIT_TABLE =
    "CREATE TABLE IF NOT EXISTS pin_rate_limit (account_id TEXT PRIMARY KEY, attempts_count INTEGER NOT NULL DEFAULT 0, window_start INTEGER NOT NULL)";

function json<T>(c: { json: (body: T, status?: number, headers?: Record<string, string>) => Response }, body: T, status = 200) {
    return c.json(body, status, CORS);
}

type ProfileRow = {
    id: string;
    account_id: string;
    name: string;
    avatar_url: string | null;
    is_main: boolean;
    sort_order: number;
    created_at: number;
    updated_at: number;
};

function toProfileRow(raw: unknown): ProfileRow {
    const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    return {
        id: String(r.id ?? ''),
        account_id: String(r.account_id ?? ''),
        name: String(r.name ?? ''),
        avatar_url: r.avatar_url != null && r.avatar_url !== '' ? String(r.avatar_url) : null,
        is_main: Boolean(r.is_main),
        sort_order: Number(r.sort_order) || 0,
        created_at: Number(r.created_at) || 0,
        updated_at: Number(r.updated_at) || 0,
    };
}

function getResultsFromD1All(result: unknown): unknown[] {
    if (result && typeof result === 'object' && 'results' in result && Array.isArray((result as { results: unknown[] }).results)) {
        return (result as { results: unknown[] }).results;
    }
    if (Array.isArray(result)) return result;
    return [];
}

export function registerProfileRoutes(app: Hono<{ Bindings: Bindings }>) {
    app.options('/api/profiles', (c) => new Response(null, { status: 204, headers: CORS }));
    app.options('/api/profiles/:id', (c) => new Response(null, { status: 204, headers: CORS }));
    app.options('/api/profiles/pin/status', (c) => new Response(null, { status: 204, headers: CORS }));
    app.options('/api/profiles/pin/set', (c) => new Response(null, { status: 204, headers: CORS }));
    app.options('/api/profiles/pin/verify', (c) => new Response(null, { status: 204, headers: CORS }));

    async function getAccountFromAuth(c: { req: { header: (name: string) => string | undefined }; env: Bindings }): Promise<string | null> {
        try {
            const authHeader = c.req.header('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
            const secret = c.env.JWT_SECRET;
            if (!secret || typeof secret !== 'string') return null;
            const token = authHeader.slice(7).trim();
            if (!token) return null;
            const payload = await verifyJWTAsync(token, secret);
            const sub = payload?.sub;
            return sub != null && sub !== '' ? String(sub) : null;
        } catch {
            return null;
        }
    }

    async function ensureUserProfileTable(db: D1Database): Promise<void> {
        try {
            await db.prepare(CREATE_USER_PROFILE_TABLE).run();
        } catch {
            // Table peut déjà exister ou autre erreur non bloquante
        }
    }

    async function ensureMainProfile(db: D1Database, accountId: string): Promise<void> {
        try {
            const existing = await db.prepare('SELECT id FROM user_profile WHERE account_id = ? AND is_main = 1').bind(accountId).first();
            if (existing) return;

            const accountRow = await db.prepare('SELECT id, name, picture FROM profil WHERE id = ?').bind(accountId).first();
            if (!accountRow || typeof accountRow !== 'object') return;

            const acc = accountRow as Record<string, unknown>;
            const name = (acc.name != null && String(acc.name).trim() !== '') ? String(acc.name).trim() : 'Profil principal';
            const picture = (acc.picture != null && String(acc.picture).trim() !== '') ? String(acc.picture).trim() : '';
            const mainId = `main_${accountId}`;
            const now = Math.floor(Date.now() / 1000);

            await db.prepare(
                'INSERT INTO user_profile (id, account_id, name, avatar_url, is_main, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 0, ?, ?)'
            ).bind(mainId, accountId, name, picture, now, now).run();
        } catch {
            // Profil principal déjà créé (concurrence) ou compte absent : on continue
        }
    }

    async function ensureAccountPinTable(db: D1Database): Promise<void> {
        try {
            await db.prepare(CREATE_ACCOUNT_PIN_TABLE).run();
            await db.prepare(CREATE_PIN_RATE_LIMIT_TABLE).run();
        } catch {
            // Tables déjà existantes
        }
    }

    /** Vérifie le PIN pour un compte. Gère le rate limiting (5 tentatives / 15 min). */
    async function verifyPinForAccount(db: D1Database, accountId: string, pin: string): Promise<{ ok: boolean; rateLimited?: boolean }> {
        const now = Math.floor(Date.now() / 1000);
        const row = await db.prepare('SELECT attempts_count, window_start FROM pin_rate_limit WHERE account_id = ?').bind(accountId).first() as { attempts_count?: number; window_start?: number } | null;
        let attempts = row?.attempts_count ?? 0;
        let windowStart = row?.window_start ?? now;
        if (now - windowStart > PIN_RATE_LIMIT_WINDOW_SEC) {
            attempts = 0;
            windowStart = now;
        }
        if (attempts >= PIN_MAX_ATTEMPTS) {
            return { ok: false, rateLimited: true };
        }
        const pinRow = await db.prepare('SELECT pin_salt, pin_hash FROM account_pin WHERE account_id = ?').bind(accountId).first() as { pin_salt?: string; pin_hash?: string } | null;
        if (!pinRow?.pin_salt || !pinRow?.pin_hash) {
            return { ok: false };
        }
        const valid = await verifyPin(pinRow.pin_salt, pinRow.pin_hash, pin);
        if (valid) {
            await db.prepare('INSERT OR REPLACE INTO pin_rate_limit (account_id, attempts_count, window_start) VALUES (?, 0, ?)').bind(accountId, now).run();
            return { ok: true };
        }
        attempts += 1;
        await db.prepare('INSERT OR REPLACE INTO pin_rate_limit (account_id, attempts_count, window_start) VALUES (?, ?, ?)').bind(accountId, attempts, windowStart).run();
        return { ok: false };
    }

    app.get('/api/profiles', async (c) => {
        if (!c.env.DATABASE) {
            return json(c, { error: 'Configuration serveur' }, 500);
        }
        let accountId: string | null = null;
        try {
            accountId = await getAccountFromAuth(c);
        } catch {
            return json(c, { error: 'Erreur serveur' }, 500);
        }
        if (!accountId) {
            return json(c, { error: 'Non autorisé' }, 401);
        }
        const db = c.env.DATABASE;

        try {
            await ensureUserProfileTable(db);
            await ensureMainProfile(db, accountId);
        } catch {
            // Ne pas bloquer : on tente quand même la lecture
        }

        let d1Result: unknown;
        try {
            d1Result = await db
                .prepare(
                    'SELECT id, account_id, name, avatar_url, is_main, sort_order, created_at, updated_at FROM user_profile WHERE account_id = ? ORDER BY is_main DESC, sort_order ASC, created_at ASC'
                )
                .bind(accountId)
                .all();
        } catch (e) {
            console.error('GET /api/profiles SELECT:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }

        const rawList = getResultsFromD1All(d1Result);
        const profiles = rawList.map((r) => toProfileRow(r));
        return json(c, { profiles });
    });

    app.get('/api/profiles/pin/status', async (c) => {
        if (!c.env.DATABASE) return json(c, { error: 'Configuration serveur' }, 500);
        const accountId = await getAccountFromAuth(c);
        if (!accountId) return json(c, { error: 'Non autorisé' }, 401);
        try {
            await ensureAccountPinTable(c.env.DATABASE);
            const row = await c.env.DATABASE.prepare('SELECT account_id FROM account_pin WHERE account_id = ?').bind(accountId).first();
            return json(c, { hasPin: !!row });
        } catch (e) {
            console.error('GET /api/profiles/pin/status:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }
    });

    app.post('/api/profiles/pin/set', async (c) => {
        if (!c.env.DATABASE) return json(c, { error: 'Configuration serveur' }, 500);
        const accountId = await getAccountFromAuth(c);
        if (!accountId) return json(c, { error: 'Non autorisé' }, 401);
        try {
            const body = (await c.req.json()) as { pin?: string };
            const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
            if (!isValidPinFormat(pin)) return json(c, { error: 'Le code PIN doit contenir exactement 4 chiffres' }, 400);
            await ensureAccountPinTable(c.env.DATABASE);
            const salt = generatePinSalt();
            const pinHash = await hashPin(salt, pin);
            await c.env.DATABASE.prepare('INSERT OR REPLACE INTO account_pin (account_id, pin_salt, pin_hash) VALUES (?, ?, ?)').bind(accountId, salt, pinHash).run();
            return json(c, { success: true });
        } catch (e) {
            console.error('POST /api/profiles/pin/set:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }
    });

    app.post('/api/profiles/pin/verify', async (c) => {
        if (!c.env.DATABASE) return json(c, { error: 'Configuration serveur' }, 500);
        const accountId = await getAccountFromAuth(c);
        if (!accountId) return json(c, { error: 'Non autorisé' }, 401);
        try {
            const body = (await c.req.json()) as { pin?: string };
            const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
            if (!isValidPinFormat(pin)) return json(c, { error: 'Code PIN invalide (4 chiffres)' }, 400);
            await ensureAccountPinTable(c.env.DATABASE);
            const result = await verifyPinForAccount(c.env.DATABASE, accountId, pin);
            if (result.rateLimited) return json(c, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429);
            if (!result.ok) return json(c, { error: 'Code PIN incorrect' }, 403);
            return json(c, { valid: true });
        } catch (e) {
            console.error('POST /api/profiles/pin/verify:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }
    });

    app.post('/api/profiles', async (c) => {
        if (!c.env.DATABASE) return json(c, { error: 'Configuration serveur' }, 500);
        const accountId = await getAccountFromAuth(c);
        if (!accountId) return json(c, { error: 'Non autorisé' }, 401);
        try {
            await ensureUserProfileTable(c.env.DATABASE);
            const body = (await c.req.json()) as { name?: string; avatar_url?: string };
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            if (!name || name.length > 100) return json(c, { error: 'Nom invalide (1–100 caractères)' }, 400);
            const avatarUrl = typeof body.avatar_url === 'string' ? body.avatar_url.trim() || '' : '';

            const maxOrder = await c.env.DATABASE.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM user_profile WHERE account_id = ?').bind(accountId).first() as { next?: number } | null;
            const sortOrder = maxOrder?.next ?? 0;

            const id = `prof_${accountId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
            const now = Math.floor(Date.now() / 1000);
            await c.env.DATABASE.prepare(
                'INSERT INTO user_profile (id, account_id, name, avatar_url, is_main, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)'
            ).bind(id, accountId, name, avatarUrl, sortOrder, now, now).run();

            const row = await c.env.DATABASE.prepare(
                'SELECT id, account_id, name, avatar_url, is_main, sort_order, created_at, updated_at FROM user_profile WHERE id = ?'
            ).bind(id).first();
            const profile = toProfileRow(row);
            return json(c, { profile }, 201);
        } catch (e) {
            console.error('POST /api/profiles:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }
    });

    app.patch('/api/profiles/:id', async (c) => {
        if (!c.env.DATABASE) return json(c, { error: 'Configuration serveur' }, 500);
        const accountId = await getAccountFromAuth(c);
        if (!accountId) return json(c, { error: 'Non autorisé' }, 401);
        const id = c.req.param('id');
        if (!id) return json(c, { error: 'ID manquant' }, 400);
        try {
            const existing = await c.env.DATABASE.prepare('SELECT id, account_id, is_main FROM user_profile WHERE id = ? AND account_id = ?').bind(id, accountId).first() as { id?: string; account_id?: string; is_main?: number } | null;
            if (!existing) return json(c, { error: 'Profil non trouvé' }, 404);

            const body = (await c.req.json()) as { name?: string; avatar_url?: string; pin?: string };
            const isMain = !!existing.is_main;

            if (!isMain) {
                const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
                if (!isValidPinFormat(pin)) return json(c, { error: 'Code PIN requis (4 chiffres) pour modifier un profil secondaire' }, 400);
                await ensureAccountPinTable(c.env.DATABASE);
                const pinResult = await verifyPinForAccount(c.env.DATABASE, accountId, pin);
                if (pinResult.rateLimited) return json(c, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429);
                if (!pinResult.ok) return json(c, { error: 'Code PIN incorrect' }, 403);
            }

            const updates: string[] = [];
            const bindings: (string | number)[] = [];

            if (typeof body.name === 'string') {
                const name = body.name.trim();
                if (name.length > 0 && name.length <= 100) {
                    updates.push('name = ?');
                    bindings.push(name);
                }
            }
            if (body.avatar_url !== undefined) {
                const avatarUrl = typeof body.avatar_url === 'string' ? body.avatar_url.trim() || '' : '';
                updates.push('avatar_url = ?');
                bindings.push(avatarUrl);
            }
            if (updates.length === 0) {
                const row = await c.env.DATABASE.prepare('SELECT id, account_id, name, avatar_url, is_main, sort_order, created_at, updated_at FROM user_profile WHERE id = ?').bind(id).first();
                return json(c, { profile: toProfileRow(row) });
            }
            updates.push('updated_at = ?');
            bindings.push(Math.floor(Date.now() / 1000));
            bindings.push(id);
            await c.env.DATABASE.prepare(`UPDATE user_profile SET ${updates.join(', ')} WHERE id = ?`).bind(...bindings).run();

            const row = await c.env.DATABASE.prepare('SELECT id, account_id, name, avatar_url, is_main, sort_order, created_at, updated_at FROM user_profile WHERE id = ?').bind(id).first();
            return json(c, { profile: toProfileRow(row) });
        } catch (e) {
            console.error('PATCH /api/profiles/:id:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }
    });

    app.delete('/api/profiles/:id', async (c) => {
        if (!c.env.DATABASE) return json(c, { error: 'Configuration serveur' }, 500);
        const accountId = await getAccountFromAuth(c);
        if (!accountId) return json(c, { error: 'Non autorisé' }, 401);
        const id = c.req.param('id');
        if (!id) return json(c, { error: 'ID manquant' }, 400);
        try {
            const existing = await c.env.DATABASE.prepare('SELECT id, is_main FROM user_profile WHERE id = ? AND account_id = ?').bind(id, accountId).first() as { id?: string; is_main?: number } | null;
            if (!existing) return json(c, { error: 'Profil non trouvé' }, 404);
            if (existing.is_main) return json(c, { error: 'Le profil principal ne peut pas être supprimé' }, 403);

            const body = (await c.req.json()) as { pin?: string };
            const pin = typeof body.pin === 'string' ? body.pin.trim() : '';
            if (!isValidPinFormat(pin)) return json(c, { error: 'Code PIN requis (4 chiffres) pour supprimer un profil' }, 400);
            await ensureAccountPinTable(c.env.DATABASE);
            const pinResult = await verifyPinForAccount(c.env.DATABASE, accountId, pin);
            if (pinResult.rateLimited) return json(c, { error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, 429);
            if (!pinResult.ok) return json(c, { error: 'Code PIN incorrect' }, 403);

            await c.env.DATABASE.prepare('DELETE FROM user_profile WHERE id = ?').bind(id).run();
            return json(c, { success: true });
        } catch (e) {
            console.error('DELETE /api/profiles/:id:', e);
            return json(c, { error: 'Erreur serveur' }, 500);
        }
    });
}
