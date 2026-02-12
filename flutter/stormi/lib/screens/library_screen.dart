import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/file_item.dart';
import '../models/streaming_profile.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import '../utils/responsive.dart';
import 'image_viewer_screen.dart';
import 'upload_screen.dart';

class _CategoryTab {
  final String key;
  final String labelKey;
  final String emptyKey;
  final IconData icon;
  const _CategoryTab(this.key, this.labelKey, this.emptyKey, this.icon);
}

// Ordre identique au site : images, documents, archives, others, executables
const _categories = [
  _CategoryTab('images', 'library.images', 'library.emptyImages', Icons.image_rounded),
  _CategoryTab('documents', 'library.documents', 'library.emptyDocuments', Icons.description_rounded),
  _CategoryTab('archives', 'library.archives', 'library.emptyFiles', Icons.folder_zip_rounded),
  _CategoryTab('others', 'library.others', 'library.emptyFiles', Icons.folder_rounded),
  _CategoryTab('executables', 'library.executables', 'library.emptyFiles', Icons.settings_applications_rounded),
];

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({super.key});

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final Map<String, List<FileItem>> _cache = {};
  final Map<String, bool> _loading = {};
  final Map<String, String?> _errors = {};
  CacheInvalidationNotifier? _cacheNotifier;
  VoidCallback? _cacheListener;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _categories.length, vsync: this);
    _tabController.addListener(_onTabChange);
    _loadCategory(_categories[0].key);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_cacheNotifier == null) {
      _cacheNotifier = context.read<CacheInvalidationNotifier>();
      _cacheListener = () {
        if (mounted) {
          for (final c in _categories) _loadCategory(c.key, skipCache: true);
        }
      };
      _cacheNotifier!.addListener(_cacheListener!);
    }
  }

  @override
  void dispose() {
    if (_cacheNotifier != null && _cacheListener != null) {
      _cacheNotifier!.removeListener(_cacheListener!);
    }
    _tabController.removeListener(_onTabChange);
    _tabController.dispose();
    super.dispose();
  }

  void _onTabChange() {
    if (!_tabController.indexIsChanging) {
      _loadCategory(_categories[_tabController.index].key);
    }
  }

  Future<void> _loadCategory(String category, {bool skipCache = false}) async {
    if (!skipCache && _cache.containsKey(category)) return;
    final auth = context.read<AuthService>();
    final userId = auth.user?.id;
    if (userId == null) return;
    setState(() {
      _loading[category] = true;
      _errors[category] = null;
    });
    final cache = context.read<CacheService>();
    final api = context.read<ApiClient>();
    List<FileItem>? list;
    if (!skipCache) list = await cache.getFiles(userId, category);
    if (list == null) {
      try {
        list = await api.getFiles(userId, category: category);
        await cache.setFiles(userId, category, list);
      } catch (e) {
        if (!mounted) return;
        list = await cache.getFilesStale(userId, category);
        setState(() {
          _errors[category] = list == null ? e.toString() : null;
          if (list != null) _cache[category] = list;
          _loading[category] = false;
        });
        return;
      }
    }
    if (!mounted) return;
    setState(() {
      if (list != null) _cache[category] = list;
      _loading[category] = false;
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
      await cache.invalidateFiles(userId, f.category);
      await cache.invalidateStats(userId);
      notifier.invalidateAfterDelete(userId, f.category);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${f.displayTitle} — ${lang.t('common.delete')}'), backgroundColor: Colors.green),
        );
        _loadCategory(f.category, skipCache: true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: Colors.red),
        );
      }
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
                    if (_userId != null) context.read<CacheInvalidationNotifier>().invalidateAfterUpload(_userId, f.category);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(lang.t('selectProfile.hiddenFromProfile')), backgroundColor: colorScheme.primaryContainer),
                      );
                      _loadCategory(f.category, skipCache: true);
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
                    if (_userId != null) context.read<CacheInvalidationNotifier>().invalidateAfterUpload(_userId, f.category);
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(lang.t('selectProfile.showInProfile')), backgroundColor: colorScheme.primaryContainer),
                      );
                      _loadCategory(f.category, skipCache: true);
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

  void _openFileUrl(FileItem f) {
    final auth = context.read<AuthService>();
    final token = auth.token;
    if (token == null) return;
    final url = '${ApiClient.fileUrl(f.category, f.fileId)}?token=$token';
    launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
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
        title: Text(lang.t('library.title'), style: TextStyle(color: colorScheme.onSurface, fontSize: Responsive.of(context).sp(20))),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorColor: colorScheme.primary,
          labelColor: colorScheme.onSurface,
          unselectedLabelColor: colorScheme.onSurface.withValues(alpha: 0.6),
          tabs: _categories.map((c) => Tab(icon: Icon(c.icon, size: Responsive.of(context).iconSize(22)), text: lang.t(c.labelKey))).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _categories.map((c) => _buildCategoryContent(c, theme, lang)).toList(),
      ),
    );
  }

  Widget _buildCategoryContent(_CategoryTab cat, ThemeProvider theme, LanguageProvider lang) {
    final loading = _loading[cat.key] ?? false;
    final error = _errors[cat.key];
    final items = _cache[cat.key] ?? [];
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;

    if (loading && items.isEmpty) {
      return Center(child: CircularProgressIndicator(color: colorScheme.primary));
    }
    if (error != null && items.isEmpty) {
      final r = Responsive.of(context);
      return Center(
        child: Padding(
          padding: EdgeInsets.all(r.padH),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: r.iconSize(48), color: colorScheme.error),
              SizedBox(height: r.gap),
              Text(error, textAlign: TextAlign.center, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(14))),
              SizedBox(height: r.gap),
              FilledButton.icon(
                onPressed: () => _loadCategory(cat.key, skipCache: true),
                icon: const Icon(Icons.refresh),
                label: Text(lang.t('common.retry')),
                style: FilledButton.styleFrom(backgroundColor: colorScheme.primary),
              ),
            ],
          ),
        ),
      );
    }
    if (items.isEmpty) {
      return _buildEmptyState(cat, theme, lang, colorScheme);
    }

    if (cat.key == 'images') {
      return _buildImagesGrid(items, theme, lang, cardColor, colorScheme);
    }
    if (cat.key == 'documents') {
      return _buildDocumentsGrid(items, theme, lang, cardColor, colorScheme);
    }
    return _buildFileList(cat.key, items, theme, lang, cardColor, colorScheme);
  }

  Widget _buildEmptyState(_CategoryTab cat, ThemeProvider theme, LanguageProvider lang, ColorScheme colorScheme) {
    final r = Responsive.of(context);
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: r.padH),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(cat.icon, size: r.iconSize(64), color: colorScheme.onSurface.withValues(alpha: 0.4)),
            SizedBox(height: r.gap),
            Text(
              lang.t(cat.emptyKey),
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(16)),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: r.padV),
            FilledButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const UploadScreen())),
              icon: const Icon(Icons.add_rounded),
              label: Text(lang.t('library.uploadFirst')),
              style: FilledButton.styleFrom(backgroundColor: colorScheme.primary, padding: EdgeInsets.symmetric(horizontal: r.padH, vertical: r.padV * 0.8)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImagesGrid(List<FileItem> items, ThemeProvider theme, LanguageProvider lang, Color cardColor, ColorScheme colorScheme) {
    final auth = context.read<AuthService>();
    final token = auth.token ?? '';
    final r = Responsive.of(context);
    const crossAxisCount = 2;
    final spacing = r.gapS;
    final paddingH = r.padH;
    final width = (r.safeWidth - paddingH * 2 - spacing * (crossAxisCount - 1)) / crossAxisCount;

    return RefreshIndicator(
      onRefresh: () => _loadCategory('images', skipCache: true),
      color: colorScheme.primary,
      child: GridView.builder(
        padding: EdgeInsets.symmetric(horizontal: paddingH, vertical: r.padV * 0.6),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          mainAxisSpacing: spacing,
          crossAxisSpacing: spacing,
          childAspectRatio: 0.85,
        ),
        itemCount: items.length,
        itemBuilder: (context, i) {
          final f = items[i];
          final imageUrl = '${ApiClient.fileUrl(f.category, f.fileId)}?token=$token';
          return GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => ImageViewerScreen(imageUrl: imageUrl, title: f.displayTitle),
              ),
            ),
            onLongPress: () => _showFileActionSheet(f, theme, lang, cardColor, colorScheme),
            child: Card(
              clipBehavior: Clip.antiAlias,
              margin: EdgeInsets.zero,
              color: cardColor,
              child: Image.network(
                imageUrl,
                fit: BoxFit.cover,
                width: width,
                height: width / 0.85,
                errorBuilder: (_, __, ___) => Container(
                  color: colorScheme.surfaceContainerHighest,
                  child: Icon(Icons.broken_image_outlined, size: r.iconSize(40), color: colorScheme.onSurface.withValues(alpha: 0.5)),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDocumentsGrid(List<FileItem> items, ThemeProvider theme, LanguageProvider lang, Color cardColor, ColorScheme colorScheme) {
    final r = Responsive.of(context);
    const crossAxisCount = 2;
    final spacing = r.gapS;
    final paddingH = r.padH;

    return RefreshIndicator(
      onRefresh: () => _loadCategory('documents', skipCache: true),
      color: colorScheme.primary,
      child: GridView.builder(
        padding: EdgeInsets.symmetric(horizontal: paddingH, vertical: r.padV * 0.6),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          mainAxisSpacing: spacing,
          crossAxisSpacing: spacing,
          childAspectRatio: 0.72,
        ),
        itemCount: items.length,
        itemBuilder: (context, i) {
          final f = items[i];
          return GestureDetector(
            onTap: () => _openFileUrl(f),
            onLongPress: () => _showFileActionSheet(f, theme, lang, cardColor, colorScheme),
            child: Card(
              margin: EdgeInsets.zero,
              color: cardColor,
              child: Padding(
                padding: EdgeInsets.all(r.gapS),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_iconForMime(f.mimeType), size: r.iconSize(40), color: colorScheme.primary.withValues(alpha: 0.9)),
                    SizedBox(height: r.gapS),
                    Text(
                      f.displayTitle,
                      style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(13), fontWeight: FontWeight.w500),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.center,
                    ),
                    if (f.size != null) ...[
                      SizedBox(height: r.gapS * 0.5),
                      Text(
                        _formatSize(f.size!),
                        style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6), fontSize: r.sp(11)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFileList(String category, List<FileItem> items, ThemeProvider theme, LanguageProvider lang, Color cardColor, ColorScheme colorScheme) {
    return RefreshIndicator(
      onRefresh: () => _loadCategory(category, skipCache: true),
      color: colorScheme.primary,
      child: ListView.builder(
        padding: EdgeInsets.symmetric(vertical: Responsive.of(context).padV * 0.6, horizontal: Responsive.of(context).padH),
        itemCount: items.length,
        itemBuilder: (context, i) => _fileTile(items[i], theme, lang, cardColor, colorScheme),
      ),
    );
  }

  Widget _fileTile(FileItem f, ThemeProvider theme, LanguageProvider lang, Color cardColor, ColorScheme colorScheme) {
    final r = Responsive.of(context);
    return Card(
      margin: EdgeInsets.only(bottom: r.gapS),
      color: cardColor,
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: r.gapS, vertical: r.gapS * 1.2),
        leading: CircleAvatar(
          backgroundColor: colorScheme.surfaceContainerHighest,
          child: Icon(_iconForCategory(f.category), color: colorScheme.onSurface.withValues(alpha: 0.8)),
        ),
        title: Text(
          f.displayTitle,
          style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(15)),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: f.size != null
            ? Text(
                _formatSize(f.size!),
                style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6), fontSize: r.sp(12)),
              )
            : null,
        trailing: Icon(Icons.open_in_new_rounded, size: r.iconSize(20), color: colorScheme.primary),
        onTap: () => _openFileUrl(f),
        onLongPress: () => _showFileActionSheet(f, theme, lang, cardColor, colorScheme),
      ),
    );
  }

  IconData _iconForCategory(String cat) {
    switch (cat) {
      case 'images': return Icons.image_rounded;
      case 'documents': return Icons.description_rounded;
      case 'archives': return Icons.folder_zip_rounded;
      case 'executables': return Icons.settings_applications_rounded;
      default: return Icons.insert_drive_file_rounded;
    }
  }

  IconData _iconForMime(String? mimeType) {
    if (mimeType == null) return Icons.description_rounded;
    if (mimeType.contains('pdf')) return Icons.picture_as_pdf_rounded;
    if (mimeType.contains('word') || mimeType.contains('document')) return Icons.description_rounded;
    if (mimeType.contains('excel') || mimeType.contains('sheet')) return Icons.table_chart_rounded;
    if (mimeType.contains('powerpoint') || mimeType.contains('presentation')) return Icons.slideshow_rounded;
    if (mimeType.contains('text')) return Icons.text_snippet_rounded;
    return Icons.attach_file_rounded;
  }

  String _formatSize(int bytes) {
    if (bytes < 1024) return '$bytes o';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} Ko';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} Mo';
  }
}
