import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/file_item.dart';
import '../models/stats.dart';

/// TTL en secondes (aligné sur le site).
class CacheTtl {
  static const int stats = 300; // 5 min
  static const int files = 3600; // 1 h
}

/// Cache local pour stats et listes de fichiers. Fallback stale en cas d'erreur réseau.
class CacheService {
  CacheService() {
    _init();
  }

  SharedPreferences? _prefs;
  final Map<String, _Entry<Stats>> _statsMemory = {};
  final Map<String, _Entry<List<FileItem>>> _filesMemory = {};

  Future<void> _init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  Future<SharedPreferences> get _p async {
    await _init();
    return _prefs!;
  }

  static String _statsKey(String userId) => 'stormi_cache_stats_$userId';
  static String _filesKey(String userId, String category) =>
      'stormi_cache_files_${userId}_$category';
  static String _tsKey(String key) => '${key}_ts';
  static String _ttlKey(String key) => '${key}_ttl';

  // ——— Stats ———

  Future<Stats?> getStats(String userId) async {
    final p = await _p;
    final key = _statsKey(userId);
    final ts = p.getInt(_tsKey(key));
    final ttl = p.getInt(_ttlKey(key)) ?? CacheTtl.stats;
    if (ts == null) return null;
    if (DateTime.now().millisecondsSinceEpoch - ts > ttl * 1000) return null;
    final raw = p.getString(key);
    if (raw == null) return null;
    try {
      return Stats.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<Stats?> getStatsStale(String userId) async {
    final p = await _p;
    final key = _statsKey(userId);
    final raw = p.getString(key);
    if (raw == null) return null;
    try {
      return Stats.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> setStats(String userId, Stats stats) async {
    final p = await _p;
    final key = _statsKey(userId);
    await p.setString(key, jsonEncode(stats.toJson()));
    await p.setInt(_tsKey(key), DateTime.now().millisecondsSinceEpoch);
    await p.setInt(_ttlKey(key), CacheTtl.stats);
  }

  Future<void> invalidateStats(String userId) async {
    final p = await _p;
    final key = _statsKey(userId);
    await p.remove(key);
    await p.remove(_tsKey(key));
    await p.remove(_ttlKey(key));
    _statsMemory.remove(key);
  }

  // ——— Files ———

  Future<List<FileItem>?> getFiles(String userId, String category) async {
    final p = await _p;
    final key = _filesKey(userId, category);
    final ts = p.getInt(_tsKey(key));
    final ttl = p.getInt(_ttlKey(key)) ?? CacheTtl.files;
    if (ts == null) return null;
    if (DateTime.now().millisecondsSinceEpoch - ts > ttl * 1000) return null;
    final raw = p.getString(key);
    if (raw == null) return null;
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list
          .map((e) => FileItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return null;
    }
  }

  Future<List<FileItem>?> getFilesStale(String userId, String category) async {
    final p = await _p;
    final key = _filesKey(userId, category);
    final raw = p.getString(key);
    if (raw == null) return null;
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list
          .map((e) => FileItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return null;
    }
  }

  Future<void> setFiles(
      String userId, String category, List<FileItem> files) async {
    final p = await _p;
    final key = _filesKey(userId, category);
    final encoded = files.map((f) => _fileItemToJson(f)).toList();
    await p.setString(key, jsonEncode(encoded));
    await p.setInt(_tsKey(key), DateTime.now().millisecondsSinceEpoch);
    await p.setInt(_ttlKey(key), CacheTtl.files);
  }

  Map<String, dynamic> _fileItemToJson(FileItem f) {
    return {
      'file_id': f.fileId,
      'category': f.category,
      'filename': f.filename,
      'size': f.size,
      'uploaded_at': f.uploadedAt,
      'thumbnail_url': f.thumbnailUrl,
      'thumbnail_r2_path': f.thumbnailR2Path,
      'backdrop_url': f.backdropUrl,
      'title': f.title,
      'year': f.year,
      'duration': f.duration,
      'season': f.season,
      'episode': f.episode,
      'genres': f.genres,
      'description': f.description,
      'artists': f.artists,
      'albums': f.albums,
      'album_thumbnails': f.albumThumbnails,
    };
  }

  Future<void> invalidateFiles(String userId, String category) async {
    final p = await _p;
    final key = _filesKey(userId, category);
    await p.remove(key);
    await p.remove(_tsKey(key));
    await p.remove(_ttlKey(key));
    _filesMemory.remove(key);
  }

  Future<void> invalidateAllForUser(String userId) async {
    await invalidateStats(userId);
    final p = await _p;
    final keys = p.getKeys().toList();
    for (final k in keys) {
      if (k.startsWith('stormi_cache_files_${userId}_')) {
        await p.remove(k);
        await p.remove(_tsKey(k));
        await p.remove(_ttlKey(k));
      }
    }
    _statsMemory.removeWhere((key, _) => key.contains(userId));
    _filesMemory.removeWhere((key, _) => key.contains(userId));
  }

  /// Vide tout le cache (déconnexion).
  Future<void> clearAll() async {
    final p = await _p;
    final keys = p.getKeys().toList();
    for (final k in keys) {
      if (k.startsWith('stormi_cache_')) await p.remove(k);
    }
    _statsMemory.clear();
    _filesMemory.clear();
  }
}

class _Entry<T> {
  final T data;
  final int timestamp;
  final int ttl;
  _Entry(this.data, this.timestamp, this.ttl);
}
