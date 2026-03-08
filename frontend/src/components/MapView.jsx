import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import styles from './MapView.module.css';

const DEFAULT_CENTER = [28.6139, 77.209]; // Delhi
const DEFAULT_ZOOM = 11;

function HeatmapLayer({ cells }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map || !cells.length) return;
    const points = cells.map((c) => [c.lat, c.lng, Math.min(c.weight || c.count, 10)]);
    if (layerRef.current) map.removeLayer(layerRef.current);
    layerRef.current = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 15,
      max: 8,
      gradient: { 0.2: '#5cb85c', 0.5: '#f0ad4e', 1: '#d9534f' },
    });
    map.addLayer(layerRef.current);
    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current);
    };
  }, [map, cells]);

  return null;
}

function BoundsSync({ onBoundsChange }) {
  const map = useMap();
  useEffect(() => {
    const update = () => {
      const b = map.getBounds();
      onBoundsChange({
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      });
    };
    update();
    map.on('moveend', update);
    return () => map.off('moveend', update);
  }, [map, onBoundsChange]);
  return null;
}

const typeLabels = {
  unsafe_location: 'Unsafe location',
  harassment: 'Harassment',
  suspicious_activity: 'Suspicious activity',
};

function MapClickHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    if (!onMapClick) return;
    const handler = (e) => onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [map, onMapClick]);
  return null;
}

export default function MapView({
  incidents,
  heatmapCells,
  onBoundsChange,
  onMapClick,
  routeGeoJson,
  sourcePoint,
  destinationPoint,
  loading,
}) {
  return (
    <div className={styles.wrapper}>
      {loading && <div className={styles.loader}>Loading map data…</div>}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.map}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <BoundsSync onBoundsChange={onBoundsChange} />
        <MapClickHandler onMapClick={onMapClick} />
        <HeatmapLayer cells={heatmapCells} />
        {routeGeoJson?.coordinates?.length ? (
          <Polyline
            positions={routeGeoJson.coordinates.map(([lng, lat]) => [lat, lng])}
            pathOptions={{ color: '#c47ac0', weight: 5, opacity: 0.9 }}
          />
        ) : null}
        {sourcePoint ? (
          <CircleMarker
            center={[sourcePoint.lat, sourcePoint.lng]}
            radius={8}
            pathOptions={{ color: '#c47ac0', weight: 3, fillOpacity: 0.9 }}
          />
        ) : null}
        {destinationPoint ? (
          <CircleMarker
            center={[destinationPoint.lat, destinationPoint.lng]}
            radius={8}
            pathOptions={{ color: '#8b5a88', weight: 3, fillOpacity: 0.9 }}
          />
        ) : null}
        {incidents.map((inc) => (
          <CircleMarker
            key={inc._id}
            center={[inc.latitude, inc.longitude]}
            radius={6}
            pathOptions={{
              color: inc.severity === 'high' ? '#d9534f' : inc.severity === 'medium' ? '#f0ad4e' : '#5cb85c',
              weight: 2,
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <strong>{typeLabels[inc.type] || inc.type}</strong>
              <br />
              {inc.description || 'No description'}
              <br />
              <small>{new Date(inc.reportedAt).toLocaleString()}</small>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
