import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../l10n/app_strings.dart' as l10n;

/// Langues supportées (alignées sur le site).
enum AppLanguage { fr, en, es, de }

extension AppLanguageExt on AppLanguage {
  String get code {
    switch (this) {
      case AppLanguage.fr: return 'fr';
      case AppLanguage.en: return 'en';
      case AppLanguage.es: return 'es';
      case AppLanguage.de: return 'de';
    }
  }
}

class LanguageProvider extends ChangeNotifier {
  static const String _key = 'stormi_language';
  AppLanguage _language = AppLanguage.fr;

  AppLanguage get language => _language;
  String get languageCode => _language.code;

  LanguageProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == 'en') _language = AppLanguage.en;
    if (raw == 'es') _language = AppLanguage.es;
    if (raw == 'de') _language = AppLanguage.de;
    notifyListeners();
  }

  Future<void> setLanguage(AppLanguage lang) async {
    if (_language == lang) return;
    _language = lang;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, lang.code);
    notifyListeners();
  }

  /// Traduction pour la clé (ex. "nav.home").
  String t(String key) => l10n.t(languageCode, key);
}

/// Accès rapide à t() depuis un BuildContext.
String tr(BuildContext context, String key) {
  return context.read<LanguageProvider>().t(key);
}
