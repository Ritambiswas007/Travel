import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';
import 'package:travel_pilgrimage_app/core/services/document_service.dart';

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
            onPressed: () {
              // TODO: Show create document type dialog
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Create document type feature coming soon')),
              );
            },
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
                          onTap: () {
                            // TODO: Navigate to document type details
                          },
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
