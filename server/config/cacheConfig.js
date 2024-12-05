// src/config/cacheConfig.js
const CACHE_CONFIG = {
  durations: {
    BOT_ARTICLE: 24 * 60 * 60 * 1000, // 24 hours
    USER_ARTICLE: 24 * 60 * 60 * 1000, // 24 hours
    ARTICLE_LIST: 24 * 60 * 60 * 1000, // 24 hours
  },
  keys: {
    // Bot-specific article keys
    botArticle: (id, includeRelated) =>
      `article-${id}${includeRelated ? '-with-related' : ''}`,
    botRelated: id => `related-${id}`,

    // User-facing article keys
    userArticle: (lang, id) => `article_${lang || 'en'}_${id}`,
    articlesList: (category, lang, page, pageSize) =>
      `articles_${category}_${lang}_${page}_${pageSize}`,
  },
  defaults: {
    PAGE_SIZE: 18,
    MAX_PAGES: 5,
    CACHE_DAYS: 7,
    LANGUAGES: ['en', 'hi'],
    CATEGORIES: [
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
    ],
  },
}

module.exports = CACHE_CONFIG
