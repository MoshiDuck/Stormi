import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/auth_service.dart';
import '../utils/responsive.dart';

/// Page de connexion (portrait du site : thème + langue).
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final bg = theme.themeData.scaffoldBackgroundColor;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    final r = Responsive.of(context);
    final maxW = (r.safeWidth * 0.95).clamp(320.0, 400.0);

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.all(r.padH),
            child: ConstrainedBox(
              constraints: BoxConstraints(maxWidth: maxW),
              child: Consumer<AuthService>(
                builder: (context, auth, _) {
                  if (auth.state.loading && auth.state.config == null) {
                    return Center(
                      child: CircularProgressIndicator(color: colorScheme.primary),
                    );
                  }
                  final error = auth.state.error;
                  final hasGoogle = auth.state.hasGoogleAuth;
                  return Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(r.padH * 2),
                    decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(r.radius),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.5),
                          blurRadius: r.gap,
                          offset: Offset(0, r.gapS * 0.5),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Stormi',
                          style: TextStyle(
                            fontSize: r.sp(28),
                            fontWeight: FontWeight.bold,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        SizedBox(height: r.gapS),
                        Text(
                          lang.t('login.subtitle'),
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: r.sp(16),
                            color: colorScheme.onSurface.withValues(alpha: 0.8),
                            height: 1.4,
                          ),
                        ),
                        SizedBox(height: r.padV),
                        if (error != null) ...[
                          Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: r.gapS, vertical: r.padV * 0.5),
                            decoration: BoxDecoration(
                              color: colorScheme.errorContainer,
                              borderRadius: BorderRadius.circular(r.radius * 0.7),
                            ),
                            child: Text(
                              error,
                              style: TextStyle(
                                color: colorScheme.error,
                                fontSize: r.sp(14),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          SizedBox(height: r.padV * 0.7),
                        ],
                        if (hasGoogle) ...[
                          Text(
                            lang.t('login.google'),
                            style: TextStyle(
                              fontSize: r.sp(15),
                              color: colorScheme.onSurface.withValues(alpha: 0.8),
                            ),
                          ),
                          SizedBox(height: r.padV * 0.7),
                          SizedBox(
                            width: double.infinity,
                            height: r.hp(6).clamp(44.0, 56.0),
                            child: FilledButton.icon(
                              onPressed: auth.state.loading
                                  ? null
                                  : () => auth.signInWithGoogle(),
                              icon: auth.state.loading
                                  ? SizedBox(
                                      width: r.iconSize(22),
                                      height: r.iconSize(22),
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: colorScheme.onPrimary,
                                      ),
                                    )
                                  : Icon(Icons.login, size: r.iconSize(22)),
                              label: Text(
                                auth.state.loading
                                    ? lang.t('login.connecting')
                                    : lang.t('login.google'),
                                style: TextStyle(
                                  fontSize: r.sp(16),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              style: FilledButton.styleFrom(
                                backgroundColor: colorScheme.primary,
                                foregroundColor: colorScheme.onPrimary,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(r.radius * 0.7),
                                ),
                              ),
                            ),
                          ),
                        ] else
                          Text(
                            lang.t('login.configError'),
                            style: TextStyle(
                              color: colorScheme.onSurface.withValues(alpha: 0.8),
                              fontSize: r.sp(14),
                            ),
                            textAlign: TextAlign.center,
                          ),
                        SizedBox(height: r.padV),
                        Container(
                          padding: EdgeInsets.only(top: r.padV * 0.7),
                          decoration: BoxDecoration(
                            border: Border(
                              top: BorderSide(color: theme.themeData.dividerColor),
                            ),
                          ),
                          child: Text(
                            lang.t('login.terms'),
                            style: TextStyle(
                              fontSize: r.sp(12),
                              color: colorScheme.onSurface.withValues(alpha: 0.6),
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
