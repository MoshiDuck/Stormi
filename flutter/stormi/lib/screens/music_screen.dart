import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/file_item.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';

class MusicScreen extends StatefulWidget {
  const MusicScreen({super.key});

  @override
  State<MusicScreen> createState() => _MusicScreenState();
}

class _MusicScreenState extends State<MusicScreen> {
  List<FileItem> _tracks = [];
  bool _loading = true;
  String? _error;
  CacheInvalidationNotifier? _cacheNotifier;
  VoidCallback? _cacheListener;

  @override
  void initState() {
    super.initState();
    _load();
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
    super.dispose();
  }

  Future<void> _load({bool skipCache = false}) async {
    final auth = context.read<AuthService>();
    final userId = auth.user?.id;
    if (userId == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    final cache = context.read<CacheService>();
    final api = context.read<ApiClient>();
    List<FileItem>? list;
    if (!skipCache) list = await cache.getFiles(userId, 'musics');
    if (list == null) {
      try {
        list = await api.getFiles(userId, category: 'musics');
        await cache.setFiles(userId, 'musics', list);
      } catch (e) {
        if (!mounted) return;
        list = await cache.getFilesStale(userId, 'musics');
        setState(() {
          _error = list == null ? e.toString() : null;
          if (list != null) _tracks = list;
          _loading = false;
        });
        return;
      }
    }
    if (!mounted) return;
    setState(() {
      _tracks = list ?? [];
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
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('music.title'), style: TextStyle(color: colorScheme.onSurface)),
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
            : _error != null && _tracks.isEmpty
                ? _buildError(theme, lang)
                : _tracks.isEmpty
                    ? _buildEmpty(theme, lang)
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                        itemCount: _tracks.length,
                        itemBuilder: (context, i) => _trackTile(_tracks[i], theme),
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
              onPressed: () => _load(skipCache: true),
              icon: const Icon(Icons.refresh),
              label: Text(lang.t('common.retry')),
              style: FilledButton.styleFrom(backgroundColor: colorScheme.primary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty(ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.music_note_outlined, size: 64, color: colorScheme.onSurface.withValues(alpha: 0.4)),
          const SizedBox(height: 16),
          Text(
            lang.t('music.empty'),
            style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _trackTile(FileItem f, ThemeProvider theme) {
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    final thumbUrl = (f.thumbnailUrl?.isNotEmpty == true ? f.thumbnailUrl : null) ??
        (f.albumThumbnails?.isNotEmpty == true ? f.albumThumbnails : null) ??
        ApiClient.thumbnailUrl(f.category, f.fileId);
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: cardColor,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: Image.network(
            thumbUrl,
            width: 56,
            height: 56,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 56,
              height: 56,
              color: colorScheme.surfaceContainerHighest,
              child: Icon(Icons.music_note, color: colorScheme.onSurface.withValues(alpha: 0.5)),
            ),
          ),
        ),
        title: Text(
          f.displayTitle,
          style: TextStyle(color: colorScheme.onSurface, fontSize: 15),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          f.artists?.isNotEmpty == true ? f.artists! : (f.albums ?? ''),
          style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6), fontSize: 12),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Icon(Icons.play_circle_outline, color: colorScheme.primary),
        onTap: () {
          // TODO: lecture audio
        },
      ),
    );
  }
}
