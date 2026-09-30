import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { repo } from '../models/repository.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in to access your legal workspace.',
        code: 'AUTH_REQUIRED'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    
    const user = await repo.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please sign in again.',
        code: 'SESSION_EXPIRED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please sign in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication credentials.',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * Optional auth middleware: Populates req.user if valid token exists, or creates a default demo session
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await repo.users.findById(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    }
  } catch (err) {
    // continue as guest/demo
  }

  // Fallback demo user for frictionless evaluation
  req.user = {
    _id: 'usr_demo_counsel_001',
    id: 'usr_demo_counsel_001',
    name: 'Advocate Rajesh Raman',
    email: 'rajesh.raman@legalease.in',
    role: 'Senior Counsel',
    organization: 'Apex Legal Chambers, Delhi',
    jurisdiction: 'India (Supreme Court & Delhi High Court)'
  };
  next();
};
