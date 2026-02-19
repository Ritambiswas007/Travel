import { prisma } from '../../config/prisma';
import { DocumentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const documentsRepository = {
  async createType(data: Prisma.DocumentTypeCreateInput) {
    return prisma.documentType.create({ data });
  },

  async findTypeById(id: string) {
    return prisma.documentType.findUnique({ where: { id } });
  },

  async findTypeByCode(code: string) {
    return prisma.documentType.findUnique({ where: { code } });
  },

  async listTypes() {
    return prisma.documentType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  },

  async createUserDocument(data: Prisma.UserDocumentCreateInput) {
    return prisma.userDocument.create({
      data,
      include: { documentType: true },
    });
  },

  async findUserDocumentById(id: string) {
    return prisma.userDocument.findUnique({
      where: { id },
      include: { documentType: true, user: true },
    });
  },

  async listByUser(userId: string) {
    return prisma.userDocument.findMany({
      where: { userId },
      include: { documentType: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(id: string, status: DocumentStatus, rejectedReason?: string, reviewedBy?: string) {
    return prisma.userDocument.update({
      where: { id },
      data: { status, rejectedReason, reviewedAt: new Date(), reviewedBy },
      include: { documentType: true },
    });
  },

  async createVerificationLog(data: Prisma.VerificationLogCreateInput) {
    return prisma.verificationLog.create({ data });
  },
};
