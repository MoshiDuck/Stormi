// INFO : Bouton « Masquer pour le profil » — sélection d’un profil secondaire pour exclure ce contenu de son catalogue
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EyeOff } from 'lucide-react';
import { useConfig } from '~/hooks/useConfig';
import { useLanguage } from '~/contexts/LanguageContext';
import { addRestrictionForProfile } from '~/hooks/useProfileRestrictions';
import type { StreamingProfile } from '~/types/auth';
import type { ContentRestrictionScope } from '~/types/auth';
import { darkTheme } from '~/utils/ui/theme';

export interface HideFromProfileButtonProps {
    scope: ContentRestrictionScope;
    reference: string;
    onSuccess?: () => void;
    onError?: (message: string) => void;
    /** Pour éviter ouverture au drag */
    className?: string;
    style?: React.CSSProperties;
}

export function HideFromProfileButton({
    scope,
    reference,
    onSuccess,
    onError,
    className,
    style,
}: HideFromProfileButtonProps) {
    const { config } = useConfig();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [profiles, setProfiles] = useState<StreamingProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    const fetchProfiles = useCallback(async () => {
        if (!config?.baseUrl) return;
        const token = localStorage.getItem('stormi_token');
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${config.baseUrl}/api/profiles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as { error?: string; profiles?: StreamingProfile[] };
            if (!res.ok) throw new Error(data.error || t('selectProfile.errorLoad'));
            setProfiles(data.profiles ?? []);
        } catch (e) {
            onError?.(e instanceof Error ? e.message : t('selectProfile.errorLoad'));
        } finally {
            setLoading(false);
        }
    }, [config?.baseUrl, t, onError]);

    useEffect(() => {
        if (open && profiles.length === 0) fetchProfiles();
    }, [open, profiles.length, fetchProfiles]);

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const secondaryProfiles = profiles.filter((p) => !p.is_main);

    const handleSelect = useCallback(
        async (profile: StreamingProfile) => {
            if (!config?.baseUrl) return;
            const token = localStorage.getItem('stormi_token');
            if (!token) return;
            setAdding(profile.id);
            try {
                await addRestrictionForProfile(config.baseUrl, token, profile.id, scope, reference);
                setOpen(false);
                onSuccess?.();
            } catch (e) {
                onError?.(e instanceof Error ? e.message : 'Erreur');
            } finally {
                setAdding(null);
            }
        },
        [config?.baseUrl, scope, reference, onSuccess, onError]
    );

    if (secondaryProfiles.length === 0 && !loading) return null;

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block', ...style }} className={className}>
            <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
                aria-label={t('selectProfile.hideFromProfile')}
                title={t('selectProfile.hideFromProfileTitle')}
                style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: open ? darkTheme.background.tertiary : 'rgba(0,0,0,0.5)',
                    color: darkTheme.text.primary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <EyeOff size={16} />
            </button>
            {open && (
                <div
                    role="listbox"
                    aria-label={t('selectProfile.chooseProfileToHide')}
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: 4,
                        minWidth: 180,
                        maxHeight: 280,
                        overflow: 'auto',
                        backgroundColor: darkTheme.background.secondary,
                        border: `1px solid ${darkTheme.border.primary}`,
                        borderRadius: darkTheme.radius.medium,
                        boxShadow: darkTheme.shadow.large,
                        zIndex: 1000,
                    }}
                >
                    <div style={{ padding: '8px 12px', fontSize: 12, color: darkTheme.text.secondary }}>
                        {t('selectProfile.chooseProfileToHide')}
                    </div>
                    {loading ? (
                        <div style={{ padding: 12, fontSize: 13, color: darkTheme.text.secondary }}>{t('common.loading')}</div>
                    ) : (
                        secondaryProfiles.map((profile) => (
                            <button
                                key={profile.id}
                                type="button"
                                role="option"
                                disabled={adding === profile.id}
                                onClick={() => handleSelect(profile)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    textAlign: 'left',
                                    border: 'none',
                                    background: 'none',
                                    color: darkTheme.text.primary,
                                    fontSize: 14,
                                    cursor: adding === profile.id ? 'wait' : 'pointer',
                                }}
                            >
                                {profile.name}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
