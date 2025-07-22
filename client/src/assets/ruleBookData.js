// src/data/ruleBookData.js
import i18n from 'i18next'

const createSection = (titleKey, itemsKey) => {
  const items = Object.entries(i18n.t(itemsKey, { returnObjects: true })).map(
    ([key, value]) => ({
      text: value.text,
      explanation: value.explanation,
      hasDetails: value.hasDetails,
    }),
  )

  return {
    [i18n.t(titleKey)]: items,
  }
}

export const getRuleBookPages = () => [
  {
    id: 'quiz-system',
    title: i18n.t('rulebook:quiz-system.title'),
    content: {
      ...createSection(
        'rulebook:quiz-system.sections.how-quizzes-work.title',
        'rulebook:quiz-system.sections.how-quizzes-work.items',
      ),
      ...createSection(
        'rulebook:quiz-system.sections.theme-options.title',
        'rulebook:quiz-system.sections.theme-options.items',
      ),
    },
  },
  {
    id: 'quick-clash',
    title: i18n.t('rulebook:quick-clash.title'),
    content: {
      ...createSection(
        'rulebook:quick-clash.sections.1v1-battle.title',
        'rulebook:quick-clash.sections.1v1-battle.items',
      ),
      ...createSection(
        'rulebook:quick-clash.sections.4v4-battle.title',
        'rulebook:quick-clash.sections.4v4-battle.items',
      ),
    },
  },
  {
    id: 'rqm-score',
    title: i18n.t('rulebook:rqm-score.title'),
    content: {
      ...createSection(
        'rulebook:rqm-score.sections.accuracy.title',
        'rulebook:rqm-score.sections.accuracy.items',
      ),
      ...createSection(
        'rulebook:rqm-score.sections.speed.title',
        'rulebook:rqm-score.sections.speed.items',
      ),
    },
  },
  {
    id: 'iq-system',
    title: i18n.t('rulebook:iq-system.title'),
    content: {
      ...createSection(
        'rulebook:iq-system.sections.score-range.title',
        'rulebook:iq-system.sections.score-range.items',
      ),
      ...createSection(
        'rulebook:iq-system.sections.society-ranks.title',
        'rulebook:iq-system.sections.society-ranks.items',
      ),
    },
  },
  {
    id: 'boosters',
    title: i18n.t('rulebook:boosters.title'),
    content: {
      ...createSection(
        'rulebook:boosters.sections.abilities.title',
        'rulebook:boosters.sections.abilities.items',
      ),
      ...createSection(
        'rulebook:boosters.sections.multipliers.title',
        'rulebook:boosters.sections.multipliers.items',
      ),
    },
  },

  {
    id: 'tournament',
    title: i18n.t('rulebook:tournament.title'),
    content: {
      ...createSection(
        'rulebook:tournament.sections.schedule.title',
        'rulebook:tournament.sections.schedule.items',
      ),
      ...createSection(
        'rulebook:tournament.sections.championship.title',
        'rulebook:tournament.sections.championship.items',
      ),
    },
  },
  {
    id: 'leaderboard',
    title: i18n.t('rulebook:leaderboard.title'),
    content: {
      ...createSection(
        'rulebook:leaderboard.sections.monthly-reset.title',
        'rulebook:leaderboard.sections.monthly-reset.items',
      ),
      ...createSection(
        'rulebook:leaderboard.sections.competition-cycles.title',
        'rulebook:leaderboard.sections.competition-cycles.items',
      ),
    },
  },
]

// Create a memoized version of the pages
let memoizedPages = null
let lastLanguage = null

export const ruleBookPages = () => {
  const currentLanguage = i18n.language

  // Only recalculate if language has changed or pages haven't been created
  if (!memoizedPages || currentLanguage !== lastLanguage) {
    memoizedPages = getRuleBookPages()
    lastLanguage = currentLanguage
  }

  return memoizedPages
}

// Helper function for direct language updates
export const refreshRuleBookPages = () => {
  memoizedPages = getRuleBookPages()
  lastLanguage = i18n.language
  return memoizedPages
}

// Helper function to get sections for search
export const getAllSections = () => {
  const pages = ruleBookPages()
  return pages.reduce((acc, page) => {
    return [...acc, { title: page.title, id: page.id }]
  }, [])
}
