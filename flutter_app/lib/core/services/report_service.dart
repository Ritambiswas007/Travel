import '../api_client.dart';

class ReportService {
  ReportService(this._client);
  final ApiClient _client;

  // Create report (STAFF)
  Future<Map<String, dynamic>?> createReport({
    required String name,
    required String type,
    Map<String, dynamic>? params,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/reports',
      body: {
        'name': name,
        'type': type,
        if (params != null) 'params': params,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // List reports (STAFF) - backend returns { items, total }
  Future<Map<String, dynamic>> listReports({
    int? page,
    int? limit,
    String? type,
  }) async {
    final queryParams = <String, String>{};
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    if (type != null && type.isNotEmpty) queryParams['type'] = type;
    final res = await _client.get<Map<String, dynamic>>(
      '/reports',
      queryParams: queryParams,
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return {'items': <Map<String, dynamic>>[], 'total': 0};
    final data = res.data!;
    final items = (data['items'] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];
    final total = data['total'] as int? ?? items.length;
    return {'items': items, 'total': total};
  }

  // Get bookings report (STAFF)
  Future<Map<String, dynamic>?> getBookingsReport({
    required String from,
    required String to,
  }) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/reports/bookings',
      queryParams: {
        'from': from,
        'to': to,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Get revenue report (STAFF)
  Future<Map<String, dynamic>?> getRevenueReport({
    required String from,
    required String to,
  }) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/reports/revenue',
      queryParams: {
        'from': from,
        'to': to,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Get report by ID (STAFF)
  Future<Map<String, dynamic>?> getReportById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/reports/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
