const asyncHandler = require('express-async-handler')
const Tournament = require('../model/tournamentSchema')
const {
  TournamentRegistration,
  QuizSession,
} = require('../model/tournamentRegistrationSchema')
const User = require('../model/userSchema')
const TournamentQuestion = require('../model/tournamentQuestionSchema')
const { logActivity } = require('../utils/activity.utils')
const { generateCategoryQuiz } = require('../utils/quiz.utils')
const {
  commitSession,
  abortSession,
  startSession,
  endSession,
} = require('../db/session')
const { getUserRegistrationDetails } = require('../utils/tournament.utils')
const { activityTypes } = require('../data/activityTypes')
const mongoose = require('mongoose')
const authorizedInGameNames = require('../data/authorizedInGameNames')

// @desc   Get the latest tournament
// @route  GET /api/tournament/latest
// @access Public
const getLatestTournament = asyncHandler(async (req, res) => {
  const currentDate = new Date()
  const userId = req.query.userId

  const tournament = await Tournament.findOne({
    $or: [
      { status: 'registration', registrationEndDate: { $gte: currentDate } },
      { status: 'upcoming', startDate: { $gte: currentDate } },
      { status: 'ongoing', endDate: { $gte: currentDate } },
    ],
  }).sort({ startDate: -1 })

  if (!tournament) {
    res.json(null)
    return
  }

  // Update tournament status if needed
  if (
    tournament.status === 'registration' &&
    currentDate > tournament.registrationEndDate
  ) {
    tournament.status = 'upcoming'
  } else if (
    tournament.status === 'upcoming' &&
    currentDate >= tournament.startDate
  ) {
    tournament.status = 'ongoing'
  } else if (
    tournament.status === 'ongoing' &&
    currentDate > tournament.endDate
  ) {
    tournament.status = 'completed'
  }

  await tournament.save()
  let userRegistration = null
  if (
    userId &&
    userId !== 'undefined' &&
    userId !== 'null' &&
    userId !== '' &&
    userId !== undefined
  ) {
    userRegistration = await TournamentRegistration.findOne({
      user: userId,
      tournament: tournament._id,
    })
  }

  let result = {
    ...tournament.toObject(),
    registeredCount: await TournamentRegistration.countDocuments({
      tournament: tournament._id,
    }),
    isRegistered: !!userRegistration,
    selectedCategories: userRegistration
      ? userRegistration.selectedCategories
      : [],
    completedCategories: userRegistration
      ? userRegistration.completedCategories
      : [],
    totalScore: userRegistration ? userRegistration.totalScore : 0,
  }

  res.json(result)
})

// @desc   Authorize users for the tournament
// @route  GET /api/tournament/authorize
// @access Private
const authorizeUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const user = await User.findById(userId)
  if (!user) {
    return res.status(404).json({ message: 'User not found' })
  }

  const isAuthorized = authorizedInGameNames.includes(user.inGameName)
  res.json({ isAuthorized })
})

