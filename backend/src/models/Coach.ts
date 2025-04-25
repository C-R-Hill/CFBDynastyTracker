import mongoose from 'mongoose';

const seasonSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
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
  },
  isEditable: {
    type: Boolean,
    default: true
  }
});

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
  seasons: [seasonSchema],
  currentYear: {
    type: Number,
    default: 2024
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for faster queries by dynastyId
coachSchema.index({ dynastyId: 1 });

// Virtual for total career wins
coachSchema.virtual('wins').get(function() {
  if (!this.seasons) return 0;
  return this.seasons.reduce((total: number, season: any) => total + (season.wins || 0), 0);
});

// Virtual for total career losses
coachSchema.virtual('losses').get(function() {
  if (!this.seasons) return 0;
  return this.seasons.reduce((total: number, season: any) => total + (season.losses || 0), 0);
});

// Virtual for win percentage
coachSchema.virtual('winPercentage').get(function() {
  const wins = this.get('wins');
  const losses = this.get('losses');
  const totalGames = wins + losses;
  if (totalGames === 0) return 0;
  return (wins / totalGames * 100).toFixed(1);
});

const Coach = mongoose.model('Coach', coachSchema);

export default Coach; 