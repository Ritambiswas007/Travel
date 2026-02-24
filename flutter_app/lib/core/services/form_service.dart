import '../api_client.dart';

class FormService {
  FormService(this._client);
  final ApiClient _client;

  // List forms (STAFF)
  Future<List<Map<String, dynamic>>> listForms() async {
    final res = await _client.get<List<dynamic>>(
      '/forms',
      fromJson: (d) => d as List<dynamic>,
    );
    if (!res.success || res.data == null) return [];
    return res.data!.map((e) => e as Map<String, dynamic>).toList();
  }

  // Get form by ID (STAFF)
  Future<Map<String, dynamic>?> getFormById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/forms/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Create form (STAFF)
  Future<Map<String, dynamic>?> createForm({
    required String name,
    required String code,
    String? description,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/forms',
      body: {
        'name': name,
        'code': code,
        if (description != null) 'description': description,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Add field to form (STAFF)
  Future<Map<String, dynamic>?> addFieldToForm(
    String formId, {
    required String name,
    required String label,
    required String type,
    bool required = false,
    Map<String, dynamic>? options,
    int sortOrder = 0,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/forms/$formId/fields',
      body: {
        'name': name,
        'label': label,
        'type': type,
        'required': required,
        if (options != null) 'options': options,
        'sortOrder': sortOrder,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
