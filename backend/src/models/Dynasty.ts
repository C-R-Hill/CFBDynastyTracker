import mongoose from 'mongoose';

const dynastySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  currentYear: {
    type: Number,
    default: () => new Date().getFullYear()
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
dynastySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Dynasty = mongoose.model('Dynasty', dynastySchema); 