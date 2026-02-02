// INFO : app/routes/library.tsx — page Bibliothèque avec onglets Images, Documents, Archives, Exécutables, Autres
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { darkTheme } from '~/utils/ui/theme';
import type { FileCategory } from '~/utils/file/fileClassifier';
import { LibraryTabBar, type LibraryTab } from '~/components/ui/LibraryTabBar';
import { formatFileSize, formatDate } from '~/utils/format';
import { useLanguage } from '~/contexts/LanguageContext';
import { DraggableItem } from '~/components/ui/DraggableItem';
import { useFileActions } from '~/hooks/useFileActions';
import { useToast } from '~/components/ui/Toast';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { ErrorDisplay } from '~/components/ui/ErrorDisplay';
import { useRefetchOnCacheInvalidation } from '~/utils/cache/cacheInvalidation';
import { SectionedMasonryGrid } from '~/components/ui/VirtualizedMasonryGrid';
import { groupByMonthAsSections } from '~/utils/file/fileGridUtils';
import type { FileWithDate } from '~/utils/file/fileGridUtils';

interface FileItem extends FileWithDate {
    file_id: string;
    category: string;
    size: number;
    mime_type: string;
    filename: string | null;
    created_at?: number;
    uploaded_at: number;
    file_created_at?: number | null;
}

const LIBRARY_TAB_TO_CATEGORY: Record<LibraryTab, FileCategory> = {
    images: 'images',
    documents: 'documents',
    archives: 'archives',
    executables: 'executables',
    others: 'others',
};

const LIBRARY_ICONS: Record<LibraryTab, string> = {
    images: '🖼️',
    documents: '📄',
    archives: '📦',
    executables: '⚙️',
    others: '📎',
};

export function meta() {
    return [
        { title: 'Bibliothèque | Stormi' },
        { name: 'description', content: 'Vos images, documents, archives et fichiers. Gérez votre bibliothèque de fichiers.' },
    ];
}

