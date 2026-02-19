class AuthResponse {
  AuthResponse({
    required this.user,
    this.accessToken,
    this.refreshToken,
  });

  final UserModel user;
  final String? accessToken;
  final String? refreshToken;

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String?,
      refreshToken: json['refreshToken'] as String?,
    );
  }
}

class UserModel {
  UserModel({
    required this.id,
    this.name,
    this.email,
    this.phone,
    this.role = 'USER',
  });

  final String id;
  final String? name;
  final String? email;
  final String? phone;
  final String role;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      role: json['role'] as String? ?? 'USER',
    );
  }
}
