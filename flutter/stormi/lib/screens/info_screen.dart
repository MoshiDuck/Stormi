import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/file_item.dart';
import '../models/watch_progress.dart';
import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import 'player_screen.dart';

/// Page détail d’un fichier (film / série / etc.).
class InfoScreen extends StatefulWidget {
  final String category;
  final String fileId;
  final FileItem? file;

  const InfoScreen({
    super.key,
    required this.category,
    required this.fileId,
    this.file,
  });

  @override
  State<InfoScreen> createState() => _InfoScreenState();
}

class _InfoScreenState extends State<InfoScreen> {
  WatchProgress? _watchProgress;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (widget.category == 'videos' && _watchProgress == null) {
      context.read<ApiClient>().getWatchProgressForFile(widget.fileId).then((p) {
        if (mounted) setState(() => _watchProgress = p);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final category = widget.category;
    final fileId = widget.fileId;
    final f = widget.file;
    final thumbUrl = f != null && (f.thumbnailUrl?.isNotEmpty == true)
        ? f.thumbnailUrl!
        : ApiClient.thumbnailUrl(category, fileId);

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: colorScheme.onSurface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  thumbUrl,
                  width: 280,
                  height: 400,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    width: 280,
                    height: 400,
                    color: colorScheme.surfaceContainerHighest,
                    child: Icon(Icons.broken_image, color: colorScheme.onSurface.withValues(alpha: 0.5), size: 64),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    f?.displayTitle ?? fileId,
                    style: TextStyle(color: colorScheme.onSurface, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  if (f?.year != null || f?.duration != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        if (f!.year != null) Text('${f.year}', style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8))),
                        if (f.duration != null) ...[
                          if (f.year != null) const SizedBox(width: 12),
                          Text(_formatDuration(f.duration!), style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8))),
                        ],
                      ],
                    ),
                  ],
                  if (f?.description?.isNotEmpty == true) ...[
                    const SizedBox(height: 16),
                    Text(
                      f!.description!,
                      style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.85), height: 1.5),
                      maxLines: 6,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 24),
                  if (_watchProgress != null && _watchProgress!.currentTime > 0) ...[
                    Text(
                      '${lang.t('info.resumeAt')} ${_formatDuration(_watchProgress!.currentTime.round())}',
                      style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                  ],
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: () => _play(context),
                      icon: const Icon(Icons.play_arrow_rounded),
                      label: Text(lang.t('info.play')),
                      style: FilledButton.styleFrom(
                        backgroundColor: colorScheme.primary,
                        foregroundColor: colorScheme.onPrimary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                  if (category == 'videos' || category == 'musics') ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: () => _delete(context),
                        icon: Icon(Icons.delete_outline_rounded, color: colorScheme.error),
                        label: Text(lang.t('common.delete'), style: TextStyle(color: colorScheme.error)),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: colorScheme.error),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _delete(BuildContext context) async {
    final lang = context.read<LanguageProvider>();
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(lang.t('common.delete')),
        content: Text(lang.t('dialogs.deleteConfirm')),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(lang.t('profile.cancel')),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Theme.of(ctx).colorScheme.error),
            child: Text(lang.t('common.delete')),
          ),
        ],
      ),
    );
    if (confirm != true || !context.mounted) return;
    final auth = context.read<AuthService>();
    final userId = auth.user?.id;
    if (userId == null) return;
    try {
      await context.read<ApiClient>().deleteFile(userId, widget.category, widget.fileId);
      await context.read<CacheService>().invalidateStats(userId);
      await context.read<CacheService>().invalidateFiles(userId, widget.category);
      context.read<CacheInvalidationNotifier>().invalidateAfterDelete(userId, widget.category);
      if (context.mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${lang.t('common.error')}: $e'), backgroundColor: Theme.of(context).colorScheme.errorContainer),
        );
      }
    }
  }

  String _formatDuration(int seconds) {
    if (seconds < 60) return '${seconds}s';
    final m = seconds ~/ 60;
    final s = seconds % 60;
    if (m >= 60) {
      final h = m ~/ 60;
      final min = m % 60;
      return '${h}h ${min}min';
    }
    return s > 0 ? '${m}min ${s}s' : '${m}min';
  }

  void _play(BuildContext context) {
    final auth = context.read<AuthService>();
    final token = auth.token;
    final userId = auth.user?.id;
    if (token == null) return;
    final url = '${ApiClient.fileUrl(widget.category, widget.fileId)}?token=$token';
    final title = widget.file?.displayTitle ?? widget.fileId;
    final isVideo = widget.category == 'videos';
    final initialPos = (widget.category == 'videos' && _watchProgress != null) ? _watchProgress!.currentTime : 0.0;
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => PlayerScreen(
          streamUrl: url,
          title: title,
          isVideo: isVideo,
          fileId: widget.category == 'videos' ? widget.fileId : null,
          userId: userId,
          initialPositionSeconds: initialPos,
        ),
      ),
    );
  }
}
