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

  const userRegistration = await TournamentRegistration.findOne({
    user: userId,
    tournament: tournament._id,
  })

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

  // If the tournament is ongoing, include the leaderboard
  if (tournament.status === 'ongoing') {
    const leaderboardData = await TournamentRegistration.aggregate([
      { $match: { tournament: tournament._id } },
      {
        $lookup: {
          from: 'Users', // Use the collection name from your User schema
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          inGameName: '$userDetails.inGameName',
          totalScore: 1,
          level: '$userDetails.level',
          xp: '$userDetails.xp',
        },
      },
      { $sort: { totalScore: -1, xp: -1 } },
    ])

    result.leaderboard = leaderboardData.map((entry, index) => ({
      rank: index + 1,
      inGameName: entry.inGameName,
      score: entry.totalScore,
      level: entry.level,
    }))
  }

  res.json(result)
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
    category: 'Current Affairs',
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

// @desc   Get all current affairs questions
// @route  GET /api/tournament/questions/current-affairs
// @access Private (Admin only)
const getCurrentAffairsQuestions = asyncHandler(async (req, res) => {
  const questions = await TournamentQuestion.find({
    category: 'Current Affairs',
  })
  res.json(questions)
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

  if (question.category !== 'Current Affairs') {
    res.status(400)
    throw new Error('This is not a Current Affairs question')
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

  if (question.category !== 'Current Affairs') {
    res.status(400)
    throw new Error('This is not a Current Affairs question')
  }

  await question.remove()

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
    endTime: new Date(Date.now() + 50000), // 50 seconds from now
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
  const { quizSessionId, userResponses } = req.body
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
    const tournament = await Tournament.findById(
      quizSession.tournament,
    ).session(session)
    const questions = await TournamentQuestion.find({
      _id: { $in: quizSession.questions },
    }).session(session)

    // Calculate score and RQM
    let score = 0
    const timeTaken = (new Date() - quizSession.startTime) / 1000 // in seconds
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

    // Update tournament leaderboard
    const existingParticipant = tournament.participants.find(
      p => p.user.toString() === quizSession.user.toString(),
    )
    if (existingParticipant) {
      existingParticipant.score = registration.totalScore
    } else {
      tournament.participants.push({
        user: quizSession.user,
        score: registration.totalScore,
      })
    }
    tournament.participants.sort((a, b) => b.score - a.score)
    await tournament.save({ session })

    await commitSession()

    logActivity({
      userInGameName: user.inGameName,
      type: activityTypes.TOURNAMENT_QUIZ.type,
      // Add any other relevant activity data
    })

    res.json({
      message: 'Quiz submitted successfully',
      score: `${score}/${questions.length}`,
      RQM_score,
      timeTaken,
      totalTournamentScore: registration.totalScore,
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
  getCurrentAffairsQuestions,
  updateCurrentAffairsQuestion,
  deleteCurrentAffairsQuestion,
  startQuiz,
  submitQuiz,
  getLatestTournament,
  getPreviousTournament,
}
