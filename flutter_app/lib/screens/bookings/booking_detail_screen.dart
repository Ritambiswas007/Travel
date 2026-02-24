import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/booking_service.dart';
import 'package:travel_pilgrimage_app/core/services/payment_service.dart';

class BookingDetailScreen extends StatefulWidget {
  const BookingDetailScreen({super.key, required this.bookingId});

  final String bookingId;

  @override
  State<BookingDetailScreen> createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends State<BookingDetailScreen> {
  Map<String, dynamic>? _booking;
  Map<String, dynamic>? _payment;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadBooking();
  }

  Future<void> _loadBooking() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final bookingService = BookingService(client);
      final paymentService = PaymentService(client);

      final booking = await bookingService.getBookingById(widget.bookingId);
      if (booking != null && booking['id'] != null) {
        final payment = await paymentService.getPaymentByBooking(booking['id']);
        if (mounted) {
          setState(() {
            _booking = booking;
            _payment = payment;
            _loading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load booking: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _confirmBooking() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Booking'),
        content: const Text('Are you sure you want to confirm this booking?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm', style: TextStyle(color: Colors.green)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = BookingService(client);
      final success = await service.confirmBooking(widget.bookingId);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking confirmed'), backgroundColor: Colors.green),
          );
          _loadBooking();
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

  Future<void> _cancelBooking() async {
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
      final success = await service.cancelBooking(widget.bookingId);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Booking cancelled'), backgroundColor: Colors.green),
          );
          _loadBooking();
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
        title: const Text('Booking Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadBooking,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _booking == null
              ? const Center(child: Text('Booking not found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Booking #${_booking!['id']?.toString().substring(0, 8) ?? 'N/A'}',
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(_booking!['status']).withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      _booking!['status'] ?? 'UNKNOWN',
                                      style: TextStyle(
                                        color: _getStatusColor(_booking!['status']),
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _InfoRow(label: 'Total Amount', value: '₹${_booking!['totalAmount'] ?? '0'}'),
                              _InfoRow(label: 'Final Amount', value: '₹${_booking!['finalAmount'] ?? '0'}'),
                              if (_booking!['discountAmount'] != null && (_booking!['discountAmount'] as num) > 0)
                                _InfoRow(
                                  label: 'Discount',
                                  value: '₹${_booking!['discountAmount']}',
                                  color: Colors.green,
                                ),
                              _InfoRow(label: 'Currency', value: _booking!['currency'] ?? 'INR'),
                              if (_booking!['createdAt'] != null)
                                _InfoRow(label: 'Created', value: _formatDate(_booking!['createdAt'])),
                            ],
                          ),
                        ),
                      ),
                      if (_payment != null) ...[
                        const SizedBox(height: 20),
                        const Text('Payment Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 12),
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                _InfoRow(label: 'Amount', value: '₹${_payment!['amount'] ?? '0'}'),
                                _InfoRow(
                                  label: 'Status',
                                  value: _payment!['status'] ?? 'UNKNOWN',
                                  color: _getPaymentStatusColor(_payment!['status']),
                                ),
                                if (_payment!['paidAt'] != null)
                                  _InfoRow(label: 'Paid At', value: _formatDate(_payment!['paidAt'])),
                              ],
                            ),
                          ),
                        ),
                      ],
                      const SizedBox(height: 20),
                      const Text('Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      if (_booking!['status'] != 'CONFIRMED' && _booking!['status'] != 'CANCELLED')
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: _confirmBooking,
                                icon: const Icon(Icons.check),
                                label: const Text('Confirm'),
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: _cancelBooking,
                                icon: const Icon(Icons.close),
                                label: const Text('Cancel'),
                                style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
    );
  }

  Color _getPaymentStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'SUCCEEDED':
        return Colors.green;
      case 'FAILED':
        return Colors.red;
      case 'PENDING':
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      final d = DateTime.parse(date.toString());
      return '${d.day}/${d.month}/${d.year} ${d.hour}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return date.toString();
    }
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value, this.color});

  final String label;
  final String value;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Text(
            value,
            style: TextStyle(fontWeight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}
