import '../api_client.dart';

class ReviewService {
  ReviewService(this._client);
  final ApiClient _client;

  Future<List<Map<String, dynamic>>> listReviews({int page = 1, int limit = 20}) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/reviews',
      queryParams: {'page': '$page', 'limit': '$limit'},
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return [];
    final items = res.data!['items'] as List<dynamic>?;
    if (items == null) return [];
    return items.map((e) => e as Map<String, dynamic>).toList();
  }

  Future<Map<String, dynamic>?> createReview({
    required String packageId,
    required int rating,
    String? title,
    String? comment,
  }) async {
    final res = await _client.post<Map<String, dynamic>>(
      '/reviews',
      body: {
        'packageId': packageId,
        'rating': rating,
        if (title != null) 'title': title,
        if (comment != null) 'comment': comment,
      },
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success) return null;
    return res.data;
  }
}
