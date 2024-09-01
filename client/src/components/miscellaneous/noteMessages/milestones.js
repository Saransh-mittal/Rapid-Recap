import i18n from './i18n' // Adjust the path as needed

export const MILESTONES = {
  QUIN_BOOST: {
    nameKey: 'milestones.QUIN_BOOST.name',
    descriptionKey: 'milestones.QUIN_BOOST.description',
    xpReward: 10,
  },
  // Add other milestones here as needed
}

export const getMilestoneInfo = milestoneName => {
  const milestone = MILESTONES[milestoneName] || null
  if (milestone) {
    return {
      name: i18n.t(milestone.nameKey, { ns: 'milestones' }),
      description: i18n.t(milestone.descriptionKey, { ns: 'milestones' }),
      xpReward: milestone.xpReward,
    }
  }
  return null
}
