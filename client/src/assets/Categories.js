import i18n from 'i18next'

export const getCategories = ({ categoryPrivileges }) => {
  // Helper function to check if a category has any true privileges
  const isCategoryBoostAvailable = categoryKey => {
    // If the category exists in categoryPrivileges
    if (categoryPrivileges && categoryPrivileges[categoryKey]) {
      const privileges = categoryPrivileges[categoryKey]
      // Return true if any of the privileges is true
      return Object.values(privileges).some(value => value === true)
    }
    return false
  }

  // Define categories
  const categoryDefinitions = [
    { key: 'all', isBoostAvailable: false },
    { key: 'top', isBoostAvailable: false },
    { key: 'general', isBoostAvailable: false },
    { key: 'world', isBoostAvailable: isCategoryBoostAvailable('world') },
    { key: 'politics', isBoostAvailable: isCategoryBoostAvailable('politics') },
    { key: 'business', isBoostAvailable: isCategoryBoostAvailable('business') },
    {
      key: 'technology',
      isBoostAvailable: isCategoryBoostAvailable('technology'),
    },
    { key: 'sports', isBoostAvailable: isCategoryBoostAvailable('sports') },
    { key: 'health', isBoostAvailable: isCategoryBoostAvailable('health') },
    { key: 'science', isBoostAvailable: isCategoryBoostAvailable('science') },
    {
      key: 'environment',
      isBoostAvailable: isCategoryBoostAvailable('environment'),
    },
    { key: 'crime', isBoostAvailable: isCategoryBoostAvailable('crime') },
    {
      key: 'education',
      isBoostAvailable: isCategoryBoostAvailable('education'),
    },
    {
      key: 'entertainment',
      isBoostAvailable: isCategoryBoostAvailable('entertainment'),
    },
    { key: 'food', isBoostAvailable: isCategoryBoostAvailable('food') },
    {
      key: 'lifestyle',
      isBoostAvailable: isCategoryBoostAvailable('lifestyle'),
    },
    { key: 'tourism', isBoostAvailable: isCategoryBoostAvailable('tourism') },
  ]

  return categoryDefinitions.map(({ key, isBoostAvailable }) => ({
    key,
    label: i18n.t(`categories:categories.${key}`),
    labelForBoarding: key,
    isBoostAvailable,
  }))
}

export const categories = getCategories({ categoryPrivileges: null })

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
