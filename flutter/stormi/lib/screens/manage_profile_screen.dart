import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/auth_service.dart';
import '../services/cache_service.dart';
import '../utils/responsive.dart';
import 'theme_settings_screen.dart';
import 'language_settings_screen.dart';
import 'help_screen.dart';

/// Gérer le profil — portrait du site : Apparence, Langue, Données personnelles, Aide, Déconnexion.
class ManageProfileScreen extends StatelessWidget {
  const ManageProfileScreen({super.key});

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
        title: Text(lang.t('manage.title'), style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(18))),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: EdgeInsets.all(r.padH),
        children: [
          GestureDetector(
            onTap: () => Navigator.of(context).pop(),
            child: Padding(
              padding: EdgeInsets.only(bottom: r.gap),
              child: Text(
                '← ${lang.t('manage.backToProfile')}',
                style: TextStyle(color: colorScheme.primary, fontSize: r.sp(14), fontWeight: FontWeight.w500),
              ),
            ),
          ),
          Text(
            lang.t('manage.title'),
            style: TextStyle(color: colorScheme.onSurface, fontSize: r.sp(24), fontWeight: FontWeight.bold),
          ),
          SizedBox(height: r.gapS),
          Text(
            lang.t('manage.subtitle'),
            style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(15)),
          ),
          SizedBox(height: r.padV),
          _CardTile(
            icon: Icons.palette_outlined,
            title: lang.t('manage.appearance'),
            subtitle: lang.t('manage.appearanceSub'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ThemeSettingsScreen()),
            ),
            cardColor: cardColor,
            colorScheme: colorScheme,
          ),
          SizedBox(height: r.gapS),
          _CardTile(
            icon: Icons.language_rounded,
            title: lang.t('manage.language'),
            subtitle: lang.t('manage.languageSub'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const LanguageSettingsScreen()),
            ),
            cardColor: cardColor,
            colorScheme: colorScheme,
          ),
          SizedBox(height: r.gapS),
          _CardTile(
            icon: Icons.person_outline_rounded,
            title: lang.t('manage.personalData'),
            subtitle: lang.t('manage.personalDataSub'),
            onTap: () => Navigator.of(context).pop(),
            cardColor: cardColor,
            colorScheme: colorScheme,
          ),
          SizedBox(height: r.gapS),
          _CardTile(
            icon: Icons.help_outline_rounded,
            title: lang.t('manage.help'),
            subtitle: lang.t('manage.helpSub'),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const HelpScreen()),
            ),
            cardColor: cardColor,
            colorScheme: colorScheme,
          ),
          SizedBox(height: r.gapS),
          _LogoutCardTile(
            lang: lang,
            colorScheme: colorScheme,
            cardColor: cardColor,
            onLogout: () => _showLogoutDialog(context, lang, colorScheme, cardColor),
          ),
        ],
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, LanguageProvider lang, ColorScheme colorScheme, Color cardColor) {
    showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: cardColor,
        title: Text(lang.t('dialogs.logoutTitle'), style: TextStyle(color: colorScheme.onSurface)),
        content: Text(
          lang.t('dialogs.logoutMessage'),
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
    ).then((confirm) async {
      if (confirm == true && context.mounted) {
        await context.read<CacheService>().clearAll();
        if (context.mounted) context.read<CacheInvalidationNotifier>().clearOnLogout();
        if (context.mounted) context.read<AuthService>().signOut();
      }
    });
  }
}

class _LogoutCardTile extends StatelessWidget {
  final LanguageProvider lang;
  final ColorScheme colorScheme;
  final Color cardColor;
  final VoidCallback onLogout;

  const _LogoutCardTile({
    required this.lang,
    required this.colorScheme,
    required this.cardColor,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final r = Responsive.of(context);
    return Card(
      color: cardColor,
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: r.padH, vertical: r.gapS),
        leading: CircleAvatar(
          backgroundColor: colorScheme.errorContainer,
          child: Icon(Icons.logout_rounded, color: colorScheme.error),
        ),
        title: Text(lang.t('profile.logout'), style: TextStyle(color: colorScheme.onSurface, fontWeight: FontWeight.w500, fontSize: r.sp(16))),
        subtitle: Text(lang.t('dialogs.logoutMessage'), style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(13))),
        trailing: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface.withValues(alpha: 0.6)),
        onTap: onLogout,
      ),
    );
  }
}

class _CardTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final Color cardColor;
  final ColorScheme colorScheme;

  const _CardTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    required this.cardColor,
    required this.colorScheme,
  });

  @override
  Widget build(BuildContext context) {
    final r = Responsive.of(context);
    return Card(
      color: cardColor,
      child: ListTile(
        contentPadding: EdgeInsets.symmetric(horizontal: r.padH, vertical: r.gapS),
        leading: CircleAvatar(
          backgroundColor: colorScheme.surfaceContainerHighest,
          child: Icon(icon, color: colorScheme.primary),
        ),
        title: Text(title, style: TextStyle(color: colorScheme.onSurface, fontWeight: FontWeight.w500, fontSize: r.sp(16))),
        subtitle: Text(subtitle, style: TextStyle(color: colorScheme.onSurface.withValues(alpha: 0.7), fontSize: r.sp(13))),
        trailing: Icon(Icons.chevron_right_rounded, color: colorScheme.onSurface.withValues(alpha: 0.6)),
        onTap: onTap,
      ),
    );
  }
}
