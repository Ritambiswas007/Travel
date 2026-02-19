import '../api_client.dart';
import '../models/package_model.dart';

class PackageService {
  PackageService(this._client);
  final ApiClient _client;

  Future<PackagesListResult> listPackages({int page = 1, int limit = 10, bool? isFeatured}) async {
    final params = <String, String>{'page': '$page', 'limit': '$limit'};
    if (isFeatured != null) params['isFeatured'] = isFeatured.toString();
    final res = await _client.get<Map<String, dynamic>>(
      '/packages',
      queryParams: params,
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) {
      return PackagesListResult(items: [], total: 0);
    }
    final data = res.data!;
    final items = (data['items'] as List<dynamic>?)
            ?.map((e) => PackageModel.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    final total = data['total'] as int? ?? 0;
    return PackagesListResult(items: items, total: total);
  }

  Future<PackageModel?> getPackageById(String id) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/packages/$id',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return null;
    return PackageModel.fromJson(res.data!);
  }

  Future<PackageModel?> getPackageBySlug(String slug) async {
    final res = await _client.get<Map<String, dynamic>>(
      '/packages/slug/$slug',
      fromJson: (d) => d as Map<String, dynamic>,
    );
    if (!res.success || res.data == null) return null;
    return PackageModel.fromJson(res.data!);
  }
}

class PackagesListResult {
  PackagesListResult({required this.items, required this.total});
  final List<PackageModel> items;
  final int total;
}
