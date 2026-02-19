import { prisma } from '../../config/prisma';
import { LeadStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const leadsRepository = {
  async create(data: Prisma.LeadCreateInput) {
    return prisma.lead.create({
      data,
      include: { source: true },
    });
  },

  async findById(id: string) {
    return prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: { source: true, assignments: { include: { staff: { include: { user: true } } } } },
    });
  },

  async list(params: { page: number; limit: number; status?: LeadStatus; sourceId?: string }) {
    const where: Prisma.LeadWhereInput = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.sourceId) where.sourceId = params.sourceId;
    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { source: true, assignments: { include: { staff: true } } },
      }),
      prisma.lead.count({ where }),
    ]);
    return { items, total };
  },

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({
      where: { id },
      data,
      include: { source: true },
    });
  },

  async assign(leadId: string, staffId: string) {
    await prisma.leadAssignment.upsert({
      where: { leadId },
      create: { leadId, staffId },
      update: { staffId },
    });
    return prisma.lead.findFirst({
      where: { id: leadId, deletedAt: null },
      include: { source: true, assignments: { include: { staff: { include: { user: true } } } } },
    });
  },

  async getUnassigned() {
    return prisma.lead.findMany({
      where: { deletedAt: null, assignments: { none: {} } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },
};
