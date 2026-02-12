import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import '../utils/responsive.dart';
import 'manage_profile_screen.dart';
import 'home_screen.dart';
import 'community_screen.dart';
import 'help_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

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
        title: Text(lang.t('profile.title'), style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18))),
      ),
      body: Consumer<AuthService>(
        builder: (context, auth, _) {
          final user = auth.user;
          return SingleChildScrollView(
            padding: EdgeInsets.all(r.padH),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: r.gapS),
                GestureDetector(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ManageProfileScreen())),
                  child: Text(
                    '${lang.t('profile.manage')} →',
                    style: TextStyle(color: colorScheme.primary, fontSize: r.sp(14), fontWeight: FontWeight.w500),
                  ),
                ),
                SizedBox(height: r.padV),
                Center(
                  child: CircleAvatar(
                    radius: r.wp(14).clamp(40, 56).toDouble(),
                    backgroundColor: colorScheme.surfaceContainerHighest,
                    backgroundImage: user?.picture != null && user!.picture!.isNotEmpty
                        ? NetworkImage(user.picture!)
                        : null,
                    child: user?.picture == null || user!.picture!.isEmpty
                        ? Text(
                            (user?.name?.isNotEmpty == true)
                                ? user!.name!.substring(0, 1).toUpperCase()
                                : '?',
                            style: TextStyle(fontSize: r.sp(32), color: colorScheme.onSurface),
                          )
                        : null,
                  ),
                ),
                SizedBox(height: r.gap),
                Center(
                  child: Text(
                    user?.name ?? lang.t('profile.title'),
                    style: TextStyle(
                      color: colorScheme.onSurface,
                      fontSize: r.sp(22),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Center(
                  child: Text(
                    lang.t('profile.subtitle'),
                    style: TextStyle(
                      color: colorScheme.onSurface.withValues(alpha: 0.7),
                      fontSize: r.sp(14),
                    ),
                  ),
                ),
                SizedBox(height: r.padV),
                _sectionTitle(lang.t('profile.personalInfo'), Icons.person_outline_rounded, colorScheme, r),
                SizedBox(height: r.gapS),
                _infoCard(
                  theme,
                  lang,
                  colorScheme,
                  [
                    _infoRow(lang.t('profile.fullName'), user?.name ?? lang.t('profile.notSpecified'), colorScheme, r),
                    _infoRow(lang.t('profile.emailLabel'), user?.email ?? lang.t('profile.notSpecified'), colorScheme, r),
                    if (user?.emailVerified != null)
                      _infoRow(
                        lang.t('profile.verificationStatus'),
                        user!.emailVerified! ? lang.t('profile.emailVerified') : lang.t('profile.emailNotVerified'),
                        colorScheme,
                        r,
                        isVerified: user.emailVerified,
                      ),
                    _infoRow(lang.t('profile.userId'), user?.id ?? '', colorScheme, r, monospace: true),
                  ],
                  r,
                ),
                SizedBox(height: r.padV),
                _sectionTitle(lang.t('profile.connectedAccount'), Icons.link_rounded, colorScheme, r),
                SizedBox(height: r.gapS),
                _connectedAccountCard(theme, lang, colorScheme, r),
                SizedBox(height: r.padV),
                Card(
                  color: cardColor,
                  child: Column(
                    children: [
                      ListTile(
                        leading: Icon(Icons.settings_rounded, color: colorScheme.primary),
                        title: Text(lang.t('profile.manage'), style: TextStyle(color: colorScheme.onSurface)),
                        trailing: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ManageProfileScreen())),
                      ),
                      Divider(height: 1, color: theme.themeData.dividerColor),
                      ListTile(
                        leading: Icon(Icons.bar_chart_rounded, color: colorScheme.onSurface.withValues(alpha: 0.8)),
                        title: Text(lang.t('profile.statistics'), style: TextStyle(color: colorScheme.onSurface)),
                        trailing: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HomeScreen(showAsStatisticsPage: true))),
                      ),
                      Divider(height: 1, color: theme.themeData.dividerColor),
                      ListTile(
                        leading: Icon(Icons.people_rounded, color: colorScheme.onSurface.withValues(alpha: 0.8)),
                        title: Text(lang.t('profile.community'), style: TextStyle(color: colorScheme.onSurface)),
                        trailing: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CommunityScreen())),
                      ),
                      Divider(height: 1, color: theme.themeData.dividerColor),
                      ListTile(
                        leading: Icon(Icons.help_outline_rounded, color: colorScheme.onSurface.withValues(alpha: 0.8)),
                        title: Text(lang.t('profile.help'), style: TextStyle(color: colorScheme.onSurface)),
                        trailing: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface.withValues(alpha: 0.6)),
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const HelpScreen())),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: r.padV),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () async {
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          backgroundColor: cardColor,
                          title: Text(lang.t('profile.logout'), style: TextStyle(color: colorScheme.onSurface)),
                          content: Text(
                            lang.t('profile.logoutConfirm'),
                            style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8)),
                          ),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.of(ctx).pop(false),
                              child: Text(lang.t('profile.cancel')),
                            ),
                            FilledButton(
                              onPressed: () => Navigator.of(ctx).pop(true),
                              style: FilledButton.styleFrom(backgroundColor: const Color(0xFFea4335)),
                              child: Text(lang.t('profile.logout')),
                            ),
                          ],
                        ),
                      );
                      if (confirm == true && context.mounted) {
                        await context.read<CacheService>().clearAll();
                        context.read<CacheInvalidationNotifier>().clearOnLogout();
                        if (context.mounted) context.read<AuthService>().signOut();
                      }
                    },
                    icon: const Icon(Icons.logout_rounded),
                    label: Text(lang.t('profile.logout')),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFFea4335),
                      side: const BorderSide(color: Color(0xFFea4335)),
                      padding: EdgeInsets.symmetric(vertical: r.padV * 0.7),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _sectionTitle(String title, IconData icon, ColorScheme colorScheme, Responsive r) {
    return Padding(
      padding: EdgeInsets.only(left: r.gapS),
      child: Row(
        children: [
          Icon(icon, size: r.iconSize(20), color: colorScheme.primary),
          SizedBox(width: r.gapS),
          Text(
            title,
            style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18), fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _infoCard(ThemeProvider theme, LanguageProvider lang, ColorScheme colorScheme, List<Widget> rows, Responsive r) {
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    return Card(
      color: cardColor,
      child: Padding(
        padding: EdgeInsets.all(r.padH),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: rows,
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value, ColorScheme colorScheme, Responsive r, {bool? isVerified, bool monospace = false}) {
    return Padding(
      padding: EdgeInsets.only(bottom: r.gapS),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: colorScheme.onSurface.withValues(alpha: 0.7),
              fontSize: r.sp(12),
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: r.gapS * 0.5),
          Text(
            value,
            style: TextStyle(
              color: isVerified == true ? const Color(0xFF34a853) : (isVerified == false ? const Color(0xFFea4335) : colorScheme.onSurface),
              fontSize: r.sp(monospace ? 13 : 15),
              fontFamily: monospace ? 'monospace' : null,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _connectedAccountCard(ThemeProvider theme, LanguageProvider lang, ColorScheme colorScheme, Responsive r) {
    final cardColor = theme.themeData.cardTheme.color ?? colorScheme.surface;
    final iconSize = r.iconSize(24);
    return Card(
      color: cardColor,
      child: Padding(
        padding: EdgeInsets.all(r.padH),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Image.network(
                  'https://www.google.com/favicon.ico',
                  width: iconSize,
                  height: iconSize,
                  errorBuilder: (_, __, ___) => Icon(Icons.link, size: iconSize, color: colorScheme.primary),
                ),
                SizedBox(width: r.gapS),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.t('profile.googleAccount'),
                        style: TextStyle(color: colorScheme.onSurface, fontWeight: FontWeight.w500, fontSize: r.sp(16)),
                      ),
                      Text(
                        lang.t('profile.connectedViaGoogle'),
                        style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(14)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: r.gapS),
            Container(
              padding: EdgeInsets.all(r.gapS),
              decoration: BoxDecoration(
                color: colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(r.radius * 0.7),
              ),
              child: Text(
                lang.t('profile.accountSecureHint'),
                style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.8), fontSize: r.sp(13)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
