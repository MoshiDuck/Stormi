// INFO : app/components/drag-drop/FileDragDropSystem.tsx
// ═══ SEUL SYSTÈME DE DRAG & DROP ═══
// Ancien système supprimé (DragDropContext + DropZoneOverlay). Tout passe par ici :
// - FileDragDropProvider (root), DraggableItem (cartes), useFileDragDrop (useFileActions).
// Basé sur @dnd-kit : DragOverlay suit le curseur, zone Supprimer, confirmation.

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    useDraggable,
    useDroppable,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import type { DraggableFileItem, DropZoneAction, DropResult } from '~/types/dragdrop';
import { darkTheme } from '~/utils/ui/theme';
import { useLanguage } from '~/contexts/LanguageContext';
import { useConfig } from '~/hooks/useConfig';
import { addRestrictionForProfile, removeRestrictionForProfile } from '~/hooks/useProfileRestrictions';
import { useAuth } from '~/hooks/useAuth';
import type { StreamingProfile } from '~/types/auth';

// ─── Constantes ─────────────────────────────────────────────────────────────
const DROP_ZONE_DELETE_ID = 'file-drop-delete';
const DROP_ZONE_HIDE_FROM_PROFILE_ID = 'file-drop-hide-from-profile';
const DROP_ZONE_SHOW_IN_PROFILE_ID = 'file-drop-show-in-profile';

// ─── Contexte (enregistrement du handler de suppression par les routes) ─────
type DropActionHandler = (action: DropZoneAction, item: DraggableFileItem) => Promise<DropResult>;

interface FileDragDropContextValue {
    setDropActionHandler: (handler: DropActionHandler | null) => void;
}

const FileDragDropContext = createContext<FileDragDropContextValue | null>(null);

export function useFileDragDrop(): FileDragDropContextValue {
    const ctx = useContext(FileDragDropContext);
    if (!ctx) throw new Error('useFileDragDrop must be used within FileDragDropProvider');
    return ctx;
}

// ─── Zones de drop (Supprimer + Masquer à un profil) ─────────────────────────
function DropZoneDelete() {
    const { isOver, setNodeRef } = useDroppable({ id: DROP_ZONE_DELETE_ID });
    const bg = isOver ? '#d33b2c' : '#ea4335';
    return (
        <div
            ref={setNodeRef}
            style={{
                minWidth: 160,
                height: 80,
                backgroundColor: `${bg}${isOver ? 'ff' : 'cc'}`,
                borderRadius: 16,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: isOver
                    ? '0 0 30px rgba(211,59,44,0.5), 0 8px 32px rgba(0,0,0,0.4)'
                    : '0 8px 32px rgba(0,0,0,0.3)',
                border: `2px solid ${isOver ? '#fff' : 'transparent'}`,
                transition: 'all 0.2s ease-out',
            }}
        >
            <span style={{ fontSize: 28, filter: isOver ? 'drop-shadow(0 0 8px white)' : 'none' }}>🗑️</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Supprimer
            </span>
        </div>
    );
}

function DropZoneHideFromProfile() {
    const { isOver, setNodeRef } = useDroppable({ id: DROP_ZONE_HIDE_FROM_PROFILE_ID });
    const { t } = useLanguage();
    const bg = isOver ? '#1a5fb4' : '#3584e4';
    return (
        <div
            ref={setNodeRef}
            style={{
                minWidth: 180,
                height: 80,
                backgroundColor: `${bg}${isOver ? 'ff' : 'cc'}`,
                borderRadius: 16,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: isOver
                    ? '0 0 30px rgba(53,132,228,0.5), 0 8px 32px rgba(0,0,0,0.4)'
                    : '0 8px 32px rgba(0,0,0,0.3)',
                border: `2px solid ${isOver ? '#fff' : 'transparent'}`,
                transition: 'all 0.2s ease-out',
            }}
        >
            <span style={{ fontSize: 28, filter: isOver ? 'drop-shadow(0 0 8px white)' : 'none' }}>👤</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {t('selectProfile.hideFromProfile')}
            </span>
        </div>
    );
}

