import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/file_item.dart';
import '../models/stats.dart';
import '../models/watch_progress.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import 'info_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.showAsStatisticsPage = false});

  /// True quand ouvert depuis Profil → Statistiques (AppBar avec titre et retour).
  final bool showAsStatisticsPage;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Stats? _stats;
  List<FileItem> _continueWatching = [];
  List<FileItem> _recentlyAdded = [];
  List<WatchProgress> _progressions = [];
  bool _loading = true;
  String? _error;
  CacheInvalidationNotifier? _cacheNotifier;
  VoidCallback? _cacheListener;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_cacheNotifier == null) {
      _cacheNotifier = context.read<CacheInvalidationNotifier>();
      _cacheListener = () {
        if (mounted) _load(skipCache: true);
      };
      _cacheNotifier!.addListener(_cacheListener!);
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load(skipCache: false));
  }

  @override
  void dispose() {
    if (_cacheNotifier != null && _cacheListener != null) {
      _cacheNotifier!.removeListener(_cacheListener!);
    }
    super.dispose();
  }

  Future<void> _load({bool skipCache = false}) async {
    final auth = context.read<AuthService>();
    final userId = auth.user?.id;
    if (userId == null) return;
    final cache = context.read<CacheService>();
    final api = context.read<ApiClient>();

    setState(() {
      _loading = true;
      _error = null;
    });

    Stats? stats;
    List<FileItem> videos = [];
    List<WatchProgress> progressions = [];

    if (!skipCache) {
      stats = await cache.getStats(userId);
      final cachedVideos = await cache.getFiles(userId, 'videos');
      if (cachedVideos != null) videos = cachedVideos;
    }

    if (stats == null || videos.isEmpty) {
      try {
        if (auth.token == null) throw Exception('Non connecté');
        if (stats == null) {
          stats = await api.getStats(userId);
          await cache.setStats(userId, stats!);
        }
        if (videos.isEmpty) {
          videos = await api.getFiles(userId, category: 'videos');
          await cache.setFiles(userId, 'videos', videos);
        }
        progressions = await api.getWatchProgress(userId);
      } catch (e) {
        if (stats == null) stats = await cache.getStatsStale(userId);
        if (videos.isEmpty) {
          final stale = await cache.getFilesStale(userId, 'videos');
          if (stale != null) videos = stale;
        }
        if (stats == null && _stats == null && videos.isEmpty) {
          if (!mounted) return;
          setState(() {
            _error = e.toString();
            _loading = false;
          });
          return;
        }
        if (progressions.isEmpty && auth.token != null) {
          try {
            progressions = await api.getWatchProgress(userId);
          } catch (_) {}
        }
      }
    } else {
      try {
        progressions = await api.getWatchProgress(userId);
      } catch (_) {}
    }

    final continueFiles = <FileItem>[];
    for (final p in progressions) {
      final match = videos.where((f) => f.fileId == p.fileId);
      if (match.isNotEmpty) continueFiles.add(match.first);
    }
    final recent = videos.take(15).toList();

    if (!mounted) return;
    setState(() {
      _stats = stats ?? _stats;
      _progressions = progressions;
      _continueWatching = continueFiles;
      _recentlyAdded = recent;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: widget.showAsStatisticsPage
          ? AppBar(
              backgroundColor: theme.themeData.appBarTheme.backgroundColor,
              foregroundColor: theme.themeData.appBarTheme.foregroundColor,
              title: Text(lang.t('profile.statistics'), style: TextStyle(color: colorScheme.onSurface)),
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => Navigator.of(context).pop(),
              ),
            )
          : null,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => _load(skipCache: true),
          color: colorScheme.primary,
          child: _loading && _stats == null
              ? Center(child: CircularProgressIndicator(color: colorScheme.primary))
              : _error != null && _stats == null
                  ? _buildError(context, theme, lang)
                  : CustomScrollView(
                      slivers: [
                        if (!widget.showAsStatisticsPage) SliverToBoxAdapter(child: _buildAppBar(theme, lang)),
                        if (_stats != null) SliverToBoxAdapter(child: _buildStatsCard(context, theme, lang)),
                        if (_continueWatching.isNotEmpty) ...[
                          SliverToBoxAdapter(child: _sectionTitle(lang.t('home.continueWatching'), theme)),
                          SliverToBoxAdapter(child: _horizontalList(_continueWatching, theme)),
                        ],
                        if (_recentlyAdded.isNotEmpty) ...[
                          SliverToBoxAdapter(child: _sectionTitle(lang.t('home.recentlyAdded'), theme)),
                          SliverToBoxAdapter(child: _horizontalList(_recentlyAdded, theme)),
                        ],
                        const SliverToBoxAdapter(child: SizedBox(height: 24)),
                      ],
                    ),
        ),
      ),
    );
  }

  Widget _buildAppBar(ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Row(
        children: [
          Text(
            'Stormi',
            style: TextStyle(
              color: colorScheme.onSurface,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(BuildContext context, ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: colorScheme.onSurface.withValues(alpha: 0.7)),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8))),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _load,
              icon: const Icon(Icons.refresh),
              label: Text(lang.t('common.retry')),
              style: FilledButton.styleFrom(backgroundColor: colorScheme.primary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard(BuildContext context, ThemeProvider theme, LanguageProvider lang) {
    final s = _stats!;
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.themeData.dividerColor),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _statItem(lang.t('home.files'), '${s.fileCount}', colorScheme),
          _statItem(lang.t('home.size'), '${s.totalSizeGB.toStringAsFixed(1)} Go', colorScheme),
        ],
      ),
    );
  }

  Widget _statItem(String label, String value, ColorScheme colorScheme) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: colorScheme.onSurface, fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: 12)),
      ],
    );
  }

  Widget _sectionTitle(String title, ThemeProvider theme) {
    final colorScheme = theme.themeData.colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(color: colorScheme.onSurface, fontSize: 18, fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _horizontalList(List<FileItem> items, ThemeProvider theme) {
    return SizedBox(
      height: 160,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: items.length,
        itemBuilder: (context, i) {
          final f = items[i];
          final match = _progressions.where((p) => p.fileId == f.fileId);
          final progress = match.isEmpty ? null : match.first.progressPercent;
          return _posterCard(f, theme, progress: progress);
        },
      ),
    );
  }

  Widget _posterCard(FileItem f, ThemeProvider theme, {double? progress}) {
    final colorScheme = theme.themeData.colorScheme;
    final thumbUrl = f.thumbnailUrl != null && f.thumbnailUrl!.isNotEmpty
        ? f.thumbnailUrl
        : ApiClient.thumbnailUrl(f.category, f.fileId);
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => InfoScreen(category: f.category, fileId: f.fileId, file: f),
          ),
        );
      },
      child: Container(
      width: 110,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: Stack(
              children: [
                Image.network(
                  thumbUrl!,
                  width: 110,
                  height: 150,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 110,
                    height: 150,
                    color: colorScheme.surfaceContainerHighest,
                    child: Icon(Icons.broken_image, color: colorScheme.onSurface.withValues(alpha: 0.5)),
                  ),
                ),
                if (progress != null && progress > 0)
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 0,
                    child: LinearProgressIndicator(
                      value: progress / 100,
                      backgroundColor: Colors.black45,
                      valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Text(
            f.displayTitle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(color: colorScheme.onSurface, fontSize: 12),
          ),
        ],
      ),
    ),
    );
  }
}
