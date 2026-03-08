import styles from './DashboardHeader.module.css';

export default function DashboardHeader({
  username,
  onReportClick,
  onEmergencyClick,
  onContactsClick,
  onLogout,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>SafeRoute</span>
        <span className={styles.tagline}>Women Travel Safety</span>
      </div>
      <div className={styles.user}>
        <span className={styles.userName}>@{username}</span>
      </div>
      <nav className={styles.nav}>
        <button type="button" className={styles.btnSecondary} onClick={onContactsClick}>
          Emergency contacts
        </button>
        <button type="button" className={styles.btnReport} onClick={onReportClick}>
          Report incident
        </button>
        <button type="button" className={styles.btnEmergency} onClick={onEmergencyClick}>
          Send alert now
        </button>
        <button type="button" className={styles.btnSecondary} onClick={onLogout}>
          Logout
        </button>
      </nav>
    </header>
  );
}

