# SafeRoute – Women Travel Safety

A MERN stack application for **anonymous reporting** of unsafe locations, harassment incidents, and suspicious activities. It aggregates data into a **grid-based safety heatmap** and supports **emergency contact alerts** via EmailJS.

**If the journey does not end after the average duration, The after a Buffer period it alerts the emergency contacts and share the location of the user.**

<img width="1919" height="1067" alt="image" src="https://github.com/user-attachments/assets/66a93a30-916b-4073-a2a5-fdd8bdff0cea" />

<img width="1919" height="1058" alt="image" src="https://github.com/user-attachments/assets/e05539ae-fa81-4fca-b94c-f7a1976ace03" />

<img width="1919" height="1071" alt="image" src="https://github.com/user-attachments/assets/2ef7f297-4173-4bff-b37b-ed9cd97076df" />



## Features

- **Anonymous incident reporting** – Report unsafe location, harassment, or suspicious activity (no account required).
- **Grid-based safety heatmap** – Aggregated incident data shown on a dark map; click a region to see safety score.
- **Real-time updates** – New reports refresh the map and heatmap.
- **Safety score** – Per-grid safety score (0–100) based on incident count and severity.
- **Emergency contact alert** – Send an email to a contact via EmailJS (e.g. “I need help, please check on me”).

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite), Leaflet + Leaflet.heat, EmailJS (browser)

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


