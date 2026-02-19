import { prisma } from '../../config/prisma';

export const staffRepository = {
  async list(params: { page: number; limit: number; isActive?: boolean; search?: string }) {
    const where: { deletedAt: null; isActive?: boolean; user?: { OR?: Array<{ email?: { contains: string; mode: 'insensitive' }; phone?: { contains: string } }> } } = {
      deletedAt: null,
    };
    if (params.isActive !== undefined) where.isActive = params.isActive;
    if (params.search) {
      where.user = {
        OR: [
          { email: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search } },
        ],
      };
    }
    const [items, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, phone: true, isActive: true },
          },
        },
      }),
      prisma.staff.count({ where }),
    ]);
    return { items, total };
  },

  async findById(id: string) {
    return prisma.staff.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, phone: true, isActive: true, createdAt: true } },
      },
    });
  },

  async update(id: string, data: { name?: string; department?: string; isActive?: boolean }) {
    return prisma.staff.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, email: true, phone: true, isActive: true } },
      },
    });
  },
};
