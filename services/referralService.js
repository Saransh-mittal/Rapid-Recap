// services/referralService.js

const User = require('../model/userSchema')
const {
  generateReferralCode,
  validateReferralCode,
} = require('../utils/referral.utils')

const assignReferralCode = async userId => {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    if (!user.referralCode) {
      const code = await generateReferralCode(User)
      user.referralCode = code
      await user.save()
    }

    return user.referralCode
  } catch (error) {
    console.error('Error assigning referral code:', error)
    throw error
  }
}

const applyReferralCode = async ({ referralCode, refereeId }) => {
  const session = await User.startSession()

  try {
    await session.withTransaction(async () => {
      // Validate code
      if (!validateReferralCode(referralCode)) {
        throw new Error('Invalid referral code format')
      }

      // Find referrer
      const referrer = await User.findOne({ referralCode }).session(session)
      if (!referrer) {
        throw new Error('Invalid referral code')
      }

      // Get referee
      const referee = await User.findById(refereeId).session(session)
      if (!referee) {
        throw new Error('Referee not found')
      }

      // Prevent self-referral
      if (referrer._id.toString() === referee._id.toString()) {
        throw new Error('Cannot use your own referral code')
      }

      // Check if referee already has a referrer
      if (referee.referredBy) {
        throw new Error('User already has a referrer')
      }

      // Update referee
      referee.referredBy = referrer._id

      // Update referrer
      referrer.referralCount += 1
      referrer.referrals.push({
        user: referee._id,
        status: 'pending',
      })

      // Save both users
      await Promise.all([referee.save({ session }), referrer.save({ session })])
    })
  } catch (error) {
    throw error
  } finally {
    session.endSession()
  }
}

module.exports = {
  assignReferralCode,
  applyReferralCode,
}
