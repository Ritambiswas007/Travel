import Razorpay from 'razorpay';
import { config } from './env';

let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay | null {
  if (config.payment.provider !== 'razorpay') {
    return null;
  }
  if (
    !config.payment.razorpay.keyId ||
    !config.payment.razorpay.keySecret
  ) {
    return null;
  }
  if (razorpayInstance) {
    return razorpayInstance;
  }
  razorpayInstance = new Razorpay({
    key_id: config.payment.razorpay.keyId,
    key_secret: config.payment.razorpay.keySecret,
  });
  return razorpayInstance;
}

export function getPaymentProvider(): 'razorpay' | 'cashfree' {
  return config.payment.provider;
}

export function getWebhookSecret(): string | undefined {
  return config.payment.webhookSecret;
}

export interface CreateOrderParams {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  provider: string;
}
