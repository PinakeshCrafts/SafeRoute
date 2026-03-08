export function minutesToMs(min) {
  return Math.max(0, Number(min) || 0) * 60 * 1000;
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

