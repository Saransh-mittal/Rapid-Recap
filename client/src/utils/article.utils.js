// src/utils/articleStorage.js

// Save visited article to localStorage
export const saveVisitedArticle = article => {
  try {
    if (!article) return

    if (localStorage.getItem('visitedArticle')) {
      clearVisitedArticle()
    }
    localStorage.setItem(
      'visitedArticle',
      JSON.stringify({
        id: article._id,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error('Error saving visited article:', error)
  }
}

// Get visited article from localStorage
export const getVisitedArticle = () => {
  try {
    const article = localStorage.getItem('visitedArticle')
    if (!article) return null

    const parsed = JSON.parse(article)
    // Only return if article was visited in last 24 hours
    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
      return parsed
    }
    // Clear old article
    localStorage.removeItem('visitedArticle')
    return null
  } catch (error) {
    console.error('Error getting visited article:', error)
    return null
  }
}

// Clear visited article from localStorage
export const clearVisitedArticle = () => {
  localStorage.removeItem('visitedArticle')
}
