import { API_URL } from '@/config';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type ApiResponse<T> = {
  data?: T;
  success: boolean;
  error?: string;
  message?: string;
};

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const refreshToken = window.localStorage.getItem('user_refresh_token');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false || !json.data?.accessToken) {
      return null;
    }
    const nextToken = String(json.data.accessToken);
    window.localStorage.setItem('user_token', nextToken);
    window.dispatchEvent(new CustomEvent('auth-token-refreshed'));
    return nextToken;
  } catch {
    return null;
  }
}

export async function request<T>(
  path: string,
  options: {
    method?: Method;
    body?: unknown;
    token?: string | null;
    /**
     * Internal use only – prevents infinite refresh loops
     */
    _retrying?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token, _retrying } = options;
  const url = path.startsWith('http') ? path : `${API_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));

    // If unauthorized and we have a refresh token in the browser, try to refresh once
    if (res.status === 401 && typeof window !== 'undefined' && !_retrying) {
      const nextToken = await refreshAccessToken();
      if (nextToken) {
        return request<T>(path, {
          method,
          body,
          token: nextToken,
          _retrying: true,
        });
      }
      // Refresh failed (expired or invalid) – clear session so UI shows logged out
      window.localStorage.removeItem('user_token');
      window.localStorage.removeItem('user_refresh_token');
      window.localStorage.removeItem('user_profile');
      window.dispatchEvent(new Event('auth-session-expired'));
    }

    const success = res.ok && json.success !== false;
    if (success) {
      return { success: true, data: (json.data ?? json) as T };
    }
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
