import i18n from 'i18next'

export const getCategories = () => {
  // Define categories with their boost status
  const categoryDefinitions = [
    { key: 'all', isBoostAvailable: false },
    { key: 'top', isBoostAvailable: true },
    { key: 'general', isBoostAvailable: false }, // Example: General has boost
    { key: 'world', isBoostAvailable: false },
    { key: 'politics', isBoostAvailable: false },
    { key: 'business', isBoostAvailable: false },
    { key: 'technology', isBoostAvailable: false },
    { key: 'sports', isBoostAvailable: false },
    { key: 'health', isBoostAvailable: false },
    { key: 'science', isBoostAvailable: false },
    { key: 'environment', isBoostAvailable: false },
    { key: 'crime', isBoostAvailable: false },
    { key: 'education', isBoostAvailable: false },
    { key: 'entertainment', isBoostAvailable: false },
    { key: 'food', isBoostAvailable: false },
    { key: 'lifestyle', isBoostAvailable: false },
    { key: 'tourism', isBoostAvailable: false },
  ]

  return categoryDefinitions.map(({ key, isBoostAvailable }) => ({
    key,
    label: i18n.t(`categories:categories.${key}`),
    labelForBoarding: key,
    isBoostAvailable,
  }))
}

export const categories = getCategories()

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
  return category ? category?.key : 'all'
}

// Add a helper function to check if a category has boost available
export const isCategoryBoosted = categoryKeyOrLabel => {
  const category = categories?.find(
    cat =>
      cat?.key?.toLowerCase() === categoryKeyOrLabel?.toLowerCase() ||
      cat?.label?.toLowerCase() === categoryKeyOrLabel?.toLowerCase(),
  )
  return category ? category.isBoostAvailable : false
}
