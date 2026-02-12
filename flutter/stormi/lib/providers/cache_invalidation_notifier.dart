import 'package:flutter/foundation.dart';

/// Notifier pour invalidation du cache (upload, suppression, déconnexion).
/// Les écrans écoutent et refetch.
class CacheInvalidationNotifier extends ChangeNotifier {
  void invalidateAfterUpload(String userId, String category) {
    notifyListeners();
  }

  void invalidateAfterDelete(String userId, String category) {
    notifyListeners();
  }

  void invalidateStats(String userId) {
    notifyListeners();
  }

  void clearOnLogout() {
    notifyListeners();
  }
}
