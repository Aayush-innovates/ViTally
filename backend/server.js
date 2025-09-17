import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import doctorRoutes from './routes/doctors.js';
import axios from 'axios';
import bloodRequestRoutes from './routes/bloodRequests.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ---------- FIXED CORS (must be before routes & security middlewares) ----------
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://vi-tally.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middlewares
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100
});
app.use(limiter);

// ---------------- ROUTES ----------------
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);

// Proxy endpoint to external blood compatibility API
app.post('/api/donors', async (req, res) => {
  try {
    const response = await axios.post(
      'https://blood-compatibility-model.onrender.com/get_donors',
      req.body,
      { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const details = error.response?.data || { message: error.message };
    return res.status(status).json({ success: false, error: 'Failed to fetch compatible donors', details });
  }
});

// Test route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Blood Donation API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
