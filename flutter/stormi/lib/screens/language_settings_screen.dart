import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/responsive.dart';

/// Langue : FR, EN, ES, DE (portrait du site, persisté).
class LanguageSettingsScreen extends StatelessWidget {
  const LanguageSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>();
    final theme = context.watch<ThemeProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final bg = theme.themeData.scaffoldBackgroundColor;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    final r = Responsive.of(context);

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('language.title'), style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.all(r.padH),
        children: [
          _LangTile(
            code: AppLanguage.fr,
            label: lang.t('language.fr'),
            selected: lang.language == AppLanguage.fr,
            onTap: () => lang.setLanguage(AppLanguage.fr),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            primary: colorScheme.primary,
          ),
          SizedBox(height: r.gapS),
          _LangTile(
            code: AppLanguage.en,
            label: lang.t('language.en'),
            selected: lang.language == AppLanguage.en,
            onTap: () => lang.setLanguage(AppLanguage.en),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            primary: colorScheme.primary,
          ),
          SizedBox(height: r.gapS),
          _LangTile(
            code: AppLanguage.es,
            label: lang.t('language.es'),
            selected: lang.language == AppLanguage.es,
            onTap: () => lang.setLanguage(AppLanguage.es),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            primary: colorScheme.primary,
          ),
          SizedBox(height: r.gapS),
          _LangTile(
            code: AppLanguage.de,
            label: lang.t('language.de'),
            selected: lang.language == AppLanguage.de,
            onTap: () => lang.setLanguage(AppLanguage.de),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            primary: colorScheme.primary,
          ),
        ],
      ),
    );
  }
}

class _LangTile extends StatelessWidget {
  final AppLanguage code;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color cardColor;
  final Color textColor;
  final Color primary;

  const _LangTile({
    required this.code,
    required this.label,
    required this.selected,
    required this.onTap,
    required this.cardColor,
    required this.textColor,
    required this.primary,
  });

  @override
  Widget build(BuildContext context) {
    final r = Responsive.of(context);
    return Card(
      color: cardColor,
      child: ListTile(
        title: Text(label, style: TextStyle(color: textColor, fontSize: r.sp(16))),
        trailing: selected ? Icon(Icons.check_rounded, color: primary, size: r.iconSize(24)) : null,
        onTap: onTap,
      ),
    );
  }
}
