import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { repo } from '../models/repository.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user._id || user.id, email: user.email, name: user.name, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, organization, jurisdiction } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    const existingUser = await repo.users.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await repo.users.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      organization: organization || 'Independent Practice',
      jurisdiction: jurisdiction || 'India (Central & State)',
      role: 'legal_professional'
    });

    const token = createToken(newUser);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        organization: newUser.organization,
        jurisdiction: newUser.jurisdiction,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await repo.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = createToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        organization: user.organization,
        jurisdiction: user.jurisdiction,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/demo (One-click demo login)
router.post('/demo', async (req, res, next) => {
  try {
    let demoUser = await repo.users.findOne({ email: 'advocate.sharma@legalease.in' });
    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('DemoLegal2026!', salt);
      demoUser = await repo.users.create({
        name: 'Advocate Priya Sharma',
        email: 'advocate.sharma@legalease.in',
        passwordHash,
        organization: 'Sharma & Associates Legal Chamber',
        jurisdiction: 'India (Supreme Court & High Courts)',
        role: 'legal_professional'
      });
    }

    const token = createToken(demoUser);
    res.json({
      success: true,
      token,
      user: {
        id: demoUser._id || demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        organization: demoUser.organization,
        jurisdiction: demoUser.jurisdiction,
        role: demoUser.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', optionalAuth, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      organization: req.user.organization || 'Independent Legal Counsel',
      jurisdiction: req.user.jurisdiction || 'India',
      role: req.user.role || 'legal_professional'
    }
  });
});

export default router;
