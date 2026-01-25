const categories = [
  'GK Prime',
  'Science Facts Simplified',
  'Everyday Tech',
  'Geography',
]

// Include extra tournament categories that shouldn't have badge text
const extraTournamentCategories = ['current affairs']

const getAllCategories = () => {
  return [...categories, ...extraTournamentCategories]
}

const getCategories = () => {
  return categories
}

const shouldHaveBadgeText = category => {
  return !extraTournamentCategories.includes(category.toLowerCase())
}

module.exports = {
  getCategories,
  getAllCategories,
  shouldHaveBadgeText,
}