// @desc   Get the current tournament leaderboard
// @route  GET /api/tournament/leaderboard
// @access Public
const getCurrentTournamentLeaderboard = asyncHandler(async (req, res) => {
  const { tournamentId, page = 1, limit = 50, userId } = req.query
  const skip = (page - 1) * limit

  const tournament = await Tournament.findById(tournamentId)
  if (!tournament) {
    res.status(404)
    throw new Error('Tournament not found')
  }

  const leaderboardData = await TournamentRegistration.aggregate([
    { $match: { tournament: tournament._id } },
    {
      $lookup: {
        from: 'Users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        inGameName: '$userDetails.inGameName',
        name: '$userDetails.name',
        email: '$userDetails.email',
        totalScore: 1,
        level: '$userDetails.level',
        xp: '$userDetails.xp',
        userId: '$userDetails._id',
      },
    },
    { $sort: { totalScore: -1, xp: -1 } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        entries: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        totalCount: 1,
        entries: { $slice: ['$entries', skip, parseInt(limit)] },
        allEntries: '$entries', // Keep all entries for finding user rank
      },
    },
  ])

  const result = leaderboardData[0] || {
    totalCount: 0,
    entries: [],
    allEntries: [],
  }

  let userStanding = null
  if (userId) {
    const userIndex = result.allEntries.findIndex(
      entry => entry.userId.toString() === userId,
    )
    if (userIndex !== -1) {
      const userEntry = result.allEntries[userIndex]
      userStanding = {
        rank: userIndex + 1,
        inGameName: userEntry.inGameName,
        name: userEntry.name,
        score: userEntry.totalScore,
        level: userEntry.level,
        userId: userEntry.userId,
      }
    }
  }

  const leaderboard = result.entries.map((entry, index) => ({
    rank: skip + index + 1,
    inGameName: entry.inGameName,
    name: entry.name,
    email: entry.email,
    score: entry.totalScore,
    level: entry.level,
    userId: entry.userId,
  }))

  res.json({
    leaderboard,
    currentPage: parseInt(page),
    totalPages: Math.ceil(result.totalCount / limit),
    hasMore: skip + leaderboard.length < result.totalCount,
    userStanding,
  })
})

// @desc   Search tournament leaderboard
// @route  GET /api/tournament/leaderboard/search
// @access Public
const searchTournamentLeaderboard = asyncHandler(async (req, res) => {
  const { tournamentId, searchQuery } = req.query

  const tournament = await Tournament.findById(tournamentId)
  if (!tournament) {
    res.status(404)
    throw new Error('Tournament not found')
  }

  const regex = new RegExp(searchQuery.trim(), 'i')

  // First, get all participants sorted by score
  const allParticipants = await TournamentRegistration.aggregate([
    { $match: { tournament: tournament._id } },
    {
      $lookup: {
        from: 'Users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        inGameName: '$userDetails.inGameName',
        name: '$userDetails.name',
        email: '$userDetails.email',
        totalScore: 1,
        level: '$userDetails.level',
        xp: '$userDetails.xp',
      },
    },
    { $sort: { totalScore: -1, xp: -1 } },
  ])

  // Now, filter and rank the participants
  const leaderboard = allParticipants
    .map((participant, index) => ({
      ...participant,
      rank: index + 1,
    }))
    .filter(
      participant =>
        regex.test(participant.inGameName) ||
        regex.test(participant.name) ||
        regex.test(participant.email),
    )
    .map(({ _id, ...rest }) => rest) // Remove the _id field

  res.json({
    leaderboard,
    totalParticipants: allParticipants.length,
  })
})

// @desc   Get the top 5 leaders from the previous tournament
// @route  GET /api/tournament/previous-leaderboard
// @access Public
const getPreviousTournament = asyncHandler(async (req, res) => {
  // Find the most recent completed tournament
  const previousTournament = await Tournament.findOne(
    { status: 'completed' },
    {},
    { sort: { endDate: -1 } },
  )

  if (!previousTournament) {
    return res.json(null)
  }

  const topLeaders = await TournamentRegistration.aggregate([
    { $match: { tournament: previousTournament._id } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        inGameName: '$userDetails.inGameName',
        name: '$userDetails.name',
        totalScore: 1,
        level: '$userDetails.level',
        userId: '$userDetails._id',
      },
    },
    { $sort: { totalScore: -1, level: -1 } },
    { $limit: 5 },
  ])

  const formattedLeaders = topLeaders.map((leader, index) => ({
    rank: index + 1,
    inGameName: leader.inGameName,
    name: leader.name,
    score: leader.totalScore,
    level: leader.level,
    userId: leader.userId,
  }))

  res.json({
    tournamentId: previousTournament._id,
    tournamentNumber: previousTournament.tournamentNumber,
    endDate: previousTournament.endDate,
    topLeaders: formattedLeaders,
  })
})

