// INFO : app/routes/home.tsx — contenu uniquement ; layout _app fournit Navigation + AuthGuard.
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLoaderData, useRevalidator } from 'react-router';
import { useAuth } from '~/hooks/useAuth';
import { darkTheme } from '~/utils/ui/theme';
import { useFilesPreloader } from '~/hooks/useFilesPreloader';
import { useLanguage } from '~/contexts/LanguageContext';
import { replacePlaceholders, translations } from '~/utils/i18n';
import { LoadingSpinner } from '~/components/ui/LoadingSpinner';
import { ErrorDisplay } from '~/components/ui/ErrorDisplay';
import { NetflixCarousel } from '~/components/ui/NetflixCarousel';

/** Données préchargées par le loader (user depuis localStorage, stats API ou cache). */
export async function clientLoader() {
    if (typeof window === 'undefined') return { stats: null as StatsPayload | null, userId: null as string | null };
    const storedUser = localStorage.getItem('stormi_user');
    if (!storedUser) return { stats: null, userId: null };
    let user: { id: string };
    try {
        user = JSON.parse(storedUser);
    } catch {
        return { stats: null, userId: null };
    }
    const cacheKey = `stormi_stats_${user.id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        try {
            const stats = JSON.parse(cached) as StatsPayload;
            return { stats, userId: user.id };
        } catch {
            sessionStorage.removeItem(cacheKey);
        }
    }
    const token = localStorage.getItem('stormi_token');
    const res = await fetch(`/api/stats?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { stats: null, userId: user.id };
    const data = (await res.json()) as { fileCount?: number; totalSizeGB?: number; billableGB?: number };
    const stats: StatsPayload = {
        fileCount: data.fileCount ?? 0,
        totalSizeGB: data.totalSizeGB ?? 0,
        billableGB: data.billableGB ?? 0,
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(stats));
    return { stats, userId: user.id };
}

type StatsPayload = { fileCount: number; totalSizeGB: number; billableGB: number };

interface ContinueWatchingItem {
    file_id: string;
    category: string;
    title: string | null;
    filename: string | null;
    thumbnail_r2_path: string | null;
    thumbnail_url: string | null;
    progress_percent: number;
}

interface RecentlyAddedItem {
    file_id: string;
    category: string;
    title: string | null;
    filename: string | null;
    thumbnail_r2_path: string | null;
    thumbnail_url: string | null;
    uploaded_at: number;
}

export function meta() {
    return [
        { title: translations.fr.meta.pageTitleHome },
        { name: 'description', content: translations.fr.meta.pageDescriptionHome },
    ];
}

