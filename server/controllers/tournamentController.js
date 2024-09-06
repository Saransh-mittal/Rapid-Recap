const asyncHandler = require('express-async-handler')
const Tournament = require('../model/tournamentSchema')
const TournamentRegistration = require('../model/tournamentRegistrationSchema')
const User = require('../model/userSchema')
const TournamentQuestion = require('../model/tournamentQuestionSchema')

// @desc   Register for a tournament
// @route  POST /api/tournament/register
// @access Private
const registerForTournament = asyncHandler(async (req, res) => {
  const { userId, tournamentId, selectedCategories } = req.body

  // Check if user is eligible to register
  const user = await User.findById(userId)
  if (!user || user.role === 'guest') {
    res.status(403)
    throw new Error('User is not eligible to register for the tournament')
  }

  // Check if tournament registration is open
  const tournament = await Tournament.findById(tournamentId)
  if (!tournament || tournament.status !== 'registration') {
    res.status(400)
    throw new Error('Tournament registration is not open')
  }

  // Validate selected categories
  if (
    selectedCategories.length !== 5 ||
    !selectedCategories.includes('Current Affairs')
  ) {
    res.status(400)
    throw new Error('Invalid category selection')
  }

  // Create tournament registration
  const registration = await TournamentRegistration.create({
    user: userId,
    tournament: tournamentId,
    selectedCategories: [...selectedCategories, 'Current Affairs'],
  })

  // Add user to tournament participants
  tournament.participants.push(userId)
  await tournament.save()

  res.status(201).json(registration)
})

// @desc   Get the current tournament
// @route  GET /api/tournament/current
// @access Public
const getCurrentTournament = asyncHandler(async (req, res) => {
  const currentDate = new Date()
  const tournament = await Tournament.findOne({
    registrationStartDate: { $lte: currentDate },
    registrationEndDate: { $gte: currentDate },
  })

  if (!tournament) {
    res.status(404)
    throw new Error('No active tournament found')
  }

  res.json(tournament)
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

module.exports = {
  registerForTournament,
  getCurrentTournament,
  addCurrentAffairsQuestion,
  getCurrentAffairsQuestions,
  updateCurrentAffairsQuestion,
  deleteCurrentAffairsQuestion,
}
