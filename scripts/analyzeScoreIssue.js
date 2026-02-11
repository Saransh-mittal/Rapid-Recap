// Script to analyze score inconsistency for a specific battle
require('dotenv').config({ path: require('path').join(__dirname, '../config.env') })
const mongoose = require('mongoose')

// Note: User provided "6986e1f6d2e03afdf56981f5" - this is 24 chars which is valid ObjectId
const BATTLE_ID = '6986e1f6d2e03afdf56981f5'
const USER_ID = '69760057f69626c3681f2702'
const DB_URI = process.env.DATABASE

console.log('Looking for Battle:', BATTLE_ID)
console.log('Looking for User:', USER_ID)

async function analyze() {
  console.log('Connecting to database...')
  await mongoose.connect(DB_URI)
  console.log('Connected!\n')

  // Import models after connection
  const QuickClashTeamBattle = require('../model/quickClashSchemas/quickClashTeamBattleSchema')
  const QuickClashSession = require('../model/quickClashSchemas/quickClashSessionSchema')

  // First, let's check what battles exist with this user
  console.log('Checking for user in recent battles...')
  const userBattles = await QuickClashTeamBattle.find({
    $or: [
      { 'teamAMembers.user': USER_ID },
      { 'teamBMembers.user': USER_ID }
    ]
  }).sort({ createdAt: -1 }).limit(5).lean()

  console.log(`Found ${userBattles.length} recent battles for this user:`)
  userBattles.forEach(b => {
    console.log(`  Battle: ${b._id} | Status: ${b.status} | Created: ${b.createdAt}`)
  })

  // Also check for sessions
  const userSessions = await QuickClashSession.find({
    user: USER_ID
  }).sort({ createdAt: -1 }).limit(5).lean()

  console.log(`\nFound ${userSessions.length} recent sessions for this user:`)
  userSessions.forEach(s => {
    console.log(`  Session: ${s._id} | Phase: ${s.phase} | Challenge: ${s.challenge} | Created: ${s.createdAt}`)
  })

  // 1. Get the battle
  console.log('\n' + '='.repeat(60))
  console.log('BATTLE ANALYSIS')
  console.log('='.repeat(60))

  const battle = await QuickClashTeamBattle.findById(BATTLE_ID).lean()
  if (!battle) {
    console.log('Battle not found!')
    process.exit(1)
  }

  console.log(`Battle ID: ${battle._id}`)
  console.log(`Status: ${battle.status}`)
  console.log(`Winner: ${battle.winner}`)
  console.log(`Team A Score: ${battle.teamATotalScore}`)
  console.log(`Team B Score: ${battle.teamBTotalScore}`)

  // Find user in battle
  let userMember = null
  let userTeam = null

  for (const member of battle.teamAMembers) {
    if (member.user?.toString() === USER_ID) {
      userMember = member
      userTeam = 'A'
      break
    }
  }
  if (!userMember) {
    for (const member of battle.teamBMembers) {
      if (member.user?.toString() === USER_ID) {
        userMember = member
        userTeam = 'B'
        break
      }
    }
  }

  if (!userMember) {
    console.log('\nUser not found in battle!')
    process.exit(1)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('USER MEMBER DATA IN BATTLE')
  console.log('='.repeat(60))
  console.log(`Team: ${userTeam}`)
  console.log(`Category: ${userMember.category}`)
  console.log(`Score in Battle: ${userMember.score}`)
  console.log(`Challenge ID: ${userMember.challenge}`)
  console.log(`Completed: ${userMember.completed}`)
  console.log(`Loadout:`, JSON.stringify(userMember.loadout, null, 2))

  // 2. Get the session for this user and challenge
  console.log(`\n${'='.repeat(60)}`)
  console.log('QUICK CLASH SESSION DATA')
  console.log('='.repeat(60))

  const session = await QuickClashSession.findOne({
    challenge: userMember.challenge,
    user: USER_ID
  }).lean()

  if (!session) {
    console.log('Session not found!')
  } else {
    console.log(`Session ID: ${session._id}`)
    console.log(`Phase: ${session.phase}`)
    console.log(`\nSCORE OBJECT:`)
    console.log(JSON.stringify(session.score, null, 2))

    console.log(`\nFORGE PROGRESS:`)
    if (session.forgeProgress) {
      console.log(`  Score: ${session.forgeProgress.score}`)
      console.log(`  Base Score: ${session.forgeProgress.baseScore}`)
      console.log(`  Speed Bonus Total: ${session.forgeProgress.speedBonusTotal}`)
      console.log(`  Streak Bonus Total: ${session.forgeProgress.streakBonusTotal}`)
      console.log(`  Correct Answers: ${session.forgeProgress.correctAnswers}`)
      console.log(`  Max Streak: ${session.forgeProgress.maxStreak}`)
      console.log(`\n  Forge Responses:`)
      session.forgeProgress.responses?.forEach((r, i) => {
        console.log(`    Section ${r.sectionNumber}: ${r.isCorrect ? 'CORRECT' : 'WRONG'} - Score breakdown: base=${r.scoreBreakdown?.base}, speed=${r.scoreBreakdown?.speedBonus}, streak=${r.scoreBreakdown?.streakBonus}, total=${r.scoreBreakdown?.total}`)
      })
    } else {
      console.log('  No forge progress data')
    }

    console.log(`\nQUIZ ATTEMPT:`)
    if (session.quizAttempt) {
      console.log(`  Completed: ${session.quizAttempt.completed}`)
      console.log(`  Time Spent: ${session.quizAttempt.timeSpent}`)
      console.log(`  Responses:`)
      session.quizAttempt.responses?.forEach((r, i) => {
        console.log(`    Q${i+1}: ${r.isCorrect ? 'CORRECT' : 'WRONG'} - Time: ${r.timeSpent}s`)
      })
    }

    console.log(`\nACTIVE POWERUPS:`)
    session.activePowerups?.forEach(p => {
      console.log(`  ${p.powerupId}: phase=${p.phase}, used=${p.used}, effectApplied=${p.effectApplied}`)
    })

    // Analyze the math
    console.log(`\n${'='.repeat(60)}`)
    console.log('SCORE CALCULATION ANALYSIS')
    console.log('='.repeat(60))

    const quizScore = session.score?.RQM_score || 0
    const forgeScore = session.score?.forgeScore || 0
    const precisionBonus = session.score?.precisionBonus || 0
    const scoreSurgeBonus = session.score?.scoreSurgeBonus || 0
    const storedTotal = session.score?.total || 0
    const baseRQM = session.score?.baseRQM_score || 0

    console.log(`\nStored Values:`)
    console.log(`  RQM_score (quiz with bonuses): ${quizScore}`)
    console.log(`  baseRQM_score: ${baseRQM}`)
    console.log(`  forgeScore: ${forgeScore}`)
    console.log(`  precisionBonus: ${precisionBonus}`)
    console.log(`  scoreSurgeBonus: ${scoreSurgeBonus}`)
    console.log(`  total (stored): ${storedTotal}`)

    console.log(`\nCalculation Check:`)
    console.log(`  Quiz Base + Forge = ${quizScore} + ${forgeScore} = ${quizScore + forgeScore}`)
    console.log(`  With Precision: ${quizScore + forgeScore + precisionBonus}`)
    console.log(`  Expected formula: RQM_score (includes quiz + powerup bonuses) + forgeScore = total`)
    console.log(`  ${quizScore} + ${forgeScore} = ${quizScore + forgeScore}`)
    console.log(`  Stored total: ${storedTotal}`)

    // Check for duplicates
    if (storedTotal === quizScore + forgeScore) {
      console.log(`\n✓ Total matches: RQM_score + forgeScore = total`)
    } else {
      console.log(`\n✗ MISMATCH DETECTED!`)
      console.log(`  Expected: ${quizScore + forgeScore}`)
      console.log(`  Stored: ${storedTotal}`)
      console.log(`  Difference: ${storedTotal - (quizScore + forgeScore)}`)
    }

    // What does the UI show?
    console.log(`\n${'='.repeat(60)}`)
    console.log('WHAT THE UI DISPLAYS')
    console.log('='.repeat(60))
    console.log(`\nUI shows:`)
    console.log(`  Total RQM: 183 (from screenshot)`)
    console.log(`  Quiz Base: 123`)
    console.log(`  Forge: 20`)
    console.log(`  Surge +15 badge`)
    console.log(`\nSo: 123 + 20 = 143, but Total is 183.`)
    console.log(`Difference: 183 - 143 = 40`)

    console.log(`\nPossible Issues:`)
    console.log(`1. UI might be showing baseRQM_score as "Quiz Base" but total uses RQM_score (with bonuses)`)
    console.log(`2. Score Surge bonus might already be included in RQM_score but shown separately`)
    console.log(`3. The "+15" in UI might be misleading - it could be +something else`)

    // Check actual forge score calculation
    if (session.forgeProgress?.responses) {
      let calculatedForgeScore = 0
      session.forgeProgress.responses.forEach(r => {
        calculatedForgeScore += r.scoreBreakdown?.total || 0
      })
      console.log(`\nForge Score Verification:`)
      console.log(`  Calculated from responses: ${calculatedForgeScore}`)
      console.log(`  Stored forgeProgress.score: ${session.forgeProgress.score}`)
      console.log(`  Stored in score.forgeScore: ${forgeScore}`)
    }
  }

  await mongoose.disconnect()
  console.log('\nDisconnected from database.')
}

analyze().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
