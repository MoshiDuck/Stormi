import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';
import '../models/auth_response.dart';
import '../models/config_response.dart';

class ApiClient {
  final String _baseUrl = AppConfig.apiBaseUrl;

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
}
