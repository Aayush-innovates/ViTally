import mongoose from 'mongoose';

const donorResponseSchema = new mongoose.Schema({
  donorId: {
    type: String,
    required: true
  },
  donorName: {
    type: String,
    required: true
  },
  donorPhone: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  compatibilityScore: {
    type: Number,
    required: true
  },
  distanceKm: {
    type: Number,
    required: true
  },
  uniqueLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  responseDate: {
    type: Date
  },
  smsStatus: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  smsSid: {
    type: String
  }
});

const BloodRequestSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String,
    required: true
  },
  unitsNeeded: {
    type: Number,
    required: true
  },
  urgency: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  donorResponses: [donorResponseSchema],
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('BloodRequest', BloodRequestSchema);