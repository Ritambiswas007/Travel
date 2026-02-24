import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/booking_service.dart';

class BookingsScreen extends StatefulWidget {
  const BookingsScreen({super.key});

  @override
  State<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends State<BookingsScreen> {
  List<Map<String, dynamic>> _bookings = [];
  bool _loading = true;
  int _currentPage = 1;
  String? _statusFilter;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadBookings({bool refresh = false}) async {
    if (!mounted) return;
    if (refresh) _currentPage = 1;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = BookingService(client);
      final result = await service.getAllBookings(
        page: _currentPage,
        limit: 20,
        status: _statusFilter,
        search: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
      );
      if (mounted && result != null) {
        final bookings = (result['items'] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];
        setState(() {
          if (refresh) {
            _bookings = bookings;
          } else {
            _bookings.addAll(bookings);
          }
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load bookings: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _confirmBooking(String bookingId) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = BookingService(client);
      final success = await service.confirmBooking(bookingId);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking confirmed'), backgroundColor: Colors.green),
          );
          _loadBookings(refresh: true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to confirm booking'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _cancelBooking(String bookingId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Booking'),
        content: const Text('Are you sure you want to cancel this booking?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('No')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Yes', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = BookingService(client);
      final success = await service.cancelBooking(bookingId);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking cancelled'), backgroundColor: Colors.green),
          );
          _loadBookings(refresh: true);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to cancel booking'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      case 'PENDING_PAYMENT':
        return Colors.orange;
      case 'COMPLETED':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bookings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _loadBookings(refresh: true),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search bookings...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _loadBookings(refresh: true);
                            },
                          )
                        : null,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onSubmitted: (_) => _loadBookings(refresh: true),
                ),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _FilterChip(
                        label: 'All',
                        selected: _statusFilter == null,
                        onSelected: (v) {
                          setState(() => _statusFilter = null);
                          _loadBookings(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Pending',
                        selected: _statusFilter == 'PENDING_PAYMENT',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'PENDING_PAYMENT');
                          _loadBookings(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Confirmed',
                        selected: _statusFilter == 'CONFIRMED',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'CONFIRMED');
                          _loadBookings(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Cancelled',
                        selected: _statusFilter == 'CANCELLED',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'CANCELLED');
                          _loadBookings(refresh: true);
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading && _bookings.isEmpty
                ? const Center(child: CircularProgressIndicator())
                : _bookings.isEmpty
                    ? const Center(child: Text('No bookings found'))
                    : RefreshIndicator(
                        onRefresh: () => _loadBookings(refresh: true),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _bookings.length,
                          itemBuilder: (context, index) {
                            final booking = _bookings[index];
                            final status = booking['status'] as String? ?? 'UNKNOWN';
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                title: Text(
                                  'Booking #${booking['id']?.toString().substring(0, 8) ?? 'N/A'}',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 8),
                                    Text('Status: $status'),
                                    if (booking['totalAmount'] != null)
                                      Text('Amount: ₹${booking['totalAmount']}'),
                                    if (booking['createdAt'] != null)
                                      Text('Created: ${_formatDate(booking['createdAt'])}'),
                                  ],
                                ),
                                trailing: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(status).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    status,
                                    style: TextStyle(color: _getStatusColor(status), fontWeight: FontWeight.w600),
                                  ),
                                ),
                                onTap: () => context.push('/booking/${booking['id']}'),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      final d = DateTime.parse(date.toString());
      return '${d.day}/${d.month}/${d.year}';
    } catch (_) {
      return date.toString();
    }
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.selected, required this.onSelected});

  final String label;
  final bool selected;
  final ValueChanged<bool> onSelected;

  @override
  Widget build(BuildContext context) {
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: onSelected,
      selectedColor: AppColors.primary.withOpacity(0.2),
      checkmarkColor: AppColors.primary,
    );
  }
}
