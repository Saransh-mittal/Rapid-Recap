const mongoose = require('mongoose')

async function createIndexesIfNotExist() {
  const userIndexes = [{ IQ_score: -1, inGameName: 1 }, { quizAttempts: 1 }]

  const quizAttemptIndexes = [{ user: 1 }, { createdAt: 1 }, { season: 1 }]

  try {
    const userModel = mongoose.model('USER')
    const quizAttemptModel = mongoose.model('QUIZ_ATTEMPT')

    for (const index of userIndexes) {
      console.log(`Ensuring index on User collection: ${JSON.stringify(index)}`)
      await userModel.collection.createIndex(index)
    }

    for (const index of quizAttemptIndexes) {
      console.log(
        `Ensuring index on QuizAttempt collection: ${JSON.stringify(index)}`,
      )
      await quizAttemptModel.collection.createIndex(index)
    }

    console.log(
      'All necessary indexes have been checked and created if needed.',
    )
  } catch (error) {
    console.error('Error creating indexes:', error)
    throw error
  }
}

module.exports = createIndexesIfNotExist
