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
const {
  getUserRegistrationDetails,
  getTopLeadersForCategory,
} = require('../utils/tournament.utils')
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
    tournamentType: 'normal', // Only consider normal tournaments
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

    categoryScores: userRegistration ? userRegistration.categoryScores : {},
    categoryAttempts: userRegistration ? userRegistration.categoryAttempts : {},
    totalScore: userRegistration ? userRegistration.totalScore : 0,
  }

  res.json(result)
})

// @desc  Get the latest test tournament
// @route GET /api/tournament/test/latest
// @access Private (Admin only)
const getLatestTestTournament = asyncHandler(async (req, res) => {
  const currentDate = new Date()
  const userId = req.query.userId

  const tournament = await Tournament.findOne({
    tournamentType: 'test',
    // $or: [
    //   { status: 'registration', registrationEndDate: { $gte: currentDate } },
    //   { status: 'upcoming', startDate: { $gte: currentDate } },
    //   { status: 'ongoing', endDate: { $gte: currentDate } },
    // ],
  }).sort({ startDate: -1 })

  if (!tournament) {
    res.json(null)
    return
  }

  // Update tournament status if needed
  // if (
  //   tournament.status === 'registration' &&
  //   currentDate > tournament.registrationEndDate
  // ) {
  //   tournament.status = 'upcoming'
  // } else if (
  //   tournament.status === 'upcoming' &&
  //   currentDate >= tournament.startDate
  // ) {
  //   tournament.status = 'ongoing'
  // } else if (
  //   tournament.status === 'ongoing' &&
  //   currentDate > tournament.endDate
  // ) {
  //   tournament.status = 'completed'
  // }

  // await tournament.save()

  let userRegistration = null
  if (
    userId &&
    userId !== 'undefined' &&
    userId !== 'null' &&
    userId !== '' &&
    userId !== undefined
  ) {
    const user = await User.findById(userId)
    if (user && authorizedInGameNames.includes(user.inGameName)) {
      userRegistration = await TournamentRegistration.findOne({
        user: userId,
        tournament: tournament._id,
      })
    }
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
    categoryScores: userRegistration ? userRegistration.categoryScores : {},
    categoryAttempts: userRegistration ? userRegistration.categoryAttempts : {},
    totalScore: userRegistration ? userRegistration.totalScore : 0,
  }

  res.json(result)
})

// @desc   Get the active tournament registration details
// @route  GET /api/tournament/active-registration
// @access Private
const getActiveTournamentRegistration = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const tournament = await Tournament.findOne({
    isActive: true,
  })

  if (!tournament) {
    return res.json({ tournament: null, isRegistered: false })
  }

  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournament._id,
  })

  res.json({
    tournament,
    isRegistered: !!registration,
  })
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
  const latestTournament = await Tournament.findOne().sort({ _id: -1 })

  if (!latestTournament) {
    return res.json({ isAuthorized: false, isUnderMaintenance: false })
  }

  res.json({
    isAuthorized: true,
    isUnderMaintenance: latestTournament.isUnderMaintenance,
  })
})

// @desc   Get all tournaments
// @route  GET /api/admin/tournament/all
// @access Private (Admin only)
const getAllTournaments = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }

  const tournaments = await Tournament.find().sort({ tournamentNumber: -1 })
  res.json(tournaments)
})

// @desc   Update tournament maintenance status
// @route  PUT /api/admin/tournament/:id/maintenance
// @access Private (Admin only)
const updateMaintenanceStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' })
  }

  const { id } = req.params
  const { isUnderMaintenance } = req.body

  const tournament = await Tournament.findById(id)
  if (!tournament) {
    return res.status(404).json({ message: 'Tournament not found' })
  }

  tournament.isUnderMaintenance = isUnderMaintenance
  await tournament.save()

  res.json({
    message: 'Tournament maintenance status updated successfully',
    tournament,
  })
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
        pic: '$userDetails.pic',
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
    pic: entry?.pic,
  }))

  res.json({
    leaderboard,
    currentPage: parseInt(page),
    totalPages: Math.ceil(result.totalCount / limit),
    hasMore: skip + leaderboard.length < result.totalCount,
    userStanding,
    tournamentNumber: tournament.tournamentNumber,
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
        userId: '$userDetails._id',
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
      score: participant.totalScore,
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
  const userId = req.query.userId

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
        totalScore: 1,
        level: '$userDetails.level',
        userId: '$userDetails._id',
      },
    },
    { $sort: { totalScore: -1, level: -1 } },
  ])

  const formattedLeaders = topLeaders.map((leader, index) => ({
    rank: index + 1,
    inGameName: leader.inGameName,
    name: leader.name,
    score: leader.totalScore,
    level: leader.level,
    userId: leader.userId,
  }))

  let userStanding = null
  if (userId) {
    userStanding = formattedLeaders.find(
      leader => leader.userId.toString() === userId,
    )
  }

  res.json({
    tournamentId: previousTournament._id,
    tournamentNumber: previousTournament.tournamentNumber,
    endDate: previousTournament.endDate,
    topLeaders: formattedLeaders.slice(0, 5),
    userStanding,
  })
})

