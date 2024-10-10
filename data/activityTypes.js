const { CircleAndSocietyDataXP } = require('./CircleAndSocietyData')

const activityTypes = {
  QUIZ_BONUS: { type: 'Extra opportunity quiz (bonus)', xp: 10 },
  RANDOM_QUIZ: {
    type: 'Every random quiz',
    baseXp: 5,
    getXp: consecutiveCount => Math.min(5 + consecutiveCount, 10), // Cap at 10 XP
  },
  QUINBOOST_UTILIZED: { type: 'Quinboost utilized', xp: 10 },
  SEVEN_DAY_STREAK: { type: '7-day streak', xp: 20 },
  FIVE_DAY_LOGIN_STREAK: { type: '5-day login streak', xp: 5 },
  TIME_SPENT: { type: 'User spent (min.) 10 min on website in a day', xp: 10 },
  WISE_WEB_EXPANSION: { type: 'Wise Web expansion', xp: 10 },
  RC_PURCHASE: { type: 'RC purchase (first purchase)', xp: 50 },
  SOCIETY_OR_CIRCLE_UPGRADE: { type: 'Society or Circle upgrade' },
  TOURNAMENT_REGISTRATION: { type: 'Tournament registration', xp: 5 },
  TOURNAMENT_QUIZ: { type: 'Tournament participation', xp: 10 },
  TOURNAMENT_WIN: { type: 'Tournament win', xp: 50 },
}

const getXpForActivity = ({
  activityType,
  userIQ,
  previousIQ = 0,
  consecutiveQuizCount = 0,
}) => {
  const activityKey = Object.keys(activityTypes).find(
    key => activityTypes[key].type === activityType,
  )

  if (!activityKey) {
    throw new Error(`Unknown activity type: ${activityType}`)
  }

  if (activityType === activityTypes.SOCIETY_OR_CIRCLE_UPGRADE.type) {
    if (userIQ === undefined || userIQ === null) {
      throw new Error(
        'userIQ is required for society or circle upgrade activities',
      )
    }

    let totalXp = 0
    const CircleAndSocietyData = CircleAndSocietyDataXP
    for (let society of CircleAndSocietyData) {
      if (previousIQ < society.IQ_Lower && userIQ >= society.IQ_Lower) {
        totalXp += society.xp
      }
    }
    return totalXp
  }
  if (activityType === activityTypes.RANDOM_QUIZ.type) {
    return activityTypes[activityKey].getXp(consecutiveQuizCount)
  }
  return activityTypes[activityKey] ? activityTypes[activityKey].xp : 0
}
module.exports = { activityTypes, getXpForActivity }
