import { getMessaging, isFirebaseEnabled } from '../config/firebase';
import { config } from '../config/env';
import { logger } from './logger';

export type NotificationChannel = 'email' | 'sms' | 'push';

export interface SendNotificationParams {
  userId?: string;
  email?: string;
  phone?: string;
  fcmToken?: string;
  title: string;
  body?: string;
  data?: Record<string, string>;
  channels?: NotificationChannel[];
}

export async function sendNotification(
  params: SendNotificationParams
): Promise<{ email?: boolean; sms?: boolean; push?: boolean }> {
  const channels = params.channels || ['email', 'push'];
  const result: { email?: boolean; sms?: boolean; push?: boolean } = {};

  if (channels.includes('push') && config.notifications.pushEnabled && params.fcmToken) {
    const messaging = getMessaging();
    if (messaging && isFirebaseEnabled()) {
      try {
        await messaging.send({
          token: params.fcmToken,
          notification: {
            title: params.title,
            body: params.body,
          },
          data: params.data as Record<string, string> | undefined,
        });
        result.push = true;
      } catch (e) {
        logger.error('FCM send error', e);
      }
    }
  }

  if (channels.includes('email') && config.notifications.emailEnabled && params.email) {
    try {
      await sendEmail(params.email, params.title, params.body || '');
      result.email = true;
    } catch (e) {
      logger.error('Email send error', e);
    }
  }

  if (channels.includes('sms') && config.notifications.smsEnabled && params.phone) {
    try {
      await sendSms(params.phone, params.body || params.title);
      result.sms = true;
    } catch (e) {
      logger.error('SMS send error', e);
    }
  }

  return result;
}

async function sendEmail(to: string, subject: string, body: string): Promise<void> {
  logger.info('Email (stub)', { to, subject });
  // Integrate with SendGrid, SES, etc. via env
}

async function sendSms(phone: string, message: string): Promise<void> {
  logger.info('SMS (stub)', { phone });
  // Integrate with Twilio, MSG91, etc. via env
}
