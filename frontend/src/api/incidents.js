const API = import.meta.env.VITE_API_URL || '';

export async function fetchIncidents(bounds, type) {
  const params = new URLSearchParams();
  if (bounds?.minLat != null) params.set('minLat', bounds.minLat);
  if (bounds?.maxLat != null) params.set('maxLat', bounds.maxLat);
  if (bounds?.minLng != null) params.set('minLng', bounds.minLng);
  if (bounds?.maxLng != null) params.set('maxLng', bounds.maxLng);
  if (type) params.set('type', type);
  const res = await fetch(`${API}/api/incidents?${params}`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchHeatmap(bounds, gridSize = 0.01) {
  const params = new URLSearchParams({
    minLat: bounds?.minLat ?? 0,
    maxLat: bounds?.maxLat ?? 0,
    minLng: bounds?.minLng ?? 0,
    maxLng: bounds?.maxLng ?? 0,
    gridSize: String(gridSize),
  });
  const res = await fetch(`${API}/api/incidents/heatmap?${params}`);
  if (!res.ok) throw new Error('Failed to fetch heatmap');
  return res.json();
}

export async function reportIncident(data) {
  const res = await fetch(`${API}/api/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to report incident');
  }
  return res.json();
}
