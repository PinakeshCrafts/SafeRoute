import { apiFetch } from './client';

export function previewRoute(token, source, destination) {
  return apiFetch('/api/journeys/preview', {
    token,
    method: 'POST',
    body: JSON.stringify({ source, destination }),
  });
}

export function startJourney(token, source, destination) {
  return apiFetch('/api/journeys/start', {
    token,
    method: 'POST',
    body: JSON.stringify({ source, destination }),
  });
}

export function endJourney(token, id) {
  return apiFetch(`/api/journeys/${id}/end`, { token, method: 'POST' });
}

export function getActiveJourney(token) {
  return apiFetch('/api/journeys/active', { token });
}