// @desc   Register for a tournament
// @route  POST /api/tournament/register
// @access Private
const registerForTournament = asyncHandler(async (req, res) => {
  const { userId, tournamentId, selectedCategories } = req.body

  // Check if user is eligible to register
  const session = await startSession()
  try {
    const user = await User.findById(userId).session(session)
    if (!user) {
      return res.status(404).json({
        message: 'User must be logged in to register for the tournament',
      })
    }
    if (user.role === 'guest') {
      return res.status(403).json({
        message: 'Guest users are not allowed to register for the tournament',
      })
    }
    // if (user.streak < 2) {
    //   return res.status(403).json({
    //     message:
    //       'User must have a minimum streak of 2 to register for the tournament',
    //   })
    // }

    // Check if user is already registered
    const { isRegistered } = await getUserRegistrationDetails(
      userId,
      tournamentId,
      session,
    )
    if (isRegistered) {
      res.status(400)
      throw new Error('User is already registered for this tournament')
    }
    // Check if tournament registration is open
    const tournament = await Tournament.findById(tournamentId).session(session)
    if (!tournament || tournament.status !== 'registration') {
      res.status(400)
      throw new Error('Tournament registration is not open')
    }

    // Validate selected categories

    if (
      selectedCategories.length < 5 ||
      selectedCategories.includes('current affairs')
    ) {
      res.status(400)
      throw new Error('Invalid category selection')
    }

    // Create tournament registration
    const registration = await TournamentRegistration.create({
      user: userId,
      tournament: tournamentId,
      selectedCategories: [...selectedCategories, 'current affairs'],
    })

    // Add user to tournament participants
    tournament.participants.push(userId)
    await tournament.save({ session })
    const currentDate = new Date().toISOString().split('T')[0]
    logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.TOURNAMENT_REGISTRATION.type,
      date: currentDate,
    })
    await commitSession(session)
    res.status(201).json(registration)
  } catch (error) {
    res.status(400)
    await abortSession(session)
    throw new Error(error.message)
  }
})

// @desc   Get current affairs questions for the current tournament
// @route  GET /api/tournament/questions/current-affairs/current
// @access Private (Admin only)
const getCurrentTournamentCurrentAffairsQuestions = asyncHandler(
  async (req, res) => {
    // Find the current active tournament
    const currentTournament = await Tournament.findOne({ isActive: true })

    if (!currentTournament) {
      res.status(404)
      throw new Error('No active tournament found')
    }

    // Get the start and end dates of the current tournament
    const { registrationStartDate, registrationEndDate } = currentTournament

    // Find current affairs questions created between the start and end dates of the tournament
    const questions = await TournamentQuestion.find({
      category: 'current affairs',
      createdAt: { $gte: registrationStartDate, $lte: registrationEndDate },
    })

    res.json(questions)
  },
)

// @desc   Add a new current affairs question
// @route  POST /api/tournament/questions/current-affairs
// @access Private (Admin only)
const addCurrentAffairsQuestion = asyncHandler(async (req, res) => {
  const {
    question,
    hindiQuestion,
    options,
    hindiOptions,
    correctAnswer,
    difficulty,
  } = req.body

  // Validate input
  if (
    !question ||
    !hindiQuestion ||
    !options ||
    !hindiOptions ||
    !correctAnswer ||
    !difficulty
  ) {
    res.status(400)
    throw new Error('Please provide all required fields')
  }

  // Create new question
  const newQuestion = await TournamentQuestion.create({
    question,
    hindiQuestion,
    options,
    hindiOptions,
    correctAnswer,
    category: 'current affairs',
    difficulty,
    isManuallyAdded: true,
  })

  if (newQuestion) {
    res.status(201).json(newQuestion)
  } else {
    res.status(400)
    throw new Error('Invalid question data')
  }
})

// @desc   Update a current affairs question
// @route  PUT /api/tournament/questions/current-affairs/:id
// @access Private (Admin only)
const updateCurrentAffairsQuestion = asyncHandler(async (req, res) => {
  const question = await TournamentQuestion.findById(req.params.id)

  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  if (question.category !== 'current affairs') {
    res.status(400)
    throw new Error('This is not a current affairs question')
  }

  const updatedQuestion = await TournamentQuestion.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  )

  res.json(updatedQuestion)
})

