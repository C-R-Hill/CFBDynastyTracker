import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import dynastyRoutes from './routes/dynasty';
import coachRoutes from './routes/coach';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// CORS configuration
const corsOptions = {
  origin: true,  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cfb-companion';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth routes
app.use('/api/auth', authRoutes);
// Dynasty routes
app.use('/api/dynasties', dynastyRoutes);
// Coach routes as sub-routes of dynasties
dynastyRoutes.use('/:dynastyId/coaches', coachRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 