// @desc  Create a test tournament
// @route POST /api/admin/tournament/test
// @access Private (Admin only)
const createTestTournament = asyncHandler(async (req, res) => {
  const { startDate, endDate, registrationStartDate, registrationEndDate } =
    req.body

  const latestTestTournament = await Tournament.findOne({
    tournamentType: 'test',
  }).sort({ tournamentNumber: 1 })
  const nextTournamentNumber = latestTestTournament
    ? latestTestTournament.tournamentNumber - 1
    : -1

  const newTestTournament = await Tournament.create({
    tournamentNumber: nextTournamentNumber,
    startDate,
    endDate,
    registrationStartDate,
    registrationEndDate,
    status: 'registration',
    tournamentType: 'test',
    isActive: false,
  })

  res.status(201).json(newTestTournament)
})

// @desc  Get the active test tournament
// @route GET /api/admin/tournament/test
// @access Private (Admin only)
const getTestTournament = asyncHandler(async (req, res) => {
  const testTournament = await Tournament.findOne({
    tournamentType: 'test',
  })
  if (!testTournament) {
    res.status(404)
    throw new Error('No active test tournament found')
  }
  res.json(testTournament)
})

// @desc  Update the active test tournament
// @route PUT /api/admin/tournament/test/:id
// @access Private (Admin only)
const updateTestTournament = asyncHandler(async (req, res) => {
  const { id } = req.params
  const updates = req.body

  const testTournament = await Tournament.findOneAndUpdate(
    { _id: id, tournamentType: 'test' },
    updates,
    { new: true },
  )

  if (!testTournament) {
    res.status(404)
    throw new Error('Test tournament not found')
  }

  res.json(testTournament)
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
    if (!user.eligibleForTournament) {
      return res.status(403).json({
        message:
          'You are not eligible to register for the tournament Yet. Keep playing to become eligible',
      })
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
    if (
      tournament.tournamentType === 'test' &&
      !authorizedInGameNames.includes(user.inGameName)
    ) {
      return res.status(403).json({
        message:
          'You are not authorized to participate in this test tournament',
      })
    }
    // Validate selected categories

    if (
      selectedCategories.length !== 3 ||
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

    registration.sendTourFeedback = true

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
  const newQuestion = new TournamentQuestion({
    question,
    hindiQuestion,
    options: {
      a: { text: options.a, hindiText: hindiOptions.a },
      b: { text: options.b, hindiText: hindiOptions.b },
      c: { text: options.c, hindiText: hindiOptions.c },
      d: { text: options.d, hindiText: hindiOptions.d },
    },

    category: 'current affairs',
    difficulty: parseFloat(difficulty),
    isManuallyAdded: true,
  })

  // Set the correctAnswer
  if (newQuestion.options[correctAnswer]) {
    newQuestion.correctAnswer = newQuestion.options[correctAnswer]._id
  } else {
    res.status(400)
    throw new Error('Invalid correctAnswer')
  }

  await newQuestion.save()

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
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const oldQuestion = await TournamentQuestion.findById(
      req.params.id,
    ).session(session)

    if (!oldQuestion) {
      throw new Error('Question not found')
    }

    if (oldQuestion.category !== 'current affairs') {
      throw new Error('This is not a current affairs question')
    }

    const {
      question: questionText,
      hindiQuestion,
      options,
      hindiOptions,
      correctAnswer,
      difficulty,
    } = req.body

    // Create new question data
    const newQuestionData = {
      question: questionText || oldQuestion.question,
      hindiQuestion: hindiQuestion || oldQuestion.hindiQuestion,
      options: {
        a: { text: options.a.text, hindiText: hindiOptions.a.text },
        b: { text: options.b.text, hindiText: hindiOptions.b.text },
        c: { text: options.c.text, hindiText: hindiOptions.c.text },
        d: { text: options.d.text, hindiText: hindiOptions.d.text },
      },
      category: 'current affairs',
      difficulty: parseFloat(difficulty) || oldQuestion.difficulty,
      isManuallyAdded: true,
    }

    // Create new question
    const newQuestion = new TournamentQuestion(newQuestionData)

    // Set the correctAnswer
    if (correctAnswer && newQuestion.options[correctAnswer]) {
      newQuestion.correctAnswer = newQuestion.options[correctAnswer]._id
    } else {
      throw new Error('Invalid correctAnswer')
    }

    // Save the new question
    await newQuestion.save({ session })

    // Delete the old question
    await TournamentQuestion.findByIdAndDelete(req.params.id).session(session)

    // Commit the transaction
    await session.commitTransaction()
    session.endSession()

    res.json(newQuestion)
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    res.status(400)
    throw new Error(`Error updating question: ${error.message}`)
  }
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

  const tournament = await Tournament.findById(tournamentId)
  if (!tournament) {
    res.status(404)
    throw new Error('Tournament not found')
  }

  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournamentId,
  })

  if (!registration) {
    res.status(404)
    throw new Error('Tournament registration not found')
  }

  const quizCount = 2
  const currentAttempts = registration.categoryAttempts.get(category) || 0

  if (currentAttempts >= quizCount) {
    return res.status(400).json({
      message: `Maximum number of quiz attempts (${quizCount}) for this category has been reached`,
    })
  }
  // Check if a session already exists
  const existingSession = await QuizSession.findOne({
    user: userId,
    tournament: tournamentId,
    category: category,
    attemptNumber: { $gt: 1 },
    completed: false,
  })

  if (existingSession) {
    return res.status(400).json({
      message:
        'A quiz for this category is already in progress or done. You cannot start a new quiz for this category',
      existingSession: {
        _id: existingSession._id,
        startTime: existingSession.startTime,
        endTime: existingSession.endTime,
      },
    })
  }
  const attemptNumber = currentAttempts + 1
  // Generate quiz questions
  const questions = await generateCategoryQuiz(userId, tournamentId, category)

  // Create a new quiz session
  const quizSession = await QuizSession.create({
    user: userId,
    tournament: tournamentId,
    category,
    attemptNumber,
    questions: questions.map(q => q._id),
    startTime: new Date(),
    endTime: new Date(Date.now() + 60000), // 60 seconds from now
  })
  // Update category attempts
  let ojectKeysLengthEquals3 = false
  if (Object.keys(registration.categoryAttempts).length === 3)
    ojectKeysLengthEquals3 = true

  const isCategoryFirstAttempt =
    attemptNumber === 1 && !registration.categoryAttempts[category]
  registration.categoryAttempts.set(category, attemptNumber)

  if (isCategoryFirstAttempt && ojectKeysLengthEquals3) {
    registration.sendTourFeedback = true
  }
  await registration.save()

  // Jumble options and remove sensitive information before sending to client
  const clientQuestions = questions.map(q => {
    const questionText = lang === 'hi' ? q.hindiQuestion : q.question
    const options = q.options

    // Create an array of option objects with id and text
    const optionArray = Object.entries(options).map(([key, option]) => ({
      id: option._id.toString(),
      text: lang === 'hi' ? option.hindiText : option.text,
    }))

    // Shuffle the option array
    const shuffledOptions = optionArray.sort(() => Math.random() - 0.5)

    return {
      _id: q._id,
      question: questionText,
      options: shuffledOptions,
    }
  })

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
    const session = await mongoose.startSession()

    try {
      session.startTransaction()

      const quizSession = await QuizSession.findById(quizSessionId).session(
        session,
      )
      if (!quizSession) {
        throw new Error('Quiz session not found')
      }

      if (quizSession.completed) {
        await session.abortTransaction()
        return res.status(400).json({ error: 'Quiz already submitted' })
      }

      if (new Date() > quizSession.endTime) {
        await session.abortTransaction()
        return res.status(400).json({ error: 'Quiz time expired' })
      }

      const user = await User.findById(quizSession.user).session(session)
      const questions = await TournamentQuestion.find({
        _id: { $in: quizSession.questions },
      }).session(session)

      // Calculate score and RQM
      let score = 0
      let correctCount = 0

      const updatedResponses = userResponses.map((response, index) => {
        const question = questions.find(
          q => q._id.toString() === questionsIds[index],
        )
        const isCorrect = question.correctAnswer.toString() === response
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

      const currentAttempts =
        registration.categoryAttempts.get(quizSession.category) || 0
      const previousBestScore =
        registration.categoryScores.get(quizSession.category) || 0

      if (RQM_score >= previousBestScore) {
        registration.categoryScores.set(quizSession.category, RQM_score)
        registration.totalScore =
          registration.totalScore - previousBestScore + RQM_score
      }

      if (currentAttempts >= 2) {
        registration.completedCategories.push(quizSession.category)
      }
      let sendTourFeedback = false
      if (registration.sendTourFeedback) {
        registration.sendTourFeedback = false
        sendTourFeedback = true
      }
      // registration.categoryAttempts.set(
      //   quizSession.category,
      //   currentAttempts + 1,
      // )
      await registration.save({ session })

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
          $sort: { RQM_score: -1 },
        },
        {
          $group: {
            _id: '$user',
            bestScore: { $first: '$RQM_score' },
            session: { $first: '$$ROOT' },
          },
        },
        {
          $sort: { bestScore: -1 },
        },
        {
          $limit: 3,
        },
        {
          $lookup: {
            from: 'Users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            inGameName: '$userDetails.inGameName',
            score: '$bestScore',
            userId: '$_id',
          },
        },
      ]).session(session)

      await session.commitTransaction()
      success = true

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
        attemptsLeft: 2 - currentAttempts,
        isCompleted: currentAttempts >= 2,
        sendTourFeedback: sendTourFeedback,
      })
    } catch (error) {
      await session.abortTransaction()

      if (
        error.name === 'MongoServerError' &&
        (error.code === 112 ||
          error.code === 251 ||
          error.hasErrorLabel('TransientTransactionError'))
      ) {
        retryCount++
        if (retryCount < maxRetries) {
          console.log(`Retrying transaction (attempt ${retryCount + 1})...`)
          await new Promise(resolve =>
            setTimeout(resolve, 2 ** retryCount * 100),
          ) // Exponential backoff
        }
      } else {
        console.error('Non-transient error:', error)
        return res
          .status(400)
          .json({ error: error.message || 'Error submitting quiz' })
      }
    } finally {
      session.endSession()
    }
  }

  if (!success) {
    res
      .status(500)
      .json({ error: 'Max retries reached. Unable to submit quiz.' })
  }
})

