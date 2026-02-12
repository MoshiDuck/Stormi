class ConfigResponse {
  final String? googleClientId;

  const ConfigResponse({this.googleClientId});

  factory ConfigResponse.fromJson(Map<String, dynamic> json) {
    return ConfigResponse(
      googleClientId: json['googleClientId'] as String?,
    );
  }

  bool get hasGoogleAuth =>
      googleClientId != null && googleClientId!.isNotEmpty;
}
