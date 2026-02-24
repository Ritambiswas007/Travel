import '../api_client.dart';

class UserService {
  UserService(this._client);
  final ApiClient _client;

  // Get my profile
  Future<Map<String, dynamic>?> getMyProfile() async {
    final res = await _client.get<Map<String, dynamic>>(
      '/users/me',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Update my profile
  Future<Map<String, dynamic>?> updateMyProfile({
    String? name,
    String? email,
    String? phone,
  }) async {
    final body = <String, dynamic>{};
    if (name != null) body['name'] = name;
    if (email != null) body['email'] = email;
    if (phone != null) body['phone'] = phone;

    final res = await _client.patch<Map<String, dynamic>>(
      '/users/me',
      body: body,
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
