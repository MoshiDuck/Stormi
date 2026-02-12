import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/auth_response.dart';
import '../models/config_response.dart';
import '../models/file_item.dart';
import '../models/stats.dart';
import '../models/streaming_profile.dart';
import '../models/watch_progress.dart';

class ApiClient {
  final String _baseUrl = AppConfig.apiBaseUrl;
  String? _token;

  void setToken(String? token) => _token = token;

  Map<String, String> get _authHeaders {
    if (_token == null || _token!.isEmpty) return {};
    return {'Authorization': 'Bearer $_token'};
  }

  Future<ConfigResponse> getConfig() async {
    final uri = Uri.parse('$_baseUrl/api/config');
    final response = await http.get(uri).timeout(
      const Duration(seconds: 10),
      onTimeout: () =>
          throw Exception('Délai dépassé. Vérifiez votre connexion.'),
    );
    if (response.statusCode != 200) throw Exception('Config: ${response.statusCode}');
    return ConfigResponse.fromJson(
        jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<AuthResponse> authWithGoogle(String idToken) async {
    final uri = Uri.parse('$_baseUrl/api/auth/google');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'idToken': idToken}),
    ).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    return AuthResponse.fromJson(
        jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<Stats> getStats(String userId) async {
    final uri = Uri.parse('$_baseUrl/api/stats?userId=$userId');
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) throw Exception('Stats: ${response.statusCode}');
    return Stats.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }

