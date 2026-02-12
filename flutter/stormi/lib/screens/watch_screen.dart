import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/file_item.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import 'info_screen.dart';

/// Regarder : onglets Films / Séries, cache + invalidation, long-press Supprimer (portrait du site).
class WatchScreen extends StatefulWidget {
  const WatchScreen({super.key});

  @override
  State<WatchScreen> createState() => _WatchScreenState();
}

class _WatchScreenState extends State<WatchScreen> with SingleTickerProviderStateMixin {
  List<FileItem> _videos = [];
  bool _loading = true;
  String? _error;
  late TabController _tabController;
  CacheInvalidationNotifier? _cacheNotifier;
  VoidCallback? _cacheListener;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _load(skipCache: false));
  }

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
  void dispose() {
    if (_cacheNotifier != null && _cacheListener != null) {
      _cacheNotifier!.removeListener(_cacheListener!);
    }
    _tabController.dispose();
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

    List<FileItem>? list;
    if (!skipCache) list = await cache.getFiles(userId, 'videos');
    if (list == null) {
      try {
        list = await api.getFiles(userId, category: 'videos');
        await cache.setFiles(userId, 'videos', list);
      } catch (e) {
        list = await cache.getFilesStale(userId, 'videos');
        if (list == null && _videos.isEmpty) {
          if (!mounted) return;
          setState(() {
            _error = e.toString();
            _loading = false;
          });
          return;
        }
      }
    }

    if (!mounted) return;
    setState(() {
      _videos = list ?? _videos;
      _loading = false;
    });
  }

  Future<void> _deleteFile(FileItem f, ThemeProvider theme, LanguageProvider lang) async {
    final auth = context.read<AuthService>();
    final userId = auth.user?.id;
    if (userId == null) return;
    final api = context.read<ApiClient>();
    final cache = context.read<CacheService>();
    final notifier = context.read<CacheInvalidationNotifier>();

    try {
      await api.deleteFile(userId, f.category, f.fileId);
      await cache.invalidateFiles(userId, 'videos');
      await cache.invalidateStats(userId);
      notifier.invalidateAfterDelete(userId, 'videos');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${f.displayTitle} — ${lang.t('common.delete')}'), backgroundColor: Colors.green),
        );
        _load(skipCache: true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
    }
  }

  List<FileItem> get _films => _videos.where((f) => f.season == null).toList();
  List<FileItem> get _series => _videos.where((f) => f.season != null).toList();

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('watch.title'), style: TextStyle(color: colorScheme.onSurface)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: colorScheme.primary,
          labelColor: colorScheme.primary,
          unselectedLabelColor: colorScheme.onSurface.withValues(alpha: 0.6),
          tabs: [
            Tab(text: lang.t('watch.films')),
            Tab(text: lang.t('watch.series')),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _load(skipCache: true),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => _load(skipCache: true),
        color: colorScheme.primary,
        child: _loading
            ? Center(child: CircularProgressIndicator(color: colorScheme.primary))
            : _error != null && _videos.isEmpty
                ? _buildError(theme, lang)
                : TabBarView(
                    controller: _tabController,
                    children: [
                      _buildList(_films, theme, lang),
                      _buildList(_series, theme, lang),
                    ],
                  ),
      ),
    );
  }

  Widget _buildError(ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: 48, color: colorScheme.error),
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

  Widget _buildList(List<FileItem> items, ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;

    if (items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.movie_outlined, size: 64, color: colorScheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 16),
            Text(
              lang.t('watch.emptyVideos'),
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: 16),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      itemCount: items.length,
      itemBuilder: (context, i) => _videoTile(items[i], theme, lang, cardColor, colorScheme),
    );
  }

  Widget _videoTile(FileItem f, ThemeProvider theme, LanguageProvider lang, Color cardColor, ColorScheme colorScheme) {
    final thumbUrl = f.thumbnailUrl?.isNotEmpty == true
        ? f.thumbnailUrl!
        : ApiClient.thumbnailUrl(f.category, f.fileId);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: cardColor,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        onLongPress: () {
          showModalBottomSheet<void>(
            context: context,
            backgroundColor: cardColor,
            builder: (ctx) => SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ListTile(
                    leading: const Icon(Icons.delete_outline, color: Colors.red),
                    title: Text(lang.t('common.delete'), style: TextStyle(color: colorScheme.onSurface)),
                    subtitle: Text(f.displayTitle, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7)), maxLines: 1, overflow: TextOverflow.ellipsis),
                    onTap: () {
                      Navigator.pop(ctx);
                      _deleteFile(f, theme, lang);
                    },
                  ),
                ],
              ),
            ),
          );
        },
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            thumbUrl,
            width: 80,
            height: 100,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 80,
              height: 100,
              color: colorScheme.surfaceContainerHighest,
              child: Icon(Icons.broken_image, color: colorScheme.onSurface.withValues(alpha: 0.5)),
            ),
          ),
        ),
        title: Text(
          f.displayTitle,
          style: TextStyle(color: colorScheme.onSurface, fontWeight: FontWeight.w500),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          f.year != null ? '${f.year}' : (f.season != null ? 'S${f.season} E${f.episode ?? "?"}' : ''),
          style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6), fontSize: 12),
        ),
        trailing: Icon(Icons.play_circle_outline, color: colorScheme.primary),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => InfoScreen(category: f.category, fileId: f.fileId, file: f),
            ),
          );
        },
      ),
    );
  }
}
