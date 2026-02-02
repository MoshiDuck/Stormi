// INFO : app/routes/lecteur-local.tsx
// Page dédiée au lecteur local : sélection de fichiers audio/vidéo puis lecture en playlist.
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '~/contexts/LanguageContext';
import { usePlayer } from '~/contexts/PlayerContext';
import { darkTheme } from '~/utils/ui/theme';

const ACCEPT = 'audio/*,video/*,.mkv,video/x-matroska';

export function meta() {
    return [
        { title: 'Lecteur local | Stormi' },
        { name: 'description', content: 'Lisez des fichiers audio et vidéo depuis votre appareil en lecture continue.' },
    ];
}

export default function LecteurLocalRoute() {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { playLocal } = usePlayer();
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const isMediaFile = (f: File) =>
        f.type.startsWith('audio/') ||
        f.type.startsWith('video/') ||
        f.type === 'video/x-matroska' ||
        /\.(mkv|webm|mp4|mov|avi|m4a|mp3|wav|ogg|flac)$/i.test(f.name);

    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const list = Array.from(newFiles).filter(isMediaFile);
        if (list.length === 0) return;
        setFiles(prev => [...prev, ...list]);
    }, []);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files;
        if (selected?.length) {
            addFiles(selected);
        }
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handlePlay = () => {
        if (files.length === 0) return;
        const playlist = playLocal({
            files,
            startIndex: 0,
            startAsMiniPlayer: false,
        });
        if (playlist?.length) {
            navigate('/reader/local/0', { state: { playlist, startIndex: 0 } });
        }
    };

    return (
        <div style={{
            maxWidth: 720,
            margin: '0 auto',
            padding: '40px 20px',
        }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: darkTheme.text.primary,
                    margin: 0,
                    letterSpacing: '-0.5px',
                }}>
                    {t('localPlayer.title')}
                </h1>
                <p style={{
                    fontSize: 15,
                    color: darkTheme.text.secondary,
                    marginTop: 8,
                    lineHeight: 1.5,
                }}>
                    {t('localPlayer.subtitle')}
                </p>
            </header>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                style={{ display: 'none' }}
                onChange={handleInputChange}
            />

            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label={t('localPlayer.dropZone')}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                style={{
                    border: `2px dashed ${isDragging ? darkTheme.accent.blue : darkTheme.border.secondary}`,
                    borderRadius: darkTheme.radius.large,
                    padding: 48,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? darkTheme.surface.info : darkTheme.background.secondary,
                    transition: `border-color ${darkTheme.transition.normal}, background-color ${darkTheme.transition.normal}`,
                }}
            >
                <div style={{
                    fontSize: 40,
                    marginBottom: 12,
                    opacity: isDragging ? 1 : 0.7,
                }}>
                    🎵
                </div>
                <p style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: darkTheme.text.primary,
                    margin: 0,
                }}>
                    {t('localPlayer.dropZone')}
                </p>
                <p style={{
                    fontSize: 14,
                    color: darkTheme.text.tertiary,
                    marginTop: 8,
                }}>
                    {t('localPlayer.dropZoneOr')} <span style={{ color: darkTheme.accent.blue, textDecoration: 'underline' }}>{t('localPlayer.browse')}</span>
                </p>
                <p style={{
                    fontSize: 12,
                    color: darkTheme.text.disabled,
                    marginTop: 12,
                }}>
                    {t('localPlayer.acceptedFormats')}
                </p>
            </div>

            {files.length > 0 && (
                <>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 28,
                        marginBottom: 12,
                    }}>
                        <h2 style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: darkTheme.text.primary,
                            margin: 0,
                        }}>
                            {t('localPlayer.playlistCount').replace('{count}', String(files.length))}
                        </h2>
                        <button
                            type="button"
                            onClick={handlePlay}
                            style={{
                                padding: '12px 24px',
                                fontSize: 15,
                                fontWeight: 600,
                                color: '#fff',
                                backgroundColor: darkTheme.accent.blue,
                                border: 'none',
                                borderRadius: darkTheme.radius.medium,
                                cursor: 'pointer',
                                transition: darkTheme.transition.normal,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = darkTheme.accent.blueHover ?? '#357ae8';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = darkTheme.accent.blue;
                            }}
                        >
                            {t('localPlayer.play')}
                        </button>
                    </div>

                    <ul style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}>
                        {files.map((file, index) => (
                            <li
                                key={`${file.name}-${index}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    backgroundColor: darkTheme.background.secondary,
                                    borderRadius: darkTheme.radius.medium,
                                    border: `1px solid ${darkTheme.border.primary}`,
                                }}
                            >
                                <span style={{ fontSize: 20 }}>
                                    {file.type.startsWith('audio/') ? '🎵' : '🎬'}
                                </span>
                                <span style={{
                                    flex: 1,
                                    fontSize: 14,
                                    color: darkTheme.text.primary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}>
                                    {file.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                    aria-label={t('localPlayer.remove')}
                                    style={{
                                        padding: '6px 10px',
                                        fontSize: 13,
                                        color: darkTheme.text.secondary,
                                        backgroundColor: 'transparent',
                                        border: `1px solid ${darkTheme.border.secondary}`,
                                        borderRadius: darkTheme.radius.small,
                                        cursor: 'pointer',
                                        transition: darkTheme.transition.fast,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = darkTheme.accent.red;
                                        e.currentTarget.style.borderColor = darkTheme.accent.red;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = darkTheme.text.secondary;
                                        e.currentTarget.style.borderColor = darkTheme.border.secondary;
                                    }}
                                >
                                    {t('localPlayer.remove')}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {files.length === 0 && (
                <p style={{
                    marginTop: 24,
                    fontSize: 14,
                    color: darkTheme.text.tertiary,
                    textAlign: 'center',
                }}>
                    {t('localPlayer.emptyState')} — {t('localPlayer.emptyStateHint')}
                </p>
            )}
        </div>
    );
}
