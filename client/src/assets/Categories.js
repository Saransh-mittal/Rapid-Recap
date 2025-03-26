import i18n from 'i18next'
import {
  getCategoryFromBoost,
  getCategoryFromRadar,
} from '../utils/helper.utils'

// Store special categories fetched from the API
let specialCategories = []

export const getCategories = ({ categoryPrivileges, activeAbilities }) => {
  // Helper function to check if a category has any true privileges
  const isCategoryBoostAvailable = categoryKey => {
    // If the category exists in categoryPrivileges
    if (activeAbilities && activeAbilities.length > 0) {
      return activeAbilities.some(
        ability =>
          getCategoryFromBoost(ability.name).toLocaleLowerCase() ===
            categoryKey ||
          getCategoryFromRadar(ability.name).toLocaleLowerCase() ===
            categoryKey,
      )
    }
    if (categoryPrivileges && categoryPrivileges[categoryKey]) {
      const privileges = categoryPrivileges[categoryKey]
      // Return true if any of the privileges is true
      return Object.values(privileges).some(value => value === true)
    }
    return false
  }

  // Define regular categories
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

  // Add special categories
  const specialCategoryDefinitions = specialCategories.map(special => ({
    key: special.key,
    isBoostAvailable: isCategoryBoostAvailable(special.key),
    isSpecial: true,
    specialDetails: special,
  }))

  // Combine regular and special categories
  // Place special categories after 'general' but before other categories
  const allCategories = [
    ...categoryDefinitions.slice(0, 3), // all, top, general
    ...specialCategoryDefinitions, // special categories
    ...categoryDefinitions.slice(3), // remaining regular categories
  ]

  return allCategories.map(
    ({ key, isBoostAvailable, isSpecial, specialDetails }) => ({
      key,
      label: i18n.t(`categories:categories.${key}`),
      labelForBoarding: key,
      isBoostAvailable,
      isSpecial: isSpecial || false,
      specialDetails, // Will be undefined for regular categories
    }),
  )
}

// Initial categories with no privileges
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

// Special category utilities
export const isSpecialCategory = categoryKeyOrLabel => {
  const category = categories?.find(
    cat =>
      cat?.key?.toLowerCase() === categoryKeyOrLabel?.toLowerCase() ||
      cat?.label?.toLowerCase() === categoryKeyOrLabel?.toLowerCase(),
  )
  return category ? category.isSpecial : false
}

export const getSpecialCategoryDetails = categoryKeyOrLabel => {
  const category = categories?.find(
    cat =>
      cat?.key?.toLowerCase() === categoryKeyOrLabel?.toLowerCase() ||
      cat?.label?.toLowerCase() === categoryKeyOrLabel?.toLowerCase(),
  )
  return category && category.isSpecial ? category.specialDetails : null
}

// Set the special categories from the API
export const setSpecialCategories = categories => {
  specialCategories = categories || []
}

// Get all special categories
export const getSpecialCategories = () => {
  return specialCategories
}

// Get all categories including special ones
export const getAllCategories = () => {
  const regularKeys = [
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
  ]

  const specialKeys = specialCategories.map(sc => sc.key)

  return [...regularKeys, ...specialKeys]
}
