import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/models/package_model.dart';
import 'package:travel_pilgrimage_app/core/services/package_service.dart';

class PackageDetailScreen extends StatefulWidget {
  const PackageDetailScreen({super.key, required this.packageId});

  final String packageId;

  @override
  State<PackageDetailScreen> createState() => _PackageDetailScreenState();
}

class _PackageDetailScreenState extends State<PackageDetailScreen> {
  PackageModel? _package;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final client = authProvider.apiClient;
    final service = PackageService(client);
    final p = await service.getPackageById(widget.packageId);
    if (mounted) setState(() { _package = p; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading || _package == null) {
      return Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(leading: IconButton(icon: const Icon(Icons.arrow_back_ios), onPressed: () => context.pop())),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    final p = _package!;
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
              onPressed: () => context.pop(),
            ),
            title: const Text('Details', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            centerTitle: true,
            actions: [IconButton(icon: const Icon(Icons.bookmark_border, color: Colors.white), onPressed: () {})],
            flexibleSpace: FlexibleSpaceBar(
              background: p.imageUrl != null && p.imageUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: p.imageUrl!,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => const ColoredBox(color: Color(0xFFE5E7EB), child: Center(child: CircularProgressIndicator())),
                      errorWidget: (_, __, ___) => const ColoredBox(color: Color(0xFFE5E7EB), child: Icon(Icons.image_not_supported, size: 64)),
                    )
                  : const ColoredBox(color: Color(0xFFE5E7EB), child: Icon(Icons.landscape, size: 80)),
            ),
          ),
          SliverToBoxAdapter(
            child: Transform.translate(
              offset: const Offset(0, -24),
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 12),
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(color: AppColors.divider, borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p.name,
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  p.city?.name ?? p.city?.country ?? '—',
                                  style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                                ),
                              ],
                            ),
                          ),
                          const CircleAvatar(radius: 24, backgroundColor: Color(0xFFE5E7EB), child: Icon(Icons.person, size: 28)),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 18, color: AppColors.textSecondary),
                          const SizedBox(width: 6),
                          Text(p.city?.country ?? '—', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                          const SizedBox(width: 20),
                          const Icon(Icons.star, size: 18, color: AppColors.starRating),
                          const SizedBox(width: 6),
                          Text('${p.averageRating.toStringAsFixed(1)} (${p.reviewCount})', style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                          const Spacer(),
                          Text(
                            p.priceFormatted != null ? '${p.priceFormatted}/Person' : '—',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      height: 72,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        children: [
                          _GalleryThumb(imageUrl: p.imageUrl),
                          _GalleryThumb(imageUrl: null),
                          _GalleryThumb(imageUrl: null),
                          _GalleryThumb(imageUrl: null),
                          _GalleryThumbMore(count: 16),
                        ],
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.fromLTRB(20, 24, 20, 8),
                      child: Text('About Destination', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        p.description ?? p.summary ?? 'Experience the ultimate vacation package. From airline tickets to recommended hotel rooms and transportation, we have everything you need.',
                        style: const TextStyle(fontSize: 14, height: 1.5, color: AppColors.textSecondary),
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                      child: GestureDetector(
                        onTap: () {},
                        child: const Text('Read More', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                      child: SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                        onPressed: () async {
                          if (_package == null) return;
                          // Navigate to booking screen with package details
                          // For now, show a message - can be extended to full booking flow
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Booking flow: Package ${_package!.name} - Use Create booking API'),
                                duration: const Duration(seconds: 3),
                              ),
                            );
                          }
                        },
                          child: const Text('Book Now'),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GalleryThumb extends StatelessWidget {
  const _GalleryThumb({this.imageUrl});

  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        color: const Color(0xFFE5E7EB),
      ),
      child: imageUrl != null && imageUrl!.isNotEmpty
          ? ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(imageUrl: imageUrl!, fit: BoxFit.cover),
            )
          : const Icon(Icons.image, size: 32),
    );
  }
}

class _GalleryThumbMore extends StatelessWidget {
  const _GalleryThumbMore({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 72,
      height: 72,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.6),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(child: Text('+$count', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 16))),
    );
  }
}
