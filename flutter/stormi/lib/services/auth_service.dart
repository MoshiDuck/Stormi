import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:google_sign_in/google_sign_in.dart';

import '../models/config_response.dart';
import '../models/user.dart' as stormi_models;
import 'api_client.dart';

const _storageKeyToken = 'stormi_jwt_token';
const _storageKeyUserId = 'stormi_user_id';

class AuthState {
  final ConfigResponse? config;
  final String? token;
  final stormi_models.User? user;
  final bool loading;
  final String? error;

  const AuthState({
    this.config,
    this.token,
    this.user,
    this.loading = false,
    this.error,
  });

  bool get isAuthenticated => token != null && token!.isNotEmpty;
  bool get hasGoogleAuth => config?.hasGoogleAuth ?? false;
}

class AuthService extends ChangeNotifier {
  AuthService({ApiClient? apiClient})
      : _api = apiClient ?? ApiClient(),
        _storage = const FlutterSecureStorage();

  final ApiClient _api;
  final FlutterSecureStorage _storage;

  AuthState _state = const AuthState(loading: true);
  AuthState get state => _state;
  ConfigResponse? get config => _state.config;
  String? get token => _state.token;
  stormi_models.User? get user => _state.user;
  bool get isAuthenticated => _state.isAuthenticated;

  Future<void> init() async {
    _setState(_state.copyWith(loading: true, error: null));
    try {
      final config = await _api.getConfig();
      final token = await _storage.read(key: _storageKeyToken);
      stormi_models.User? user;
      if (token != null && token.isNotEmpty) {
        final userId = await _storage.read(key: _storageKeyUserId);
        if (userId != null) user = stormi_models.User(id: userId);
      }
      _setState(AuthState(
        config: config,
        token: token,
        user: user,
        loading: false,
      ));
    } catch (e, st) {
      debugPrint('AuthService.init error: $e $st');
      _setState(_state.copyWith(loading: false, error: e.toString()));
    }
  }

  Future<void> signInWithGoogle() async {
    if (!_state.hasGoogleAuth) {
      _setState(_state.copyWith(
          error: 'Google Sign-In non configuré côté serveur.'));
      return;
    }
    _setState(_state.copyWith(loading: true, error: null));
    try {
      final googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
        serverClientId: _state.config!.googleClientId,
      );
      final account = await googleSignIn.signIn();
      if (account == null) {
        _setState(_state.copyWith(loading: false));
        return;
      }
      final auth = await account.authentication;
      final idToken = auth.idToken;
      final accessToken = auth.accessToken;
      if (idToken == null || idToken.isEmpty) {
        _setState(_state.copyWith(
            loading: false, error: 'Token Google absent.'));
        return;
      }
      await FirebaseAuth.instance.signInWithCredential(
        GoogleAuthProvider.credential(
          idToken: idToken,
          accessToken: accessToken,
        ),
      );
      final authResponse = await _api.authWithGoogle(idToken);
      if (!authResponse.success || authResponse.token == null) {
        await FirebaseAuth.instance.signOut();
        _setState(_state.copyWith(
          loading: false,
          error: authResponse.error ?? 'Échec de la connexion.',
        ));
        return;
      }
      await _storage.write(key: _storageKeyToken, value: authResponse.token);
      if (authResponse.user != null) {
        await _storage.write(
            key: _storageKeyUserId, value: authResponse.user!.id);
      }
      _setState(AuthState(
        config: _state.config,
        token: authResponse.token,
        user: authResponse.user,
        loading: false,
      ));
    } catch (e, st) {
      debugPrint('AuthService.signInWithGoogle error: $e $st');
      try {
        await FirebaseAuth.instance.signOut();
      } catch (_) {}
      _setState(_state.copyWith(loading: false, error: e.toString()));
    }
  }

  Future<void> signOut() async {
    await _storage.delete(key: _storageKeyToken);
    await _storage.delete(key: _storageKeyUserId);
    try {
      await FirebaseAuth.instance.signOut();
    } catch (_) {}
    try {
      await GoogleSignIn().signOut();
    } catch (_) {}
    _setState(AuthState(config: _state.config, loading: false));
  }

  void _setState(AuthState s) {
    _state = s;
    notifyListeners();
  }
}

extension _AuthStateCopy on AuthState {
  AuthState copyWith({
    ConfigResponse? config,
    String? token,
    stormi_models.User? user,
    bool? loading,
    String? error,
  }) {
    return AuthState(
      config: config ?? this.config,
      token: token ?? this.token,
      user: user ?? this.user,
      loading: loading ?? this.loading,
      error: error ?? this.error,
    );
  }
}
