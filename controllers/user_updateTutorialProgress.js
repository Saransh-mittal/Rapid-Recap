const asyncHandler = require('express-async-handler')
const User = require('../model/userSchema')
const {
  TUTORIAL_PROGRESS_KEYS,
  sanitizeTutorialProgress,
} = require('../utils/tutorialProgress.utils')

const updateTutorialProgress = asyncHandler(async (req, res) => {
  const { tutorial, completed } = req.body
  const userId = req.user._id

  if (!tutorial) {
    return res.status(400).json({ error: 'Tutorial name is required' })
  }

  // Allowed tutorials
  if (!TUTORIAL_PROGRESS_KEYS.includes(tutorial)) {
    return res.status(400).json({ error: 'Invalid tutorial name' })
  }

  try {
    const updateField = `tutorialProgress.${tutorial}`

    // Check if progress already exists/is true to avoid unnecessary writes?
    // Mongoose handles this efficiently usually, but let's just do update

    const user = await User.findByIdAndUpdate(
      userId,
      {
        [updateField]: completed !== false, // Default to true if not specified
        $unset: { 'tutorialProgress.lobby': 1 },
      },
      { new: true }
    ).select('tutorialProgress')

    res.status(200).json({
      message: 'Tutorial progress updated',
      tutorialProgress: sanitizeTutorialProgress(user.tutorialProgress)
    })
  } catch (error) {
    console.error('Update tutorial progress error:', error)
    res.status(500).json({ error: 'Failed to update tutorial progress' })
  }
})

module.exports = {
  // ... existing exports ...
  updateTutorialProgress
}
