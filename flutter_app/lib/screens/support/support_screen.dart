import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/support_service.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  List<Map<String, dynamic>> _tickets = [];
  bool _loading = true;
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    _loadTickets();
  }

  Future<void> _loadTickets({bool refresh = false}) async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = SupportService(client);
      final tickets = await service.listTickets(status: _statusFilter);
      if (mounted) {
        setState(() {
          _tickets = tickets;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load tickets: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'OPEN':
        return Colors.orange;
      case 'CLOSED':
        return Colors.grey;
      case 'RESOLVED':
        return Colors.green;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Support Tickets'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _loadTickets(refresh: true),
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(
                    label: 'All',
                    selected: _statusFilter == null,
                    onSelected: (v) {
                      setState(() => _statusFilter = null);
                      _loadTickets(refresh: true);
                    },
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'Open',
                    selected: _statusFilter == 'OPEN',
                    onSelected: (v) {
                      setState(() => _statusFilter = 'OPEN');
                      _loadTickets(refresh: true);
                    },
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: 'Closed',
                    selected: _statusFilter == 'CLOSED',
                    onSelected: (v) {
                      setState(() => _statusFilter = 'CLOSED');
                      _loadTickets(refresh: true);
                    },
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _tickets.isEmpty
                    ? const Center(child: Text('No tickets found'))
                    : RefreshIndicator(
                        onRefresh: () => _loadTickets(refresh: true),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _tickets.length,
                          itemBuilder: (context, index) {
                            final ticket = _tickets[index];
                            final status = ticket['status'] as String? ?? 'OPEN';
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                title: Text(
                                  ticket['subject'] ?? 'No Subject',
                                  style: const TextStyle(fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 8),
                                    if (ticket['priority'] != null)
                                      Text('Priority: ${ticket['priority']}'),
                                    if (ticket['createdAt'] != null)
                                      Text('Created: ${_formatDate(ticket['createdAt'])}'),
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
                                onTap: () => context.push('/support/${ticket['id']}'),
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
