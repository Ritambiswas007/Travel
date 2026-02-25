import { createClient, SupabaseClient } from '@supabase/supabase-js';
import https from 'https';
import fetch from 'node-fetch';
import { config } from './env';

const SUPABASE_FETCH_TIMEOUT_MS = 60000;

/** HTTPS agent with keepAlive for stable connections to Supabase (avoids "fetch failed" with Node's built-in fetch). */
const supabaseHttpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  maxSockets: 10,
});

/** Fetch via node-fetch + HTTPS agent (more reliable than Node's built-in fetch for Supabase). */
function fetchWithTimeoutAndRetry(
  input: string | URL,
  init?: RequestInit,
  retries = 2
): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as { url: string }).url;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);
  const opts = {
    ...init,
    signal: init?.signal ?? controller.signal,
    agent: supabaseHttpsAgent,
  } as import('node-fetch').RequestInit;
  return (fetch(url, opts)
    .finally(() => clearTimeout(timeoutId))
    .catch((err: NodeJS.ErrnoException & { cause?: { code?: string }; name?: string }) => {
      const code = err?.code ?? err?.cause?.code;
      const isRetryable =
        retries > 0 &&
        (err?.message === 'fetch failed' ||
          err?.name === 'AbortError' ||
          code === 'ECONNRESET' ||
          code === 'ETIMEDOUT' ||
          code === 'ECONNREFUSED' ||
          code === 'ENOTFOUND');
      if (isRetryable) {
        return new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
          fetchWithTimeoutAndRetry(input, init, retries - 1)
        );
      }
      throw err;
    })) as Promise<Response>;
}

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
  const customFetch = (input: string | URL | { url: string }, init?: RequestInit) =>
    fetchWithTimeoutAndRetry(
      typeof input === 'object' && 'url' in input ? input.url : (input as string | URL),
      init
    );
  supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { persistSession: false },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global: { fetch: customFetch as any },
  });
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
