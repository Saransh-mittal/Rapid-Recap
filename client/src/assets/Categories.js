import i18n from 'i18next'

export const getCategories = () => {
  return [
    'all',
    'top',
    'general',
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
  ].map(category => ({
    key: category,
    label: i18n.t(`categories:categories.${category}`),
  }))
}

export const categories = getCategories()

export const findCategoryIndex = categoryKeyOrLabel => {
  return categories.findIndex(
    cat =>
      cat.key.toLowerCase() === categoryKeyOrLabel.toLowerCase() ||
      cat.label.toLowerCase() === categoryKeyOrLabel.toLowerCase(),
  )
}

export const getCategoryKey = categoryKeyOrLabel => {
  const category = categories.find(
    cat =>
      cat.key.toLowerCase() === categoryKeyOrLabel.toLowerCase() ||
      cat.label.toLowerCase() === categoryKeyOrLabel.toLowerCase(),
  )
  return category ? category.key : 'all'
}
