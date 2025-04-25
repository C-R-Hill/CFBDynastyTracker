import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
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
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      const { dynastyId } = req.params;
      const dynasty = await Dynasty.findById(dynastyId);
      if (!dynasty) {
        return res.status(404).json({ message: 'Dynasty not found' });
      }

      const coachCount = await Coach.countDocuments({ dynastyId });
      if (coachCount >= 8) {
        return res.status(400).json({ message: 'Maximum number of coaches (8) reached for this dynasty' });
      }

      // Create new coach with initial 2024 season
      const coach = new Coach({
        ...req.body,
        dynastyId,
        currentYear: 2024,
        seasons: [{
          year: 2024,
          wins: 0,
          losses: 0,
          isEditable: true
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
    
    // Find all coaches in the dynasty
    const coaches = await Coach.find({ dynastyId });
    
    // For each coach, make current season not editable and increment current year
    const updatePromises = coaches.map(async (coach) => {
      // Make current season not editable if it exists
      if (coach.seasons.length > 0) {
        const currentSeasonIndex = coach.seasons.findIndex(s => s.year === coach.currentYear);
        if (currentSeasonIndex !== -1) {
          coach.seasons[currentSeasonIndex].isEditable = false;
        }
      }
      
      // Add new season with incremented year
      coach.seasons.push({
        year: coach.currentYear + 1,
        wins: 0,
        losses: 0,
        isEditable: true
      });
      
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
    validateRequest
  ],
  async (req: DynastyRequest, res: Response) => {
    try {
      const { dynastyId, coachId, year } = req.params;
      const { wins, losses } = req.body;
      
      const coach = await Coach.findOne({ _id: coachId, dynastyId });
      if (!coach) {
        return res.status(404).json({ message: 'Coach not found' });
      }
      
      const seasonIndex = coach.seasons.findIndex(s => s.year === parseInt(year));
      if (seasonIndex === -1) {
        return res.status(404).json({ message: 'Season not found' });
      }
      
      // Only allow updates if season is editable
      if (!coach.seasons[seasonIndex].isEditable) {
        return res.status(403).json({ message: 'Season is not editable' });
      }
      
      coach.seasons[seasonIndex].wins = wins;
      coach.seasons[seasonIndex].losses = losses;
      
      await coach.save();
      res.json(coach);
    } catch (error) {
      console.error('Error updating season:', error);
      res.status(500).json({ message: 'Error updating season' });
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

export default router; 