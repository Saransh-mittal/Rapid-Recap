import i18n from 'i18next'

export const getTournamentCategories = () => {
  return [
    'world',
    'politics',
    'business',
    'technology',
    'sports',
    'health',
    'science',
    'environment',
    'crime',
    'education',
    'entertainment',
    'food',
    'lifestyle',
    'tourism',
    'current affairs',
  ].map(category => ({
    key: category,
    label: i18n.t(`tournamentCategories:categories.${category}`),
  }))
}

export const categories = getTournamentCategories()

export const findCategoryIndex = categoryKeyOrLabel => {
  return categories?.findIndex(
    cat =>
      cat?.key?.toLowerCase() === categoryKeyOrLabel?.toLowerCase() ||
      cat?.label?.toLowerCase() === categoryKeyOrLabel?.toLowerCase(),
  )
}

export const getCategoryKey = categoryKeyOrLabel => {
  const category = categories?.find(
    cat =>
      cat?.key?.toLowerCase() === categoryKeyOrLabel?.toLowerCase() ||
      cat?.label?.toLowerCase() === categoryKeyOrLabel?.toLowerCase(),
  )
  return category ? category?.key : 'world'
}
