import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = NotificationService(client);
      final notifications = await service.listMyNotifications();
      if (mounted) {
        setState(() {
          _notifications = notifications;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load notifications: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _markAsRead(String notificationId) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = NotificationService(client);
      await service.markAsRead(notificationId);
      _loadNotifications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to mark as read: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: () {
              // TODO: Show send notification dialog
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Send notification feature coming soon')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadNotifications,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _notifications.isEmpty
              ? const Center(child: Text('No notifications found'))
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _notifications.length,
                    itemBuilder: (context, index) {
                      final notification = _notifications[index];
                      final isRead = notification['readAt'] != null;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        color: isRead ? null : AppColors.primary.withOpacity(0.05),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: CircleAvatar(
                            backgroundColor: AppColors.primary.withOpacity(0.1),
                            child: const Icon(Icons.notifications, color: AppColors.primary),
                          ),
                          title: Text(
                            notification['title'] ?? 'No Title',
                            style: TextStyle(
                              fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (notification['body'] != null) Text(notification['body']),
                              if (notification['createdAt'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 4),
                                  child: Text(
                                    _formatDate(notification['createdAt']),
                                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                  ),
                                ),
                            ],
                          ),
                          trailing: isRead
                              ? null
                              : IconButton(
                                  icon: const Icon(Icons.circle, size: 12, color: AppColors.primary),
                                  onPressed: () => _markAsRead(notification['id']),
                                ),
                          onTap: () {
                            if (!isRead) {
                              _markAsRead(notification['id']);
                            }
                          },
                        ),
                      );
                    },
                  ),
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