// @desc   Delete a current affairs question
// @route  DELETE /api/tournament/questions/current-affairs/:id
// @access Private (Admin only)
const deleteCurrentAffairsQuestion = asyncHandler(async (req, res) => {
  const question = await TournamentQuestion.findById(req.params.id)

  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  if (question.category !== 'current affairs') {
    res.status(400)
    throw new Error('This is not a current affairs question')
  }

  await question.deleteOne()

  res.json({ message: 'Question removed' })
})

// @desc   Start quiz for user
// @route  POST /api/tournament/quiz/start
// @access Private
const startQuiz = asyncHandler(async (req, res) => {
  const { userId, tournamentId, category, lang } = req.body
  // Check if a session already exists
  const existingSession = await QuizSession.findOne({
    user: userId,
    tournament: tournamentId,
    category: category,
    completed: false,
  })

  if (existingSession) {
    // If an incomplete session exists, return an error
    return res.status(400).json({
      message: 'A quiz session for this category is already in progress',
      existingSession: {
        _id: existingSession._id,
        startTime: existingSession.startTime,
        endTime: existingSession.endTime,
      },
    })
  }
  // Generate quiz questions
  const questions = await generateCategoryQuiz(userId, tournamentId, category)

  // Create a new quiz session
  const quizSession = await QuizSession.create({
    user: userId,
    tournament: tournamentId,
    category,
    questions: questions.map(q => q._id),
    startTime: new Date(),
    endTime: new Date(Date.now() + 60000), // 50 seconds from now
  })

  // Remove sensitive information (like correct answer) before sending to client
  const clientQuestions = questions.map(q => ({
    _id: q._id,
    question: lang === 'hi' ? q.hindiQuestion : q.question,
    options: lang === 'hi' ? q.hindiOptions : q.options,
  }))

  res.json({
    message: 'Quiz started',
    quizSession: {
      _id: quizSession._id,
      category: quizSession.category,
      startTime: quizSession.startTime,
      endTime: quizSession.endTime,
      questions: clientQuestions,
    },
  })
})

