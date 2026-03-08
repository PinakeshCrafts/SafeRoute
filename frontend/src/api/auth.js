import { apiFetch } from './client';

export function register(username, password) {
  return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function login(username, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export function getMe(token) {
  return apiFetch('/api/auth/me', { token });
}

