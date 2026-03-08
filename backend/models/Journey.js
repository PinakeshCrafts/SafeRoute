import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const journeySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    source: { type: pointSchema, required: true },
    destination: { type: pointSchema, required: true },
    osrmDurationSec: { type: Number, required: true },
    osrmDistanceM: { type: Number, required: true },
    routeGeoJson: { type: Object }, // LineString GeoJSON from OSRM
    startedAt: { type: Date, required: true, default: Date.now, index: true },
    expectedEndAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, default: null, index: true },
    alertSentAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

journeySchema.index({ userId: 1, endedAt: 1, expectedEndAt: 1 });

export default mongoose.model('Journey', journeySchema);

