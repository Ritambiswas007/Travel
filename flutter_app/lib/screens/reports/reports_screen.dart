import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/report_service.dart';
import 'package:intl/intl.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
  DateTime _endDate = DateTime.now();
  Map<String, dynamic>? _bookingsReport;
  Map<String, dynamic>? _revenueReport;
  bool _loading = false;

  Future<void> _loadReports() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = ReportService(client);
      
      final startDateStr = DateFormat('yyyy-MM-dd').format(_startDate);
      final endDateStr = DateFormat('yyyy-MM-dd').format(_endDate);

      final bookings = await service.getBookingsReport(startDate: startDateStr, endDate: endDateStr);
      final revenue = await service.getRevenueReport(startDate: startDateStr, endDate: endDateStr);

      if (mounted) {
        setState(() {
          _bookingsReport = bookings;
          _revenueReport = revenue;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load reports: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _selectDateRange() async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now(),
      initialDateRange: DateTimeRange(start: _startDate, end: _endDate),
    );
    if (picked != null && mounted) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      _loadReports();
    }
  }

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadReports,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.calendar_today),
                      title: const Text('Date Range'),
                      subtitle: Text('${DateFormat('MMM dd, yyyy').format(_startDate)} - ${DateFormat('MMM dd, yyyy').format(_endDate)}'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: _selectDateRange,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text('Revenue Report', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  if (_revenueReport != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            _StatRow(
                              label: 'Total Revenue',
                              value: '₹${(_revenueReport!['totalRevenue'] as num?)?.toStringAsFixed(0) ?? '0'}',
                              color: Colors.green,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Total Bookings',
                              value: '${_revenueReport!['totalBookings'] ?? 0}',
                              color: Colors.blue,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Average Order Value',
                              value: '₹${(_revenueReport!['averageOrderValue'] as num?)?.toStringAsFixed(0) ?? '0'}',
                              color: Colors.orange,
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('No revenue data'))),
                  const SizedBox(height: 24),
                  const Text('Bookings Report', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  if (_bookingsReport != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          children: [
                            _StatRow(
                              label: 'Total Bookings',
                              value: '${_bookingsReport!['total'] ?? 0}',
                              color: Colors.blue,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Confirmed',
                              value: '${_bookingsReport!['confirmed'] ?? 0}',
                              color: Colors.green,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Pending',
                              value: '${_bookingsReport!['pending'] ?? 0}',
                              color: Colors.orange,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Cancelled',
                              value: '${_bookingsReport!['cancelled'] ?? 0}',
                              color: Colors.red,
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('No bookings data'))),
                ],
              ),
            ),
    );
  }
}

class _StatRow extends StatelessWidget {
  const _StatRow({required this.label, required this.value, required this.color});

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 16)),
        Text(
          value,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color),
        ),
      ],
    );
  }
}
