/**
 * Professional centralized error handler for LegalEase API
 * Prevents raw stack traces or internal implementation leaks
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[LegalEase Error]', {
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'File size exceeds maximum limit of 15MB. Please upload a smaller legal document.',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (err.message && err.message.includes('supported file')) {
    return res.status(400).json({
      success: false,
      error: 'Please upload a supported file. Allowed formats: PDF, DOCX, TXT.',
      code: 'UNSUPPORTED_FILE_TYPE'
    });
  }

  // Gemini API errors
  if (err.message && (err.message.includes('GoogleGenAI') || err.message.includes('GEMINI') || err.status === 429 || err.status === 503)) {
    return res.status(503).json({
      success: false,
      error: 'Gemini service is temporarily unavailable. Local analysis engine has been engaged.',
      code: 'AI_SERVICE_UNAVAILABLE'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Your session has expired. Please sign in again.',
      code: 'SESSION_EXPIRED'
    });
  }

  // Document analysis failures
  if (req.originalUrl.includes('/documents/analyze')) {
    return res.status(500).json({
      success: false,
      error: 'Unable to analyze this document. Please verify the document is not password-protected and contains readable text.',
      code: 'ANALYSIS_FAILED'
    });
  }

  // Default sanitized error
  res.status(err.status || 500).json({
    success: false,
    error: err.userMessage || 'An unexpected error occurred while processing your legal request. Please try again or contact support.',
    code: err.code || 'INTERNAL_ERROR'
  });
};
