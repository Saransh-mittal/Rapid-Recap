// scripts/determineBaselineRQM.js
/**
 * Diagnostic script to determine the baseline RQM for win probability calculations
 *
 * Why this matters:
 * - Baseline RQM is the "average" player performance
 * - Used to calculate performance modifiers (above/below average)
 * - Should be based on ACTUAL data, not guesswork
 *
 * Run this ONCE before implementing win probability
 * Command: node scripts/determineBaselineRQM.js
 */

const QuickClashSession = require('../model/quickClashSchemas/quickClashSessionSchema')
const mongoose = require('mongoose')

async function determineBaselineRQM() {
  console.log('📊 Analyzing RQM data from completed challenges...\n')

  try {
    // Get all completed challenge RQM scores
    // We exclude team battles here to get pure 1v1 baseline
    const scores = await QuickClashSession.aggregate([
      {
        $match: {
          phase: 'completed',
          'score.RQM_score': {
            $exists: true,
            $ne: null,
            $gte: 0,
            $lte: 200,
          },
        },
      },
      {
        $lookup: {
          from: 'quick_clash_challenges',
          localField: 'challenge',
          foreignField: '_id',
          as: 'challengeData',
        },
      },
      {
        $unwind: {
          path: '$challengeData',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          'challengeData.fromTeamBattle': { $ne: true },
        },
      },
      {
        $project: {
          rqm: '$score.RQM_score',
        },
      },
      {
        $sort: { rqm: 1 },
      },
    ])

    if (scores.length === 0) {
      console.log('⚠️  No RQM data found. Using default baseline: 65')
      console.log(
        '💡 This is okay for new deployments. Run again after 50+ challenges.\n',
      )
      return 65
    }

    const rqmValues = scores.map(s => s.rqm)

    // Calculate statistics
    const mean = rqmValues.reduce((a, b) => a + b, 0) / rqmValues.length
    const sortedValues = [...rqmValues].sort((a, b) => a - b)
    const median = sortedValues[Math.floor(rqmValues.length / 2)]

    const p25 = sortedValues[Math.floor(rqmValues.length * 0.25)]
    const p75 = sortedValues[Math.floor(rqmValues.length * 0.75)]

    console.log(`Sample size: ${scores.length} 1v1 challenges\n`)
    console.log('Statistical Measures:')
    console.log(`  Mean:   ${mean.toFixed(2)}`)
    console.log(`  Median: ${median.toFixed(2)} ⭐ [RECOMMENDED]`)
    console.log(`  25th percentile: ${p25.toFixed(2)}`)
    console.log(`  75th percentile: ${p75.toFixed(2)}\n`)

    // Why median over mean?
    // - More robust to outliers (a few 95+ scores won't skew it)
    // - Represents the "typical" player better
    // - Standard practice in competitive rating systems

    // Distribution visualization
    console.log('📈 RQM Score Distribution:')
    const bins = [0, 40, 50, 60, 70, 80, 90, 200]
    bins.forEach((bin, i) => {
      if (i < bins.length - 1) {
        const count = rqmValues.filter(v => v >= bin && v < bins[i + 1]).length
        const pct = ((count / rqmValues.length) * 100).toFixed(1)
        const bar = '█'.repeat(Math.floor(pct / 2))
        console.log(`  ${bin}-${bins[i + 1]}: ${bar} ${pct}%`)
      }
    })

    // Validation checks
    console.log('\n🔍 Data Quality Check:')
    if (scores.length < 50) {
      console.log('  ⚠️  Small sample size - results may vary')
      console.log('  💡 Recommended: Wait for 50+ challenges before finalizing')
    } else if (scores.length < 200) {
      console.log('  ✓ Adequate sample size')
    } else {
      console.log('  ✓✓ Excellent sample size')
    }

    if (median < 50 || median > 80) {
      console.log('  ⚠️  Unusual median - verify quiz difficulty')
    } else {
      console.log('  ✓ Median in expected range')
    }

    const recommendedBaseline = Math.round(median)
    console.log(`\n✅ RECOMMENDED BASELINE_RQM = ${recommendedBaseline}`)
    console.log(`\n📝 Next Steps:`)
    console.log(`   1. Add to utils/quickClashConstants.js:`)
    console.log(`      BASELINE_RQM: ${recommendedBaseline},`)
    console.log(`   2. Proceed with Phase 2 implementation\n`)

    return recommendedBaseline
  } catch (error) {
    console.error('❌ Error analyzing RQM data:', error)
    throw error
  }
}

module.exports = { determineBaselineRQM }

// CLI execution
if (require.main === module) {
  require('../db/conn') // Your DB connection

  determineBaselineRQM()
    .then(baseline => {
      process.exit(0)
    })
    .catch(err => {
      console.error('Fatal error:', err)
      process.exit(1)
    })
}
