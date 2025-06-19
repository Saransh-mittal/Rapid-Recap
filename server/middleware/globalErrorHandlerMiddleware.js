// middleware/globalErrorHandlerMiddleware.js
// NEW FILE: Global error handling middleware for write conflicts and database errors

/**
 * Global error handler middleware that catches unhandled database errors
 * and converts them to user-friendly responses
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('Global Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?._id,
    timestamp: new Date().toISOString(),
  })

  // Handle write conflict errors
  if (
    err.codeName === 'WriteConflict' ||
    err.message.includes('Write conflict') ||
    err.message.includes('yielding is disabled')
  ) {
    console.log('Global handler caught write conflict:', err.message)
    return res.status(503).json({
      success: false,
      message: 'The system is currently busy. Please try again in a moment.',
      code: 'WRITE_CONFLICT',
      reason:
        'Multiple operations are happening simultaneously. Please try again.',
      retryAfter: 2,
    })
  }

  // Handle transient transaction errors
  if (
    err.message.includes('TransientTransactionError') ||
    err.errorLabels?.includes('TransientTransactionError')
  ) {
    console.log(
      'Global handler caught transient transaction error:',
      err.message,
    )
    return res.status(503).json({
      success: false,
      message: 'A temporary database issue occurred. Please try again.',
      code: 'TRANSACTION_ERROR',
      reason: 'Database transaction failed. Please try again in a moment.',
      retryAfter: 2,
    })
  }

  // Handle MongoDB network errors
  if (
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoTimeoutError' ||
    err.message.includes('network') ||
    err.message.includes('timeout')
  ) {
    console.log('Global handler caught network error:', err.message)
    return res.status(503).json({
      success: false,
      message: 'Connection issue. Please check your internet and try again.',
      code: 'NETWORK_ERROR',
      reason:
        'Unable to connect to the database. Please check your connection.',
      retryAfter: 5,
    })
  }

  // Handle retry exhausted errors (from our retry utility)
  if (err.isRetryExhausted) {
    console.log('Global handler caught retry exhausted error:', err.message)
    return res.status(503).json({
      success: false,
      message:
        err.message ||
        'Operation failed after multiple attempts. Please try again.',
      code: 'RETRY_EXHAUSTED',
      reason:
        'The system was unable to complete your request after multiple attempts.',
      retryAfter: 5,
    })
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    console.log('Global handler caught duplicate key error:', err.message)
    return res.status(409).json({
      success: false,
      message: 'This operation conflicts with existing data. Please try again.',
      code: 'DUPLICATE_KEY',
      reason: 'A unique constraint was violated.',
    })
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    console.log('Global handler caught validation error:', err.message)
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided.',
      code: 'VALIDATION_ERROR',
      reason: err.message,
    })
  }

  // Handle MongoDB cast errors
  if (err.name === 'CastError') {
    console.log('Global handler caught cast error:', err.message)
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format provided.',
      code: 'CAST_ERROR',
      reason: 'The provided ID is not in the correct format.',
    })
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    console.log('Global handler caught JWT error:', err.message)
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
      code: 'INVALID_TOKEN',
      reason: 'Please log in again.',
    })
  }

  if (err.name === 'TokenExpiredError') {
    console.log('Global handler caught expired token error:', err.message)
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired.',
      code: 'TOKEN_EXPIRED',
      reason: 'Please log in again.',
    })
  }

  // Handle express-async-handler errors that might have slipped through
  if (err.statusCode || err.status) {
    return res.status(err.statusCode || err.status).json({
      success: false,
      message: err.message || 'An error occurred.',
      code: 'HTTP_ERROR',
    })
  }

  // For development, include stack trace
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Default error response for unhandled errors
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again.',
    code: 'INTERNAL_ERROR',
    reason: 'An internal server error occurred.',
    ...(isDevelopment && { stack: err.stack, originalMessage: err.message }),
  })
}

/**
 * Async error wrapper that catches unhandled promise rejections
 * in async route handlers and passes them to the global error handler
 */
const asyncErrorHandler = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * 404 handler for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`)
  error.statusCode = 404
  next(error)
}

module.exports = {
  globalErrorHandler,
  asyncErrorHandler,
  notFoundHandler,
}
