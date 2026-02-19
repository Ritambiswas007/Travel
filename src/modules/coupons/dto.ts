export interface CreateCouponDto {
  code: string;
  description?: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom: string;
  validTo: string;
}

export interface UpdateCouponDto {
  description?: string;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}

export interface ApplyCouponResult {
  applied: boolean;
  discountAmount?: number;
  couponId?: string;
  reason?: string;
}
