import { documentsRepository } from './repository';
import { generateChecklistPdf } from '../../utils/pdf';
import type { CreateDocumentTypeDto, UploadDocumentDto, UpdateDocumentStatusDto } from './dto';
import type { Prisma } from '@prisma/client';
import { uploadDocument } from '../../utils/storage';
import { isSupabaseEnabled } from '../../config/supabase';

export const documentsService = {
  async createType(dto: CreateDocumentTypeDto) {
    const existing = await documentsRepository.findTypeByCode(dto.code);
    if (existing) {
      throw Object.assign(new Error('Document type code already exists'), { statusCode: 409 });
    }
    return documentsRepository.createType({
      name: dto.name,
      code: dto.code.toUpperCase().trim(),
      description: dto.description,
      validationRules: dto.validationRules as Prisma.JsonObject | undefined,
      isRequired: dto.isRequired ?? false,
      expiresInDays: dto.expiresInDays,
    });
  },

  async getTypeById(id: string) {
    const doc = await documentsRepository.findTypeById(id);
    if (!doc) {
      throw Object.assign(new Error('Document type not found'), { statusCode: 404 });
    }
    return doc;
  },

  async listTypes() {
    return documentsRepository.listTypes();
  },

  async upload(userId: string, dto: UploadDocumentDto) {
    if (!isSupabaseEnabled()) {
      throw Object.assign(
        new Error(
          'Document storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to a .env file in the backend project root (same folder as package.json), then restart the server.'
        ),
        { statusCode: 503, isOperational: true }
      );
    }
    const docType = await documentsRepository.findTypeById(dto.documentTypeId);
    if (!docType) {
      throw Object.assign(new Error('Document type not found'), { statusCode: 404 });
    }
    let fileUrl: string;
    try {
      // Upload file to storage (Supabase or configured storage backend)
      fileUrl = await uploadDocument(
        userId,
        dto.file.buffer,
        dto.file.mimetype,
        dto.file.originalname
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : 'File upload failed';
      if (message.includes('Supabase storage not configured')) {
        throw Object.assign(
          new Error('Document storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env and restart the server.'),
          { statusCode: 503, isOperational: true }
        );
      }
      if (message.includes('fetch failed')) {
        throw Object.assign(
          new Error(
            'Cannot reach Supabase. Check your internet connection and ensure your Supabase project is active (free projects can be paused in the dashboard).'
          ),
          { statusCode: 502, isOperational: true }
        );
      }
      throw Object.assign(new Error(message.startsWith('Upload failed:') ? message : `File upload failed: ${message}`), {
        statusCode: 502,
        isOperational: true,
      });
    }
    
    const expiresInDays = docType.expiresInDays ?? undefined;
    const expiryDate = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400000)
      : undefined;
    
    return documentsRepository.createUserDocument({
      user: { connect: { id: userId } },
      documentType: { connect: { id: dto.documentTypeId } },
      fileUrl,
      storagePath: undefined,
      status: 'SUBMITTED',
      expiryDate,
    });
  },

  async getById(id: string, userId?: string) {
    const doc = await documentsRepository.findUserDocumentById(id);
    if (!doc) {
      throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }
    if (userId && doc.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    return doc;
  },

  async listByUser(userId: string) {
    return documentsRepository.listByUser(userId);
  },

  async updateStatus(id: string, dto: UpdateDocumentStatusDto, reviewedBy: string) {
    const doc = await documentsRepository.findUserDocumentById(id);
    if (!doc) {
      throw Object.assign(new Error('Document not found'), { statusCode: 404 });
    }
    if (dto.status === 'REJECTED' && !dto.rejectedReason) {
      throw Object.assign(new Error('Rejection reason required'), { statusCode: 400 });
    }
    const updated = await documentsRepository.updateStatus(
      id,
      dto.status,
      dto.rejectedReason,
      reviewedBy
    );
    await documentsRepository.createVerificationLog({
      userDocument: { connect: { id } },
      action: dto.status,
      performedBy: reviewedBy,
      notes: dto.rejectedReason,
    });
    return updated;
  },

  async generateChecklistPdf(userId: string) {
    const docs = await documentsRepository.listByUser(userId);
    const items = docs.map((d) => ({
      label: `${d.documentType.name}: ${d.status}`,
      checked: d.status === 'APPROVED',
    }));
    return generateChecklistPdf('Document Checklist', items);
  },
};
