// server/utils/errors/BackendSyncError.js
// Custom error class for backend sync failures that allow free session retry

class BackendSyncError extends Error {
  constructor(code, options = {}) {
    super(options.message || 'Backend sync error occurred')

    this.name = 'BackendSyncError'
    this.code = code // e.g., 'SESSION_BACKEND_ERROR', 'WRITE_CONFLICT', 'QUEUE_FAILED'
    this.canRetry = options.canRetry !== false // Default true
    this.statusCode = options.statusCode || 500
    this.details = options.details || null

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert to API response format
   */
  toResponse() {
    return {
      success: false,
      error: this.code,
      message: this.message,
      canRetry: this.canRetry,
      details: this.details
    }
  }
}

module.exports = BackendSyncError
