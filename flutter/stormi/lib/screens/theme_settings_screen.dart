import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';

/// Apparence : thème clair, sombre, gris (portrait du site, persisté).
class ThemeSettingsScreen extends StatelessWidget {
  const ThemeSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final bg = theme.themeData.scaffoldBackgroundColor;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;

    return Scaffold(
      backgroundColor: bg,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('theme.title'), style: TextStyle(color: colorScheme.onSurface)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _OptionTile(
            title: lang.t('theme.dark'),
            subtitle: theme.themeId == StormiThemeId.dark ? lang.t('theme.current') : null,
            selected: theme.themeId == StormiThemeId.dark,
            onTap: () => theme.setThemeId(StormiThemeId.dark),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            subtitleColor: colorScheme.onSurface.withValues(alpha: 0.6),
          ),
          const SizedBox(height: 8),
          _OptionTile(
            title: lang.t('theme.light'),
            subtitle: theme.themeId == StormiThemeId.light ? lang.t('theme.current') : null,
            selected: theme.themeId == StormiThemeId.light,
            onTap: () => theme.setThemeId(StormiThemeId.light),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            subtitleColor: colorScheme.onSurface.withValues(alpha: 0.6),
          ),
          const SizedBox(height: 8),
          _OptionTile(
            title: lang.t('theme.grey'),
            subtitle: theme.themeId == StormiThemeId.grey ? lang.t('theme.current') : null,
            selected: theme.themeId == StormiThemeId.grey,
            onTap: () => theme.setThemeId(StormiThemeId.grey),
            cardColor: cardColor,
            textColor: colorScheme.onSurface,
            subtitleColor: colorScheme.onSurface.withValues(alpha: 0.6),
          ),
        ],
      ),
    );
  }
}

class _OptionTile extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool selected;
  final VoidCallback onTap;
  final Color cardColor;
  final Color textColor;
  final Color subtitleColor;

  const _OptionTile({
    required this.title,
    this.subtitle,
    required this.selected,
    required this.onTap,
    required this.cardColor,
    required this.textColor,
    required this.subtitleColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final primary = theme.themeData.colorScheme.primary;

    return Card(
      color: cardColor,
      child: ListTile(
        title: Text(title, style: TextStyle(color: textColor)),
        subtitle: subtitle != null ? Text(subtitle!, style: TextStyle(color: subtitleColor)) : null,
        trailing: selected ? Icon(Icons.check_rounded, color: primary) : null,
        onTap: onTap,
      ),
    );
  }
}
