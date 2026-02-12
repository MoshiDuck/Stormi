import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/responsive.dart';

/// Lecteur local — fichiers sur l’appareil (portrait du site). Bientôt disponible.
class LocalPlayerScreen extends StatelessWidget {
  const LocalPlayerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('nav.localPlayer'), style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18))),
      ),
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(r.padH),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.monitor_rounded,
                size: r.iconSize(64),
                color: colorScheme.primary.withValues(alpha: 0.7),
              ),
              SizedBox(height: r.padV),
              Text(
                lang.t('nav.localPlayer'),
                style: TextStyle(
                  color: colorScheme.onSurface,
                  fontSize: r.sp(20),
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: r.gapS),
              Text(
                lang.t('community.comingSoon'),
                style: TextStyle(
                  color: colorScheme.onSurface.withValues(alpha: 0.7),
                  fontSize: r.sp(16),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
