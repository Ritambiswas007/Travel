import '../api_client.dart';
import '../models/package_model.dart';

class CityService {
  CityService(this._client);
  final ApiClient _client;

  Future<List<CityModel>> listCities({int page = 1, int limit = 20}) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/cities',
      queryParams: {'page': '$page', 'limit': '$limit'},
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return [];
    final items = res.data!['items'] as List<dynamic>?;
    if (items == null) return [];
    return items.map((e) => CityModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<CityModel?> getCityById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/cities/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return null;
    return CityModel.fromJson(res.data!);
  }

  Future<CityModel?> getCityBySlug(String slug) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/cities/slug/$slug',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return null;
    return CityModel.fromJson(res.data!);
  }
}
