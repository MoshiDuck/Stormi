// INFO : app/routes/select-profile.tsx — Sélection de profil après login (type streaming)
import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useConfig } from '~/hooks/useConfig';
import { useLanguage } from '~/contexts/LanguageContext';
import type { StreamingProfile } from '~/types/auth';
import { darkTheme } from '~/utils/ui/theme';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { ErrorDisplay } from '~/components/ui/ErrorDisplay';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { PinModal, type PinModalMode } from '~/components/profile/PinModal';
import { TOUCH_TARGET_MIN } from '~/utils/ui/breakpoints';

const AVATAR_SIZE = 120;

export default function SelectProfileRoute() {
    const { user, setActiveProfile, clearActiveProfile, hasSelectedProfile } = useAuth();
    const { config } = useConfig();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<StreamingProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
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
        } catch (e: any) {
            setError(e.message || t('selectProfile.errorLoad'));
        } finally {
            setLoading(false);
        }
    }, [config?.baseUrl, user, t]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (hasSelectedProfile()) {
        return <Navigate to="/home" replace />;
    }

    const handleSelectProfile = (profile: StreamingProfile) => {
        if (editMode) return;
        setActiveProfile(profile);
        navigate('/home', { replace: true });
    };

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
            clearActiveProfile();
            setDeleteConfirmId(null);
            setShowPinForDelete(false);
        } finally {
            setDeleteSubmitting(false);
        }
    };

    const avatarSize = AVATAR_SIZE;

    if (loading && profiles.length === 0) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: darkTheme.background.primary,
                }}
            >
                <LoadingSpinner message={t('selectProfile.loading')} size="large" />
            </div>
        );
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: darkTheme.background.primary,
                padding: 'clamp(24px, 5vw, 48px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <h1
                style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 700,
                    color: darkTheme.text.primary,
                    marginBottom: 8,
                    textAlign: 'center',
                }}
            >
                {t('selectProfile.whoIsWatching')}
            </h1>
            <p
                style={{
                    fontSize: 'clamp(0.9375rem, 2vw, 1.125rem)',
                    color: darkTheme.text.secondary,
                    marginBottom: 40,
                    textAlign: 'center',
                }}
            >
                {t('selectProfile.subtitle')}
            </p>

            {error && (
                <div style={{ marginBottom: 24, maxWidth: 400, width: '100%' }}>
                    <ErrorDisplay error={error} />
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 24,
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    maxWidth: 900,
                }}
            >
                {profiles.map((profile) => (
                    <div
                        key={profile.id}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: avatarSize + 32,
                            maxWidth: avatarSize + 48,
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => handleSelectProfile(profile)}
                            disabled={editMode}
                            style={{
                                padding: 0,
                                border: 'none',
                                background: 'none',
                                cursor: editMode ? 'default' : 'pointer',
                                minWidth: TOUCH_TARGET_MIN,
                                minHeight: TOUCH_TARGET_MIN,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 12,
                            }}
                            aria-label={`${t('selectProfile.chooseProfile')}: ${profile.name}`}
                        >
                            <div
                                style={{
                                    width: avatarSize,
                                    height: avatarSize,
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    border: `3px solid ${editMode ? darkTheme.border.secondary : darkTheme.border.primary}`,
                                    transition: darkTheme.transition.normal,
                                    position: 'relative',
                                    flexShrink: 0,
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
                                            backgroundColor: darkTheme.background.tertiary,
                                            color: darkTheme.text.primary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: avatarSize * 0.45,
                                            fontWeight: 600,
                                        }}
                                    >
                                        {profile.name.charAt(0).toUpperCase() || '?'}
                                    </div>
                                )}
                                {profile.is_main && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            bottom: 4,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: 10,
                                            fontWeight: 600,
                                            color: darkTheme.text.primary,
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                        }}
                                    >
                                        {t('selectProfile.mainProfileBadge')}
                                    </span>
                                )}
                            </div>
                            <span
                                style={{
                                    fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
                                    fontWeight: 500,
                                    color: darkTheme.text.primary,
                                    textAlign: 'center',
                                }}
                            >
                                {profile.name}
                            </span>
                        </button>
                        {editMode && (
                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditId(profile.id);
                                        setEditName(profile.name);
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: darkTheme.accent.blue,
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${darkTheme.accent.blue}`,
                                        borderRadius: darkTheme.radius.medium,
                                        cursor: 'pointer',
                                        minHeight: TOUCH_TARGET_MIN,
                                    }}
                                >
                                    {t('selectProfile.edit')}
                                </button>
                                {!profile.is_main && (
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(profile.id)}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: darkTheme.accent.red,
                                            backgroundColor: 'transparent',
                                            border: `1px solid ${darkTheme.accent.red}`,
                                            borderRadius: darkTheme.radius.medium,
                                            cursor: 'pointer',
                                            minHeight: TOUCH_TARGET_MIN,
                                        }}
                                    >
                                        {t('selectProfile.delete')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Carte "Ajouter un profil" */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: avatarSize + 32 }}>
                    <button
                        type="button"
                        onClick={() => {
                            setEditMode(false);
                            setShowAddModal(true);
                        }}
                        style={{
                            width: avatarSize,
                            height: avatarSize,
                            borderRadius: 8,
                            border: `3px dashed ${darkTheme.border.secondary}`,
                            background: 'transparent',
                            color: darkTheme.text.secondary,
                            fontSize: 48,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: darkTheme.transition.normal,
                        }}
                        aria-label={t('selectProfile.addProfile')}
                    >
                        +
                    </button>
                    <span
                        style={{
                            fontSize: 'clamp(0.9375rem, 1.5vw, 1.125rem)',
                            fontWeight: 500,
                            color: darkTheme.text.secondary,
                            marginTop: 12,
                            textAlign: 'center',
                        }}
                    >
                        {t('selectProfile.addProfile')}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={() => setEditMode((e) => !e)}
                style={{
                    marginTop: 48,
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 500,
                    color: darkTheme.text.secondary,
                    backgroundColor: 'transparent',
                    border: `1px solid ${darkTheme.border.secondary}`,
                    borderRadius: darkTheme.radius.medium,
                    cursor: 'pointer',
                    minHeight: TOUCH_TARGET_MIN,
                }}
            >
                {editMode ? t('common.close') : t('selectProfile.editProfiles')}
            </button>

            {/* Modal ajout */}
            {showAddModal && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-profile-title"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
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
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: darkTheme.radius.large,
                            padding: 32,
                            maxWidth: 400,
                            width: '100%',
                            border: `1px solid ${darkTheme.border.primary}`,
                            boxShadow: darkTheme.shadow.large,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="add-profile-title" style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: darkTheme.text.primary }}>
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
                                    borderRadius: darkTheme.radius.medium,
                                    border: `1px solid ${darkTheme.border.primary}`,
                                    backgroundColor: darkTheme.background.tertiary,
                                    color: darkTheme.text.primary,
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
                                    borderRadius: darkTheme.radius.medium,
                                    border: `1px solid ${darkTheme.border.primary}`,
                                    backgroundColor: darkTheme.background.tertiary,
                                    color: darkTheme.text.primary,
                                    marginBottom: 16,
                                    boxSizing: 'border-box',
                                }}
                            />
                        ) : (
                            <p style={{ fontSize: 14, color: darkTheme.text.secondary, marginBottom: 16 }}>
                                {t('selectProfile.childProfileNoNameHint')}
                            </p>
                        )}
                        {!hasChildProfile && (
                            <div style={{ marginBottom: 16 }}>
                                <span style={{ fontSize: 14, fontWeight: 500, color: darkTheme.text.secondary, display: 'block', marginBottom: 8 }}>
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
                                            color: addIsChild ? darkTheme.text.secondary : darkTheme.text.primary,
                                            backgroundColor: addIsChild ? darkTheme.background.tertiary : darkTheme.background.primary,
                                            border: `2px solid ${addIsChild ? darkTheme.border.secondary : darkTheme.accent.blue}`,
                                            borderRadius: darkTheme.radius.medium,
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
                                            color: addIsChild ? darkTheme.text.primary : darkTheme.text.secondary,
                                            backgroundColor: addIsChild ? darkTheme.background.primary : darkTheme.background.tertiary,
                                            border: `2px solid ${addIsChild ? darkTheme.accent.blue : darkTheme.border.secondary}`,
                                            borderRadius: darkTheme.radius.medium,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t('selectProfile.profileTypeChild')}
                                    </button>
                                </div>
                            </div>
                        )}
                        {addError && (
                            <p style={{ color: darkTheme.accent.red, fontSize: 14, marginBottom: 12 }}>{addError}</p>
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
                                    color: darkTheme.text.primary,
                                    backgroundColor: darkTheme.background.tertiary,
                                    border: `1px solid ${darkTheme.border.primary}`,
                                    borderRadius: darkTheme.radius.medium,
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
                                    backgroundColor: darkTheme.accent.blue,
                                    border: 'none',
                                    borderRadius: darkTheme.radius.medium,
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
                    aria-labelledby="edit-profile-title"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
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
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: darkTheme.radius.large,
                            padding: 32,
                            maxWidth: 400,
                            width: '100%',
                            border: `1px solid ${darkTheme.border.primary}`,
                            boxShadow: darkTheme.shadow.large,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="edit-profile-title" style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: darkTheme.text.primary }}>
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
                                borderRadius: darkTheme.radius.medium,
                                border: `1px solid ${darkTheme.border.primary}`,
                                backgroundColor: darkTheme.background.tertiary,
                                color: darkTheme.text.primary,
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
                                    color: darkTheme.text.primary,
                                    backgroundColor: darkTheme.background.tertiary,
                                    border: `1px solid ${darkTheme.border.primary}`,
                                    borderRadius: darkTheme.radius.medium,
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
                                    backgroundColor: darkTheme.accent.blue,
                                    border: 'none',
                                    borderRadius: darkTheme.radius.medium,
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
                confirmColor={darkTheme.accent.red}
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
