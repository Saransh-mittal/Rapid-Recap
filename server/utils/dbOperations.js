// src/utils/dbOperations.js
const { makeRetryable } = require('./retryUtils')
const User = require('../model/userSchema')
const { logActivity } = require('./activity.utils')

/**
 * Retryable user update operation
 */
const updateUserWithRetry = makeRetryable(
  async (userId, updateData) => {
    const result = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: '-password -cpassword -googleId' },
    )
    if (!result) throw new Error('User not found during update')
    return result
  },
  {
    operationName: 'UpdateUser',
    maxRetries: 3,
    initialDelay: 500,
    onRetry: (error, attempt) => {
      console.warn(
        `Retry attempt ${attempt} for user update. Error: ${error.message}`,
      )
    },
  },
)

/**
 * Retryable activity logging operation
 */
const logActivityWithRetry = makeRetryable(
  async activityData => {
    await logActivity(activityData)
  },
  {
    operationName: 'LogActivity',
    maxRetries: 2,
    initialDelay: 200,
    onRetry: (error, attempt) => {
      console.warn(
        `Retry attempt ${attempt} for activity logging. Error: ${error.message}`,
      )
    },
  },
)

module.exports = {
  updateUserWithRetry,
  logActivityWithRetry,
}