function DropZoneShowInProfile() {
    const { isOver, setNodeRef } = useDroppable({ id: DROP_ZONE_SHOW_IN_PROFILE_ID });
    const { t } = useLanguage();
    const bg = isOver ? '#2e7d32' : '#43a047';
    return (
        <div
            ref={setNodeRef}
            style={{
                minWidth: 180,
                height: 80,
                backgroundColor: `${bg}${isOver ? 'ff' : 'cc'}`,
                borderRadius: 16,
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: isOver
                    ? '0 0 30px rgba(67,160,71,0.5), 0 8px 32px rgba(0,0,0,0.4)'
                    : '0 8px 32px rgba(0,0,0,0.3)',
                border: `2px solid ${isOver ? '#fff' : 'transparent'}`,
                transition: 'all 0.2s ease-out',
            }}
        >
            <span style={{ fontSize: 28, filter: isOver ? 'drop-shadow(0 0 8px white)' : 'none' }}>👁️</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {t('selectProfile.showInProfile')}
            </span>
        </div>
    );
}

// ─── Modale « Masquer à un profil » (après drop sur la zone) ──────────────────
function HideFromProfileModal({
    item,
    onClose,
}: {
    item: DraggableFileItem;
    onClose: () => void;
}) {
    const { config } = useConfig();
    const { t } = useLanguage();
    const [profiles, setProfiles] = useState<StreamingProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState<string | null>(null);
    const [doneMessage, setDoneMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!config?.baseUrl) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('stormi_token') : null;
        if (!token) return;
        setLoading(true);
        fetch(`${config.baseUrl}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.json())
            .then((data: unknown) => {
                const d = data as { error?: string; profiles?: StreamingProfile[] };
                if (d.profiles) setProfiles(d.profiles.filter((p) => !p.is_main));
            })
            .finally(() => setLoading(false));
    }, [config?.baseUrl]);

    useEffect(() => {
        if (!doneMessage) return;
        const t = setTimeout(onClose, 2000);
        return () => clearTimeout(t);
    }, [doneMessage, onClose]);

    const handleSelect = useCallback(
        async (profile: StreamingProfile) => {
            if (!config?.baseUrl) return;
            const token = typeof window !== 'undefined' ? localStorage.getItem('stormi_token') : null;
            if (!token) return;
            setAdding(profile.id);
            try {
                await addRestrictionForProfile(config.baseUrl, token, profile.id, 'file', item.file_id);
                setDoneMessage(t('selectProfile.hiddenFromProfile'));
            } catch {
                setAdding(null);
            } finally {
                setAdding(null);
            }
        },
        [config?.baseUrl, item.file_id, t]
    );

    const label = item.dragLabel ?? item.filename ?? 'Fichier';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hide-from-profile-title"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10001,
                padding: 24,
            }}
            onClick={() => !adding && !doneMessage && onClose()}
        >
            <div
                style={{
                    backgroundColor: darkTheme.background.secondary,
                    borderRadius: 12,
                    padding: 24,
                    maxWidth: 360,
                    width: '100%',
                    border: `1px solid ${darkTheme.border.primary}`,
                    boxShadow: darkTheme.shadow.large,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="hide-from-profile-title" style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: darkTheme.text.primary }}>
                    {t('selectProfile.hideFromProfileTitle')}
                </h2>
                <p style={{ fontSize: 13, color: darkTheme.text.secondary, marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                </p>
                {doneMessage ? (
                    <p style={{ fontSize: 14, color: '#46d369', fontWeight: 500 }}>{doneMessage}</p>
                ) : loading ? (
                    <p style={{ fontSize: 14, color: darkTheme.text.secondary }}>{t('common.loading')}</p>
                ) : profiles.length === 0 ? (
                    <p style={{ fontSize: 14, color: darkTheme.text.secondary }}>{t('selectProfile.chooseProfileToHide')}</p>
                ) : (
                    <>
                        <p style={{ fontSize: 12, color: darkTheme.text.secondary, marginBottom: 12 }}>{t('selectProfile.chooseProfileToHide')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflow: 'auto' }}>
                            {profiles.map((profile) => (
                                <button
                                    key={profile.id}
                                    type="button"
                                    disabled={adding === profile.id}
                                    onClick={() => handleSelect(profile)}
                                    style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        border: `1px solid ${darkTheme.border.primary}`,
                                        borderRadius: 8,
                                        backgroundColor: darkTheme.background.tertiary,
                                        color: darkTheme.text.primary,
                                        fontSize: 14,
                                        cursor: adding === profile.id ? 'wait' : 'pointer',
                                    }}
                                >
                                    {profile.name}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                marginTop: 16,
                                padding: '8px 16px',
                                fontSize: 13,
                                color: darkTheme.text.secondary,
                                backgroundColor: 'transparent',
                                border: `1px solid ${darkTheme.border.secondary}`,
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            {t('common.cancel')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Modale « Réafficher pour un profil » (après drop sur la zone Afficher) ───
function ShowInProfileModal({
    item,
    restrictedProfileIds,
    onClose,
}: {
    item: DraggableFileItem;
    restrictedProfileIds: string[];
    onClose: () => void;
}) {
    const { config } = useConfig();
    const { t } = useLanguage();
    const [profiles, setProfiles] = useState<StreamingProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [doneMessage, setDoneMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!config?.baseUrl) return;
        const token = typeof window !== 'undefined' ? localStorage.getItem('stormi_token') : null;
        if (!token) return;
        setLoading(true);
        fetch(`${config.baseUrl}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.json())
            .then((data: unknown) => {
                const d = data as { error?: string; profiles?: StreamingProfile[] };
                if (d.profiles) {
                    const restrictedSet = new Set(restrictedProfileIds);
                    setProfiles(d.profiles.filter((p) => restrictedSet.has(p.id)));
                } else setProfiles([]);
            })
            .finally(() => setLoading(false));
    }, [config?.baseUrl, restrictedProfileIds]);

    useEffect(() => {
        if (!doneMessage) return;
        const tId = setTimeout(onClose, 2000);
        return () => clearTimeout(tId);
    }, [doneMessage, onClose]);

    const handleSelect = useCallback(
        async (profile: StreamingProfile) => {
            if (!config?.baseUrl) return;
            const token = typeof window !== 'undefined' ? localStorage.getItem('stormi_token') : null;
            if (!token) return;
            setRemoving(profile.id);
            try {
                await removeRestrictionForProfile(config.baseUrl, token, profile.id, 'file', item.file_id);
                setDoneMessage(t('selectProfile.shownInProfile'));
            } catch {
                setRemoving(null);
            } finally {
                setRemoving(null);
            }
        },
        [config?.baseUrl, item.file_id, t]
    );

    const label = item.dragLabel ?? item.filename ?? 'Fichier';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="show-in-profile-title"
            style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10001,
                padding: 24,
            }}
            onClick={() => !removing && !doneMessage && onClose()}
        >
            <div
                style={{
                    backgroundColor: darkTheme.background.secondary,
                    borderRadius: 12,
                    padding: 24,
                    maxWidth: 360,
                    width: '100%',
                    border: `1px solid ${darkTheme.border.primary}`,
                    boxShadow: darkTheme.shadow.large,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="show-in-profile-title" style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: darkTheme.text.primary }}>
                    {t('selectProfile.showInProfileTitle')}
                </h2>
                <p style={{ fontSize: 13, color: darkTheme.text.secondary, marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                </p>
                {doneMessage ? (
                    <p style={{ fontSize: 14, color: '#46d369', fontWeight: 500 }}>{doneMessage}</p>
                ) : loading ? (
                    <p style={{ fontSize: 14, color: darkTheme.text.secondary }}>{t('common.loading')}</p>
                ) : profiles.length === 0 ? (
                    <p style={{ fontSize: 14, color: darkTheme.text.secondary }}>{t('selectProfile.chooseProfileToShow')}</p>
                ) : (
                    <>
                        <p style={{ fontSize: 12, color: darkTheme.text.secondary, marginBottom: 12 }}>{t('selectProfile.chooseProfileToShow')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflow: 'auto' }}>
                            {profiles.map((profile) => (
                                <button
                                    key={profile.id}
                                    type="button"
                                    disabled={removing === profile.id}
                                    onClick={() => handleSelect(profile)}
                                    style={{
                                        padding: '12px 16px',
                                        textAlign: 'left',
                                        border: `1px solid ${darkTheme.border.primary}`,
                                        borderRadius: 8,
                                        backgroundColor: darkTheme.background.tertiary,
                                        color: darkTheme.text.primary,
                                        fontSize: 14,
                                        cursor: removing === profile.id ? 'wait' : 'pointer',
                                    }}
                                >
                                    {profile.name}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                marginTop: 16,
                                padding: '8px 16px',
                                fontSize: 13,
                                color: darkTheme.text.secondary,
                                backgroundColor: 'transparent',
                                border: `1px solid ${darkTheme.border.secondary}`,
                                borderRadius: 8,
                                cursor: 'pointer',
                            }}
                        >
                            {t('common.cancel')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Toast de confirmation de suppression ────────────────────────────────────
function ConfirmToast({
    message,
    itemName,
    onConfirm,
    onCancel,
}: {
    message: string;
    itemName: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const [countdown, setCountdown] = useState(5);

    React.useEffect(() => {
        const t = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(t);
                    onCancel();
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(t);
    }, [onCancel]);

    return (
        <div
            role="alert"
            aria-live="assertive"
            style={{
                position: 'fixed',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: darkTheme.background.secondary,
                borderLeft: `4px solid ${darkTheme.accent.red}`,
                borderRadius: 12,
                padding: '16px 20px',
                boxShadow: darkTheme.shadow.large,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                zIndex: 10001,
                minWidth: 400,
            }}
        >
            <div
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: `${darkTheme.accent.red}20`,
                    color: darkTheme.accent.red,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                }}
            >
                🗑️
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ color: darkTheme.text.primary, fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                    {message}
                </div>
                <div
                    style={{
                        color: darkTheme.text.secondary,
                        fontSize: 12,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                    }}
                >
                    {itemName}
                </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${darkTheme.border.secondary}`,
                        borderRadius: 6,
                        color: darkTheme.text.secondary,
                        fontSize: 13,
                        cursor: 'pointer',
                    }}
                >
                    Annuler ({countdown}s)
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: darkTheme.accent.red,
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    Supprimer
                </button>
            </div>
        </div>
    );
}

// ─── Preview affiché dans le DragOverlay (image + label, au-dessus du fond noir) ─
function DragPreview({ item }: { item: DraggableFileItem }) {
    const label = item.dragLabel ?? item.filename ?? 'Fichier';
    const previewUrl = item.previewUrl && String(item.previewUrl).trim() ? item.previewUrl : null;
    const [imageError, setImageError] = useState(false);
    const showImage = previewUrl && !imageError;

    React.useEffect(() => {
        setImageError(false);
    }, [item.file_id, previewUrl]);

    return (
        <div
            style={{
                width: 160,
                borderRadius: 12,
                backgroundColor: darkTheme.background.secondary,
                boxShadow: darkTheme.shadow.large,
                border: `2px solid ${darkTheme.border.primary}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {showImage ? (
                <img
                    src={previewUrl}
                    alt=""
                    style={{
                        width: '100%',
                        aspectRatio: '16/10',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        flexShrink: 0,
                        display: 'block',
                    }}
                    onError={() => setImageError(true)}
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        aspectRatio: '16/10',
                        backgroundColor: darkTheme.background.tertiary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 40,
                    }}
                >
                    📄
                </div>
            )}
            <div
                style={{
                    padding: '10px 12px',
                    color: darkTheme.text.primary,
                    fontSize: 13,
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </div>
        </div>
    );
}

// ─── Wrapper draggable (à envelopper autour de chaque carte) ──────────────────
interface DraggableItemProps {
    item: DraggableFileItem;
    /** Id unique pour ce drag (obligatoire si le même file_id apparaît plusieurs fois, ex. hero + carousels) */
    dragId?: string;
    children: React.ReactNode;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export function DraggableItem({ item, dragId, children, disabled = false, className, style }: DraggableItemProps) {
    const id = dragId ?? item.file_id;
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: { item },
        disabled,
    });

    // Quand on utilise DragOverlay, on cache l’original pendant le drag pour éviter doublon + problème de z-index
    const styleCombined: React.CSSProperties = {
        ...style,
        cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0 : 1,
        transform: isDragging ? undefined : transform ? CSS.Translate.toString(transform) : undefined,
        transition: isDragging ? 'none' : 'opacity 0.2s ease, transform 0.2s ease',
        userSelect: 'none',
        touchAction: 'none',
        ...(isDragging && { zIndex: 9999, position: 'relative' }),
    };

    return (
        <div ref={setNodeRef} style={styleCombined} className={className} {...listeners} {...attributes}>
            {children}
        </div>
    );
}

// ─── Provider principal (DndContext + overlay + zones + confirmation) ──────────
export function FileDragDropProvider({ children }: { children: React.ReactNode }) {
    const [activeItem, setActiveItem] = useState<DraggableFileItem | null>(null);
    const [pendingAction, setPendingAction] = useState<{ item: DraggableFileItem } | null>(null);
    const [pendingHideFromProfile, setPendingHideFromProfile] = useState<{ item: DraggableFileItem } | null>(null);
    const [pendingShowInProfile, setPendingShowInProfile] = useState<{ item: DraggableFileItem; restrictedProfileIds: string[] } | null>(null);
    const [showUnhideZone, setShowUnhideZone] = useState(false);
    const [showHideZone, setShowHideZone] = useState(true);
    const [restrictedProfileIdsForItem, setRestrictedProfileIdsForItem] = useState<string[]>([]);
    const dropActionHandlerRef = useRef<DropActionHandler | null>(null);
    const { activeProfile } = useAuth();
    const { config } = useConfig();

    const setDropActionHandler = useCallback((handler: DropActionHandler | null) => {
        dropActionHandlerRef.current = handler;
    }, []);

    useEffect(() => {
        if (!activeItem || !config?.baseUrl) {
            setShowUnhideZone(false);
            setShowHideZone(true);
            setRestrictedProfileIdsForItem([]);
            return;
        }
        const token = typeof window !== 'undefined' ? localStorage.getItem('stormi_token') : null;
        if (!token) {
            setShowUnhideZone(false);
            setShowHideZone(true);
            setRestrictedProfileIdsForItem([]);
            return;
        }
        let cancelled = false;
        const fileId = activeItem.file_id;
        Promise.all([
            fetch(`${config.baseUrl}/api/profiles/restrictions-for-item?scope=file&reference=${encodeURIComponent(fileId)}`, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json() as Promise<{ error?: string; profileIds?: string[] }>),
            fetch(`${config.baseUrl}/api/profiles`, { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
                res.json() as Promise<{ error?: string; profiles?: StreamingProfile[] }>
            ),
        ])
            .then(([restData, profilesData]) => {
                if (cancelled || activeItem?.file_id !== fileId) return;
                const restrictedIds = restData.profileIds ?? [];
                const allProfiles = profilesData.profiles ?? [];
                const nonMain = allProfiles.filter((p) => !p.is_main);
                setRestrictedProfileIdsForItem(restrictedIds);
                const currentId = activeProfile?.id ?? null;
                const isMainProfile = activeProfile?.is_main ?? false;
                const show =
                    restrictedIds.length >= 1 &&
                    (isMainProfile
                        ? true
                        : currentId != null
                          ? restrictedIds.length < nonMain.length - 1 || restrictedIds.includes(currentId)
                          : restrictedIds.length < nonMain.length);
                setShowUnhideZone(show);
                const hideZoneVisible =
                    nonMain.length > 0 && nonMain.some((p) => !restrictedIds.includes(p.id));
                setShowHideZone(hideZoneVisible);
            })
            .catch(() => {
                if (!cancelled) {
                    setShowUnhideZone(false);
                    setShowHideZone(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [activeItem, config?.baseUrl, activeProfile?.id]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const item = event.active.data.current?.item as DraggableFileItem | undefined;
        if (item) setActiveItem(item);
    }, []);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { over } = event;
            const item = activeItem;

            if (over?.id === DROP_ZONE_DELETE_ID && item) {
                setPendingAction({ item });
            } else if (over?.id === DROP_ZONE_HIDE_FROM_PROFILE_ID && item) {
                setPendingHideFromProfile({ item });
            } else if (over?.id === DROP_ZONE_SHOW_IN_PROFILE_ID && item && restrictedProfileIdsForItem.length > 0) {
                setPendingShowInProfile({ item, restrictedProfileIds: restrictedProfileIdsForItem });
            }

            setActiveItem(null);
        },
        [activeItem, restrictedProfileIdsForItem]
    );

    const handleConfirm = useCallback(async () => {
        if (!pendingAction || !dropActionHandlerRef.current) {
            setPendingAction(null);
            return;
        }
        await dropActionHandlerRef.current('delete', pendingAction.item);
        setPendingAction(null);
    }, [pendingAction]);

    const handleCancel = useCallback(() => {
        setPendingAction(null);
    }, []);

    return (
        <FileDragDropContext.Provider value={{ setDropActionHandler }}>
            <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    autoScroll={false}
                >
                {children}

                {/* Overlay sombre pendant le drag */}
                {activeItem && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            zIndex: 9998,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Preview qui suit le curseur (centré sous la souris pour éviter le décalage) */}
                <DragOverlay zIndex={10000} modifiers={[snapCenterToCursor]}>
                    {activeItem ? <DragPreview item={activeItem} /> : null}
                </DragOverlay>

                {/* Zones de drop : Réafficher (si pertinent) + Masquer + Supprimer */}
                {activeItem && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 40,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 16,
                            zIndex: 9999,
                        }}
                    >
                        {showUnhideZone && <DropZoneShowInProfile />}
                        {showHideZone && <DropZoneHideFromProfile />}
                        <DropZoneDelete />
                    </div>
                )}

                {/* Confirmation de suppression */}
                {pendingAction && (
                    <ConfirmToast
                        message="Supprimer ce fichier ?"
                        itemName={pendingAction.item.dragLabel ?? pendingAction.item.filename ?? 'Fichier sans nom'}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />
                )}

                {/* Modale « Masquer à un profil » (après drop sur la zone) */}
                {pendingHideFromProfile && (
                    <HideFromProfileModal
                        item={pendingHideFromProfile.item}
                        onClose={() => setPendingHideFromProfile(null)}
                    />
                )}

                {/* Modale « Réafficher pour un profil » (après drop sur la zone Afficher) */}
                {pendingShowInProfile && (
                    <ShowInProfileModal
                        item={pendingShowInProfile.item}
                        restrictedProfileIds={pendingShowInProfile.restrictedProfileIds}
                        onClose={() => setPendingShowInProfile(null)}
                    />
                )}
            </DndContext>
        </FileDragDropContext.Provider>
    );
}
