import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/cache_invalidation_notifier.dart';
import '../providers/language_provider.dart';
import '../providers/theme_provider.dart';
import '../services/auth_service.dart';
import '../utils/responsive.dart';
import 'upload_screen.dart';
import 'watch_screen.dart';
import 'music_screen.dart';
import 'library_screen.dart';
import 'local_player_screen.dart';
import 'profile_screen.dart';

class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;
  Timer? _refreshTimer;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_refreshTimer == null) {
      final userId = context.read<AuthService>().user?.id;
      if (userId != null) {
        final notifier = context.read<CacheInvalidationNotifier>();
        _refreshTimer = Timer.periodic(const Duration(minutes: 5), (_) {
          notifier.invalidateStats(userId);
        });
      }
    }
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  // Ordre : Regarder, Écouter, Bibliothèque, Ajouter, Lecteur local, Profil (plus d’accueil ; stats + communauté dans le profil)
  static const List<_NavItem> _tabs = [
    _NavItem(icon: Icons.movie_rounded, labelKey: 'nav.watch'),
    _NavItem(icon: Icons.music_note_rounded, labelKey: 'nav.music'),
    _NavItem(icon: Icons.folder_rounded, labelKey: 'nav.library'),
    _NavItem(icon: Icons.cloud_upload_rounded, labelKey: 'nav.add'),
    _NavItem(icon: Icons.monitor_rounded, labelKey: 'nav.localPlayer'),
    _NavItem(icon: Icons.person_rounded, labelKey: 'nav.profile'),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = context.watch<ThemeProvider>();
    final lang = context.watch<LanguageProvider>();
    final r = Responsive.of(context);
    final iconSize = r.iconSize(22);
    final fontSize = r.sp(10.5);
    final barPaddingH = r.wp(1).clamp(2, 10).toDouble();
    final barPaddingV = r.hp(0.8).clamp(4, 10).toDouble();
    final itemPaddingH = r.wp(1).clamp(2, 8).toDouble();
    final itemPaddingV = r.hp(0.6).clamp(4, 8).toDouble();

    return Scaffold(
      backgroundColor: theme.themeData.scaffoldBackgroundColor,
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          WatchScreen(),
          MusicScreen(),
          LibraryScreen(),
          UploadScreen(showBackButton: false),
          LocalPlayerScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: theme.navBarColor,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxHeight: r.navBarHeight),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: barPaddingH, vertical: barPaddingV),
              child: Center(
                child: ConstrainedBox(
                  constraints: BoxConstraints(maxWidth: r.maxContentWidth),
                  child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(_tabs.length, (i) {
                final item = _tabs[i];
                final selected = _currentIndex == i;
                final label = lang.t(item.labelKey);
                final activeColor = theme.navIconColor;
                final inactiveColor = theme.navIconColorInactive;
                return Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _currentIndex = i),
                    borderRadius: BorderRadius.circular(12),
                    child: Padding(
                      padding: EdgeInsets.symmetric(
                        horizontal: itemPaddingH,
                        vertical: itemPaddingV,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            item.icon,
                            size: iconSize,
                            color: selected ? activeColor : inactiveColor,
                          ),
                          SizedBox(height: r.gapS * 0.5),
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              label,
                              style: TextStyle(
                                fontSize: fontSize,
                                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                                color: selected ? activeColor : inactiveColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String labelKey;
  const _NavItem({required this.icon, required this.labelKey});
}
