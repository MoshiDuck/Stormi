class User {
  final String id;
  final String? email;
  final String? name;
  final String? picture;

  const User({
    required this.id,
    this.email,
    this.name,
    this.picture,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String?,
      name: json['name'] as String?,
      picture: json['picture'] as String?,
    );
  }
}
