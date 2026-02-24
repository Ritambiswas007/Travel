import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/form_service.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';

class FormDetailScreen extends StatefulWidget {
  const FormDetailScreen({super.key, required this.formId});

  final String formId;

  @override
  State<FormDetailScreen> createState() => _FormDetailScreenState();
}

class _FormDetailScreenState extends State<FormDetailScreen> {
  Map<String, dynamic>? _form;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = FormService(client);
      final f = await service.getFormById(widget.formId);
      if (mounted) {
        setState(() {
          _form = f;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load form: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _showAddFieldDialog() async {
    if (_form == null) return;
    final nameController = TextEditingController();
    final labelController = TextEditingController();
    final typeController = TextEditingController(text: 'text');
    bool required = false;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add field'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Name (key)'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: labelController,
                  decoration: const InputDecoration(labelText: 'Label'),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: typeController,
                  decoration: const InputDecoration(labelText: 'Type (text, textarea, select, email, number)'),
                ),
                const SizedBox(height: 8),
                StatefulBuilder(
                  builder: (context, setInner) {
                    return CheckboxListTile(
                      value: required,
                      onChanged: (v) => setInner(() => required = v ?? false),
                      title: const Text('Required'),
                      contentPadding: EdgeInsets.zero,
                    );
                  },
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
              child: const Text('Add'),
            ),
          ],
        );
      },
    );

    if (result != true) return;
    final name = nameController.text.trim();
    final label = labelController.text.trim();
    final type = typeController.text.trim();
    if (name.isEmpty || label.isEmpty || type.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Name, label and type are required'), backgroundColor: Colors.red),
      );
      return;
    }

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = FormService(client);
      await service.addFieldToForm(
        widget.formId,
        name: name,
        label: label,
        type: type,
        required: required,
      );
      _load();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Field added')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to add field: ${e.toString()}'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Form details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showAddFieldDialog,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _form == null
              ? const Center(child: Text('Form not found'))
              : Padding(
                  padding: const EdgeInsets.all(16),
                  child: ListView(
                    children: [
                      Card(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 1,
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _form!['name'] ?? 'Unknown',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              if (_form!['code'] != null)
                                Text(
                                  'Code: ${_form!['code']}',
                                  style: const TextStyle(color: AppColors.textSecondary),
                                ),
                              if (_form!['description'] != null) ...[
                                const SizedBox(height: 8),
                                Text(
                                  _form!['description'],
                                  style: const TextStyle(color: AppColors.textPrimary),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Fields',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 8),
                      if ((_form!['fields'] as List?) == null || (_form!['fields'] as List).isEmpty)
                        const Text('No fields added yet', style: TextStyle(color: AppColors.textSecondary))
                      else
                        ...(_form!['fields'] as List).map((f) {
                          final field = f as Map<String, dynamic>;
                          return Card(
                            margin: const EdgeInsets.only(top: 8),
                            child: ListTile(
                              leading: const Icon(Icons.drag_indicator),
                              title: Text(field['label'] ?? field['name'] ?? 'Field'),
                              subtitle: Text(
                                'Type: ${field['type'] ?? 'unknown'}${field['required'] == true ? ' • Required' : ''}',
                              ),
                            ),
                          );
                        }),
                    ],
                  ),
                ),
    );
  }
}

