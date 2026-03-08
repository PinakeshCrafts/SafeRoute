import { Link } from 'react-router-dom';
import styles from './Landing.module.css';

export default function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>SafeRoute</div>
          <div className={styles.tagline}>Women Travel Safety</div>
        </div>
        <nav className={styles.nav}>
          <Link className={styles.link} to="/login">Login</Link>
          <Link className={styles.primary} to="/register">Create account</Link>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <div className={styles.heroCopy}>
          <h1>Plan safer routes. Report incidents anonymously.</h1>
          <p>
            SafeRoute aggregates reports into a grid-based heatmap so you can spot higher-risk areas
            and make more informed travel decisions.
          </p>
          <div className={styles.ctaRow}>
            <Link className={styles.primaryLarge} to="/register">Get started</Link>
            <Link className={styles.secondaryLarge} to="/login">I already have an account</Link>
          </div>
            </div>
            <div className={styles.heroImageWrap}>
              <img className={styles.heroImage} src="/abcd.png" alt="Woman traveler with map and taxi" />
            </div>
          </div>
          <div className={styles.cards}>
            <div className={styles.card}>
              <h3>Anonymous reporting</h3>
              <p>Report unsafe locations, harassment, and suspicious activity without sharing personal info.</p>
            </div>
            <div className={styles.card}>
              <h3>Safety heatmap</h3>
              <p>See safety scores per grid cell and view recent incidents in the area.</p>
            </div>
            <div className={styles.card}>
              <h3>Journey alerts</h3>
              <p>Start a journey and automatically alert 3 emergency contacts if you don’t end it on time.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

