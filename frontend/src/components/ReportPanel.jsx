import { useState } from 'react';
import styles from './ReportPanel.module.css';
import { reportIncident } from '../api/incidents';

const TYPES = [
  { value: 'unsafe_location', label: 'Unsafe location' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'suspicious_activity', label: 'Suspicious activity' },
];

const SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function ReportPanel({ onClose, onSubmit }) {
  const [type, setType] = useState('unsafe_location');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => setError('Could not get your location. Enter coordinates manually.')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Please enter valid latitude and longitude, or use "Use my location".');
      return;
    }
    setError('');
    setSending(true);
    try {
      await reportIncident({ type, severity, description: description.trim(), latitude, longitude });
      onSubmit?.();
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2>Report incident (anonymous)</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label>
            Severity
            <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITIES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <div className={styles.locationRow}>
              <input
                type="text"
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
              <input
                type="text"
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
              <button type="button" className={styles.geoBtn} onClick={handleUseMyLocation}>
                Use my location
              </button>
            </div>
          </label>
          <label>
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the incident..."
              rows={3}
              maxLength={500}
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submit} disabled={sending}>
              {sending ? 'Submitting…' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
