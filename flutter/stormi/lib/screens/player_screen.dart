import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:video_player/video_player.dart';

import '../services/api_client.dart';
import '../services/auth_service.dart';

/// Lecteur vidéo/audio plein écran (portrait du site reader). Sauvegarde la progression si fileId/userId fournis.
class PlayerScreen extends StatefulWidget {
  const PlayerScreen({
    super.key,
    required this.streamUrl,
    required this.title,
    this.isVideo = true,
    this.fileId,
    this.userId,
    this.initialPositionSeconds = 0,
  });

  final String streamUrl;
  final String title;
  final bool isVideo;
  final String? fileId;
  final String? userId;
  final double initialPositionSeconds;

  @override
  State<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends State<PlayerScreen> {
  late VideoPlayerController _controller;
  String? _error;
  bool _hasSeekedToInitial = false;

  @override
  void initState() {
    super.initState();
    _controller = VideoPlayerController.networkUrl(Uri.parse(widget.streamUrl))
      ..initialize().then((_) {
        if (!mounted) return;
        if (widget.initialPositionSeconds > 0 && !_hasSeekedToInitial) {
          _hasSeekedToInitial = true;
          _controller.seekTo(Duration(milliseconds: (widget.initialPositionSeconds * 1000).round()));
        }
        setState(() {});
        _controller.play();
      }).catchError((Object e) {
        if (mounted) setState(() => _error = e.toString());
      });
  }

  Future<void> _saveProgress() async {
    if (widget.fileId == null || widget.userId == null) return;
    if (!_controller.value.isInitialized) return;
    final duration = _controller.value.duration.inMilliseconds / 1000.0;
    final position = _controller.value.position.inMilliseconds / 1000.0;
    if (duration <= 0) return;
    try {
      await context.read<ApiClient>().saveWatchProgress(
            widget.fileId!,
            widget.userId!,
            position,
            duration,
          );
    } catch (_) {}
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onBack() async {
    await _saveProgress();
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black54,
        foregroundColor: Colors.white,
        title: Text(
          widget.title,
          style: const TextStyle(color: Colors.white, fontSize: 16),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => _onBack(),
        ),
      ),
      body: Center(
        child: _error != null
            ? Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.error_outline, size: 48, color: colorScheme.error),
                    const SizedBox(height: 16),
                    Text(_error!, textAlign: TextAlign.center, style: TextStyle(color: colorScheme.error)),
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Fermer'),
                    ),
                  ],
                ),
              )
            : _controller.value.isInitialized
                ? AspectRatio(
                    aspectRatio: _controller.value.aspectRatio,
                    child: VideoPlayer(_controller),
                  )
                : const CircularProgressIndicator(color: Colors.white),
      ),
    );
  }
}
