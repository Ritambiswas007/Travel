import { randomInt } from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export function generateOtp(): string {
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const min = Math.pow(10, OTP_LENGTH - 1);
  const otp = randomInt(min, max + 1);
  return otp.toString();
}

export function getOtpExpiry(): Date {
  const d = new Date();
  d.setMinutes(d.getMinutes() + OTP_EXPIRY_MINUTES);
  return d;
}

export function getOtpExpiryMinutes(): number {
  return OTP_EXPIRY_MINUTES;
}

export function validateOtpFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}
