const { usersEnabledNotifs } = require('../scripts/usersEnabledNotifs')
const { usersGivingQuizStats } = require('../scripts/usersGivingQuizStats')
const { usersWithLastLoginAfter } = require('../scripts/usersLastLoggedInStats')
const { usersUsingApp } = require('../scripts/usersUsingApp')
const { newUsersStats } = require('../scripts/newUsersStats')
const User = require('../model/userSchema')

const getQuizAttemptsByUsers = async (req, res) => {
  try {
    // console.log(req.query);
    const startDate = new Date(`${req.query.startDate}T00:00:00Z`) // ISO 8601 format
    const endDate = new Date(`${req.query.endDate}T23:59:59Z`) // ISO 8601 format
    const users = await usersGivingQuizStats({ startDate, endDate })
    res.status(200).json({ users })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
const getUsersWithLastLoginAfter = async (req, res) => {
  try {
    const specifiedDate = new Date(`${req.query.afterDate}T00:00:00Z`) // Corrected date format
    const users = await usersWithLastLoginAfter(specifiedDate)
    res.status(200).json({ users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
const getTimeSpentByUsers = async (req, res) => {
  try {
    const startDate = new Date(`${req.query.startDate}T00:00:00Z`) // ISO 8601 format
    const endDate = new Date(`${req.query.endDate}T23:59:59Z`) // ISO 8601 format
    const users = await usersUsingApp(startDate, endDate)
    res.status(200).json({ users })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getNotificationStatus = async (req, res) => {
  try {
    const result = await usersEnabledNotifs()
    res.status(200).json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

const getNewUsers = async (req, res) => {
  try {
    const startDate = new Date(`${req.query.startDate}T00:00:00Z`)
    const endDate = new Date(`${req.query.endDate}T23:59:59Z`)

    const users = await User.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).select('name email inGameName createdAt')

    res.status(200).json({ users })
  } catch (error) {
    console.error('Error fetching new users:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getQuizAttemptsByUsers,
  getUsersWithLastLoginAfter,
  getTimeSpentByUsers,
  getNotificationStatus,
  getNewUsers,
}
