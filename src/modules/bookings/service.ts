import { prisma } from '../../config/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { bookingsRepository } from './repository';
import { couponsService } from '../coupons/service';
import type { CreateBookingDto, UpdateBookingStepDto, ApplyCouponDto, ListBookingsQueryDto } from './dto';
import { BookingStatus } from '@prisma/client';

export const bookingsService = {
  async create(userId: string, dto: CreateBookingDto) {
    const variant = await prisma.packageVariant.findFirst({
      where: { id: dto.packageVariantId },
      include: { package: true },
    });
    if (!variant) {
      throw Object.assign(new Error('Package variant not found'), { statusCode: 404 });
    }
    const schedule = await prisma.packageSchedule.findFirst({
      where: { id: dto.packageScheduleId, packageId: variant.packageId, isActive: true },
    });
    if (!schedule || schedule.availableSeats < dto.travelers.length) {
      throw Object.assign(new Error('Schedule not available or insufficient seats'), { statusCode: 400 });
    }
    let totalAmount = new Decimal(variant.basePrice).mul(dto.travelers.length);
    let discountAmount = new Decimal(0);
    let couponId: string | null = null;

    if (dto.addons?.length) {
      for (const a of dto.addons) {
        totalAmount = totalAmount.add(new Decimal(a.amount).mul(a.quantity ?? 1));
      }
    }

    if (dto.couponCode) {
      const couponResult = await couponsService.apply(dto.couponCode, userId, totalAmount.toNumber());
      if (couponResult.applied && couponResult.discountAmount != null && couponResult.couponId) {
        discountAmount = new Decimal(couponResult.discountAmount);
        couponId = couponResult.couponId;
      }
    }

    const finalAmount = totalAmount.sub(discountAmount);

    return bookingsRepository.create({
      userId,
      packageId: dto.packageId,
      packageScheduleId: dto.packageScheduleId,
      packageVariantId: dto.packageVariantId,
      totalAmount,
      discountAmount,
      finalAmount,
      couponId: couponId ?? undefined,
      specialRequests: dto.specialRequests,
      travelers: dto.travelers.map((t) => ({
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        dateOfBirth: t.dateOfBirth ? new Date(t.dateOfBirth) : undefined,
        passportNo: t.passportNo,
        passportExpiry: t.passportExpiry ? new Date(t.passportExpiry) : undefined,
        seatPreference: t.seatPreference,
      })),
      addons: dto.addons?.map((a) => ({
        name: a.name,
        description: a.description,
        amount: new Decimal(a.amount),
        quantity: a.quantity ?? 1,
        packageVariantId: a.packageVariantId,
      })),
    });
  },

  async getById(id: string, userId?: string) {
    const booking = await bookingsRepository.findById(id);
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    if (userId && booking.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403, isOperational: true });
    }
    return booking;
  },

  async listMyBookings(userId: string, query: ListBookingsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return bookingsRepository.listByUser(userId, {
      page,
      limit,
      status: query.status,
    });
  },

  async listAdmin(query: ListBookingsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return bookingsRepository.listAdmin({
      page,
      limit,
      status: query.status,
      userId: query.userId,
    });
  },

  async updateStep(bookingId: string, userId: string, dto: UpdateBookingStepDto) {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    if (booking.status !== 'DRAFT') {
      throw Object.assign(new Error('Booking cannot be updated'), { statusCode: 400 });
    }
    await bookingsRepository.updateStep(bookingId, dto.step);
    return bookingsRepository.findById(bookingId);
  },

  async applyCoupon(bookingId: string, userId: string, dto: ApplyCouponDto) {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    if (booking.status !== 'DRAFT') {
      throw Object.assign(new Error('Booking cannot be updated'), { statusCode: 400 });
    }
    const result = await couponsService.apply(dto.couponCode, userId, Number(booking.totalAmount));
    if (!result.applied) {
      throw Object.assign(new Error(result.reason ?? 'Coupon not applicable'), { statusCode: 400 });
    }
    const discount = result.discountAmount ?? 0;
    const newFinal = new Decimal(booking.totalAmount).sub(discount);
    await bookingsRepository.updateAmounts(bookingId, {
      couponId: result.couponId ?? undefined,
      discountAmount: new Decimal(discount),
      finalAmount: newFinal,
    });
    return bookingsRepository.findById(bookingId);
  },

  async confirm(bookingId: string, userId: string) {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    if (booking.status !== 'DRAFT') {
      throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
    }
    await bookingsRepository.updateStatus(bookingId, 'PENDING_PAYMENT');
    return bookingsRepository.findById(bookingId);
  },

  async cancel(bookingId: string, userId: string) {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking || booking.userId !== userId) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    if (!['DRAFT', 'PENDING_PAYMENT'].includes(booking.status)) {
      throw Object.assign(new Error('Booking cannot be cancelled'), { statusCode: 400 });
    }
    await bookingsRepository.updateStatus(bookingId, 'CANCELLED');
    return bookingsRepository.findById(bookingId);
  },
};
