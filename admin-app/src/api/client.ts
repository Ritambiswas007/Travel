import { API_URL } from '../config';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function request<T>(
  path: string,
  options: {
    method?: Method;
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<{ data?: T; success: boolean; error?: string; message?: string }> {
  const { method = 'GET', body, token } = options;
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    const success = res.ok && (json.success !== false);
    if (success) return { success: true, data: json.data ?? json };
    return {
      success: false,
      error: json.message || json.error || res.statusText || `Request failed (${res.status})`,
      message: json.message,
    };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Network error' };
  }
}

export const api = {
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: 'GET', token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body, token }),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body, token }),
  delete: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: 'DELETE', token }),
};