export default function HomeRoute() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const loaderData = useLoaderData() as { stats: StatsPayload | null; userId: string | null } | undefined;
    const revalidator = useRevalidator();
    const [stats, setStats] = useState<StatsPayload>(() => loaderData?.stats ?? { fileCount: 0, totalSizeGB: 0, billableGB: 0 });
    const [loadingStats, setLoadingStats] = useState(!loaderData?.stats);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(!!loaderData?.stats);
    const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
    const [loadingContinueWatching, setLoadingContinueWatching] = useState(true);
    const [recentlyAdded, setRecentlyAdded] = useState<RecentlyAddedItem[]>([]);
    const [loadingRecentlyAdded, setLoadingRecentlyAdded] = useState(true);
    const [statsExpanded, setStatsExpanded] = useState(false);

    // Synchroniser avec les données du loader (premier rendu ou après revalidation)
    useEffect(() => {
        if (loaderData?.stats) {
            setStats(loaderData.stats);
            setLoadingStats(false);
            setStatsError(null);
            setHasLoadedOnce(true);
        }
    }, [loaderData?.stats]);

    // Précharger toutes les catégories de fichiers en arrière-plan
    useFilesPreloader({
        userId: user?.id ?? null,
        enabled: !!user?.id,
        preloadOnHover: true,
    });

    const fetchStats = useCallback(
        async (skipCache: boolean) => {
            if (!user?.id) return;
            setStatsError(null);
            if (typeof window === 'undefined') return;
            const cacheKey = `stormi_stats_${user.id}`;
            if (!skipCache) {
                const cachedStats = sessionStorage.getItem(cacheKey);
                if (cachedStats) {
                    try {
                        const parsed = JSON.parse(cachedStats) as StatsPayload;
                        setStats(parsed);
                        setLoadingStats(false);
                        setHasLoadedOnce(true);
                        return;
                    } catch {
                        sessionStorage.removeItem(cacheKey);
                    }
                }
            }
            try {
                const token = localStorage.getItem('stormi_token');
                const response = await fetch(`/api/stats?userId=${user.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = (await response.json()) as { fileCount?: number; totalSizeGB?: number; billableGB?: number };
                    const statsData: StatsPayload = {
                        fileCount: data.fileCount ?? 0,
                        totalSizeGB: data.totalSizeGB ?? 0,
                        billableGB: data.billableGB ?? 0,
                    };
                    setStats(statsData);
                    setStatsError(null);
                    sessionStorage.setItem(cacheKey, JSON.stringify(statsData));
                } else {
                    setStatsError(t('errors.statsLoadFailed'));
                }
            } catch (error) {
                console.error('Erreur récupération stats:', error);
                setStatsError(t('errors.networkError'));
            } finally {
                setLoadingStats(false);
                setHasLoadedOnce(true);
            }
        },
        [user?.id, t]
    );

    useEffect(() => {
        if (loaderData?.stats) return;
        fetchStats(false);
    }, [loaderData?.stats, fetchStats]);

    // Invalidation : vider le cache puis revalider le loader (il refetch automatiquement)
    useEffect(() => {
        const handleStatsInvalidated = (event: Event) => {
            const customEvent = event as CustomEvent<{ userId: string }>;
            const userId = customEvent.detail?.userId;
            if (userId && userId === user?.id) {
                sessionStorage.removeItem(`stormi_stats_${userId}`);
                revalidator.revalidate();
            }
        };
        window.addEventListener('stormi:stats-invalidated', handleStatsInvalidated);
        return () => window.removeEventListener('stormi:stats-invalidated', handleStatsInvalidated);
    }, [user?.id, revalidator]);

    // Continuer de regarder : fetch progressions + vidéos, fusionner
    const loadContinueWatching = useCallback(async () => {
        if (!user?.id) return;
        setLoadingContinueWatching(true);
        try {
                const token = localStorage.getItem('stormi_token');
                const headers = { Authorization: `Bearer ${token}` };
                const [videosRes, progressRes] = await Promise.all([
                    fetch(`/api/upload/user/${user.id}?category=videos`, { headers }),
                    fetch(`/api/watch-progress/user/${user.id}`, { headers }),
                ]);
                if (!videosRes.ok || !progressRes.ok) {
                    setContinueWatching([]);
                    return;
                }
                const [videosData, progressData] = await Promise.all([
                    videosRes.json() as Promise<{ files: Array<{ file_id: string; category: string; title: string | null; filename: string | null; thumbnail_r2_path: string | null; thumbnail_url: string | null }> }>,
                    progressRes.json() as Promise<{ progressions: Array<{ file_id: string; progress_percent: number }> }>,
                ]);
                const files = videosData.files || [];
                const progressions = progressData.progressions || [];
                const fileMap = new Map(files.map((f) => [f.file_id, f]));
                const items: ContinueWatchingItem[] = progressions
                    .filter((p) => p.progress_percent > 5 && p.progress_percent < 95)
                    .slice(0, 12)
                    .map((p) => {
                        const file = fileMap.get(p.file_id);
                        if (!file) return null;
                        return {
                            ...file,
                            progress_percent: p.progress_percent,
                        };
                    })
                    .filter((x): x is ContinueWatchingItem => x !== null);
                setContinueWatching(items);
            } catch {
                setContinueWatching([]);
            } finally {
                setLoadingContinueWatching(false);
            }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            setLoadingContinueWatching(false);
            return;
        }
        loadContinueWatching();
    }, [user?.id, loadContinueWatching]);

    // Rafraîchir "Continuer de regarder" après upload (stats invalidés)
    useEffect(() => {
        const handleStatsInvalidated = (event: Event) => {
            const customEvent = event as CustomEvent<{ userId: string }>;
            if (customEvent.detail?.userId === user?.id) {
                loadContinueWatching();
                loadRecentlyAdded();
            }
        };
        window.addEventListener('stormi:stats-invalidated', handleStatsInvalidated);
        return () => window.removeEventListener('stormi:stats-invalidated', handleStatsInvalidated);
    }, [user?.id, loadContinueWatching]);

    // Récemment ajoutés : vidéos + musiques triés par date
    const loadRecentlyAdded = useCallback(async () => {
        if (!user?.id) return;
        setLoadingRecentlyAdded(true);
        try {
            const token = localStorage.getItem('stormi_token');
            const headers = { Authorization: `Bearer ${token}` };
            const [videosRes, musicsRes] = await Promise.all([
                fetch(`/api/upload/user/${user.id}?category=videos`, { headers }),
                fetch(`/api/upload/user/${user.id}?category=musics`, { headers }),
            ]);
            if (!videosRes.ok || !musicsRes.ok) {
                setRecentlyAdded([]);
                return;
            }
            const [videosData, musicsData] = await Promise.all([
                videosRes.json() as Promise<{ files: Array<{ file_id: string; category: string; title: string | null; filename: string | null; thumbnail_r2_path: string | null; thumbnail_url: string | null; uploaded_at: number }> }>,
                musicsRes.json() as Promise<{ files: Array<{ file_id: string; category: string; title: string | null; filename: string | null; thumbnail_r2_path: string | null; thumbnail_url: string | null; uploaded_at: number }> }>,
            ]);
            const videos = (videosData.files || []).map((f) => ({ ...f, category: 'videos' as const }));
            const musics = (musicsData.files || []).map((f) => ({ ...f, category: 'musics' as const }));
            const merged = [...videos, ...musics]
                .sort((a, b) => (b.uploaded_at ?? 0) - (a.uploaded_at ?? 0))
                .slice(0, 12)
                .map((f) => ({
                    file_id: f.file_id,
                    category: f.category,
                    title: f.title,
                    filename: f.filename,
                    thumbnail_r2_path: f.thumbnail_r2_path,
                    thumbnail_url: f.thumbnail_url,
                    uploaded_at: f.uploaded_at ?? 0,
                }));
            setRecentlyAdded(merged);
        } catch {
            setRecentlyAdded([]);
        } finally {
            setLoadingRecentlyAdded(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            setLoadingRecentlyAdded(false);
            return;
        }
        loadRecentlyAdded();
    }, [user?.id, loadRecentlyAdded]);

    const getThumbnailUrl = useCallback((item: ContinueWatchingItem | RecentlyAddedItem): string | null => {
        if (item.thumbnail_r2_path) {
            const match = item.thumbnail_r2_path.match(/thumbnail\.(\w+)$/);
            if (match) return `/api/files/${item.category}/${item.file_id}/thumbnail.${match[1]}`;
        }
        return item.thumbnail_url || null;
    }, []);

    const cardBaseStyle: React.CSSProperties = {
        backgroundColor: darkTheme.background.secondary,
        borderRadius: darkTheme.radius.xlarge,
        padding: '24px 22px',
        marginBottom: 0,
        border: `1px solid ${darkTheme.border.secondary}`,
        boxShadow: darkTheme.shadow.small,
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
    };
    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '17px',
        fontWeight: '700',
        color: darkTheme.text.primary,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        letterSpacing: '-0.02em',
    };

    return (
        <>
                    {/* En-tête accueil */}
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{
                            fontSize: 'clamp(26px, 4vw, 32px)',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            color: darkTheme.text.primary,
                            letterSpacing: '-0.02em',
                        }}>
                            {t('home.title')}
                        </h1>
                        <p style={{
                            color: darkTheme.text.secondary,
                            fontSize: '16px',
                            lineHeight: 1.5,
                        }}>
                            {replacePlaceholders(t('home.welcome'), { name: user?.name || t('common.user') })}
                        </p>
                    </div>

                    {/* Continuer de regarder — en premier quand des progressions existent (Phase 2 IA) */}
                    {!loadingContinueWatching && continueWatching.length > 0 && (
                        <section
                            aria-label={t('home.continueWatching')}
                            style={{ marginBottom: '28px' }}
                        >
                            <NetflixCarousel title={t('home.continueWatching')} icon="▶">
                                {continueWatching.map((item) => {
                                    const thumb = getThumbnailUrl(item);
                                    const displayName = item.title || item.filename?.replace(/\.[^/.]+$/, '') || t('common.untitled');
                                    return (
                                        <Link
                                            key={item.file_id}
                                            to={`/info/videos/${item.file_id}`}
                                            prefetch="intent"
                                            style={{
                                                width: '185px',
                                                flexShrink: 0,
                                                textDecoration: 'none',
                                                color: 'inherit',
                                            }}
                                            aria-label={`${displayName}, ${Math.round(item.progress_percent)}% regardé`}
                                        >
                                            <div style={{
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                backgroundColor: darkTheme.background.tertiary,
                                                boxShadow: darkTheme.shadow.small,
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = darkTheme.shadow.small;
                                                }}
                                            >
                                                <div style={{ position: 'relative', aspectRatio: '2/3', backgroundColor: darkTheme.background.tertiary }}>
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: darkTheme.text.tertiary, fontSize: '48px',
                                                        }}>
                                                            🎬
                                                        </div>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
                                                        backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '0 0 8px 8px',
                                                    }}>
                                                        <div style={{
                                                            width: `${item.progress_percent}%`, height: '100%',
                                                            backgroundColor: darkTheme.accent.red, transition: 'width 0.3s',
                                                        }} />
                                                    </div>
                                                </div>
                                                <div style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: darkTheme.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {displayName}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </NetflixCarousel>
                        </section>
                    )}

                    {/* Vidéos, Musiques, Bibliothèque — cartes cliquables en colonnes */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '20px',
                        marginBottom: '28px',
                    }}>
                    <section
                        aria-labelledby="home-space-videos"
                        role="link"
                        tabIndex={0}
                        onClick={(e) => { if (!(e.target instanceof HTMLElement) || !e.target.closest('a')) navigate('/films'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/films'); } }}
                        style={cardBaseStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                            e.currentTarget.style.borderColor = darkTheme.border.light;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = darkTheme.shadow.small;
                            e.currentTarget.style.borderColor = darkTheme.border.secondary;
                        }}
                    >
                        <h2 id="home-space-videos" style={sectionTitleStyle}>
                            <span style={{ fontSize: '20px' }}>🎬</span>
                            {t('home.spaceVideos')}
                        </h2>
                        {!loadingContinueWatching && continueWatching.length > 0 ? (
                            <Link
                                to="/films"
                                prefetch="intent"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: darkTheme.accent.blue,
                                    textDecoration: 'none',
                                    marginTop: '8px',
                                    transition: darkTheme.transition.normal,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                                aria-label={t('home.seeAllVideos')}
                            >
                                {t('home.seeAllVideos')}
                            </Link>
                        ) : null}
                    </section>

                    <section
                        aria-labelledby="home-space-musics"
                        role="link"
                        tabIndex={0}
                        onClick={(e) => { if (!(e.target instanceof HTMLElement) || !e.target.closest('a')) navigate('/musics'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/musics'); } }}
                        style={cardBaseStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                            e.currentTarget.style.borderColor = darkTheme.border.light;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = darkTheme.shadow.small;
                            e.currentTarget.style.borderColor = darkTheme.border.secondary;
                        }}
                    >
                        <h2 id="home-space-musics" style={sectionTitleStyle}>
                            <span style={{ fontSize: '20px' }}>🎵</span>
                            {t('home.spaceMusics')}
                        </h2>
                        {!loadingRecentlyAdded && recentlyAdded.length > 0 && (
                            <div style={{ marginBottom: '16px' }}>
                                <NetflixCarousel title={t('home.recentlyAdded')} icon="🆕">
                                {recentlyAdded.map((item) => {
                                    const thumb = getThumbnailUrl(item);
                                    const displayName = item.title || item.filename?.replace(/\.[^/.]+$/, '') || t('common.untitled');
                                    const linkTo = item.category === 'videos'
                                        ? `/info/videos/${item.file_id}`
                                        : `/reader/musics/${item.file_id}`;
                                    const icon = item.category === 'videos' ? '🎬' : '🎵';
                                    return (
                                        <Link
                                            key={`${item.category}-${item.file_id}`}
                                            to={linkTo}
                                            prefetch="intent"
                                            style={{
                                                width: '185px',
                                                flexShrink: 0,
                                                textDecoration: 'none',
                                                color: 'inherit',
                                            }}
                                            aria-label={displayName}
                                        >
                                            <div
                                                style={{
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    backgroundColor: darkTheme.background.tertiary,
                                                    boxShadow: darkTheme.shadow.small,
                                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = darkTheme.shadow.small;
                                                }}
                                            >
                                                <div style={{ position: 'relative', aspectRatio: '2/3', backgroundColor: darkTheme.background.tertiary }}>
                                                    {thumb ? (
                                                        <img
                                                            src={thumb}
                                                            alt=""
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: darkTheme.text.tertiary, fontSize: '48px',
                                                        }}>
                                                            {icon}
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: darkTheme.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {displayName}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                                </NetflixCarousel>
                            </div>
                        )}
                    </section>

                    <section
                        aria-labelledby="home-space-library"
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate('/library')}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/library'); } }}
                        style={cardBaseStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                            e.currentTarget.style.borderColor = darkTheme.border.light;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = darkTheme.shadow.small;
                            e.currentTarget.style.borderColor = darkTheme.border.secondary;
                        }}
                    >
                        <h2 id="home-space-library" style={sectionTitleStyle}>
                            <span style={{ fontSize: '20px' }}>🖼️</span>
                            {t('home.spaceLibrary')}
                        </h2>
                        <p style={{ color: darkTheme.text.secondary, fontSize: '14px', marginBottom: 0, lineHeight: 1.5 }}>
                            Images, documents, archives
                        </p>
                    </section>
                    </div>

                    {/* CTA secondaires : "Ajouter encore" et "Voir la bibliothèque" lorsque l'utilisateur a déjà des fichiers */}
                    {hasLoadedOnce && !loadingStats && stats.fileCount > 0 && (
                        <div style={{ marginBottom: '28px', textAlign: 'center', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', alignItems: 'center' }}>
                            <Link
                                to="/upload"
                                prefetch="intent"
                                style={{
                                    fontSize: '14px',
                                    color: darkTheme.accent.blue,
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: darkTheme.radius.medium,
                                    transition: darkTheme.transition.normal,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                aria-label={t('home.addMore')}
                            >
                                <span aria-hidden>📤</span>
                                {t('home.addMore')}
                            </Link>
                            <span style={{ color: darkTheme.text.tertiary, fontSize: '14px' }}>·</span>
                            <Link
                                to="/library"
                                prefetch="intent"
                                style={{
                                    fontSize: '14px',
                                    color: darkTheme.text.secondary,
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 16px',
                                    borderRadius: darkTheme.radius.medium,
                                    transition: darkTheme.transition.normal,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.textDecoration = 'underline';
                                    e.currentTarget.style.color = darkTheme.accent.blue;
                                    e.currentTarget.style.backgroundColor = darkTheme.background.tertiary;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.textDecoration = 'none';
                                    e.currentTarget.style.color = darkTheme.text.secondary;
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                aria-label={t('nav.libraryAriaLabel')}
                            >
                                <span aria-hidden>📚</span>
                                {t('nav.library')}
                            </Link>
                        </div>
                    )}

                    {/* Stats repliables */}
                    <div style={{ marginBottom: '40px' }}>
                        <button
                            onClick={() => setStatsExpanded((prev) => !prev)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 20px',
                                backgroundColor: darkTheme.background.secondary,
                                border: `1px solid ${darkTheme.border.primary}`,
                                borderRadius: '8px',
                                color: darkTheme.text.primary,
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            aria-expanded={statsExpanded}
                            aria-controls="home-stats-panel"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = darkTheme.accent.blue;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = darkTheme.border.primary;
                            }}
                        >
                            <span>{statsExpanded ? '▼' : '▶'}</span>
                            <span>{statsExpanded ? t('home.hideStats') : t('home.showStats')}</span>
                            {!loadingStats && hasLoadedOnce && (
                                <span style={{ color: darkTheme.text.tertiary, fontWeight: '400', marginLeft: '4px' }}>
                                    ({stats.fileCount} fichiers · {stats.totalSizeGB.toFixed(1)} Go)
                                </span>
                            )}
                        </button>

                        {statsExpanded && (
                            <div id="home-stats-panel" role="region" aria-label={t('home.stats')} style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                                gap: '24px',
                                marginTop: '16px'
                            }}>
                        {/* Carte Statistiques */}
                        <div style={{
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: darkTheme.shadow.medium,
                            borderLeft: `4px solid ${darkTheme.accent.blue}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: darkTheme.surface.info,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    📊
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        color: darkTheme.text.primary
                                    }}>
                                        {t('home.stats')}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: darkTheme.text.secondary,
                                        fontSize: '14px'
                                    }}>
                                        {t('home.statsDescription')}
                                    </p>
                                </div>
                            </div>

                            {statsError ? (
                                <ErrorDisplay 
                                    error={statsError} 
                                    onRetry={() => fetchStats(true)} 
                                />
                            ) : (
                            <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: darkTheme.accent.blue,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '34px'
                                    }}>
                                        {loadingStats ? <LoadingSpinner size="small" /> : stats.fileCount}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: darkTheme.text.secondary
                                    }}>
                                        {t('home.fileCount')}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: 'bold',
                                        color: darkTheme.accent.green,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '34px'
                                    }}>
                                        {loadingStats ? <LoadingSpinner size="small" /> : stats.totalSizeGB.toFixed(2)}
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: darkTheme.text.secondary
                                    }}>
                                        {t('home.totalSize')}
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                marginTop: '20px',
                                padding: '12px',
                                backgroundColor: darkTheme.background.tertiary,
                                borderRadius: '8px',
                                fontSize: '13px',
                                color: darkTheme.text.secondary
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                    <strong>{t('home.rate')}</strong>
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: darkTheme.text.tertiary,
                                    textAlign: 'center',
                                    lineHeight: '1.5'
                                }}>
                                    {t('home.billing')}: <strong>{loadingStats ? '...' : stats.billableGB} Go</strong>
                                </div>
                            </div>
                            </>
                            )}
                        </div>

                        {/* Montant à payer par mois */}
                        <div style={{
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: '12px',
                            padding: '30px',
                            boxShadow: darkTheme.shadow.medium,
                            borderLeft: `4px solid ${darkTheme.accent.blue}`
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: darkTheme.surface.info,
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '24px'
                                }}>
                                    💰
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        color: darkTheme.text.primary
                                    }}>
                                        {t('home.amountToPay')}
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: darkTheme.text.secondary,
                                        fontSize: '14px'
                                    }}>
                                        {t('home.monthlyBilling')}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                textAlign: 'center',
                                padding: '20px 0'
                            }}>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: 'bold',
                                    color: darkTheme.accent.blue,
                                    marginBottom: '8px'
                                }}>
                                    {loadingStats ? '...' : (stats.billableGB * 0.030).toFixed(3)} $
                                </div>
                                    <div style={{
                                        fontSize: '14px',
                                        color: darkTheme.text.secondary,
                                        marginBottom: '16px'
                                    }}>
                                    {t('home.for')} {loadingStats ? '...' : stats.billableGB} Go
                                    </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: darkTheme.text.tertiary,
                                    padding: '12px',
                                    backgroundColor: darkTheme.background.tertiary,
                                    borderRadius: '8px'
                                }}>
                                    {t('home.rate')}
                                    </div>
                            </div>
                        </div>
                            </div>
                        )}
                    </div>

                    {/* État vide - Aucun fichier uploadé */}
                    {!loadingStats && hasLoadedOnce && stats.fileCount === 0 && (
                        <div style={{
                            backgroundColor: darkTheme.background.secondary,
                            borderRadius: '12px',
                            padding: '60px 40px',
                            textAlign: 'center',
                            boxShadow: darkTheme.shadow.medium,
                            border: `2px dashed ${darkTheme.border.primary}`
                        }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>
                                🚀
                            </div>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: darkTheme.text.primary,
                                marginBottom: '12px'
                            }}>
                                {t('home.emptyTitle')}
                            </h2>
                            <p style={{
                                fontSize: '16px',
                                color: darkTheme.text.secondary,
                                marginBottom: '32px',
                                maxWidth: '500px',
                                margin: '0 auto 32px',
                                lineHeight: '1.6'
                            }}>
                                {t('home.emptyDescription')}
                            </p>
                            <button
                                onClick={() => navigate('/upload')}
                                style={{
                                    padding: '16px 32px',
                                    backgroundColor: darkTheme.accent.blue,
                                    color: darkTheme.text.primary,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    boxShadow: darkTheme.shadow.small,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = darkTheme.shadow.medium;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = darkTheme.shadow.small;
                                }}
                            >
                                <span>📤</span>
                                <span>{t('home.uploadFirst')}</span>
                            </button>
                            
                            <p style={{ fontSize: '14px', color: darkTheme.text.tertiary, maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                                {t('home.emptyHint')}
                            </p>
                            <div style={{
                                marginTop: '24px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '20px',
                                maxWidth: '600px',
                                margin: '24px auto 0'
                            }}>
                                {[
                                    { icon: '🎬', label: t('categories.videos') },
                                    { icon: '🎵', label: t('categories.musics') },
                                    { icon: '🖼️', label: t('categories.images') },
                                    { icon: '📄', label: t('categories.documents') }
                                ].map((item, i) => (
                                    <div key={i} style={{
                                        padding: '16px',
                                        backgroundColor: darkTheme.background.tertiary,
                                        borderRadius: darkTheme.radius.medium,
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.icon}</div>
                                        <div style={{ fontSize: '13px', color: darkTheme.text.secondary }}>{item.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                <footer style={{
                    backgroundColor: '#1a1a1a',
                    color: '#cccccc',
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
                            © {new Date().getFullYear()} Stormi. {t('footer.allRightsReserved')}.
                        </p>
                    </div>
                </footer>
        </>
    );
}