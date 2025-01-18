const User = require('../model/userSchema')
const _ = require('lodash')

// const analyzeUserDistribution = async users => {
//   // Society/Circle configuration
//   const CircleAndSocietyDataXP = [
//     {
//       society: 'Titans Society',
//       circle: null,
//       IQ_Lower: 150,
//       IQ_Upper: null,
//     },
//     {
//       society: 'Mavericks Society',
//       circle: 'Visionaries Circle',
//       IQ_Lower: 140,
//       IQ_Upper: 150,
//     },
//     {
//       society: 'Mavericks Society',
//       circle: 'Pioneers Circle',
//       IQ_Lower: 130,
//       IQ_Upper: 140,
//     },
//     {
//       society: 'Elites Society',
//       circle: 'Scholars Circle',
//       IQ_Lower: 120,
//       IQ_Upper: 130,
//     },
//     {
//       society: 'Elites Society',
//       circle: 'Masters Circle',
//       IQ_Lower: 110,
//       IQ_Upper: 120,
//     },
//     {
//       society: 'Strivers Society',
//       circle: 'Enthusiasts Circle',
//       IQ_Lower: 104,
//       IQ_Upper: 110,
//     },
//     {
//       society: 'Strivers Society',
//       circle: 'Achievers Circle',
//       IQ_Lower: 97,
//       IQ_Upper: 104,
//     },
//     {
//       society: 'Strivers Society',
//       circle: 'Progressors Circle',
//       IQ_Lower: 90,
//       IQ_Upper: 97,
//     },
//     {
//       society: 'Explorers Society',
//       circle: null,
//       IQ_Lower: 0,
//       IQ_Upper: 90,
//     },
//   ]

//   // Function to calculate statistics for a group of users
//   const calculateStats = users => {
//     if (!users.length) return null

//     const meanScore = _.meanBy(users, 'userScore')
//     const variance = _.meanBy(users, u => Math.pow(u.userScore - meanScore, 2))

//     return {
//       count: users.length,
//       meanScore: meanScore,
//       highestScore: _.maxBy(users, 'userScore')?.userScore,
//       lowestScore: _.minBy(users, 'userScore')?.userScore,
//       standardDeviation: Math.sqrt(variance),
//     }
//   }

//   // Initialize results object
//   const results = {
//     totalUsers: users.length,
//     societies: {},
//     circles: {},
//   }

//   // Group users by society and circle
//   users.forEach(user => {
//     const match = CircleAndSocietyDataXP.find(
//       s =>
//         user.IQ_score >= s.IQ_Lower &&
//         (!s.IQ_Upper || user.IQ_score < s.IQ_Upper),
//     )

//     if (match) {
//       // Add to society stats
//       if (!results.societies[match.society]) {
//         results.societies[match.society] = []
//       }
//       results.societies[match.society].push(user)

//       // Add to circle stats if applicable
//       if (match.circle) {
//         if (!results.circles[match.circle]) {
//           results.circles[match.circle] = []
//         }
//         results.circles[match.circle].push(user)
//       }
//     }
//   })

//   // Calculate statistics for each group
//   const analysis = {
//     overall: calculateStats(users),
//     societies: {},
//     circles: {},
//   }

//   // Calculate society-level statistics
//   for (const society in results.societies) {
//     analysis.societies[society] = calculateStats(results.societies[society])
//   }

//   // Calculate circle-level statistics
//   for (const circle in results.circles) {
//     analysis.circles[circle] = calculateStats(results.circles[circle])
//   }

//   return analysis
// }

// const start = async () => {
//   const users = await User.find({}, 'IQ_score userScore')
//   const analysis = await analyzeUserDistribution(users)

//   console.log('Analysis Results:', analysis)
// }
// start()

