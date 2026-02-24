import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/document_service.dart';
import 'document_type_detail_screen.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  List<Map<String, dynamic>> _documentTypes = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDocumentTypes();
  }

  Future<void> _loadDocumentTypes() async {
    if (!mounted) return;
    setState(() => _loading = true);
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final client = authProvider.apiClient;
      final service = DocumentService(client);
      final types = await service.listDocumentTypes();
      if (mounted) {
        setState(() {
          _documentTypes = types;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load document types: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Document Types'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showCreateDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDocumentTypes,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _documentTypes.isEmpty
              ? const Center(child: Text('No document types found'))
              : RefreshIndicator(
                  onRefresh: _loadDocumentTypes,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _documentTypes.length,
                    itemBuilder: (context, index) {
                      final type = _documentTypes[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          leading: const Icon(Icons.description, color: AppColors.primary),
                          title: Text(
                            type['name'] ?? 'Unknown',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (type['code'] != null) Text('Code: ${type['code']}'),
                              if (type['description'] != null) Text(type['description']),
                              if (type['isRequired'] == true)
                                const Padding(
                                  padding: EdgeInsets.only(top: 4),
                                  child: Chip(
                                    label: Text('Required', style: TextStyle(fontSize: 12)),
                                    backgroundColor: Colors.red,
                                    labelStyle: TextStyle(color: Colors.white),
                                  ),
                                ),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => DocumentTypeDetailScreen(typeId: type['id'] as String),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Future<void> _showCreateDialog() async {
    final nameController = TextEditingController();
    final codeController = TextEditingController();
    final descriptionController = TextEditingController();
    bool isRequired = false;
    int? expiresInDays;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Create document type'),
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
                const SizedBox(height: 8),
                Row(
                  children: [
                    StatefulBuilder(
                      builder: (context, setInnerState) {
                        return Checkbox(
                          value: isRequired,
                          onChanged: (v) {
                            setInnerState(() {
                              isRequired = v ?? false;
                            });
                          },
                        );
                      },
                    ),
                    const Text('Required'),
                  ],
                ),
                const SizedBox(height: 4),
                TextField(
                  decoration: const InputDecoration(
                    labelText: 'Expires in days (optional)',
                  ),
                  keyboardType: TextInputType.number,
                  onChanged: (v) {
                    expiresInDays = int.tryParse(v.trim());
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
      final service = DocumentService(client);
      final created = await service.createDocumentType(
        name: name,
        code: code,
        description: description,
        isRequired: isRequired,
        expiresInDays: expiresInDays,
      );
      if (created != null) {
        _loadDocumentTypes();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Document type created')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create document type'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create document type: ${e.toString()}'), backgroundColor: Colors.red),
      );
    }
  }
}
