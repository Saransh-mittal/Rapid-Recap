// middleware/globalErrorHandlerMiddleware.js
// MODIFY: Updated version that works better with SSR

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
 * MODIFIED: 404 handler that only handles API routes
 * Non-API routes should be handled by SSR
 */
const notFoundHandler = (req, res, next) => {
  // Only handle 404s for API routes
  if (req.path.startsWith('/api/')) {
    const error = new Error(`API route ${req.originalUrl} not found`)
    error.statusCode = 404
    return next(error)
  }

  // For non-API routes, this should not be reached if SSR is working properly
  // But if it is reached, it means SSR failed to handle the route
  console.warn(`SSR failed to handle route: ${req.originalUrl}`)

  // Try to serve a fallback or let the error handler deal with it
  const error = new Error(`Route ${req.originalUrl} could not be rendered`)
  error.statusCode = 500
  error.isSSRFailure = true
  next(error)
}

/**
 * NEW: Special handler for SSR failures
 */
const handleSSRFailure = (err, req, res, next) => {
  if (err.isSSRFailure) {
    console.error('SSR Failure:', err.message)

    // Try to serve a basic fallback HTML for non-API routes
    if (!req.path.startsWith('/api/')) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapid Recap - Loading...</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div id="root">
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
              <div style="text-align: center;">
                <h2>Loading Rapid Recap...</h2>
                <p>If this page doesn't load, please refresh or try again later.</p>
                <script>
                  // Try to reload the page after a short delay
                  setTimeout(() => window.location.reload(), 3000);
                </script>
              </div>
            </div>
          </div>
        </body>
        </html>
      `)
    }
  }

  // Pass to global error handler
  next(err)
}

module.exports = {
  globalErrorHandler,
  asyncErrorHandler,
  notFoundHandler,
  handleSSRFailure,
}
