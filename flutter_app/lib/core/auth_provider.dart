import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_client.dart';
import 'models/auth_model.dart';

class AuthProvider with ChangeNotifier {
  AuthProvider() : _client = ApiClient() {
    _storage = const FlutterSecureStorage();
  }

  final ApiClient _client;
  late final FlutterSecureStorage _storage;

  static const _keyAccessToken = 'access_token';
  static const _keyRefreshToken = 'refresh_token';
  static const _keyUserId = 'user_id';
  static const _keyUserName = 'user_name';
  static const _keyUserEmail = 'user_email';
  static const _keyUserRole = 'user_role';

  UserModel? _user;
  bool _isLoading = true;

  UserModel? get user => _user;
  bool get isLoggedIn => _user != null && (_client.accessToken != null && _client.accessToken!.isNotEmpty);
  bool get isLoading => _isLoading;
  ApiClient get apiClient => _client;

  Future<void> loadStoredAuth() async {
    _isLoading = true;
    notifyListeners();
    try {
      final accessToken = await _storage.read(key: _keyAccessToken);
      final userId = await _storage.read(key: _keyUserId);
      final name = await _storage.read(key: _keyUserName);
      final email = await _storage.read(key: _keyUserEmail);
      final role = await _storage.read(key: _keyUserRole);
      if (accessToken != null && accessToken.isNotEmpty && userId != null) {
        if (role == 'STAFF' || role == 'ADMIN') {
          _client.setAccessToken(accessToken);
          _user = UserModel(id: userId, name: name, email: email, role: role ?? 'STAFF');

          // Validate token on app startup; if invalid, try refresh once.
          final me = await _client.get<Map<String, dynamic>>(
            '/users/me',
            fromJson: (d) => d as Map<String, dynamic>,
          );
          if (!me.success) {
            final refreshed = await _tryRefreshToken();
            if (refreshed) {
              final me2 = await _client.get<Map<String, dynamic>>(
                '/users/me',
                fromJson: (d) => d as Map<String, dynamic>,
              );
              if (!me2.success) {
                await _clearStoredAuth(notify: false);
              }
            } else {
              await _clearStoredAuth(notify: false);
            }
          }
        } else {
          await _clearStoredAuth(notify: false);
        }
      }
    } catch (_) {}
    _isLoading = false;
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/login/email',
        body: {'email': email, 'password': password},
        fromJson: (d) => d as Map<String, dynamic>,
      );
      
      if (!res.success) {
        return res.error ?? 'Login failed';
      }
      
      if (res.data == null) {
        return 'Invalid response from server';
      }
      