const simulateDemotion = async users => {
  // Step 1: Calculate distribution parameters
  const calculateDistribution = (minScore = 100) => {
    const iqToZScore = iq => (iq - 100) / 15

    // Get z-scores for target IQs
    const z10 = iqToZScore(10) // For IQ 10 (lowest active)
    const z90 = iqToZScore(90) // For IQ 90 (strivers)

    // Calculate SD and mean that ensures proper mapping
    const sd = minScore / (z90 - z10)
    const mean = minScore - z10 * sd

    return {
      mean,
      standardDeviation: sd,
      zScoreToScore: z => mean + z * sd,
      iqToScore: iq => mean + iqToZScore(iq) * sd,
    }
  }

  const DISTRIBUTION = calculateDistribution(500) // Using 100 as min score

  // Step 2: Apply exact IQ demotions
  const demoteIQ = currentIQ => {
    // Titans & Mavericks → Elites (110 IQ)
    if (currentIQ >= 130) return 110

    // Elites → Strivers - Achievers Circle (97 IQ)
    if (currentIQ >= 110 && currentIQ < 130) return 97

    // Current Strivers → Lowest Strivers (90 IQ)
    if (currentIQ >= 90 && currentIQ < 110) return 90

    // Explorers → IQ 10
    return 10
  }

  // Apply demotions and calculate new scores
  let demotedUsers = users.map(user => ({
    ...user,
    prevIQScore: user.IQ_score,
    prevUserScore: user.userScore,
    IQ_score: demoteIQ(user.IQ_score),
    userScore: 0, // Will be set in next step
  }))

  // Calculate new userscores based on demoted IQ
  demotedUsers = demotedUsers.map(user => ({
    ...user,
    userScore: DISTRIBUTION.iqToScore(user.IQ_score),
  }))

  // Function to calculate statistics
  const calculateStats = users => {
    const meanUserScore = _.meanBy(users, 'userScore')
    const userScoreVariance = _.meanBy(users, u =>
      Math.pow(u.userScore - meanUserScore, 2),
    )

    return {
      count: users.length,
      userScore: {
        mean: meanUserScore,
        highest: _.maxBy(users, 'userScore')?.userScore,
        lowest: _.minBy(users, 'userScore')?.userScore,
        standardDeviation: Math.sqrt(userScoreVariance),
      },
      IQ_score: {
        mean: _.meanBy(users, 'IQ_score'),
        highest: _.maxBy(users, 'IQ_score')?.IQ_score,
        lowest: _.minBy(users, 'IQ_score')?.IQ_score,
      },
      demotion: {
        averageIQDrop: _.meanBy(users, u => u.prevIQScore - u.IQ_score),
        averageScoreDrop: _.meanBy(users, u => u.prevUserScore - u.userScore),
      },
    }
  }

  // Analyze distribution
  const analysis = {
    distribution: {
      parameters: {
        mean: DISTRIBUTION.mean,
        standardDeviation: DISTRIBUTION.standardDeviation,
      },
      mappings: {
        iq110: DISTRIBUTION.iqToScore(110),
        iq97: DISTRIBUTION.iqToScore(97),
        iq90: DISTRIBUTION.iqToScore(90),
        iq10: DISTRIBUTION.iqToScore(10),
      },
    },
    counts: {
      total: demotedUsers.length,
      byIQ: {
        110: demotedUsers.filter(u => u.IQ_score === 110).length,
        97: demotedUsers.filter(u => u.IQ_score === 97).length,
        90: demotedUsers.filter(u => u.IQ_score === 90).length,
        10: demotedUsers.filter(u => u.IQ_score === 10).length,
      },
    },
    overall: calculateStats(demotedUsers),
    verifications: {
      iqMappingsExact: {
        iq110: demotedUsers
          .filter(u => u.IQ_score === 110)
          .every(u => u.userScore === DISTRIBUTION.iqToScore(110)),
        iq97: demotedUsers
          .filter(u => u.IQ_score === 97)
          .every(u => u.userScore === DISTRIBUTION.iqToScore(97)),
        iq90: demotedUsers
          .filter(u => u.IQ_score === 90)
          .every(u => u.userScore === DISTRIBUTION.iqToScore(90)),
        iq10: demotedUsers
          .filter(u => u.IQ_score === 10)
          .every(u => u.userScore === DISTRIBUTION.iqToScore(10)),
      },
    },
  }

  // Movement analysis
  const movements = {
    fromTitansAndMavericks: demotedUsers.filter(u => u.prevIQScore >= 130)
      .length,
    fromElites: demotedUsers.filter(
      u => u.prevIQScore >= 110 && u.prevIQScore < 130,
    ).length,
    fromStrivers: demotedUsers.filter(
      u => u.prevIQScore >= 90 && u.prevIQScore < 110,
    ).length,
    fromExplorers: demotedUsers.filter(u => u.prevIQScore < 90).length,
  }

  return {
    analysis,
    movements,
  }
}

const start = async () => {
  const users = await User.find(
    {
      IQ_score: {
        $gt: 0,
      },
    },
    'IQ_score userScore',
  )
  const results = await simulateDemotion(users)
  console.log('Simulation Results:', JSON.stringify(results, null, 2))
}

start()
