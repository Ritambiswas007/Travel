import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:travel_pilgrimage_app/core/services/document_service.dart';
import 'package:travel_pilgrimage_app/core/theme.dart';
import 'package:travel_pilgrimage_app/core/auth_provider.dart';

class DocumentTypeDetailScreen extends StatefulWidget {
  const DocumentTypeDetailScreen({super.key, required this.typeId});

  final String typeId;

  @override
  State<DocumentTypeDetailScreen> createState() => _DocumentTypeDetailScreenState();
}

class _DocumentTypeDetailScreenState extends State<DocumentTypeDetailScreen> {
  Map<String, dynamic>? _type;
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
      final service = DocumentService(client);
      final t = await service.getDocumentTypeById(widget.typeId);
      if (mounted) {
        setState(() {
          _type = t;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load document type: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Document type'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _type == null
              ? const Center(child: Text('Document type not found'))
              : Padding(
                  padding: const EdgeInsets.all(16),
                  child: Card(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 1,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _type!['name'] ?? 'Unknown',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (_type!['code'] != null)
                            Text(
                              'Code: ${_type!['code']}',
                              style: const TextStyle(color: AppColors.textSecondary),
                            ),
                          const SizedBox(height: 12),
                          if (_type!['description'] != null)
                            Text(
                              _type!['description'],
                              style: const TextStyle(color: AppColors.textPrimary),
                            ),
                          const SizedBox(height: 12),
                          if (_type!['isRequired'] == true)
                            const Chip(
                              label: Text('Required'),
                              backgroundColor: Colors.red,
                              labelStyle: TextStyle(color: Colors.white),
                            ),
                          if (_type!['expiresInDays'] != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              'Expires in: ${_type!['expiresInDays']} days',
                              style: const TextStyle(color: AppColors.textSecondary),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }
}

