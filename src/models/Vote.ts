import mongoose from 'mongoose';

export interface IVote extends mongoose.Document {
  userId: string;
  type: 'positive' | 'negative' | 'invalid';
  timestamp: number;
  region: string;
  city: string;
  kzaz: string;
  deviceInfo: {
    ip: string;
    userAgent: string;
    browser: string;
    os: string;
  };
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['positive', 'negative', 'invalid'],
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  kzaz: {
    type: String,
    required: true,
  },
  deviceInfo: {
    ip: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    browser: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
  },
  synced: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

export default mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);
