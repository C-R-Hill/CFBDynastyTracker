import express from 'express';
import { Dynasty } from '../models/Dynasty';

const router = express.Router();

// Get all dynasties
router.get('/', async (req, res) => {
  try {
    const dynasties = await Dynasty.find().sort({ createdAt: -1 });
    res.json(dynasties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dynasties', error });
  }
});

// Create a new dynasty
router.post('/', async (req, res) => {
  try {
    const { name, startDate } = req.body;
    const dynasty = new Dynasty({
      name,
      startDate: new Date(startDate)
    });
    await dynasty.save();
    res.status(201).json(dynasty);
  } catch (error) {
    res.status(400).json({ message: 'Error creating dynasty', error });
  }
});

// Get a specific dynasty
router.get('/:id', async (req, res) => {
  try {
    const dynasty = await Dynasty.findById(req.params.id);
    if (!dynasty) {
      return res.status(404).json({ message: 'Dynasty not found' });
    }
    res.json(dynasty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dynasty', error });
  }
});

// Update a dynasty
router.put('/:id', async (req, res) => {
  try {
    const { name, startDate } = req.body;
    const dynasty = await Dynasty.findByIdAndUpdate(
      req.params.id,
      {
        name,
        startDate: new Date(startDate)
      },
      { new: true }
    );
    if (!dynasty) {
      return res.status(404).json({ message: 'Dynasty not found' });
    }
    res.json(dynasty);
  } catch (error) {
    res.status(400).json({ message: 'Error updating dynasty', error });
  }
});

// Delete a dynasty
router.delete('/:id', async (req, res) => {
  try {
    const dynasty = await Dynasty.findByIdAndDelete(req.params.id);
    if (!dynasty) {
      return res.status(404).json({ message: 'Dynasty not found' });
    }
    res.json({ message: 'Dynasty deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dynasty', error });
  }
});

export default router; 