import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/form_service.dart';
import 'form_detail_screen.dart';

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
            onPressed: _showCreateFormDialog,
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
                          onTap: () => Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => FormDetailScreen(formId: form['id'] as String),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Future<void> _showCreateFormDialog() async {
    final nameController = TextEditingController();
    final codeController = TextEditingController();
    final descriptionController = TextEditingController();

    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Create form'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: codeController,
                  decoration: const InputDecoration(labelText: 'Code'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: descriptionController,
                  decoration: const InputDecoration(labelText: 'Description'),
                  maxLines: 2,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Create'),
            ),
          ],
        );
      },
    );

    if (result != true) return;

    final name = nameController.text.trim();
    final code = codeController.text.trim();
    final description = descriptionController.text.trim().isEmpty ? null : descriptionController.text.trim();

    if (name.isEmpty || code.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Name and code are required'), backgroundColor: Colors.red),
      );
      return;
    }

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = FormService(client);
      final created = await service.createForm(name: name, code: code, description: description);
      if (created != null) {
        _loadForms();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Form created')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create form'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create form: ${e.toString()}'), backgroundColor: Colors.red),
      );
    }
  }
}
