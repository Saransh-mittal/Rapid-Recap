// src/utils/retryUtils.js

/**
 * Default configuration for retry mechanism
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 32000,
  backoffFactor: 2,
  jitterFactor: 0.1,
}

/**
 * Generic delay function
 */
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Default error classifier - can be overridden for specific use cases
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
const defaultIsRetryableError = error => {
  // Network errors
  if (error.name === 'NetworkError') return true
  if (error.name === 'TimeoutError') return true
  if (error.message.includes('network')) return true
  if (error.message.includes('timeout')) return true

  // MongoDB specific errors
  if (error.name === 'MongoNetworkError') return true
  if (error.name === 'MongoTimeoutError') return true

  // Common HTTP errors that might be temporary
  if (error.status === 429) return true // Too Many Requests
  if (error.status === 503) return true // Service Unavailable
  if (error.status === 504) return true // Gateway Timeout

  // AWS specific errors
  if (error.code === 'ThrottlingException') return true
  if (error.code === 'ProvisionedThroughputExceededException') return true

  return false
}

/**
 * Universal retry mechanism with exponential backoff
 * @param {Function} operation - Async operation to retry
 * @param {Object} options - Configuration options
 * @param {Function} options.isRetryable - Custom function to determine if error is retryable
 * @param {Function} options.onRetry - Callback function executed before each retry
 * @param {string} options.operationName - Name of operation for logging
 * @returns {Promise<any>}
 */
const withRetry = async (operation, options = {}) => {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options }
  const isRetryable = options.isRetryable || defaultIsRetryableError
  const operationName = options.operationName || 'Operation'
  let currentDelay = config.initialDelay

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      // Check if we should retry
      if (!isRetryable(error)) {
        console.error(
          `${operationName}: Non-retryable error encountered:`,
          error,
        )
        throw error
      }

      // Check if we're out of retries
      if (attempt === config.maxRetries) {
        console.error(
          `${operationName}: All retry attempts failed after ${attempt} tries:`,
          error,
        )
        throw new Error(
          `${operationName} failed after ${attempt} retry attempts. Last error: ${error.message}`,
        )
      }

      // Calculate delay with jitter
      const jitter =
        currentDelay * config.jitterFactor * (Math.random() * 2 - 1)
      const delay = Math.min(currentDelay + jitter, config.maxDelay)

      // Log retry attempt
      console.warn(
        `${operationName}: Retry attempt ${attempt}/${config.maxRetries}. ` +
          `Retrying in ${delay}ms. Error: ${error.message}`,
      )

      // Execute onRetry callback if provided
      if (options.onRetry) {
        await options.onRetry(error, attempt)
      }

      // Wait before retrying
      await wait(delay)
      currentDelay = Math.min(
        currentDelay * config.backoffFactor,
        config.maxDelay,
      )
    }
  }
}

/**
 * Create a retryable version of any async function
 * @param {Function} fn - Function to make retryable
 * @param {Object} options - Retry configuration options
 * @returns {Function} - Retryable version of the function
 */
const makeRetryable = (fn, options = {}) => {
  return (...args) => withRetry(() => fn(...args), options)
}

module.exports = {
  makeRetryable,
  withRetry,
  DEFAULT_RETRY_CONFIG,
  defaultIsRetryableError,
}
