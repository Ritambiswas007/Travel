import { getSupabaseAdmin } from '../config/supabase';
import { logger } from './logger';

const DOCUMENTS_BUCKET = 'documents';
const PARTNER_PHOTOS_BUCKET = 'partner-photos';
const PARTNER_DOCUMENTS_BUCKET = 'partner-documents';

const REQUIRED_BUCKETS = [DOCUMENTS_BUCKET, PARTNER_PHOTOS_BUCKET, PARTNER_DOCUMENTS_BUCKET] as const;
let bucketsEnsured = false;

/**
 * Ensure storage buckets exist; create if missing (idempotent).
 */
async function ensureStorageBuckets(): Promise<void> {
  if (bucketsEnsured) return;
  const admin = getSupabaseAdmin();
  if (!admin) {
    logger.warn('Supabase admin not configured; skipping bucket ensure');
    return;
  }
  try {
    const { data: existing, error: listErr } = await admin.storage.listBuckets();
    if (listErr) {
      logger.error('Supabase listBuckets failed', { error: listErr.message });
      return;
    }
    const names = new Set((existing ?? []).map((b) => b.name));
    for (const name of REQUIRED_BUCKETS) {
      if (names.has(name)) continue;
      const { error: createErr } = await admin.storage.createBucket(name, { public: true });
      if (createErr) {
        logger.error('Supabase createBucket failed', { bucket: name, error: createErr.message });
      } else {
        logger.info('Supabase bucket created', { bucket: name });
      }
    }
    bucketsEnsured = true;
  } catch (e) {
    logger.error('ensureStorageBuckets failed', { error: e });
  }
}

/**
 * Upload a file buffer to Supabase Storage and return the public URL.
 */
export async function uploadToSupabaseStorage(
  bucket: string,
  path: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    throw new Error('Supabase storage not configured');
  }
  await ensureStorageBuckets();
  const { data, error } = await admin.storage
    .from(bucket)
    .upload(path, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    logger.error('Supabase storage upload failed', { bucket, path, error: error.message });
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = admin.storage.from(bucket).getPublicUrl(data.path);
  const publicUrl = urlData.publicUrl;
  logger.info('File uploaded to Supabase Storage', { bucket, path, url: publicUrl });
  return publicUrl;
}

/**
 * Upload document file to Supabase Storage.
 * Path: documents/{userId}/{timestamp}_{filename}.{ext}
 */
export async function uploadDocument(
  userId: string,
  fileBuffer: Buffer,
  mimetype: string,
  filename?: string
): Promise<string> {
  const ext = mimetype.split('/')[1] || 'bin';
  const base = filename ? `${filename.replace(/\.[^/.]+$/, '')}` : 'doc';
  const path = `${userId}/${Date.now()}_${base}.${ext}`;
  return uploadToSupabaseStorage(DOCUMENTS_BUCKET, path, fileBuffer, mimetype);
}

/**
 * Upload partner profile photo to Supabase Storage.
 * Path: partner-photos/{partnerId}/{timestamp}.{ext}
 */
export async function uploadPartnerPhoto(
  partnerId: string,
  fileBuffer: Buffer,
  mimetype: string
): Promise<string> {
  const ext = mimetype.split('/')[1] || 'jpg';
  const path = `${partnerId}/${Date.now()}.${ext}`;
  return uploadToSupabaseStorage(PARTNER_PHOTOS_BUCKET, path, fileBuffer, mimetype);
}

/**
 * Upload partner document (DL, RC, etc.) to Supabase Storage.
 * Path: partner-documents/{partnerId}/{type}_{timestamp}.{ext}
 */
export async function uploadPartnerDocument(
  partnerId: string,
  type: string,
  fileBuffer: Buffer,
  mimetype: string
): Promise<string> {
  const ext = mimetype.split('/')[1] || 'pdf';
  const path = `${partnerId}/${type}_${Date.now()}.${ext}`;
  return uploadToSupabaseStorage(PARTNER_DOCUMENTS_BUCKET, path, fileBuffer, mimetype);
}
