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

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS (allow common frontend dev ports)
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);

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

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
