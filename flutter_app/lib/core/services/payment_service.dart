import '../api_client.dart';

class PaymentService {
  PaymentService(this._client);
  final ApiClient _client;

  Future<Map<String, dynamic>?> createOrder({
    required String bookingId,
    required double amount,
    String currency = 'INR',
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/payments/orders',
      body: {
        'bookingId': bookingId,
        'amount': amount,
        'currency': currency,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  Future<Map<String, dynamic>?> getPaymentByBooking(String bookingId) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/payments/booking/$bookingId',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  Future<Map<String, dynamic>?> getPaymentById(String paymentId) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/payments/$paymentId',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
