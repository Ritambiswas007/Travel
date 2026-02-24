import { API_BASE } from '../config';
import { api } from './client';

// ——— Common ———
export const healthApi = {
  check: () => fetch(`${API_BASE}/health`).then((r) => r.json()),
};

export const packagesApi = {
  list: (params?: { page?: number; limit?: number; cityId?: string; isActive?: boolean; isFeatured?: boolean; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.cityId) q.set('cityId', params.cityId);
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    if (params?.isFeatured !== undefined) q.set('isFeatured', String(params.isFeatured));
    if (params?.search) q.set('search', params.search);
    return api.get<{ items: unknown[]; total: number }>(`/packages?${q}`, undefined);
  },
  getById: (id: string) => api.get(`/packages/${id}`, undefined),
  getBySlug: (slug: string) => api.get(`/packages/slug/${slug}`, undefined),
  create: (body: Record<string, unknown>, token: string) => api.post('/packages', body, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/packages/${id}`, body, token),
  delete: (id: string, token: string) => api.delete(`/packages/${id}`, token),
  addVariant: (packageId: string, body: Record<string, unknown>, token: string) =>
    api.post(`/packages/${packageId}/variants`, body, token),
  addItinerary: (packageId: string, body: Record<string, unknown>, token: string) =>
    api.post(`/packages/${packageId}/itineraries`, body, token),
  addSchedule: (packageId: string, body: Record<string, unknown>, token: string) =>
    api.post(`/packages/${packageId}/schedules`, body, token),
};

export const citiesApi = {
  list: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get(`/cities?${q}`, undefined);
  },
  getById: (id: string) => api.get(`/cities/${id}`, undefined),
  getBySlug: (slug: string) => api.get(`/cities/slug/${slug}`, undefined),
  create: (body: Record<string, unknown>, token: string) => api.post('/cities', body, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/cities/${id}`, body, token),
  delete: (id: string, token: string) => api.delete(`/cities/${id}`, token),
};

export const bannersApi = {
  listActive: () => api.get('/banners', undefined),
  listAll: (token: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get(`/banners/admin?${q}`, token);
  },
  getById: (id: string, token: string) => api.get(`/banners/${id}`, token),
  create: (body: Record<string, unknown>, token: string) => api.post('/banners', body, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/banners/${id}`, body, token),
  delete: (id: string, token: string) => api.delete(`/banners/${id}`, token),
};

export const reviewsApi = {
  list: (params?: { page?: number; limit?: number; packageId?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.packageId) q.set('packageId', params.packageId);
    return api.get(`/reviews?${q}`, undefined);
  },
  getById: (id: string, token: string) => api.get(`/reviews/${id}`, token),
};

export const documentsApi = {
  listTypes: (token?: string | null) => api.get('/documents/types', token),
  getTypeById: (id: string, token: string) => api.get(`/documents/types/${id}`, token),
  createType: (body: Record<string, unknown>, token: string) =>
    api.post('/documents/types', body, token),
  updateDocumentStatus: (documentId: string, body: { status: string }, token: string) =>
    api.patch(`/documents/${documentId}/status`, body, token),
};

export const formsApi = {
  getByCode: (code: string) => api.get(`/forms/code/${code}`, undefined),
  list: (token: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get(`/forms${q.toString() ? `?${q}` : ''}`, token);
  },
  getById: (id: string, token: string) => api.get(`/forms/${id}`, token),
  create: (body: Record<string, unknown>, token: string) => api.post('/forms', body, token),
  addField: (formId: string, body: Record<string, unknown>, token: string) =>
    api.post(`/forms/${formId}/fields`, body, token),
};

export const leadsApi = {
  create: (body: Record<string, unknown>) => api.post('/leads', body),
  list: (token: string, params?: { page?: number; limit?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    return api.get(`/leads?${q}`, token);
  },
  getById: (id: string, token: string) => api.get(`/leads/${id}`, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/leads/${id}`, body, token),
  assign: (leadId: string, body: { staffId: string }, token: string) =>
    api.post(`/leads/${leadId}/assign`, body, token),
};

