import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/responsive.dart';

/// Page affichée pour une route inconnue (404).
class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final r = Responsive.of(context);

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(r.padH),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline_rounded, size: r.iconSize(64), color: colorScheme.outline),
                SizedBox(height: r.gap),
                Text(
                  lang.t('errors.pageNotFound'),
                  style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(20), fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: r.gap),
                FilledButton.icon(
                  onPressed: () {
                    if (Navigator.of(context).canPop()) {
                      Navigator.of(context).pop();
                    }
                  },
                  icon: const Icon(Icons.arrow_back_rounded),
                  label: Text(lang.t('common.back')),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
