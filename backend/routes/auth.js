import express from 'express';
import User from '../models/User.js';
import { hashPassword, signToken, verifyPassword } from '../utils/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });
    if (String(password).length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });

    const passwordHash = await hashPassword(String(password));
    const user = await User.create({ username: String(username).trim(), passwordHash });
    const token = signToken({ userId: user._id, username: user.username });
    return res.status(201).json({ token });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'username already exists' });
    return res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username and password are required' });

    const user = await User.findOne({ username: String(username).trim() });
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await verifyPassword(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = signToken({ userId: user._id, username: user.username });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username emergencyContacts').lean();
    if (!user) return res.status(404).json({ error: 'not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

