// INFO : app/routes/info.tsx
// Page d'info/détail style Netflix pour films et séries — responsive (téléphone, tablette, desktop)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { useConfig } from '~/hooks/useConfig';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { ErrorDisplay } from '~/components/ui/ErrorDisplay';
import { formatDuration } from '~/utils/format';
import { useLanguage } from '~/contexts/LanguageContext';
import { StarRating } from '~/components/ui/StarRating';
import { handleCacheInvalidation } from '~/utils/cache/cacheInvalidation';

interface FileItem {
    file_id: string;
    category: string;
    size: number;
    mime_type: string;
    filename: string | null;
    created_at: number;
    uploaded_at: number;
    thumbnail_r2_path: string | null;
    thumbnail_url: string | null;
    backdrop_url: string | null;
    source_id: string | null;
    source_api: string | null;
    title: string | null;
    year: number | null;
    duration: number | null;
    season: number | null;
    episode: number | null;
    genres: string | null;
    collection_id: string | null;
    episode_description: string | null;
    collection_name: string | null;
    description: string | null;
}

interface WatchProgress {
    file_id: string;
    current_time: number;
    duration: number;
    progress_percent: number;
    last_watched: number;
}

interface Episode {
    file: FileItem;
    episodeNumber: number;
    title: string;
}

interface Season {
    seasonNumber: number;
    seasonName: string;
    episodes: Episode[];
}

// Style Netflix
const netflixTheme = {
    bg: {
        primary: '#141414',
        secondary: '#1a1a1a',
        card: '#181818',
        hover: '#252525',
        gradient: 'linear-gradient(to bottom, rgba(20,20,20,0) 0%, rgba(20,20,20,0.8) 50%, rgba(20,20,20,1) 100%)'
    },
    text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
        muted: '#808080'
    },
    accent: {
        red: '#e50914',
        redHover: '#f40612'
    }
};

