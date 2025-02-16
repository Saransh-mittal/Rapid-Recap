// utils/referral.utils.js

const generateReferralCode = async User => {
  const LENGTH = 8
  const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like I,O,0,1

  while (true) {
    let code = ''
    for (let i = 0; i < LENGTH; i++) {
      code += ALLOWED_CHARS.charAt(
        Math.floor(Math.random() * ALLOWED_CHARS.length),
      )
    }

    // Check if code already exists
    const existingUser = await User.findOne({ referralCode: code })
    if (!existingUser) {
      return code
    }
  }
}

const validateReferralCode = code => {
  // Basic validation
  if (!code || typeof code !== 'string') return false

  // Check length
  if (code.length !== 8) return false

  // Check format (only allowed characters)
  const validFormat = /^[A-Z2-9]{8}$/
  return validFormat.test(code)
}

module.exports = {
  generateReferralCode,
  validateReferralCode,
}
