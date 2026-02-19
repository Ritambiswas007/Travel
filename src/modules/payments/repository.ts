import { prisma } from '../../config/prisma';
import { PaymentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const paymentsRepository = {
  async create(data: {
    bookingId: string;
    amount: Prisma.Decimal;
    currency: string;
    provider: string;
    providerOrderId?: string;
    idempotencyKey?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.payment.create({
      data: {
        ...data,
        status: 'PENDING',
      },
    });
  },

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
  },

  async findByBookingId(bookingId: string) {
    return prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findByIdempotencyKey(key: string) {
    return prisma.payment.findUnique({
      where: { idempotencyKey: key },
    });
  },

  async updateStatus(id: string, status: PaymentStatus, providerPaymentId?: string, paidAt?: Date) {
    return prisma.payment.update({
      where: { id },
      data: { status, providerPaymentId, paidAt },
    });
  },

  async createRefund(data: { paymentId: string; amount: Prisma.Decimal; reason?: string; providerRefId?: string; status?: string }) {
    return prisma.refund.create({ data });
  },

  async createTransaction(data: { paymentId: string; type: string; amount: Prisma.Decimal; providerTxnId?: string; metadata?: Prisma.InputJsonValue }) {
    return prisma.transaction.create({ data });
  },
};
