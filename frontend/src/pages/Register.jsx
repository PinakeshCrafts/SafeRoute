import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import { register } from '../api/auth';
import { useAuth } from '../auth/AuthProvider';

export default function Register() {
  const nav = useNavigate();
  const { setSession } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await register(username.trim(), password);
      setSession(res.token);
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>SafeRoute</div>
          <div className={styles.tagline}>Women Travel Safety</div>
        </div>
        <h2 className={styles.title}>Create account</h2>
        <p className={styles.sub}>Set your login, then add 3 emergency contacts inside the dashboard.</p>

        <form className={styles.form} onSubmit={onSubmit}>
          <div className={styles.field}>
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div className={styles.field}>
            <label>Password (min 6 chars)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button className={styles.btn} disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div className={styles.row}>
          <Link to="/">Back</Link>
          <span>
            Already have an account? <Link to="/login">Login</Link>
          </span>
        </div>
      </div>
    </div>
  );
}