      try {
        final auth = AuthResponse.fromJson(res.data!);
        
        // Only allow STAFF role login
        if (auth.user.role != 'STAFF' && auth.user.role != 'ADMIN') {
          return 'Access denied. This app is for staff members only.';
        }
        
        await _persistAuth(auth);
        _user = auth.user;
        _client.setAccessToken(auth.accessToken);
        notifyListeners();
        return null; // Success
      } catch (e) {
        return 'Failed to parse auth response: ${e.toString()}';
      }
    } catch (e) {
      return 'Network error: ${e.toString()}';
    }
  }

  /// Register a new STAFF account and log in.
  Future<String?> registerStaff({
    required String name,
    required String email,
    required String password,
  }) async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/register',
        body: {
          'name': name,
          'email': email,
          'password': password,
          'role': 'STAFF',
        },
        fromJson: (d) => d as Map<String, dynamic>,
      );

      if (!res.success) {
        return res.error ?? 'Registration failed';
      }

      // After successful registration, perform a normal login
      return await login(email, password);
    } catch (e) {
      return 'Network error: ${e.toString()}';
    }
  }

  /// Login with phone + OTP.
  Future<String?> loginWithPhone(String phone, String otp) async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/login/phone',
        body: {'phone': phone, 'otp': otp},
        fromJson: (d) => d as Map<String, dynamic>,
      );

      if (!res.success) {
        return res.error ?? 'Login failed';
      }
      if (res.data == null) {
        return 'Invalid response from server';
      }

      try {
        final auth = AuthResponse.fromJson(res.data!);
        if (auth.user.role != 'STAFF' && auth.user.role != 'ADMIN') {
          return 'Access denied. This app is for staff members only.';
        }
        await _persistAuth(auth);
        _user = auth.user;
        _client.setAccessToken(auth.accessToken);
        notifyListeners();
        return null;
      } catch (e) {
        return 'Failed to parse auth response: ${e.toString()}';
      }
    } catch (e) {
      return 'Network error: ${e.toString()}';
    }
  }

  /// Send OTP to email for login or other purposes.
  Future<String?> sendOtp(String email, {String purpose = 'login'}) async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/send-otp',
        body: {'email': email, 'purpose': purpose},
        fromJson: (d) => d as Map<String, dynamic>,
      );
      if (!res.success) {
        return res.error ?? 'Failed to send OTP';
      }
      return null;
    } catch (e) {
      return 'Network error: ${e.toString()}';
    }
  }

  Future<String?> forgotPassword(String email) async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/forgot-password',
        body: {'email': email},
        fromJson: (d) => d as Map<String, dynamic>,
      );
      if (!res.success) {
        return res.error ?? 'Failed to request reset';
      }
      return null;
    } catch (e) {
      return 'Network error: ${e.toString()}';
    }
  }

  Future<String?> resetPassword(String token, String newPassword) async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/reset-password',
        body: {'token': token, 'newPassword': newPassword},
        fromJson: (d) => d as Map<String, dynamic>,
      );
      if (!res.success) {
        return res.error ?? 'Failed to reset password';
      }
      return null;
    } catch (e) {
      return 'Network error: ${e.toString()}';
    }
  }

  Future<bool> _tryRefreshToken() async {
    try {
      final refreshToken = await _storage.read(key: _keyRefreshToken);
      if (refreshToken == null || refreshToken.isEmpty) return false;
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/refresh',
        body: {'refreshToken': refreshToken},
        fromJson: (d) => d as Map<String, dynamic>,
      );
      if (!res.success || res.data == null) return false;
      final next = res.data!['accessToken'] as String?;
      if (next == null || next.isEmpty) return false;
      await _storage.write(key: _keyAccessToken, value: next);
      _client.setAccessToken(next);
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<void> _persistAuth(AuthResponse auth) async {
    await _storage.write(key: _keyAccessToken, value: auth.accessToken);
    await _storage.write(key: _keyRefreshToken, value: auth.refreshToken);
    await _storage.write(key: _keyUserId, value: auth.user.id);
    await _storage.write(key: _keyUserName, value: auth.user.name);
    await _storage.write(key: _keyUserEmail, value: auth.user.email);
    await _storage.write(key: _keyUserRole, value: auth.user.role);
  }

  Future<void> logout() async {
    try {
      final refreshToken = await _storage.read(key: _keyRefreshToken);
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _client.post<Map<String, dynamic>>(
          '/auth/logout',
          body: {'refreshToken': refreshToken},
          fromJson: (d) => d as Map<String, dynamic>,
        );
      }
    } catch (_) {
      // ignore backend logout errors, still clear local state
    }
    await _clearStoredAuth(notify: true);
  }

  Future<String?> logoutAll() async {
    try {
      final res = await _client.post<Map<String, dynamic>>(
        '/auth/logout-all',
        fromJson: (d) => d as Map<String, dynamic>,
      );
      await _clearStoredAuth(notify: true);
      if (!res.success) {
        return res.error ?? 'Failed to logout from all devices';
      }
      return null;
    } catch (e) {
      await _clearStoredAuth(notify: true);
      return 'Network error: ${e.toString()}';
    }
  }

  Future<void> _clearStoredAuth({required bool notify}) async {
    await _storage.delete(key: _keyAccessToken);
    await _storage.delete(key: _keyRefreshToken);
    await _storage.delete(key: _keyUserId);
    await _storage.delete(key: _keyUserName);
    await _storage.delete(key: _keyUserEmail);
    await _storage.delete(key: _keyUserRole);
    _client.setAccessToken(null);
    _user = null;
    if (notify) {
      notifyListeners();
    }
  }
}
