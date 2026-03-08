import { useEffect, useState } from 'react';
import styles from './EmergencyContactsModal.module.css';

export default function EmergencyContactsModal({ open, initialContacts, onClose, onSave }) {
  const [contacts, setContacts] = useState(['', '', '']);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = Array.isArray(initialContacts) ? initialContacts.slice(0, 3) : [];
    while (next.length < 3) next.push('');
    setContacts(next);
    setError('');
    setSaving(false);
  }, [open, initialContacts]);

  if (!open) return null;

  const update = (idx, value) => {
    setContacts((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleSave = async () => {
    setError('');
    const normalized = contacts.map((c) => String(c || '').trim());
    if (normalized.some((c) => !c)) {
      setError('Please fill all 3 emergency contact emails.');
      return;
    }
    setSaving(true);
    try {
      await onSave(normalized);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2>Emergency contacts</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className={styles.description}>
          Add exactly <strong>3</strong> emails. If your journey runs overdue, SafeRoute will email them automatically.
        </p>
        <div className={styles.form}>
          {contacts.map((c, i) => (
            <label key={i} className={styles.field}>
              Contact {i + 1}
              <input
                type="email"
                value={c}
                onChange={(e) => update(i, e.target.value)}
                placeholder="name@example.com"
              />
            </label>
          ))}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.save} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

