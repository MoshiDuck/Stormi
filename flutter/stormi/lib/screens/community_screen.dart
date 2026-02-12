import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';

/// Page Communauté — portrait du site : Famille, Amis, Invitations, Partages, Conversations, Activité (i18n).
class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  /// Ordre identique au site : family, friends, invitations, shares, conversations, activity.
  static const List<({String titleKey, String subtitleKey, String descriptionKey, String icon})> _sections = [
    (titleKey: 'community.sectionFamilyTitle', subtitleKey: 'community.sectionFamilySubtitle', descriptionKey: 'community.sectionFamilyDescription', icon: '👨‍👩‍👧'),
    (titleKey: 'community.sectionFriendsTitle', subtitleKey: 'community.sectionFriendsSubtitle', descriptionKey: 'community.sectionFriendsDescription', icon: '👥'),
    (titleKey: 'community.sectionInvitationsTitle', subtitleKey: 'community.sectionInvitationsSubtitle', descriptionKey: 'community.sectionInvitationsDescription', icon: '✉️'),
    (titleKey: 'community.sectionSharesTitle', subtitleKey: 'community.sectionSharesSubtitle', descriptionKey: 'community.sectionSharesDescription', icon: '📁'),
    (titleKey: 'community.sectionConversationsTitle', subtitleKey: 'community.sectionConversationsSubtitle', descriptionKey: 'community.sectionConversationsDescription', icon: '💬'),
    (titleKey: 'community.sectionActivityTitle', subtitleKey: 'community.sectionActivitySubtitle', descriptionKey: 'community.sectionActivityDescription', icon: '🔄'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final colorScheme = theme.themeData.colorScheme;
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('community.title'), style: TextStyle(color: colorScheme.onSurface)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 8),
            Text(
              lang.t('community.subtitle'),
              textAlign: TextAlign.center,
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 16),
            ),
            const SizedBox(height: 24),
            ..._sections.map((s) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Card(
                    color: cardColor,
                    child: InkWell(
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(lang.t('community.comingSoon')), backgroundColor: cardColor),
                        );
                      },
                      borderRadius: BorderRadius.circular(12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.icon, style: const TextStyle(fontSize: 28)),
                            const SizedBox(height: 8),
                            Text(
                              lang.t(s.titleKey),
                              style: TextStyle(color: colorScheme.onSurface, fontSize: 18, fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              lang.t(s.subtitleKey),
                              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 13),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              lang.t(s.descriptionKey),
                              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: 14, height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                )),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: theme.themeData.cardTheme.color ?? colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: theme.themeData.dividerColor),
              ),
              child: Column(
                children: [
                  Text(
                    lang.t('community.description'),
                    textAlign: TextAlign.center,
                    style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: 14, height: 1.5),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    lang.t('community.comingSoon'),
                    style: TextStyle(color: colorScheme.primary, fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
