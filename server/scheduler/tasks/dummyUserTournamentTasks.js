const mongoose = require('mongoose')
const Tournament = require('../../model/tournamentSchema')
const User = require('../../model/userSchema')
const {
  TournamentRegistration,
  QuizSession,
} = require('../../model/tournamentRegistrationSchema')
const { getCategories } = require('../../data/categories')
const TournamentQuestion = require('../../model/tournamentQuestionSchema')

const registerDummyUsers = async () => {
  const session = await mongoose.startSession()
  session.startTransaction()
  console.log('Registering dummy users for the tournament...')
  try {
    // Find the current active tournament
    const activeTournament = await Tournament.findOne({
      status: 'registration',
      isActive: true,
    }).session(session)
    if (!activeTournament) {
      console.log('No active tournament found for registration')
      await session.abortTransaction()
      return
    }

    // Get all dummy users
    const dummyUsers = await User.find({
      email: /^dummy\d+@mail\.com$/,
    }).session(session)

    // Randomly select 14 users (70 users over 5 days)
    const selectedUsers = dummyUsers
      .sort(() => 0.5 - Math.random())
      .slice(0, 14)

    for (const user of selectedUsers) {
      // Check if user is already registered
      const existingRegistration = await TournamentRegistration.findOne({
        user: user._id,
        tournament: activeTournament._id,
      }).session(session)

      if (existingRegistration) {
        console.log(
          `User ${user.email} is already registered for this tournament`,
        )
        continue
      }

      // Randomly select 5 categories
      const allCategories = getCategories()
      const selectedCategories = allCategories
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .concat(['current affairs'])

      // Create tournament registration
      await TournamentRegistration.create(
        [
          {
            user: user._id,
            tournament: activeTournament._id,
            selectedCategories: selectedCategories,
          },
        ],
        { session },
      )

      // Add user to tournament participants
      activeTournament.participants.push(user._id)
    }

    await activeTournament.save({ session })
    await session.commitTransaction()
    console.log(
      `Registered ${selectedUsers.length} dummy users for the tournament`,
    )
  } catch (error) {
    await session.abortTransaction()
    console.error('Error registering dummy users:', error)
  } finally {
    session.endSession()
  }
}

const simulateBotQuizParticipation = async () => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // Find the current active tournament
    const activeTournament = await Tournament.findOne({
      status: 'ongoing',
      isActive: true,
    }).session(session)
    if (!activeTournament) {
      console.log('No active tournament found')
      await session.abortTransaction()
      return
    }

    // Get all registered dummy users
    const registeredDummyUsers = await TournamentRegistration.find({
      tournament: activeTournament._id,
      user: {
        $in: await User.find({ email: /^dummy\d+@mail\.com$/ }).distinct('_id'),
      },
    })
      .populate('user')
      .session(session)

    // Randomly select 9 bots
    const selectedBots = registeredDummyUsers
      .sort(() => 0.5 - Math.random())
      .slice(0, 9)

    for (const bot of selectedBots) {
      // Get an incomplete category for the bot
      const incompleteCategory = bot.selectedCategories.find(
        cat => !bot.completedCategories.includes(cat),
      )
      if (!incompleteCategory) continue

      // Get questions for the category
      const questions = await TournamentQuestion.aggregate([
        { $match: { category: incompleteCategory } },
        { $sample: { size: 5 } },
      ]).session(session)

      // Create a quiz session
      const quizSession = new QuizSession({
        user: bot.user._id,
        tournament: activeTournament._id,
        category: incompleteCategory,
        questions: questions.map(q => q._id),
        startTime: new Date(),
        endTime: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
      })

      // Simulate bot responses
      const correctAnswers = Math.floor(Math.random() * 5) // 0 to 4 correct answers
      const timeTaken = Math.floor(Math.random() * 20) + 30 // 30 to 49 seconds
      let score = 0
      const responses = questions.map((question, index) => {
        const isCorrect = index < correctAnswers
        if (isCorrect) score++
        return {
          questionId: question._id,
          userAnswer: isCorrect
            ? question.correctAnswer
            : ['a', 'b', 'c', 'd'].find(opt => opt !== question.correctAnswer),
          isCorrect,
        }
      })

      // Calculate RQM score
      const quizDifficulty =
        questions.reduce((acc, q) => acc + parseFloat(q.difficulty), 0) /
        questions.length
      const apparentScore =
        ((score / questions.length) * Math.log(score / questions.length + 1)) /
        Math.log(1.3)
      const RQM_score = Math.ceil(
        ((apparentScore * quizDifficulty) / timeTaken) * 1000,
      )

      // Update quiz session
      quizSession.responses = responses
      quizSession.score = score
      quizSession.RQM_score = RQM_score
      quizSession.timeTaken = timeTaken
      quizSession.completed = true
      await quizSession.save({ session })

      // Update tournament registration
      bot.completedCategories.push(incompleteCategory)
      bot.totalScore += RQM_score
      await bot.save({ session })
    }

    await session.commitTransaction()
    console.log(`Simulated quiz participation for ${selectedBots.length} bots`)
  } catch (error) {
    await session.abortTransaction()
    console.error('Error simulating bot quiz participation:', error)
  } finally {
    session.endSession()
  }
}

module.exports = { registerDummyUsers, simulateBotQuizParticipation }
