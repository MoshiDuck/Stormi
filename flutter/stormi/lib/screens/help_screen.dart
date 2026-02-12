import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';

/// Centre d'aide — portrait du site : FAQ (upload, stockage) + Contact.
class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('help.title'), style: TextStyle(color: colorScheme.onSurface)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang.t('help.title'),
              style: TextStyle(color: colorScheme.onSurface, fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              lang.t('help.subtitle'),
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 16),
            ),
            const SizedBox(height: 32),
            Text(
              lang.t('help.faqTitle'),
              style: TextStyle(color: colorScheme.onSurface, fontSize: 18, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 16),
            _faqCard(context, theme, lang, lang.t('help.faqUpload'), lang.t('help.faqUploadAnswer')),
            const SizedBox(height: 12),
            _faqCard(context, theme, lang, lang.t('help.faqStorage'), lang.t('help.faqStorageAnswer')),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: theme.themeData.cardTheme.color ?? colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: theme.themeData.dividerColor),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lang.t('help.contactTitle'),
                    style: TextStyle(color: colorScheme.onSurface, fontSize: 18, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    lang.t('help.contactText'),
                    style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 14, height: 1.5),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _faqCard(
    BuildContext context,
    ThemeProvider theme,
    LanguageProvider lang,
    String title,
    String answer,
  ) {
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surfaceContainerHighest;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: theme.themeData.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(color: colorScheme.onSurface, fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          Text(
            answer,
            style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 14, height: 1.5),
          ),
        ],
      ),
    );
  }
}
