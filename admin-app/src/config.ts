const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE = apiUrl.replace(/\/$/, '');
export const API_PREFIX = '/api/v1';
export const API_URL = `${API_BASE}${API_PREFIX}`;
