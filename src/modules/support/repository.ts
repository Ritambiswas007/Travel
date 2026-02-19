import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const supportRepository = {
  async create(data: Prisma.SupportTicketCreateInput) {
    return prisma.supportTicket.create({
      data,
      include: { messages: true },
    });
  },

  async findById(id: string) {
    return prisma.supportTicket.findUnique({
      where: { id },
      include: { user: true, messages: { orderBy: { createdAt: 'asc' } } },
    });
  },

  async listByUser(userId: string, params: { page: number; limit: number }) {
    const [items, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where: { userId },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      }),
      prisma.supportTicket.count({ where: { userId } }),
    ]);
    return { items, total };
  },

  async addMessage(data: Prisma.ChatMessageCreateInput) {
    return prisma.chatMessage.create({
      data,
      include: { ticket: true },
    });
  },

  async updateTicketStatus(id: string, status: string, closedAt?: Date) {
    return prisma.supportTicket.update({
      where: { id },
      data: { status, closedAt },
    });
  },
};
