import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/lead_service.dart';

class LeadDetailScreen extends StatefulWidget {
  const LeadDetailScreen({super.key, required this.leadId});

  final String leadId;

  @override
  State<LeadDetailScreen> createState() => _LeadDetailScreenState();
}

class _LeadDetailScreenState extends State<LeadDetailScreen> {
  Map<String, dynamic>? _lead;
  bool _loading = true;
  final _statusController = TextEditingController();
  final _scoreController = TextEditingController();
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _loadLead();
  }

  @override
  void dispose() {
    _statusController.dispose();
    _scoreController.dispose();
    super.dispose();
  }

  Future<void> _loadLead() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = LeadService(client);
      final lead = await service.getLeadById(widget.leadId);
      if (mounted && lead != null) {
        setState(() {
          _lead = lead;
          _statusController.text = lead['status'] ?? 'NEW';
          _scoreController.text = (lead['score'] ?? 0).toString();
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load lead: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _updateLead() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = LeadService(client);
      final updated = await service.updateLead(
        widget.leadId,
        status: _statusController.text.trim(),
        score: int.tryParse(_scoreController.text.trim()),
      );
      if (mounted && updated != null) {
        setState(() {
          _lead = updated;
          _isEditing = false;
          _loading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Lead updated successfully'), backgroundColor: Colors.green),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update lead: ${e.toString()}'), backgroundColor: Colors.red),
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
        title: const Text('Lead Details'),
        actions: [
          if (_isEditing)
            TextButton(
              onPressed: _loading ? null : () => setState(() => _isEditing = false),
              child: const Text('Cancel'),
            ),
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => setState(() => _isEditing = true),
            ),
          if (_isEditing)
            TextButton(
              onPressed: _loading ? null : _updateLead,
              child: _loading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Save'),
            ),
        ],
      ),
      body: _loading && _lead == null
          ? const Center(child: CircularProgressIndicator())
          : _lead == null
              ? const Center(child: Text('Lead not found'))
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
                                children: [
                                  CircleAvatar(
                                    radius: 30,
                                    backgroundColor: _getStatusColor(_lead!['status']).withOpacity(0.1),
                                    child: Icon(Icons.person, color: _getStatusColor(_lead!['status']), size: 30),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _lead!['name'] ?? 'Unknown',
                                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 4),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(_lead!['status']).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            _lead!['status'] ?? 'NEW',
                                            style: TextStyle(
                                              color: _getStatusColor(_lead!['status']),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _InfoRow(label: 'Email', value: _lead!['email'] ?? 'N/A'),
                              _InfoRow(label: 'Phone', value: _lead!['phone'] ?? 'N/A'),
                              if (_lead!['message'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text('Message:', style: TextStyle(fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 4),
                                      Text(_lead!['message']),
                                    ],
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Text('Lead Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              if (_isEditing) ...[
                                DropdownButtonFormField<String>(
                                  value: _statusController.text,
                                  decoration: const InputDecoration(labelText: 'Status', border: OutlineInputBorder()),
                                  items: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
                                      .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                                      .toList(),
                                  onChanged: (v) {
                                    if (v != null) _statusController.text = v;
                                  },
                                ),
                                const SizedBox(height: 16),
                                TextFormField(
                                  controller: _scoreController,
                                  decoration: const InputDecoration(
                                    labelText: 'Score',
                                    border: OutlineInputBorder(),
                                  ),
                                  keyboardType: TextInputType.number,
                                ),
                              ] else ...[
                                _InfoRow(label: 'Status', value: _lead!['status'] ?? 'NEW'),
                                _InfoRow(label: 'Score', value: (_lead!['score'] ?? 0).toString()),
                                if (_lead!['createdAt'] != null)
                                  _InfoRow(label: 'Created', value: _formatDate(_lead!['createdAt'])),
                              ],
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
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

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary)),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
