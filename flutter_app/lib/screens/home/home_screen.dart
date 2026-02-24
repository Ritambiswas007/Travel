import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/booking_service.dart';
import 'package:travel_pilgrimage_app/core/services/lead_service.dart';
import 'package:travel_pilgrimage_app/core/services/report_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _totalBookings = 0;
  int _pendingLeads = 0;
  double _todayRevenue = 0.0;
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
    try {
      // Load bookings count
      final bookingService = BookingService(client);
      final bookings = await bookingService.getAllBookings(limit: 1);
      if (bookings != null && bookings['total'] != null) {
        if (mounted) {
          setState(() {
            _totalBookings = bookings['total'] as int;
          });
        }
      }

      // Load leads count
      final leadService = LeadService(client);
      final leads = await leadService.listLeads(status: 'NEW', limit: 1);
      if (leads != null && leads['total'] != null) {
        if (mounted) {
          setState(() {
            _pendingLeads = leads['total'] as int;
          });
        }
      }

      // Load today's revenue
      final reportService = ReportService(client);
      final today = DateTime.now();
      final startDate = '${today.year}-${today.month.toString().padLeft(2, '0')}-${today.day.toString().padLeft(2, '0')}';
      final revenue = await reportService.getRevenueReport(startDate: startDate, endDate: startDate);
      if (revenue != null && revenue['totalRevenue'] != null) {
        if (mounted) {
          setState(() {
            _todayRevenue = (revenue['totalRevenue'] as num).toDouble();
          });
        }
      }
    } catch (e) {
      // Handle errors silently for now
    }
    if (mounted) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userName = context.watch<AuthProvider>().user?.name ?? 'Staff';
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _load,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Staff Portal',
                            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                          ),
                          Text(
                            'Welcome back, $userName',
                            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.notifications_outlined, color: AppColors.textPrimary),
                        onPressed: () {},
                      ),
                      const SizedBox(width: 8),
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppColors.primary,
                        child: Text(
                          userName.isNotEmpty ? userName.substring(0, 1).toUpperCase() : 'S',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                  child: const Text(
                    'Dashboard Overview',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ),
              ),
              if (_loading)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(48),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                )
              else
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: _StatCard(
                                icon: Icons.book_online,
                                label: 'Total Bookings',
                                value: _totalBookings.toString(),
                                color: AppColors.primary,
                                onTap: () => context.push('/bookings'),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: _StatCard(
                                icon: Icons.people_outline,
                                label: 'Pending Leads',
                                value: _pendingLeads.toString(),
                                color: Colors.orange,
                                onTap: () => context.push('/leads'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _StatCard(
                          icon: Icons.currency_rupee,
                          label: 'Today\'s Revenue',
                          value: '₹${_todayRevenue.toStringAsFixed(0)}',
                          color: Colors.green,
                          fullWidth: true,
                          onTap: () => context.push('/reports'),
                        ),
                      ],
                    ),
                  ),
                ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 32, 20, 16),
                  child: const Text(
                    'Quick Actions',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      _QuickActionCard(
                        icon: Icons.book_online,
                        title: 'Manage Bookings',
                        subtitle: 'View and update booking status',
                        color: AppColors.primary,
                        onTap: () => context.push('/bookings'),
                      ),
                      const SizedBox(height: 12),
                      _QuickActionCard(
                        icon: Icons.people_outline,
                        title: 'Manage Leads',
                        subtitle: 'Track and assign leads',
                        color: Colors.orange,
                        onTap: () => context.push('/leads'),
                      ),
                      const SizedBox(height: 12),
                      _QuickActionCard(
                        icon: Icons.assessment,
                        title: 'View Reports',
                        subtitle: 'Bookings and revenue reports',
                        color: Colors.blue,
                        onTap: () => context.push('/reports'),
                      ),
                      const SizedBox(height: 12),
                      _QuickActionCard(
                        icon: Icons.support_agent,
                        title: 'Support Tickets',
                        subtitle: 'Respond to customer inquiries',
                        color: Colors.purple,
                        onTap: () => context.push('/support-list'),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    required this.onTap,
    this.fullWidth = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final VoidCallback onTap;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: fullWidth ? double.infinity : null,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withOpacity(0.2)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: color),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}

