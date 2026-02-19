import 'dart:convert';
import 'package:http/http.dart' as http;
import 'config.dart';

class ApiClient {
  ApiClient({String? baseUrl, String? accessToken})
      : _baseUrl = baseUrl ?? AppConfig.baseUrl,
        _apiPrefix = AppConfig.apiPrefix,
        _accessToken = accessToken;

  final String _baseUrl;
  final String _apiPrefix;
  String? _accessToken;

  String get baseUrl => _baseUrl;
  String get apiPrefix => _apiPrefix;
  String? get accessToken => _accessToken;

  void setAccessToken(String? token) {
    _accessToken = token;
  }

  Uri _uri(String path, [Map<String, String>? queryParams]) {
    final uri = Uri.parse('$_baseUrl$_apiPrefix$path');
    if (queryParams != null && queryParams.isNotEmpty) {
      return uri.replace(queryParameters: queryParams);
    }
    return uri;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_accessToken != null && _accessToken!.isNotEmpty) 'Authorization': 'Bearer $_accessToken',
      };

  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, String>? queryParams,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await http.get(_uri(path, queryParams), headers: _headers).timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw Exception('Request timeout'),
      );
      return _handleResponse(response, fromJson);
    } catch (e) {
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }

  Future<ApiResponse<T>> post<T>(
    String path, {
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await http.post(
        _uri(path),
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw Exception('Request timeout'),
      );
      return _handleResponse(response, fromJson);
    } catch (e) {
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }

  Future<ApiResponse<T>> patch<T>(
    String path, {
    Map<String, dynamic>? body,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await http.patch(
        _uri(path),
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () => throw Exception('Request timeout'),
      );
      return _handleResponse(response, fromJson);
    } catch (e) {
      return ApiResponse.error('Network error: ${e.toString()}');
    }
  }

  ApiResponse<T> _handleResponse<T>(http.Response response, T Function(dynamic)? fromJson) {
    try {
      final decoded = response.body.isNotEmpty ? jsonDecode(response.body) : null;
      final data = decoded is Map ? decoded['data'] : decoded;
      final success = decoded is Map && (decoded['success'] == true);
      
      if (response.statusCode >= 200 && response.statusCode < 300 && success) {
        return ApiResponse(
          success: true,
          data: fromJson != null && data != null ? fromJson(data) : data as T?,
          statusCode: response.statusCode,
        );
      }
      
      // Handle error response
      String? errorMessage;
      if (decoded is Map) {
        if (decoded['message'] != null) {
          errorMessage = decoded['message'].toString();
        } else if (decoded['errors'] != null) {
          if (decoded['errors'] is List) {
            final errors = decoded['errors'] as List;
            if (errors.isNotEmpty) {
              final firstError = errors[0];
              if (firstError is Map && firstError['msg'] != null) {
                errorMessage = firstError['msg'].toString();
              } else {
                errorMessage = errors.map((e) => e.toString()).join(', ');
              }
            }
          } else {
            errorMessage = decoded['errors'].toString();
          }
        }
      }
      
      return ApiResponse(
        success: false,
        error: errorMessage ?? response.reasonPhrase ?? 'Request failed',
        statusCode: response.statusCode,
      );
    } catch (e) {
      return ApiResponse(
        success: false,
        error: 'Failed to parse response: ${e.toString()}',
        statusCode: response.statusCode,
      );
    }
  }
}

class ApiResponse<T> {
  ApiResponse({this.success = true, this.data, this.error, this.statusCode});

  factory ApiResponse.error(String message) => ApiResponse(success: false, error: message);

  final bool success;
  final T? data;
  final String? error;
  final int? statusCode;
}
