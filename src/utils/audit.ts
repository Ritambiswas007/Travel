import { prisma } from '../config/prisma';
import type { Prisma } from '@prisma/client';

export async function auditLog(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      oldValue: params.oldValue as Prisma.JsonObject | undefined,
      newValue: params.newValue as Prisma.JsonObject | undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
