// services/quickClashServices/quickClashWinProbabilityService.js
/**
 * Win Probability Calculation Service - CORRECTED VERSION
 *
 * FIXES: Updated to match actual QuickClashSession schema structure
 * - Uses score.RQM_score instead of quizAttempt.RQM_score
 * - Properly accesses nested score object
 */

const User = require('../../model/userSchema')
const QuickClashSession = require('../../model/quickClashSchemas/quickClashSessionSchema')
const QuickClashTeam = require('../../model/quickClashSchemas/quickClashTeamSchema')
const QuickClashTeamBattle = require('../../model/quickClashSchemas/quickClashTeamBattleSchema')
const { DEFAULT_STARTING_TROPHIES } = require('./quickClashTrophyService')
const {
  BASELINE_RQM,
  PERFORMANCE_MULTIPLIER,
  PERFORMANCE_CAP,
  CONSISTENCY_LOW_THRESHOLD,
  CONSISTENCY_HIGH_THRESHOLD,
  CONSISTENCY_BONUS,
  CONSISTENCY_PENALTY,
  MIN_WIN_PROBABILITY,
  MAX_WIN_PROBABILITY,
  ELO_RATING_DIVISOR,
  TEAM_PERFORMANCE_MULTIPLIER,
  TEAM_SYNERGY_CAP,
  ESTABLISHED_TEAM_BATTLES,
  MIN_MATCHES_FOR_MEDIUM_QUALITY,
  MIN_MATCHES_FOR_HIGH_QUALITY,
} = require('../../utils/quickClashConstants')

// ==========================================
// SOLO MODE (1v1) CALCULATIONS
// ==========================================

/**
 * Calculate effective rating for a user (Solo mode)
 *
 * CORRECTED: Uses score.RQM_score field path
 *
 * @param {Object} params - Parameters
 * @param {string} params.userId - User ID
 * @param {mongoose.ClientSession} [params.session] - Optional DB session
 * @returns {Promise<Object>} Effective rating breakdown
 */
