import { prisma } from '../../config/prisma';
import { BookingStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const bookingsRepository = {
  async create(data: {
    userId: string;
    packageId: string;
    packageScheduleId: string;
    packageVariantId: string;
    totalAmount: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    finalAmount: Prisma.Decimal;
    couponId?: string;
    specialRequests?: string;
    travelers: Array<{
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      dateOfBirth?: Date;
      passportNo?: string;
      passportExpiry?: Date;
      seatPreference?: string;
    }>;
    addons?: Array<{
      name: string;
      description?: string;
      amount: Prisma.Decimal;
      quantity: number;
      packageVariantId?: string;
    }>;
  }) {
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        packageId: data.packageId,
        packageScheduleId: data.packageScheduleId,
        packageVariantId: data.packageVariantId,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
        couponId: data.couponId,
        specialRequests: data.specialRequests,
        status: 'DRAFT',
        bookingStep: 1,
        travelers: {
          create: data.travelers.map((t) => ({
            firstName: t.firstName,
            lastName: t.lastName,
            email: t.email,
            phone: t.phone,
            dateOfBirth: t.dateOfBirth,
            passportNo: t.passportNo,
            passportExpiry: t.passportExpiry,
            seatPreference: t.seatPreference,
          })),
        },
        addons: data.addons?.length
          ? {
              create: data.addons.map((a) => ({
                name: a.name,
                description: a.description,
                amount: a.amount,
                quantity: a.quantity ?? 1,
                packageVariantId: a.packageVariantId,
              })),
            }
          : undefined,
      },
      include: {
        package: true,
        packageSchedule: true,
        travelers: true,
        addons: true,
        coupon: true,
      },
    });
    return booking;
  },

  async findById(id: string) {
    return prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: { select: { id: true, email: true, phone: true } },
        package: true,
        packageSchedule: true,
        travelers: true,
        addons: true,
        coupon: true,
        payments: true,
        flightBooking: true,
        trainBooking: true,
        busBooking: true,
      },
    });
  },

  async listByUser(userId: string, params: { page: number; limit: number; status?: BookingStatus }) {
    const where: { userId: string; deletedAt: null; status?: BookingStatus } = {
      userId,
      deletedAt: null,
    };
    if (params.status) where.status = params.status;
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { package: true, packageSchedule: true },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  async listAdmin(params: { page: number; limit: number; status?: BookingStatus; userId?: string }) {
    const where: Prisma.BookingWhereInput = { deletedAt: null };
    if (params.status) where.status = params.status;
    if (params.userId) where.userId = params.userId;
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, phone: true } }, package: true },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total };
  },

  async updateStep(id: string, step: number) {
    return prisma.booking.update({
      where: { id },
      data: { bookingStep: step },
    });
  },

  async updateStatus(id: string, status: BookingStatus, completedAt?: Date) {
    return prisma.booking.update({
      where: { id },
      data: { status, completedAt },
    });
  },

  async updateAmounts(id: string, data: { totalAmount?: Prisma.Decimal; discountAmount?: Prisma.Decimal; finalAmount?: Prisma.Decimal; couponId?: string }) {
    return prisma.booking.update({
      where: { id },
      data,
    });
  },
};