// @desc   Submit quiz answers
// @route  POST /api/tournament/quiz/submit
// @access Private
const submitQuiz = asyncHandler(async (req, res) => {
  const { quizSessionId, userResponses, timeTaken, questionsIds } = req.body

  const maxRetries = 3
  let retryCount = 0
  let success = false

  while (retryCount < maxRetries && !success) {
    const session = await startSession()

    try {
      const quizSession = await QuizSession.findById(quizSessionId).session(
        session,
      )
      if (!quizSession) {
        throw new Error('Quiz session not found')
      }

      if (quizSession.completed) {
        throw new Error('Quiz already submitted')
      }

      if (new Date() > quizSession.endTime) {
        throw new Error('Quiz time expired')
      }

      const user = await User.findById(quizSession.user).session(session)
      const questions = await TournamentQuestion.find({
        _id: { $in: quizSession.questions },
      }).session(session)

      // Calculate score and RQM
      let score = 0
      let correctCount = 0

      const updatedResponses = userResponses.map((response, index) => {
        const isCorrect =
          questions.find(q => q._id.toString() === questionsIds[index])
            .correctAnswer === response
        if (isCorrect) correctCount++
        return {
          questionId: questionsIds[index],
          userAnswer: response,
          isCorrect,
        }
      })
      score = correctCount

      const quizDifficulty =
        questions.reduce(
          (acc, question) => acc + parseFloat(question.difficulty),
          0,
        ) / questions.length
      const apparentTimeTaken =
        timeTaken <= 10
          ? Math.ceil((timeTaken * timeTaken) / 2 - 10 * timeTaken + 60)
          : timeTaken
      const apparentScore =
        ((score / questions.length) * Math.log(score / questions.length + 1)) /
        Math.log(1.3)
      let RQM_score = Math.ceil(
        ((apparentScore * quizDifficulty) / apparentTimeTaken) * 1000,
      )

      // Update quiz session
      quizSession.responses = updatedResponses
      quizSession.score = score
      quizSession.RQM_score = RQM_score
      quizSession.timeTaken = timeTaken
      quizSession.completed = true
      await quizSession.save({ session })

      // Update tournament registration
      const registration = await TournamentRegistration.findOne({
        user: quizSession.user,
        tournament: quizSession.tournament,
      }).session(session)
      registration.completedCategories.push(quizSession.category)
      registration.totalScore += RQM_score
      await registration.save({ session })

      await user.save({ session })

      // Get top 3 leaders for the category
      const topLeaders = await QuizSession.aggregate([
        {
          $match: {
            tournament: quizSession.tournament,
            category: quizSession.category,
            completed: true,
          },
        },
        {
          $lookup: {
            from: 'Users', // Assuming your User collection is named 'users'
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        { $unwind: '$userDetails' },
        {
          $project: {
            inGameName: {
              $ifNull: ['$userDetails.inGameName', 'Unknown Player'],
            },
            score: '$RQM_score',
          },
        },
        { $sort: { score: -1 } },
        { $limit: 3 },
        {
          $group: {
            _id: null,
            leaders: { $push: '$$ROOT' },
            scores: { $push: '$score' },
          },
        },
        {
          $project: {
            leaders: {
              $map: {
                input: '$leaders',
                as: 'leader',
                in: {
                  inGameName: '$$leader.inGameName',
                  score: '$$leader.score',
                  rank: {
                    $add: [{ $indexOfArray: ['$scores', '$$leader.score'] }, 1],
                  },
                },
              },
            },
          },
        },
        { $unwind: '$leaders' },
        { $replaceRoot: { newRoot: '$leaders' } },
        { $sort: { rank: 1 } },
      ]).session(session)
      success = true
      await commitSession()

      logActivity({
        userInGameName: user.inGameName,
        type: activityTypes.TOURNAMENT_QUIZ.type,
      })

      const quizDifficultyLevel =
        quizDifficulty < 0.5
          ? 'easy'
          : quizDifficulty >= 0.5 && quizDifficulty < 0.7
          ? 'medium'
          : 'hard'
      res.json({
        message: 'Quiz submitted successfully',
        score: `${score}/${questions.length}`,
        RQM_score,
        quizDifficulty: quizDifficultyLevel,
        timeTaken,
        totalTournamentScore: registration.totalScore,
        topLeaders: topLeaders,
      })
    } catch (error) {
      await abortSession(session)

      if (
        error.name === 'MongoError' &&
        (error.code === 112 || error.code === 251)
      ) {
        // These error codes typically indicate transient errors
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Retrying transaction (attempt ${retryCount + 1})...`)
          await new Promise(resolve =>
            setTimeout(resolve, 2 ** retryCount * 100),
          ) // Exponential backoff
        }
      } else {
        console.error('Non-transient error:', error)
        res
          .status(400)
          .json({ error: error.message || 'Error submitting quiz' })
        break
      }
    } finally {
      await endSession()
    }
  }

  if (!success && retryCount === maxRetries) {
    res
      .status(500)
      .json({ error: 'Max retries reached. Unable to submit quiz.' })
  }
})

const getQuizSummary = asyncHandler(async (req, res) => {
  const { category, tournamentId, lang } = req.query
  const userId = req.user._id

  const quizSession = await QuizSession.findOne({
    user: userId,
    tournament: tournamentId,
    category: category,
    completed: true,
  })
    .populate('questions')
    .populate('user', 'inGameName')
    .sort({ createdAt: -1 }) // Get the most recent completed session
    .lean()

  if (!quizSession) {
    res.status(404)
    throw new Error('Quiz session not found')
  }

  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournamentId,
  }).lean()

  if (!registration) {
    res.status(404)
    throw new Error('Tournament registration not found')
  }

  const questions = quizSession.questions
  const totalQuestions = questions.length
  const score = quizSession.responses.filter(r => r.isCorrect).length
  const quizDifficulty =
    questions.reduce((acc, q) => acc + parseFloat(q.difficulty), 0) /
    totalQuestions
  const quizDifficultyLevel =
    quizDifficulty < 0.5 ? 'easy' : quizDifficulty < 0.7 ? 'medium' : 'hard'

  const topLeaders = await QuizSession.aggregate([
    {
      $match: {
        tournament: new mongoose.Types.ObjectId(tournamentId),
        category: category,
        completed: true,
      },
    },
    {
      $lookup: {
        from: 'Users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        inGameName: { $ifNull: ['$userDetails.inGameName', 'Unknown Player'] },
        score: '$RQM_score',
      },
    },
    { $sort: { score: -1 } },
    { $limit: 3 },
    {
      $group: {
        _id: null,
        leaders: { $push: '$$ROOT' },
        scores: { $push: '$score' },
      },
    },
    {
      $project: {
        leaders: {
          $map: {
            input: '$leaders',
            as: 'leader',
            in: {
              inGameName: '$$leader.inGameName',
              score: '$$leader.score',
              rank: {
                $add: [{ $indexOfArray: ['$scores', '$$leader.score'] }, 1],
              },
            },
          },
        },
      },
    },
    { $unwind: '$leaders' },
    { $replaceRoot: { newRoot: '$leaders' } },
    { $sort: { rank: 1 } },
  ])

  const summary = {
    score: `${score}/${totalQuestions}`,
    RQM_score: quizSession.RQM_score,
    quizDifficulty: quizDifficultyLevel,
    timeTaken: quizSession.timeTaken,
    totalTournamentScore: registration.totalScore,
    topLeaders: topLeaders,
    result: quizSession.responses.map((response, index) => ({
      question:
        lang === 'hi'
          ? questions[index].hindiQuestion
          : questions[index].question,
      options:
        lang === 'hi'
          ? questions[index].hindiOptions
          : questions[index].options,
      answer: questions[index].correctAnswer,
      userAnswer: response.userAnswer,
      isCorrect: response.isCorrect,
      explanation: questions[index].explanation || 'No explanation provided',
    })),
  }

  res.json(summary)
})

// @desc   Get user stats for a tournament
// @route  GET /api/tournament/user-stats/:tournamentId/:userId
// @access Public
const getUserStats = asyncHandler(async (req, res) => {
  const { userId, tournamentId } = req.params

  // Fetch tournament registration
  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournamentId,
  })

  if (!registration) {
    return res
      .status(404)
      .json({ message: 'User not registered for this tournament' })
  }

  // Fetch quiz sessions for the user in this tournament
  const quizSessions = await QuizSession.find({
    user: userId,
    tournament: tournamentId,
  })

  // Calculate stats
  const categoryStats = await Promise.all(
    quizSessions.map(async session => {
      const [{ rank }] = await QuizSession.aggregate([
        {
          $match: {
            tournament: new mongoose.Types.ObjectId(tournamentId),
            category: session.category,
          },
        },
        {
          $group: {
            _id: '$user',
            bestScore: { $max: '$RQM_score' },
          },
        },
        { $sort: { bestScore: -1 } },
        {
          $group: {
            _id: null,
            userScores: { $push: '$bestScore' },
          },
        },
        {
          $project: {
            rank: {
              $add: [
                {
                  $indexOfArray: ['$userScores', session.RQM_score],
                },
                1,
              ],
            },
          },
        },
      ])

      return {
        category: session.category,
        score: session.score,
        RQM_score: session.RQM_score,
        timeTaken: session.timeTaken,
        ranking: rank,
      }
    }),
  )

  const userStats = {
    totalScore: registration.totalScore,
    completedCategories: registration.completedCategories,
    categoryStats,
  }

  res.json(userStats)
})

module.exports = {
  registerForTournament,
  addCurrentAffairsQuestion,
  updateCurrentAffairsQuestion,
  deleteCurrentAffairsQuestion,
  startQuiz,
  submitQuiz,
  getLatestTournament,
  getPreviousTournament,
  getCurrentTournamentLeaderboard,
  searchTournamentLeaderboard,
  getCurrentTournamentCurrentAffairsQuestions,
  getQuizSummary,
  getUserStats,
  authorizeUsers,
}
