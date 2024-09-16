const { getCategories } = require('../../data/categories')
const {
  generateTournamentQuestions,
} = require('../../services/tournamentQuestionService')

const runTournamentServiceTask = async () => {
  try {
    const categories = getCategories()
    for (const category of categories) {
      // Generate tournament questions for each category
      console.log('Generating tournament questions for category:', category)
      await generateTournamentQuestions(category)
    }
    console.log('Tournament questions generated successfully!')
  } catch (error) {
    console.error('Error running tournament service task:', error)
  }
}

module.exports = {
  runTournamentServiceTask,
}
