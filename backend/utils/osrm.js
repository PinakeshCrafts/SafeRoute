const OSRM_BASE = 'https://router.project-osrm.org';

export async function getRoute({ source, destination }) {
  const url = new URL(
    `${OSRM_BASE}/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}`
  );
  url.searchParams.set('overview', 'full');
  url.searchParams.set('geometries', 'geojson');
  url.searchParams.set('alternatives', 'false');

  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) throw new Error('No route found');

  return {
    durationSec: route.duration,
    distanceM: route.distance,
    geometry: route.geometry, // GeoJSON LineString
  };
}

