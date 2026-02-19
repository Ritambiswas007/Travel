import { prisma } from '../../config/prisma';
import { notificationsRepository } from './repository';
import { sendNotification } from '../../utils/notifications';
import type { Prisma } from '@prisma/client';
import type { SendNotificationDto, ListNotificationsQueryDto } from './dto';

export const notificationsService = {
  async send(dto: SendNotificationDto) {
    const notif = await notificationsRepository.createNotification({
      title: dto.title,
      body: dto.body,
      type: dto.type ?? 'GENERAL',
      channel: dto.channel ?? 'push',
      data: dto.data as Prisma.JsonObject | undefined,
    });
    if (dto.userId) {
      await notificationsRepository.createUserNotification(dto.userId, notif.id);
      const user = await prisma.user.findUnique({
        where: { id: dto.userId },
        select: { email: true, phone: true },
      });
      await sendNotification({
        userId: dto.userId,
        email: user?.email ?? undefined,
        phone: user?.phone ?? undefined,
        title: dto.title,
        body: dto.body,
        data: dto.data,
        channels: dto.channel ? [dto.channel] : ['push'],
      });
    }
    return notif;
  },

  async listByUser(userId: string, query: ListNotificationsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return notificationsRepository.listByUser(userId, {
      page,
      limit,
      unreadOnly: query.unreadOnly,
    });
  },

  async markRead(userId: string, notificationId: string) {
    return notificationsRepository.markRead(userId, notificationId);
  },
};
