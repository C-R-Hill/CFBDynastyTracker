import mongoose from 'mongoose';

const coachSchema = new mongoose.Schema({
  dynastyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dynasty',
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  wins: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  losses: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for faster queries by dynastyId
coachSchema.index({ dynastyId: 1 });

// Virtual for win percentage
coachSchema.virtual('winPercentage').get(function() {
  const totalGames = this.wins + this.losses;
  if (totalGames === 0) return 0;
  return (this.wins / totalGames * 100).toFixed(1);
});

const Coach = mongoose.model('Coach', coachSchema);

export default Coach; 