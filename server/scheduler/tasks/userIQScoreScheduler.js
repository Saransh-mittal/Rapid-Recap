const { dailyUserIQCalc } = require('../../utils/dailyUserIQCalc.utils')
const updateBots = require('../../utils/bot.utils/updateBots')

async function calculateUserIQScores(isCalculating) {
  if (isCalculating.value) {
    console.log('IQ score calculation already in progress. Skipping this run.')
    return
  }

  isCalculating.value = true

  try {
    await updateBots()
    await dailyUserIQCalc()
    console.log('User IQ scores calculated successfully!')
  } catch (error) {
    console.error('Error calculating IQ scores:', error)
  } finally {
    isCalculating.value = false
  }
}
module.exports = calculateUserIQScores
