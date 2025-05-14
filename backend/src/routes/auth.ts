import express from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const router = express.Router();

console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.status(201).json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed', error: err });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, user: { _id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err });
  }
});

// Get user's favorite team
router.get('/favorite-team', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ favoriteTeam: user.favoriteTeam });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err });
  }
});

// Update user's favorite team
router.put('/favorite-team', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { favoriteTeam } = req.body;
    user.favoriteTeam = favoriteTeam;
    await user.save();
    res.json({ favoriteTeam: user.favoriteTeam });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err });
  }
});

// Update username
router.put('/update-username', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ message: 'New username required' });
    // Check uniqueness
    const existing = await User.findOne({ username: newUsername });
    if (existing && (existing as any)._id.toString() !== (user as any)._id.toString()) {
      return res.status(409).json({ message: 'Username already taken' });
    }
    user.username = newUsername;
    await user.save();
    res.json({ username: user.username });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update username', error: err });
  }
});

// Update password
router.put('/update-password', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both old and new passwords required' });
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(401).json({ message: 'Old password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update password', error: err });
  }
});

export default router; 