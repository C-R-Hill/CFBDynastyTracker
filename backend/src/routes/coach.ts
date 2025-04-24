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
    body('wins').optional().isInt({ min: 0 }).withMessage('Wins must be a non-negative number'),
    body('losses').optional().isInt({ min: 0 }).withMessage('Losses must be a non-negative number'),
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

      const coach = new Coach({
        ...req.body,
        dynastyId
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

export default router; 