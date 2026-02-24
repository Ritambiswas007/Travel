import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/user_service.dart';
import 'package:go_router/go_router.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  bool _isEditing = false;
  bool _isLoading = false;
  Map<String, dynamic>? _profile;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = UserService(client);
      final profile = await service.getMyProfile();
      if (mounted && profile != null) {
        setState(() {
          _profile = profile;
          _nameController.text = profile['name'] ?? '';
          _emailController.text = profile['email'] ?? '';
          _phoneController.text = profile['phone'] ?? '';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load profile: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = UserService(client);
      final updated = await service.updateMyProfile(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
      );
      if (mounted && updated != null) {
        setState(() {
          _profile = updated;
          _isEditing = false;
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully'), backgroundColor: Colors.green),
        );
        // Refresh auth provider
        authProvider.loadStoredAuth();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update profile: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.user;
    final userName = user?.name ?? 'Staff';
    final userEmail = user?.email ?? '';
    final userRole = user?.role ?? 'STAFF';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          if (_isEditing)
            TextButton(
              onPressed: _isLoading ? null : () => setState(() => _isEditing = false),
              child: const Text('Cancel'),
            ),
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: () => setState(() => _isEditing = true),
            ),
          if (_isEditing)
            TextButton(
              onPressed: _isLoading ? null : _saveProfile,
              child: _isLoading
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                  : const Text('Save'),
            ),
        ],
      ),
      body: _isLoading && _profile == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 50,
                            backgroundColor: AppColors.primary,
                            child: Text(
                              userName.isNotEmpty ? userName.substring(0, 1).toUpperCase() : 'S',
                              style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.white),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            userName,
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              userRole,
                              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),
                    const Text('Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Full Name',
                        prefixIcon: Icon(Icons.person),
                        border: OutlineInputBorder(),
                      ),
                      enabled: _isEditing,
                      validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email),
                        border: OutlineInputBorder(),
                      ),
                      enabled: _isEditing,
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Email is required';
                        if (!v.contains('@')) return 'Invalid email';
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _phoneController,
                      decoration: const InputDecoration(
                        labelText: 'Phone',
                        prefixIcon: Icon(Icons.phone),
                        border: OutlineInputBorder(),
                      ),
                      enabled: _isEditing,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 32),
                    const Divider(),
                    const SizedBox(height: 16),
                    const Text('More Options', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ListTile(
                      leading: const Icon(Icons.support_agent, color: AppColors.primary),
                      title: const Text('Support Tickets'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/support-list'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.description, color: AppColors.primary),
                      title: const Text('Documents'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/documents'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.article, color: AppColors.primary),
                      title: const Text('Forms'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/forms'),
                    ),
                    ListTile(
                      leading: const Icon(Icons.notifications, color: AppColors.primary),
                      title: const Text('Notifications'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/notifications'),
                    ),
                    const Divider(),
                    const SizedBox(height: 16),
                    ListTile(
                      leading: const Icon(Icons.logout, color: Colors.red),
                      title: const Text('Logout', style: TextStyle(color: Colors.red)),
                      onTap: () {
                        authProvider.logout();
                        context.go('/login');
                      },
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
