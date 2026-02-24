import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/support_service.dart';

class SupportDetailScreen extends StatefulWidget {
  const SupportDetailScreen({super.key, required this.ticketId});

  final String ticketId;

  @override
  State<SupportDetailScreen> createState() => _SupportDetailScreenState();
}

class _SupportDetailScreenState extends State<SupportDetailScreen> {
  Map<String, dynamic>? _ticket;
  List<Map<String, dynamic>> _messages = [];
  bool _loading = true;
  final _messageController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadTicket();
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadTicket() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = SupportService(client);
      final ticket = await service.getTicketById(widget.ticketId);
      if (mounted && ticket != null) {
        setState(() {
          _ticket = ticket;
          _messages = (ticket['messages'] as List<dynamic>?)?.map((e) => e as Map<String, dynamic>).toList() ?? [];
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load ticket: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _sendReply() async {
    if (_messageController.text.trim().isEmpty) return;
    final message = _messageController.text.trim();
    _messageController.clear();

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = SupportService(client);
      final success = await service.replyToTicket(widget.ticketId, message);
      if (mounted) {
        if (success) {
          _loadTicket();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to send message'), backgroundColor: Colors.red),
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

  Future<void> _closeTicket() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Close Ticket'),
        content: const Text('Are you sure you want to close this ticket?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Close', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = SupportService(client);
      final success = await service.closeTicket(widget.ticketId);
      if (mounted) {
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Ticket closed'), backgroundColor: Colors.green),
          );
          _loadTicket();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to close ticket'), backgroundColor: Colors.red),
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
        title: const Text('Support Ticket'),
        actions: [
          if (_ticket != null && _ticket!['status'] != 'CLOSED')
            IconButton(
              icon: const Icon(Icons.close),
              onPressed: _closeTicket,
              tooltip: 'Close ticket',
            ),
        ],
      ),
      body: _loading && _ticket == null
          ? const Center(child: CircularProgressIndicator())
          : _ticket == null
              ? const Center(child: Text('Ticket not found'))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
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
                                        Expanded(
                                          child: Text(
                                            _ticket!['subject'] ?? 'No Subject',
                                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          decoration: BoxDecoration(
                                            color: _getStatusColor(_ticket!['status']).withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            _ticket!['status'] ?? 'OPEN',
                                            style: TextStyle(
                                              color: _getStatusColor(_ticket!['status']),
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    if (_ticket!['priority'] != null)
                                      _InfoRow(label: 'Priority', value: _ticket!['priority']),
                                    if (_ticket!['createdAt'] != null)
                                      _InfoRow(label: 'Created', value: _formatDate(_ticket!['createdAt'])),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 20),
                            const Text('Messages', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 12),
                            if (_messages.isEmpty)
                              const Card(child: Padding(padding: EdgeInsets.all(20), child: Text('No messages yet')))
                            else
                              ..._messages.map((msg) => Card(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    child: ListTile(
                                      leading: CircleAvatar(
                                        backgroundColor: (msg['isStaff'] == true) ? AppColors.primary : Colors.grey,
                                        child: Icon(
                                          (msg['isStaff'] == true) ? Icons.support_agent : Icons.person,
                                          color: Colors.white,
                                        ),
                                      ),
                                      title: Text(
                                        (msg['isStaff'] == true) ? 'Staff' : 'Customer',
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          const SizedBox(height: 4),
                                          Text(msg['message'] ?? ''),
                                          if (msg['createdAt'] != null)
                                            Padding(
                                              padding: const EdgeInsets.only(top: 4),
                                              child: Text(
                                                _formatDate(msg['createdAt']),
                                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                  )),
                          ],
                        ),
                      ),
                    ),
                    if (_ticket != null && _ticket!['status'] != 'CLOSED')
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, -2))],
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _messageController,
                                decoration: InputDecoration(
                                  hintText: 'Type your reply...',
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                ),
                                maxLines: null,
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              onPressed: _sendReply,
                              icon: const Icon(Icons.send),
                              color: AppColors.primary,
                              style: IconButton.styleFrom(
                                backgroundColor: AppColors.primary.withOpacity(0.1),
                                padding: const EdgeInsets.all(12),
                              ),
                            ),
                          ],
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
      return '${d.day}/${d.month}/${d.year} ${d.hour}:${d.minute.toString().padLeft(2, '0')}';
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
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