// ——— Auth (admin login) ———
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
      '/auth/login/email',
      { email, password }
    ),
  logout: (token: string, refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }, token),
  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/auth/refresh', { refreshToken }),
};

// ——— Admin ———
export const usersApi = {
  list: (token: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get(`/users/admin/users?${q}`, token);
  },
};

export const staffApi = {
  list: (token: string, params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return api.get(`/staff?${q}`, token);
  },
  getById: (id: string, token: string) => api.get(`/staff/${id}`, token),
  create: (body: Record<string, unknown>, token: string) => api.post('/staff', body, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/staff/${id}`, body, token),
};

export const couponsApi = {
  list: (token: string, params?: { page?: number; limit?: number; isActive?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.isActive !== undefined) q.set('isActive', String(params.isActive));
    return api.get(`/coupons?${q}`, token);
  },
  getById: (id: string, token: string) => api.get(`/coupons/${id}`, token),
  create: (body: Record<string, unknown>, token: string) => api.post('/coupons', body, token),
  update: (id: string, body: Record<string, unknown>, token: string) =>
    api.patch(`/coupons/${id}`, body, token),
};

export const reportsApi = {
  list: (token: string, params?: { page?: number; limit?: number; type?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.type) q.set('type', params.type);
    return api.get(`/reports?${q}`, token);
  },
  getById: (id: string, token: string) => api.get(`/reports/${id}`, token),
  create: (body: Record<string, unknown>, token: string) => api.post('/reports', body, token),
  bookings: (token: string, from: string, to: string) =>
    api.get(`/reports/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, token),
  revenue: (token: string, from: string, to: string) =>
    api.get(`/reports/revenue?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, token),
};

export const bookingsApi = {
  listAll: (token: string, params?: { page?: number; limit?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.status) q.set('status', params.status);
    return api.get(`/bookings/admin?${q}`, token);
  },
  getById: (id: string, token: string) => api.get(`/bookings/${id}`, token),
  updateStep: (id: string, body: { step: number }, token: string) =>
    api.patch(`/bookings/${id}/step`, body, token),
  applyCoupon: (id: string, body: { couponCode: string }, token: string) =>
    api.post(`/bookings/${id}/apply-coupon`, body, token),
  confirm: (id: string, token: string) => api.post(`/bookings/${id}/confirm`, undefined, token),
  cancel: (id: string, token: string) => api.post(`/bookings/${id}/cancel`, undefined, token),
};

export const paymentsApi = {
  getById: (id: string, token: string) => api.get(`/payments/${id}`, token),
  getByBooking: (bookingId: string, token: string) =>
    api.get(`/payments/booking/${bookingId}`, token),
  initiateRefund: (body: { paymentId: string; amount: number; reason?: string }, token: string) =>
    api.post('/payments/refunds', body, token),
};

export const transportApi = {
  addFlight: (body: Record<string, unknown>, token: string) =>
    api.post('/transport/flight', body, token),
  addTrain: (body: Record<string, unknown>, token: string) =>
    api.post('/transport/train', body, token),
  addBus: (body: Record<string, unknown>, token: string) =>
    api.post('/transport/bus', body, token),
};

export const notificationsApi = {
  send: (body: { userId: string; title: string; body: string; type?: string; channel?: string }, token: string) =>
    api.post('/notifications/send', body, token),
};

export const supportApi = {
  list: (token: string) => api.get('/support', token),
  getById: (id: string, token: string) => api.get(`/support/${id}`, token),
  reply: (ticketId: string, body: { message: string }, token: string) =>
    api.post(`/support/${ticketId}/reply`, body, token),
  close: (ticketId: string, token: string) => api.post(`/support/${ticketId}/close`, undefined, token),
};
