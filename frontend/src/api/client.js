const API = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (res.ok) return res.status === 204 ? null : res.json();
  const err = await res.json().catch(() => ({}));
  throw new Error(err.error || `Request failed (${res.status})`);
}