export default function InfoRoute() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { config } = useConfig();
    const breakpoint = useBreakpoint();
    const navigate = useNavigate();
    const location = useLocation();
    const { category, fileId } = useParams<{ category: string; fileId: string }>();
    const isPhone = breakpoint === 'phone';
    const isTablet = breakpoint === 'tablet';

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<FileItem | null>(null);
    const [watchProgress, setWatchProgress] = useState<WatchProgress | null>(null);
    const [relatedFiles, setRelatedFiles] = useState<FileItem[]>([]);
    const [isTVShow, setIsTVShow] = useState(false);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [userRating, setUserRating] = useState<number | null>(null);
    const [averageRating, setAverageRating] = useState<number | null>(null);

    useEffect(() => {
        const fetchFileInfo = async () => {
            if (!user?.id || !fileId) return;

            setLoading(true);
            setError(null);

            try {
                // Récupérer les infos du fichier
                const token = localStorage.getItem('stormi_token');
                const response = await fetch(`https://stormi.uk/api/upload/user/${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des fichiers');
                }

                const data = await response.json() as { files?: FileItem[] };
                const foundFile = data.files?.find((f: FileItem) => f.file_id === fileId);

                if (!foundFile) {
                    throw new Error('Fichier non trouvé');
                }

                setFile(foundFile);

                // Détecter si c'est une série
                const filenameForPattern = foundFile.filename?.replace(/\.[^/.]+$/, '') || '';
                const isTVShow = /\bS\d{1,2}E\d{1,2}\b/i.test(filenameForPattern) ||
                               (/\bS\d{1,2}\b/i.test(filenameForPattern) && /\bE\d{1,2}\b/i.test(filenameForPattern)) ||
                               foundFile.source_api === 'tmdb_tv';
                
                setIsTVShow(isTVShow);

                // Si c'est une série, organiser les épisodes par saison
                if (isTVShow && foundFile.source_id) {
                    const showSourceId = foundFile.source_id;
                    const allEpisodes = (data.files ?? []).filter((f: FileItem) => {
                        if (f.source_api !== 'tmdb_tv') return false;
                        return f.source_id === showSourceId;
                    }) || [];

                    // Organiser par saison
                    const seasonsMap = new Map<number, Episode[]>();
                    
                    for (const episodeFile of allEpisodes) {
                        let seasonNum = episodeFile.season || 0;
                        let episodeNum = episodeFile.episode || 0;
                        
                        // Extraire S/E du filename si pas dans les métadonnées
                        if (seasonNum === 0 || episodeNum === 0) {
                            const epFilename = episodeFile.filename?.replace(/\.[^/.]+$/, '') || '';
                            const combinedMatch = epFilename.match(/\bS(\d{1,2})E(\d{1,2})\b/i);
                            if (combinedMatch) {
                                seasonNum = parseInt(combinedMatch[1]);
                                episodeNum = parseInt(combinedMatch[2]);
                            } else {
                                const seasonMatch = epFilename.match(/\bS(\d{1,2})\b/i);
                                const episodeMatch = epFilename.match(/\bE(\d{1,2})\b/i);
                                if (seasonMatch) seasonNum = parseInt(seasonMatch[1]);
                                if (episodeMatch) episodeNum = parseInt(episodeMatch[1]);
                            }
                        }
                        
                        if (seasonNum > 0 && episodeNum > 0) {
                            if (!seasonsMap.has(seasonNum)) {
                                seasonsMap.set(seasonNum, []);
                            }
                            seasonsMap.get(seasonNum)!.push({
                                file: episodeFile,
                                episodeNumber: episodeNum,
                                title: episodeFile.title || `${t('videos.episode')} ${episodeNum}`
                            });
                        }
                    }
                    
                    // Convertir en tableau et trier
                    const organizedSeasons = Array.from(seasonsMap.entries())
                        .map(([seasonNumber, episodes]) => ({
                            seasonNumber,
                            seasonName: `${t('videos.season')} ${seasonNumber}`,
                            episodes: episodes.sort((a, b) => a.episodeNumber - b.episodeNumber)
                        }))
                        .sort((a, b) => a.seasonNumber - b.seasonNumber);
                    
                    setSeasons(organizedSeasons);
                    if (organizedSeasons.length > 0) {
                        setSelectedSeason(organizedSeasons[0].seasonNumber);
                    }
                }

                // Récupérer la progression de lecture
                try {
                    const progressResponse = await fetch(`https://stormi.uk/api/watch-progress/${fileId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (progressResponse.ok) {
                        const progressData = await progressResponse.json() as WatchProgress;
                        setWatchProgress(progressData);
                    }
                } catch (err) {
                    console.warn('Impossible de récupérer la progression:', err);
                }

                // Récupérer les fichiers similaires (même genre ou collection)
                // Pour les séries, exclure les épisodes de la même série
                const related = (data.files ?? []).filter((f: FileItem) => {
                    if (f.file_id === fileId) return false;
                    if (f.category !== foundFile.category) return false;
                    
                    // Exclure les épisodes de la même série si c'est une série
                    if (isTVShow && foundFile.source_id && f.source_id === foundFile.source_id) {
                        return false;
                    }
                    
                    // Même collection
                    if (foundFile.collection_id && f.collection_id === foundFile.collection_id) return true;
                    
                    // Même genre
                    if (foundFile.genres && f.genres) {
                        const fileGenres = JSON.parse(foundFile.genres);
                        const foundGenres = JSON.parse(foundFile.genres);
                        return fileGenres.some((g: string) => foundGenres.includes(g));
                    }
                    
                    return false;
                }).slice(0, 10) || [];

                setRelatedFiles(related);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        fetchFileInfo();
    }, [user?.id, fileId, location]);
    
    // Charger les notes (personnelle et moyenne globale)
    useEffect(() => {
        const fetchRatings = async () => {
            if (!user?.id || !fileId) return;
            
            try {
                const token = localStorage.getItem('stormi_token');
                const response = await fetch(`https://stormi.uk/api/ratings/${fileId}?user_id=${user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json() as { userRating: number | null; averageRating: number | null };
                    setUserRating(data.userRating);
                    setAverageRating(data.averageRating);
                }
            } catch (error) {
                console.error('Erreur chargement notes:', error);
            }
        };
        
        fetchRatings();
    }, [user?.id, fileId]);
    
    // Fonction pour sauvegarder une note
    const handleRate = async (rating: number) => {
        if (!user?.id || !fileId) return;
        
        try {
            const token = localStorage.getItem('stormi_token');
            const response = await fetch(`https://stormi.uk/api/ratings/${fileId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating,
                    user_id: user.id
                })
            });
            
            if (response.ok) {
                const data = await response.json() as { userRating: number; averageRating: number | null };
                setUserRating(data.userRating);
                setAverageRating(data.averageRating);
                
                // Invalider le cache après un nouveau rating (doc: invalidation rating:new)
                await handleCacheInvalidation({
                    type: 'rating:new',
                    userId: user.id,
                    fileId: fileId,
                });
            }
        } catch (error) {
            console.error('Erreur sauvegarde note:', error);
        }
    };

    const getThumbnailUrl = (file: FileItem): string | null => {
        if (file.thumbnail_r2_path) {
            const match = file.thumbnail_r2_path.match(/thumbnail\.(\w+)$/);
            if (match) return `https://stormi.uk/api/files/videos/${file.file_id}/thumbnail.${match[1]}`;
        }
        return file.thumbnail_url || null;
    };

    const handlePlay = async () => {
        if (!file) return;
        
        // Si c'est une série, rediriger vers le premier épisode de la première saison
        if (isTVShow && seasons.length > 0) {
            const firstSeason = seasons[0];
            if (firstSeason.episodes.length > 0) {
                const firstEpisode = firstSeason.episodes[0];
                
                // Récupérer la progression spécifique du premier épisode
                let episodeProgress: WatchProgress | null = null;
                try {
                    const token = localStorage.getItem('stormi_token');
                    const progressResponse = await fetch(`https://stormi.uk/api/watch-progress/${firstEpisode.file.file_id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (progressResponse.ok) {
                        episodeProgress = await progressResponse.json();
                    }
                } catch (err) {
                    console.warn('Impossible de récupérer la progression:', err);
                }
                
                // Lancer directement la lecture, pas vers /info
                navigate(`/reader/${firstEpisode.file.category}/${firstEpisode.file.file_id}`, {
                    state: {
                        continuePlayback: episodeProgress ? true : false,
                        currentTime: episodeProgress?.current_time || 0
                    }
                });
                return;
            }
        }
        
        // Sinon, rediriger vers le fichier actuel (film)
        navigate(`/reader/${file.category}/${file.file_id}`, {
            state: {
                continuePlayback: watchProgress ? true : false,
                currentTime: watchProgress?.current_time || 0
            }
        });
    };

    if (loading) {
        return (
            <>
                <div style={{ minHeight: '60vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingSpinner />
                </div>
            </>
        );
    }

    if (error || !file) {
        return (
            <>
                <div style={{ minHeight: '60vh', paddingTop: '80px' }}>
                    <ErrorDisplay error={error || 'Fichier non trouvé'} />
                </div>
            </>
        );
    }

    const thumbnailUrl = getThumbnailUrl(file);
    const backdropUrl = file.backdrop_url;
    const genres = file.genres ? JSON.parse(file.genres) : [];
    const displayName = file.title || file.filename?.replace(/\.[^/.]+$/, '') || 'Sans titre';

    const heroPaddingH = isPhone ? 12 : isTablet ? 20 : 60;
    const heroPaddingBottom = isPhone ? 24 : isTablet ? 48 : 80;
    const heroTitleSize = isPhone ? 22 : isTablet ? 36 : 64;
    const heroMetaSize = isPhone ? 13 : 18;
    const heroDescSize = isPhone ? 14 : isTablet ? 17 : 20;
    const sectionPadding = isPhone ? 16 : isTablet ? 24 : 40;
    const sectionPaddingH = isPhone ? 12 : isTablet ? 20 : 60;

    return (
        <>
            <div style={{
                minHeight: '100vh',
                backgroundColor: netflixTheme.bg.primary,
                paddingTop: isPhone ? 56 : 80,
                overflowX: 'hidden',
            }}>
                {/* Hero Section avec backdrop */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: isPhone ? 'auto' : '80vh',
                    minHeight: isPhone ? 320 : 500,
                    overflow: 'hidden',
                }}>
                    {/* Backdrop Image */}
                    {backdropUrl && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${backdropUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            filter: 'brightness(0.4)'
                        }} />
                    )}

                    {/* Gradient overlay vertical (bas) */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.7) 40%, transparent 100%)'
                    }} />
                    
                    {/* Gradient latéral (gauche) - style Netflix */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: '50%',
                        background: 'linear-gradient(to right, rgba(20,20,20,1) 0%, rgba(20,20,20,0.9) 30%, rgba(20,20,20,0.5) 60%, transparent 100%)',
                        zIndex: 1
                    }} />

                    {/* Content */}
                    <div style={{
                        position: 'relative',
                        zIndex: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: `0 ${heroPaddingH}px ${heroPaddingBottom}px`,
                        maxWidth: 1400,
                        margin: '0 auto',
                        minWidth: 0,
                        boxSizing: 'border-box',
                    }}>
                        <h1 style={{
                            fontSize: heroTitleSize,
                            fontWeight: 700,
                            color: netflixTheme.text.primary,
                            marginBottom: isPhone ? 8 : 16,
                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.2,
                        }}>
                            {displayName}
                        </h1>

                        <div style={{
                            display: 'flex',
                            gap: isPhone ? 8 : 16,
                            marginBottom: isPhone ? 12 : 24,
                            flexWrap: 'wrap',
                        }}>
                            {file.year && (
                                <span style={{
                                    color: '#46d369',
                                    fontSize: heroMetaSize,
                                    fontWeight: 600,
                                }}>
                                    {file.year}
                                </span>
                            )}
                            {file.duration && (
                                <span style={{
                                    color: netflixTheme.text.secondary,
                                    fontSize: heroMetaSize,
                                }}>
                                    {formatDuration(file.duration)}
                                </span>
                            )}
                            {genres.length > 0 && (
                                <span style={{
                                    color: netflixTheme.text.secondary,
                                    fontSize: heroMetaSize,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: isPhone ? '100%' : undefined,
                                }}>
                                    {genres.join(' • ')}
                                </span>
                            )}
                        </div>

                        {file.description && (
                            <p style={{
                                color: netflixTheme.text.primary,
                                fontSize: heroDescSize,
                                lineHeight: 1.5,
                                maxWidth: isPhone ? '100%' : 600,
                                marginBottom: isPhone ? 16 : 24,
                                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                display: '-webkit-box',
                                WebkitLineClamp: isPhone ? 4 : 6,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}>
                                {file.description}
                            </p>
                        )}
                        
                        {/* Système de notation */}
                        <div style={{
                            marginBottom: '24px'
                        }}>
                            <StarRating
                                userRating={userRating}
                                averageRating={averageRating}
                                onRate={handleRate}
                            />
                        </div>

                        {/* Progress bar si progression existante */}
                        {watchProgress && watchProgress.progress_percent > 5 && (
                            <div style={{
                                width: '100%',
                                maxWidth: isPhone ? '100%' : 600,
                                marginBottom: isPhone ? 16 : 24,
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: 4,
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${watchProgress.progress_percent}%`,
                                        height: '100%',
                                        backgroundColor: netflixTheme.accent.red,
                                        transition: 'width 0.3s ease',
                                    }} />
                                </div>
                                <div style={{
                                    color: netflixTheme.text.secondary,
                                    fontSize: isPhone ? 12 : 14,
                                    marginTop: 8,
                                }}>
                                    Reprendre à {formatDuration(watchProgress.current_time)}
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div style={{
                            display: 'flex',
                            gap: isPhone ? 10 : 16,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}>
                            <button
                                onClick={handlePlay}
                                style={{
                                    padding: isPhone ? '10px 20px' : '12px 32px',
                                    fontSize: isPhone ? 15 : 18,
                                    fontWeight: 600,
                                    backgroundColor: netflixTheme.accent.red,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: 'background-color 0.2s',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = netflixTheme.accent.redHover}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = netflixTheme.accent.red}
                            >
                                <span>▶</span>
                                <span>{watchProgress && watchProgress.progress_percent > 5 ? 'Reprendre' : 'Lecture'}</span>
                            </button>

                            <button
                                style={{
                                    padding: isPhone ? '10px 20px' : '12px 32px',
                                    fontSize: isPhone ? 15 : 18,
                                    fontWeight: 600,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: '#fff',
                                    border: '2px solid rgba(255,255,255,0.5)',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.8)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                                }}
                            >
                                <span>+</span>
                                <span>{t('info.myList')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Saisons et épisodes pour les séries */}
                {isTVShow && seasons.length > 0 && (
                    <div style={{
                        padding: `${sectionPadding}px ${sectionPaddingH}px`,
                        maxWidth: 1400,
                        margin: '0 auto',
                        minWidth: 0,
                    }}>
                        {/* Sélecteur de saison */}
                        <div style={{ marginBottom: isPhone ? 16 : 24 }}>
                            <select
                                value={selectedSeason}
                                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                                style={{
                                    backgroundColor: netflixTheme.bg.secondary,
                                    color: netflixTheme.text.primary,
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: 4,
                                    padding: isPhone ? '10px 14px' : '12px 20px',
                                    fontSize: isPhone ? 14 : 16,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    width: isPhone ? '100%' : undefined,
                                    maxWidth: isPhone ? '100%' : 200,
                                    boxSizing: 'border-box',
                                }}
                            >
                                {seasons.map(season => (
                                    <option key={season.seasonNumber} value={season.seasonNumber}>
                                        {season.seasonName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Liste des épisodes */}
                        {seasons.find(s => s.seasonNumber === selectedSeason) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: isPhone ? 8 : 12, minWidth: 0 }}>
                                {seasons.find(s => s.seasonNumber === selectedSeason)!.episodes.map((episode) => {
                                    const episodeThumbnail = getThumbnailUrl(episode.file);
                                    const episodeProgress = watchProgress?.file_id === episode.file.file_id ? watchProgress : null;

                                    const handleEpisodeClick = () => {
                                        navigate(`/reader/${episode.file.category}/${episode.file.file_id}`, {
                                            state: {
                                                continuePlayback: episodeProgress ? true : false,
                                                currentTime: episodeProgress?.current_time || 0
                                            }
                                        });
                                    };

                                    const epThumbWidth = isPhone ? '100%' : 280;
                                    const epGap = isPhone ? 12 : 16;
                                    const epPadding = isPhone ? 12 : 16;

                                    return (
                                        <div
                                            key={episode.file.file_id}
                                            onClick={handleEpisodeClick}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleEpisodeClick();
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`${t('actions.playEpisode')} ${episode.episodeNumber}: ${episode.title}`}
                                            style={{
                                                display: 'flex',
                                                flexDirection: isPhone ? 'column' : 'row',
                                                gap: epGap,
                                                padding: epPadding,
                                                backgroundColor: netflixTheme.bg.secondary,
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                position: 'relative',
                                                minWidth: 0,
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = netflixTheme.bg.hover}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = netflixTheme.bg.secondary}
                                        >
                                            {/* Numéro + Thumbnail (sur mobile: numéro au-dessus de la thumb) */}
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: isPhone ? 'column' : 'row',
                                                gap: epGap,
                                                flex: isPhone ? undefined : undefined,
                                                minWidth: 0,
                                                width: isPhone ? '100%' : undefined,
                                            }}>
                                                <div style={{
                                                    fontSize: isPhone ? 14 : 24,
                                                    fontWeight: 600,
                                                    color: netflixTheme.text.muted,
                                                    width: isPhone ? undefined : 40,
                                                    minWidth: isPhone ? undefined : 40,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: isPhone ? 'flex-start' : 'center',
                                                    flexShrink: 0,
                                                }}>
                                                    {isPhone ? `Ép. ${episode.episodeNumber}` : episode.episodeNumber}
                                                </div>

                                                {/* Thumbnail */}
                                                <div style={{
                                                    width: epThumbWidth,
                                                    maxWidth: isPhone ? '100%' : 280,
                                                    aspectRatio: '16/9',
                                                    backgroundColor: '#2a2a2a',
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    position: 'relative',
                                                }}>
                                                {episodeThumbnail ? (
                                                    <img
                                                        src={episodeThumbnail}
                                                        alt={episode.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '100%',
                                                        height: '100%',
                                                        color: netflixTheme.text.muted,
                                                        fontSize: '48px'
                                                    }}>
                                                        📺
                                                    </div>
                                                )}
                                                
                                                {/* Badge durée */}
                                                {episode.file.duration && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '8px',
                                                        right: '8px',
                                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                                        color: '#fff',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        fontSize: '11px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {formatDuration(episode.file.duration)}
                                                    </div>
                                                )}
                                                
                                                {/* Barre de progression si regardé */}
                                                {episodeProgress && episodeProgress.progress_percent > 5 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        height: '4px',
                                                        backgroundColor: 'rgba(255,255,255,0.3)'
                                                    }}>
                                                        <div style={{
                                                            width: `${episodeProgress.progress_percent}%`,
                                                            height: '100%',
                                                            backgroundColor: netflixTheme.accent.red,
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                )}
                                            </div>
                                            </div>

                                            {/* Infos épisode */}
                                            <div style={{
                                                flex: 1,
                                                minWidth: 0,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                gap: isPhone ? 4 : 8,
                                            }}>
                                                <div style={{
                                                    fontSize: isPhone ? 15 : 18,
                                                    fontWeight: 600,
                                                    color: netflixTheme.text.primary,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {episode.title}
                                                </div>

                                                {(episode.file.episode_description || episode.file.description) && (
                                                    <div style={{
                                                        fontSize: isPhone ? 12 : 14,
                                                        color: netflixTheme.text.secondary,
                                                        lineHeight: 1.5,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: isPhone ? 2 : 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {episode.file.episode_description || episode.file.description}
                                                    </div>
                                                )}

                                                {episodeProgress && episodeProgress.progress_percent > 5 && (
                                                    <div style={{
                                                        fontSize: 11,
                                                        color: netflixTheme.text.muted,
                                                    }}>
                                                        Reprendre à {formatDuration(episodeProgress.current_time)}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bouton play */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/reader/${episode.file.category}/${episode.file.file_id}`, {
                                                        state: {
                                                            continuePlayback: episodeProgress ? true : false,
                                                            currentTime: episodeProgress?.current_time || 0
                                                        }
                                                    });
                                                }}
                                                aria-label={`${t('actions.playEpisode')} ${episode.episodeNumber || ''}`}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: isPhone ? 40 : 48,
                                                    height: isPhone ? 40 : 48,
                                                    borderRadius: '50%',
                                                    backgroundColor: netflixTheme.accent.red,
                                                    color: '#fff',
                                                    fontSize: isPhone ? 16 : 20,
                                                    flexShrink: 0,
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                    border: 'none',
                                                    alignSelf: isPhone ? 'flex-start' : 'center',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                ▶
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Related content - seulement pour les films */}
                {!isTVShow && relatedFiles.length > 0 && (
                    <div style={{
                        padding: `${sectionPadding}px ${sectionPaddingH}px`,
                        maxWidth: 1400,
                        margin: '0 auto',
                        minWidth: 0,
                    }}>
                        <h2 style={{
                            fontSize: isPhone ? 18 : 24,
                            fontWeight: 700,
                            color: netflixTheme.text.primary,
                            marginBottom: isPhone ? 16 : 24,
                        }}>
                            Contenu similaire
                        </h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isPhone ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
                            gap: isPhone ? 10 : 16,
                            minWidth: 0,
                        }}>
                            {relatedFiles.map((relatedFile) => {
                                const relatedThumbnail = getThumbnailUrl(relatedFile);
                                const relatedName = relatedFile.title || relatedFile.filename?.replace(/\.[^/.]+$/, '') || 'Sans titre';
                                
                                return (
                                    <div
                                        key={relatedFile.file_id}
                                        onClick={() => navigate(`/info/${relatedFile.category}/${relatedFile.file_id}`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                navigate(`/info/${relatedFile.category}/${relatedFile.file_id}`);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${t('actions.view')} ${relatedName}`}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'transform 0.2s',
                                            borderRadius: '6px',
                                            overflow: 'hidden',
                                            backgroundColor: netflixTheme.bg.card
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <div style={{
                                            width: '100%',
                                            aspectRatio: '2/3',
                                            backgroundColor: '#2a2a2a',
                                            position: 'relative'
                                        }}>
                                            {relatedThumbnail ? (
                                                <img
                                                    src={relatedThumbnail}
                                                    alt={relatedName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '100%',
                                                    height: '100%',
                                                    color: netflixTheme.text.muted,
                                                    fontSize: '48px'
                                                }}>
                                                    🎬
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            padding: '12px',
                                            color: netflixTheme.text.primary,
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {relatedName}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
