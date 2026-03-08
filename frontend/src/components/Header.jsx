import styles from './Header.module.css';

export default function Header({ onReportClick, onEmergencyClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>SafeRoute</span>
        <span className={styles.tagline}>Women Travel Safety</span>
      </div>
      <nav className={styles.nav}>
        <button type="button" className={styles.btnReport} onClick={onReportClick}>
          Report incident
        </button>
        <button type="button" className={styles.btnEmergency} onClick={onEmergencyClick}>
          Emergency alert
        </button>
      </nav>
    </header>
  );
}
