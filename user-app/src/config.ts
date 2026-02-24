const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_BASE = apiUrl.replace(/\/$/, '');
export const API_PREFIX = '/api/v1';
export const API_URL = `${API_BASE}${API_PREFIX}`;
