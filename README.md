# SafeRoute – Women Travel Safety

A MERN stack application for **anonymous reporting** of unsafe locations, harassment incidents, and suspicious activities. It aggregates data into a **grid-based safety heatmap** and supports **emergency contact alerts** via EmailJS.

## Features

- **Anonymous incident reporting** – Report unsafe location, harassment, or suspicious activity (no account required).
- **Grid-based safety heatmap** – Aggregated incident data shown on a dark map; click a region to see safety score.
- **Real-time updates** – New reports refresh the map and heatmap.
- **Safety score** – Per-grid safety score (0–100) based on incident count and severity.
- **Emergency contact alert** – Send an email to a contact via EmailJS (e.g. “I need help, please check on me”).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite), Leaflet + Leaflet.heat, EmailJS (browser)

## Setup

### 1. MongoDB

Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and copy the connection string.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

- `MONGODB_URI` – Your MongoDB connection URL (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/women-travel-safety?retryWrites=true&w=majority`).
- `PORT` – Optional (default 5000).
- `FRONTEND_URL` – Optional (default `http://localhost:5173`).

Run the server:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` (optional):

- **VITE_API_URL** – Leave unset in development (Vite proxies `/api` to the backend). In production, set to your backend URL.
- **EmailJS** – For “Emergency alert” emails, create an [EmailJS](https://www.emailjs.com/) account, add a service and template, then set:
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`

Template variables you can use: `to_email`, `to_name`, `message` (or match the form field names used in the app).

Run the app:

```bash
npm run dev
```

Open **http://localhost:5173**.

## Usage

- **Report incident** – Click “Report incident”, choose type and severity, set location (or “Use my location”), add optional description, submit. Reports are anonymous.
- **Map** – View incidents as circles and the heatmap overlay. Move/zoom to load data for the visible area.
- **Safety score** – Click on the map to see the safety score for that grid cell (if any incidents exist there).
- **Emergency alert** – Click “Emergency alert”, enter contact email and message, then “Send alert” to send via EmailJS.

## Project structure

```
WomenTravelSafety/
├── backend/
│   ├── config/db.js       # MongoDB connection
│   ├── models/Incident.js # Incident schema
│   ├── routes/incidents.js# API: report, list, heatmap
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/incidents.js
│   │   ├── components/   # MapView, ReportPanel, EmergencyAlert, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
└── README.md
```

## API

- `POST /api/incidents` – Create incident (body: `type`, `latitude`, `longitude`, optional `description`, `severity`).
- `GET /api/incidents?minLat&maxLat&minLng&maxLng&type` – List incidents in bounds.
- `GET /api/incidents/heatmap?minLat&maxLat&minLng&maxLng&gridSize` – Grid heatmap data (cells with count, weight, safetyScore).

## License

MIT.
