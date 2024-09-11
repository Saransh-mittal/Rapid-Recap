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
const { commitSession, abortSession, startSession } = require('../db/session')
const { getUserRegistrationDetails } = require('../utils/tournament.utils')
const { activityTypes } = require('../data/activityTypes')

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
    // status: 'ongoing',
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

// @desc   Get the current tournament leaderboard
// @route  GET /api/tournament/leaderboard
// @access Public
const getCurrentTournamentLeaderboard = asyncHandler(async (req, res) => {
  const { tournamentId, page = 1, limit = 50 } = req.query
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
      },
    },
  ])

  const result = leaderboardData[0] || { totalCount: 0, entries: [] }

  const leaderboard = result.entries.map((entry, index) => ({
    rank: skip + index + 1,
    inGameName: entry.inGameName,
    name: entry.name,
    email: entry.email,
    score: entry.totalScore,
    level: entry.level,
  }))

  res.json({
    leaderboard,
    currentPage: parseInt(page),
    totalPages: Math.ceil(result.totalCount / limit),
    hasMore: skip + leaderboard.length < result.totalCount,
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

// @desc   Get the previous completed tournament
// @route  GET /api/tournament/previous
// @access Public
const getPreviousTournament = asyncHandler(async (req, res) => {
  const currentDate = new Date()

  const previousTournament = await Tournament.findOne({
    status: 'completed',
    endDate: { $lt: currentDate },
  }).sort({ endDate: -1 })

  if (!previousTournament) {
    res.json(null)
    return
  }
  const result = {
    ...previousTournament._doc,
    tournamentNumber: previousTournament.tournamentNumber,
  }
  res.json(result)
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
    if (!user || user.role === 'guest') {
      res.status(403)
      throw new Error('User is not eligible to register for the tournament')
    }
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
  const { userId, tournamentId, category } = req.body

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
    question: q.question,
    hindiQuestion: q.hindiQuestion,
    options: q.options,
    hindiOptions: q.hindiOptions,
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
  const { quizSessionId, userResponses, timeTaken } = req.body
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
    const updatedResponses = questions.map((question, index) => {
      const isCorrect = question.correctAnswer === userResponses[index]
      if (isCorrect) score++
      return {
        questionId: question._id,
        userAnswer: userResponses[index],
        isCorrect,
      }
    })

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

    await commitSession()

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
    res.status(400)
    throw new Error(error.message)
  }
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
}
