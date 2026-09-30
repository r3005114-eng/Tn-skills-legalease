import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legalease',
  jwtSecret: process.env.JWT_SECRET || 'legalease_super_secure_jwt_secret_key_2026_indian_legal_saas',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  uploadLimitMb: parseInt(process.env.UPLOAD_LIMIT_MB || '15', 10),
};
