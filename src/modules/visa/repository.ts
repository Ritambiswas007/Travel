import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const visaRepository = {
  async create(data: Prisma.VisaApplicationCreateInput) {
    return prisma.visaApplication.create({
      data,
      include: { documents: true },
    });
  },

  async findById(id: string) {
    return prisma.visaApplication.findFirst({
      where: { id, deletedAt: null },
      include: { documents: true },
    });
  },

  async listByUser(userId: string) {
    return prisma.visaApplication.findMany({
      where: { userId, deletedAt: null },
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async update(id: string, data: Prisma.VisaApplicationUpdateInput) {
    return prisma.visaApplication.update({
      where: { id },
      data,
      include: { documents: true },
    });
  },

  async addDocument(visaApplicationId: string, data: Prisma.VisaDocumentCreateWithoutVisaApplicationInput) {
    return prisma.visaDocument.create({
      data: { visaApplicationId, ...data },
    });
  },
};
