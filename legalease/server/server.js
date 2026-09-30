import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { config } from './config/config.js';
import { connectDB } from './config/db.js';
import { repo } from './models/repository.js';
import { verifiedLegalArticles } from './data/seedLegalData.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import libraryRoutes from './routes/libraryRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: '*', // Allow client connections
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key'],
}));

// Rate limiter (strict on production, comfortable for testing)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again after 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', apiLimiter);

// Body Parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    product: 'LegalEase AI Platform',
    version: '1.0.0',
    geminiConfigured: !!config.geminiApiKey,
    jurisdiction: 'India',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/drafts', draftRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/library', libraryRoutes);

// Professional 404 Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'The requested legal API endpoint was not found.',
    code: 'NOT_FOUND'
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Bootstrapping
async function startServer() {
  await connectDB();

  // Seed legal library if empty
  try {
    const existing = await repo.legalArticles.find();
    if (!existing || existing.length === 0) {
      console.log('[Seed] Seeding verified Indian legal articles...');
      for (const item of verifiedLegalArticles) {
        await repo.legalArticles.create(item);
      }
      console.log(`[Seed] Successfully populated ${verifiedLegalArticles.length} authentic legal statutes.`);
    }

    // Seed default demo user and demo drafts if not exist
    const demoUser = await repo.users.findOne({ email: 'advocate.sharma@legalease.in' });
    if (!demoUser) {
      await repo.users.create({
        _id: 'usr_demo_counsel_001',
        name: 'Advocate Priya Sharma',
        email: 'advocate.sharma@legalease.in',
        passwordHash: '$2a$10$wEeVq3PfxwLq5H8vNfPeeuQz1eU5s1O4gK4Y5H8vNfPeeuQz1eU5s',
        organization: 'Sharma & Associates Legal Chamber',
        jurisdiction: 'India (Supreme Court & High Courts)',
        role: 'Senior Counsel'
      });
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`  LegalEase Server running at http://localhost:${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  Gemini Model: ${config.geminiModel}`);
    console.log(`  Gemini API Key: ${config.geminiApiKey ? 'Configured (Active)' : 'Not set (Using intelligent fallback)'}`);
    console.log(`=======================================================`);
  });

  return server;
}

startServer();
