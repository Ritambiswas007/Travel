import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/form_service.dart';

class FormsScreen extends StatefulWidget {
  const FormsScreen({super.key});

  @override
  State<FormsScreen> createState() => _FormsScreenState();
}

class _FormsScreenState extends State<FormsScreen> {
  List<Map<String, dynamic>> _forms = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadForms();
  }

  Future<void> _loadForms() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = FormService(client);
      final forms = await service.listForms();
      if (mounted) {
        setState(() {
          _forms = forms;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load forms: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Forms'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Show create form dialog
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Create form feature coming soon')),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadForms,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _forms.isEmpty
              ? const Center(child: Text('No forms found'))
              : RefreshIndicator(
                  onRefresh: _loadForms,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _forms.length,
                    itemBuilder: (context, index) {
                      final form = _forms[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: const Icon(Icons.article, color: AppColors.primary),
                          title: Text(
                            form['name'] ?? 'Unknown',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (form['code'] != null) Text('Code: ${form['code']}'),
                              if (form['description'] != null) Text(form['description']),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () {
                            // TODO: Navigate to form details
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
