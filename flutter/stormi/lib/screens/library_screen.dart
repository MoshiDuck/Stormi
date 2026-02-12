import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/file_item.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';

class _CategoryTab {
  final String key;
  final String labelKey;
  final IconData icon;
  const _CategoryTab(this.key, this.labelKey, this.icon);
}

const _categories = [
  _CategoryTab('images', 'library.images', Icons.image_rounded),
  _CategoryTab('documents', 'library.documents', Icons.description_rounded),
  _CategoryTab('archives', 'library.archives', Icons.folder_zip_rounded),
  _CategoryTab('executables', 'library.executables', Icons.settings_applications_rounded),
  _CategoryTab('others', 'library.others', Icons.folder_rounded),
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
        title: Text(lang.t('library.title'), style: TextStyle(color: colorScheme.onSurface)),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorColor: colorScheme.primary,
          labelColor: colorScheme.onSurface,
          unselectedLabelColor: colorScheme.onSurface.withValues(alpha: 0.6),
          tabs: _categories.map((c) => Tab(icon: Icon(c.icon, size: 22), text: lang.t(c.labelKey))).toList(),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: _categories.map((c) => _buildCategoryList(c.key, theme, lang)).toList(),
      ),
    );
  }

  Widget _buildCategoryList(String category, ThemeProvider theme, LanguageProvider lang) {
    final loading = _loading[category] ?? false;
    final error = _errors[category];
    final items = _cache[category] ?? [];
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;

    if (loading && items.isEmpty) {
      return Center(child: CircularProgressIndicator(color: colorScheme.primary));
    }
    if (error != null && items.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: colorScheme.error),
              const SizedBox(height: 16),
              Text(error, textAlign: TextAlign.center, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8))),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () => _loadCategory(category, skipCache: true),
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
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.folder_open, size: 64, color: colorScheme.onSurface.withValues(alpha: 0.4)),
            const SizedBox(height: 16),
            Text(
              lang.t('library.emptyFiles'),
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: 16),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () => _loadCategory(category, skipCache: true),
      color: colorScheme.primary,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        itemCount: items.length,
        itemBuilder: (context, i) => _fileTile(items[i], theme, colorScheme, cardColor),
      ),
    );
  }

  Widget _fileTile(FileItem f, ThemeProvider theme, ColorScheme colorScheme, Color cardColor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      color: cardColor,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: colorScheme.surfaceContainerHighest,
          child: Icon(_iconForCategory(f.category), color: colorScheme.onSurface.withValues(alpha: 0.8)),
        ),
        title: Text(
          f.displayTitle,
          style: TextStyle(color: colorScheme.onSurface, fontSize: 14),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: f.size != null
            ? Text(
                _formatSize(f.size!),
                style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.6), fontSize: 12),
              )
            : null,
        trailing: Icon(Icons.arrow_forward_ios, size: 14, color: colorScheme.onSurface.withValues(alpha: 0.5)),
        onTap: () {
          // TODO: ouvrir / télécharger
        },
      ),
    );
  }

  IconData _iconForCategory(String cat) {
    switch (cat) {
      case 'images': return Icons.image;
      case 'documents': return Icons.description;
      case 'archives': return Icons.folder_zip;
      case 'executables': return Icons.settings_applications;
      default: return Icons.insert_drive_file;
    }
  }

  String _formatSize(int bytes) {
    if (bytes < 1024) return '$bytes o';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} Ko';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} Mo';
  }
}
