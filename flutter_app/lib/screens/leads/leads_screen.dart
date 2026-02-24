import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/lead_service.dart';

class LeadsScreen extends StatefulWidget {
  const LeadsScreen({super.key});

  @override
  State<LeadsScreen> createState() => _LeadsScreenState();
}

class _LeadsScreenState extends State<LeadsScreen> {
  List<Map<String, dynamic>> _leads = [];
  bool _loading = true;
  String? _statusFilter;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadLeads();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadLeads({bool refresh = false}) async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = LeadService(client);
      final result = await service.listLeads(
        page: 1,
        limit: 50,
        status: _statusFilter,
        search: _searchController.text.trim().isEmpty ? null : _searchController.text.trim(),
      );
      if (mounted && result != null) {
        final leads = (result['items'] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];
        setState(() {
          _leads = leads;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load leads: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return Colors.blue;
      case 'CONTACTED':
        return Colors.orange;
      case 'QUALIFIED':
        return Colors.purple;
      case 'CONVERTED':
        return Colors.green;
      case 'LOST':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Leads'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _loadLeads(refresh: true),
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
                    hintText: 'Search leads...',
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _loadLeads(refresh: true);
                            },
                          )
                        : null,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onSubmitted: (_) => _loadLeads(refresh: true),
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
                          _loadLeads(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'New',
                        selected: _statusFilter == 'NEW',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'NEW');
                          _loadLeads(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Contacted',
                        selected: _statusFilter == 'CONTACTED',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'CONTACTED');
                          _loadLeads(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Qualified',
                        selected: _statusFilter == 'QUALIFIED',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'QUALIFIED');
                          _loadLeads(refresh: true);
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Converted',
                        selected: _statusFilter == 'CONVERTED',
                        onSelected: (v) {
                          setState(() => _statusFilter = 'CONVERTED');
                          _loadLeads(refresh: true);
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _leads.isEmpty
                    ? const Center(child: Text('No leads found'))
                    : RefreshIndicator(
                        onRefresh: () => _loadLeads(refresh: true),
                        child: ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _leads.length,
                          itemBuilder: (context, index) {
                            final lead = _leads[index];
                            final status = lead['status'] as String? ?? 'NEW';
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                leading: CircleAvatar(
                                  backgroundColor: _getStatusColor(status).withOpacity(0.1),
                                  child: Icon(Icons.person, color: _getStatusColor(status)),
                                ),
                                title: Text(lead['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (lead['email'] != null) Text('Email: ${lead['email']}'),
                                    if (lead['phone'] != null) Text('Phone: ${lead['phone']}'),
                                    if (lead['score'] != null) Text('Score: ${lead['score']}'),
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
                                    style: TextStyle(color: _getStatusColor(status), fontWeight: FontWeight.w600, fontSize: 12),
                                  ),
                                ),
                                onTap: () => context.push('/lead/${lead['id']}'),
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
