import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from multiple possible locations so it's always found
const candidates = [
  path.join(process.cwd(), '.env'),
  path.resolve(__dirname, '..', '..', '.env'),
  path.resolve(__dirname, '..', '.env'),
];
for (const p of candidates) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    if (process.env.SUPABASE_URL || process.env.DATABASE_URL) break;
  }
}

const env = process.env;

export const config = {
  nodeEnv: env.NODE_ENV || 'development',
  port: parseInt(env.PORT || '3000', 10),
  apiPrefix: env.API_PREFIX || '/api/v1',

  // Database
  databaseUrl: env.DATABASE_URL as string,

  // Redis (optional; skip cache when not set)
  redis: {
    url: env.REDIS_URL,
    enabled: !!env.REDIS_URL,
    defaultTtlSeconds: parseInt(env.REDIS_CACHE_TTL_SECONDS || '300', 10),
  },

  // JWT
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET as string,
    refreshSecret: env.JWT_REFRESH_SECRET as string,
    accessExpiry: env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: env.JWT_REFRESH_EXPIRY || '7d',
  },

  // Firebase (conditionally enabled)
  firebase: {
    enabled: env.FIREBASE_ENABLED === 'true',
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    databaseUrl: env.FIREBASE_DATABASE_URL,
  },

  // Supabase Storage (enabled when URL + service role key are set, or when SUPABASE_ENABLED=true)
  supabase: {
    enabled:
      env.SUPABASE_ENABLED === 'true' ||
      !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY),
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    bucket: env.SUPABASE_BUCKET || 'documents',
  },

  // Payment (Razorpay / Cashfree)
  payment: {
    provider: (env.PAYMENT_PROVIDER || 'razorpay') as 'razorpay' | 'cashfree',
    razorpay: {
      keyId: env.RAZORPAY_KEY_ID,
      keySecret: env.RAZORPAY_KEY_SECRET,
    },
    cashfree: {
      appId: env.CASHFREE_APP_ID,
      secret: env.CASHFREE_SECRET,
    },
    webhookSecret: env.PAYMENT_WEBHOOK_SECRET,
  },

  // Facebook Leads (conditionally enabled)
  facebook: {
    enabled: env.FACEBOOK_LEADS_ENABLED === 'true',
    verifyToken: env.FACEBOOK_VERIFY_TOKEN || '',
    pageAccessToken: env.FACEBOOK_PAGE_ACCESS_TOKEN || '',
  },

  // PDF service
  pdf: {
    enabled: env.PDF_SERVICE_ENABLED === 'true',
    serviceUrl: env.PDF_SERVICE_URL,
  },

  // AI Bot
  ai: {
    enabled: env.AI_BOT_ENABLED === 'true',
    recommendationHook: env.AI_RECOMMENDATION_HOOK,
    faqHook: env.AI_FAQ_HOOK,
    bookingAssistantHook: env.AI_BOOKING_ASSISTANT_HOOK,
  },

  // Notifications
  notifications: {
    emailEnabled: env.EMAIL_NOTIFICATIONS_ENABLED === 'true',
    smsEnabled: env.SMS_NOTIFICATIONS_ENABLED === 'true',
    pushEnabled: env.PUSH_NOTIFICATIONS_ENABLED === 'true',
  },
} as const;

export type Config = typeof config;
