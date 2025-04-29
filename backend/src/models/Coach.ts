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
  },
  college: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  confChamp: {
    type: Boolean,
    default: false
  },
  postSeason: {
    type: String,
    enum: ['none', 'bowl', 'playoff'],
    default: 'none'
  },
  bowlGame: {
    type: String,
    default: ''
  },
  bowlResult: {
    type: Boolean,
    default: false
  },
  playoffSeed: {
    type: Number,
    min: [1, 'Playoff seed must be between 1 and 12 when in playoff mode'],
    max: [12, 'Playoff seed must be between 1 and 12 when in playoff mode'],
    default: undefined,
    validate: {
      validator: function(value: number) {
        // @ts-ignore - this refers to the document
        if (this.postSeason === 'playoff') {
          return value >= 1 && value <= 12;
        }
        // Allow any value (including undefined) when not in playoff mode
        return true;
      },
      message: 'Playoff seed must be between 1 and 12 when in playoff mode'
    }
  },
  playoffResult: {
    type: String,
    enum: ['none', 'first_round_loss', 'second_round_loss', 'semifinal_loss', 'championship_loss', 'champion'],
    default: 'none'
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
  position: {
    type: String,
    required: true,
    default: 'HC',
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