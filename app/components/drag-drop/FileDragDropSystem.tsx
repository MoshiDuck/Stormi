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

// ─── Constantes ─────────────────────────────────────────────────────────────
const DROP_ZONE_DELETE_ID = 'file-drop-delete';

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

// ─── Zone de drop « Supprimer » ──────────────────────────────────────────────
function DropZoneDelete() {
    const { isOver, setNodeRef } = useDroppable({ id: DROP_ZONE_DELETE_ID });
    const bg = isOver ? '#d33b2c' : '#ea4335';
    return (
        <div
            ref={setNodeRef}
            style={{
                position: 'fixed',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                minWidth: 200,
                height: 80,
                backgroundColor: `${bg}${isOver ? 'ff' : 'cc'}`,
                borderRadius: 16,
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                zIndex: 9999,
                boxShadow: isOver
                    ? '0 0 30px rgba(211,59,44,0.5), 0 8px 32px rgba(0,0,0,0.4)'
                    : '0 8px 32px rgba(0,0,0,0.3)',
                border: `2px solid ${isOver ? '#fff' : 'transparent'}`,
                transition: 'all 0.2s ease-out',
            }}
        >
            <span style={{ fontSize: 32, filter: isOver ? 'drop-shadow(0 0 8px white)' : 'none' }}>🗑️</span>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 16, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                Supprimer
            </span>
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

// ─── Provider principal (DndContext + overlay + zone + confirmation) ──────────
export function FileDragDropProvider({ children }: { children: React.ReactNode }) {
    const [activeItem, setActiveItem] = useState<DraggableFileItem | null>(null);
    const [pendingAction, setPendingAction] = useState<{ item: DraggableFileItem } | null>(null);
    const dropActionHandlerRef = useRef<DropActionHandler | null>(null);

    const setDropActionHandler = useCallback((handler: DropActionHandler | null) => {
        dropActionHandlerRef.current = handler;
    }, []);

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
            }

            setActiveItem(null);
        },
        [activeItem]
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

                {/* Zone Supprimer */}
                {activeItem && <DropZoneDelete />}

                {/* Confirmation de suppression */}
                {pendingAction && (
                    <ConfirmToast
                        message="Supprimer ce fichier ?"
                        itemName={pendingAction.item.dragLabel ?? pendingAction.item.filename ?? 'Fichier sans nom'}
                        onConfirm={handleConfirm}
                        onCancel={handleCancel}
                    />
                )}
            </DndContext>
        </FileDragDropContext.Provider>
    );
}
