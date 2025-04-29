import express, { Request, Response } from 'express';
import { Types, Document } from 'mongoose';
import Coach from '../models/Coach';
import { Dynasty } from '../models/Dynasty';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';

interface DynastyRequest extends Request {
  params: {
    dynastyId: string;
    coachId?: string;
    year?: string;
  }
}

interface Season {
  year: number;
  wins: number;
  losses: number;
  isEditable: boolean;
  college: string;
  position: string;
  confChamp: boolean;
  postSeason: 'none' | 'bowl' | 'playoff';
  bowlGame: string;
  bowlOpponent: string;
  bowlResult: boolean;
  playoffSeed?: number;
  playoffResult: 'none' | 'first_round_loss' | 'second_round_loss' | 'semifinal_loss' | 'championship_loss' | 'champion';
}

interface CoachDocument extends Document {
  _id: string;
  dynastyId: string;
  firstName: string;
  lastName: string;
  college: string;
  position: string;
  seasons: Types.DocumentArray<Season>;
  currentYear: number;
}

const router = express.Router({ mergeParams: true });

// Get all coaches for a dynasty
router.get('/', async (req: DynastyRequest, res: Response) => {
  try {
    const { dynastyId } = req.params;
    const coaches = await Coach.find({ dynastyId });
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coaches', error });
  }
});

// Get a specific coach
router.get('/:coachId', async (req: DynastyRequest, res: Response) => {
  try {
    const { dynastyId, coachId } = req.params;

    // Validate ID formats
    if (!Types.ObjectId.isValid(dynastyId) || !Types.ObjectId.isValid(coachId!)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const coach = await Coach.findOne({ _id: coachId, dynastyId });
    
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.json(coach);
  } catch (error) {
    console.error('Error getting coach:', error);
    res.status(500).json({ message: 'Error getting coach' });
  }
});

// Create a new coach
router.post('/',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('college').trim().notEmpty().withMessage('College is required'),
    body('position').trim().notEmpty().withMessage('Position is required'),
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      console.log('CREATE COACH REQ BODY:', req.body);
      const { dynastyId } = req.params;
      const dynasty = await Dynasty.findById(dynastyId);
      if (!dynasty) {
        return res.status(404).json({ message: 'Dynasty not found' });
      }

      const coachCount = await Coach.countDocuments({ dynastyId });
      if (coachCount >= 8) {
        return res.status(400).json({ message: 'Maximum number of coaches (8) reached for this dynasty' });
      }

      // Create new coach with initial season matching dynasty's currentYear
      const coach = new Coach({
        ...req.body,
        dynastyId,
        currentYear: dynasty.currentYear,
        seasons: [{
          year: dynasty.currentYear,
          wins: 0,
          losses: 0,
          isEditable: true,
          college: req.body.college,
          position: req.body.position
        }]
      });
      
      await coach.save();
      res.status(201).json(coach);
    } catch (error) {
      res.status(500).json({ message: 'Error creating coach', error });
    }
  }
);

// Update a coach
router.put('/:coachId',
  [
    param('coachId').isMongoId().withMessage('Invalid coach ID'),
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('college').optional().trim().notEmpty().withMessage('College cannot be empty'),
    body('wins').optional().isInt({ min: 0 }).withMessage('Wins must be a non-negative number'),
    body('losses').optional().isInt({ min: 0 }).withMessage('Losses must be a non-negative number'),
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      const { dynastyId, coachId } = req.params;
      const coach = await Coach.findOneAndUpdate(
        { _id: coachId, dynastyId },
        { $set: req.body },
        { new: true }
      );
      
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
      
      res.json(coach);
    } catch (error) {
      res.status(500).json({ message: 'Error updating coach', error });
    }
  }
);

// Delete a coach
router.delete('/:coachId',
  [
    param('coachId').isMongoId().withMessage('Invalid coach ID'),
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      const { dynastyId, coachId } = req.params;
      const coach = await Coach.findOneAndDelete({ _id: coachId, dynastyId });
      
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting coach', error });
    }
  }
);

