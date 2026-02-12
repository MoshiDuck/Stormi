import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/file_item.dart';
import '../models/streaming_profile.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import '../utils/responsive.dart';
import 'info_screen.dart';

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

  Future<void> _deleteFile(FileItem f, ThemeProvider theme, LanguageProvider lang) async {
    final auth = context.read<AuthService>();
    final userId = auth.user?.id;
    if (userId == null) return;
    final api = context.read<ApiClient>();
    final cache = context.read<CacheService>();
    final notifier = context.read<CacheInvalidationNotifier>();
    try {
      await api.deleteFile(userId, f.category, f.fileId);
      await cache.invalidateFiles(userId, 'musics');
      await cache.invalidateStats(userId);
      notifier.invalidateAfterDelete(userId, 'musics');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${f.displayTitle} — ${lang.t('common.delete')}'), backgroundColor: Colors.green),
        );
        _load(skipCache: true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _showFileActionSheet(FileItem f, ThemeProvider theme, LanguageProvider lang, Color cardColor, ColorScheme colorScheme) async {
    final api = context.read<ApiClient>();
    try {
      final restrictedIds = await api.getRestrictionsForItem('file', f.fileId);
      final profiles = await api.getProfiles();
      final nonMain = profiles.where((p) => !p.isMain).toList();
      final showHide = nonMain.isNotEmpty && nonMain.any((p) => !restrictedIds.contains(p.id));
      final showShow = restrictedIds.isNotEmpty;
      if (!mounted) return;
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
              if (showHide)
                ListTile(
                  leading: Icon(Icons.visibility_off_rounded, color: colorScheme.onSurface),
                  title: Text(lang.t('selectProfile.hideFromProfile'), style: TextStyle(color: colorScheme.onSurface)),
                  onTap: () {
                    Navigator.pop(ctx);
                    _showHideFromProfilePicker(f, theme, lang);
                  },
                ),
              if (showShow)
                ListTile(
                  leading: Icon(Icons.visibility_rounded, color: colorScheme.onSurface),
                  title: Text(lang.t('selectProfile.showInProfile'), style: TextStyle(color: colorScheme.onSurface)),
                  onTap: () {
                    Navigator.pop(ctx);
                    _showShowInProfilePicker(f, theme, lang);
                  },
                ),
            ],
          ),
        ),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: colorScheme.errorContainer),
      );
    }
  }

  Future<void> _showHideFromProfilePicker(FileItem f, ThemeProvider theme, LanguageProvider lang) async {
    final api = context.read<ApiClient>();
    final colorScheme = theme.themeData.colorScheme;
    try {
      final profiles = await api.getProfiles();
      final restrictedIds = await api.getRestrictionsForItem('file', f.fileId);
      final hideTargets = profiles.where((p) => !p.isMain && !restrictedIds.contains(p.id)).toList();
      if (!mounted) return;
      if (hideTargets.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(lang.t('selectProfile.hideFromProfileTitle')), backgroundColor: colorScheme.surfaceContainerHighest),
        );
        return;
      }
      showModalBottomSheet<void>(
        context: context,
        builder: (ctx) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(lang.t('selectProfile.hideFromProfileTitle'), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: colorScheme.onSurface)),
              ),
              ...hideTargets.map((p) => ListTile(
                title: Text(p.name),
                onTap: () async {
                  Navigator.pop(ctx);
                  try {
                    await api.addProfileRestriction(p.id, 'file', f.fileId);
                    final _userId = context.read<AuthService>().user?.id;
                    if (_userId != null) context.read<CacheInvalidationNotifier>().invalidateAfterUpload(_userId, 'musics');
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(lang.t('selectProfile.hiddenFromProfile')), backgroundColor: colorScheme.primaryContainer),
                      );
                      _load(skipCache: true);
                    }
                  } catch (e) {
                    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: colorScheme.errorContainer));
                  }
                },
              )),
            ],
          ),
        ),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: colorScheme.errorContainer));
    }
  }

  Future<void> _showShowInProfilePicker(FileItem f, ThemeProvider theme, LanguageProvider lang) async {
    final api = context.read<ApiClient>();
    final colorScheme = theme.themeData.colorScheme;
    try {
      final restrictedIds = await api.getRestrictionsForItem('file', f.fileId);
      if (restrictedIds.isEmpty) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(lang.t('selectProfile.showInProfileTitle')), backgroundColor: colorScheme.surfaceContainerHighest),
        );
        return;
      }
      final profiles = await api.getProfiles();
      final restrictedProfiles = profiles.where((p) => restrictedIds.contains(p.id)).toList();
      if (!mounted) return;
      showModalBottomSheet<void>(
        context: context,
        builder: (ctx) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(lang.t('selectProfile.showInProfileTitle'), style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: colorScheme.onSurface)),
              ),
              ...restrictedProfiles.map((p) => ListTile(
                title: Text(p.name),
                onTap: () async {
                  Navigator.pop(ctx);
                  try {
                    await api.removeProfileRestriction(p.id, 'file', f.fileId);
                    final _userId = context.read<AuthService>().user?.id;
                    if (_userId != null) context.read<CacheInvalidationNotifier>().invalidateAfterUpload(_userId, 'musics');
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(lang.t('selectProfile.showInProfile')), backgroundColor: colorScheme.primaryContainer),
                      );
                      _load(skipCache: true);
                    }
                  } catch (e) {
                    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: colorScheme.errorContainer));
                  }
                },
              )),
            ],
          ),
        ),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: colorScheme.errorContainer));
    }
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
                        padding: EdgeInsets.symmetric(vertical: Responsive.of(context).padV * 0.6, horizontal: Responsive.of(context).padH),
                        itemCount: _tracks.length,
                        itemBuilder: (context, i) => _trackTile(_tracks[i], theme, lang),
                      ),
      ),
    );
  }

  Widget _buildError(ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);
    return Center(
      child: Padding(
        padding: EdgeInsets.all(r.padH),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, size: r.iconSize(48), color: colorScheme.error),
            SizedBox(height: r.gap),
            Text(_error!, textAlign: TextAlign.center, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(14))),
            SizedBox(height: r.gap),
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
    final r = Responsive.of(context);
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.music_note_outlined, size: r.iconSize(64), color: colorScheme.onSurface.withValues(alpha: 0.4)),
          SizedBox(height: r.gap),
          Text(
            lang.t('music.empty'),
            style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(16)),
          ),
        ],
      ),
    );
  }

  Widget _trackTile(FileItem f, ThemeProvider theme, LanguageProvider lang) {
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    final r = Responsive.of(context);
    final thumbSize = r.wp(14).clamp(48, 72).toDouble();
    final thumbUrl = (f.thumbnailUrl?.isNotEmpty == true ? f.thumbnailUrl : null) ??
        (f.albumThumbnails?.isNotEmpty == true ? f.albumThumbnails : null) ??
        ApiClient.thumbnailUrl(f.category, f.fileId);
    return Card(
      margin: EdgeInsets.only(bottom: r.gapS),
      color: cardColor,
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: r.gapS, vertical: r.gapS * 0.7),
        leading: ClipRRect(
          borderRadius: BorderRadius.circular(r.radius * 0.7),
          child: Image.network(
            thumbUrl,
            width: thumbSize,
            height: thumbSize,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: thumbSize,
              height: thumbSize,
              color: colorScheme.surfaceContainerHighest,
              child: Icon(Icons.music_note, color: colorScheme.onSurface.withValues(alpha: 0.5)),
            ),
          ),
        ),
        title: Text(
          f.displayTitle,
          style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(15)),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Text(
          f.artists?.isNotEmpty == true ? f.artists! : (f.albums ?? ''),
          style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6), fontSize: r.sp(12)),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
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
        onLongPress: () async => await _showFileActionSheet(f, theme, lang, cardColor, colorScheme),
      ),
    );
  }
}