  Future<List<FileItem>> getFiles(String userId, {String? category}) async {
    var uri = Uri.parse('$_baseUrl/api/upload/user/$userId');
    if (category != null && category.isNotEmpty) {
      uri = uri.replace(queryParameters: {'category': category});
    }
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) throw Exception('Fichiers: ${response.statusCode}');
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final list = data['files'] as List<dynamic>? ?? [];
    return list.map((e) => FileItem.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<WatchProgress>> getWatchProgress(String userId) async {
    final uri = Uri.parse('$_baseUrl/api/watch-progress/user/$userId');
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) throw Exception('Progression: ${response.statusCode}');
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final list = data['progressions'] as List<dynamic>? ?? [];
    return list.map((e) => WatchProgress.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Récupère la progression pour un fichier (GET /api/watch-progress/:fileId). Portrait du site.
  Future<WatchProgress?> getWatchProgressForFile(String fileId) async {
    final uri = Uri.parse('$_baseUrl/api/watch-progress/$fileId');
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) return null;
    final body = jsonDecode(response.body);
    if (body == null) return null;
    return WatchProgress.fromJson(body as Map<String, dynamic>);
  }

  /// Sauvegarde la progression de lecture (POST /api/watch-progress/:fileId). Portrait du site.
  Future<void> saveWatchProgress(String fileId, String userId, double currentTime, double duration) async {
    final uri = Uri.parse('$_baseUrl/api/watch-progress/$fileId');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({
        'current_time': currentTime,
        'duration': duration,
        'user_id': userId,
      }),
    ).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) {
      final body = response.body;
      try {
        final data = jsonDecode(body) as Map<String, dynamic>;
        throw Exception(data['error'] as String? ?? 'HTTP ${response.statusCode}');
      } catch (_) {
        throw Exception(body.isNotEmpty ? body : 'HTTP ${response.statusCode}');
      }
    }
  }

  static String fileUrl(String category, String fileId) =>
      '${AppConfig.apiBaseUrl}/api/files/$category/$fileId';

  static String thumbnailUrl(String category, String fileId, {String? extension}) {
    if (extension != null) return '${AppConfig.apiBaseUrl}/api/files/$category/$fileId/thumbnail.$extension';
    return '${AppConfig.apiBaseUrl}/api/files/$category/$fileId/thumbnail.jpg';
  }

  /// Upload d’un fichier (POST multipart /api/upload). Portrait du site.
  /// Si [basicMetadata] est fourni (titre, artiste, album, année), le serveur l’utilise pour TMDB/Spotify.
  Future<UploadResult> uploadFile(
    File file,
    String userId, {
    void Function(double)? onProgress,
    Map<String, dynamic>? basicMetadata,
  }) async {
    final uri = Uri.parse('$_baseUrl/api/upload');
    final request = http.MultipartRequest('POST', uri);
    request.headers.addAll(_authHeaders);
    final basename = file.path.split(Platform.pathSeparator).last;
    // Log pour diagnostic catégorie (extension = images/documents/etc.)
    debugPrint('[UPLOAD] path=${file.path} basename=$basename extension=${basename.contains('.') ? basename.split('.').last : 'none'}');
    request.fields['userId'] = userId;
    request.fields['filename'] = basename;
    // Secours: en-tête au cas où le champ form n'est pas reçu (ex. Workers)
    request.headers['X-Upload-Filename'] = basename;
    if (basicMetadata != null && basicMetadata.isNotEmpty) {
      request.fields['basicMetadata'] = jsonEncode(basicMetadata);
    }
    request.files.add(await http.MultipartFile.fromPath(
      'file',
      file.path,
      filename: basename,
    ));

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final success = data['success'] == true;
      final fileData = data['file'] as Map<String, dynamic>?;
      return UploadResult(
        success: success,
        fileId: fileData?['id'] as String?,
        url: fileData?['url'] as String?,
        exists: fileData?['exists'] == true,
        error: success ? null : (data['error'] as String? ?? 'Unknown error'),
      );
    }
    final body = response.body;
    try {
      final data = jsonDecode(body) as Map<String, dynamic>;
      return UploadResult(success: false, error: data['error'] as String? ?? 'HTTP ${response.statusCode}');
    } catch (_) {
      return UploadResult(success: false, error: body.isNotEmpty ? body : 'HTTP ${response.statusCode}');
    }
  }

  /// Supprime un fichier (DELETE /api/files/:category/:fileId). Portrait du site.
  Future<void> deleteFile(String userId, String category, String fileId) async {
    final uri = Uri.parse('$_baseUrl/api/files/$category/$fileId').replace(
      queryParameters: {'userId': userId},
    );
    final response = await http.delete(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200 && response.statusCode != 204) {
      final body = response.body;
      try {
        final data = jsonDecode(body) as Map<String, dynamic>;
        throw Exception(data['error'] as String? ?? 'HTTP ${response.statusCode}');
      } catch (_) {
        throw Exception(body.isNotEmpty ? body : 'HTTP ${response.statusCode}');
      }
    }
  }

  // --- Profils (portrait du site /api/profiles) ---
  Future<List<StreamingProfile>> getProfiles() async {
    final uri = Uri.parse('$_baseUrl/api/profiles');
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) throw Exception('Profils: ${response.statusCode}');
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final list = data['profiles'] as List<dynamic>? ?? [];
    return list.map((e) => StreamingProfile.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<StreamingProfile> postProfile({required String name, bool isChild = false}) async {
    final uri = Uri.parse('$_baseUrl/api/profiles');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'name': name, 'is_child': isChild}),
    ).timeout(const Duration(seconds: 15), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 201) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Création profil: ${response.statusCode}');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return StreamingProfile.fromJson(data['profile'] as Map<String, dynamic>);
  }

  Future<StreamingProfile> patchProfile(String id, {String? name, String? pin}) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/$id');
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (pin != null) body['pin'] = pin;
    final response = await http.patch(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 15), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Modification: ${response.statusCode}');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return StreamingProfile.fromJson(data['profile'] as Map<String, dynamic>);
  }

  Future<void> deleteProfile(String id, {required String pin}) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/$id');
    final response = await http.delete(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'pin': pin}),
    ).timeout(const Duration(seconds: 15), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Suppression: ${response.statusCode}');
    }
  }

  /// Réordonner les profils (POST /api/profiles/reorder). profileIds = ordre souhaité.
  Future<void> reorderProfiles(List<String> profileIds) async {
    if (profileIds.isEmpty) return;
    final uri = Uri.parse('$_baseUrl/api/profiles/reorder');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'profileIds': profileIds}),
    ).timeout(const Duration(seconds: 15), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Réordre: ${response.statusCode}');
    }
  }

  /// Profils qui ont une restriction pour un item (GET /api/profiles/restrictions-for-item).
  Future<List<String>> getRestrictionsForItem(String scope, String reference) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/restrictions-for-item').replace(
      queryParameters: {'scope': scope, 'reference': reference},
    );
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Restrictions: ${response.statusCode}');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final list = data['profileIds'] as List<dynamic>? ?? [];
    return list.map((e) => e.toString()).toList();
  }

  /// Masquer un contenu pour un profil (POST /api/profiles/:id/restrictions).
  Future<void> addProfileRestriction(String profileId, String scope, String reference) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/$profileId/restrictions');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'scope': scope, 'reference': reference}),
    ).timeout(const Duration(seconds: 10), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Ajout restriction: ${response.statusCode}');
    }
  }

  /// Réafficher un contenu pour un profil (DELETE /api/profiles/:id/restrictions).
  Future<void> removeProfileRestriction(String profileId, String scope, String reference) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/$profileId/restrictions');
    final response = await http.delete(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'scope': scope, 'reference': reference}),
    ).timeout(const Duration(seconds: 10), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Suppression restriction: ${response.statusCode}');
    }
  }

  Future<bool> getPinStatus() async {
    final uri = Uri.parse('$_baseUrl/api/profiles/pin/status');
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 10),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) return false;
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['hasPin'] as bool? ?? false;
  }

  Future<void> setPin(String pin) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/pin/set');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'pin': pin}),
    ).timeout(const Duration(seconds: 10), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Définir PIN: ${response.statusCode}');
    }
  }

  Future<bool> verifyPin(String pin) async {
    final uri = Uri.parse('$_baseUrl/api/profiles/pin/verify');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode({'pin': pin}),
    ).timeout(const Duration(seconds: 10), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) return false;
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['valid'] as bool? ?? false;
  }

  /// Infos d’un fichier (GET /api/files/:category/:fileId/info). Pour la page Match.
  Future<Map<String, dynamic>> getFileInfo(String category, String fileId) async {
    final uri = Uri.parse('$_baseUrl/api/files/$category/$fileId/info');
    final response = await http.get(uri, headers: _authHeaders).timeout(
      const Duration(seconds: 15),
      onTimeout: () => throw Exception('Délai dépassé.'),
    );
    if (response.statusCode != 200) throw Exception('Fichier: ${response.statusCode}');
    return jsonDecode(response.body) as Map<String, dynamic>;
  }

  /// Enregistrer les métadonnées d’un fichier (POST /api/files/:fileId/metadata). Page Match.
  Future<void> saveFileMetadata(String fileId, Map<String, dynamic> metadata) async {
    final uri = Uri.parse('$_baseUrl/api/files/$fileId/metadata');
    final response = await http.post(
      uri,
      headers: {..._authHeaders, 'Content-Type': 'application/json'},
      body: jsonEncode(metadata),
    ).timeout(const Duration(seconds: 15), onTimeout: () => throw Exception('Délai dépassé.'));
    if (response.statusCode != 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      throw Exception(data['error'] as String? ?? 'Sauvegarde: ${response.statusCode}');
    }
  }
}

class UploadResult {
  final bool success;
  final String? fileId;
  final String? url;
  final bool exists;
  final String? error;

  UploadResult({required this.success, this.fileId, this.url, this.exists = false, this.error});
}