// Start a new season for all coaches in a dynasty
router.post('/start-season', async (req: DynastyRequest, res: Response) => {
  try {
    const { dynastyId } = req.params;
    // Find the dynasty and increment its currentYear
    const dynasty = await Dynasty.findById(dynastyId);
    if (!dynasty) {
      return res.status(404).json({ message: 'Dynasty not found' });
    }
    dynasty.currentYear += 1;
    await dynasty.save();

    // Find all coaches in the dynasty
    const coaches = await Coach.find({ dynastyId }) as CoachDocument[];
    
    // For each coach, make current season not editable and increment current year
    const updatePromises = coaches.map(async (coach) => {
      // Make current season not editable if it exists
      if (coach.seasons.length > 0) {
        const currentSeasonIndex = coach.seasons.findIndex(s => s.year === coach.currentYear);
        if (currentSeasonIndex !== -1) {
          coach.seasons[currentSeasonIndex].isEditable = false;
        }
      }

      // Add new season using the coach's current college and position
      const newSeason = {
        year: coach.currentYear + 1,
        wins: 0,
        losses: 0,
        isEditable: true,
        college: coach.college || '',
        position: coach.position || 'HC',
        confChamp: false
      };
      
      // Use Mongoose's push method to maintain the DocumentArray type
      coach.seasons.push(newSeason);

      // Increment current year
      coach.currentYear += 1;
      return coach.save();
    });

    // Wait for all updates to complete
    const updatedCoaches = await Promise.all(updatePromises);
    res.json(updatedCoaches);
  } catch (error) {
    console.error('Error starting new season:', error);
    res.status(500).json({ message: 'Error starting new season' });
  }
});

// Update a specific season
router.put('/:coachId/seasons/:year',
  [
    param('year').isInt({ min: 1 }).withMessage('Invalid year'),
    body('wins').isInt({ min: 0 }).withMessage('Wins must be a non-negative number'),
    body('losses').isInt({ min: 0 }).withMessage('Losses must be a non-negative number'),
    body('college').optional().trim().notEmpty().withMessage('College is required'),
    body('position').optional().trim().notEmpty().withMessage('Position is required'),
    body('confChamp').optional().isBoolean().withMessage('Conference championship must be a boolean'),
    body('postSeason').optional().isIn(['none', 'bowl', 'playoff']).withMessage('Invalid post-season type'),
    body('bowlGame').optional(),
    body('bowlOpponent').optional(),
    body('bowlResult').optional().isBoolean().withMessage('Bowl result must be a boolean'),
    body('playoffSeed').optional().custom((value, { req }) => {
      // Only validate if postSeason is playoff and playoffSeed is provided
      if (req.body.postSeason === 'playoff' && value !== undefined) {
        if (!Number.isInteger(value) || value < 1 || value > 12) {
          throw new Error('Playoff seed must be between 1 and 12 when in playoff mode');
        }
      }
      return true;
    }),
    body('playoffResult').optional().isIn(['none', 'first_round_loss', 'second_round_loss', 'semifinal_loss', 'championship_loss', 'champion']).withMessage('Invalid playoff result'),
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      const { dynastyId, coachId, year } = req.params;
      const yearNum = parseInt(year || '0', 10);
      
      if (isNaN(yearNum) || yearNum < 1) {
        return res.status(400).json({ message: 'Invalid year parameter' });
      }

      const { 
        wins, 
        losses, 
        college, 
        position, 
        confChamp,
        postSeason,
        bowlGame,
        bowlOpponent,
        bowlResult,
        playoffSeed,
        playoffResult
      } = req.body;
      
      const coach = await Coach.findOne({ _id: coachId, dynastyId });
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
      
      const seasonIndex = coach.seasons.findIndex(s => s.year === yearNum);
      if (seasonIndex === -1) {
        return res.status(404).json({ message: 'Season not found' });
      }
      
      // Only allow updates if season is editable
      if (!coach.seasons[seasonIndex].isEditable) {
        return res.status(403).json({ message: 'Season is not editable' });
      }
      
      // Update basic fields
      if (typeof wins === 'number') coach.seasons[seasonIndex].wins = wins;
      if (typeof losses === 'number') coach.seasons[seasonIndex].losses = losses;
      if (college) coach.seasons[seasonIndex].college = college;
      if (position) coach.seasons[seasonIndex].position = position;
      if (typeof confChamp !== 'undefined') coach.seasons[seasonIndex].confChamp = confChamp;
      
      // Update post-season fields
      if (postSeason) {
        coach.seasons[seasonIndex].postSeason = postSeason;
        
        // Reset post-season related fields based on type
        if (postSeason === 'none') {
          coach.seasons[seasonIndex].bowlGame = '';
          coach.seasons[seasonIndex].bowlOpponent = '';
          coach.seasons[seasonIndex].bowlResult = false;
          coach.seasons[seasonIndex].playoffSeed = undefined;
          coach.seasons[seasonIndex].playoffResult = 'none';
        } else if (postSeason === 'bowl') {
          coach.seasons[seasonIndex].playoffSeed = undefined;
          coach.seasons[seasonIndex].playoffResult = 'none';
          coach.seasons[seasonIndex].bowlGame = bowlGame || '';
          coach.seasons[seasonIndex].bowlOpponent = bowlOpponent || '';
          coach.seasons[seasonIndex].bowlResult = bowlResult || false;
        } else if (postSeason === 'playoff') {
          coach.seasons[seasonIndex].bowlGame = '';
          coach.seasons[seasonIndex].bowlOpponent = '';
          coach.seasons[seasonIndex].bowlResult = false;
          if (playoffSeed !== undefined) {
            coach.seasons[seasonIndex].playoffSeed = playoffSeed;
          }
          coach.seasons[seasonIndex].playoffResult = playoffResult || 'none';
        }
      }
      
      await coach.save();
      res.json(coach);
    } catch (error) {
      console.error('Error updating season:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ message: 'Error updating season', error: errorMessage });
    }
  }
);

