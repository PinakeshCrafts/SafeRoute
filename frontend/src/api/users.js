import { apiFetch } from './client';

export function updateEmergencyContacts(token, contacts) {
  return apiFetch('/api/users/me/emergency-contacts', {
    token,
    method: 'PUT',
    body: JSON.stringify({ contacts }),
  });
}

