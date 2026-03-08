import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import incidentsRouter from './routes/incidents.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import journeysRouter from './routes/journeys.js';
import { startOverdueJourneyScanner } from './jobs/overdueJourneyScanner.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api/incidents', incidentsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/journeys', journeysRouter);

app.get('/api/health', (_, res) => res.json({ ok: true }));

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
    startOverdueJourneyScanner();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
