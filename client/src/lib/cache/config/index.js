// src/lib/cache/config/index.js
export const CACHE_CONFIG = {
  DATABASE_NAME: 'RapidRecapCache',
  STORES: {
    USER: 'userStore',
    ARTICLE: 'articleStore',
  },
  KEYS: {
    UNLOAD_CACHE: 'user_unload_cache',
  },
  EXPIRY: {
    ARTICLE: 24 * 60 * 60 * 1000, // 1 day in milliseconds
  },
  VERSION: 1,
}
