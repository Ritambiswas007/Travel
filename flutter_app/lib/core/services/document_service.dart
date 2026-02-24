import '../api_client.dart';

class DocumentService {
  DocumentService(this._client);
  final ApiClient _client;

  // List document types (public)
  Future<List<Map<String, dynamic>>> listDocumentTypes() async {
    final res = await _client.get<List<dynamic>>(
      '/documents/types',
      fromJson: (d) => d as List<dynamic>,
    );
    if (!res.success || res.data == null) return [];
    return res.data!.map((e) => e as Map<String, dynamic>).toList();
  }

  // Get document type by ID (STAFF)
  Future<Map<String, dynamic>?> getDocumentTypeById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/documents/types/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Create document type (STAFF)
  Future<Map<String, dynamic>?> createDocumentType({
    required String name,
    required String code,
    String? description,
    bool isRequired = false,
    int? expiresInDays,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/documents/types',
      body: {
        'name': name,
        'code': code,
        if (description != null) 'description': description,
        'isRequired': isRequired,
        if (expiresInDays != null) 'expiresInDays': expiresInDays,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Get document by ID (USER/STAFF)
  Future<Map<String, dynamic>?> getDocumentById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/documents/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Update document status (STAFF)
  Future<Map<String, dynamic>?> updateDocumentStatus(
    String documentId, {
    required String status,
    String? rejectedReason,
  }) async {
    final res = await _client.patch<Map<String, dynamic>>(
      '/documents/$documentId/status',
      body: {
        'status': status,
        if (rejectedReason != null) 'rejectedReason': rejectedReason,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
