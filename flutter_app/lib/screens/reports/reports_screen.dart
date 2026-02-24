import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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
  List<Map<String, dynamic>> _savedReports = [];
  int _savedReportsTotal = 0;
  bool _loading = false;
  bool _loadingSaved = false;

  Future<void> _loadSavedReports() async {
    if (!mounted) return;
    setState(() => _loadingSaved = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final result = await ReportService(authProvider.apiClient).listReports(page: 1, limit: 50);
      if (mounted) {
        setState(() {
          _savedReports = List<Map<String, dynamic>>.from(result['items'] ?? []);
          _savedReportsTotal = result['total'] as int? ?? 0;
          _loadingSaved = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _loadingSaved = false);
    }
  }

  Future<void> _loadReports() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = ReportService(client);
      
      final from = DateFormat('yyyy-MM-dd').format(_startDate);
      final to = DateFormat('yyyy-MM-dd').format(_endDate);

      final bookings = await service.getBookingsReport(from: from, to: to);
      final revenue = await service.getRevenueReport(from: from, to: to);

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

  Future<void> _showCreateReportDialog() async {
    final nameController = TextEditingController(text: 'Report ${DateFormat('MMM d, yyyy').format(DateTime.now())}');
    String type = 'bookings';
    final from = DateFormat('yyyy-MM-dd').format(_startDate);
    final to = DateFormat('yyyy-MM-dd').format(_endDate);
    final created = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Save report'),
        content: StatefulBuilder(
          builder: (context, setDialogState) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Report name'),
                  autofocus: true,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: type,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: const [
                    DropdownMenuItem(value: 'bookings', child: Text('Bookings')),
                    DropdownMenuItem(value: 'revenue', child: Text('Revenue')),
                  ],
                  onChanged: (v) => setDialogState(() => type = v ?? type),
                ),
                const SizedBox(height: 8),
                Text('Date range: $from to $to', style: TextStyle(fontSize: 12, color: Colors.grey[600])),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (created != true || !mounted) return;
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final report = await ReportService(authProvider.apiClient).createReport(
        name: nameController.text.trim().isEmpty ? 'Report' : nameController.text.trim(),
        type: type,
        params: {'from': from, 'to': to},
      );
      if (mounted) {
        _loadSavedReports();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Report saved')));
        if (report != null && report['id'] != null) _openReportById(report['id'].toString());
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save report: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _openReportById(String id) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final report = await ReportService(authProvider.apiClient).getReportById(id);
      if (!mounted || report == null) return;
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text(report['name']?.toString() ?? 'Report'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _infoRow('Type', report['type']?.toString() ?? ''),
                _infoRow('Status', report['status']?.toString() ?? ''),
                if (report['params'] is Map) ...(_infoFromMap(report['params'] as Map)),
                if (report['generatedAt'] != null) _infoRow('Generated', report['generatedAt'].toString()),
              ],
            ),
          ),
          actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close'))],
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load report: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  static Widget _infoRow(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(width: 100, child: Text('$label:', style: const TextStyle(fontWeight: FontWeight.w500))),
        Expanded(child: Text(value)),
      ],
    ),
  );

  static List<Widget> _infoFromMap(Map m) => [
    if (m['from'] != null) _infoRow('From', m['from'].toString()),
    if (m['to'] != null) _infoRow('To', m['to'].toString()),
  ];

  @override
  void initState() {
    super.initState();
    _loadReports();
    _loadSavedReports();
  }

  static double _revenueTotal(Map<String, dynamic>? data) {
    if (data == null) return 0;
    final t = data['total'];
    return (t is num) ? t.toDouble() : 0;
  }

  static int _revenueBookingsCount(Map<String, dynamic>? data) {
    if (data == null) return 0;
    final p = data['payments'];
    return (p is List) ? p.length : 0;
  }

  static int _bookingsTotal(Map<String, dynamic>? data) {
    if (data == null) return 0;
    final list = data['bookings'] as List?;
    return list?.length ?? 0;
  }

  static int _bookingsByStatus(Map<String, dynamic>? data, String status) {
    if (data == null) return 0;
    final summary = data['summary'] as List?;
    if (summary == null) return 0;
    for (final s in summary) {
      if (s is Map && (s['status'] ?? '').toString().toUpperCase() == status.toUpperCase()) {
        final c = s['_count'];
        return (c is num) ? c.toInt() : 0;
      }
    }
    return 0;
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
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Saved Reports${_savedReportsTotal > 0 ? ' ($_savedReportsTotal)' : ''}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      TextButton.icon(
                        onPressed: _loading ? null : _showCreateReportDialog,
                        icon: const Icon(Icons.add, size: 20),
                        label: const Text('Save as report'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_loadingSaved)
                    const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))
                  else if (_savedReports.isEmpty)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Text('No saved reports. Use "Save as report" to save the current date range.', style: TextStyle(color: Colors.grey[600])),
                      ),
                    )
                  else
                    ..._savedReports.map((r) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        title: Text(r['name']?.toString() ?? 'Unnamed'),
                        subtitle: Text('${r['type'] ?? ''} • ${r['status'] ?? ''}'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () {
                          final id = r['id']?.toString();
                          if (id != null && id.isNotEmpty) _openReportById(id);
                        },
                      ),
                    )),
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
                              value: '₹${_revenueTotal(_revenueReport).toStringAsFixed(0)}',
                              color: Colors.green,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Total Payments',
                              value: '${_revenueBookingsCount(_revenueReport)}',
                              color: Colors.blue,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Average Order Value',
                              value: '₹${(_revenueBookingsCount(_revenueReport) > 0 ? _revenueTotal(_revenueReport) / _revenueBookingsCount(_revenueReport) : 0).toStringAsFixed(0)}',
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
                              value: '${_bookingsTotal(_bookingsReport)}',
                              color: Colors.blue,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Confirmed',
                              value: '${_bookingsByStatus(_bookingsReport, 'CONFIRMED')}',
                              color: Colors.green,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Pending',
                              value: '${_bookingsByStatus(_bookingsReport, 'PENDING_PAYMENT')}',
                              color: Colors.orange,
                            ),
                            const Divider(),
                            _StatRow(
                              label: 'Cancelled',
                              value: '${_bookingsByStatus(_bookingsReport, 'CANCELLED')}',
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
