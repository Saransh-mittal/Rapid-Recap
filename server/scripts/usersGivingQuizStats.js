// /scripts/usersGivingQuizStats.js
const mongoose = require('mongoose')
const User = require('../model/userSchema')
const QuizAttempt = require('../model/quizAttemptSchema')

// Function to get the quiz attempts by users for a given date range
async function getQuizAttemptsByUsers(startDate, endDate) {
  const matchCriteria = {}
  if (startDate) matchCriteria.createdAt = { $gte: startDate }
  if (endDate)
    matchCriteria.createdAt = { ...matchCriteria.createdAt, $lt: endDate }

  // Perform the aggregation to get quiz attempts within the date range
  const quizAttemptsByUsers = await QuizAttempt.aggregate([
    {
      $match: {
        ...matchCriteria,
        user: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$user',
        quizAttempts: { $sum: 1 }, // Count the number of quiz attempts
      },
    },
  ])

  // Manually populate the results
  let populatedQuizAttemptsByUsers = await User.populate(quizAttemptsByUsers, {
    path: '_id',
    select: 'name email inGameName',
  })

  // Exclude users with dummy emails
  populatedQuizAttemptsByUsers = populatedQuizAttemptsByUsers.filter(
    user => !/^dummy\d+@mail.com$/.test(user._id.email),
  )

  return populatedQuizAttemptsByUsers
}

// Main function to view users' quiz attempts for different date ranges or all time
async function usersGivingQuizStats({ startDate = null, endDate = null }) {
  if (!startDate && !endDate) {
    // No start date or end date specified, so get data for all time
    startDate = new Date(0) // Epoch time
    endDate = new Date()
  }

  // Get the quiz attempts by users for the specified date range
  const populatedQuizAttemptsByUsers = await getQuizAttemptsByUsers(
    startDate,
    endDate,
  )

  return populatedQuizAttemptsByUsers
}

// Example usage:
// View users' quiz attempts for a specific date range

module.exports = { usersGivingQuizStats }

// // View users' quiz attempts from a specific start date to now
// const specificStartDate = new Date("2024-06-10T00:00:00Z"); // ISO 8601 format
// usersGivingQuizStats(specificStartDate).catch((err) => console.error(err));

// // View users' quiz attempts until a specific end date
// const specificEndDate = new Date("2024-06-14T23:59:59Z"); // ISO 8601 format
// usersGivingQuizStats(null, specificEndDate).catch((err) => console.error(err));

// // View users' quiz attempts for all time
// usersGivingQuizStats().catch((err) => console.error(err));
