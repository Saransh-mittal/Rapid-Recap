// utils/transactionRetryUtils.js - Enhanced transaction retry system with proper session management

const mongoose = require('mongoose')

/**
 * Transaction-specific error classifier
 */
const isTransactionRetryableError = error => {
  // MongoDB Transaction errors that should trigger full transaction retry
  if (error.errorLabels?.includes('TransientTransactionError')) return true
  if (error.errorLabels?.includes('RetryableWriteError')) return true
  if (error.code === 251) return true // NoSuchTransaction
  if (error.codeName === 'NoSuchTransaction') return true
  if (error.codeName === 'WriteConflict') return true
  if (error.message?.includes('Write conflict')) return true
  if (error.message?.includes('transaction has been aborted')) return true

  // Network and connection errors
  if (error.name === 'MongoNetworkError') return true
  if (error.name === 'MongoTimeoutError') return true
  if (error.message?.includes('network')) return true
  if (error.message?.includes('timeout')) return true

  // Connection specific
  if (error.code === 'ECONNRESET') return true
  if (error.code === 'ETIMEDOUT') return true

  return false
}

/**
 * Enhanced transaction retry configuration
 */
const TRANSACTION_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 500,
  maxDelay: 5000,
  backoffFactor: 1.5,
  jitterFactor: 0.2,
}

/**
 * Wait function with jitter
 */
const waitWithJitter = (baseDelay, jitterFactor = 0.2) => {
  const jitter = baseDelay * jitterFactor * (Math.random() * 2 - 1)
  const delay = Math.max(100, baseDelay + jitter)
  return new Promise(resolve => setTimeout(resolve, delay))
}

/**
 * Execute operation with full transaction retry
 * This creates a new transaction session for each retry attempt
 */
const withTransactionRetry = async (operation, options = {}) => {
  const config = { ...TRANSACTION_RETRY_CONFIG, ...options }
  const operationName = options.operationName || 'Transaction Operation'
  let currentDelay = config.initialDelay

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    let session = null

    try {
      // Create NEW session for each attempt
      session = await mongoose.startSession()
      session.startTransaction({
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true },
        readPreference: 'primary',
      })

      console.log(
        `${operationName}: Attempt ${attempt}/${config.maxRetries} with new session`,
      )

      // Execute operation with the new session
      const result = await operation(session)

      // Commit transaction
      await session.commitTransaction()
      console.log(
        `${operationName}: Successfully completed on attempt ${attempt}`,
      )

      return result
    } catch (error) {
      // Always abort transaction on error if session exists
      if (session?.inTransaction()) {
        try {
          await session.abortTransaction()
        } catch (abortError) {
          console.warn(
            `${operationName}: Error aborting transaction:`,
            abortError.message,
          )
        }
      }

      // Check if error is retryable
      if (!isTransactionRetryableError(error)) {
        console.error(`${operationName}: Non-retryable error:`, error.message)
        throw error
      }

      // Check if we're out of retries
      if (attempt === config.maxRetries) {
        console.error(
          `${operationName}: All attempts failed after ${attempt} tries. Last error:`,
          error.message,
        )

        // Execute failure callback if provided
        if (options.onAllRetriesFailed) {
          try {
            await options.onAllRetriesFailed(
              error,
              config.operationParams || {},
            )
          } catch (callbackError) {
            console.error(
              `${operationName}: Error in failure callback:`,
              callbackError.message,
            )
          }
        }

        throw new Error(
          `${operationName} failed after ${attempt} attempts. Last error: ${error.message}`,
        )
      }

      // Log retry attempt
      console.warn(
        `${operationName}: Retryable error on attempt ${attempt}/${config.maxRetries}. ` +
          `Error: ${error.message}. Retrying in ${currentDelay}ms...`,
      )

      // Execute retry callback if provided
      if (options.onRetry) {
        try {
          await options.onRetry(error, attempt)
        } catch (callbackError) {
          console.warn(
            `${operationName}: Error in retry callback:`,
            callbackError.message,
          )
        }
      }

      // Wait before retrying
      await waitWithJitter(currentDelay, config.jitterFactor)
      currentDelay = Math.min(
        currentDelay * config.backoffFactor,
        config.maxDelay,
      )
    } finally {
      // Always end session
      if (session) {
        try {
          await session.endSession()
        } catch (endError) {
          console.warn(
            `${operationName}: Error ending session:`,
            endError.message,
          )
        }
      }
    }
  }
}

/**
 * Optimized transaction operation with reduced scope
 * Breaks down large transactions into smaller, focused operations
 */
const withOptimizedTransaction = async (operations, options = {}) => {
  const operationName = options.operationName || 'Optimized Transaction'

  return await withTransactionRetry(
    async session => {
      const results = {}

      // Execute operations sequentially within the same transaction
      for (const [key, operation] of Object.entries(operations)) {
        try {
          console.log(`${operationName}: Executing ${key}`)
          results[key] = await operation(session)
        } catch (error) {
          console.error(`${operationName}: Error in ${key}:`, error.message)
          throw error
        }
      }

      return results
    },
    {
      ...options,
      operationName,
    },
  )
}

module.exports = {
  withTransactionRetry,
  withOptimizedTransaction,
  isTransactionRetryableError,
  TRANSACTION_RETRY_CONFIG,
}
