import { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import styles from './EmergencyAlert.module.css';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export default function EmergencyAlert({ onClose }) {
  const formRef = useRef(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [message, setMessage] = useState('I need help. Please check on me when you can.');
  const [status, setStatus] = useState(''); // 'sending' | 'sent' | 'error'
  const [errorText, setErrorText] = useState('');

  const hasEmailJS = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contactEmail.trim()) {
      setErrorText('Please enter your emergency contact email.');
      return;
    }
    setErrorText('');
    setStatus('sending');

    if (!hasEmailJS) {
      setStatus('error');
      setErrorText('EmailJS is not configured. Add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to .env');
      return;
    }

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current, { publicKey: PUBLIC_KEY });
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setErrorText(err.text || err.message || 'Failed to send alert.');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2>Emergency contact alert</h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <p className={styles.description}>
          Send an email to your emergency contact with your message and (optional) current location.
        </p>
        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          <input type="hidden" name="to_email" value={contactEmail} />
          <input type="hidden" name="to_name" value={contactName} />
          <input type="hidden" name="message" value={message} />
          <label>
            Contact email
            <input
              type="email"
              name="contact_email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="emergency@example.com"
              required
            />
          </label>
          <label>
            Contact name (optional)
            <input
              type="text"
              name="contact_name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Name"
            />
          </label>
          <label>
            Message
            <textarea
              name="user_message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="I need help. Please check on me."
            />
          </label>
          {errorText && <p className={styles.error}>{errorText}</p>}
          {status === 'sent' && <p className={styles.success}>Alert sent to your contact.</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Close
            </button>
            <button type="submit" className={styles.send} disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending…' : 'Send alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
