// INFO : Hook pour les restrictions de contenu par profil (ce que le profil ne peut pas voir)
import { useState, useCallback, useEffect } from 'react';
import type { ContentRestriction } from '~/types/auth';
import { useConfig } from '~/hooks/useConfig';

export function useProfileRestrictions(profileId: string | null) {
    const { config } = useConfig();
    const [restrictions, setRestrictions] = useState<ContentRestriction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRestrictions = useCallback(async () => {
        if (!profileId || !config?.baseUrl) return;
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('stormi_token') : null;
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.baseUrl}/api/profiles/${profileId}/restrictions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as { error?: string; restrictions?: ContentRestriction[] };
            if (!res.ok) throw new Error(data.error || 'Erreur chargement restrictions');
            setRestrictions(data.restrictions ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Erreur');
        } finally {
            setLoading(false);
        }
    }, [profileId, config?.baseUrl]);

    useEffect(() => {
        fetchRestrictions();
    }, [fetchRestrictions]);

    const addRestriction = useCallback(
        async (scope: ContentRestriction['scope'], reference: string) => {
            if (!profileId || !config?.baseUrl) return;
            const token = typeof localStorage !== 'undefined' ? localStorage.getItem('stormi_token') : null;
            if (!token) return;
            try {
                const res = await fetch(`${config.baseUrl}/api/profiles/${profileId}/restrictions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ scope, reference }),
                });
                const data = (await res.json()) as { error?: string; restrictions?: ContentRestriction[] };
                if (!res.ok) throw new Error(data.error || 'Erreur ajout restriction');
                setRestrictions(data.restrictions ?? []);
            } catch (e) {
                throw e;
            }
        },
        [profileId, config?.baseUrl]
    );

    const removeRestriction = useCallback(
        async (scope: ContentRestriction['scope'], reference: string) => {
            if (!profileId || !config?.baseUrl) return;
            const token = typeof localStorage !== 'undefined' ? localStorage.getItem('stormi_token') : null;
            if (!token) return;
            try {
                const res = await fetch(`${config.baseUrl}/api/profiles/${profileId}/restrictions`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ scope, reference }),
                });
                if (!res.ok) {
                    const data = (await res.json()) as { error?: string };
                    throw new Error(data.error || 'Erreur suppression restriction');
                }
                setRestrictions((prev) => prev.filter((r) => !(r.scope === scope && r.reference === reference)));
            } catch (e) {
                throw e;
            }
        },
        [profileId, config?.baseUrl]
    );

    return { restrictions, loading, error, refetch: fetchRestrictions, addRestriction, removeRestriction };
}

/** Ajoute une restriction pour un profil (utilisé par « Masquer pour le profil »). */
export async function addRestrictionForProfile(
    baseUrl: string,
    token: string,
    profileId: string,
    scope: ContentRestriction['scope'],
    reference: string
): Promise<void> {
    const res = await fetch(`${baseUrl}/api/profiles/${profileId}/restrictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scope, reference }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error || 'Erreur ajout restriction');
}

/** Supprime une restriction pour un profil (utilisé par « Réafficher pour le profil »). */
export async function removeRestrictionForProfile(
    baseUrl: string,
    token: string,
    profileId: string,
    scope: ContentRestriction['scope'],
    reference: string
): Promise<void> {
    const res = await fetch(`${baseUrl}/api/profiles/${profileId}/restrictions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scope, reference }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) throw new Error(data.error || 'Erreur suppression restriction');
}
