import express from 'express';
import Journey from '../models/Journey.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { getRoute } from '../utils/osrm.js';
import { minutesToMs } from '../utils/time.js';

const router = express.Router();

function parsePoint(input) {
  const lat = Number(input?.lat);
  const lng = Number(input?.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

router.post('/preview', requireAuth, async (req, res) => {
  try {
    const source = parsePoint(req.body?.source);
    const destination = parsePoint(req.body?.destination);
    if (!source || !destination) return res.status(400).json({ error: 'source and destination are required' });

    const route = await getRoute({ source, destination });
    return res.json(route);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/start', requireAuth, async (req, res) => {
  try {
    const source = parsePoint(req.body?.source);
    const destination = parsePoint(req.body?.destination);
    if (!source || !destination) return res.status(400).json({ error: 'source and destination are required' });

    const user = await User.findById(req.user.id).select('emergencyContacts username').lean();
    if (!user) return res.status(404).json({ error: 'user not found' });
    if (!Array.isArray(user.emergencyContacts) || user.emergencyContacts.length !== 3) {
      return res.status(400).json({ error: 'Set exactly 3 emergency contacts before starting a journey' });
    }

    const route = await getRoute({ source, destination });
    const bufferMin = Number(process.env.ALERT_BUFFER_MINUTES ?? 15);
    const startedAt = new Date();
    const expectedEndAt = new Date(startedAt.getTime() + route.durationSec * 1000 + minutesToMs(bufferMin));

    // End any existing active journey (optional policy). We'll allow only one active journey per user.
    await Journey.updateMany(
      { userId: req.user.id, endedAt: null },
      { $set: { endedAt: startedAt } }
    );

    const journey = await Journey.create({
      userId: req.user.id,
      source,
      destination,
      osrmDurationSec: route.durationSec,
      osrmDistanceM: route.distanceM,
      routeGeoJson: route.geometry,
      startedAt,
      expectedEndAt,
    });

    return res.status(201).json({
      _id: journey._id,
      startedAt: journey.startedAt,
      expectedEndAt: journey.expectedEndAt,
      osrmDurationSec: journey.osrmDurationSec,
      osrmDistanceM: journey.osrmDistanceM,
      routeGeoJson: journey.routeGeoJson,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/active', requireAuth, async (req, res) => {
  try {
    const journey = await Journey.findOne({ userId: req.user.id, endedAt: null })
      .sort({ startedAt: -1 })
      .lean();
    return res.json(journey || null);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/:id/end', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const journey = await Journey.findOneAndUpdate(
      { _id: id, userId: req.user.id, endedAt: null },
      { $set: { endedAt: new Date() } },
      { new: true }
    ).lean();

    if (!journey) return res.status(404).json({ error: 'active journey not found' });
    return res.json(journey);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

