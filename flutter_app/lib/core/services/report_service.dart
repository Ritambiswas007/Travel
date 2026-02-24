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

  // List reports (STAFF)
  Future<List<Map<String, dynamic>>> listReports({
    int? page,
    int? limit,
  }) async {
    final queryParams = <String, String>{};
    if (page != null) queryParams['page'] = page.toString();
    if (limit != null) queryParams['limit'] = limit.toString();
    
    final res = await _client.get<List<dynamic>>(
      '/reports',
      queryParams: queryParams,
      fromJson: (d) => d as List<dynamic>,
    );
    if (!res.success || res.data == null) return [];
    return res.data!.map((e) => e as Map<String, dynamic>).toList();
  }

  // Get bookings report (STAFF)
  Future<Map<String, dynamic>?> getBookingsReport({
    required String startDate,
    required String endDate,
  }) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/reports/bookings',
      queryParams: {
        'startDate': startDate,
        'endDate': endDate,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Get revenue report (STAFF)
  Future<Map<String, dynamic>?> getRevenueReport({
    required String startDate,
    required String endDate,
  }) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/reports/revenue',
      queryParams: {
        'startDate': startDate,
        'endDate': endDate,
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
