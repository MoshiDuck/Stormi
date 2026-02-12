import 'user.dart';

class AuthResponse {
  final bool success;
  final String? token;
  final User? user;
  final String? error;

  const AuthResponse({
    required this.success,
    this.token,
    this.user,
    this.error,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'] as bool? ?? false,
      token: json['token'] as String?,
      user: json['user'] != null
          ? User.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      error: json['error'] as String?,
    );
  }
}
