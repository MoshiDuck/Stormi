import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../utils/responsive.dart';
import 'community_family_screen.dart';

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
    final r = Responsive.of(context);

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: theme.themeData.appBarTheme.backgroundColor,
        foregroundColor: theme.themeData.appBarTheme.foregroundColor,
        title: Text(lang.t('community.title'), style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(r.padH),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: r.gapS),
            Text(
              lang.t('community.subtitle'),
              textAlign: TextAlign.center,
              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(16)),
            ),
            SizedBox(height: r.padV),
            ..._sections.asMap().entries.map((entry) {
                  final index = entry.key;
                  final s = entry.value;
                  final isFamily = index == 0;
                  return Padding(
                    padding: EdgeInsets.only(bottom: r.gapS),
                    child: Card(
                      color: cardColor,
                      child: InkWell(
                        onTap: () {
                          if (isFamily) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const CommunityFamilyScreen()),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text(lang.t('community.comingSoon')), backgroundColor: cardColor),
                            );
                          }
                        },
                      borderRadius: BorderRadius.circular(r.radius),
                      child: Padding(
                        padding: EdgeInsets.all(r.padH),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.icon, style: TextStyle(fontSize: r.sp(28))),
                            SizedBox(height: r.gapS),
                            Text(
                              lang.t(s.titleKey),
                              style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18), fontWeight: FontWeight.w700),
                            ),
                            SizedBox(height: r.gapS * 0.5),
                            Text(
                              lang.t(s.subtitleKey),
                              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(13)),
                            ),
                            SizedBox(height: r.gapS * 0.75),
                            Text(
                              lang.t(s.descriptionKey),
                              style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(14), height: 1.4),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
            }),
            SizedBox(height: r.gap),
            Container(
              padding: EdgeInsets.all(r.padH),
              decoration: BoxDecoration(
                color: theme.themeData.cardTheme.color ?? colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(r.radius * 0.7),
                border: Border.all(color: theme.themeData.dividerColor),
              ),
              child: Column(
                children: [
                  Text(
                    lang.t('community.description'),
                    textAlign: TextAlign.center,
                    style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(14), height: 1.5),
                  ),
                  SizedBox(height: r.gapS),
                  Text(
                    lang.t('community.comingSoon'),
                    style: TextStyle(color: colorScheme.primary, fontSize: r.sp(13), fontWeight: FontWeight.w600),
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
