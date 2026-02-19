export interface CreateOrderDto {
  bookingId: string;
  amount: number;
  currency?: string;
  idempotencyKey?: string;
}

export interface VerifyPaymentDto {
  paymentId: string;
  providerOrderId: string;
  providerPaymentId?: string;
  signature?: string;
}

export interface InitiateRefundDto {
  paymentId: string;
  amount: number;
  reason?: string;
}
