const mongoose = require('mongoose')
const crypto = require('crypto')
const ApplicationUpdates = require('../model/applicationUpdatesSchema')
const RewardClaim = require('../model/rewardClaimSchema')
const User = require('../model/userSchema')
const { sendNotification } = require('./notificationService')

// Reward amounts configuration
const REWARD_AMOUNTS = {
  1: 500, // 1st place: ₹500
  2: 300, // 2nd place: ₹300
  3: 200, // 3rd place: ₹200
  other: 100, // 4th-10th: ₹100
}

/**
 * Send push notification to reward winner
 */
async function notifyWinner(winner, rewardAmount) {
  const rewardRankEmoji =
    winner.rank <= 3 ? ['🥇', '🥈', '🥉'][winner.rank - 1] : '🏅'

  await sendNotification({
    userId: winner._id,
    title: `${rewardRankEmoji} Congratulations! You Won a Reward!`,
    body: `You placed #${winner.rank} on the February leaderboard and won ₹${rewardAmount}! Open app to claim your reward.`,

    url: '/',
  })
}

/**
 * Distributes rewards to top 10 leaderboard winners
 * @returns {Promise<Array>} Array of winner objects with claim codes
 */
async function distributeRewards() {
  const session = await mongoose.startSession()

  try {
    await session.startTransaction()

    // Get top 10 users from leaderboard
    const winners = await User.find({
      rankedInCurrentSeason: true,
      rank: { $lte: 10 },
    })
      .sort({ IQ_score: -1, avgRQM: -1, xp: -1 })
      .limit(10)
      .select('_id inGameName rank')
      .session(session)

    const rewardRecords = []

    // Generate rewards for each winner
    for (const winner of winners) {
      // Generate unique claim code
      const claimCode = crypto.randomBytes(6).toString('hex').toUpperCase()

      // Determine reward amount based on rank
      const rewardAmount =
        winner.rank <= 3 ? REWARD_AMOUNTS[winner.rank] : REWARD_AMOUNTS.other

      const rewardRecord = new RewardClaim({
        userId: winner._id,
        rank: winner.rank,
        amount: rewardAmount,
        claimCode,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiry
        status: 'unclaimed',
      })

      await rewardRecord.save({ session })

      // Add notification for winner
      const notification = new ApplicationUpdates({
        userId: winner._id,
        title: 'Congratulations! You won a reward!',
        mainText: `<style>
.reward-notification {
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: #1a1527;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-family: system-ui, -apple-system, sans-serif;
  color: #ffffff;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.trophy-icon {
  width: 32px;
  height: 32px;
  fill: #ffd700;
}

.header-text {
  font-size: 20px;
  font-weight: 600;
  color: #ffd700;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rank-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
}

.rank-number {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
}

.amount-section {
  background: rgba(255, 215, 0, 0.1);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin: 8px 0;
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: #ffd700;
}

.amount-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 4px;
}

.claim-code {
  background: rgba(255, 255, 255, 0.05);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-family: monospace;
  font-size: 20px;
  letter-spacing: 2px;
  user-select: all;
  margin-top: 8px;
}

.instructions {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-top: 16px;
}
</style>

<div class="reward-notification">
  <div class="notification-header">
    <svg class="trophy-icon" viewBox="0 0 24 24">
      <path d="M20.2,4H17V2H7V4H3.8C2.8,4,2,4.8,2,5.8v2.5c0,1,0.8,1.8,1.8,1.8h1.9c0.7,2.7,2.5,4.9,4.8,6.1V20H7v2h10v-2h-3.5v-3.9
        c2.3-1.2,4.1-3.4,4.8-6.1h1.9c1,0,1.8-0.8,1.8-1.8V5.8C22,4.8,21.2,4,20.2,4z M4,8V6h3v2H4z M20,8h-3V6h3V8z"/>
    </svg>
    <div class="header-text">Congratulations!</div>
  </div>

  <div class="notification-content">
    <div class="rank-display">
      You placed <span class="rank-number">#${winner.rank}</span> on the February leaderboard!
    </div>

    <div class="amount-section">
      <div class="amount">₹${rewardAmount}</div>
      <div class="amount-label">REWARD AMOUNT</div>
    </div>

    <div>
      Your claim code:
      <div class="claim-code">${claimCode}</div>
    </div>

    <div class="instructions">
      Follow @rrapidrecap on Instagram and DM your claim code to verify and receive your reward. Code expires in 7 days.
    </div>
  </div>
</div>`,
        type: 'applicationUpdate',
      })

      try {
        await notifyWinner(winner, rewardAmount)
      } catch (error) {
        console.error('Error sending notification to winner:', error)
      }

      await notification.save({ session })

      rewardRecords.push(rewardRecord)
    }

    await session.commitTransaction()
    return rewardRecords
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

module.exports = { distributeRewards }
