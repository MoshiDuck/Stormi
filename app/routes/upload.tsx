// INFO : app/routes/upload.tsx — contenu uniquement ; layout _app fournit Navigation + AuthGuard.
import React, { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { ErrorDisplay } from '~/components/ui/ErrorDisplay';
import { UploadManager, UploadManagerHandle } from '~/components/upload/UploadManager';
import { useToast } from '~/components/ui/Toast';
import { darkTheme } from '~/utils/ui/theme';
import { formatFileSize, formatDate, formatDateTime } from '~/utils/format';
import { useLanguage } from '~/contexts/LanguageContext';

export function meta() {
    return [
        { title: 'Upload | Stormi' },
        { name: 'description', content: 'Téléversez vos fichiers vers le cloud Stormi. Stockage sécurisé et streaming.' },
    ];
}

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
}

export default function UploadRoute() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { showToast, ToastContainer } = useToast();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showNextStep, setShowNextStep] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Référence à l'UploadManager
    const uploadManagerRef = useRef<UploadManagerHandle>(null);

    // Gérer la sélection de fichier
    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadError(null);
        setUploadSuccess(false);

        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    }, []);

    // Gérer l'upload via l'UploadManager
    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            setUploadError('Veuillez sélectionner un fichier');
            return;
        }

        // Utiliser l'UploadManager pour uploader
        if (uploadManagerRef.current) {
            uploadManagerRef.current.uploadFiles([selectedFile]);
            setUploadSuccess(true);
            setSelectedFile(null);
            setPreviewUrl(null);

            // Réinitialiser formulaire
            if (typeof document !== 'undefined') {
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            }
        } else {
            setUploadError('UploadManager non disponible');
        }
    }, [selectedFile]);


    // Annuler l'upload en cours
    const handleCancel = useCallback(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadError(null);
        setUploadSuccess(false);
        setUploadProgress(null);
    }, []);

    return (
        <>
                    <div style={{ marginBottom: '40px' }}>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: darkTheme.text.primary
                        }}>
                            {t('upload.title')}
                        </h1>
                        <p style={{
                            color: darkTheme.text.secondary,
                            fontSize: '16px'
                        }}>
                            {t('upload.dragDrop')} — {t('upload.dragDropOr')}
                        </p>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '30px',
                        marginBottom: '40px'
                    }}>
                        {/* Zone d'upload */}
                        <div style={{
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            border: `2px dashed ${darkTheme.border.secondary}`
                        }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                marginBottom: '20px',
                                color: darkTheme.text.primary
                            }}>
                                {t('upload.selectFile')}
                            </h2>

                            <div style={{
                                border: `2px dashed ${darkTheme.accent.blue}`,
                                borderRadius: '8px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                backgroundColor: darkTheme.background.tertiary,
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                marginBottom: '20px'
                            }}
                                 onClick={() => {
                                     if (typeof document === 'undefined') return;
                                     const input = document.createElement('input');
                                     input.type = 'file';
                                     input.accept = '*/*';
                                     input.multiple = true;
                                     input.onchange = (e) => {
                                         const files = (e.target as HTMLInputElement).files;
                                         if (files && files.length > 0 && uploadManagerRef.current) {
                                             uploadManagerRef.current.uploadFiles(files);
                                         }
                                     };
                                     input.click();
                                 }}
                            >
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📤</div>
                                <p style={{ marginBottom: '8px', color: darkTheme.accent.blue, fontWeight: '500' }}>
                                    {t('upload.dragDrop')}
                                </p>
                                <p style={{ color: darkTheme.text.secondary, fontSize: '14px', marginBottom: '16px' }}>
                                    {t('upload.dragDropOr')}
                                </p>
                                <p style={{ color: darkTheme.text.tertiary, fontSize: '12px' }}>
                                    {t('upload.supportedFormats')}
                                </p>
                            </div>

                            <input
                                id="file-input"
                                type="file"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />

                            {selectedFile && (
                                <div style={{
                                    backgroundColor: darkTheme.surface.success,
                                    borderRadius: darkTheme.radius.medium,
                                    padding: '16px',
                                    marginBottom: '20px',
                                    border: `1px solid ${darkTheme.accent.green}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: darkTheme.accent.green,
                                            borderRadius: darkTheme.radius.small,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: darkTheme.text.primary,
                                            fontSize: '20px'
                                        }}>
                                            📄
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: '500', fontSize: '14px', color: darkTheme.text.primary }}>
                                                {selectedFile.name}
                                            </p>
                                            <p style={{ margin: '4px 0 0', color: darkTheme.text.secondary, fontSize: '12px' }}>
                                                {formatFileSize(selectedFile.size)} • {selectedFile.type}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleCancel}
                                            aria-label={t('common.cancel')}
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: darkTheme.accent.red,
                                                cursor: 'pointer',
                                                fontSize: '20px',
                                                padding: '4px'
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}

                            {previewUrl && (
                                <div style={{
                                    marginBottom: '20px',
                                    textAlign: 'center'
                                }}>
                                    <img
                                        src={previewUrl}
                                        alt="Aperçu"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            borderRadius: '8px',
                                            border: '1px solid #e0e0e0'
                                        }}
                                    />
                                    <p style={{
                                        marginTop: '8px',
                                        color: darkTheme.text.tertiary,
                                        fontSize: '12px'
                                    }}>
                                        Aperçu
                                    </p>
                                </div>
                            )}

                            {uploadProgress && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{ fontSize: '14px', color: darkTheme.text.secondary }}>Progression</span>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: darkTheme.text.primary }}>
                                            {uploadProgress.percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        backgroundColor: darkTheme.background.tertiary,
                                        borderRadius: darkTheme.radius.small,
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${uploadProgress.percentage}%`,
                                            backgroundColor: darkTheme.accent.blue,
                                            borderRadius: darkTheme.radius.small,
                                            transition: 'width 0.3s'
                                        }} />
                                    </div>
                                    <p style={{
                                        marginTop: '4px',
                                        fontSize: '12px',
                                        color: darkTheme.text.tertiary,
                                        textAlign: 'center'
                                    }}>
                                        {formatFileSize(uploadProgress.loaded)} / {formatFileSize(uploadProgress.total)}
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: selectedFile && !uploading ? darkTheme.accent.blue : darkTheme.background.tertiary,
                                        color: selectedFile && !uploading ? '#fff' : darkTheme.text.disabled,
                                        border: 'none',
                                        padding: '14px 24px',
                                        borderRadius: darkTheme.radius.medium,
                                        cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        transition: darkTheme.transition.normal,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {uploading ? (
                                        <>
                                            <span style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid currentColor',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            {t('upload.inProgress')}
                                        </>
                                    ) : (
                                        <>📤 {t('upload.uploadButton')}</>
                                    )}
                                </button>

                                {selectedFile && !uploading && (
                                    <button
                                        onClick={handleCancel}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: darkTheme.text.secondary,
                                            border: `1px solid ${darkTheme.border.secondary}`,
                                            padding: '14px 20px',
                                            borderRadius: darkTheme.radius.medium,
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        {t('common.cancel')}
                                    </button>
                                )}
                            </div>

                            <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>

                            {uploadError && <ErrorDisplay error={uploadError} />}

                            {uploadSuccess && (
                                <div style={{
                                    backgroundColor: darkTheme.surface.success,
                                    color: darkTheme.accent.green,
                                    padding: '12px 16px',
                                    borderRadius: darkTheme.radius.medium,
                                    marginTop: '16px',
                                    border: `1px solid ${darkTheme.accent.green}`
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '18px' }}>✅</span>
                                        <p style={{ margin: 0, fontWeight: '500' }}>
                                            {t('upload.successMessage')}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Fichiers récents */}
                        <div style={{
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: darkTheme.radius.large,
                            padding: '30px',
                            boxShadow: darkTheme.shadow.medium,
                            border: `1px solid ${darkTheme.border.primary}`
                        }}>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: '600',
                                marginBottom: '20px',
                                color: darkTheme.text.primary
                            }}>
                                {t('upload.uploaded')}
                            </h2>

                            {uploadedFiles.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: darkTheme.text.tertiary
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                                    <p style={{ marginBottom: '8px', fontSize: '16px', color: darkTheme.text.secondary }}>
                                        {t('upload.noUploads')}
                                    </p>
                                    <p style={{ fontSize: '14px' }}>
                                        Les fichiers que vous ajoutez apparaîtront ici
                                    </p>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {uploadedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            style={{
                                                padding: '16px',
                                                borderBottom: `1px solid ${darkTheme.border.primary}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: darkTheme.transition.normal
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = darkTheme.background.tertiary}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                backgroundColor: darkTheme.surface.info,
                                                borderRadius: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: darkTheme.accent.blue,
                                                fontSize: '20px'
                                            }}>
                                                {file.type.startsWith('image/') ? '🖼️' :
                                                    file.type.startsWith('video/') ? '🎬' :
                                                        file.type.includes('pdf') ? '📕' :
                                                            file.type.includes('word') ? '📝' : '📄'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: '500', fontSize: '14px', color: darkTheme.text.primary }}>
                                                    {file.name}
                                                </p>
                                                <p style={{ margin: '4px 0 0', color: darkTheme.text.secondary, fontSize: '12px' }}>
                                                    {formatFileSize(file.size)} • {formatDateTime(file.uploadedAt)}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => window.open(file.url, '_blank')}
                                                    style={{
                                                        backgroundColor: darkTheme.surface.info,
                                                        color: darkTheme.accent.blue,
                                                        border: 'none',
                                                        padding: '6px 12px',
                                                        borderRadius: darkTheme.radius.small,
                                                        cursor: 'pointer',
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    {t('common.open')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={{
                                marginTop: '20px',
                                paddingTop: '20px',
                                borderTop: `1px solid ${darkTheme.border.primary}`
                            }}>
                                <p style={{
                                    fontSize: '12px',
                                    color: darkTheme.text.tertiary,
                                    margin: 0,
                                    textAlign: 'center'
                                }}>
                                    {uploadedFiles.length} fichier{uploadedFiles.length !== 1 ? 's' : ''} uploadé{uploadedFiles.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section UploadManager */}
                    <UploadManager
                        ref={uploadManagerRef}
                        onUploadComplete={() => {
                            showToast(t('upload.successMessage'), 'success', 5000);
                            setShowNextStep(true);
                        }}
                        onProgress={() => {}}
                    />

                    {/* Prochaine étape : proposer les actions logiques après un upload */}
                    {showNextStep && (
                        <div style={{
                            backgroundColor: darkTheme.surface.success,
                            borderRadius: darkTheme.radius.large,
                            padding: '24px',
                            marginBottom: '30px',
                            border: `1px solid ${darkTheme.accent.green}`,
                            boxShadow: darkTheme.shadow.medium
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: darkTheme.text.primary,
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span aria-hidden>✨</span>
                                {t('upload.nextStep')}
                            </h3>
                            <p style={{
                                color: darkTheme.text.secondary,
                                fontSize: '14px',
                                marginBottom: '16px'
                            }}>
                                {t('upload.nextStepHint')}
                            </p>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <Link
                                    to="/home"
                                    prefetch="intent"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        backgroundColor: darkTheme.accent.blue,
                                        color: '#fff',
                                        borderRadius: darkTheme.radius.medium,
                                        textDecoration: 'none',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        transition: darkTheme.transition.normal
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {t('upload.viewHome')}
                                </Link>
                                <Link
                                    to="/library"
                                    prefetch="intent"
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        backgroundColor: darkTheme.background.tertiary,
                                        color: darkTheme.text.primary,
                                        border: `1px solid ${darkTheme.border.secondary}`,
                                        borderRadius: darkTheme.radius.medium,
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        transition: darkTheme.transition.normal
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = darkTheme.accent.blue;
                                        e.currentTarget.style.color = darkTheme.accent.blue;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = darkTheme.border.secondary;
                                        e.currentTarget.style.color = darkTheme.text.primary;
                                    }}
                                >
                                    {t('upload.viewLibrary')}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setShowNextStep(false)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '12px 20px',
                                        backgroundColor: 'transparent',
                                        color: darkTheme.text.secondary,
                                        border: `1px solid ${darkTheme.border.primary}`,
                                        borderRadius: darkTheme.radius.medium,
                                        fontWeight: '500',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: darkTheme.transition.normal
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = darkTheme.text.primary;
                                        e.currentTarget.style.borderColor = darkTheme.border.light;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = darkTheme.text.secondary;
                                        e.currentTarget.style.borderColor = darkTheme.border.primary;
                                    }}
                                >
                                    {t('upload.addAnother')}
                                </button>
                            </div>
                        </div>
                    )}

                    <ToastContainer />

                    {/* Informations */}
                    <div style={{
                        backgroundColor: darkTheme.background.secondary,
                        borderRadius: darkTheme.radius.large,
                        padding: '30px',
                        boxShadow: darkTheme.shadow.medium,
                        border: `1px solid ${darkTheme.border.primary}`
                    }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            marginBottom: '20px',
                            color: darkTheme.text.primary
                        }}>
                            Informations
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '20px'
                        }}>
                            <div style={{
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: darkTheme.surface.info,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    color: '#4285f4',
                                    fontSize: '24px'
                                }}>
                                    ⚡
                                </div>
                                <h3 style={{
                                    margin: '0 0 8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: darkTheme.text.primary
                                }}>
                                    Rapide
                                </h3>
                                <p style={{
                                    margin: 0,
                                    color: darkTheme.text.secondary,
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    Upload optimisé avec progression en temps réel
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: darkTheme.surface.success,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    color: '#34a853',
                                    fontSize: '24px'
                                }}>
                                    🔒
                                </div>
                                <h3 style={{
                                    margin: '0 0 8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: darkTheme.text.primary
                                }}>
                                    Sécurisé
                                </h3>
                                <p style={{
                                    margin: 0,
                                    color: darkTheme.text.secondary,
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    Tous les uploads sont authentifiés et protégés
                                </p>
                            </div>

                            <div style={{
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: '8px',
                                padding: '20px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: darkTheme.surface.error,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '16px',
                                    color: '#ea4335',
                                    fontSize: '24px'
                                }}>
                                    💾
                                </div>
                                <h3 style={{
                                    margin: '0 0 8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: darkTheme.text.primary
                                }}>
                                    Stockage Cloudflare
                                </h3>
                                <p style={{
                                    margin: 0,
                                    color: darkTheme.text.secondary,
                                    fontSize: '14px',
                                    lineHeight: '1.5'
                                }}>
                                    Vos fichiers sont stockés sur R2 de Cloudflare
                                </p>
                            </div>
                        </div>
                    </div>

                <footer style={{
                    backgroundColor: darkTheme.background.nav,
                    color: darkTheme.text.secondary,
                    padding: '20px 0',
                    marginTop: '40px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0 20px'
                    }}>
                        <p style={{ margin: 0, fontSize: '14px' }}>
                            © {new Date().getFullYear()} Stormi. Tous droits réservés.
                            <span style={{ marginLeft: '20px', color: darkTheme.text.tertiary }}>
                                Espace utilisé : {formatFileSize(0)} / Illimité
                            </span>
                        </p>
                    </div>
                </footer>
        </>
    );
}