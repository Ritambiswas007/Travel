import '../api_client.dart';

class PaymentService {
  PaymentService(this._client);
  final ApiClient _client;

  // Get payment by booking ID
  Future<Map<String, dynamic>?> getPaymentByBooking(String bookingId) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/payments/booking/$bookingId',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Get payment by ID
  Future<Map<String, dynamic>?> getPaymentById(String paymentId) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/payments/$paymentId',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Initiate refund (STAFF)
  Future<Map<String, dynamic>?> initiateRefund({
    required String paymentId,
    required double amount,
    String? reason,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/payments/refunds',
      body: {
        'paymentId': paymentId,
        'amount': amount,
        if (reason != null) 'reason': reason,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
