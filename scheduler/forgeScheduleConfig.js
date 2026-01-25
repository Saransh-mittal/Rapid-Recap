const { runCompleteWorkflow } = require('../scripts/runCompleteForgeWorkflow')

const forgeSchedules = [
  {
    name: 'daily-forge-workflow',
    // 22:30 UTC = 04:00 AM IST (next day)
    cronPattern: '30 22 * * *',
    task: async () => {
      console.log('Starting daily Forge workflow (4:00 AM IST)...')
      try {
        await runCompleteWorkflow({
          waitForCompletion: true,
          // Use defaults for other options (scrape all sources, process 100 seeds)
        })
        console.log('Daily Forge workflow completed successfully.')
      } catch (error) {
        console.error('Daily Forge workflow failed:', error)
      }
    },
  },
]

module.exports = forgeSchedules
