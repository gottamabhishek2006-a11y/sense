require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable trust proxy for Render, Railway, Fly.io reverse proxies
app.set('trust proxy', 1);

// Middleware: Cookie Parser
app.use(cookieParser());

// Connect to MongoDB Atlas
connectDB();

// Middleware: CORS Configuration
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://civic-sense-chi.vercel.app',
];

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allow configured origins or matching Vercel preview deployments
    const isVercelPreview = /^https:\/\/civic-sense.*\.vercel\.app$/.test(normalizedOrigin);
    if (allowedOrigins.indexOf(normalizedOrigin) !== -1 || isVercelPreview || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`Blocked by CORS policy for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware: Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
    next();
  });
}

// API Routes
app.get('/', (req, res) => {
  res.json({
    name: 'CivicFix API Service',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/auth/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Server Listener
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 CivicFix Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
  // Keep server alive in development
});
