class PackageModel {
  PackageModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.summary,
    this.imageUrl,
    this.cityId,
    this.isActive = true,
    this.isFeatured = false,
    this.city,
    this.variants = const [],
    this.schedules = const [],
    this.reviews,
  });

  final String id;
  final String name;
  final String slug;
  final String? description;
  final String? summary;
  final String? imageUrl;
  final String? cityId;
  final bool isActive;
  final bool isFeatured;
  final CityModel? city;
  final List<PackageVariantModel> variants;
  final List<PackageScheduleModel> schedules;
  final List<ReviewModel>? reviews;

  factory PackageModel.fromJson(Map<String, dynamic> json) {
    return PackageModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String?,
      summary: json['summary'] as String?,
      imageUrl: json['imageUrl'] as String?,
      cityId: json['cityId'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      isFeatured: json['isFeatured'] as bool? ?? false,
      city: json['city'] != null ? CityModel.fromJson(json['city'] as Map<String, dynamic>) : null,
      variants: (json['variants'] as List<dynamic>?)
              ?.map((e) => PackageVariantModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      schedules: (json['schedules'] as List<dynamic>?)
              ?.map((e) => PackageScheduleModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      reviews: (json['reviews'] as List<dynamic>?)
          ?.map((e) => ReviewModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  double? get minPrice {
    if (variants.isEmpty) return null;
    return variants.map((v) => v.basePrice).reduce((a, b) => a < b ? a : b);
  }

  String? get priceFormatted {
    final p = minPrice;
    if (p == null) return null;
    final v = variants.isNotEmpty ? variants.first : null;
    final currency = v?.currency ?? 'INR';
    return '$currency ${p.toStringAsFixed(0)}';
  }

  String? get dateRange {
    if (schedules.isEmpty) return null;
    final s = schedules.first;
    return '${_formatDate(s.startDate)} - ${_formatDate(s.endDate)}';
  }

  static String _formatDate(dynamic d) {
    if (d == null) return '';
    final s = d.toString();
    if (s.length >= 10) return s.substring(0, 10);
    return s;
  }

  double get averageRating {
    if (reviews == null || reviews!.isEmpty) return 0;
    return reviews!.map((r) => r.rating).reduce((a, b) => a + b) / reviews!.length;
  }

  int get reviewCount => reviews?.length ?? 0;
}

class PackageVariantModel {
  PackageVariantModel({
    required this.id,
    required this.name,
    required this.basePrice,
    this.currency = 'INR',
    this.durationDays = 1,
    this.maxTravelers,
  });

  final String id;
  final String name;
  final double basePrice;
  final String currency;
  final int durationDays;
  final int? maxTravelers;

  factory PackageVariantModel.fromJson(Map<String, dynamic> json) {
    final price = json['basePrice'];
    return PackageVariantModel(
      id: json['id'] as String,
      name: json['name'] as String,
      basePrice: price is num ? price.toDouble() : double.tryParse(price?.toString() ?? '0') ?? 0,
      currency: json['currency'] as String? ?? 'INR',
      durationDays: json['durationDays'] as int? ?? 1,
      maxTravelers: json['maxTravelers'] as int?,
    );
  }
}

class PackageScheduleModel {
  PackageScheduleModel({
    required this.id,
    required this.startDate,
    required this.endDate,
    this.availableSeats = 0,
  });

  final String id;
  final String startDate;
  final String endDate;
  final int availableSeats;

  factory PackageScheduleModel.fromJson(Map<String, dynamic> json) {
    return PackageScheduleModel(
      id: json['id'] as String,
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      availableSeats: json['availableSeats'] as int? ?? 0,
    );
  }
}

class CityModel {
  CityModel({
    required this.id,
    required this.name,
    required this.slug,
    this.country = 'India',
    this.description,
    this.imageUrl,
  });

  final String id;
  final String name;
  final String slug;
  final String country;
  final String? description;
  final String? imageUrl;

  factory CityModel.fromJson(Map<String, dynamic> json) {
    return CityModel(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      country: json['country'] as String? ?? 'India',
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String?,
    );
  }
}

class ReviewModel {
  ReviewModel({required this.id, required this.rating, this.comment, this.title});

  final String id;
  final double rating;
  final String? comment;
  final String? title;

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    final r = json['rating'];
    return ReviewModel(
      id: json['id'] as String,
      rating: r is num ? r.toDouble() : double.tryParse(r?.toString() ?? '0') ?? 0,
      comment: json['comment'] as String?,
      title: json['title'] as String?,
    );
  }
}
