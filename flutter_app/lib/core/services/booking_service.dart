import '../api_client.dart';

class BookingService {
  BookingService(this._client);
  final ApiClient _client;

  Future<Map<String, dynamic>?> createBooking({
    required String packageId,
    required String packageScheduleId,
    required String packageVariantId,
    required List<Map<String, dynamic>> travelers,
    List<Map<String, dynamic>>? addons,
    String? couponCode,
    String? specialRequests,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/bookings',
      body: {
        'packageId': packageId,
        'packageScheduleId': packageScheduleId,
        'packageVariantId': packageVariantId,
        'travelers': travelers,
        if (addons != null) 'addons': addons,
        if (couponCode != null) 'couponCode': couponCode,
        if (specialRequests != null) 'specialRequests': specialRequests,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  Future<List<Map<String, dynamic>>> getMyBookings() async {
    final res = await _client.get<List<dynamic>>(
      '/bookings/my',
      fromJson: (d) => d as List<dynamic>,
    );
    if (!res.success || res.data == null) return [];
    return res.data!.map((e) => e as Map<String, dynamic>).toList();
  }

  // Staff endpoint: List all bookings
  Future<Map<String, dynamic>?> getAllBookings({
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
      '/bookings/admin',
      queryParams: queryParams,
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  Future<Map<String, dynamic>?> getBookingById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/bookings/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  Future<bool> confirmBooking(String id) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/bookings/$id/confirm',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }

  Future<bool> cancelBooking(String id) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/bookings/$id/cancel',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }

  Future<bool> applyCoupon(String bookingId, String couponCode) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/bookings/$bookingId/apply-coupon',
      body: {'couponCode': couponCode},
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }

  // Update booking step
  Future<Map<String, dynamic>?> updateBookingStep(String bookingId, int step) async {
    final res = await _client.patch<Map<String, dynamic>>(
      '/bookings/$bookingId/step',
      body: {'step': step},
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