const calculateUserEffectiveRating = async ({ userId, session = null }) => {
  // Step 1: Get user's trophy base
  const user = await User.findById(userId)
    .select('quickClashTrophies')
    .session(session)

  if (!user) {
    throw new Error('User not found')
  }

  const trophyBase = user.quickClashTrophies || DEFAULT_STARTING_TROPHIES

  // Step 2: Get last 10 completed SOLO challenges
  // CORRECTED: Query uses score.RQM_score
  const recentSessions = await QuickClashSession.find({
    user: userId,
    phase: 'completed',
    'score.RQM_score': { $exists: true, $ne: null }, // FIXED: Correct field path
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('score.RQM_score challenge') // FIXED: Select correct field
    .populate({
      path: 'challenge',
      select: 'fromTeamBattle',
    })
    .session(session)

  // Filter out team battles - we only want solo performance
  const soloSessions = recentSessions.filter(
    s => s.challenge && !s.challenge.fromTeamBattle,
  )

  let performanceMod = 0
  let consistencyMod = 0
  let dataQuality = 'low'

  // Step 3: Calculate modifiers if we have enough data
  if (soloSessions.length >= MIN_MATCHES_FOR_MEDIUM_QUALITY) {
    // CORRECTED: Access score.RQM_score
    const rqmScores = soloSessions.map(s => s.score.RQM_score) // FIXED: Correct access path
    const avgRQM = rqmScores.reduce((a, b) => a + b, 0) / rqmScores.length

    // Performance formula: (avgRQM - baseline) * multiplier
    performanceMod = (avgRQM - BASELINE_RQM) * PERFORMANCE_MULTIPLIER

    // Cap to prevent extreme swings
    performanceMod = Math.min(
      Math.max(performanceMod, -PERFORMANCE_CAP),
      PERFORMANCE_CAP,
    )

    dataQuality = 'medium'

    // Step 4: Calculate consistency modifier if we have 10+ matches
    if (soloSessions.length >= MIN_MATCHES_FOR_HIGH_QUALITY) {
      const mean = avgRQM
      const squaredDiffs = rqmScores.map(score => Math.pow(score - mean, 2))
      const variance =
        squaredDiffs.reduce((a, b) => a + b, 0) / rqmScores.length
      const stdDev = Math.sqrt(variance)

      if (stdDev < CONSISTENCY_LOW_THRESHOLD) {
        consistencyMod = CONSISTENCY_BONUS
      } else if (stdDev > CONSISTENCY_HIGH_THRESHOLD) {
        consistencyMod = CONSISTENCY_PENALTY
      }

      dataQuality = 'high'
    }
  }

  const effectiveRating = trophyBase + performanceMod + consistencyMod

  return {
    effectiveRating,
    components: {
      trophyBase,
      performanceMod,
      consistencyMod,
    },
    dataQuality,
    sampleSize: soloSessions.length,
  }
}

/**
 * Calculate win probability using ELO formula
 */
const calculateEloWinProbability = (ratingA, ratingB) => {
  const probability =
    1 / (1 + Math.pow(10, (ratingB - ratingA) / ELO_RATING_DIVISOR))
  return probability
}

/**
 * Clamp probability to [MIN, MAX] range
 */
const clampProbability = probability => {
  return Math.min(
    Math.max(probability, MIN_WIN_PROBABILITY),
    MAX_WIN_PROBABILITY,
  )
}

/**
 * Calculate win probability for a solo (1v1) challenge
 */
const calculateSoloWinProbability = async ({
  challengerId,
  opponentId,
  session = null,
}) => {
  // Calculate effective ratings for both players in parallel
  const [challengerRating, opponentRating] = await Promise.all([
    calculateUserEffectiveRating({ userId: challengerId, session }),
    calculateUserEffectiveRating({ userId: opponentId, session }),
  ])

  // Calculate raw probabilities using ELO formula
  const challengerProbability = calculateEloWinProbability(
    challengerRating.effectiveRating,
    opponentRating.effectiveRating,
  )

  const opponentProbability = 1 - challengerProbability

  // Clamp to prevent extremes (5%-95%)
  const clampedChallengerProb = clampProbability(challengerProbability)
  const clampedOpponentProb = clampProbability(opponentProbability)

  // Normalize after clamping to ensure sum = 1.0
  const total = clampedChallengerProb + clampedOpponentProb
  const normalizedChallengerProb = clampedChallengerProb / total
  const normalizedOpponentProb = clampedOpponentProb / total

  return {
    challenger: {
      probability: normalizedChallengerProb,
      effectiveRating: challengerRating.effectiveRating,
      components: challengerRating.components,
      dataQuality: challengerRating.dataQuality,
      sampleSize: challengerRating.sampleSize,
    },
    opponent: {
      probability: normalizedOpponentProb,
      effectiveRating: opponentRating.effectiveRating,
      components: opponentRating.components,
      dataQuality: opponentRating.dataQuality,
      sampleSize: opponentRating.sampleSize,
    },
    calculatedAt: new Date(),
  }
}

// ==========================================
// TEAM MODE (4v4) CALCULATIONS - INITIAL
// ==========================================

/**
 * Calculate effective rating for a team (Team mode - Initial calculation)
 *
 * CORRECTED: Uses score.RQM_score field path
 */
const calculateTeamEffectiveRating = async ({ teamId, session = null }) => {
  // Step 1: Get team with members
  const team = await QuickClashTeam.findById(teamId)
    .populate('members.user', '_id quickClashTrophies')
    .populate('members.sessionPlayer', '_id trophies')
    .session(session)

  if (!team) {
    throw new Error('Team not found')
  }

  // Step 2: Trophy Base
  const trophyBase = team.avgTrophies || DEFAULT_STARTING_TROPHIES

  // Step 3: Team Performance Modifier
  let performanceMod = 0
  let memberRQMs = []

  // Get last 10 RQM scores for each member
  // CORRECTED: Query uses score.RQM_score
  // FIXED: Handle both user and sessionPlayer members
  for (const member of team.members) {
    // Get member ID - either from user or sessionPlayer
    const memberId = member.user?._id || member.user || member.sessionPlayer?._id || member.sessionPlayer
    if (!memberId) {
      memberRQMs.push(BASELINE_RQM)
      continue
    }

    const memberSessions = await QuickClashSession.find({
      user: memberId,
      phase: 'completed',
      'score.RQM_score': { $exists: true, $ne: null }, // FIXED: Correct field path
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('score.RQM_score') // FIXED: Select correct field
      .session(session)

    if (memberSessions.length > 0) {
      // CORRECTED: Access score.RQM_score
      const rqmScores = memberSessions.map(s => s.score.RQM_score) // FIXED: Correct access path
      const avgRQM = rqmScores.reduce((a, b) => a + b, 0) / rqmScores.length
      memberRQMs.push(avgRQM)
    } else {
      memberRQMs.push(BASELINE_RQM)
    }
  }

  if (memberRQMs.length > 0) {
    const teamAvgRQM = memberRQMs.reduce((a, b) => a + b, 0) / memberRQMs.length
    performanceMod = (teamAvgRQM - BASELINE_RQM) * TEAM_PERFORMANCE_MULTIPLIER
    performanceMod = Math.min(Math.max(performanceMod, -80), 80)
  }

  // Step 4: Team Synergy Modifier
  let synergyMod = 0

  const teamBattleCount = await QuickClashTeamBattle.countDocuments({
    $or: [{ teamA: teamId }, { teamB: teamId }],
    status: 'completed',
  }).session(session)

  if (teamBattleCount >= ESTABLISHED_TEAM_BATTLES) {
    const teamBattles = await QuickClashTeamBattle.find({
      $or: [{ teamA: teamId }, { teamB: teamId }],
      status: 'completed',
    })
      .select('teamA teamB winner teamATotalScore teamBTotalScore')
      .session(session)

    let wins = 0
    let totalRQM = 0
    let battleCount = 0

    teamBattles.forEach(battle => {
      const isTeamA = battle.teamA.toString() === teamId.toString()
      const wonBattle =
        (isTeamA && battle.winner === 'teamA') ||
        (!isTeamA && battle.winner === 'teamB')

      if (wonBattle) wins++

      const teamRQM = isTeamA ? battle.teamATotalScore : battle.teamBTotalScore
      totalRQM += teamRQM
      battleCount++
    })

    const winRate = wins / battleCount
    const avgTeamRQM = totalRQM / battleCount

    synergyMod = (winRate - 0.5) * 100 + (avgTeamRQM - 260) * 2
    synergyMod = Math.min(
      Math.max(synergyMod, -TEAM_SYNERGY_CAP),
      TEAM_SYNERGY_CAP,
    )
  }

  const effectiveRating = trophyBase + performanceMod + synergyMod

  return {
    effectiveRating,
    components: {
      trophyBase,
      performanceMod,
      synergyMod,
    },
    isEstablishedTeam: teamBattleCount >= ESTABLISHED_TEAM_BATTLES,
    battleCount: teamBattleCount,
  }
}

/**
 * Calculate initial win probability for a team battle
 */
const calculateTeamWinProbability = async ({
  teamAId,
  teamBId,
  session = null,
}) => {
  const [teamARating, teamBRating] = await Promise.all([
    calculateTeamEffectiveRating({ teamId: teamAId, session }),
    calculateTeamEffectiveRating({ teamId: teamBId, session }),
  ])

  const teamAProbability = calculateEloWinProbability(
    teamARating.effectiveRating,
    teamBRating.effectiveRating,
  )

  const teamBProbability = 1 - teamAProbability

  const clampedTeamAProb = clampProbability(teamAProbability)
  const clampedTeamBProb = clampProbability(teamBProbability)

  const total = clampedTeamAProb + clampedTeamBProb
  const normalizedTeamAProb = clampedTeamAProb / total
  const normalizedTeamBProb = clampedTeamBProb / total

  return {
    teamA: {
      initial: normalizedTeamAProb,
      current: normalizedTeamAProb,
      initialEffectiveRating: teamARating.effectiveRating,
      initialComponents: teamARating.components,
      isEstablishedTeam: teamARating.isEstablishedTeam,
      battleCount: teamARating.battleCount,
      history: [],
    },
    teamB: {
      initial: normalizedTeamBProb,
      current: normalizedTeamBProb,
      initialEffectiveRating: teamBRating.effectiveRating,
      initialComponents: teamBRating.components,
      isEstablishedTeam: teamBRating.isEstablishedTeam,
      battleCount: teamBRating.battleCount,
      history: [],
    },
    calculatedAt: new Date(),
    lastUpdatedAt: new Date(),
    totalUpdates: 0,
  }
}

// ==========================================
// TEAM MODE (4v4) CALCULATIONS - LIVE UPDATES
// ==========================================

const determineChallengeState = challenge => {
  const aComplete = challenge.teamACompleted
  const bComplete = challenge.teamBCompleted

  if (aComplete && bComplete) return 'both_complete'
  if (aComplete && !bComplete) return 'team_a_only'
  if (!aComplete && bComplete) return 'team_b_only'
  return 'neither_complete'
}

const calculateExpectedRQM = player => {
  const trophies = player.previousTrophies || DEFAULT_STARTING_TROPHIES
  const expectedRQM = BASELINE_RQM + ((trophies - 1000) / 100) * 5
  return Math.min(Math.max(expectedRQM, 40), 85)
}

const analyzeBothComplete = challenge => {
  const aScore = challenge.teamAScore
  const bScore = challenge.teamBScore

  if (aScore > bScore) {
    return {
      state: 'both_complete',
      certainty: 1.0,
      teamAWinContribution: 1.0,
      teamBWinContribution: 0.0,
      scoreDifferential: aScore - bScore,
      actualScoreA: aScore,
      actualScoreB: bScore,
    }
  } else if (bScore > aScore) {
    return {
      state: 'both_complete',
      certainty: 1.0,
      teamAWinContribution: 0.0,
      teamBWinContribution: 1.0,
      scoreDifferential: bScore - aScore,
      actualScoreA: aScore,
      actualScoreB: bScore,
    }
  } else {
    return {
      state: 'both_complete',
      certainty: 1.0,
      teamAWinContribution: 0.5,
      teamBWinContribution: 0.5,
      scoreDifferential: 0,
      actualScoreA: aScore,
      actualScoreB: bScore,
    }
  }
}

const analyzeTeamAOnly = (challenge, battle) => {
  const aScore = challenge.teamAScore

  const teamBMember = battle.teamBMembers.find(
    m =>
      m.challenge && m.challenge.toString() === challenge.challenge.toString(),
  )

  const expectedB = teamBMember
    ? calculateExpectedRQM(teamBMember)
    : BASELINE_RQM
  const scoreDiff = aScore - expectedB
  const partialContribution = 0.5 + scoreDiff / 40
  const clampedContribution = Math.min(Math.max(partialContribution, 0.2), 0.8)

  return {
    state: 'team_a_only',
    certainty: 0.5,
    teamAWinContribution: clampedContribution,
    teamBWinContribution: 1 - clampedContribution,
    scoreDifferential: scoreDiff,
    actualScore: aScore,
    expectedOpponentScore: expectedB,
  }
}

const analyzeTeamBOnly = (challenge, battle) => {
  const bScore = challenge.teamBScore

  const teamAMember = battle.teamAMembers.find(
    m =>
      m.challenge && m.challenge.toString() === challenge.challenge.toString(),
  )

  const expectedA = teamAMember
    ? calculateExpectedRQM(teamAMember)
    : BASELINE_RQM
  const scoreDiff = bScore - expectedA
  const partialContribution = 0.5 + scoreDiff / 40
  const clampedContribution = Math.min(Math.max(partialContribution, 0.2), 0.8)

  return {
    state: 'team_b_only',
    certainty: 0.5,
    teamAWinContribution: 1 - clampedContribution,
    teamBWinContribution: clampedContribution,
    scoreDifferential: scoreDiff,
    actualScore: bScore,
    expectedOpponentScore: expectedA,
  }
}

const analyzeNeitherComplete = (challenge, battle) => {
  const initialProbA = battle.winProbability.teamA.initial

  return {
    state: 'neither_complete',
    certainty: 0.0,
    teamAWinContribution: initialProbA,
    teamBWinContribution: 1 - initialProbA,
    scoreDifferential: 0,
    expectedScoreA: BASELINE_RQM,
    expectedScoreB: BASELINE_RQM,
  }
}

const analyzeChallenge = (challenge, battle) => {
  const state = determineChallengeState(challenge)

  switch (state) {
    case 'both_complete':
      return analyzeBothComplete(challenge)
    case 'team_a_only':
      return analyzeTeamAOnly(challenge, battle)
    case 'team_b_only':
      return analyzeTeamBOnly(challenge, battle)
    case 'neither_complete':
      return analyzeNeitherComplete(challenge, battle)
    default:
      return analyzeNeitherComplete(challenge, battle)
  }
}

const projectFinalWins = challengeAnalysis => {
  let teamAProjectedWins = 0
  let teamBProjectedWins = 0
  let totalCertainty = 0
  let completedChallenges = 0

  let teamATotalRQM = 0
  let teamBTotalRQM = 0
  let teamAExpectedRemainingRQM = 0
  let teamBExpectedRemainingRQM = 0

  challengeAnalysis.forEach(analysis => {
    teamAProjectedWins += analysis.teamAWinContribution
    teamBProjectedWins += analysis.teamBWinContribution
    totalCertainty += analysis.certainty

    if (analysis.state === 'both_complete') {
      completedChallenges++
      teamATotalRQM += analysis.actualScoreA || 0
      teamBTotalRQM += analysis.actualScoreB || 0
    } else if (analysis.state === 'team_a_only') {
      teamATotalRQM += analysis.actualScore
      teamBExpectedRemainingRQM += analysis.expectedOpponentScore
    } else if (analysis.state === 'team_b_only') {
      teamBTotalRQM += analysis.actualScore
      teamAExpectedRemainingRQM += analysis.expectedOpponentScore
    } else {
      teamAExpectedRemainingRQM += analysis.expectedScoreA || BASELINE_RQM
      teamBExpectedRemainingRQM += analysis.expectedScoreB || BASELINE_RQM
    }
  })

  const teamAProjectedTotalRQM = teamATotalRQM + teamAExpectedRemainingRQM
  const teamBProjectedTotalRQM = teamBTotalRQM + teamBExpectedRemainingRQM

  return {
    teamAWins: teamAProjectedWins,
    teamBWins: teamBProjectedWins,
    teamATotalRQM,
    teamBTotalRQM,
    teamAProjectedTotalRQM,
    teamBProjectedTotalRQM,
    certaintyScore: totalCertainty / 4,
    completedChallenges,
  }
}

const calculateProbabilityFromProjection = projection => {
  const winDiff = projection.teamAWins - projection.teamBWins
  const rqmDiff =
    projection.teamAProjectedTotalRQM - projection.teamBProjectedTotalRQM

  let probability = 0.5 + winDiff * 0.25
  const rqmAdjustment = (rqmDiff / 10) * 0.02
  probability += rqmAdjustment

  if (Math.abs(winDiff) < 0.5) {
    probability = 0.5 + (rqmDiff / 20) * 0.05
  }

  return probability
}

const applyConfidencePenalty = (rawProbability, certaintyScore) => {
  const confidenceFactor = certaintyScore
  const adjustedProbability =
    0.5 + (rawProbability - 0.5) * (0.5 + confidenceFactor * 0.5)

  return adjustedProbability
}

const calculateLiveTeamWinProbability = battle => {
  const challengeAnalysis = battle.challenges.map(challenge =>
    analyzeChallenge(challenge, battle),
  )

  const projection = projectFinalWins(challengeAnalysis)
  const rawProbability = calculateProbabilityFromProjection(projection)
  const adjustedProbability = applyConfidencePenalty(
    rawProbability,
    projection.certaintyScore,
  )

  const clampedProbability = clampProbability(adjustedProbability)

  const previousProb =
    battle.winProbability?.teamA?.current ||
    battle.winProbability?.teamA?.initial ||
    0.5

  let trend = 'stable'
  if (clampedProbability > previousProb + 0.03) {
    trend = 'up'
  } else if (clampedProbability < previousProb - 0.03) {
    trend = 'down'
  }

  return {
    teamA: clampedProbability,
    teamB: 1 - clampedProbability,
    projection,
    certaintyScore: projection.certaintyScore,
    completedChallenges: projection.completedChallenges,
    trend,
  }
}

module.exports = {
  // Solo mode
  calculateUserEffectiveRating,
  calculateEloWinProbability,
  clampProbability,
  calculateSoloWinProbability,

  // Team mode (initial)
  calculateTeamEffectiveRating,
  calculateTeamWinProbability,

  // Team mode (live updates)
  calculateLiveTeamWinProbability,
  determineChallengeState,
  analyzeChallenge,
  calculateExpectedRQM,
}
