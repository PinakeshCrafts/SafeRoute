import { useCallback, useEffect, useState } from 'react';
import styles from '../App.module.css';
import MapView from '../components/MapView';
import ReportPanel from '../components/ReportPanel';
import EmergencyAlert from '../components/EmergencyAlert';
import SafetyLegend from '../components/SafetyLegend';
import DashboardHeader from '../components/DashboardHeader';
import EmergencyContactsModal from '../components/EmergencyContactsModal';
import RoutePlanner from '../components/RoutePlanner';
import { useAuth } from '../auth/AuthProvider';
import { fetchIncidents, fetchHeatmap, reportIncident } from '../api/incidents';
import { updateEmergencyContacts } from '../api/users';

const DEFAULT_BOUNDS = {
  minLat: 28.4,
  maxLat: 28.8,
  minLng: 76.8,
  maxLng: 77.4,
};

export default function Dashboard() {
  const { token, me, logout, refreshMe } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [heatmapCells, setHeatmapCells] = useState([]);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selecting, setSelecting] = useState(null); // 'source' | 'destination' | null
  const [bounds, setBounds] = useState(DEFAULT_BOUNDS);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [incidentList, heatmapRes] = await Promise.all([fetchIncidents(bounds), fetchHeatmap(bounds)]);
      setIncidents(incidentList);
      setHeatmapCells(heatmapRes.cells || []);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setLoading(false);
    }
  }, [bounds.minLat, bounds.maxLat, bounds.minLng, bounds.maxLng]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReportSubmit = async (data) => {
    await reportIncident(data);
    setReportOpen(false);
    loadData();
  };

  const handleBoundsChange = (newBounds) => {
    if (newBounds && typeof newBounds.minLat === 'number') setBounds(newBounds);
  };

  const handleMapClick = (latlng) => {
    if (selecting === 'source') {
      setSource(latlng);
      setSelecting(null);
      return;
    }
    if (selecting === 'destination') {
      setDestination(latlng);
      setSelecting(null);
      return;
    }
    setClickedLatLng(latlng);
  };

  const saveContacts = async (contacts) => {
    await updateEmergencyContacts(token, contacts);
    await refreshMe();
  };

  const gridInfo = (() => {
    if (!clickedLatLng) return null;
    const gridSize = 0.01;
    const cellLat = Math.floor(clickedLatLng.lat / gridSize) * gridSize;
    const cellLng = Math.floor(clickedLatLng.lng / gridSize) * gridSize;
    const cell = heatmapCells.find((c) => Math.abs(c.lat - cellLat) < 1e-6 && Math.abs(c.lng - cellLng) < 1e-6);
    return cell || { count: 0, safetyScore: 100 };
  })();

  return (
    <div className={styles.app}>
      <DashboardHeader
        username={me?.username || 'user'}
        onContactsClick={() => setContactsOpen(true)}
        onReportClick={() => setReportOpen(true)}
        onEmergencyClick={() => setAlertOpen(true)}
        onLogout={logout}
      />
      <main className={styles.main}>
        <MapView
          incidents={incidents}
          heatmapCells={heatmapCells}
          onBoundsChange={handleBoundsChange}
          onMapClick={handleMapClick}
          routeGeoJson={routeGeoJson}
          sourcePoint={source}
          destinationPoint={destination}
          loading={loading}
        />
        <RoutePlanner
          token={token}
          contactsReady={Array.isArray(me?.emergencyContacts) && me.emergencyContacts.length === 3}
          source={source}
          destination={destination}
          selecting={selecting}
          onSelectMode={setSelecting}
          onRouteGeometry={setRouteGeoJson}
        />
        <SafetyLegend />
        {gridInfo && (
          <aside className={styles.cellInfo}>
            <h3>Grid safety</h3>
            <p>
              Incidents: <strong>{gridInfo.count}</strong>
            </p>
            <p>
              Safety score: <strong>{Math.round(gridInfo.safetyScore)}</strong>/100
            </p>
          </aside>
        )}
      </main>
      {reportOpen && <ReportPanel onClose={() => setReportOpen(false)} onSubmit={handleReportSubmit} />}
      {alertOpen && <EmergencyAlert onClose={() => setAlertOpen(false)} />}
      <EmergencyContactsModal
        open={contactsOpen}
        initialContacts={me?.emergencyContacts || []}
        onClose={() => setContactsOpen(false)}
        onSave={saveContacts}
      />
    </div>
  );
}

