import styles from './SafetyLegend.module.css';

export default function SafetyLegend() {
  return (
    <div className={styles.legend}>
      <span className={styles.label}>Safety</span>
      <div className={styles.bar}>
        <span className={styles.safe} title="Safer" />
        <span className={styles.mid} />
        <span className={styles.danger} title="Higher risk" />
      </div>
      <span className={styles.low}>Low risk</span>
      <span className={styles.high}>High risk</span>
    </div>
  );
}
