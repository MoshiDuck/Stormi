import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/responsive.dart';

/// Centre d'aide — portrait du site : FAQ (upload, stockage) + Contact.
class HelpScreen extends StatelessWidget {
  const HelpScreen({super.key});

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
        title: Text(lang.t('help.title'), style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(r.padH),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              lang.t('help.title'),
              style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(24), fontWeight: FontWeight.bold),
            ),
            SizedBox(height: r.gapS),
            Text(
              lang.t('help.subtitle'),
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(16)),
            ),
            SizedBox(height: r.padV),
            Text(
              lang.t('help.faqTitle'),
              style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18), fontWeight: FontWeight.w600),
            ),
            SizedBox(height: r.gap),
            _faqCard(context, theme, lang, lang.t('help.faqUpload'), lang.t('help.faqUploadAnswer')),
            SizedBox(height: r.gapS),
            _faqCard(context, theme, lang, lang.t('help.faqStorage'), lang.t('help.faqStorageAnswer')),
            SizedBox(height: r.padV),
            Container(
              padding: EdgeInsets.all(r.padH),
              decoration: BoxDecoration(
                color: theme.themeData.cardTheme.color ?? colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(r.radius),
                border: Border.all(color: theme.themeData.dividerColor),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lang.t('help.contactTitle'),
                    style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18), fontWeight: FontWeight.w600),
                  ),
                  SizedBox(height: r.gapS),
                  Text(
                    lang.t('help.contactText'),
                    style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(14), height: 1.5),
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
    final r = Responsive.of(context);
    return Container(
      padding: EdgeInsets.all(r.padH),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(r.radius),
        border: Border.all(color: theme.themeData.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(16), fontWeight: FontWeight.w600),
          ),
          SizedBox(height: r.gapS),
          Text(
            answer,
            style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(14), height: 1.5),
          ),
        ],
      ),
    );
  }
}
