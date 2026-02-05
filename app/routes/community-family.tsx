// INFO : Communauté > Famille — gestion des profils famille (liste, ajout, modification, suppression)
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useConfig } from '~/hooks/useConfig';
import { useLanguage } from '~/contexts/LanguageContext';
import { useTheme } from '~/contexts/ThemeContext';
import type { StreamingProfile } from '~/types/auth';
import { translations } from '~/utils/i18n';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { ErrorDisplay } from '~/components/ui/ErrorDisplay';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { PinModal, type PinModalMode } from '~/components/profile/PinModal';
import { ChevronLeft, Pencil, Trash2, Plus, Check } from 'lucide-react';
import { TOUCH_TARGET_MIN } from '~/utils/ui/breakpoints';
const AVATAR_SIZE = 88;
const CARD_MIN_WIDTH = 160;

export function meta() {
    return [{ title: translations.fr.meta.pageTitleCommunityFamily }];
}

export default function CommunityFamilyRoute() {
    const { user, activeProfile, setActiveProfile, clearActiveProfile } = useAuth();
    const { config } = useConfig();
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [profiles, setProfiles] = useState<StreamingProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [addName, setAddName] = useState('');
    const [addIsChild, setAddIsChild] = useState(false);
    const [addSubmitting, setAddSubmitting] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);
    const [showPinAfterAdd, setShowPinAfterAdd] = useState(false);
    const [pinModalModeAfterAdd, setPinModalModeAfterAdd] = useState<PinModalMode>('set');
    const [pendingAdd, setPendingAdd] = useState<{ name: string; is_child: boolean } | null>(null);
    const [showPinForEdit, setShowPinForEdit] = useState(false);
    const [showPinForDelete, setShowPinForDelete] = useState(false);

    const fetchProfiles = useCallback(async () => {
        if (!config?.baseUrl || !user) return;
        const token = localStorage.getItem('stormi_token');
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${config.baseUrl}/api/profiles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json()) as { error?: string; profiles?: StreamingProfile[] };
            if (!res.ok) throw new Error(data.error || t('selectProfile.errorLoad'));
            setProfiles(data.profiles || []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : t('selectProfile.errorLoad'));
        } finally {
            setLoading(false);
        }
    }, [config?.baseUrl, user, t]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const hasChildProfile = profiles.some((p) => p.is_child);

    const handleAddProfile = async () => {
        if (!config?.baseUrl) return;
        if (hasChildProfile) {
            if (!addName.trim()) return;
        } else {
            if (!addIsChild && !addName.trim()) return;
        }
        const token = localStorage.getItem('stormi_token');
        if (!token) return;
        setAddError(null);
        setPendingAdd({
            name: hasChildProfile ? addName.trim() : addIsChild ? t('selectProfile.profileTypeChild') : addName.trim(),
            is_child: hasChildProfile ? false : addIsChild,
        });
        try {
            const statusRes = await fetch(`${config.baseUrl}/api/profiles/pin/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const statusData = (await statusRes.json()) as { hasPin?: boolean };
            setPinModalModeAfterAdd(statusData.hasPin ? 'confirm' : 'set');
        } catch {
            setPinModalModeAfterAdd('set');
        }
        setShowPinAfterAdd(true);
    };

    const handleCreateProfileAfterPinSuccess = async () => {
        if (!pendingAdd || !config?.baseUrl) return;
        const token = localStorage.getItem('stormi_token');
        if (!token) return;
        setAddSubmitting(true);
        setAddError(null);
        try {
            const res = await fetch(`${config.baseUrl}/api/profiles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: pendingAdd.name, is_child: pendingAdd.is_child }),
            });
            const data = (await res.json()) as { error?: string; profile?: StreamingProfile };
            if (!res.ok) throw new Error(data.error || t('selectProfile.errorCreate'));
            if (data.profile) setProfiles((prev) => [...prev, data.profile as StreamingProfile]);
            setShowPinAfterAdd(false);
            setShowAddModal(false);
            setAddName('');
            setAddIsChild(false);
            setPendingAdd(null);
        } catch (e: unknown) {
            setAddError(e instanceof Error ? e.message : t('selectProfile.errorCreate'));
        } finally {
            setAddSubmitting(false);
        }
    };

    const editingProfile = editId ? profiles.find((p) => p.id === editId) : null;
    const isEditingMain = editingProfile?.is_main ?? false;

    const handleUpdateProfile = async (pin?: string) => {
        if (!editId || !config?.baseUrl) return;
        const name = editName.trim();
        if (!name) return;
        const token = localStorage.getItem('stormi_token');
        if (!token) return;
        if (!isEditingMain && !pin) return;
        setEditSubmitting(true);
        try {
            const body = isEditingMain ? { name } : { name, pin };
            const res = await fetch(`${config.baseUrl}/api/profiles/${editId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });
            const data = (await res.json()) as { error?: string; profile?: StreamingProfile };
            if (!res.ok) throw new Error(data.error || t('selectProfile.errorUpdate'));
            const updatedProfile = data.profile;
            if (updatedProfile) {
                setProfiles((prev) =>
                    prev.map((p) => (p.id === editId ? updatedProfile : p)) as StreamingProfile[]
                );
                if (activeProfile?.id === editId) setActiveProfile(updatedProfile);
            }
            setEditId(null);
            setEditName('');
            setShowPinForEdit(false);
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleSaveEditClick = () => {
        if (!editName.trim()) return;
        if (isEditingMain) {
            void handleUpdateProfile();
        } else {
            setShowPinForEdit(true);
        }
    };

    const handleDeleteProfile = async (pin?: string) => {
        if (!deleteConfirmId || !config?.baseUrl) return;
        const token = localStorage.getItem('stormi_token');
        if (!token) return;
        if (!pin) return;
        setDeleteSubmitting(true);
        try {
            const res = await fetch(`${config.baseUrl}/api/profiles/${deleteConfirmId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pin }),
            });
            const data = (await res.json()) as { error?: string };
            if (!res.ok) throw new Error(data.error || t('selectProfile.errorDelete'));
            setProfiles((prev) => prev.filter((p) => p.id !== deleteConfirmId));
            if (activeProfile?.id === deleteConfirmId) clearActiveProfile();
            setDeleteConfirmId(null);
            setShowPinForDelete(false);
        } finally {
            setDeleteSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Link
                to="/community"
                prefetch="intent"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: theme.text.secondary,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 8,
                }}
            >
                <ChevronLeft size={18} aria-hidden />
                {t('community.backToCommunity')}
            </Link>

            <div
                style={{
                    backgroundColor: theme.background.secondary,
                    borderRadius: 12,
                    padding: 32,
                    border: `1px solid ${theme.border.primary}`,
                    boxShadow: theme.shadow?.small ?? '0 1px 3px rgba(0,0,0,0.06)',
                }}
            >
                <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 16 }} aria-hidden>
                    👨‍👩‍👧
                </div>
                <h1
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: theme.text.primary,
                        margin: '0 0 8px 0',
                    }}
                >
                    {t('community.sectionFamilyTitle')}
                </h1>
                <p
                    style={{
                        fontSize: 15,
                        color: theme.text.secondary,
                        margin: '0 0 16px 0',
                        lineHeight: 1.4,
                    }}
                >
                    {t('community.sectionFamilySubtitle')}
                </p>
                <p
                    style={{
                        fontSize: 14,
                        color: theme.text.tertiary ?? theme.text.secondary,
                        margin: 0,
                        lineHeight: 1.5,
                    }}
                >
                    {t('community.sectionFamilyDescription')}
                </p>
            </div>

            {/* Profils de la famille — design moderne, clic sur la carte = changer de profil */}
            <section style={{ marginTop: 8 }}>
                <h2
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: theme.text.primary,
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {t('community.familyProfilesTitle')}
                </h2>
                <p
                    style={{
                        fontSize: 14,
                        color: theme.text.secondary,
                        margin: '0 0 24px 0',
                        lineHeight: 1.45,
                    }}
                >
                    {t('selectProfile.chooseProfile')} · {t('selectProfile.editProfiles')}
                </p>

                {loading && profiles.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <LoadingSpinner message={t('selectProfile.loading')} size="medium" />
                    </div>
                ) : (
                    <>
                        {error && (
                            <div style={{ marginBottom: 20 }}>
                                <ErrorDisplay error={error} />
                            </div>
                        )}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_MIN_WIDTH}px, 1fr))`,
                                gap: 20,
                            }}
                        >
                            {profiles.map((profile) => {
                                const isActive = activeProfile?.id === profile.id;
                                return (
                                    <div
                                        key={profile.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setActiveProfile(profile)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setActiveProfile(profile);
                                            }
                                        }}
                                        aria-label={`${t('selectProfile.useProfile')}: ${profile.name}`}
                                        style={{
                                            position: 'relative',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            padding: 24,
                                            borderRadius: 16,
                                            background: theme.background.secondary,
                                            border: `2px solid ${isActive ? theme.accent.blue : theme.border.primary}`,
                                            boxShadow: isActive ? theme.shadow?.glow ?? '0 0 20px rgba(66,133,244,0.2)' : theme.shadow?.small ?? '0 2px 8px rgba(0,0,0,0.15)',
                                            cursor: 'pointer',
                                            transition: theme.transition?.normal ?? '0.2s ease',
                                            minHeight: 200,
                                        }}
                                        className="family-profile-card"
                                    >
                                        {/* Avatar cercle */}
                                        <div
                                            style={{
                                                width: AVATAR_SIZE,
                                                height: AVATAR_SIZE,
                                                borderRadius: '50%',
                                                overflow: 'hidden',
                                                border: `3px solid ${isActive ? theme.accent.blue : theme.border.secondary}`,
                                                flexShrink: 0,
                                                marginBottom: 14,
                                            }}
                                        >
                                            {profile.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt=""
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        background: theme.background.tertiary,
                                                        color: theme.text.primary,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: 36,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {profile.name.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                        </div>

                                        <span
                                            style={{
                                                fontSize: 16,
                                                fontWeight: 600,
                                                color: theme.text.primary,
                                                textAlign: 'center',
                                                wordBreak: 'break-word',
                                                lineHeight: 1.3,
                                                marginBottom: 6,
                                            }}
                                        >
                                            {profile.name}
                                        </span>

                                        {/* Badge Actif uniquement */}
                                        {isActive && (
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: '#fff',
                                                    background: theme.accent.blue,
                                                    padding: '4px 8px',
                                                    borderRadius: 20,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 4,
                                                    marginBottom: 12,
                                                }}
                                            >
                                                <Check size={12} strokeWidth={2.5} />
                                                {t('selectProfile.activeBadge')}
                                            </span>
                                        )}

                                        {/* Icônes en bas : Modifier / Supprimer */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: 8,
                                                marginTop: 'auto',
                                                paddingTop: isActive ? 0 : 12,
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => { setEditId(profile.id); setEditName(profile.name); }}
                                                aria-label={t('selectProfile.edit')}
                                                style={{
                                                    width: TOUCH_TARGET_MIN,
                                                    height: TOUCH_TARGET_MIN,
                                                    padding: 0,
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    background: theme.background.tertiary,
                                                    color: theme.text.secondary,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: theme.transition?.fast,
                                                }}
                                            >
                                                <Pencil size={18} strokeWidth={2} />
                                            </button>
                                            {!profile.is_main && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteConfirmId(profile.id)}
                                                    aria-label={t('selectProfile.delete')}
                                                    style={{
                                                        width: TOUCH_TARGET_MIN,
                                                        height: TOUCH_TARGET_MIN,
                                                        padding: 0,
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        background: theme.background.tertiary,
                                                        color: theme.accent.red,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: theme.transition?.fast,
                                                    }}
                                                >
                                                    <Trash2 size={18} strokeWidth={2} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Carte Ajouter un profil */}
                            <button
                                type="button"
                                onClick={() => { setShowAddModal(true); setAddName(''); setAddError(null); }}
                                aria-label={t('selectProfile.addProfile')}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 12,
                                    padding: 24,
                                    minHeight: 200,
                                    borderRadius: 16,
                                    border: `2px dashed ${theme.border.secondary}`,
                                    background: 'transparent',
                                    color: theme.text.tertiary,
                                    cursor: 'pointer',
                                    transition: theme.transition?.normal ?? '0.2s ease',
                                }}
                                className="family-add-card"
                            >
                                <div
                                    style={{
                                        width: AVATAR_SIZE,
                                        height: AVATAR_SIZE,
                                        borderRadius: '50%',
                                        border: `2px dashed ${theme.border.secondary}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: theme.transition?.fast,
                                    }}
                                >
                                    <Plus size={36} strokeWidth={2} />
                                </div>
                                <span style={{ fontSize: 14, fontWeight: 600, color: theme.text.secondary }}>
                                    {t('selectProfile.addProfile')}
                                </span>
                            </button>
                        </div>

                        <style>{`
                            .family-profile-card:hover {
                                transform: translateY(-2px);
                                box-shadow: ${theme.shadow?.medium ?? '0 4px 16px rgba(0,0,0,0.2)'};
                            }
                            .family-profile-card:focus-visible {
                                outline: 2px solid ${theme.accent.blue};
                                outline-offset: 2px;
                            }
                            .family-add-card:hover {
                                border-color: ${theme.accent.blue};
                                color: ${theme.accent.blue};
                                background: ${theme.background.secondary};
                            }
                            .family-add-card:hover div {
                                border-color: ${theme.accent.blue};
                            }
                            .family-add-card:focus-visible {
                                outline: 2px solid ${theme.accent.blue};
                                outline-offset: 2px;
                            }
                        `}</style>
                    </>
                )}
            </section>

            {/* Modal ajout */}
            {showAddModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-family-profile-title"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 24,
                    }}
                    onClick={() => !addSubmitting && setShowAddModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: theme.background.secondary,
                            borderRadius: theme.radius.large,
                            padding: 32,
                            maxWidth: 400,
                            width: '100%',
                            border: `1px solid ${theme.border.primary}`,
                            boxShadow: theme.shadow.large,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            id="add-family-profile-title"
                            style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: theme.text.primary }}
                        >
                            {t('selectProfile.createTitle')}
                        </h2>
                        {hasChildProfile ? (
                            <input
                                type="text"
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder={t('selectProfile.createPlaceholder')}
                                maxLength={100}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: 16,
                                    borderRadius: theme.radius.medium,
                                    border: `1px solid ${theme.border.primary}`,
                                    backgroundColor: theme.background.tertiary,
                                    color: theme.text.primary,
                                    marginBottom: 16,
                                    boxSizing: 'border-box',
                                }}
                            />
                        ) : !addIsChild ? (
                            <input
                                type="text"
                                value={addName}
                                onChange={(e) => setAddName(e.target.value)}
                                placeholder={t('selectProfile.createPlaceholder')}
                                maxLength={100}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: 16,
                                    borderRadius: theme.radius.medium,
                                    border: `1px solid ${theme.border.primary}`,
                                    backgroundColor: theme.background.tertiary,
                                    color: theme.text.primary,
                                    marginBottom: 16,
                                    boxSizing: 'border-box',
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: 14, color: theme.text.secondary, marginBottom: 16 }}>
                                {t('selectProfile.childProfileNoNameHint')}
                            </p>
                        )}
                        {!hasChildProfile && (
                            <div style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: theme.text.secondary, display: 'block', marginBottom: 8 }}>
                                    {t('selectProfile.profileTypeAdult')} / {t('selectProfile.profileTypeChild')}
                                </span>
                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => setAddIsChild(false)}
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: addIsChild ? theme.text.secondary : theme.text.primary,
                                            backgroundColor: addIsChild ? theme.background.tertiary : theme.background.primary,
                                            border: `2px solid ${addIsChild ? theme.border.secondary : theme.accent.blue}`,
                                            borderRadius: theme.radius.medium,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t('selectProfile.profileTypeAdult')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAddIsChild(true)}
                                        style={{
                                            padding: '10px 20px',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            color: addIsChild ? theme.text.primary : theme.text.secondary,
                                            backgroundColor: addIsChild ? theme.background.primary : theme.background.tertiary,
                                            border: `2px solid ${addIsChild ? theme.accent.blue : theme.border.secondary}`,
                                            borderRadius: theme.radius.medium,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t('selectProfile.profileTypeChild')}
                                    </button>
                                </div>
                            </div>
                        )}
                        {addError && (
                            <p style={{ color: theme.accent.red, fontSize: 14, marginBottom: 12 }}>{addError}</p>
                        )}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                disabled={addSubmitting}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: theme.text.primary,
                                    backgroundColor: theme.background.tertiary,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: theme.radius.medium,
                                    cursor: addSubmitting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleAddProfile}
                                disabled={(hasChildProfile ? !addName.trim() : !addName.trim() && !addIsChild) || addSubmitting}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#fff',
                                    backgroundColor: theme.accent.blue,
                                    border: 'none',
                                    borderRadius: theme.radius.medium,
                                    cursor: (hasChildProfile ? addName.trim() : addName.trim() || addIsChild) && !addSubmitting ? 'pointer' : 'not-allowed',
                                }}
                            >
                                {addSubmitting ? t('common.loading') : t('selectProfile.createSubmit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal édition */}
            {editId && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-family-profile-title"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 24,
                    }}
                    onClick={() => !editSubmitting && setEditId(null)}
                >
                    <div
                        style={{
                            backgroundColor: theme.background.secondary,
                            borderRadius: theme.radius.large,
                            padding: 32,
                            maxWidth: 400,
                            width: '100%',
                            border: `1px solid ${theme.border.primary}`,
                            boxShadow: theme.shadow.large,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2
                            id="edit-family-profile-title"
                            style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: theme.text.primary }}
                        >
                            {t('selectProfile.edit')}
                        </h2>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder={t('selectProfile.createPlaceholder')}
                            maxLength={100}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 16,
                                borderRadius: theme.radius.medium,
                                border: `1px solid ${theme.border.primary}`,
                                backgroundColor: theme.background.tertiary,
                                color: theme.text.primary,
                                marginBottom: 16,
                                boxSizing: 'border-box',
                            }}
                        />
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setEditId(null)}
                                disabled={editSubmitting}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: theme.text.primary,
                                    backgroundColor: theme.background.tertiary,
                                    border: `1px solid ${theme.border.primary}`,
                                    borderRadius: theme.radius.medium,
                                    cursor: editSubmitting ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEditClick}
                                disabled={!editName.trim() || editSubmitting}
                                style={{
                                    padding: '10px 20px',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#fff',
                                    backgroundColor: theme.accent.blue,
                                    border: 'none',
                                    borderRadius: theme.radius.medium,
                                    cursor: editName.trim() && !editSubmitting ? 'pointer' : 'not-allowed',
                                }}
                            >
                                {editSubmitting ? t('common.loading') : t('common.save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!deleteConfirmId && !showPinForDelete}
                title={t('selectProfile.delete')}
                message={t('selectProfile.deleteConfirm')}
                confirmText={t('common.delete')}
                cancelText={t('common.cancel')}
                confirmColor={theme.accent.red}
                onConfirm={() => setShowPinForDelete(true)}
                onCancel={() => setDeleteConfirmId(null)}
            />

            <PinModal
                isOpen={showPinAfterAdd}
                mode={pinModalModeAfterAdd}
                onClose={() => setShowPinAfterAdd(false)}
                onSuccess={() => void handleCreateProfileAfterPinSuccess()}
            />

            <PinModal
                isOpen={showPinForEdit}
                mode="enter"
                onClose={() => setShowPinForEdit(false)}
                onSubmitPin={async (pin) => {
                    await handleUpdateProfile(pin);
                }}
            />

            <PinModal
                isOpen={showPinForDelete}
                mode="enter"
                onClose={() => setShowPinForDelete(false)}
                onSubmitPin={async (pin) => {
                    await handleDeleteProfile(pin);
                }}
            />
        </div>
    );
}
