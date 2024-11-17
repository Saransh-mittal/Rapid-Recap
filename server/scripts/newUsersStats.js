// scripts/newUsersStats.js
const User = require('../model/userSchema')

const newUsersStats = async (startDate, endDate) => {
  const users = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $project: {
        _id: {
          name: '$name',
          email: '$email',
          inGameName: '$inGameName',
        },
        createdAt: 1,
      },
    },
  ])
  return users
}

module.exports = { newUsersStats }
