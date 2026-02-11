const TUTORIAL_PROGRESS_KEYS = [
  'battle',
  'squad_intro',
  'solo_drill',
  'coins_shop',
  'quickClashOnboarding',
]

const getDefaultTutorialProgress = () => ({
  battle: false,
  squad_intro: false,
  solo_drill: false,
  coins_shop: false,
  quickClashOnboarding: false,
})

const sanitizeTutorialProgress = tutorialProgress => {
  const sanitized = getDefaultTutorialProgress()
  if (!tutorialProgress || typeof tutorialProgress !== 'object') {
    return sanitized
  }

  for (const key of TUTORIAL_PROGRESS_KEYS) {
    if (typeof tutorialProgress[key] === 'boolean') {
      sanitized[key] = tutorialProgress[key]
    }
  }

  return sanitized
}

module.exports = {
  TUTORIAL_PROGRESS_KEYS,
  getDefaultTutorialProgress,
  sanitizeTutorialProgress,
}
