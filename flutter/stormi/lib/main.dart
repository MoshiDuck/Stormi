import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'firebase_options.dart';
import 'providers/cache_invalidation_notifier.dart';
import 'providers/language_provider.dart';
import 'providers/theme_provider.dart';
import 'services/api_client.dart';
import 'services/auth_service.dart';
import 'services/cache_service.dart';
import 'screens/login_screen.dart';
import 'screens/main_shell.dart';
import 'screens/not_found_screen.dart';
import 'screens/select_profile_screen.dart';
import 'screens/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const StormiApp());
}

class StormiApp extends StatelessWidget {
  const StormiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiClient = ApiClient();
    final cacheService = CacheService();
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthService(apiClient: apiClient)..init()),
        ChangeNotifierProvider(create: (_) => CacheInvalidationNotifier()),
        Provider<ApiClient>.value(value: apiClient),
        Provider<CacheService>.value(value: cacheService),
      ],
      child: Consumer2<ThemeProvider, LanguageProvider>(
        builder: (context, theme, lang, _) {
          return MaterialApp(
            title: 'Stormi',
            debugShowCheckedModeBanner: false,
            theme: theme.themeData,
            locale: Locale(lang.languageCode),
            home: const _SplashThenAuthGate(),
            onUnknownRoute: (_) => MaterialPageRoute(builder: (_) => const NotFoundScreen()),
          );
        },
      ),
    );
  }
}

/// Affiche le splash puis le contenu selon l’auth (login, sélection profil, ou app).
class _SplashThenAuthGate extends StatefulWidget {
  const _SplashThenAuthGate();

  @override
  State<_SplashThenAuthGate> createState() => _SplashThenAuthGateState();
}

class _SplashThenAuthGateState extends State<_SplashThenAuthGate> {
  bool _splashDone = false;

  void _onSplashDone() {
    if (mounted) setState(() => _splashDone = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_splashDone) {
      return SplashScreen(onDone: _onSplashDone);
    }
    return const AuthGate();
  }
}

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, auth, _) {
        if (auth.state.loading && auth.state.config == null) {
          final theme = context.read<ThemeProvider>();
          return Scaffold(
            backgroundColor: theme.themeData.scaffoldBackgroundColor,
            body: Center(
              child: CircularProgressIndicator(color: theme.themeData.colorScheme.primary),
            ),
          );
        }
        if (auth.isAuthenticated) {
          if (!auth.hasSelectedProfile) {
            return const SelectProfileScreen();
          }
          return const MainShell();
        }
        return const LoginScreen();
      },
    );
  }
}
