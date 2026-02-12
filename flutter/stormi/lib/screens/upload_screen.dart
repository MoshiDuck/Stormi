import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';

/// Upload de fichiers (portrait du site) : sélection + envoi vers /api/upload.
/// [showBackButton] false quand affiché comme onglet dans la nav (comme le site).
class UploadScreen extends StatefulWidget {
  const UploadScreen({super.key, this.showBackButton = true});

  final bool showBackButton;

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  bool _uploading = false;
  String _status = '';
  int _current = 0;
  int _total = 0;
  String? _error;

  Future<void> _pickAndUpload() async {
    final auth = context.read<AuthService>();
    final api = context.read<ApiClient>();
    final user = auth.user;
    if (user?.id == null) {
      setState(() => _error = 'Non connecté');
      return;
    }

    final result = await FilePicker.platform.pickFiles(allowMultiple: true);
    if (result == null || result.files.isEmpty) {
      setState(() {
        _error = null;
        _status = '';
      });
      return;
    }

    setState(() {
      _error = null;
      _uploading = true;
      _total = result.files.length;
      _current = 0;
      _status = '0 / $_total';
    });

    int done = 0;
    String? lastError;
    for (final pf in result.files) {
      final path = pf.path;
      if (path == null || path.isEmpty) continue;
      final file = File(path);
      if (!await file.exists()) continue;

      if (!mounted) return;
      setState(() => _status = '${done + 1} / $_total');

      final uploadResult = await api.uploadFile(file, user!.id!);
      if (!uploadResult.success && uploadResult.error != null) {
        lastError = uploadResult.error;
      }
      done++;
      if (mounted) setState(() => _current = done);
    }

    if (!mounted) return;
    setState(() {
      _uploading = false;
      _status = '';
      _error = lastError;
    });

    if (lastError == null && done > 0) {
      final userId = user!.id!;
      await context.read<CacheService>().invalidateAllForUser(userId);
      context.read<CacheInvalidationNotifier>().invalidateAfterUpload(userId, '');
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(context.read<LanguageProvider>().t('upload.success')),
            backgroundColor: Colors.green,
          ),
        );
      }
    } else if (lastError != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${context.read<LanguageProvider>().t('upload.error')}: $lastError'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final bg = theme.themeData.scaffoldBackgroundColor;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('upload.title'), style: TextStyle(color: colorScheme.onSurface)),
        leading: widget.showBackButton
            ? IconButton(
                icon: const Icon(Icons.arrow_back_rounded),
                onPressed: () => Navigator.of(context).pop(),
              )
            : null,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 16),
              GestureDetector(
                onTap: _uploading ? null : _pickAndUpload,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: colorScheme.primary.withValues(alpha: 0.5),
                      width: 2,
                      strokeAlign: BorderSide.strokeAlignInside,
                    ),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.cloud_upload_rounded,
                        size: 64,
                        color: colorScheme.primary.withValues(alpha: 0.9),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        lang.t('upload.dragDrop'),
                        style: TextStyle(
                          color: colorScheme.onSurface,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        lang.t('upload.dragDropOr'),
                        style: TextStyle(
                          color: colorScheme.onSurface.withValues(alpha: 0.7),
                          fontSize: 14,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
              if (_uploading) ...[
                const SizedBox(height: 24),
                LinearProgressIndicator(
                  value: _total > 0 ? _current / _total : null,
                  backgroundColor: colorScheme.surface,
                  valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary),
                ),
                const SizedBox(height: 8),
                Text(
                  '${lang.t('upload.uploading')} $_status',
                  style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 14),
                ),
              ],
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _uploading ? null : _pickAndUpload,
                icon: const Icon(Icons.upload_file_rounded),
                label: Text(_uploading ? lang.t('upload.uploading') : lang.t('upload.pick')),
                style: FilledButton.styleFrom(
                  backgroundColor: colorScheme.primary,
                  foregroundColor: colorScheme.onPrimary,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
              ),
              if (_error != null) ...[
                const SizedBox(height: 16),
                Text(
                  _error!,
                  style: TextStyle(color: colorScheme.error, fontSize: 13),
                  textAlign: TextAlign.center,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
