import { Decimal } from '@prisma/client/runtime/library';
import { couponsRepository } from './repository';
import type { CreateCouponDto, UpdateCouponDto, ApplyCouponResult } from './dto';

export const couponsService = {
  async apply(couponCode: string, userId: string, orderAmount: number): Promise<ApplyCouponResult> {
    const coupon = await couponsRepository.findByCode(couponCode);
    if (!coupon) {
      return { applied: false, reason: 'Invalid coupon' };
    }
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validTo) {
      return { applied: false, reason: 'Coupon expired or not yet valid' };
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return { applied: false, reason: 'Coupon usage limit reached' };
    }
    const minOrder = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : 0;
    if (orderAmount < minOrder) {
      return { applied: false, reason: `Minimum order amount is ${minOrder}` };
    }
    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = (orderAmount * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }
    if (discount > orderAmount) discount = orderAmount;
    return {
      applied: true,
      discountAmount: discount,
      couponId: coupon.id,
    };
  },

  async create(dto: CreateCouponDto) {
    const code = dto.code.toUpperCase().trim();
    const existing = await couponsRepository.findByCode(code);
    if (existing) {
      throw Object.assign(new Error('Coupon code already exists'), { statusCode: 409 });
    }
    return couponsRepository.create({
      code,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderAmount: dto.minOrderAmount,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      validFrom: new Date(dto.validFrom),
      validTo: new Date(dto.validTo),
    });
  },

  async getById(id: string) {
    const coupon = await couponsRepository.findById(id);
    if (!coupon) {
      throw Object.assign(new Error('Coupon not found'), { statusCode: 404 });
    }
    return coupon;
  },

  async list(query: { page?: number; limit?: number; isActive?: boolean }) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    return couponsRepository.list({ page, limit, isActive: query.isActive });
  },

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await couponsRepository.findById(id);
    if (!coupon) {
      throw Object.assign(new Error('Coupon not found'), { statusCode: 404 });
    }
    return couponsRepository.update(id, {
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      minOrderAmount: dto.minOrderAmount,
      maxDiscount: dto.maxDiscount,
      usageLimit: dto.usageLimit,
      validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
      validTo: dto.validTo ? new Date(dto.validTo) : undefined,
      isActive: dto.isActive,
    });
  },

  async recordUsage(couponId: string, userId: string, bookingId: string, discountAmount: number) {
    await couponsRepository.incrementUsage(couponId);
    return couponsRepository.recordUsage(couponId, userId, bookingId, new Decimal(discountAmount));
  },
};