// Toggle season editability
router.put('/:coachId/seasons/:year/toggle-edit',
  [
    param('year').isInt({ min: 1 }).withMessage('Invalid year'),
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      const { dynastyId, coachId, year } = req.params;
      
      if (!year || !coachId) {
        return res.status(400).json({ message: 'Year and coach ID parameters are required' });
      }
      
      const coach = await Coach.findOne({ _id: coachId, dynastyId });
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
      
      const seasonIndex = coach.seasons.findIndex(s => s.year === parseInt(year));
      if (seasonIndex === -1) {
        return res.status(404).json({ message: 'Season not found' });
      }
      
      // Toggle the isEditable flag
      coach.seasons[seasonIndex].isEditable = !coach.seasons[seasonIndex].isEditable;
      
      await coach.save();
      res.json(coach);
    } catch (error) {
      console.error('Error toggling season editability:', error);
      res.status(500).json({ message: 'Error toggling season editability' });
    }
  }
);

// Roll back the current season for all coaches in a dynasty
router.post('/rollback-season', async (req: DynastyRequest, res: Response) => {
  try {
    const { dynastyId } = req.params;
    
    // First, update the dynasty's currentYear
    const dynasty = await Dynasty.findById(dynastyId);
    if (!dynasty) {
      return res.status(404).json({ message: 'Dynasty not found' });
    }
    dynasty.currentYear -= 1;
    await dynasty.save();

    // Find all coaches in the dynasty
    const coaches = await Coach.find({ dynastyId }) as CoachDocument[];
    const updatePromises = coaches.map(async (coach) => {
      // Only roll back if more than one season exists
      if (coach.seasons.length > 1) {
        // Get all seasons except the current one
        const seasonsToKeep = coach.seasons.filter(s => s.year !== coach.currentYear);
        
        // Update using Mongoose's updateOne to avoid DocumentArray type issues
        await Coach.updateOne(
          { _id: coach._id },
          { 
            $set: { 
              seasons: seasonsToKeep,
              currentYear: coach.currentYear - 1
            }
          }
        );
        
        // Fetch the updated coach
        const updatedCoach = await Coach.findById(coach._id);
        if (!updatedCoach) return null;
        
        // Make the new current season editable
        const prevSeason = updatedCoach.seasons.find(s => s.year === updatedCoach.currentYear);
        if (prevSeason) {
          prevSeason.isEditable = true;
          await updatedCoach.save();
        }
        
        return updatedCoach;
      } else {
        // If only one season, delete the coach
        await Coach.deleteOne({ _id: coach._id });
        return null;
      }
    });
    let updatedCoaches = await Promise.all(updatePromises);
    // Filter out deleted coaches (nulls)
    updatedCoaches = updatedCoaches.filter(Boolean);
    res.json(updatedCoaches);
  } catch (error) {
    console.error('Error rolling back season:', error);
    res.status(500).json({ message: 'Error rolling back season' });
  }
});

export default router; 