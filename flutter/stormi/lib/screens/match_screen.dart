import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import '../utils/responsive.dart';

/// Page d’identification d’un fichier (TMDB/Spotify) : saisie manuelle des métadonnées.
class MatchScreen extends StatefulWidget {
  final String category;
  final String fileId;

  const MatchScreen({
    super.key,
    required this.category,
    required this.fileId,
  });

  @override
  State<MatchScreen> createState() => _MatchScreenState();
}

class _MatchScreenState extends State<MatchScreen> {
  Map<String, dynamic>? _fileInfo;
  String? _loadError;
  bool _saving = false;
  String? _saveError;

  // Champs formulaire
  final _titleController = TextEditingController();
  final _yearController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _artistsController = TextEditingController();
  final _albumsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadFileInfo();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _yearController.dispose();
    _descriptionController.dispose();
    _artistsController.dispose();
    _albumsController.dispose();
    super.dispose();
  }

  Future<void> _loadFileInfo() async {
    setState(() {
      _fileInfo = null;
      _loadError = null;
    });
    try {
      final api = context.read<ApiClient>();
      final raw = await api.getFileInfo(widget.category, widget.fileId);
      final file = (raw['file'] as Map<String, dynamic>?) ?? raw;
      if (mounted) {
        setState(() => _fileInfo = file);
        _titleController.text = (file['title'] as String?) ?? '';
        _yearController.text = (file['year'] != null) ? '${file['year']}' : '';
        _descriptionController.text = (file['description'] as String?) ?? '';
        _artistsController.text = (file['artists'] is String)
            ? file['artists'] as String
            : (file['artists'] is List)
                ? (file['artists'] as List).join(', ')
                : '';
        _albumsController.text = (file['albums'] is String)
            ? file['albums'] as String
            : (file['albums'] is List)
                ? (file['albums'] as List).join(', ')
                : '';
      }
    } catch (e) {
      if (mounted) setState(() => _loadError = e.toString());
    }
  }

  Future<void> _save() async {
    setState(() {
      _saveError = null;
      _saving = true;
    });
    try {
      final metadata = <String, dynamic>{
        'title': _titleController.text.trim().isEmpty ? null : _titleController.text.trim(),
        'year': _yearController.text.trim().isEmpty ? null : int.tryParse(_yearController.text.trim()),
        'description': _descriptionController.text.trim().isEmpty ? null : _descriptionController.text.trim(),
      };
      if (widget.category == 'musics') {
        final artists = _artistsController.text.trim();
        final albums = _albumsController.text.trim();
        if (artists.isNotEmpty) metadata['artists'] = artists.contains(',') ? artists.split(',').map((s) => s.trim()).toList() : [artists];
        if (albums.isNotEmpty) metadata['albums'] = albums.contains(',') ? albums.split(',').map((s) => s.trim()).toList() : [albums];
      }
      await context.read<ApiClient>().saveFileMetadata(widget.fileId, metadata);
      final userId = context.read<AuthService>().user?.id;
      if (userId != null) {
        await context.read<CacheService>().invalidateFiles(userId, widget.category);
        await context.read<CacheService>().invalidateStats(userId);
      }
      if (mounted) {
        setState(() => _saving = false);
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) setState(() {
        _saveError = e.toString();
        _saving = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: colorScheme.onSurface,
        title: Text(lang.t('match.title')),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _loadError != null
          ? Center(
              child: Padding(
                padding: EdgeInsets.all(r.padH),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_loadError!, style: TextStyle(color: colorScheme.error, fontSize: r.sp(14)), textAlign: TextAlign.center),
                    SizedBox(height: r.gap),
                    FilledButton(onPressed: _loadFileInfo, child: Text(lang.t('common.retry'))),
                  ],
                ),
              ),
            )
          : _fileInfo == null
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                  padding: EdgeInsets.all(r.padH),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        lang.t('match.fileLabel') + ': ${_fileInfo!['filename'] ?? _fileInfo!['file_id'] ?? widget.fileId}',
                        style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(13)),
                      ),
                      SizedBox(height: r.gap),
                      TextField(
                        controller: _titleController,
                        decoration: InputDecoration(
                          labelText: 'Titre',
                          border: const OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                      SizedBox(height: r.gapS),
                      TextField(
                        controller: _yearController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: 'Année',
                          border: const OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                      if (widget.category == 'musics') ...[
                        SizedBox(height: r.gapS),
                        TextField(
                          controller: _artistsController,
                          decoration: const InputDecoration(
                            labelText: 'Artistes (séparés par des virgules)',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                        SizedBox(height: r.gapS),
                        TextField(
                          controller: _albumsController,
                          decoration: const InputDecoration(
                            labelText: 'Albums (séparés par des virgules)',
                            border: OutlineInputBorder(),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                      ],
                      SizedBox(height: r.gapS),
                      TextField(
                        controller: _descriptionController,
                        maxLines: 3,
                        decoration: InputDecoration(
                          labelText: 'Description',
                          border: const OutlineInputBorder(),
                        ),
                        onChanged: (_) => setState(() {}),
                      ),
                      if (_saveError != null) ...[
                        SizedBox(height: r.gapS),
                        Text(_saveError!, style: TextStyle(color: colorScheme.error, fontSize: r.sp(12))),
                      ],
                      SizedBox(height: r.gap),
                      FilledButton(
                        onPressed: _saving ? null : _save,
                        child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(lang.t('match.save')),
                      ),
                    ],
                  ),
                ),
    );
  }
}
