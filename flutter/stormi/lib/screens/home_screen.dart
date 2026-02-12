import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/auth_service.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF121212),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1a1a1a),
        title: const Text('Stormi', style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthService>().signOut(),
            tooltip: 'Déconnexion',
          ),
        ],
      ),
      body: Consumer<AuthService>(
        builder: (context, auth, _) {
          final user = auth.user;
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (user?.picture != null)
                    CircleAvatar(
                      radius: 40,
                      backgroundImage: NetworkImage(user!.picture!),
                    )
                  else
                    CircleAvatar(
                      radius: 40,
                      child: Text(
                        (user?.name?.isNotEmpty == true)
                            ? user!.name!.substring(0, 1).toUpperCase()
                            : '?',
                        style: Theme.of(context).textTheme.headlineMedium,
                      ),
                    ),
                  const SizedBox(height: 16),
                  Text(
                    user?.name ?? 'Utilisateur',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (user?.email != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      user!.email!,
                      style: const TextStyle(
                        color: Color(0xFFa8a8a8),
                        fontSize: 14,
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  const Text(
                    'Bienvenue sur Stormi. Vos médias vous attendent.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFFd1d1d1),
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
