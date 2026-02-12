import 'dart:io';

import 'package:audio_metadata_reader/audio_metadata_reader.dart';

/// Extensions reconnues pour tenter une lecture de métadonnées (audio + vidéo MP4/M4A).
const _audioVideoExtensions = {
  'mp3', 'm4a', 'flac', 'ogg', 'wav', 'aac', 'opus', 'mp4', 'm4v',
};

/// Extrait les métadonnées de base (ID3 / MP4) pour les envoyer au serveur.
/// Le serveur les utilise pour TMDB (vidéos) et Spotify (musiques).
/// Retourne null en cas d'erreur ou si le format n'est pas supporté.
Future<Map<String, dynamic>?> getBasicMetadataForUpload(File file) async {
  final name = file.path.split(RegExp(r'[/\\]')).last;
  final ext = name.contains('.') ? name.split('.').last.toLowerCase() : '';
  if (!_audioVideoExtensions.contains(ext)) return null;
  try {
    final meta = readMetadata(file, getImage: false);
    final year = meta.year != null ? meta.year!.year : null;
    if (year != null && (year < 1900 || year > 2100)) return null;
    final title = meta.title?.trim();
    final artist = meta.artist?.trim();
    final album = meta.album?.trim();
    if (title == null && artist == null && album == null && year == null) {
      return null;
    }
    return <String, dynamic>{
      if (title != null && title.isNotEmpty) 'title': title,
      if (artist != null && artist.isNotEmpty) 'artist': artist,
      if (album != null && album.isNotEmpty) 'album': album,
      if (year != null) 'year': year,
    };
  } catch (_) {
    return null;
  }
}
