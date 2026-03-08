import Journey from '../models/Journey.js';
import User from '../models/User.js';
import { sendEmailJS } from '../utils/emailjs.js';
import { sleep } from '../utils/time.js';

const EMAIL_THROTTLE_MS = 1100; // EmailJS REST rate limit ~ 1 req/sec

export function startOverdueJourneyScanner() {
  const hasEmailEnv =
    process.env.EMAILJS_SERVICE_ID &&
    process.env.EMAILJS_TEMPLATE_ID &&
    process.env.EMAILJS_PUBLIC_KEY &&
    process.env.EMAILJS_PRIVATE_KEY;
  if (!hasEmailEnv) {
    console.warn('OverdueJourneyScanner disabled: EMAILJS_* env vars not configured');
    return;
  }

  const intervalMs = 60_000;
  let running = false;

  setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const now = new Date();
      const overdue = await Journey.find({
        endedAt: null,
        alertSentAt: null,
        expectedEndAt: { $lt: now },
      })
        .sort({ expectedEndAt: 1 })
        .limit(25)
        .lean();

      for (const j of overdue) {
        const user = await User.findById(j.userId).select('username emergencyContacts').lean();
        const contacts = user?.emergencyContacts || [];
        if (contacts.length !== 3) {
          await Journey.updateOne({ _id: j._id }, { $set: { alertSentAt: new Date() } });
          continue;
        }

        const message = [
          `SafeRoute alert: Journey may be overdue.`,
          `User: ${user?.username || 'unknown'}`,
          `Started: ${new Date(j.startedAt).toLocaleString()}`,
          `Expected end: ${new Date(j.expectedEndAt).toLocaleString()}`,
          `Please contact them immediately.`,
        ].join('\n');

        for (const email of contacts) {
          await sendEmailJS({
            toEmail: email,
            toName: '',
            templateParams: {
              message,
              username: user?.username || '',
              started_at: j.startedAt?.toISOString?.() || '',
              expected_end_at: j.expectedEndAt?.toISOString?.() || '',
            },
          });
          await sleep(EMAIL_THROTTLE_MS);
        }

        await Journey.updateOne({ _id: j._id }, { $set: { alertSentAt: new Date() } });
      }
    } catch (err) {
      console.error('OverdueJourneyScanner error:', err.message);
    } finally {
      running = false;
    }
  }, intervalMs);

  console.log('OverdueJourneyScanner started (every 60s)');
}

