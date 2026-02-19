import { getRazorpayInstance, getPaymentProvider } from '../../config/payment';
import { prisma } from '../../config/prisma';
import { paymentsRepository } from './repository';
import { bookingsRepository } from '../bookings/repository';
import { couponsService } from '../coupons/service';
import type { CreateOrderDto, InitiateRefundDto } from './dto';
import { PaymentStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import crypto from 'crypto';

export const paymentsService = {
  async createOrder(dto: CreateOrderDto) {
    const booking = await prisma.booking.findFirst({
      where: { id: dto.bookingId, deletedAt: null },
      include: { coupon: true },
    });
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    if (booking.status !== 'PENDING_PAYMENT') {
      throw Object.assign(new Error('Booking not in payment state'), { statusCode: 400 });
    }
    const amountInPaise = Math.round((dto.amount || Number(booking.finalAmount)) * 100);
    if (dto.idempotencyKey) {
      const existing = await paymentsRepository.findByIdempotencyKey(dto.idempotencyKey);
      if (existing) {
        return { payment: existing, order: { orderId: existing.providerOrderId, amount: amountInPaise / 100 } };
      }
    }
    const provider = getPaymentProvider();
    if (provider === 'razorpay') {
      const razorpay = getRazorpayInstance();
      if (!razorpay) {
        throw Object.assign(new Error('Payment provider not configured'), { statusCode: 503 });
      }
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: dto.currency || 'INR',
        receipt: dto.bookingId,
        notes: { bookingId: dto.bookingId },
      });
      const payment = await paymentsRepository.create({
        bookingId: dto.bookingId,
        amount: new Decimal(amountInPaise / 100),
        currency: dto.currency || 'INR',
        provider: 'razorpay',
        providerOrderId: order.id,
        idempotencyKey: dto.idempotencyKey,
        metadata: JSON.parse(JSON.stringify(order)),
      });
      return {
        payment: { id: payment.id, orderId: order.id, amount: amountInPaise / 100 },
        order: { orderId: order.id, amount: amountInPaise / 100 },
      };
    }
    throw Object.assign(new Error('Payment provider not supported'), { statusCode: 503 });
  },

  async verifyWebhook(body: string, signature: string): Promise<boolean> {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) return false;
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  },

  async handleWebhook(payload: { event: string; payload: { payment?: { entity: { id: string; order_id: string; status: string } }; order?: { entity: { id: string } } } }) {
    if (payload.event === 'payment.captured' && payload.payload.payment?.entity) {
      const entity = payload.payload.payment.entity;
      const payment = await prisma.payment.findFirst({
        where: { providerOrderId: entity.order_id },
      });
      if (payment) {
        await paymentsRepository.updateStatus(
          payment.id,
          'SUCCEEDED',
          entity.id,
          new Date()
        );
        await bookingsRepository.updateStatus(payment.bookingId, 'CONFIRMED', new Date());
        const booking = await prisma.booking.findUnique({
          where: { id: payment.bookingId },
          include: { coupon: true },
        });
        if (booking?.couponId && booking.discountAmount != null) {
          await couponsService.recordUsage(
            booking.couponId,
            booking.userId,
            booking.id,
            Number(booking.discountAmount)
          );
        }
      }
    }
  },

  async getPayment(id: string) {
    const payment = await paymentsRepository.findById(id);
    if (!payment) {
      throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    }
    return payment;
  },

  async getByBookingId(bookingId: string) {
    return paymentsRepository.findByBookingId(bookingId);
  },

  async initiateRefund(dto: InitiateRefundDto) {
    const payment = await paymentsRepository.findById(dto.paymentId);
    if (!payment) {
      throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    }
    if (payment.status !== 'SUCCEEDED') {
      throw Object.assign(new Error('Payment cannot be refunded'), { statusCode: 400 });
    }
    const amount = new Decimal(dto.amount);
    const refund = await paymentsRepository.createRefund({
      paymentId: dto.paymentId,
      amount,
      reason: dto.reason,
      status: 'PENDING',
    });
    const razorpay = getRazorpayInstance();
    if (razorpay && payment.providerPaymentId) {
      try {
        const r = await razorpay.payments.refund(payment.providerPaymentId, {
          amount: Math.round(dto.amount * 100),
          notes: { reason: dto.reason ?? '' },
        }) as { id: string };
        await prisma.refund.update({
          where: { id: refund.id },
          data: { providerRefId: r.id, status: 'PROCESSED', processedAt: new Date() },
        });
      } catch {
        // keep refund as PENDING for manual processing
      }
    }
    return prisma.refund.findUnique({ where: { id: refund.id } });
  },
};