const getQuizSummary = asyncHandler(async (req, res) => {
  const { category, tournamentId, lang } = req.query
  const userId = req.user._id

  // Find the best quiz session for this user, tournament, and category
  const bestQuizSession = await QuizSession.findOne({
    user: userId,
    tournament: tournamentId,
    category: category,
    completed: true,
  })
    .sort({ RQM_score: -1 }) // Sort by RQM score in descending order
    .populate('questions')
    .populate('user', 'inGameName')
    .lean()

  if (!bestQuizSession) {
    res.status(404)
    throw new Error('No completed quiz session found')
  }

  const registration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournamentId,
  }).lean()

  if (!registration) {
    res.status(404)
    throw new Error('Tournament registration not found')
  }

  const questions = bestQuizSession.questions
  const totalQuestions = questions.length
  const score = bestQuizSession.responses.filter(r => r.isCorrect).length
  const quizDifficulty =
    questions.reduce((acc, q) => acc + parseFloat(q.difficulty), 0) /
    totalQuestions
  const quizDifficultyLevel =
    quizDifficulty < 0.5 ? 'easy' : quizDifficulty < 0.7 ? 'medium' : 'hard'

  const topLeaders = await getTopLeadersForCategory(tournamentId, category)

  // Helper function to find the key (a, b, c, d) for a given ObjectId or value
  const findKeyByValue = (options, target) => {
    for (const [key, value] of Object.entries(options)) {
      if (typeof value === 'object' && value !== null) {
        // New schema: compare ObjectId
        if (value._id && value._id.toString() === target.toString()) {
          return key
        }
      } else {
        // Old schema: compare string values
        if (key === target) {
          return key
        }
      }
    }
    return null
  }

  // Helper function to get option text
  const getOptionText = option => {
    return typeof option === 'object' && option !== null
      ? lang === 'hi'
        ? option.hindiText
        : option.text
      : option
  }

  const summary = {
    score: `${score}/${totalQuestions}`,
    RQM_score: bestQuizSession.RQM_score,
    quizDifficulty: quizDifficultyLevel,
    timeTaken: bestQuizSession.timeTaken,
    totalTournamentScore: registration.totalScore,
    topLeaders: topLeaders,
    result: bestQuizSession.responses.map((response, index) => {
      const question = questions[index]
      const options = question.options

      return {
        question: lang === 'hi' ? question.hindiQuestion : question.question,
        options: {
          a: getOptionText(options.a),
          b: getOptionText(options.b),
          c: getOptionText(options.c),
          d: getOptionText(options.d),
        },
        answer: findKeyByValue(options, question.correctAnswer),
        userAnswer: findKeyByValue(options, response.userAnswer),
        isCorrect: response.isCorrect,
        explanation: question.explanation || 'No explanation provided',
      }
    }),
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

  // Fetch best quiz sessions for each category
  const bestQuizSessions = await QuizSession.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        tournament: new mongoose.Types.ObjectId(tournamentId),
      },
    },
    {
      $group: {
        _id: '$category',
        bestSession: { $max: { RQM_score: '$RQM_score', session: '$$ROOT' } },
      },
    },
    {
      $replaceRoot: { newRoot: '$bestSession.session' },
    },
  ])

  // Calculate stats
  const categoryStats = await Promise.all(
    bestQuizSessions.map(async session => {
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
    categoryAttempts: registration.categoryAttempts,
    categoryStats,
  }

  res.json(userStats)
})

