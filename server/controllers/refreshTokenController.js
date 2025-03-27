const jwt = require('jsonwebtoken')
const User = require('../model/userSchema')
const asyncHandler = require('express-async-handler')

/**
 * Refreshes the access token using the refresh token
 * @route POST /api/auth/refresh
 * @access Public (requires refresh token)
 */
const refreshToken = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.refresh_token

    if (!token) {
      return res.status(401).json({ message: 'Refresh token required' })
    }

    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return res.status(401).json({
            message: 'Refresh token invalid or expired',
            error: err.message,
          })
        }

        const user = await User.findById(decoded._id)
        if (!user) {
          return res.status(404).json({ message: 'User not found' })
        }

        // Create a new access token
        const accessToken = jwt.sign(
          {
            _id: user._id,
            role: user.role,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '30m' },
        )

        // Set the new access token as a cookie
        res.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 60 * 1000, // 30 minutes
        })

        res.status(200).json({ message: 'Access token refreshed' })
      },
    )
  } catch (error) {
    console.error('Token refresh failed:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

module.exports = { refreshToken }
