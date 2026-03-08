import express from 'express';
import Incident from '../models/Incident.js';

const router = express.Router();

// Anonymous report – no auth, no PII
router.post('/', async (req, res) => {
  try {
    const { type, latitude, longitude, description, severity } = req.body;
    if (!type || latitude == null || longitude == null) {
      return res.status(400).json({ error: 'type, latitude, and longitude are required' });
    }
    const incident = await Incident.create({
      type,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description: description || '',
      severity: severity || 'medium',
    });
    res.status(201).json(incident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List incidents (with optional bounds and filters)
router.get('/', async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng, type, limit = 500 } = req.query;
    const filter = {};
    if (minLat != null) filter.latitude = { ...filter.latitude, $gte: Number(minLat) };
    if (maxLat != null) filter.latitude = { ...filter.latitude, $lte: Number(maxLat) };
    if (minLng != null) filter.longitude = { ...filter.longitude, $gte: Number(minLng) };
    if (maxLng != null) filter.longitude = { ...filter.longitude, $lte: Number(maxLng) };
    if (type) filter.type = type;

    const incidents = await Incident.find(filter)
      .sort({ reportedAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grid-based heatmap: aggregate incidents per cell
// Query params: minLat, maxLat, minLng, maxLng, gridSize (default 0.01 ~ 1km)
router.get('/heatmap', async (req, res) => {
  try {
    const {
      minLat,
      maxLat,
      minLng,
      maxLng,
      gridSize = 0.01,
    } = req.query;

    const minLatN = Number(minLat);
    const maxLatN = Number(maxLat);
    const minLngN = Number(minLng);
    const maxLngN = Number(maxLng);
    const cell = Number(gridSize) || 0.01;

    if ([minLatN, maxLatN, minLngN, maxLngN].some((n) => isNaN(n))) {
      return res.status(400).json({ error: 'minLat, maxLat, minLng, maxLng required and must be numbers' });
    }

    const incidents = await Incident.find({
      latitude: { $gte: minLatN, $lte: maxLatN },
      longitude: { $gte: minLngN, $lte: maxLngN },
    }).lean();

    const grid = new Map();
    for (const inc of incidents) {
      const cellLat = Math.floor(inc.latitude / cell) * cell;
      const cellLng = Math.floor(inc.longitude / cell) * cell;
      const key = `${cellLat.toFixed(5)},${cellLng.toFixed(5)}`;
      const prev = grid.get(key) || { lat: cellLat, lng: cellLng, count: 0, severitySum: 0 };
      const sevWeight = { low: 1, medium: 2, high: 3 }[inc.severity] || 2;
      prev.count += 1;
      prev.severitySum += sevWeight;
      grid.set(key, prev);
    }

    const heatmapData = Array.from(grid.values()).map(({ lat, lng, count, severitySum }) => ({
      lat,
      lng,
      count,
      weight: severitySum,
      safetyScore: Math.max(0, 100 - count * 10 - severitySum * 5),
    }));

    res.json({ cells: heatmapData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
