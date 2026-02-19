import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export const notificationsRepository = {
  async createNotification(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  },

  async createUserNotification(userId: string, notificationId: string) {
    return prisma.userNotification.create({
      data: { userId, notificationId },
      include: { notification: true },
    });
  },

  async listByUser(userId: string, params: { page: number; limit: number; unreadOnly?: boolean }) {
    const where: Prisma.UserNotificationWhereInput = { userId };
    if (params.unreadOnly) where.readAt = null;
    const [items, total] = await Promise.all([
      prisma.userNotification.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { notification: true },
      }),
      prisma.userNotification.count({ where }),
    ]);
    return { items, total };
  },

  async markRead(userId: string, notificationId: string) {
    return prisma.userNotification.updateMany({
      where: { userId, notificationId },
      data: { readAt: new Date() },
    });
  },
};
