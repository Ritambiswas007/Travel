import '../api_client.dart';

class NotificationService {
  NotificationService(this._client);
  final ApiClient _client;

  // List my notifications (USER/STAFF)
  Future<List<Map<String, dynamic>>> listMyNotifications() async {
    final res = await _client.get<List<dynamic>>(
      '/notifications',
      fromJson: (d) => d as List<dynamic>,
    );
    if (!res.success || res.data == null) return [];
    return res.data!.map((e) => e as Map<String, dynamic>).toList();
  }

  // Mark notification as read (USER/STAFF)
  Future<bool> markAsRead(String notificationId) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/notifications/mark-read/$notificationId',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    return res.success;
  }

  // Send notification (STAFF)
  Future<Map<String, dynamic>?> sendNotification({
    String? userId,
    required String title,
    required String body,
    required String type,
    required String channel,
    Map<String, dynamic>? data,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/notifications/send',
      body: {
        if (userId != null) 'userId': userId,
        'title': title,
        'body': body,
        'type': type,
        'channel': channel,
        if (data != null) 'data': data,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
