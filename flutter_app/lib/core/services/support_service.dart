import '../api_client.dart';

class SupportService {
  SupportService(this._client);
  final ApiClient _client;

  // List all tickets (STAFF can see all)
  Future<List<Map<String, dynamic>>> listTickets({
    int? page,
    int? limit,
    String? status,
  }) async {
    final queryParams = <String, String>{};
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    if (status != null) queryParams['status'] = status;
    
    final res = await _client.get<List<dynamic>>(
      '/support',
      queryParams: queryParams,
      fromJson: (d) => d as List<dynamic>,
    );
    if (!res.success || res.data == null) return [];
    return res.data!.map((e) => e as Map<String, dynamic>).toList();
  }

  // Get ticket by ID
  Future<Map<String, dynamic>?> getTicketById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/support/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Reply to ticket (STAFF)
  Future<bool> replyToTicket(String ticketId, String message) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/support/$ticketId/reply',
      body: {'message': message},
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }

  // Close ticket (STAFF)
  Future<bool> closeTicket(String ticketId) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/support/$ticketId/close',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }
}
