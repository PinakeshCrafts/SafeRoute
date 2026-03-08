import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['unsafe_location', 'harassment', 'suspicious_activity'],
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    description: { type: String, trim: true, maxlength: 500 },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    occurredAt: { type: Date, default: Date.now },
    reportedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for geospatial and heatmap aggregation
incidentSchema.index({ latitude: 1, longitude: 1 });
incidentSchema.index({ type: 1, reportedAt: -1 });

export default mongoose.model('Incident', incidentSchema);
