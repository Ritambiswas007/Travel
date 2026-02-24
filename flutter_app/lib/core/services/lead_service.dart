import '../api_client.dart';

class LeadService {
  LeadService(this._client);
  final ApiClient _client;

  // List all leads (STAFF)
  Future<Map<String, dynamic>?> listLeads({
    int? page,
    int? limit,
    String? status,
    String? search,
  }) async {
    final queryParams = <String, String>{};
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    if (status != null) queryParams['status'] = status;
    if (search != null) queryParams['search'] = search;
    
    final res = await _client.get<Map<String, dynamic>>(
      '/leads',
      queryParams: queryParams,
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Get lead by ID (STAFF)
  Future<Map<String, dynamic>?> getLeadById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/leads/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Update lead (STAFF)
  Future<Map<String, dynamic>?> updateLead(
    String id, {
    String? status,
    int? score,
    String? convertedBookingId,
  }) async {
    final body = <String, dynamic>{};
    if (status != null) body['status'] = status;
    if (score != null) body['score'] = score;
    if (convertedBookingId != null) body['convertedBookingId'] = convertedBookingId;
    
    final res = await _client.patch<Map<String, dynamic>>(
      '/leads/$id',
      body: body,
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Assign lead to staff (STAFF)
  Future<bool> assignLead(String leadId, String staffId) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/leads/$leadId/assign',
      body: {'staffId': staffId},
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }
}
