import { BookingStatus } from '@prisma/client';

export interface CreateBookingDto {
  packageId: string;
  packageScheduleId: string;
  packageVariantId: string;
  travelers: TravelerDto[];
  addons?: AddonDto[];
  couponCode?: string;
  specialRequests?: string;
}

export interface TravelerDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  passportNo?: string;
  passportExpiry?: string;
  seatPreference?: string;
}

export interface AddonDto {
  name: string;
  description?: string;
  amount: number;
  quantity?: number;
  packageVariantId?: string;
}

export interface UpdateBookingStepDto {
  step: number;
  travelers?: TravelerDto[];
  addons?: AddonDto[];
  specialRequests?: string;
}

export interface ApplyCouponDto {
  couponCode: string;
}

export interface ListBookingsQueryDto {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  userId?: string;
}
