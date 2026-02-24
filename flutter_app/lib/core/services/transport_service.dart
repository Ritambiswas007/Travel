import '../api_client.dart';

class TransportService {
  TransportService(this._client);
  final ApiClient _client;

  // Add flight booking (STAFF)
  Future<Map<String, dynamic>?> addFlight({
    required String bookingId,
    required String airline,
    required String flightNumber,
    required String departureCity,
    required String arrivalCity,
    required String departureAt,
    required String arrivalAt,
    String? seatNumber,
    String? pnr,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/transport/flight',
      body: {
        'bookingId': bookingId,
        'airline': airline,
        'flightNumber': flightNumber,
        'departureCity': departureCity,
        'arrivalCity': arrivalCity,
        'departureAt': departureAt,
        'arrivalAt': arrivalAt,
        if (seatNumber != null) 'seatNumber': seatNumber,
        if (pnr != null) 'pnr': pnr,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Add train booking (STAFF)
  Future<Map<String, dynamic>?> addTrain({
    required String bookingId,
    required String trainName,
    required String trainNumber,
    required String departureCity,
    required String arrivalCity,
    required String departureAt,
    required String arrivalAt,
    String? coach,
    String? seatNumber,
    String? pnr,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/transport/train',
      body: {
        'bookingId': bookingId,
        'trainName': trainName,
        'trainNumber': trainNumber,
        'departureCity': departureCity,
        'arrivalCity': arrivalCity,
        'departureAt': departureAt,
        'arrivalAt': arrivalAt,
        if (coach != null) 'coach': coach,
        if (seatNumber != null) 'seatNumber': seatNumber,
        if (pnr != null) 'pnr': pnr,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }

  // Add bus booking (STAFF)
  Future<Map<String, dynamic>?> addBus({
    required String bookingId,
    required String busOperator,
    required String departureCity,
    required String arrivalCity,
    required String departureAt,
    required String arrivalAt,
    String? seatNumber,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/transport/bus',
      body: {
        'bookingId': bookingId,
        'busOperator': busOperator,
        'departureCity': departureCity,
        'arrivalCity': arrivalCity,
        'departureAt': departureAt,
        'arrivalAt': arrivalAt,
        if (seatNumber != null) 'seatNumber': seatNumber,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
