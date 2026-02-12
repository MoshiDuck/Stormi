class User {
  final String id;
  final String? email;
  final String? name;
  final String? picture;
  final bool? emailVerified;

  const User({
    required this.id,
    this.email,
    this.name,
    this.picture,
    this.emailVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final ev = json['email_verified'];
    final bool? emailVerified = ev == null
        ? null
        : (ev is bool ? ev : (ev == true || ev == 'true' || ev == 1));
    return User(
      id: json['id'] as String,
      email: json['email'] as String?,
      name: json['name'] as String?,
      picture: json['picture'] as String?,
      emailVerified: emailVerified,
    );
  }
}
