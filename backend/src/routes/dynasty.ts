import express from 'express';
import { Dynasty } from '../models/Dynasty';
import auth from '../middleware/auth';

const router = express.Router();

// Get all dynasties for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.user._id;
    const dynasties = await Dynasty.find({
      $or: [
        { ownerId: userId },
        { allowedUsers: userId }
      ]
    }).sort({ createdAt: -1 });
    res.json(dynasties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dynasties', error });
  }
});

// Create a new dynasty (user becomes owner)
router.post('/', auth, async (req, res) => {
  try {
    const { name, startDate } = req.body;
    const currentYear = new Date().getFullYear();
    // @ts-ignore
    const ownerId = req.user._id;
    const dynasty = new Dynasty({
      name,
      startDate: new Date(startDate),
      currentYear,
      ownerId,
      allowedUsers: []
    });
    await dynasty.save();
    res.status(201).json(dynasty);
  } catch (error) {
    res.status(400).json({ message: 'Error creating dynasty', error });
  }
});

// Get a specific dynasty (only if user has access)
router.get('/:id', auth, async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    // @ts-ignore
    const userId = req.user._id;
    if (!dynasty || (String(dynasty.ownerId) !== String(userId) && !dynasty.allowedUsers.includes(userId))) {
      return res.status(404).json({ message: 'Dynasty not found or access denied' });
    }
    res.json(dynasty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dynasty', error });
  }
});

// Update a dynasty (only if user is owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, startDate } = req.body;
    const dynasty = await Dynasty.findById(req.params.id);
    // @ts-ignore
    const userId = req.user._id;
    if (!dynasty || String(dynasty.ownerId) !== String(userId)) {
      return res.status(404).json({ message: 'Dynasty not found or access denied' });
    }
    dynasty.name = name;
    dynasty.startDate = new Date(startDate);
    await dynasty.save();
    res.json(dynasty);
  } catch (error) {
    res.status(400).json({ message: 'Error updating dynasty', error });
  }
});

// Delete a dynasty (only if user is owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    // @ts-ignore
    const userId = req.user._id;
    if (!dynasty || String(dynasty.ownerId) !== String(userId)) {
      return res.status(404).json({ message: 'Dynasty not found or access denied' });
    }
    await dynasty.deleteOne();
    res.json({ message: 'Dynasty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dynasty', error });
  }
});

export default router; 