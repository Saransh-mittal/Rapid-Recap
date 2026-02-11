const { runCompleteWorkflow } = require('../scripts/runCompleteForgeWorkflow')
const path = require('path')
const { runArchivedReassessment } = require('../scripts/runArchivedForgeReassessment')

function getIntEnv(name, defaultValue, min = null) {
  const raw = process.env[name]
  if (raw === undefined) return defaultValue
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value)) return defaultValue
  if (min !== null && value < min) return defaultValue
  return value
}

function getNumberEnv(name, defaultValue, min = null, max = null) {
  const raw = process.env[name]
  if (raw === undefined) return defaultValue
  const value = Number(raw)
  if (!Number.isFinite(value)) return defaultValue
  if (min !== null && value < min) return defaultValue
  if (max !== null && value > max) return defaultValue
  return value
}

const ARCHIVED_REASSESS_LIMIT = getIntEnv(
  'FORGE_ARCHIVED_REASSESS_LIMIT',
  20,
  1,
)
const ARCHIVED_REASSESS_MAX_BATCHES = getIntEnv(
  'FORGE_ARCHIVED_REASSESS_MAX_BATCHES',
  3,
  1,
)
const ARCHIVED_REASSESS_COOLDOWN_HOURS = getIntEnv(
  'FORGE_ARCHIVED_REASSESS_COOLDOWN_HOURS',
  24,
  0,
)
const ARCHIVED_REASSESS_MIN_CONFIDENCE = getNumberEnv(
  'FORGE_ARCHIVED_REASSESS_MIN_CONFIDENCE',
  0.8,
  0,
  1,
)
const ARCHIVED_REASSESS_ONLY_AUTO_ARCHIVED =
  process.env.FORGE_ARCHIVED_REASSESS_ONLY_AUTO_ARCHIVED === 'true'

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
  {
    name: 'forge-archived-reassessment',
    // Every 6 hours: periodically re-assess archived forge items and restore if confidence is high.
    cronPattern: '15 */6 * * *',
    task: async () => {
      console.log('Starting archived Forge reassessment...')
      try {
        const aggregate = {
          checked: 0,
          errors: 0,
          restoreCandidates: 0,
          restored: 0,
          remainedArchived: 0,
          modifiedCount: 0,
          batches: 0,
        }
        let lastReport = null

        for (let i = 0; i < ARCHIVED_REASSESS_MAX_BATCHES; i++) {
          const report = await runArchivedReassessment({
            db: 'default',
            limit: ARCHIVED_REASSESS_LIMIT,
            model: 'gpt-5-mini',
            minConfidence: ARCHIVED_REASSESS_MIN_CONFIDENCE,
            apply: true,
            onlyAutoArchived: ARCHIVED_REASSESS_ONLY_AUTO_ARCHIVED,
            cooldownHours: ARCHIVED_REASSESS_COOLDOWN_HOURS,
            output: path.join(
              __dirname,
              '../reports/forge_archived_reassessment_latest.json',
            ),
          })

          lastReport = report
          aggregate.batches++
          aggregate.checked += report.summary.checked
          aggregate.errors += report.summary.errors
          aggregate.restoreCandidates += report.summary.restoreCandidates
          aggregate.restored += report.summary.restored
          aggregate.remainedArchived += report.summary.remainedArchived
          aggregate.modifiedCount += report.summary.modifiedCount

          // Stop early when backlog for this run is exhausted.
          if (report.summary.checked < ARCHIVED_REASSESS_LIMIT) {
            break
          }
        }

        console.log(
          `Archived reassessment completed. Batches=${aggregate.batches}, checked=${aggregate.checked}, restored=${aggregate.restored}, modified=${aggregate.modifiedCount}, lastDb=${lastReport?.meta?.database || 'unknown'}`,
        )
      } catch (error) {
        console.error('Archived Forge reassessment failed:', error)
      }
    },
  },
]

module.exports = forgeSchedules
