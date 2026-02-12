import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Thèmes alignés sur le site web : light, dark, grey.
enum StormiThemeId { light, dark, grey }

class ThemeProvider extends ChangeNotifier {
  static const String _key = 'stormi_theme';
  StormiThemeId _themeId = StormiThemeId.dark;

  StormiThemeId get themeId => _themeId;

  ThemeProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == 'light') _themeId = StormiThemeId.light;
    if (raw == 'grey') _themeId = StormiThemeId.grey;
    // default dark
    notifyListeners();
  }

  Future<void> setThemeId(StormiThemeId id) async {
    if (_themeId == id) return;
    _themeId = id;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, id.name);
    notifyListeners();
  }

  /// ThemeData pour MaterialApp (portrait du site : couleurs web).
  ThemeData get themeData {
    switch (_themeId) {
      case StormiThemeId.light:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          scaffoldBackgroundColor: const Color(0xFFf5f5f5),
          colorScheme: ColorScheme.light(
            primary: const Color(0xFF1a73e8),
            surface: const Color(0xFFffffff),
            onSurface: const Color(0xFF1a1a1a),
            secondary: const Color(0xFF4a4a4a),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFFffffff),
            foregroundColor: Color(0xFF1a1a1a),
            elevation: 0,
          ),
          cardTheme: CardThemeData(
            color: const Color(0xFFffffff),
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          listTileTheme: const ListTileThemeData(
            textColor: Color(0xFF1a1a1a),
            iconColor: Color(0xFF4a4a4a),
          ),
          dividerColor: const Color(0xFFdadce0),
        );
      case StormiThemeId.grey:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF2d2d2d),
          colorScheme: ColorScheme.dark(
            primary: const Color(0xFF5c7cfa),
            surface: const Color(0xFF3d3d3d),
            onSurface: const Color(0xFFe8e8e8),
            secondary: const Color(0xFFb8b8b8),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF3d3d3d),
            foregroundColor: Color(0xFFe8e8e8),
            elevation: 0,
          ),
          cardTheme: CardThemeData(
            color: const Color(0xFF3d3d3d),
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          listTileTheme: const ListTileThemeData(
            textColor: Color(0xFFe8e8e8),
            iconColor: Color(0xFFb8b8b8),
          ),
          dividerColor: const Color(0xFF4a4a4a),
        );
      case StormiThemeId.dark:
      default:
        return ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0a0a0a),
          colorScheme: ColorScheme.dark(
            primary: const Color(0xFF4285f4),
            surface: const Color(0xFF1a1a1a),
            onSurface: Colors.white,
            secondary: const Color(0xFFd1d1d1),
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF1a1a1a),
            foregroundColor: Colors.white,
            elevation: 0,
          ),
          cardTheme: CardThemeData(
            color: const Color(0xFF1a1a1a),
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          listTileTheme: const ListTileThemeData(
            textColor: Colors.white,
            iconColor: Color(0xFFa8a8a8),
          ),
          dividerColor: const Color(0xFF3a3a3a),
        );
    }
  }

  Color get navBarColor {
    switch (_themeId) {
      case StormiThemeId.light:
        return const Color(0xFFffffff);
      case StormiThemeId.grey:
        return const Color(0xFF383838);
      case StormiThemeId.dark:
      default:
        return const Color(0xFF151515);
    }
  }

  Color get navIconColor => themeData.colorScheme.primary;
  Color get navIconColorInactive {
    switch (_themeId) {
      case StormiThemeId.light:
        return const Color(0xFF9e9e9e);
      case StormiThemeId.grey:
        return const Color(0xFF909090);
      default:
        return const Color(0xFF888888);
    }
  }
}
