const { fakeQuizAttemptCnt } = require('../../utils/quiz.utils')

const incFakeQuizAttempts = async () => {
  try {
    await fakeQuizAttemptCnt()
    console.log('fake quiz attempts incremented')
  } catch (error) {
    console.log(error)
  }
}

module.exports = incFakeQuizAttempts