export default function LibraryRoute() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showToast, ToastContainer } = useToast();

    const tabParam = searchParams.get('tab') as LibraryTab | null;
    const validTabs: LibraryTab[] = ['images', 'documents', 'archives', 'executables', 'others'];
    const [selectedTab, setSelectedTab] = useState<LibraryTab>(() =>
        tabParam && validTabs.includes(tabParam) ? tabParam : 'images'
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileItem[]>([]);

    const category = LIBRARY_TAB_TO_CATEGORY[selectedTab];

    const handleFileDeleted = useCallback((fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.file_id !== fileId));
    }, []);

    useFileActions({
        userId: user?.id || null,
        onFileDeleted: handleFileDeleted,
        onError: (err) => showToast(err, 'error'),
        onSuccess: (msg) => showToast(msg, 'success'),
    });

    const fetchFiles = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('stormi_token');
            const response = await fetch(
                `https://stormi.uk/api/upload/user/${user.id}?category=${category}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) throw new Error(t('errors.fetchFailed'));
            const data = (await response.json()) as { files: FileItem[] };
            setFiles(data.files || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('errors.unknown'));
        } finally {
            setLoading(false);
        }
    }, [user?.id, category, t]);

    useEffect(() => {
        if (tabParam && validTabs.includes(tabParam)) {
            setSelectedTab(tabParam);
        }
    }, [tabParam]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);

    useRefetchOnCacheInvalidation(user?.id ?? null, category, fetchFiles);

    const getFileUrl = useCallback((file: FileItem) => {
        return `https://stormi.uk/api/files/${file.category}/${file.file_id}`;
    }, []);

    const handleCardClick = useCallback(
        (file: FileItem) => {
            if (file.category === 'images') {
                navigate(`/reader/${file.category}/${file.file_id}`);
            } else if (file.category === 'documents' && file.mime_type?.includes('pdf')) {
                navigate(`/reader/${file.category}/${file.file_id}`);
            } else {
                window.open(getFileUrl(file), '_blank');
            }
        },
        [navigate, getFileUrl]
    );

    const masonrySections = groupByMonthAsSections(files);

    const renderImageCard = useCallback(
        ({ data, width }: { data: FileItem; width: number }) => (
            <DraggableItem
                key={data.file_id}
                item={{
                    file_id: data.file_id,
                    category: data.category,
                    filename: data.filename,
                    size: data.size,
                    mime_type: data.mime_type,
                }}
            >
                <div
                    onClick={() => handleCardClick(data)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCardClick(data);
                        }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Voir ${data.filename || 'cette image'}`}
                    style={{
                        width,
                        minHeight: 80,
                        backgroundColor: darkTheme.background.secondary,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: `2px solid ${darkTheme.border.primary}`,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = darkTheme.accent.blue;
                        e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = darkTheme.border.primary;
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <img
                        src={getFileUrl(data)}
                        alt={data.filename || 'Image'}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                </div>
            </DraggableItem>
        ),
        [handleCardClick, getFileUrl]
    );

    const renderGenericCard = (file: FileItem, icon: string) => (
        <DraggableItem
            key={file.file_id}
            item={{
                file_id: file.file_id,
                category: file.category,
                filename: file.filename,
                size: file.size,
                mime_type: file.mime_type,
            }}
        >
            <div
                onClick={() => handleCardClick(file)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCardClick(file);
                    }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Ouvrir ${file.filename || 'ce fichier'}`}
                style={{
                    backgroundColor: darkTheme.background.secondary,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: `1px solid ${darkTheme.border.primary}`,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '12px' }}>{icon}</div>
                <div
                    style={{
                        fontWeight: '600',
                        color: darkTheme.text.primary,
                        fontSize: '14px',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {file.filename || 'Sans nom'}
                </div>
                <div style={{ color: darkTheme.text.tertiary, fontSize: '12px' }}>{formatFileSize(file.size)}</div>
            </div>
        </DraggableItem>
    );

    if (loading && files.length === 0) {
        return (
            <div style={{ padding: '24px', maxWidth: 1600, margin: '0 auto' }}>
                <LibraryTabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <LoadingSpinner size="large" message={t(`categories.${category}`)} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px', maxWidth: 1600, margin: '0 auto' }}>
                <LibraryTabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />
                <ErrorDisplay error={error} onRetry={fetchFiles} />
            </div>
        );
    }

    const emptyStateKey = `emptyStates.no${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof t;
    const emptyStateDescKey = `emptyStates.no${category.charAt(0).toUpperCase() + category.slice(1)}Description` as keyof typeof t;
    const uploadFirstKey = `emptyStates.uploadFirst${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof typeof t;

    return (
        <div style={{ padding: '24px', maxWidth: 1600, margin: '0 auto' }}>
            <LibraryTabBar selectedTab={selectedTab} onTabChange={setSelectedTab} />
            <h1 style={{ fontSize: '28px', fontWeight: '600', color: darkTheme.text.primary, marginBottom: '24px' }}>
                {t(`categories.${category}`)} ({files.length})
            </h1>

            {files.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: darkTheme.text.tertiary }}>
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>{LIBRARY_ICONS[selectedTab]}</div>
                    <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: darkTheme.text.secondary }}>
                        {t(emptyStateKey)}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
                        {t(emptyStateDescKey)}
                    </div>
                    <button
                        onClick={() => navigate('/upload')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: darkTheme.accent.blue,
                            color: darkTheme.text.primary,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                        }}
                    >
                        {t(uploadFirstKey)}
                    </button>
                </div>
            ) : selectedTab === 'images' ? (
                <SectionedMasonryGrid<FileItem>
                    sections={masonrySections}
                    renderCard={renderImageCard}
                    columnWidth={280}
                    gutter={16}
                    itemHeightEstimate={320}
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {files.map((file) => renderGenericCard(file, LIBRARY_ICONS[selectedTab]))}
                </div>
            )}
            <ToastContainer />
        </div>
    );
}