// @desc  Get questions for the tournament
// @route GET /api/admin/tournament/questions
// @access Admin
const getQuestions = asyncHandler(async (req, res) => {
  const { tournamentId, category, difficulty } = req.query

  let filter = { isManuallyAdded: false }

  if (category) {
    filter.category = category
  }

  if (difficulty) {
    filter.difficulty = difficulty
  }

  if (tournamentId) {
    const tournament = await Tournament.findById(tournamentId)
    if (!tournament) {
      res.status(404)
      throw new Error('Tournament not found')
    }

    filter.createdAt = {
      $gte: tournament.registrationStartDate,
      $lte: tournament.registrationEndDate,
    }
  }

  const questions = await TournamentQuestion.find(filter)
  res.status(200).json(questions)
})

// @desc Edit a question that is not manually added
// @route PUT /api/admin/tournament/questions/:id
// @access Admin
const editQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    question,
    hindiQuestion,
    options,
    hindiOptions,
    correctAnswer,
    category,
    difficulty,
  } = req.body

  const tournamentQuestion = await TournamentQuestion.findById(id)

  if (!tournamentQuestion) {
    res.status(404)
    throw new Error('Question not found')
  }

  if (tournamentQuestion.isManuallyAdded) {
    res.status(400)
    throw new Error('Cannot edit manually added questions')
  }

  tournamentQuestion.question = question || tournamentQuestion.question
  tournamentQuestion.hindiQuestion =
    hindiQuestion || tournamentQuestion.hindiQuestion
  tournamentQuestion.options = options || tournamentQuestion.options
  tournamentQuestion.hindiOptions =
    hindiOptions || tournamentQuestion.hindiOptions
  tournamentQuestion.correctAnswer =
    correctAnswer || tournamentQuestion.correctAnswer
  tournamentQuestion.category = category || tournamentQuestion.category
  tournamentQuestion.difficulty = difficulty || tournamentQuestion.difficulty

  const updatedQuestion = await tournamentQuestion.save()
  res.status(200).json(updatedQuestion)
})

// @desc   Get the participants for the active tournament
// @route  GET /api/admin/tournament/participants
// @access Private (Admin only)
const getTournamentParticipants = asyncHandler(async (req, res) => {
  // Find the active tournament
  const activeTournament = await Tournament.findOne({ isActive: true })

  if (!activeTournament) {
    return res.status(404).json({ message: 'No active tournament found' })
  }

  // Get the registered users for the active tournament
  const registrations = await TournamentRegistration.find({
    tournament: activeTournament._id,
  }).populate('user', 'name inGameName email')

  // Filter out dummy users and extract required information
  const participants = registrations
    .filter(reg => !reg.user.email.match(/^dummy\d+@mail\.com$/))
    .map(reg => ({
      name: reg.user.name,
      inGameName: reg.user.inGameName,
      email: reg.user.email,
    }))

  res.json(participants)
})

module.exports = {
  registerForTournament,
  createTestTournament,
  getTestTournament,
  updateTestTournament,
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
  getActiveTournamentRegistration,
  getAllTournaments,
  updateMaintenanceStatus,
  getQuestions,
  editQuestion,
  getTournamentParticipants,
  getLatestTestTournament,
}
