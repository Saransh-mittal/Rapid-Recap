const User = require('../model/userSchema')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const asyncHandler = require('express-async-handler')

// Generate a random string for guest inGameName and email helper function
const generateRandomString = length => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}

// Create a guest user helper function
const createGuestUser = async () => {
  try {
    const guestInGameName = `Guest_${generateRandomString(8)}`
    const guestEmail = `guest_${generateRandomString(8)}@example.com`
    const guestPassword = generateRandomString(12)

    const hashedPassword = await bcrypt.hash(guestPassword, 12)

    const guestUser = new User({
      name: 'Guest User',
      email: guestEmail,
      inGameName: guestInGameName,
      password: hashedPassword,
      cpassword: hashedPassword,
      role: 'guest',
      verified: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    })

    await guestUser.save()

    return guestUser
  } catch (error) {
    console.error(error)
    throw error
  }
}

// @desc  Export guest data to a new account
// @route POST /api/user/exportGuestData
// @access Private
exports.exportGuestData = asyncHandler(async (req, res) => {
  const { guestId, newEmail, newPassword } = req.body

  const guestUser = await User.findById(guestId)
  if (!guestUser || guestUser.role !== 'guest') {
    return res.status(404).json({ error: 'Guest user not found' })
  }

  const existingUser = await User.findOne({ email: newEmail })
  if (existingUser) {
    return res.status(400).json({ error: 'Email already in use' })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  guestUser.email = newEmail
  guestUser.password = hashedPassword
  guestUser.cpassword = hashedPassword
  guestUser.role = 'user'
  guestUser.expiresAt = undefined

  await guestUser.save()

  res.status(200).json({ message: 'Guest data exported successfully' })
})

// @desc  Enhanced guest login
// @route POST /api/user/enhancedGuestLogin
// @access Public
exports.enhancedGuestLogin = asyncHandler(async (req, res) => {
  const storedGuestId = req.body.storedGuestId // Sent from frontend

  if (storedGuestId) {
    // Try to find the stored guest user
    const existingGuestUser = await User.findOne({
      _id: storedGuestId,
      role: 'guest',
    })

    if (existingGuestUser) {
      // Check if the guest account has expired
      if (
        existingGuestUser.expiresAt &&
        existingGuestUser.expiresAt > new Date()
      ) {
        // Guest account is still valid, log them in
        const token = await existingGuestUser.generateAuthToken()

        res.cookie('jwtoken', token, {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
        })

        return res.status(200).json({
          message: 'Guest user logged in successfully',
          user: {
            ...existingGuestUser._doc,
          },
        })
      }
    }
  }

  // If we reach here, either there was no stored guest ID,
  // or the stored guest account was not found or had expired.
  // Create a new guest account.
  const newGuestUser = await createGuestUser()

  const token = await newGuestUser.generateAuthToken()

  res.cookie('jwtoken', token, {
    expires: new Date(Date.now() + 25892000000),
    httpOnly: true,
  })

  res.status(200).json({
    message: 'New guest user created and logged in successfully',
    user: {
      ...newGuestUser._doc,
      newAccount: true,
    },
  })
})

// Delete expired guest accounts helper function
exports.deleteExpiredGuestAccounts = asyncHandler(async () => {
  const expiredGuests = await User.find({
    role: 'guest',
    expiresAt: { $lt: new Date() },
  })

  for (const guest of expiredGuests) {
    await User.findByIdAndDelete(guest._id)
  }

  console.log(`Deleted ${expiredGuests.length} expired guest accounts`)
})
