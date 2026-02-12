/// Profil de type streaming (qui regarde). Portrait du site /api/profiles.
class StreamingProfile {
  final String id;
  final String accountId;
  final String name;
  final String? avatarUrl;
  final bool isMain;
  final bool isChild;
  final int sortOrder;
  final int createdAt;
  final int updatedAt;

  const StreamingProfile({
    required this.id,
    required this.accountId,
    required this.name,
    this.avatarUrl,
    this.isMain = false,
    this.isChild = false,
    this.sortOrder = 0,
    this.createdAt = 0,
    this.updatedAt = 0,
  });

  factory StreamingProfile.fromJson(Map<String, dynamic> json) {
    return StreamingProfile(
      id: json['id'] as String? ?? '',
      accountId: json['account_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      avatarUrl: json['avatar_url'] as String?,
      isMain: json['is_main'] == true || json['is_main'] == 1,
      isChild: json['is_child'] == true || json['is_child'] == 1,
      sortOrder: (json['sort_order'] as num?)?.toInt() ?? 0,
      createdAt: (json['created_at'] as num?)?.toInt() ?? 0,
      updatedAt: (json['updated_at'] as num?)?.toInt() ?? 0,
    );
  }
}
