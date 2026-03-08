import { useEffect, useMemo, useState } from 'react';
import styles from './RoutePlanner.module.css';
import { previewRoute, startJourney, endJourney, getActiveJourney } from '../api/journeys';

function fmtDuration(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  const min = Math.round(s / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

function fmtDistance(meters) {
  const m = Number(meters || 0);
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export default function RoutePlanner({
  token,
  contactsReady,
  source,
  destination,
  selecting,
  onSelectMode,
  onRouteGeometry,
}) {
  const [route, setRoute] = useState(null);
  const [routeError, setRouteError] = useState('');
  const [loading, setLoading] = useState(false);

  const [active, setActive] = useState(null);
  const [clockNow, setClockNow] = useState(Date.now());

  useEffect(() => {
    let timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const j = await getActiveJourney(token);
        if (!cancelled) setActive(j);
        if (!cancelled && j?.routeGeoJson) onRouteGeometry?.(j.routeGeoJson);
      } catch {
        if (!cancelled) setActive(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, onRouteGeometry]);

  useEffect(() => {
    let cancelled = false;
    async function loadPreview() {
      if (!source || !destination) {
        setRoute(null);
        setRouteError('');
        onRouteGeometry?.(null);
        return;
      }
      setLoading(true);
      setRouteError('');
      try {
        const r = await previewRoute(token, source, destination);
        if (cancelled) return;
        setRoute(r);
        onRouteGeometry?.(r.geometry);
      } catch (err) {
        if (cancelled) return;
        setRoute(null);
        onRouteGeometry?.(null);
        setRouteError(err.message || 'Failed to calculate route');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!active) loadPreview();
    return () => {
      cancelled = true;
    };
  }, [token, source?.lat, source?.lng, destination?.lat, destination?.lng, active, onRouteGeometry]);

  const timeLeft = useMemo(() => {
    if (!active?.expectedEndAt) return null;
    const t = new Date(active.expectedEndAt).getTime() - clockNow;
    return t;
  }, [active?.expectedEndAt, clockNow]);

  const handleStart = async () => {
    if (!source || !destination) return;
    setLoading(true);
    setRouteError('');
    try {
      const j = await startJourney(token, source, destination);
      setActive(j);
      onRouteGeometry?.(j.routeGeoJson);
    } catch (err) {
      setRouteError(err.message || 'Failed to start journey');
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    if (!active?._id) return;
    setLoading(true);
    setRouteError('');
    try {
      await endJourney(token, active._id);
      setActive(null);
    } catch (err) {
      setRouteError(err.message || 'Failed to end journey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className={styles.panel}>
      <div className={styles.titleRow}>
        <h3>Route & Journey</h3>
        <span className={styles.badge}>{active ? 'Active' : 'Planning'}</span>
      </div>

      {!contactsReady && (
        <div className={styles.warn}>
          Add <strong>3 emergency contacts</strong> before starting a journey.
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.row}>
          <button
            type="button"
            className={selecting === 'source' ? styles.pickActive : styles.pick}
            onClick={() => onSelectMode(selecting === 'source' ? null : 'source')}
            disabled={Boolean(active)}
          >
            Pick source
          </button>
          <button
            type="button"
            className={selecting === 'destination' ? styles.pickActive : styles.pick}
            onClick={() => onSelectMode(selecting === 'destination' ? null : 'destination')}
            disabled={Boolean(active)}
          >
            Pick destination
          </button>
        </div>
        <div className={styles.coords}>
          <div>
            <span className={styles.label}>Source</span>
            <span className={styles.value}>
              {source ? `${source.lat.toFixed(5)}, ${source.lng.toFixed(5)}` : 'Not set'}
            </span>
          </div>
          <div>
            <span className={styles.label}>Destination</span>
            <span className={styles.value}>
              {destination ? `${destination.lat.toFixed(5)}, ${destination.lng.toFixed(5)}` : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {active ? (
        <div className={styles.section}>
          <div className={styles.metrics}>
            <div>
              <span className={styles.label}>Distance</span>
              <span className={styles.metricValue}>{fmtDistance(active.osrmDistanceM)}</span>
            </div>
            <div>
              <span className={styles.label}>ETA (avg)</span>
              <span className={styles.metricValue}>{fmtDuration(active.osrmDurationSec)}</span>
            </div>
          </div>

          <div className={styles.countdown}>
            <span className={styles.label}>Time until alert</span>
            <span className={timeLeft != null && timeLeft < 0 ? styles.overdue : styles.metricValue}>
              {timeLeft == null ? '—' : timeLeft < 0 ? `Overdue by ${fmtDuration(Math.abs(timeLeft) / 1000)}` : fmtDuration(timeLeft / 1000)}
            </span>
          </div>

          <button type="button" className={styles.end} onClick={handleEnd} disabled={loading}>
            {loading ? 'Ending…' : 'END journey'}
          </button>
        </div>
      ) : (
        <div className={styles.section}>
          <div className={styles.metrics}>
            <div>
              <span className={styles.label}>Distance</span>
              <span className={styles.metricValue}>{route ? fmtDistance(route.distanceM) : '—'}</span>
            </div>
            <div>
              <span className={styles.label}>ETA (avg)</span>
              <span className={styles.metricValue}>{route ? fmtDuration(route.durationSec) : '—'}</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.start}
            onClick={handleStart}
            disabled={loading || !source || !destination || !contactsReady}
          >
            {loading ? 'Starting…' : 'START journey'}
          </button>
        </div>
      )}

      {routeError && <div className={styles.error}>{routeError}</div>}
      {loading && <div className={styles.muted}>Working…</div>}
      {selecting && <div className={styles.muted}>Tip: click on the map to set the {selecting} point.</div>}
    </aside>
  );
}

