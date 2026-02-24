import { API_BASE, API_URL } from '@/config';
import { api } from './client';

// ——— Common (no auth) ———
export const healthApi = {
  check: () => fetch(`${API_BASE}/health`).then((r) => r.json()),
};

export const packagesApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    cityId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.cityId) q.set('cityId', params.cityId);
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    if (params?.isFeatured !== undefined) q.set('isFeatured', String(params.isFeatured));
    if (params?.search) q.set('search', params.search);
    return api.get<{ items: PackageListItem[]; total: number }>(`/packages?${q}`);
  },
  getById: (id: string) => api.get(`/packages/${id}`),
  getBySlug: (slug: string) => api.get(`/packages/slug/${slug}`),
};

export type PackageListItem = {
  id: string;
  name?: string;
  slug?: string;
  summary?: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  cityId?: string | null;
  city?: { id: string; name: string; slug: string; country: string } | null;
  variants?: { id: string; basePrice: string | number; currency: string; name?: string; isDefault?: boolean }[];
};

export const citiesApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get(`/cities?${q}`);
  },
  getById: (id: string) => api.get(`/cities/${id}`),
  getBySlug: (slug: string) => api.get(`/cities/slug/${slug}`),
};

export const bannersApi = { listActive: () => api.get('/banners') };

export const reviewsApi = {
  list: (params?: { page?: number; limit?: number; packageId?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.packageId) q.set('packageId', params.packageId);
    return api.get<{ items?: { rating: number }[]; total?: number }>(`/reviews?${q}`);
  },
};

export const documentsApi = { listTypes: () => api.get('/documents/types') };

export const formsApi = {
  getByCode: (code: string) => api.get(`/forms/code/${code}`),
  submit: (formId: string, data: Record<string, unknown>) =>
    api.post(`/forms/${formId}/submit`, { data }),
};

export const leadsApi = { create: (body: Record<string, unknown>) => api.post('/leads', body) };

// ——— Auth ———
export const authApi = {
  register: (body: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', body),
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string; name?: string } }>(
      '/auth/login/email',
      { email, password }
    ),
  loginPhone: (phone: string, otp: string) =>
    api.post('/auth/login/phone', { phone, otp }),
  sendOtp: (email: string, purpose?: string) =>
    api.post('/auth/send-otp', { email, purpose: purpose ?? 'login' }),
  logout: (token: string, refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }, token),
  logoutAll: (token: string) => api.post('/auth/logout-all', undefined, token),
  refresh: (refreshToken: string) => api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// ——— User (authenticated) ———
export const usersApi = {
  getMe: (token: string) => api.get('/users/me', token),
  updateMe: (body: { name?: string; email?: string; phone?: string }, token: string) =>
    api.patch('/users/me', body, token),
};

export const bookingsApi = {
  create: (body: Record<string, unknown>, token: string) => api.post('/bookings', body, token),
  listMy: (token: string) => api.get('/bookings/my', token),
  getById: (id: string, token: string) => api.get(`/bookings/${id}`, token),
  applyCoupon: (id: string, body: { couponCode: string }, token: string) =>
    api.post(`/bookings/${id}/apply-coupon`, body, token),
  confirm: (id: string, token: string) => api.post(`/bookings/${id}/confirm`, undefined, token),
  cancel: (id: string, token: string) => api.post(`/bookings/${id}/cancel`, undefined, token),
};

export const paymentsApi = {
  createOrder: (body: { bookingId: string; amount: number; currency?: string }, token: string) =>
    api.post('/payments/orders', body, token),
  getByBooking: (bookingId: string, token: string) =>
    api.get(`/payments/booking/${bookingId}`, token),
  getById: (id: string, token: string) => api.get(`/payments/${id}`, token),
};

export const supportApi = {
  create: (body: { subject: string; message: string; priority?: string }, token: string) =>
    api.post('/support', body, token),
  listMy: (token: string) => api.get('/support', token),
  getById: (id: string, token: string) => api.get(`/support/${id}`, token),
  reply: (ticketId: string, body: { message: string }, token: string) =>
    api.post(`/support/${ticketId}/reply`, body, token),
};

