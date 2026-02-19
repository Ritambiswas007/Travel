import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const reportsRepository = {
  async create(data: Prisma.ReportCreateInput) {
    return prisma.report.create({ data });
  },

  async findById(id: string) {
    return prisma.report.findUnique({ where: { id } });
  },

  async list(params: { page: number; limit: number; type?: string }) {
    const where: Prisma.ReportWhereInput = {};
    if (params.type) where.type = params.type;
    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.report.count({ where }),
    ]);
    return { items, total };
  },

  async updateStatus(id: string, status: string, fileUrl?: string) {
    return prisma.report.update({
      where: { id },
      data: { status, fileUrl, generatedAt: new Date() },
    });
  },
};
