import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './env';

let supabaseClient: SupabaseClient | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!config.supabase.enabled || !config.supabase.url || !config.supabase.anonKey) {
    return null;
  }
  if (supabaseClient) {
    return supabaseClient;
  }
  supabaseClient = createClient(
    config.supabase.url,
    config.supabase.anonKey
  );
  return supabaseClient;
}

/**
 * Admin client with service role key for server-side storage (upload, create bucket).
 * Use for backend uploads; anon key client is for client-side with RLS.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (
    !config.supabase.enabled ||
    !config.supabase.url ||
    !config.supabase.serviceRoleKey
  ) {
    return null;
  }
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }
  supabaseAdminClient = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    { auth: { persistSession: false } }
  );
  return supabaseAdminClient;
}

/**
 * Admin Supabase client (service role). Use for server-side storage uploads.
 * Prefer getSupabaseAdmin() or utils/storage.ts helpers in new code.
 */
export function getSupabaseAdminStorage() {
  const c = getSupabaseAdmin();
  return c ? c.storage : null;
}

export function getStorageBucket(): string {
  return config.supabase.bucket;
}

export function isSupabaseEnabled(): boolean {
  return config.supabase.enabled;
}
