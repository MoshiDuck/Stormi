import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/auth_service.dart';

/// Page de connexion alignée sur le site stormi.uk (fond sombre, carte, bouton Google).
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  static const Color _bgPrimary = Color(0xFF121212);
  static const Color _bgCard = Color(0xFF1a1a1a);
  static const Color _textPrimary = Color(0xFFFFFFFF);
  static const Color _textSecondary = Color(0xFFd1d1d1);
  static const Color _textTertiary = Color(0xFFa8a8a8);
  static const Color _border = Color(0xFF3a3a3a);
  static const Color _accentBlue = Color(0xFF4285f4);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgPrimary,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Consumer<AuthService>(
                builder: (context, auth, _) {
                  if (auth.state.loading && auth.state.config == null) {
                    return const Center(
                      child: CircularProgressIndicator(color: _textPrimary),
                    );
                  }
                  final error = auth.state.error;
                  final hasGoogle = auth.state.hasGoogleAuth;
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(40),
                    decoration: BoxDecoration(
                      color: _bgCard,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.5),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Titre Stormi (style site)
                        Text(
                          'Stormi',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: _textPrimary,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          'Connectez-vous pour accéder à vos médias',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 16,
                            color: _textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 30),
                        if (error != null) ...[
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF3a1a1a),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              error,
                              style: const TextStyle(
                                color: Color(0xFFea4335),
                                fontSize: 14,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 20),
                        ],
                        if (hasGoogle) ...[
                          Text(
                            'Se connecter avec Google',
                            style: TextStyle(
                              fontSize: 15,
                              color: _textSecondary,
                            ),
                          ),
                          const SizedBox(height: 20),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: FilledButton.icon(
                              onPressed: auth.state.loading
                                  ? null
                                  : () => auth.signInWithGoogle(),
                              icon: auth.state.loading
                                  ? const SizedBox(
                                      width: 22,
                                      height: 22,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.login, size: 22),
                              label: Text(
                                auth.state.loading
                                    ? 'Connexion…'
                                    : 'Continuer avec Google',
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              style: FilledButton.styleFrom(
                                backgroundColor: _accentBlue,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ),
                        ] else
                          Text(
                            'Google Sign-In non configuré sur le serveur.',
                            style: TextStyle(
                              color: _textSecondary,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        const SizedBox(height: 30),
                        Container(
                          padding: const EdgeInsets.only(top: 20),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(color: _border),
                            ),
                          ),
                          child: Text(
                            'En vous connectant, vous acceptez les conditions d\'utilisation du service.',
                            style: TextStyle(
                              fontSize: 12,
                              color: _textTertiary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}
