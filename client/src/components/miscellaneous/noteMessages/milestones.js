export const MILESTONES = {
  QUIN_BOOST: {
    name: 'Quin Boost',
    description:
      'Successfully completed 6 quizzes and strategically applied a 1.5x score boost to maximize the score on the current quiz.',
    xpReward: 10,
  },
  // Add other milestones here as needed
}

export const getMilestoneInfo = milestoneName => {
  return MILESTONES[milestoneName] || null
}
