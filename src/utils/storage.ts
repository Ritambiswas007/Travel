import { getSupabaseAdmin, getStorageBucket } from '../config/supabase';
import { logger } from './logger';

const PARTNER_PHOTOS_BUCKET = 'partner-photos';
const PARTNER_DOCUMENTS_BUCKET = 'partner-documents';

const REQUIRED_BUCKETS = [PARTNER_PHOTOS_BUCKET, PARTNER_DOCUMENTS_BUCKET] as const;
let bucketsEnsured = false;

/**
 * Ensure storage buckets exist; create if missing (idempotent).
 * On "fetch failed" we skip so upload can still be attempted (bucket may already exist).
 */
async function ensureStorageBuckets(): Promise<void> {
  if (bucketsEnsured) return;
  const admin = getSupabaseAdmin();
  if (!admin) {
    logger.warn('Supabase admin not configured; skipping bucket ensure');
    return;
  }
  try {
    const documentsBucket = getStorageBucket();
    const bucketsToEnsure = [documentsBucket, ...REQUIRED_BUCKETS];
    const { data: existing, error: listErr } = await admin.storage.listBuckets();
    if (listErr) {
      logger.warn('Supabase listBuckets failed (upload may still work if bucket exists)', {
        error: listErr.message,
        cause: listErr instanceof Error ? (listErr as Error & { cause?: unknown }).cause : undefined,
      });
      return;
    }
    const names = new Set((existing ?? []).map((b) => b.name));
    for (const name of bucketsToEnsure) {
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
    const err = e instanceof Error ? e : new Error(String(e));
    logger.warn('ensureStorageBuckets failed (upload may still work)', {
      error: err.message,
      cause: (err as Error & { cause?: unknown }).cause,
    });
  }
}

/** Sanitize object path for Supabase: only ASCII letters, digits, underscore, hyphen, dot, slash (Invalid key-safe). */
function sanitizeStoragePath(path: string): string {
  return path
    .replace(/\s+/g, '_')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._/-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
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
  const safePath = sanitizeStoragePath(path);
  await ensureStorageBuckets();
  const { data, error } = await admin.storage
    .from(bucket)
    .upload(safePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    logger.error('Supabase storage upload failed', {
      bucket,
      path: safePath,
      error: error.message,
      cause: cause ?? undefined,
    });
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = admin.storage.from(bucket).getPublicUrl(data.path);
  const publicUrl = urlData.publicUrl;
  logger.info('File uploaded to Supabase Storage', { bucket, path: safePath, url: publicUrl });
  return publicUrl;
}

/**
 * Upload document file to Supabase Storage.
 * Bucket name comes from config (SUPABASE_BUCKET, default "documents").
 * Path: {bucket}/{userId}/{timestamp}_{filename}.{ext}
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
  return uploadToSupabaseStorage(getStorageBucket(), path, fileBuffer, mimetype);
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
