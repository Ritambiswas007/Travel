import { DocumentStatus } from '@prisma/client';

export interface CreateDocumentTypeDto {
  name: string;
  code: string;
  description?: string;
  validationRules?: Record<string, unknown>;
  isRequired?: boolean;
  expiresInDays?: number;
}

export interface UploadDocumentDto {
  documentTypeId: string;
  file: Express.Multer.File;
}

export interface UpdateDocumentStatusDto {
  status: DocumentStatus;
  rejectedReason?: string;
}