export const visaApi = {
  create: (body: { country: string; type: string }, token: string) =>
    api.post('/visa', body, token),
  listMy: (token: string) => api.get('/visa/my', token),
  getById: (id: string, token: string) => api.get(`/visa/${id}`, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/visa/${id}`, body, token),
  submit: (id: string, token: string) => api.post(`/visa/${id}/submit`, undefined, token),
  addDocument: (visaId: string, body: { type: string; fileUrl: string }, token: string) =>
    api.post(`/visa/${visaId}/documents`, body, token),
};

export type DynamicFormField = {
  id: string;
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: unknown;
};

export type DynamicForm = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive?: boolean;
  fields?: DynamicFormField[];
};

export const formsPublicApi = {
  getByCode: (code: string) =>
    api.get<DynamicForm>(`/forms/code/${encodeURIComponent(code)}`),
  submit: (formId: string, body: { data: Record<string, unknown> }, token?: string | null) =>
    api.post(`/forms/${formId}/submit`, body, token),
};

export const reviewsUserApi = {
  list: (params?: { page?: number; limit?: number; packageId?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.packageId) q.set('packageId', params.packageId);
    return api.get(`/reviews?${q}`);
  },
  getById: (id: string, token: string) => api.get(`/reviews/${id}`, token),
  create: (body: { packageId: string; rating: number; title?: string; comment?: string }, token: string) =>
    api.post('/reviews', body, token),
  update: (id: string, body: { rating?: number; title?: string; comment?: string }, token: string) =>
    api.patch(`/reviews/${id}`, body, token),
};

export type DocumentType = { id: string; name?: string; code?: string; description?: string | null; isRequired?: boolean };
export type UserDocument = {
  id: string;
  documentTypeId?: string;
  fileUrl?: string | null;
  status?: string;
  createdAt?: string;
  documentType?: DocumentType;
};

export const documentsUserApi = {
  listTypes: () => api.get<DocumentType[] | { items: DocumentType[] }>('/documents/types'),
  listMy: (token: string) => api.get<UserDocument[] | { items: UserDocument[] }>('/documents/my', token),
  getById: (id: string, token: string) => api.get<UserDocument>(`/documents/${id}`, token),
  upload: (documentTypeId: string, file: File, token: string): Promise<{ success: boolean; data?: UserDocument; error?: string }> => {
    const form = new FormData();
    form.append('documentTypeId', documentTypeId);
    form.append('file', file);
    return fetch(`${API_URL}/documents/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
      .then((r) => r.json().then((json) => ({ success: r.ok && json.success !== false, data: json.data, error: json.message || json.error })))
      .catch((e) => ({ success: false, error: e instanceof Error ? e.message : 'Upload failed' }));
  },
  checklistPdf: (token: string) =>
    fetch(`${API_URL}/documents/checklist/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export type UserNotification = {
  id: string;
  readAt?: string | null;
  createdAt?: string;
  notification?: {
    title: string;
    body?: string | null;
    type?: string | null;
  } | null;
};

export const notificationsApi = {
  listMy: (token: string, params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.unreadOnly !== undefined) q.set('unreadOnly', String(params.unreadOnly));
    const qs = q.toString();
    const path = qs ? `/notifications?${qs}` : '/notifications';
    return api.get<{ items: UserNotification[]; total: number } | UserNotification[]>(path, token);
  },
  markRead: (notificationId: string, token: string) =>
    api.post(`/notifications/mark-read/${notificationId}`, undefined, token),
};

export const aiApi = {
  recommendations: (
    body: { userId?: string; context?: string; limit?: number },
    token?: string | null
  ) => api.post<{ recommendations: PackageListItem[] } | Record<string, unknown>>('/ai/recommendations', body, token),
  faq: (body: { question: string; context?: string }, token?: string | null) =>
    api.post<{ answer: string; source?: string } | Record<string, unknown>>('/ai/faq', body, token),
  bookingAssistant: (
    body: { query: string; bookingId?: string; context?: string },
    token?: string | null
  ) =>
    api.post<{ response: string; suggestions?: unknown[] } | Record<string, unknown>>(
      '/ai/booking-assistant',
      body,
      token
    ),
};
