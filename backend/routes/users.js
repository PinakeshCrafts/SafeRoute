import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.put('/me/emergency-contacts', requireAuth, async (req, res) => {
  try {
    const { contacts } = req.body || {};
    if (!Array.isArray(contacts)) return res.status(400).json({ error: 'contacts must be an array' });
    if (contacts.length !== 3) return res.status(400).json({ error: 'Provide exactly 3 emergency contact emails' });

    const normalized = contacts.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean);
    if (normalized.length !== 3) return res.status(400).json({ error: 'Provide exactly 3 valid emails' });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { emergencyContacts: normalized },
      { new: true, runValidators: true, select: 'username emergencyContacts' }
    ).lean();

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

